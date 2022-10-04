import { gql, useApolloClient, useMutation } from '@apollo/client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/button'
import {
  CreateRestaurantMutation,
  CreateRestaurantMutationVariables,
} from '../../graphql/__generated__'
import { MY_RESTAURANTS_QUERY } from './my-restaurants'

const CREATE_RESTAURANT_MUTATION = gql`
  mutation createRestaurant($input: CreateRestaurantInput!) {
    createRestaurant(input: $input) {
      error
      ok
      restaurantId
    }
  }
`

interface IFormProps {
  name: string
  address: string
  categoryName: string
  file: FileList
}

const AddRestaurant = () => {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [imageUrl, setImageUrl] = useState('')
  const onCompleted = (data: CreateRestaurantMutation) => {
    const {
      createRestaurant: { ok, restaurantId },
    } = data
    if (ok) {
      const { file, name, categoryName, address } = getValues()
      setUploading(false)
      const queryResult = client.readQuery({ query: MY_RESTAURANTS_QUERY })
      client.writeQuery({
        query: MY_RESTAURANTS_QUERY,
        data: {
          myRestaurants: {
            ...queryResult.myRestaurants,
            restaurants: [
              {
                address,
                category: {
                  name: categoryName,
                  __typename: 'Category',
                },
                coverImg: imageUrl,
                id: restaurantId,
                name,
                __typename: 'Restaurant',
              },
              ...queryResult.myRestaurants.restaurants,
            ],
          },
        },
      })
      navigate('/')
    }
  }
  const [createRestaurantMutation, { loading, data }] = useMutation<
    CreateRestaurantMutation,
    CreateRestaurantMutationVariables
  >(CREATE_RESTAURANT_MUTATION, {
    onCompleted,
    // refetchQueries: [{ query: MY_RESTAURANTS_QUERY }],
  })

  const { handleSubmit, getValues, register, formState } = useForm<IFormProps>({
    mode: 'onChange',
  })

  const [uploading, setUploading] = useState(false)
  const onSubmit = async () => {
    try {
      setUploading(true)
      const { file, name, categoryName, address } = getValues()
      const actualFile = file[0]
      const formBody = new FormData()
      formBody.append('file', actualFile)
      const { url } = await (
        await fetch('http://localhost:4000/uploads/', {
          method: 'POST',
          body: formBody,
        })
      ).json()
      setImageUrl(url)
      createRestaurantMutation({
        variables: {
          input: {
            name,
            categoryName,
            address,
            coverImg: url,
          },
        },
      })
    } catch (e) {}
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center ">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="w-full font-medium text-left text-3xl mb-5">
          Create Restaurant
        </h4>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 mt-5 mb-5 w-full"
        >
          <input
            {...register('name', { required: 'Name is required' })}
            className="input"
            placeholder="name"
            required
          />

          <input
            {...register('address', { required: 'address is Required' })}
            className="input"
            placeholder="address"
            required
          />
          <input
            {...register('categoryName', {
              required: 'categoryName is Required',
            })}
            className="input"
            placeholder="categoryName"
            required
          />
          <div>
            <input
              type="file"
              accept="image/*"
              {...register('file', { required: 'file is required' })}
            />
          </div>
          <Button loading={uploading} actionText="Create Restaurant" />
        </form>
      </div>
    </div>
  )
}

export default AddRestaurant
