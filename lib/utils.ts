import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AustraliaPostLocation } from "./services/australia-post";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSuburbName(suburb: string): string {
  return suburb
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatStateDisplay(state: string): string {
  const stateMap: Record<string, string> = {
    NSW: "New South Wales",
    VIC: "Victoria",
    QLD: "Queensland",
    WA: "Western Australia",
    SA: "South Australia",
    TAS: "Tasmania",
    ACT: "Australian Capital Territory",
    NT: "Northern Territory",
  };
  return stateMap[state.toUpperCase()] || state;
}

export function isValidCoordinates(lat?: number, lng?: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function formatLocationDisplay(location: {
  location?: string;
  name?: string;
  state: string;
  postcode: string | number;
}): string {
  const locationName = location.location || location.name || "Unknown";
  return `${formatSuburbName(locationName)}, ${location.state} ${
    location.postcode
  }`;
}
