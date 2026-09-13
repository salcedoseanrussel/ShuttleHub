import { Link, useNavigate } from 'react-router-dom'

function Navbar(){

    const navigate = useNavigate()

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    const handleLogout = () => {

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        navigate('/')

    }

    return(

        <nav className="bg-green-600 text-white p-4 flex gap-6  -md">

            <Link to="/tournaments" className="hover:text-green-200">
                Tournaments
            </Link>

            {user?.role === 'Organizer' && (

                <Link
                    to="/create-tournament"
                    className="hover:text-green-200"
                >
                    Create Tournament
                </Link>

            )}

            {user && (

                <Link
                    to="/my-tournaments"
                    className="hover:text-green-200"
                >
                    My Tournaments
                </Link>

            )}

            <button
                onClick={handleLogout}
                className="cursor-pointer ml-auto bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
            >
                Logout
            </button>

        </nav>

    )

}

export default Navbar