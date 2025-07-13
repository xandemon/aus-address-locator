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
import {
  Search,
  MapPin,
  Globe,
  CheckCircle,
  Filter,
  Map,
  Building,
  Navigation,
  Layers,
  Clock,
} from "lucide-react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_LOCATIONS } from "@/lib/graphql/schema";
import { logInteraction } from "@/lib/session";

export function SourceTab() {
  const { sourceData, updateSourceData, isSearching, setIsSearching } =
    useApp();

  const [searchQuery, setSearchQuery] = useState(sourceData.query);
  const [selectedCategory, setSelectedCategory] = useState(
    sourceData.category || ""
  );
  const [searchError, setSearchError] = useState<string>("");

  const [searchLocationsQuery, { loading, data, error }] =
    useLazyQuery(SEARCH_LOCATIONS);

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
      const result = await searchLocationsQuery({
        variables: {
          input: {
            query: searchData.query,
            category: searchData.category || undefined,
            limit: 20,
          },
        },
      });

      if (result.data?.searchLocations) {
        updateSourceData({
          query: searchData.query,
          category: selectedCategory,
          results: result.data.searchLocations.locations || [],
          selectedLocation: undefined,
        });
      } else {
        throw new Error("No data returned from GraphQL query");
      }
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

  const handleLocationSelect = async (location: Location) => {
    updateSourceData({ selectedLocation: location });

    await logInteraction("source", {
      searchQuery: sourceData.query,
      selectedLocation: location,
    });

    console.log("Location selection logged to Elasticsearch:", {
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Search className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Search Locations
            </h3>
            <p className="text-sm text-slate-500">
              Find suburbs and locations across Australia
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for suburbs, cities, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                error={!!searchError}
                errorMessage={searchError}
                hint="Try: Melbourne, Sydney CBD, Brisbane"
              />
            </div>
            <Button
              type="submit"
              isLoading={isSearching}
              size="lg"
              className="lg:w-auto w-full bg-blue-600 hover:bg-blue-700 h-[50px]"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "Searching..." : "Search Locations"}
            </Button>
          </div>
        </form>
      </div>

      {sourceData.results && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                  <Layers className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Search Results
                  </h3>
                  <p className="text-sm text-slate-500">
                    Found {filteredResults?.length || 0} location
                    {filteredResults?.length !== 1 ? "s" : ""} matching your
                    search
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <div className="w-48">
                  <Select
                    placeholder="Filter by category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    options={categoryOptions}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredResults && filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[30vh] overflow-y-auto pr-2">
                {filteredResults.map((location: Location) => (
                  <div
                    key={location.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      sourceData.selectedLocation?.id === location.id
                        ? "border-blue-300 bg-blue-50 shadow-sm ring-2 ring-blue-200"
                        : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                    }`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                            sourceData.selectedLocation?.id === location.id
                              ? "bg-blue-100"
                              : "bg-slate-100"
                          }`}
                        >
                          <MapPin
                            className={`w-5 h-5 ${
                              sourceData.selectedLocation?.id === location.id
                                ? "text-blue-600"
                                : "text-slate-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-500 mb-1">
                            {formatLocationDisplay(location)}
                          </h4>
                          {location.category && (
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                              {location.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {sourceData.selectedLocation?.id === location.id && (
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              sourceData.query && (
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-2">
                    No results found for <strong>"{sourceData.query}"</strong>
                  </p>
                  <p className="text-sm text-slate-400">
                    Try adjusting your search terms or removing category filters
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {sourceData.selectedLocation && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 p-6 border-b border-slate-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Navigation className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Selected Location
                </h3>
                <p className="text-sm text-slate-600">
                  Detailed information and map view
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center">
                <Building className="w-5 h-5 text-slate-600 mr-3" />
                <div>
                  <div className="font-medium text-slate-900">
                    {formatLocationDisplay(sourceData.selectedLocation)}
                  </div>
                </div>
              </div>

              {sourceData.selectedLocation.category && (
                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {sourceData.selectedLocation.category}
                </span>
              )}
            </div>

            {sourceData.selectedLocation.latitude &&
            sourceData.selectedLocation.longitude ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    width="100%"
                    height="350"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${sourceData?.selectedLocation?.latitude},${sourceData?.selectedLocation.longitude}&z=14&output=embed`}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Map className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold">Map location unavailable</p>
                <p className="text-sm text-slate-400">
                  Coordinates missing for this location
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <Globe className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">
              About Location Search
            </h4>
            <p className="text-sm text-slate-600 mb-3">
              Search through thousands of Australian locations including
              suburbs, cities, and postal areas. Each result provides detailed
              geographic information and map coordinates where available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
