import React, { useEffect, useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { gql, useMutation, useSubscription } from '@apollo/client'
import { FULL_ORDER_FRAGMENT } from '../../fragments'
import {
  CookedOrdersSubscription,
  CookedOrdersSubscriptionVariables,
  TakeOrderMutation,
  TakeOrderMutationVariables,
} from '../../graphql/__generated__'
import { Link, useNavigate } from 'react-router-dom'

const COOKED_ORDERS_SUBSCRIPTION = gql`
  subscription cookedOrders {
    cookedOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`

const TAKE_ORDER_MUTATION = gql`
  mutation takeOrder($input: TakeOrderInput!) {
    takeOrder(input: $input) {
      ok
      error
    }
  }
`

interface ICoords {
  lat: number
  lng: number
}

interface IDriverProps {
  lat: number
  lng: number
  $hover?: any
}

const Driver: React.FC<IDriverProps> = () => <div className="text-lg">🚕</div>

export const tryDashboard = () => {
  const [driverCoords, serDriverCoords] = useState<ICoords>({ lng: 0, lat: 0 })
  const [map, setMap] = useState<google.maps.Map>()
  const [maps, setMaps] = useState<any>()
  //@ts-ignore
  const onSucces = ({ coords: { latitude, longitude } }: Position) => {
    serDriverCoords({ lat: latitude, lng: longitude })
  }
  //@ts-ignore
  const onError = (error: PositionError) => {
    console.log(error)
  }
  useEffect(() => {
    navigator.geolocation.watchPosition(onSucces, onError, {
      enableHighAccuracy: true,
    })
  }, [])
  useEffect(() => {
    if (map && maps) {
      map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng))
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode(
        {
          location: new google.maps.LatLng(driverCoords.lat, driverCoords.lng),
        },
        (results, status) => {
          console.log(results, status)
        }
      )
    }
  }, [driverCoords.lat, driverCoords.lng])
  const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    setMap(map)
    setMaps(maps)
    map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng))
  }
  const makeRoute = () => {
    if (map) {
      const directionsService = new google.maps.DirectionsService()
      const directionsRenderer = new google.maps.DirectionsRenderer()
      directionsRenderer.setMap(map)
      directionsService.route(
        {
          origin: {
            location: new google.maps.LatLng(
              driverCoords.lat,
              driverCoords.lng
            ),
          },
          destination: {
            location: new google.maps.LatLng(
              driverCoords.lat + 0.06,
              driverCoords.lng + 0.06
            ),
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result) => {
          directionsRenderer.setDirections(result)
        }
      )
    }
  }
  const { data: cookedOrdersData } = useSubscription<
    CookedOrdersSubscription,
    CookedOrdersSubscriptionVariables
  >(COOKED_ORDERS_SUBSCRIPTION)
  useEffect(() => {
    if (cookedOrdersData?.cookedOrders.id) {
      makeRoute()
    }
  }, [cookedOrdersData])
  const navigate = useNavigate()
  const onCompleted = (data: TakeOrderMutation) => {
    if (data.takeOrder.ok) {
      navigate(`/orders/${cookedOrdersData?.cookedOrders.id}`)
    }
  }
  const [takeOrderMutation] = useMutation<
    TakeOrderMutation,
    TakeOrderMutationVariables
  >(TAKE_ORDER_MUTATION, {
    onCompleted,
  })
  const triggerMutation = (orderId: number) => {
    takeOrderMutation({
      variables: {
        input: {
          id: orderId,
        },
      },
    })
  }
  return (
    // Important! Always set the container height explicitly
    <div>
      <div style={{ height: '50vh', width: window.innerWidth }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: 'AIzaSyBQefhYsHTVEa9ygjNT7n4mXE3jLb88ddo' }}
          defaultCenter={{
            lat: 36.58,
            lng: 125.95,
          }}
          defaultZoom={16}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={onApiLoaded}
        >
          <Driver lat={driverCoords.lat} lng={driverCoords.lng}></Driver>
        </GoogleMapReact>
      </div>
      <div className="max-w-screen-sm mx-auto bg-white relative -top-10 shadow-lg py-8 px-5">
        {cookedOrdersData?.cookedOrders.restaurant ? (
          <>
            <h1 className="text-center text-3xl font-medium">
              New Cooked Order
            </h1>
            <h4 className="text-center my-3 text-2xl font-medium">
              Pick it up soon! @{' '}
              {cookedOrdersData.cookedOrders.restaurant?.name}
            </h4>
            <button
              onClick={() => triggerMutation(cookedOrdersData.cookedOrders.id)}
              className="btn w-full block text-center mt-5"
            >
              Accept Challenge
            </button>
          </>
        ) : (
          <div>
            <h1 className="text-center text-3xl font-medium">
              No Orders Yet!!
            </h1>
          </div>
        )}
      </div>
    </div>
  )
}

// AIzaSyBjq-Eqw0BZEaH90I1QnvIrd_kr3pLdtvQ

//https://console.cloud.google.com/apis/library?project=static-anchor-303105
