import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 phút
const MAX_REQUESTS = 20;
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export async function GET(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const requestData = requestCounts.get(ip) || { count: 0, timestamp: now };

    if (now - requestData.timestamp > RATE_LIMIT_WINDOW) {
      requestData.count = 0;
      requestData.timestamp = now;
    }

    if (requestData.count >= MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    requestData.count++;
    requestCounts.set(ip, requestData);

    // Lấy các query param
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const gender = searchParams.get("gender") || "";
    const minAge = searchParams.get("minAge");
    const maxAge = searchParams.get("maxAge");
    const interests = searchParams.getAll("interest") || [];

    console.log("Fetching users with filters:", { query, gender, minAge, maxAge, interests });

    let queryText = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.bio,
        u.avatar_url,
        u.gender,
        u.age,
        ul.latitude,
        ul.longitude,
        ul.location_name,
        ARRAY_AGG(DISTINCT ui.interest) AS interests
      FROM users u
      LEFT JOIN user_locations ul ON u.id = ul.user_id
      LEFT JOIN user_interests ui ON u.id = ui.user_id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (query) {
      conditions.push(`(u.name ILIKE $${paramIndex} OR COALESCE(ul.location_name, '') ILIKE $${paramIndex})`);
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (gender) {
      conditions.push(`u.gender = $${paramIndex}`);
      params.push(gender);
      paramIndex++;
    }

    if (minAge) {
      conditions.push(`u.age >= $${paramIndex}`);
      params.push(Number(minAge));
      paramIndex++;
    }

    if (maxAge) {
      conditions.push(`u.age <= $${paramIndex}`);
      params.push(Number(maxAge));
      paramIndex++;
    }

    if (interests.length > 0) {
      conditions.push(`EXISTS (
        SELECT 1 FROM user_interests ui2
        WHERE ui2.user_id = u.id AND ui2.interest = ANY($${paramIndex}::text[])
      )`);
      params.push(interests);
      paramIndex++;
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryText += `
      GROUP BY
        u.id, u.name, u.email, u.bio, u.avatar_url, u.gender, u.age,
        ul.latitude, ul.longitude, ul.location_name
      ORDER BY
        u.name
      LIMIT 100
    `;

    console.log("Executing SQL query:", queryText, "with params:", params);

    const result = (await Promise.race([
      sql.query(queryText, params),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 5000),
      ),
    ])) as any;

    console.log(`Query returned ${result.length || 0} users`);

    return NextResponse.json({ users: result || [], success: true });
  } catch (error) {
    console.error("Error fetching users:", error);

    return NextResponse.json(
      {
        users: [],
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 200 },
    );
  }
}
