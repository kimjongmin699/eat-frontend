import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Button from '../components/button'
import { FormError } from '../components/form-error'
import {
  CreateAccoountMutation,
  CreateAccoountMutationVariables,
  UserRole,
} from '../graphql/__generated__'

export const CREATE_ACCOUNT = gql`
  mutation createAccoount($createAccountInput: CreateAccountInput!) {
    createAccount(input: $createAccountInput) {
      ok
      error
    }
  }
`

interface ICreateAccountForm {
  email: string
  password: string
  role: UserRole
}

export const CreateAccount = () => {
  const {
    register,
    getValues,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<ICreateAccountForm>({
    mode: 'onChange',
    defaultValues: { role: UserRole.Client },
  })

  const navigate = useNavigate()
  const onCompleted = (data: CreateAccoountMutation) => {
    const {
      createAccount: { ok },
    } = data
    if (ok) {
      alert('Account Created. Log in now.')
      navigate('/')
    }
  }
  const [createAccountMutation, { loading, data: createAccountMutaionResult }] =
    useMutation<CreateAccoountMutation, CreateAccoountMutationVariables>(
      CREATE_ACCOUNT,
      { onCompleted }
    )
  const onSubmit = () => {
    if (!loading) {
      const { email, password, role } = getValues()
      createAccountMutation({
        variables: {
          createAccountInput: { email, password, role },
        },
      })
    }
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center ">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="w-full font-medium text-lleft text-3xl mb-5">
          Let's get started
        </h4>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 mt-5 mb-5 w-full"
        >
          <input
            {...register('email', { required: 'Email is required' })}
            className="input"
            placeholder="email"
            type="email"
            required
          />
          {errors.email?.message && (
            <FormError errorMessage={errors.email?.message} />
          )}
          <input
            {...register('password', { required: 'Password is Required' })}
            className="input"
            placeholder="password"
            type="password"
            required
          />
          {errors.password?.message && (
            <FormError errorMessage={errors.password?.message} />
          )}
          <select {...register('role', { required: true })} className="input">
            {Object.keys(UserRole).map((role, index) => (
              <option key={index}>{role}</option>
            ))}
          </select>
          <Button loading={loading} actionText="Create Account" />
          {createAccountMutaionResult?.createAccount.error && (
            <FormError
              errorMessage={createAccountMutaionResult?.createAccount.error}
            />
          )}
        </form>
        <div className="text-lg">
          Already have an account?{''}
          <Link to="/" className="text-green-400 hover:underline">
            Log in now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CreateAccount
