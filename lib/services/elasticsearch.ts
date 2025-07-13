import { Client } from "@elastic/elasticsearch";
import { config } from "@/config/env";

let elasticsearchClient: Client | null = null;

function getElasticsearchClient(): Client | null {
  if (!config.elasticsearch.node) {
    console.warn(
      "Elasticsearch configuration not found, logging will be disabled"
    );
    return null;
  }

  if (!elasticsearchClient) {
    try {
      elasticsearchClient = new Client({
        node: config.elasticsearch.node,
        auth: {
          apiKey: config.elasticsearch.apiKey,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    } catch (error) {
      console.error("Failed to initialize Elasticsearch client:", error);
      return null;
    }
  }

  return elasticsearchClient;
}

export interface VerifierLogEntry {
  type: "verifier";
  timestamp: string;
  sessionId: string;
  input: {
    postcode: string;
    suburb: string;
    state: string;
  };
  result: {
    isValid: boolean;
    message: string;
    location?: any;
  };
  userAgent?: string;
  ipAddress?: string;
}

export interface SourceLogEntry {
  type: "source";
  timestamp: string;
  sessionId: string;
  searchQuery: string;
  selectedLocation: {
    id: number;
    location: string;
    postcode: number;
    state: string;
    latitude?: number;
    longitude?: number;
    coordinates?: {
      lat: number;
      lon: number;
    };
    category?: string;
  };
  userAgent?: string;
  ipAddress?: string;
}

export type LogEntry = VerifierLogEntry | SourceLogEntry;

const LOGS_INDEX = "aus-address-locator-logs";

export async function initializeElasticsearchIndex(): Promise<boolean> {
  const client = getElasticsearchClient();
  if (!client) return false;

  try {
    const indexExists = await client.indices.exists({
      index: LOGS_INDEX,
    });

    if (!indexExists) {
      try {
        await client.indices.create({
          index: LOGS_INDEX,
          mappings: {
            properties: {
              type: { type: "keyword" },
              timestamp: { type: "date" },
              sessionId: { type: "keyword" },
              "input.postcode": { type: "keyword" },
              "input.suburb": { type: "text" },
              "input.state": { type: "keyword" },
              "result.isValid": { type: "boolean" },
              "result.message": { type: "text" },
              searchQuery: { type: "text" },
              "selectedLocation.location": { type: "text" },
              "selectedLocation.state": { type: "keyword" },
              "selectedLocation.postcode": { type: "integer" },
              "selectedLocation.coordinates": { type: "geo_point" },
              "selectedLocation.latitude": { type: "float" },
              "selectedLocation.longitude": { type: "float" },
              "selectedLocation.category": { type: "keyword" },
              userAgent: { type: "text" },
              ipAddress: { type: "ip" },
            },
          },
        });
        console.log("Elasticsearch index created successfully");
      } catch (createError: any) {
        if (
          createError.meta?.body?.error?.type ===
          "resource_already_exists_exception"
        ) {
          console.log("Elasticsearch index already exists, continuing...");
        } else {
          throw createError;
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Failed to initialize Elasticsearch index:", error);
    return false;
  }
}

export async function resetElasticsearchIndex(): Promise<boolean> {
  const client = getElasticsearchClient();
  if (!client) return false;

  try {
    const indexExists = await client.indices.exists({
      index: LOGS_INDEX,
    });

    if (indexExists) {
      await client.indices.delete({
        index: LOGS_INDEX,
      });
      console.log("Elasticsearch index deleted successfully");
    }

    const initialized = await initializeElasticsearchIndex();
    if (initialized) {
      console.log("Elasticsearch index recreated successfully");
    }
    return initialized;
  } catch (error) {
    console.error("Failed to reset Elasticsearch index:", error);
    return false;
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function logVerifierInteraction(
  input: { postcode: string; suburb: string; state: string },
  result: { isValid: boolean; message: string; location?: any },
  sessionId?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<boolean> {
  const client = getElasticsearchClient();
  if (!client) {
    console.log("Elasticsearch not available, skipping verifier log");
    return false;
  }

  try {
    const logEntry: VerifierLogEntry = {
      type: "verifier",
      timestamp: new Date().toISOString(),
      sessionId: sessionId || generateSessionId(),
      input,
      result,
      userAgent,
      ipAddress,
    };

    await client.index({
      index: LOGS_INDEX,
      document: logEntry,
    });

    console.log("Verifier interaction logged successfully");
    return true;
  } catch (error) {
    console.error("Failed to log verifier interaction:", error);
    return false;
  }
}

export async function logSourceInteraction(
  searchQuery: string,
  selectedLocation: any,
  sessionId?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<boolean> {
  const client = getElasticsearchClient();
  if (!client) {
    console.log("Elasticsearch client not available, skipping logging");
    return false;
  }

  try {
    const formattedLocation = {
      ...selectedLocation,
      coordinates:
        selectedLocation.latitude !== null &&
        selectedLocation.longitude !== null &&
        selectedLocation.latitude !== undefined &&
        selectedLocation.longitude !== undefined
          ? {
              lat: selectedLocation.latitude,
              lon: selectedLocation.longitude,
            }
          : undefined,
    };

    const logEntry: SourceLogEntry = {
      type: "source",
      timestamp: new Date().toISOString(),
      sessionId: sessionId || generateSessionId(),
      searchQuery,
      selectedLocation: formattedLocation,
      userAgent,
      ipAddress,
    };

    await client.index({
      index: LOGS_INDEX,
      document: logEntry,
    });

    console.log("Source interaction logged successfully");
    return true;
  } catch (error) {
    console.error("Failed to log source interaction:", error);
    return false;
  }
}

export async function getLogs(
  options: {
    type?: "verifier" | "source";
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  } = {}
): Promise<{ logs: LogEntry[]; total: number }> {
  const client = getElasticsearchClient();
  if (!client) {
    return { logs: [], total: 0 };
  }

  try {
    const {
      type,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      searchTerm,
    } = options;

    const must: any[] = [];

    if (type) {
      must.push({ term: { type } });
    }

    if (startDate || endDate) {
      const range: any = {};
      if (startDate) range.gte = startDate;
      if (endDate) range.lte = endDate;
      must.push({ range: { timestamp: range } });
    }

    if (searchTerm) {
      must.push({
        multi_match: {
          query: searchTerm,
          fields: [
            "input.suburb",
            "result.message",
            "searchQuery",
            "selectedLocation.location",
          ],
        },
      });
    }

    const query = must.length > 0 ? { bool: { must } } : { match_all: {} };

    const response = await client.search({
      index: LOGS_INDEX,
      query,
      sort: [{ timestamp: { order: "desc" } }],
      size: limit,
      from: offset,
    });

    const logs = response.hits.hits.map((hit) => hit._source as LogEntry);
    const total =
      typeof response.hits.total === "number"
        ? response.hits.total
        : response.hits.total?.value || 0;

    return { logs, total };
  } catch (error) {
    console.error("Failed to retrieve logs:", error);
    return { logs: [], total: 0 };
  }
}

export async function getLogStatistics(): Promise<{
  totalLogs: number;
  verifierLogs: number;
  sourceLogs: number;
  successfulVerifications: number;
  failedVerifications: number;
}> {
  const client = getElasticsearchClient();
  if (!client) {
    return {
      totalLogs: 0,
      verifierLogs: 0,
      sourceLogs: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
    };
  }

  try {
    const [
      totalResult,
      verifierResult,
      sourceResult,
      successfulResult,
      failedResult,
    ] = await Promise.all([
      client.count({ index: LOGS_INDEX }),
      client.count({
        index: LOGS_INDEX,
        query: { term: { type: "verifier" } },
      }),
      client.count({ index: LOGS_INDEX, query: { term: { type: "source" } } }),
      client.count({
        index: LOGS_INDEX,
        query: {
          bool: {
            must: [
              { term: { type: "verifier" } },
              { term: { "result.isValid": true } },
            ],
          },
        },
      }),
      client.count({
        index: LOGS_INDEX,
        query: {
          bool: {
            must: [
              { term: { type: "verifier" } },
              { term: { "result.isValid": false } },
            ],
          },
        },
      }),
    ]);

    return {
      totalLogs: totalResult.count,
      verifierLogs: verifierResult.count,
      sourceLogs: sourceResult.count,
      successfulVerifications: successfulResult.count,
      failedVerifications: failedResult.count,
    };
  } catch (error) {
    console.error("Failed to get log statistics:", error);
    return {
      totalLogs: 0,
      verifierLogs: 0,
      sourceLogs: 0,
      successfulVerifications: 0,
      failedVerifications: 0,
    };
  }
}

export async function elasticsearchHealthCheck(): Promise<boolean> {
  const client = getElasticsearchClient();
  if (!client) return false;

  try {
    await client.ping();
    return true;
  } catch (error) {
    console.error("Elasticsearch health check failed:", error);
    return false;
  }
}
