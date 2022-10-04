import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from '../components/header'
import { UserRole } from '../graphql/__generated__'
import { useMe } from '../hooks/useMe'
import { NotFound } from '../pages/404'
import Category from '../pages/client/category'
import RestaurantDetail from '../pages/client/restaurantDetail'
import Restaurants from '../pages/client/restaurants'
import Search from '../pages/client/search'
import { Dashboard } from '../pages/driver/dashboard'
import AddDish from '../pages/owner/add-dish'
import AddRestaurant from '../pages/owner/add-restaurant'
import MyRestaurant from '../pages/owner/my-restaurant'
import MyRestaurants from '../pages/owner/my-restaurants'
import ConfirmEmail from '../pages/user/confirm-email'
import EditProfile from '../pages/user/edit-profile'
import { Order } from '../pages/user/order'

const clientRoutes = [
  { path: '/', element: <Restaurants /> },
  { path: '/search', element: <Search /> },
  { path: '/category/:slug', element: <Category /> },
  { path: '/restaurants/:id', element: <RestaurantDetail /> },
]

const commonRoutes = [
  { path: '/confirm', element: <ConfirmEmail /> },
  { path: '/edit-profile', element: <EditProfile /> },
  { path: '/orders/:id', element: <Order /> },
]

const ownerRoutes = [
  { path: '/', element: <MyRestaurants /> },
  { path: '/add-restaurant', element: <AddRestaurant /> },
  { path: '/restaurants/:id', element: <MyRestaurant /> },
  { path: '/restaurants/:restaurantId/add-dish', element: <AddDish /> },
]

const driverRoutes = [{ path: '/', element: <Dashboard /> }]

export const LoggedInRouter = () => {
  const { data, loading, error } = useMe()
  console.log(data)
  if (!data || loading || error) {
    return (
      <div className="h-screen flex justify-center items-center">
        <span className="font-medium text-xl tracking-wide">Loading..</span>
      </div>
    )
  }
  return (
    <>
      {/* <Header /> */}
      <Router>
        <Header />
        <Routes>
          {data.me.role === 'Client' &&
            clientRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          {data.me.role === 'Owner' &&
            ownerRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          {data.me.role === UserRole.Delivery &&
            driverRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          {commonRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<NotFound />}></Route>
        </Routes>
      </Router>
    </>
  )
}
