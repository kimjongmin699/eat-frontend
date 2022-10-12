import React from 'react'

interface IDishOptionProps {
  isSelected: boolean
  name: string
  extra?: number | null
  dishId: number
  addOptionsToItem: (dishId: number, options: any) => void
  removeOptionFromItem: (dishId: number, optionsName: string) => void
}

export const DishOptionFront: React.FC<IDishOptionProps> = ({
  isSelected,
  name,
  extra,
  dishId,
  addOptionsToItem,
  removeOptionFromItem,
}) => {
  const onClick = () => {
    if (isSelected) {
      removeOptionFromItem(dishId, name)
    } else {
      addOptionsToItem(dishId, name)
    }
  }
  return (
    <div
      onClick={onClick}
      className={`flex border items-center ${
        isSelected ? 'border-red-600 border-2' : 'hover:border-red-600 border-2'
      }`}
    >
      <span className="mr-2 px-5 ">{name}</span>
      {<span className="tsxt-sm oprcity-70 px-10">(${extra})</span>}
    </div>
  )
}
