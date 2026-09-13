import { Navigate } from 'react-router-dom'

function RoleProtectedRoute({ children, role }){

    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))

    if(!token){
        return <Navigate to="/" />
    }

    // allow multiple roles support
    const allowedRoles = Array.isArray(role) ? role : [role]

    if(!allowedRoles.includes(user?.role)){
        return <Navigate to="/" />
    }

    return children
}

export default RoleProtectedRoute