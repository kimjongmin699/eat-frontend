import React from 'react'
import { Link } from 'react-router-dom'

interface IRestaurantProps {
  id: string
  coverImg: string
  name: string
  categoryName?: string
}

const Restaurant: React.FC<IRestaurantProps> = ({
  id,
  coverImg,
  name,
  categoryName,
}) => {
  return (
    <Link to={`/restaurants/${id}`}>
      <div className="flex flex-col">
        <div
          style={{ backgroundImage: `url(${coverImg})` }}
          className="py-28 bg-center bg-cover mb-2"
        ></div>
        <h3 className="text-xl font-medium mb-2">{name}</h3>
        <span className="border-t text-sm text-gray-500">{categoryName}</span>
      </div>
    </Link>
  )
}

export default Restaurant
