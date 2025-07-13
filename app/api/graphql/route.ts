import { NextRequest, NextResponse } from "next/server";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/lib/graphql/schema";
import {
  verifyAddress,
  searchLocations,
  healthCheck,
} from "@/lib/services/australia-post";

const resolvers = {
  Query: {
    verifyAddress: async (
      _: any,
      { input }: { input: { postcode: string; suburb: string; state: string } }
    ) => {
      return await verifyAddress(input.postcode, input.suburb, input.state);
    },

    searchLocations: async (
      _: any,
      {
        input,
      }: {
        input: {
          query: string;
          category?: string;
          limit?: number;
          offset?: number;
        };
      }
    ) => {
      const { locations, total } = await searchLocations(
        input.query,
        input.category,
        input.limit || 20
      );

      return {
        locations,
        total,
        query: input.query,
      };
    },

    healthCheck: async () => {
      return await healthCheck();
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== "production",
  formatError: (err: any) => {
    console.error("GraphQL Error:", err);
    return {
      message: err.message,
      code: err.extensions?.code || "INTERNAL_ERROR",
      path: err.path,
    };
  },
});

const handler = startServerAndCreateNextHandler(server);

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
