import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from '../Layout/Loader'

// login / register / forgot password are for visitors only: signed-in users go back home
const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useSelector(state => state.auth)
    const { search } = useLocation()

    if (loading !== false) return <Loader />
    if (isAuthenticated) {
        const goingToCheckout = new URLSearchParams(search).get('redirect') === 'shipping'
        return <Navigate to={goingToCheckout ? '/shipping' : '/'} replace />
    }
    return children
}

export default GuestRoute
