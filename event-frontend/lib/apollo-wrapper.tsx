"use client";

import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { HttpLink, Observable, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { REFRESH_TOKENS_MUTATION } from "./graphql/mutations";
import { tokenService } from "./tokenService";

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const resolvePendingRequests = () => {
  pendingRequests.map((callback) => callback());
  pendingRequests = [];
};

function makeClient() {
  const httpLink = new HttpLink({
    uri: "http://localhost:3000/graphql",
  });

  const wsLink = typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: "ws://localhost:3000/graphql",
          connectionParams: () => {
             const token = tokenService.getAccessToken();
             console.log('WebSocket connectionParams - Token:', token ? 'Present' : 'Missing');
             
             if (!token) {
               console.warn('No token available for WebSocket connection');
             }
             
             return {
                Authorization: token ? `Bearer ${token}` : "",
             };
          },
          retryAttempts: 5,
          retryWait: (retries) => {
            return new Promise(resolve => 
              setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 30000))
            );
          },
          on: {
            connected: () => {
              console.log('WebSocket connected successfully');
            },
            error: (error) => {
              console.error('WebSocket error:', error);
            },
            closed: (event) => {
              console.log('WebSocket connection closed', event);
            },
            ping: (received) => {
              if (!received) {
                console.log('Ping sent to server');
              }
            },
            pong: (received) => {
              if (received) {
                console.log('Pong received from server');
              }
            },
          },
          keepAlive: 30000,
          lazy: false,
        })
      )
    : null;

  const authLink = setContext((_, { headers }) => {
    const token = tokenService.getAccessToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    }
  });

  const errorLink = onError((errorObj: any) => {
    let { graphQLErrors, networkError, operation, forward } = errorObj;
    

    if (!graphQLErrors) {
      if (errorObj.result?.errors) {
         graphQLErrors = errorObj.result.errors;
      } else if (errorObj.error?.errors) {
         graphQLErrors = errorObj.error.errors;
      }
    }

    let isAuthError = false;

    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (
          err.extensions?.code === 'UNAUTHENTICATED' ||
          err.extensions?.code === 'FORBIDDEN' ||
          err.message.includes('Unauthorized') ||
          err.message.includes('Access Denied')
        ) {
          isAuthError = true;
          break;
        }
      }
    }

    if (networkError && (networkError as any).statusCode === 401) {
       isAuthError = true;
    }

    if (isAuthError) {
       if (!isRefreshing) {
            isRefreshing = true;

            const refreshToken = tokenService.getRefreshToken();
            
            if (!refreshToken) {
              tokenService.clearTokens();
              if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                window.location.href = '/';
              }
              return;
            }

            const refreshClient = new ApolloClient({
              link: httpLink,
              cache: new InMemoryCache(),
            });

            return new Observable(observer => {
              refreshClient
                .mutate({
                  mutation: REFRESH_TOKENS_MUTATION,
                  context: {
                    headers: {
                      authorization: `Bearer ${refreshToken}`,
                    },
                  },
                })
                .then((response: any) => {
                  if (!response.data?.refreshTokens) {
                    throw new Error("Invalid refresh response");
                  }

                  const { accessToken, refreshToken: newRefreshToken } = response.data.refreshTokens;
                  
                  tokenService.setAccessToken(accessToken);
                  tokenService.setRefreshToken(newRefreshToken);

                  isRefreshing = false;
                  resolvePendingRequests();
                  forward(operation).subscribe(observer);
                })
                  .catch((e) => {
                  isRefreshing = false;
                  pendingRequests = [];
                  
                  tokenService.clearTokens();
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }
                  observer.error(new Error('Token refresh failed'));
                });
            });
          } else {
            
            return new Observable(observer => {
              pendingRequests.push(() => {
                forward(operation).subscribe(observer);
              });
            });
          }
    }
  });

  const httpLinkChain = errorLink.concat(authLink).concat(httpLink);

  const splitLink =
    typeof window !== "undefined" && wsLink
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          wsLink,
          httpLinkChain
        )
      : httpLinkChain;

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: splitLink,
  });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
