import { gql, useApolloClient, useMutation } from '@apollo/client'
import React from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../components/button'
import {
  EditProfileMutation,
  EditProfileMutationVariables,
} from '../../graphql/__generated__'
import { useMe } from '../../hooks/useMe'

const EDIT_PROFILE_MUTATION = gql`
  mutation editProfile($input: EditProfileInput!) {
    editProfile(input: $input) {
      ok
      error
    }
  }
`

interface IFormProps {
  email?: string
  password?: string
}

const EditProfile = () => {
  const { data: userData } = useMe()
  const client = useApolloClient()

  const onCompleted = (data: EditProfileMutation) => {
    const {
      editProfile: { ok },
    } = data
    console.log(data)
    if (ok && userData) {
    }
  }
  console.log('userData', userData)

  const [editProfile, { loading }] = useMutation<
    EditProfileMutation,
    EditProfileMutationVariables
  >(EDIT_PROFILE_MUTATION, {
    onCompleted,
  })
  const { register, handleSubmit, getValues, formState } = useForm<IFormProps>({
    mode: 'onChange',
    defaultValues: {
      email: userData?.me.email,
    },
  })

  const onSubmit = () => {
    const { email, password } = getValues()
    editProfile({
      variables: {
        input: {
          email,
          ...(password !== '' && { password }),
        },
      },
    })
  }

  return (
    <div className="mt-52 flex flex-col justify-center items-center">
      <h4 className="font-semibold text-2xl mb-3">Edit Profile</h4>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5 mx-5"
      >
        <input
          className="input"
          {...register('email')}
          type="email"
          placeholder="Email"
        />
        <input
          className="input"
          {...register('password')}
          type="password"
          placeholder="Password"
        />
        <Button
          loading={loading}
          canClick={formState.isValid}
          actionText="Save Profile"
        />
      </form>
    </div>
  )
}

export default EditProfile
