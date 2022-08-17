import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT,
  cache: new InMemoryCache(),
  headers: {
    "x-hasura-role": "public",
  },
});

export default client;
