import { gql, useQuery, useSubscription } from '@apollo/client'
import React, { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Dish } from '../../components/dish'
import {
  DISH_FRAGMENT,
  FULL_ORDER_FRAGMENT,
  RESTAURANT_FRAGMENT,
} from '../../fragments'
import {
  FindOneMyRestaurantQuery,
  FindOneMyRestaurantQueryVariables,
  PendingOrdersSubscription,
  PendingOrdersSubscriptionVariables,
} from '../../graphql/__generated__'

export const MY_RESTAURANT_QUERY = gql`
  query findOneMyRestaurant($input: MyRestaurantInput!) {
    findOneMyRestaurant(input: $input) {
      ok
      error
      restaurant {
        ...RestaurantParts
        menu {
          ...DishParts
        }
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${DISH_FRAGMENT}
`
const PENDING_ORDERS_SUBSCRIPTION = gql`
  subscription pendingOrders {
    pendingOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`

type IParams = {
  id: string
}

const MyRestaurant = () => {
  const { id } = useParams() as unknown as IParams
  const { data } = useQuery<
    FindOneMyRestaurantQuery,
    FindOneMyRestaurantQueryVariables
  >(MY_RESTAURANT_QUERY, {
    variables: {
      input: {
        id: +id,
      },
    },
  })
  console.log(id)
  console.log(data)

  const { data: subscriptionData } = useSubscription<
    PendingOrdersSubscription,
    PendingOrdersSubscriptionVariables
  >(PENDING_ORDERS_SUBSCRIPTION)

  const navigate = useNavigate()

  useEffect(() => {
    if (subscriptionData?.pendingOrders.id) {
      navigate(`/orders/${subscriptionData.pendingOrders.id}`)
    }
  }, [subscriptionData])

  return (
    <div>
      <div
        className=" py-28 bg-cover"
        style={{
          backgroundImage: `url(${data?.findOneMyRestaurant.restaurant?.coverImg})`,
        }}
      >
        <div className="bg-white w-1/2 py-8 opacity-60 ">
          <h4 className="text-4xl mb-3">
            {data?.findOneMyRestaurant.restaurant?.name}
          </h4>
          <h5 className="test-sm font-light mb-2">
            {data?.findOneMyRestaurant.restaurant?.category?.name}
          </h5>
          <h6 className="test-sm font-light">
            {data?.findOneMyRestaurant.restaurant?.address}
          </h6>
        </div>
      </div>
      <div className="mt-10 ml-4">
        <Link
          className="mr-14 hover:bg-gray-600 text-white rounded-md bg-gray-300 py-3 px-10"
          to={`/restaurants/${id}/add-dish`}
        >
          Add Dish &rarr;
        </Link>
        <Link
          className="mt-14 text-white hover:bg-green-600 bg-green-300 rounded-md py-3 px-10"
          to={``}
        >
          Buy Promotion &rarr;
        </Link>
      </div>
      <div className="mt-10">
        {data?.findOneMyRestaurant.restaurant?.menu.length === 0 ? (
          <h3>You have no dish</h3>
        ) : (
          <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10 mx-5 mb-5">
            {data?.findOneMyRestaurant.restaurant?.menu.map((dish, index) => (
              <Dish
                key={index}
                name={dish.name}
                description={dish.description}
                price={dish.price}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRestaurant
