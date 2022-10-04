import { useReactiveVar } from '@apollo/client'
import React from 'react'
import { isLoggedInVar } from './apollo'
import { LoggedInRouter } from './router/logged-in-router'
import { LoggedOutRouter } from './router/logged-out-router'

function App() {
  const isLoggedIn = useReactiveVar(isLoggedInVar)
  return isLoggedIn ? <LoggedInRouter /> : <LoggedOutRouter />
}

export default App
