"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";
import Overlay from "ol/Overlay";
import type { Coordinate } from "ol/coordinate";
import { MapControls } from "@/components/map/map-controls";
import { LocationSearch } from "@/components/map/location-search";
import { DirectionsPanel } from "@/components/map/directions-panel";
import {
  getDirections,
  createRouteFeature,
} from "@/lib/map/directions-service";
import "ol/ol.css";
import { defaults as defaultInteractions } from "ol/interaction";
import { defaults as defaultControls } from "ol/control";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, MessageSquare, Navigation, User } from "lucide-react";
import type { User } from "@/types/user";
import { fetchUsers } from "@/lib/services/user-service";

// Add to the imports at the top
import { Circle as CircleGeom } from "ol/geom";
import { getDistance } from "ol/sphere";
import { useToast } from "@/hooks/use-toast";

// Update the EnhancedMapProps interface
interface EnhancedMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  showSearch?: boolean;
  showControls?: boolean;
  showDirections?: boolean;
  height?: string;
  className?: string;
  users?: User[];
  onUsersLoaded?: (users: User[]) => void;
  gender?: string;
  ageRange?: [number, number];
  searchRadius?: number;
  searchCenter?: any;
  shouldRefetch?: boolean;
}

export function EnhancedMap({
  initialCenter = [0, 30],
  initialZoom = 2,
  showSearch = true,
  showControls = true,
  showDirections = true,
  height = "h-full",
  className = "",
  users: initialUsers,
  onUsersLoaded,
  gender,
  ageRange = [18, 30],
  searchRadius = 50,
  searchCenter = null,
  shouldRefetch = true,
}: EnhancedMapProps) {
  // Add a ref to track if we've already loaded data
  const hasLoadedDataRef = useRef(false);

  // Refs for DOM elements and OpenLayers objects
  const mapRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Refs for OpenLayers objects to avoid recreating them on each render
  const mapInstanceRef = useRef<Map | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const standardLayerRef = useRef<TileLayer<OSM> | null>(null);
  const satelliteLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const usersLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const routeLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const userLocationFeatureRef = useRef<Feature | null>(null);
  const searchRadiusLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  // State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [directionsResult, setDirectionsResult] = useState<any>(undefined);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinate | undefined>(
    undefined,
  );
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [isLoadingUsers, setIsLoadingUsers] = useState(!initialUsers);

  // Handle user location using browser's native geolocation API
  useEffect(() => {
    let watchId: number | null = null;

    if (navigator.geolocation) {
      // Request permission and get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          const mapCoords = fromLonLat([longitude, latitude]);
          setUserLocation(mapCoords);

          // Update user location marker if it exists
          if (userLocationFeatureRef.current && routeLayerRef.current) {
            userLocationFeatureRef.current.setGeometry(new Point(mapCoords));
          } else {
            createUserLocationMarker(mapCoords);
          }
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        },
        { enableHighAccuracy: true },
      );

      // Watch position for updates
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          const mapCoords = fromLonLat([longitude, latitude]);
          setUserLocation(mapCoords);

          // Update user location marker
          if (userLocationFeatureRef.current && routeLayerRef.current) {
            userLocationFeatureRef.current.setGeometry(new Point(mapCoords));
          }
        },
        (error) => {
          console.warn("Geolocation watch error:", error.message);
        },
        { enableHighAccuracy: true },
      );
    }

    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Create user location marker
  const createUserLocationMarker = useCallback((coordinates: Coordinate) => {
    if (!routeLayerRef.current) return;

    // Create a feature for the user's location
    const userLocationFeature = new Feature({
      geometry: new Point(coordinates),
      name: "My Location",
    });

    // Style for user location
    userLocationFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: "#4338ca" }),
          stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
      }),
    );

    userLocationFeatureRef.current = userLocationFeature;
    routeLayerRef.current.getSource()?.addFeature(userLocationFeature);
  }, []);

  // Update users layer when users change
  const updateUsersLayer = useCallback(() => {
    if (!usersLayerRef.current || !users.length) return;

    // Clear existing features
    usersLayerRef.current.getSource()?.clear();

    // Add user features
    users.forEach((user) => {
      if (!user.lat || !user.lon) return; // Skip users without location data

      const feature = new Feature({
        geometry: new Point(fromLonLat([user.lon, user.lat])),
        user: user,
      });

      usersLayerRef.current?.getSource()?.addFeature(feature);
    });
  }, [users]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create vector source for users
    const usersSource = new VectorSource();

    // Create vector layer for users
    const usersLayer = new VectorLayer({
      source: usersSource,
      style: (feature) => {
        const user = feature.get("user");
        return new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: "#3b82f6" }),
            stroke: new Stroke({ color: "#ffffff", width: 2 }),
          }),
          text: user?.name
            ? new Text({
                text: user.name,
                offsetY: 20,
                font: "12px sans-serif",
                fill: new Fill({ color: "#000000" }),
                stroke: new Stroke({ color: "#ffffff", width: 3 }),
              })
            : undefined,
        });
      },
      zIndex: 10,
    });
    usersLayerRef.current = usersLayer;

    // Create vector source and layer for routes
    const routesSource = new VectorSource();
    const routesLayer = new VectorLayer({
      source: routesSource,
      zIndex: 5,
    });
    routeLayerRef.current = routesLayer;

    // Create search radius layer
    const searchRadiusSource = new VectorSource();
    const searchRadiusLayer = new VectorLayer({
      source: searchRadiusSource,
      style: new Style({
        fill: new Fill({
          color: "rgba(59, 130, 246, 0.1)",
        }),
        stroke: new Stroke({
          color: "#3b82f6",
          width: 2,
          lineDash: [5, 5],
        }),
      }),
      zIndex: 4,
    });
    searchRadiusLayerRef.current = searchRadiusLayer;

    // Create base layers
    const standardLayer = new TileLayer({
      source: new OSM(),
      visible: mapType === "standard",
    });
    standardLayerRef.current = standardLayer;

    // Satellite layer (using a free alternative since we don't have API keys)
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 19,
      }),
      visible: mapType === "satellite",
    });
    satelliteLayerRef.current = satelliteLayer;

    // Create map
    const map = new Map({
      target: mapRef.current,
      layers: [
        standardLayer,
        satelliteLayer,
        searchRadiusLayer,
        routesLayer,
        usersLayer,
      ],
      view: new View({
        center: fromLonLat(initialCenter),
        zoom: initialZoom,
        maxZoom: 19,
      }),
      controls: defaultControls({ zoom: false, rotate: false }),
      interactions: defaultInteractions({
        altShiftDragRotate: false,
        pinchRotate: false,
      }),
    });

    // Create popup overlay
    const popupOverlay = new Overlay({
      element: popupRef.current!,
      positioning: "bottom-center",
      stopEvent: true, // Important: Stop event propagation to prevent map click
      offset: [0, -10],
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    map.addOverlay(popupOverlay);
    overlayRef.current = popupOverlay;

    // Handle click events on the map
    map.on("click", (evt) => {
      // Check if the click is on a form element
      const target = evt.originalEvent.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "BUTTON"
      ) {
        return; // Don't process map clicks on form elements
      }

      const feature = map.forEachFeatureAtPixel(
        evt.pixel,
        (feature) => feature,
      );

      if (feature && feature.get("user")) {
        const user = feature.get("user");
        setSelectedUser(user);

        if (popupRef.current && overlayRef.current) {
          overlayRef.current.setPosition(
            feature.getGeometry().getCoordinates(),
          );
        }
      } else {
        // Only hide popup if click is not on the popup itself
        if (!popupRef.current?.contains(target)) {
          popupOverlay.setPosition(undefined);
          setSelectedUser(null);
        }

        // Don't trigger a refetch when clicking on the map
        // This prevents data loss when interacting with the map
      }
    });

    mapInstanceRef.current = map;

    // Add user location marker if available
    if (userLocation) {
      createUserLocationMarker(userLocation);
    }

    return () => {
      map.setTarget(undefined);
    };
  }, [createUserLocationMarker, mapType]);

  // Update users layer when users change
  useEffect(() => {
    updateUsersLayer();
  }, [users, updateUsersLayer]);

  // Update map layers when mapType changes
  useEffect(() => {
    if (!standardLayerRef.current || !satelliteLayerRef.current) return;

    standardLayerRef.current.setVisible(mapType === "standard");
    satelliteLayerRef.current.setVisible(mapType === "satellite");
  }, [mapType]);

  // Update search radius circle when searchCenter or searchRadius changes
  useEffect(() => {
    if (!searchRadiusLayerRef.current || !mapInstanceRef.current) return;

    // Clear existing features
    searchRadiusLayerRef.current.getSource()?.clear();

    // If we have a search center and radius, draw the circle
    if (searchCenter && searchCenter.coordinates) {
      // Convert radius from km to meters
      const radiusInMeters = searchRadius * 1000;

      // Create a circle feature
      const circleFeature = new Feature({
        geometry: new CircleGeom(searchCenter.coordinates, radiusInMeters),
      });

      // Add the circle to the layer
      searchRadiusLayerRef.current.getSource()?.addFeature(circleFeature);

      // Center the map on the search area
      mapInstanceRef.current.getView().animate({
        center: searchCenter.coordinates,
        zoom: getZoomForRadius(radiusInMeters),
        duration: 1000,
      });
    }
  }, [searchCenter, searchRadius]);

  // Helper function to calculate appropriate zoom level for a given radius
  const getZoomForRadius = (radiusInMeters: number) => {
    // This is a rough approximation - you may need to adjust based on your needs
    const zoomLevels = [
      { radius: 100000, zoom: 8 },
      { radius: 50000, zoom: 9 },
      { radius: 20000, zoom: 10 },
      { radius: 10000, zoom: 11 },
      { radius: 5000, zoom: 12 },
      { radius: 2000, zoom: 13 },
      { radius: 1000, zoom: 14 },
      { radius: 500, zoom: 15 },
    ];

    for (const level of zoomLevels) {
      if (radiusInMeters >= level.radius) {
        return level.zoom;
      }
    }

    return 16; // Default for very small radius
  };

  // Fetch users from the database if not provided and shouldRefetch is true
  useEffect(() => {
    if (!initialUsers && shouldRefetch && !hasLoadedDataRef.current) {
      const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
          console.log("Fetching users with filters:", {
            gender,
            ageRange,
            searchRadius,
          });

          // Mark that we've loaded data
          hasLoadedDataRef.current = true;

          // Add retry logic for fetching users with exponential backoff
          let attempts = 0;
          let fetchedUsers: User[] = [];
          let rateLimited = false;

          while (attempts < 3) {
            try {
              // Pass all filters to the fetchUsers function
              fetchedUsers = await fetchUsers({
                gender,
                minAge: ageRange[0],
                maxAge: ageRange[1],
              });
              console.log("Fetched users:", fetchedUsers);

              if (fetchedUsers.length > 0) break;

              // Wait before retrying with exponential backoff
              const waitTime = 1000 * Math.pow(2, attempts);
              await new Promise((resolve) => setTimeout(resolve, waitTime));
              attempts++;
            } catch (fetchError: any) {
              console.error(`Attempt ${attempts + 1} failed:`, fetchError);

              // Check if it's a rate limit error
              if (
                fetchError.message &&
                fetchError.message.includes("Rate limit exceeded")
              ) {
                rateLimited = true;
                console.warn("Rate limit exceeded. Waiting before retry...");
                // Wait longer for rate limit errors
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }

              attempts++;
              if (attempts >= 3) throw fetchError;
            }
          }

          console.log(
            `Fetched ${fetchedUsers.length} users after ${attempts + 1} attempts`,
          );

          // Filter out users without valid coordinates
          let validUsers = fetchedUsers.filter(
            (user) =>
              typeof user.lat === "number" &&
              !isNaN(user.lat) &&
              typeof user.lon === "number" &&
              !isNaN(user.lon),
          );

          if (validUsers.length < fetchedUsers.length) {
            console.warn(
              `Filtered out ${fetchedUsers.length - validUsers.length} users with invalid coordinates`,
            );
          }

          // Filter users by distance if we have a search center
          if (searchCenter && searchCenter.coordinates) {
            validUsers = validUsers.filter((user) => {
              const userCoords = fromLonLat([user.lon, user.lat]);
              const distanceInMeters = getDistance(
                searchCenter.coordinates,
                userCoords,
              );
              const distanceInKm = distanceInMeters / 1000;
              return distanceInKm <= searchRadius;
            });
            console.log(
              `Filtered to ${validUsers.length} users within ${searchRadius}km of search center`,
            );
          }

          // Only use mock data if no real users were found
          if (validUsers.length === 0) {
            console.log("No users found, providing mock data");

            // Generate mock users around the search center or default location
            const center = searchCenter?.coordinates
              ? [searchCenter.coordinates[0], searchCenter.coordinates[1]]
              : fromLonLat(initialCenter);

            const mockUsers = generateMockUsers(
              center,
              searchRadius || 50,
              5,
              gender,
              ageRange,
            );
            validUsers = [];
          }

          setUsers(validUsers);
          if (onUsersLoaded) {
            onUsersLoaded(validUsers);
          }
        } catch (error: any) {
          console.error("Error loading users:", error);

          // Keep existing users if we have them, only use mock data if no users exist
          if (users.length === 0) {
            console.log(
              "Error occurred and no existing users, providing mock data",
            );
            const center = searchCenter?.coordinates
              ? [searchCenter.coordinates[0], searchCenter.coordinates[1]]
              : fromLonLat(initialCenter);

            const mockUsers = generateMockUsers(
              center,
              searchRadius || 50,
              5,
              gender,
              ageRange,
            );
            setUsers([]);

            if (onUsersLoaded) {
              onUsersLoaded(mockUsers);
            }
          } else {
            console.log("Error occurred but keeping existing users");
          }
        } finally {
          setIsLoadingUsers(false);
        }
      };

      loadUsers();
    }
  }, [
    initialUsers,
    onUsersLoaded,
    gender,
    ageRange,
    searchCenter,
    searchRadius,
    shouldRefetch,
    initialCenter,
    users.length,
  ]);

  // Handle directions request
  const handleDirectionsRequest = async (
    origin: Coordinate,
    destination: Coordinate,
    travelMode: "driving" | "walking" | "cycling",
  ) => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    setIsLoadingDirections(true);

    try {
      // Get directions
      const result = await getDirections({
        origin,
        destination,
        travelMode,
      });

      setDirectionsResult(result);

      // Clear previous routes except user location marker
      const userLocationFeature = userLocationFeatureRef.current;
      routeLayerRef.current.getSource()?.clear();

      // Add back user location marker if it exists
      if (userLocationFeature) {
        routeLayerRef.current.getSource()?.addFeature(userLocationFeature);
      }

      // Add new route to the map if successful
      if (result.status === "OK" && result.routes.length > 0) {
        const route = result.routes[0];

        // Create and add route feature
        const routeFeature = createRouteFeature(route);
        routeLayerRef.current.getSource()?.addFeature(routeFeature);

        // Add markers for start and end points
        const startPoint = new Feature({
          geometry: new Point(route.geometry.getCoordinates()[0]),
          name: "Start",
        });

        const endPoint = new Feature({
          geometry: new Point(
            route.geometry.getCoordinates()[
              route.geometry.getCoordinates().length - 1
            ],
          ),
          name: "End",
        });

        // Style for start and end markers
        startPoint.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: "#10b981" }),
              stroke: new Stroke({ color: "#ffffff", width: 2 }),
            }),
          }),
        );

        endPoint.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 8,
              fill: new Fill({ color: "#ef4444" }),
              stroke: new Stroke({ color: "#ffffff", width: 2 }),
            }),
          }),
        );

        // Add the markers to the layer
        routeLayerRef.current.getSource()?.addFeature(startPoint);
        routeLayerRef.current.getSource()?.addFeature(endPoint);

        // Fit the map to the route
        mapInstanceRef.current.getView().fit(route.geometry, {
          padding: [50, 50, 50, 50],
          duration: 500,
        });
      }
    } catch (error) {
      console.error("Error getting directions:", error);
      setDirectionsResult({
        status: "ERROR",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoadingDirections(false);
    }
  };

  // Toggle map type
  const toggleMapType = () => {
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"));
  };

  // Handle location search selection
  const handleLocationSelect = (result: any) => {
    if (!mapInstanceRef.current) return;

    // Center the map on the selected location
    mapInstanceRef.current.getView().animate({
      center: fromLonLat(result.coordinates),
      zoom: 14,
      duration: 500,
    });

    // If it's a user, show their popup
    if (result.type === "user") {
      const userId = Number.parseInt(result.id.replace("user_", ""));
      const user = users.find((u) => u.id === userId);

      if (user) {
        setSelectedUser(user);

        // Find the feature for this user
        const userFeature = usersLayerRef.current
          ?.getSource()
          ?.getFeatures()
          .find((f) => {
            const featureUser = f.get("user");
            return featureUser && featureUser.id === userId;
          });

        if (userFeature && overlayRef.current) {
          overlayRef.current.setPosition(
            userFeature.getGeometry().getCoordinates(),
          );
        }
      }
    }
  };

  // Get directions to selected user
  const getDirectionsToUser = () => {
    if (!userLocation || !selectedUser) return;

    handleDirectionsRequest(
      userLocation,
      fromLonLat([selectedUser.lon, selectedUser.lat]),
      "driving",
    );
    setDirectionsOpen(true);

    // Hide the popup after getting directions
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
    }
  };

  // Close the popup
  const closePopup = () => {
    if (overlayRef.current) {
      overlayRef.current.setPosition(undefined);
      setSelectedUser(null);
    }
  };

  // View user profile
  const viewProfile = (userId: number) => {
    window.location.href = `/dashboard/users/${userId}`;
    closePopup();
  };

  // Send message to user
  const sendMessage = (userId: number) => {
    window.location.href = `/dashboard/messages/${userId}`;
    closePopup();
  };
  const { toast } = useToast();

  return (
    <div className={`relative ${height} w-full ${className}`}>
      {isLoadingUsers && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
      )}

      {!isLoadingUsers && users.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-md">
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm text-muted-foreground">
              {searchCenter
                ? "No users found in this area. Try adjusting your filters or search in a different location."
                : "Try adjusting your filters or wait a moment before trying again."}
            </p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />

      {/* Improved popup for user information */}
      <div
        ref={popupRef}
        className="absolute z-20 bg-white rounded-lg shadow-lg w-[400px] invisible"
        style={{ visibility: selectedUser ? "visible" : "hidden" }}
      >
        {selectedUser && (
          <Card className="border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedUser.avatar || "/placeholder.svg"}
                    alt={selectedUser.name}
                  />
                  <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.gender &&
                      `${selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1)}`}
                    {selectedUser.age && selectedUser.gender && ", "}
                    {selectedUser.age && `${selectedUser.age} years old`}
                  </p>
                  {selectedUser.interests && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedUser.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedUser.bio && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold mb-1">About</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => viewProfile(selectedUser.id)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  View Full Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    toast({
                      title: "Success",
                      description: "Friend request sent",
                      variant: "default",
                    });
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Add friend
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => sendMessage(selectedUser.id)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>

                {showDirections && userLocation && (
                  <Button
                    size="sm"
                    className="w-full justify-start"
                    onClick={getDirectionsToUser}
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 z-10 w-64 md:w-80">
          <LocationSearch
            placeholder="Search locations or users..."
            onLocationSelect={handleLocationSelect}
            includeUsers={true}
          />
        </div>
      )}

      {/* Map controls */}
      {showControls && (
        <div className="absolute bottom-4 right-4 z-10">
          <MapControls
            map={mapInstanceRef.current}
            onToggleDirections={
              showDirections
                ? () => setDirectionsOpen(!directionsOpen)
                : undefined
            }
            directionsActive={directionsOpen}
            onToggleMapType={toggleMapType}
            userLocation={userLocation}
          />
        </div>
      )}

      {/* Directions panel */}
      {showDirections && (
        <DirectionsPanel
          isOpen={directionsOpen}
          onClose={() => setDirectionsOpen(false)}
          onDirectionsRequest={handleDirectionsRequest}
          directionsResult={directionsResult}
          isLoading={isLoadingDirections}
          userLocation={userLocation}
          users={users}
        />
      )}
    </div>
  );
}

// Add this helper function to generate mock users around a center point
const generateMockUsers = (
  center: Coordinate,
  radiusKm: number,
  count: number,
  interests?: string[],
): User[] => {
  const mockUsers: User[] = [];
  const availableInterests = [
    "Travel",
    "Photography",
    "Music",
    "Art",
    "Technology",
    "Sports",
    "Gaming",
    "Cooking",
    "Reading",
    "Hiking",
  ];

  // Use provided interests or default to available interests
  const userInterests =
    interests && interests.length > 0 ? interests : availableInterests;

  for (let i = 0; i < count; i++) {
    // Generate random angle and distance within the radius
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusKm * 1000; // Convert to meters

    // Calculate offset in meters
    const dx = distance * Math.cos(angle);
    const dy = distance * Math.sin(angle);

    // Convert from map coordinates back to lon/lat
    // Note: This is a simplified approach and might not be perfectly accurate for large distances
    const point = [center[0] + dx * 0.00001, center[1] + dy * 0.00001];

    // Generate random user data
    const userInterestCount = 1 + Math.floor(Math.random() * 3); // 1-3 interests
    const userInterestSelection = [...userInterests]
      .sort(() => 0.5 - Math.random())
      .slice(0, userInterestCount);

    const mockUser: User = {
      id: 1000 + i,
      name: `Demo User ${i + 1}`,
      email: `demo${i + 1}@example.com`,
      avatar: `/mock-avatars/avatar-${(i % 5) + 1}.jpg`,
      bio: "This is a demo user for exploration purposes.",
      interests: userInterestSelection,
      lat: point[1],
      lon: point[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(mockUser);
  }

  return mockUsers;
};
