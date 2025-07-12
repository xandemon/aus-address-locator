import { gql } from "@apollo/client";

export const typeDefs = gql`
  type Location {
    id: Int!
    location: String!
    postcode: Int!
    state: String!
    latitude: Float
    longitude: Float
    category: String
  }

  type ValidationResult {
    isValid: Boolean!
    message: String!
    location: Location
  }

  type SearchResult {
    locations: [Location!]!
    total: Int!
    query: String!
  }

  input VerifyAddressInput {
    postcode: String!
    suburb: String!
    state: String!
  }

  input SearchLocationsInput {
    query: String!
    category: String
    limit: Int
    offset: Int
  }

  type Query {
    verifyAddress(input: VerifyAddressInput!): ValidationResult!
    searchLocations(input: SearchLocationsInput!): SearchResult!
    healthCheck: String!
  }
`;

export const VERIFY_ADDRESS = gql`
  query VerifyAddress($input: VerifyAddressInput!) {
    verifyAddress(input: $input) {
      isValid
      message
      location {
        id
        location
        postcode
        state
        latitude
        longitude
        category
      }
    }
  }
`;

export const SEARCH_LOCATIONS = gql`
  query SearchLocations($input: SearchLocationsInput!) {
    searchLocations(input: $input) {
      locations {
        id
        location
        postcode
        state
        latitude
        longitude
        category
      }
      total
      query
    }
  }
`;
