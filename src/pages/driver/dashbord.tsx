import React, { useEffect, useState } from 'react'
import GoogleMapReact from 'google-map-react'
import { gql, useMutation, useSubscription } from '@apollo/client'
import { FULL_ORDER_FRAGMENT } from '../../fragments'
import {
  CookedOrdersSubscription,
  TakeOrderMutation,
  TakeOrderMutationVariables,
} from '../../graphql/__generated__'
import { Link, useNavigate } from 'react-router-dom'

const COOCKED_ORDERS_SUBSCRIPTION = gql`
  subscription coockedOrders {
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

const Driver: React.FC<IDriverProps> = () => <div className="text-lg">🚚</div>

export const Dashboard = () => {
  const [driverCoords, setDriverCoords] = useState<ICoords>({ lat: 0, lng: 0 })
  const [map, setMap] = useState<google.maps.Map>()
  const [maps, setMaps] = useState<any>()
  const onSuccess = ({
    coords: { latitude, longitude },
  }: GeolocationPosition) => {
    setDriverCoords({ lat: latitude, lng: longitude })
  }
  const onError = (error: GeolocationPositionError) => {
    console.log(error)
  }
  useEffect(() => {
    navigator.geolocation.watchPosition(onSuccess, onError, {
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
        (result, status) => {
          console.log(result, status)
        }
      )
    }
  }, [driverCoords.lat, driverCoords.lng])

  const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng))
    setMap(map)
    setMaps(maps)
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
              driverCoords.lat + 0.01,
              driverCoords.lng + 0.01
            ),
          },
          travelMode: google.maps.TravelMode.TRANSIT,
        },
        (result, status) => {
          directionsRenderer.setDirections(result)
        }
      )
    }
  }
  const { data: coockedOrdersData } = useSubscription<CookedOrdersSubscription>(
    COOCKED_ORDERS_SUBSCRIPTION
  )
  useEffect(() => {
    if (coockedOrdersData?.cookedOrders.id) {
      makeRoute()
    }
  }, [coockedOrdersData])

  const navigate = useNavigate()
  const onCompleted = (data: TakeOrderMutation) => {
    if (data.takeOrder.ok) {
      navigate(`/orders/${coockedOrdersData?.cookedOrders.id}`)
    }
  }

  const [takeOrderMutation] = useMutation<
    TakeOrderMutation,
    TakeOrderMutationVariables
  >(TAKE_ORDER_MUTATION, { onCompleted })
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
    <div>
      <div style={{ height: '70vh', width: '100%' }}>
        <GoogleMapReact
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={onApiLoaded}
          bootstrapURLKeys={{ key: 'AIzaSyCQBuKy-bkomVZm4BTMYc30cCDvtCpateI' }}
          defaultCenter={{
            lat: 35.166535,
            lng: 126.9779692,
          }}
          defaultZoom={15}
        >
          <Driver lat={driverCoords.lat} lng={driverCoords.lng} />
        </GoogleMapReact>
      </div>

      <div className="max-w-screen-sm mx-auto bg-white relative -top-10 shadow-lg py-8 px-5">
        {coockedOrdersData?.cookedOrders.restaurant ? (
          <>
            <h1 className="text-center text-3xl font-medium">
              New Coocked Order
            </h1>
            <h4 className="text-center text-2xl font-medium">
              Pick it up soon! @{' '}
              {coockedOrdersData?.cookedOrders?.restaurant?.name}
            </h4>
            <button
              onClick={() =>
                triggerMutation(coockedOrdersData?.cookedOrders.id)
              }
              className="btn w-full text-center mt-5 block"
            >
              Accept Challenge
            </button>
          </>
        ) : (
          <h1 className="text-center text-3xl font-medium">No Orders Yet</h1>
        )}
      </div>
    </div>
  )
}
