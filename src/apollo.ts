import {
  ApolloClient,
  InMemoryCache,
  makeVar,
  createHttpLink,
  split,
} from '@apollo/client'
import { LOCALSTORAGE_TOKEN } from './constant'
import { setContext } from '@apollo/client/link/context'
import { createClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'

const token = localStorage.getItem(LOCALSTORAGE_TOKEN)
export const isLoggedInVar = makeVar(Boolean(token))
export const authTokenVar = makeVar(token)

export const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://eat-backend-jm.herokuapp.com/graphql',
    connectionParams: {
      'x-jwt': authTokenVar() || '',
    },
  })
)

const httpLink = createHttpLink({
  uri: 'https://eat-backend-jm.herokuapp.com/graphql',
})

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'x-jwt': authTokenVar() || '',
    },
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          isLoggedIn: {
            read() {
              return isLoggedInVar()
            },
          },
          token: {
            read() {
              return authTokenVar
            },
          },
        },
      },
    },
  }),
})

//https://eat-backend-jm.herokuapp.com
