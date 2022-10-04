import { gql, useMutation } from '@apollo/client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { authTokenVar, isLoggedInVar } from '../apollo'
import Button from '../components/button'
import { FormError } from '../components/form-error'
import { LoginMutation, LoginMutationVariables } from '../graphql/__generated__'
import { LOCALSTORAGE_TOKEN } from '../constant'

interface ILoginForm {
  email: string
  password: string
}

const LOGIN_MUTATION = gql`
  mutation login($loginInput: LoginInput!) {
    login(input: $loginInput) {
      ok
      token
      error
    }
  }
`

export const Login = () => {
  const {
    register,
    getValues,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<ILoginForm>({
    mode: 'onChange',
  })

  const onCompleted = (data: LoginMutation) => {
    const {
      login: { ok, token },
    } = data
    if (ok && token) {
      console.log(token)
      localStorage.setItem(LOCALSTORAGE_TOKEN, token)
      authTokenVar(token)
      isLoggedInVar(true)
    }
  }

  const [loginMutation, { data: loginMutationResult, loading }] = useMutation<
    LoginMutation,
    LoginMutationVariables
  >(LOGIN_MUTATION, { onCompleted })

  const onSubmit = () => {
    if (!loading) {
      const { email, password } = getValues()
      loginMutation({
        variables: {
          loginInput: {
            email,
            password,
          },
        },
      })
    }
  }

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h3 className="w-full font-medium text-left text-3xl mb-5">
          Welcome Back
        </h3>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 mt-3 mb-5 w-full"
        >
          <input
            {...register('email', {
              required: 'Email is required',
              maxLength: { value: 30, message: 'max char is 30' },
            })}
            required
            maxLength={30}
            type="email"
            placeholder="Email"
            className="input"
          />
          {errors.email?.message && (
            <FormError errorMessage={errors.email.message} />
          )}
          <input
            {...register('password', { required: 'Password is required' })}
            name="password"
            type="password"
            placeholder="Password"
            className="input"
          />
          {errors.password?.message && (
            <FormError errorMessage={errors.password?.message} />
          )}
          <Button loading={loading} actionText="Login" />
          {loginMutationResult?.login.error && (
            <FormError errorMessage={loginMutationResult?.login.error} />
          )}
        </form>
        <p className="text-center mt-5 text-base">
          계정이 없으신가요?
          <Link
            to="/signup"
            className="ml-2 font-semibold text-green-600 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
