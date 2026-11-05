import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../Utils/AuthContext'

const Sidebar = () => {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const logoutHandler = async () => {
        await logout()
        toast.success('log out', { position: 'bottom-right' })
        navigate('/')
    }
    return (
        <div className="sidebar-wrapper">
            <nav id="sidebar">
                <ul className="list-unstyled components">
                    <li>
                        <Link to="/dashboard"><i className="fa fa-tachometer"></i> Dashboard</Link>
                    </li>

                    <li>
                        <a href="#productSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle"><i
                            className="fa fa-product-hunt"></i> Products</a>
                        <ul className="collapse list-unstyled" id="productSubmenu">
                            <li>
                                <Link to="/admin/products"><i className="fa fa-clipboard"></i> All</Link>
                            </li>

                            <li>
                                <Link to="/admin/product"><i className="fa fa-plus"></i> Create</Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <Link to="/admin/categories"><i className="fa fa-tags"></i> Categories</Link>
                    </li>

                    <li>
                        <Link to="/admin/brands"><i className="fa fa-bookmark"></i> Brands</Link>
                    </li>

                    <li>
                        <Link to="/admin/orders"><i className="fa fa-shopping-basket"></i> Orders</Link>
                    </li>

                    <li>
                        <Link to="/admin/users"><i className="fa fa-users"></i> Users</Link>
                    </li>

                    <li>
                        <Link to="/admin/reviews"><i className="fa fa-star"></i> Reviews</Link>
                    </li>

    
                <li className="mt-3">
                    <Link to="/me"><i className="fa fa-user"></i> My Profile</Link>
                </li>
                <li>
                    <Link to="/me#orders"><i className="fa fa-shopping-bag"></i> My Orders</Link>
                </li>
                <li>
                    <a href="#logout" onClick={(e) => { e.preventDefault(); logoutHandler() }}><i className="fa fa-sign-out"></i> Logout</a>
                </li>
            </ul>
            </nav>
        </div>
    )
}

export default Sidebar