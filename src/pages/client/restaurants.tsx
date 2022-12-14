import { gql, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Restaurant from '../../components/restaurant'
import { CATEGORY_FRAGMENT, RESTAURANT_FRAGMENT } from '../../fragments'
import {
  RestaurantsPageQuery,
  RestaurantsPageQueryVariables,
} from '../../graphql/__generated__'

const RESTAURANTS_QUERY = gql`
  query restaurantsPage($input: RestaurantsInput!) {
    allCategories {
      ok
      error
      categories {
        ...CategoryParts
      }
    }

    restaurants(input: $input) {
      ok
      error
      totalPages
      totalResults
      results {
        ...RestaurantParts
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${CATEGORY_FRAGMENT}
`

interface IFromProps {
  search: string
}
const Restaurants = () => {
  const [page, setPage] = useState(1)
  const { data, loading } = useQuery<
    RestaurantsPageQuery,
    RestaurantsPageQueryVariables
  >(RESTAURANTS_QUERY, {
    variables: { input: { page } },
  })

  const onNextPageClick = () => setPage((current) => current + 1)
  const onPrevPageClick = () => setPage((current) => current - 1)

  const { register, handleSubmit, getValues } = useForm()
  const navigate = useNavigate()
  const onSearchSubmit = () => {
    console.log(getValues())
    const search = getValues().search
    navigate({
      pathname: '/search',
      search: `?term=${search}`,
    })
  }
  return (
    <div>
      <form
        onSubmit={handleSubmit(onSearchSubmit)}
        className="bg-gray-800 w-full py-40 flex items-center justify-center"
      >
        <input
          {...register('search', { required: true, min: 3 })}
          type="Search"
          className="input rounded-md border-0 w-3/4 md:w-7/12"
          placeholder="Search Restaurant"
        />
      </form>
      {!loading && (
        <div className="px-5 mt-8 pb-20 max-w-screen-2xl mx-auto">
          <div className="flex justify-around max-w-sm mx-auto">
            {data?.allCategories.categories?.map((category) => (
              <Link key={category.id} to={`category/${category.slug}`}>
                <div>
                  <div
                    className="w-16 h-16 bg-cover group-hover:bg-gray-200 rounded-full"
                    style={{ backgroundImage: `url(${category.coverImg})` }}
                  ></div>
                  <span className="mt-1 text-sm text-center font-bold">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-16 grid md:grid-cols-3 gap-x-5 gap-y-10">
            {data?.restaurants.results?.map((restaurant) => (
              <Restaurant
                key={restaurant.id}
                id={restaurant.id + ''}
                coverImg={restaurant.coverImg}
                name={restaurant.name}
                categoryName={restaurant.category?.name}
              />
            ))}
          </div>
          <div className="grid grid-col-3 text-center max-w-md items-center mx-auto mt-10">
            {page > 1 ? (
              <button
                onClick={onPrevPageClick}
                className="focus:outline-none font-medium text-2xl"
              >
                &larr;
              </button>
            ) : (
              <div></div>
            )}
            <span>
              Page {page} of {data?.restaurants.totalPages}
            </span>
            {page !== data?.restaurants.totalPages ? (
              <button
                onClick={onNextPageClick}
                className="focus:outline-none font-medium text-2xl"
              >
                &rarr;
              </button>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Restaurants
