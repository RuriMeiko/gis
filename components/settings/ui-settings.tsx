"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function UISettings() {
  const { theme, setTheme } = useTheme();

  const handleThemeToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-lg font-medium mb-4">UI Settings</h3>
      <div className="space-y-4">
        {/* ...các Switch khác... */}

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="theme-toggle">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark themes
            </p>
          </div>
          <Switch
            id="theme-toggle"
            checked={theme === "dark"}
            onCheckedChange={handleThemeToggle}
          />
        </div>
      </div>
    </div>
  );
}
