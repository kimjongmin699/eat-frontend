import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { useParams } from 'react-router-dom'
import { CATEGORY_FRAGMENT, RESTAURANT_FRAGMENT } from '../../fragments'
import {
  CagtegotyQuery,
  CagtegotyQueryVariables,
} from '../../graphql/__generated__'

const CATEGORY_QUERY = gql`
  query cagtegoty($input: CategoryInput!) {
    category(input: $input) {
      ok
      error
      totalPages
      totalResults
      restaurants {
        ...RestaurantParts
      }
      category {
        ...CategoryParts
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${CATEGORY_FRAGMENT}
`

type Params = {
  slug: string
}

const Category = () => {
  const params = useParams<Params>()
  const { data, loading } = useQuery<CagtegotyQuery, CagtegotyQueryVariables>(
    CATEGORY_QUERY,
    {
      variables: {
        input: {
          page: 1,
          slug: params.slug + '',
        },
      },
    }
  )
  console.log(data)
  return <div>Category</div>
}

export default Category
