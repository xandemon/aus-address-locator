export const config = {
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  },
  australiaPost: {
    apiKey: process.env.AUSTRALIA_POST_API_KEY || "",
    baseUrl:
      process.env.AUSTRALIA_POST_BASE_URL || "https://api.auspost.com.au",
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || "http://localhost:9200",
    apiKey: process.env.ELASTICSEARCH_API_KEY || "",
  },
} as const;
