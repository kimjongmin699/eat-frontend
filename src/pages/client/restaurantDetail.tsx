import { gql, useMutation, useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Dish } from '../../components/dish'
import { DishOptionFront } from '../../components/dish-option'
import { DISH_FRAGMENT, RESTAURANT_FRAGMENT } from '../../fragments'
import {
  CreateOrderItemInput,
  CreateOrderMutation,
  CreateOrderMutationVariables,
  RestaurantQuery,
  RestaurantQueryVariables,
} from '../../graphql/__generated__'

const RESTAURANT_QUERY = gql`
  query restaurant($input: RestaurantInput!) {
    restaurant(input: $input) {
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

const CREATE_ORDER_MUTATION = gql`
  mutation createOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ok
      error
      orderId
    }
  }
`

type IRestaurantParams = {
  id: string
}

const RestaurantDetail = () => {
  const { id } = useParams() as unknown as IRestaurantParams
  console.log(id)
  const { loading, data } = useQuery<RestaurantQuery, RestaurantQueryVariables>(
    RESTAURANT_QUERY,
    {
      variables: {
        input: {
          restaurantId: Number(id),
        },
      },
    }
  )
  const [orderStarted, setOrderStarted] = useState(false)
  const [orderItems, setOrderItems] = useState<CreateOrderItemInput[]>([])

  //주문 시작
  const triggerStartOrder = () => {
    setOrderStarted((current) => !current)
  }

  //선택한 주문 내역return
  const getItem = (dishId: number) => {
    return orderItems.find((order) => order.dishId === dishId)
  }

  //선택했는지 안했는지 return->true/false
  const isSelected = (dishId: number) => {
    return Boolean(getItem(dishId))
  }

  //주문내역 추가
  const addItemToOrder = (dishId: number) => {
    if (isSelected(dishId)) {
      return
    }
    setOrderItems((current) => [{ dishId, options: [] }, ...current])
  }

  //주문내역삭제
  const removeFromOrder = (dishId: number) => {
    setOrderItems((current) => current.filter((dish) => dish.dishId !== dishId))
  }

  //선택한 주문내역에 option선택시 추가
  const addOptionsToItem = (dishId: number, optionName: string) => {
    if (!isSelected(dishId)) {
      return
    }
    const oldItem = getItem(dishId)
    if (oldItem) {
      const hasOption = Boolean(
        oldItem.options?.find((aOption) => aOption.name === optionName)
      )
      if (!hasOption) {
        removeFromOrder(dishId)
        setOrderItems((current) => [
          { dishId, options: [{ name: optionName }, ...oldItem.options!] },
          ...current,
        ])
      }
    }
  }
  //선택한 주문에서 option return
  const getOptionFromItem = (
    item: CreateOrderItemInput,
    optionName: string
  ) => {
    return item.options?.find((option) => option.name === optionName)
  }

  //option select 여부
  const isOptionSelected = (dishId: number, optionName: string) => {
    const item = getItem(dishId)
    if (item) {
      return Boolean(getOptionFromItem(item, optionName))
    }
    return false
  }

  //select한 option 삭제
  const removeOptionFromItem = (dishId: number, optionName: string) => {
    if (!isSelected(dishId)) {
      return
    }
    const oldItem = getItem(dishId)
    if (oldItem) {
      setOrderItems((current) => [
        {
          dishId,
          options: oldItem.options?.filter(
            (option) => option.name !== optionName
          ),
        },
        ...current,
      ])
    }
    if (oldItem) {
      return
    }
  }

  const triggerCancelOrder = () => {
    setOrderStarted(false)
    setOrderItems([])
  }

  const navigate = useNavigate()
  const onCompleted = (data: CreateOrderMutation) => {
    console.log(data)
    if (data.createOrder.ok) {
      const {
        createOrder: { ok, orderId },
      } = data
      navigate(`/orders/${orderId}`)
    }
  }
  const [createOrderMutation, { loading: placingOrder }] = useMutation<
    CreateOrderMutation,
    CreateOrderMutationVariables
  >(CREATE_ORDER_MUTATION, {
    onCompleted,
  })

  //보안 및 다중클릭방지
  const triggerConfirmOrder = () => {
    if (placingOrder) {
      return
    }
    if (orderItems.length === 0) {
      alert('Can not place empty order')
      return
    }
    const ok = window.confirm('You are about to place an order')
    if (ok) {
      createOrderMutation({
        variables: {
          input: {
            restaurantId: +id,
            items: orderItems,
          },
        },
      })
    }
  }

  return (
    <div>
      <div
        className=" py-40 bg-cover"
        style={{
          backgroundImage: `url(${data?.restaurant.restaurant?.coverImg})`,
        }}
      >
        <div className="bg-white w-1/2 py-8 opacity-60 ">
          <h4 className="text-4xl mb-3">{data?.restaurant.restaurant?.name}</h4>
          <h5 className="test-sm font-light mb-2">
            {data?.restaurant.restaurant?.category?.name}
          </h5>
          <h6 className="test-sm font-light">
            {data?.restaurant.restaurant?.address}
          </h6>
        </div>
      </div>
      <div className="ml-5 mr-5 container pb-32 flex flex-col items-end mt-20">
        {!orderStarted && (
          <button onClick={triggerStartOrder} className="btn px-5 rounded-lg">
            Start Order
          </button>
        )}
        {orderStarted && (
          <div>
            <button
              className="btn px-10 mr-3 rounded-lg"
              onClick={triggerConfirmOrder}
            >
              Confirm Order
            </button>
            <button
              onClick={triggerCancelOrder}
              className="btn px-10 rounded-lg"
            >
              Cancel Order
            </button>
          </div>
        )}
        <div className="w-full grid mt-16 md:grid-cols-3 pag-x-5 gap-x-5 gap-y-10">
          {data?.restaurant.restaurant?.menu.map((dish: any, index: any) => (
            <Dish
              isSelected={isSelected(dish.id)}
              id={dish.id}
              orderStarted={orderStarted}
              key={index}
              name={dish.name}
              description={dish.description}
              price={dish.price}
              isCustomer={true}
              options={dish.options}
              addItemToOrder={addItemToOrder}
              removeFromOrder={removeFromOrder}
            >
              {dish.options?.map((option: any, index: any) => (
                <DishOptionFront
                  key={index}
                  isSelected={isOptionSelected(dish.id, option.name)}
                  name={option.name}
                  extra={option.extra}
                  dishId={dish.id}
                  addOptionsToItem={addOptionsToItem}
                  removeOptionFromItem={removeOptionFromItem}
                />
              ))}
            </Dish>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RestaurantDetail
