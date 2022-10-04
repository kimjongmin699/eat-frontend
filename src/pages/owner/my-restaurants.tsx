import { gql, useQuery } from '@apollo/client'
import React from 'react'
import { Link } from 'react-router-dom'

import Restaurant from '../../components/restaurant'
import { RESTAURANT_FRAGMENT } from '../../fragments'
import {
  MyRestaurantsQuery,
  MyRestaurantsQueryVariables,
} from '../../graphql/__generated__'

export const MY_RESTAURANTS_QUERY = gql`
  query myRestaurants {
    myRestaurants {
      ok
      error
      restaurants {
        ...RestaurantParts
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
`

const MyRestaurants = () => {
  const { data } = useQuery<MyRestaurantsQuery, MyRestaurantsQueryVariables>(
    MY_RESTAURANTS_QUERY
  )

  return (
    <div>
      <div className="max-w-screen-2xl mx-auto mt-32">
        <h2 className="ml-5 text-4xl font-medium mb-10">My Restaurants</h2>
        <Link
          to="/add-restaurant"
          className="mb-20 text-xl text-white bg-green-300 px-5 py-5 ml-5 rounded-md hover:bg-green-600 "
        >
          Create Restaurant &rarr;
        </Link>
        {data?.myRestaurants.ok &&
        data.myRestaurants.restaurants.length === 0 ? (
          <div className="ml-10">
            <h4 className="text-xl mb-5">You have not restaurants</h4>
            <Link
              className="text-green-300 hover:underline"
              to="/add-restaurant"
            >
              Create Restaurant &rarr;
            </Link>
          </div>
        ) : (
          <div className="mt-16 mb-30 grid md:grid-cols-3 gap-x-5 gap-y-10">
            {data?.myRestaurants.restaurants?.map((restaurant) => (
              <Restaurant
                key={restaurant.id}
                id={restaurant.id + ''}
                coverImg={restaurant.coverImg}
                name={restaurant.name}
                categoryName={restaurant.category?.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRestaurants
