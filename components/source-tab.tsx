"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  sourceSearchSchema,
  type SourceSearch,
  type Location,
} from "@/lib/schemas";
import { formatLocationDisplay } from "@/lib/utils";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";

export function SourceTab() {
  const { sourceData, updateSourceData, isSearching, setIsSearching } =
    useApp();

  const [searchQuery, setSearchQuery] = useState(sourceData.query);
  const [selectedCategory, setSelectedCategory] = useState(
    sourceData.category || ""
  );
  const [searchError, setSearchError] = useState<string>("");

  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "Delivery Area", label: "Delivery Area" },
    { value: "Post Office Boxes", label: "Post Office Boxes" },
  ];

  useEffect(() => {
    setSearchQuery(sourceData.query);
    setSelectedCategory(sourceData.category || "");
  }, [sourceData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const searchData: SourceSearch = {
      query: searchQuery.trim(),
      // category: selectedCategory || undefined,
    };

    try {
      sourceSearchSchema.parse(searchData);
      setSearchError("");
    } catch (error: any) {
      if (error.errors?.[0]?.message) {
        setSearchError(error.errors[0].message);
      }
      return;
    }

    if (!searchData.query) {
      setSearchError("Please enter a search term");
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch("/api/search-locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchData),
      });

      const results = await response.json();

      updateSourceData({
        query: searchData.query,
        category: selectedCategory,
        results: results.locations || [],
        selectedLocation: undefined,
      });
    } catch (error) {
      console.error("Search failed:", error);
      updateSourceData({
        results: [],
        selectedLocation: undefined,
      });
      setSearchError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    updateSourceData({ selectedLocation: location });

    // TODO: Log to Elasticsearch
    console.log("Selected location for logging:", {
      query: sourceData.query,
      selectedLocation: location,
      timestamp: new Date().toISOString(),
    });
  };
  const filteredResults = sourceData.results?.filter((location) => {
    if (!selectedCategory) return true;
    return location.category === selectedCategory;
  });

  useEffect(() => {
    updateSourceData({ category: selectedCategory });
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Location Source
        </h2>
        <p className="text-gray-600">
          Search for locations within suburbs or postcodes. Select a location to
          view it on the map.
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              // label="Search Query"
              placeholder="Try typing suburb name (eg: Melbourne)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              error={!!searchError}
              errorMessage={searchError}
            />
          </div>
          <Button
            type="submit"
            isLoading={isSearching}
            className="w-fit md:w-auto"
          >
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </form>

      {sourceData.results && sourceData.results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">
              Search Results ({filteredResults?.length || 0})
            </h3>
            <div className="w-fit lg:w-48">
              <Select
                // label="Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categoryOptions}
              />
            </div>
          </div>
          <div className="grid gap-3 max-h-[40vh] pr-2 overflow-y-auto">
            {filteredResults?.map((location: Location) => (
              <div
                key={location.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  sourceData.selectedLocation?.id === location.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {formatLocationDisplay(location)}
                    </h4>
                    {location.category && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {location.category}
                      </span>
                    )}
                  </div>
                  <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sourceData.results &&
        sourceData.results.length === 0 &&
        sourceData.query && (
          <Alert variant="info">
            No locations found for &quot;{sourceData.query}&quot;. Try adjusting
            your search terms or category filter.
          </Alert>
        )}

      {sourceData.selectedLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2">Selected Location</h3>
          <p className="text-green-800">
            {formatLocationDisplay(sourceData.selectedLocation)}
          </p>
          {sourceData.selectedLocation.latitude &&
            sourceData.selectedLocation.longitude && (
              <p className="text-sm text-green-600 mt-1">
                Coordinates: {sourceData.selectedLocation.latitude.toFixed(6)},{" "}
                {sourceData.selectedLocation.longitude.toFixed(6)}
              </p>
            )}
          <p className="text-sm text-green-600 mt-2">
            Google Maps integration coming soon...
          </p>
        </div>
      )}
    </div>
  );
}
