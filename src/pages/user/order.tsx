import { gql, useMutation, useQuery, useSubscription } from '@apollo/client'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FULL_ORDER_FRAGMENT } from '../../fragments'
import {
  EditOrderMutation,
  EditOrderMutationVariables,
  GetOrderQuery,
  GetOrderQueryVariables,
  OrderStatus,
  OrderUpdatesSubscription,
  OrderUpdatesSubscriptionVariables,
  UserRole,
} from '../../graphql/__generated__'
import { useMe } from '../../hooks/useMe'

const GET_ORDER = gql`
  query getOrder($input: GetOrderInput!) {
    getOrder(input: $input) {
      ok
      error
      order {
        ...FullOrderParts
      }
    }
  }
  ${FULL_ORDER_FRAGMENT}
`
const ORDER_SUBSCRIPTION = gql`
  subscription orderUpdates($input: OrderUpdatesInput!) {
    orderUpdates(input: $input) {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`

const EDIT_ORDER = gql`
  mutation editOrder($input: EditOrderInput!) {
    editOrder(input: $input) {
      ok
      error
    }
  }
`

interface IParams {
  id: number
}

export const Order = () => {
  const { id } = useParams() as unknown as IParams
  const { data: userData } = useMe()
  const [editOrderMutation] = useMutation<
    EditOrderMutation,
    EditOrderMutationVariables
  >(EDIT_ORDER)
  const { data, subscribeToMore } = useQuery<
    GetOrderQuery,
    GetOrderQueryVariables
  >(GET_ORDER, {
    variables: {
      input: {
        id: +id,
      },
    },
  })
  useEffect(() => {
    if (data?.getOrder.ok) {
      subscribeToMore({
        document: ORDER_SUBSCRIPTION,
        variables: {
          input: {
            id: +id,
          },
        },
        updateQuery: (
          prev,
          {
            subscriptionData: { data },
          }: { subscriptionData: { data: OrderUpdatesSubscription } }
        ) => {
          if (!data) return prev
          return {
            getOrder: {
              ...prev.getOrder,
              order: {
                ...data.orderUpdates,
              },
            },
          }
        },
      })
    }
  }, [data])
  // const { data: subscriptionData } = useSubscription<
  //   OrderUpdatesSubscription,
  //   OrderUpdatesSubscriptionVariables
  // >(ORDER_SUBSCRIPTION, {
  //   variables: {
  //     input: {
  //       id: +id,
  //     },
  //   },
  // })
  // console.log(subscriptionData)
  const onButtonClick = (newStatus: OrderStatus) => {
    editOrderMutation({
      variables: {
        input: {
          id: +id,
          status: newStatus,
        },
      },
    })
  }
  return (
    <div className="mt-32 max-w-screen-xl flex justify-center mb-32">
      <div className="border border-gray-800 w-full max-w-screen-sm flex flex-col justify-center">
        <h4 className="bg-gray-800 w-full py-5 text-white text-center text-xl">
          Order #{id}
        </h4>
        <h5 className="p-5 pt-10 text-3xl text-center">
          ${data?.getOrder.order?.total}
        </h5>
        <div className="p-5 text-xl grid gap-6">
          <div className="border-t pt-5 border-gray-700">
            Prepared By:{''}
            <span className="font-medium">
              {data?.getOrder.order?.restaurant?.name}
            </span>
          </div>
          <div className="border-t pt-5 border-gray-700">
            Deliver To: {''}
            <span className="font-medium">
              {data?.getOrder.order?.customer?.email}
            </span>
          </div>
          <div className="border-t pt-5 border-gray-700">
            Driver : {''}
            <span className="font-medium">
              {data?.getOrder.order?.driver?.email}
            </span>
          </div>

          {userData?.me.role === 'Client' && (
            <span className="border-t border-gray-700 text-center mt-3 py-6 mb-3 text-2xl text-green-600">
              Status :{data?.getOrder.order?.status}
            </span>
          )}
          {userData?.me.role === UserRole.Owner && (
            <>
              {data?.getOrder.order?.status === OrderStatus.Pending && (
                <button
                  onClick={() => onButtonClick(OrderStatus.Cooking)}
                  className="btn"
                >
                  Accept Order
                </button>
              )}
              {data?.getOrder.order?.status === 'Cooking' && (
                <button
                  onClick={() => onButtonClick(OrderStatus.Cooked)}
                  className="btn"
                >
                  Order Cooked
                </button>
              )}
              {data?.getOrder.order?.status !== OrderStatus.Cooking &&
                data?.getOrder.order?.status !== OrderStatus.Pending && (
                  <span className="border-t border-gray-700 text-center mt-3 py-6 mb-3 text-2xl text-green-600">
                    Status :{data?.getOrder.order?.status}
                  </span>
                )}
            </>
          )}
          {userData?.me.role === UserRole.Delivery && (
            <>
              {data?.getOrder.order?.status === OrderStatus.Cooked && (
                <button
                  onClick={() => onButtonClick(OrderStatus.PickedUp)}
                  className="btn"
                >
                  Picked Up
                </button>
              )}
              {data?.getOrder.order?.status === 'PickedUp' && (
                <button
                  onClick={() => onButtonClick(OrderStatus.Deliverd)}
                  className="btn"
                >
                  Order Deliverd
                </button>
              )}
            </>
          )}
          {data?.getOrder.order?.status === OrderStatus.Deliverd && (
            <span className="border-t font-bold border-gray-700 text-center mt-3 py-6 mb-3 text-2xl text-green-600">
              Thank you for your service.
            </span>
          )}
        </div>
        
      </div>
    </div>
  )
}
