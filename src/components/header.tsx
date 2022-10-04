import { Link } from 'react-router-dom'
import { useMe } from '../hooks/useMe'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-regular-svg-icons'

const Header = () => {
  const { data } = useMe()
  return (
    <>
      <header className="py-4 bg-green-100">
        <div className="w-full  px-5 max-w-screen-2xl mx-auto flex justify-between items-center">
          <span className='text-2xl font-black'>Nuber-Eats</span>
          <span className="text-sm">
            <Link to="/edit-profile">
              <FontAwesomeIcon icon={faUser} className="text-xl" />
              {data?.me.email}
            </Link>
          </span>
        </div>
      </header>
    </>
  )
}

export default Header
