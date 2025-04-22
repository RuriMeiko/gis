"use client";

import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Locate,
  Layers,
  Navigation,
  MapIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type Map from "ol/Map";
import type { Coordinate } from "ol/coordinate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MapControlsProps {
  map: Map | null;
  onToggleDirections?: () => void;
  directionsActive?: boolean;
  onToggleMapType?: () => void;
  userLocation?: Coordinate;
}

export function MapControls({
  map,
  onToggleDirections,
  directionsActive,
  onToggleMapType,
  userLocation,
}: MapControlsProps) {
  const handleZoomIn = () => {
    if (!map) return;
    const view = map.getView();
    const zoom = view.getZoom() || 0;
    view.animate({
      zoom: zoom + 1,
      duration: 250,
    });
  };

  const handleZoomOut = () => {
    if (!map) return;
    const view = map.getView();
    const zoom = view.getZoom() || 0;
    view.animate({
      zoom: Math.max(1, zoom - 1),
      duration: 250,
    });
  };

  const handleLocate = () => {
    if (!map || !userLocation) return;

    const view = map.getView();
    view.animate({
      center: userLocation,
      zoom: 14,
      duration: 500,
    });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomIn}
              className="shadow-md"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Zoom in</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleZoomOut}
              className="shadow-md"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Zoom out</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleLocate}
              className="shadow-md"
              disabled={!userLocation}
            >
              <Locate className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {userLocation ? "My location" : "Location unavailable"}
          </TooltipContent>
        </Tooltip>

        {onToggleDirections && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={directionsActive ? "default" : "secondary"}
                size="icon"
                onClick={onToggleDirections}
                className="shadow-md"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Directions</TooltipContent>
          </Tooltip>
        )}

        {onToggleMapType && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={onToggleMapType}
                className="shadow-md"
              >
                <MapIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Change map type</TooltipContent>
          </Tooltip>
        )}

        {/* <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="shadow-md">
                  <Layers className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">Map layers</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Standard Map</DropdownMenuItem>
            <DropdownMenuItem>Satellite</DropdownMenuItem>
            <DropdownMenuItem>Terrain</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
    </TooltipProvider>
  );
}
