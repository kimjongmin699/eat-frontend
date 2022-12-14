import React from 'react'
import { DishOption } from '../graphql/__generated__'

interface IDishProps {
  id?: number
  description: string
  name: string
  price: number
  isCustomer?: boolean
  orderStarted?: boolean
  options?: DishOption[] | null
  addItemToOrder?: (dishId: number) => void
  removeFromOrder?: (dishId: number) => void
  isSelected?: boolean
  children?: React.ReactNode
}

export const Dish: React.FC<IDishProps> = ({
  id = 0,
  description,
  name,
  price,
  isCustomer = false,
  orderStarted = false,
  options,
  addItemToOrder,
  removeFromOrder,
  isSelected,
  children: dishOptions,
}) => {
  const onClick = () => {
    if (orderStarted) {
      if (!isSelected && addItemToOrder) {
        return addItemToOrder(id)
      }
    }
    if (isSelected && removeFromOrder) {
      return removeFromOrder(id)
    }
  }
  return (
    <div
      className={`px-8 py-4 border cursor-pointer transition-all ${
        isSelected
          ? 'border-gray-600'
          : 'hover:border-gray-900 hover:shadow-xl '
      }`}
    >
      <div className="mb-5">
        <h3 className="text-lg font-medium flex items-center">
          {name}{' '}
          {orderStarted && (
            <button
              className={`ml-3 py-1 px-3 focus:outline-none text-sm text-white ${
                isSelected ? 'bg-red-500' : 'bg-green-400'
              }`}
              onClick={onClick}
            >
              {isSelected ? 'Remove' : 'Add'}
            </button>
          )}
        </h3>
        <h4>{description}</h4>
      </div>
      <span>${price}</span>
      {isCustomer && options && options.length !== 0 && (
        <div>
          <h5 className="mt-8 font-medium">Dish Options:</h5>
          <div className="grid gap-2 justify-start">{dishOptions}</div>
        </div>
      )}
    </div>
  )
}
