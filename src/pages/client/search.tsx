import { gql, useLazyQuery } from '@apollo/client'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { RESTAURANT_FRAGMENT } from '../../fragments'
import {
  SearchRestaurantQuery,
  SearchRestaurantQueryVariables,
} from '../../graphql/__generated__'

const SEARCH_RESTAURANT = gql`
  query searchRestaurant($input: SearchRestaurantInput!) {
    searchRestaurant(input: $input) {
      ok
      error
      totalPages
      totalResults
      restaurants {
        ...RestaurantParts
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
`

const Search = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [queryReadyToStart, { loading, data, called }] = useLazyQuery<
    SearchRestaurantQuery,
    SearchRestaurantQueryVariables
  >(SEARCH_RESTAURANT)
  useEffect(() => {
    const [_, query] = location.search.split('?term=')
    if (!query) {
      return navigate('/', { replace: true })
    }
    queryReadyToStart({
      variables: {
        input: {
          page: 1,
          query,
        },
      },
    })
  }, [navigate, location])
  console.log('data', data)
  console.log('called', called)
  console.log('loading', loading)

  return (
    <div>
      <h1>Search Page</h1>
    </div>
  )
}

export default Search
