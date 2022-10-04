import { gql, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/button'
import {
  CreateDishMutation,
  CreateDishMutationVariables,
} from '../../graphql/__generated__'
import { MY_RESTAURANT_QUERY } from './my-restaurant'

const CREATE_DISH_MUTATION = gql`
  mutation createDish($input: CreateDishInput!) {
    createDish(input: $input) {
      ok
      error
    }
  }
`

interface IParams {
  restaurantId: string
}

interface IForm {
  name: string
  price: string
  description: string
  [key: string]: string //그외 싸그라니
}

const AddDish = () => {
  const { restaurantId } = useParams() as unknown as IParams
  const navigate = useNavigate()
  const [createDishMutation, { loading }] = useMutation<
    CreateDishMutation,
    CreateDishMutationVariables
  >(CREATE_DISH_MUTATION, {
    refetchQueries: [
      {
        query: MY_RESTAURANT_QUERY,
        variables: {
          input: {
            id: +restaurantId,
          },
        },
      },
    ],
  })

  const { register, handleSubmit, getValues, setValue } = useForm<IForm>({
    mode: 'onChange',
  })

  const onSubmit = () => {
    const { name, price, description, ...rest } = getValues()
    console.log(rest)
    const optionsObject = optionsNumber.map((id) => ({
      name: rest[`${id}-optionName`],
      extra: +rest[`${id}-optionExtra`],
    }))
    console.log(optionsObject)
    createDishMutation({
      variables: {
        input: {
          name,
          price: +price,
          description,
          restaurantId: +restaurantId,
          options: optionsObject,
        },
      },
    })
    navigate(-1)
  }
  const [optionsNumber, setOptionsNumber] = useState<number[]>([])
  const onAddOptionClick = () => {
    setOptionsNumber((current) => [Date.now(), ...current])
  }
  const onDeleteClick = (idToDelete: number) => {
    setOptionsNumber((currnet) => currnet.filter((id) => id !== idToDelete))
    setValue(`${idToDelete}-optionName`, '')
    setValue(`${idToDelete}-optionExtra`, '')
  }
  return (
    <div className="max-w-screen-sm mx-auto flex flex-col items-center mt-52">
      <h4 className="font-semibold text-2xl mb-3">음식 추가</h4>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-3 mt-3 mb-5 w-full"
      >
        <input
          {...register('name', {
            required: 'name is required',
            maxLength: { value: 30, message: 'max char is 30' },
          })}
          required
          maxLength={30}
          placeholder="name"
          className="input"
        />

        <input
          {...register('price', { required: 'price is required' })}
          name="price"
          placeholder="price"
          className="input"
          type="number"
          min={0}
        />
        <input
          {...register('description', { required: 'description is required' })}
          name="description"
          placeholder="description"
          className="input"
          type="text"
        />
        <div className="my-10">
          <h4 className="font-medium mb-3 text-lg">음식 추가 옵션</h4>
          <span
            className="cursor-pointer text-white bg-gray-400 hover:bg-gray-600 py-1 px-2 mt-5 rounded-md"
            onClick={onAddOptionClick}
          >
            Add Option
          </span>
          {optionsNumber.length !== 0 &&
            optionsNumber.map((id) => (
              <div key={id} className="mt-5">
                <input
                  {...register(`${id}-optionName`)}
                  className="ml-5 py-2 px-4 focus:outline-none mr-3 focus:border-gray-600 border-2"
                  placeholder="Option Name"
                  type="text"
                />
                <input
                  {...register(`${id}-optionExtra`)}
                  className="ml-5 py-2 px-4 focus:outline-none focus:border-gray-600 border-2"
                  placeholder="Option Extra"
                  min={0}
                  type="number"
                  defaultValue={0}
                />
                <span
                  className="cursor-pointer ml-3 text-white bg-red-400 hover:bg-red-600 py-1 px-2 mt-5 rounded-md"
                  onClick={() => onDeleteClick(id)}
                >
                  Delete Option
                </span>
              </div>
            ))}
        </div>
        <Button loading={loading} actionText="Make Dish" />
      </form>
    </div>
  )
}

export default AddDish
