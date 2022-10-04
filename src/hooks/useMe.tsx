import { gql, useQuery } from '@apollo/client'
import { MeQuery } from '../graphql/__generated__'

export const ME_QUERY = gql`
  query me {
    me {
      id
      email
      role
    }
  }
`

export const useMe = () => {
  return useQuery<MeQuery>(ME_QUERY)
}
