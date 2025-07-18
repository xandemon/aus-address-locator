import { config } from "@/config/env";
import { Location, ValidationResult } from "@/lib/schemas";
import { formatStateDisplay } from "@/lib/utils";

const API_BASE = config.australiaPost.baseUrl;
const API_ENDPOINTS = {
  postcode: "/postcode/search.json",
  suburb: "/suburb/search.json",
};

export interface AustraliaPostLocation {
  id: number;
  category?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  postcode: number;
  state: string;
}

interface AustraliaPostResponse {
  localities?: {
    locality: AustraliaPostLocation[];
  };
}

const getHeaders = () => ({
  Authorization: `Bearer ${config.australiaPost.apiKey}`,
});

async function makeRequest(
  endpoint: string,
  params: URLSearchParams
): Promise<any> {
  const url = `${API_BASE}${endpoint}?${params.toString()}`;

  const response = await fetch(url, {
    headers: getHeaders(),
    method: "GET",
  });
  console.log(getHeaders(), response);

  if (!response.ok) {
    throw new Error(
      `Australia Post API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function verifyAddress(
  postcode: string,
  suburb: string,
  state: string
): Promise<ValidationResult> {
  try {
    const postcodeParams = new URLSearchParams({
      q: suburb,
      state: state,
    });

    const postcodeResponse = await makeRequest(
      API_ENDPOINTS.postcode,
      postcodeParams
    );

    console.log(JSON.stringify(postcodeResponse, null, 2));

    let localities = postcodeResponse.localities?.locality;

    localities = Array.isArray(localities) ? localities : [localities];

    if (!localities?.length) {
      return {
        isValid: false,
        message: `The suburb ${suburb} does not exist in the state ${formatStateDisplay(
          state
        )} (${state}).`,
      };
    }

    const matchingLocations = localities?.filter(
      (location: AustraliaPostLocation) =>
        location.postcode ===
        (typeof location.postcode === "number" ? Number(postcode) : postcode)
    );

    if (!matchingLocations?.length) {
      return {
        isValid: false,
        message: `The postcode ${postcode} does not match the suburb ${suburb}.`,
      };
    }
    const validLocation = matchingLocations[0];
    console.log(matchingLocations);

    return {
      isValid: true,
      message: "The postcode, suburb, and state input are valid.",
      location: validLocation,
    };
  } catch (error: any) {
    console.error("Error verifying address:", error);
    return {
      isValid: false,
      message:
        "Unable to verify address. Please try with different details or try again later.",
    };
  }
}

export async function searchLocations(
  query: string,
  category?: string,
  limit: number = 20
): Promise<{ locations: Location[]; total: number }> {
  try {
    const endpoint = true ? API_ENDPOINTS.postcode : API_ENDPOINTS.suburb;

    const params = new URLSearchParams({
      q: query,
    });

    const response = await makeRequest(endpoint, params);
    console.log(response, JSON.stringify(response, null, 2));

    let locations = response.localities?.locality;

    if (!locations) {
      return { locations: [], total: 0 };
    }

    if (!Array.isArray(locations)) {
      locations = [locations];
    }

    if (category && category !== "") {
      locations = locations.filter(
        (location: Location) => location.category === category
      );
    }

    const limitedLocations = locations.slice(0, limit);

    return {
      locations: limitedLocations,
      total: locations.length,
    };
  } catch (error: any) {
    console.error("Error searching locations:", error);
    return { locations: [], total: 0 };
  }
}

export async function healthCheck(): Promise<string> {
  try {
    const params = new URLSearchParams({
      q: "2000",
    });

    await makeRequest(API_ENDPOINTS.postcode, params);
    return "Australia Post API is healthy";
  } catch (error: any) {
    console.error("Australia Post API health check failed:", error);
    throw new Error("Australia Post API is not responding");
  }
}
