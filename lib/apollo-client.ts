import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri: "/api/graphql",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  }
);

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "network-only",
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "network-only",
    },
  },
});

export async function executeQuery<T>(
  queryFn: () => Promise<any>
): Promise<{ data?: T; error?: string }> {
  try {
    const result = await queryFn();

    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors[0].message;
      console.error("GraphQL Error:", errorMessage);
      return { error: errorMessage };
    }

    return { data: result.data };
  } catch (error: any) {
    console.error("Apollo Client Error:", error);
    return { error: error.message || "An unexpected error occurred" };
  }
}
