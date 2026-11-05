import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer, } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import { Header } from './Components/Layout/Header'
import Footer from './Components/Layout/Footer'
import GuestRoute from './Components/Route/GuestRoute'

import './App.css'
import Home from './Components/Home'
import Catalog from './Components/Product/Catalog';
import ProductDetails from './Components/Product/ProductDetails';
import Login from './Components/User/Login';
import Register from './Components/User/Register';
import VerifyEmail from './Components/User/VerifyEmail';
import CompleteProfile from './Components/User/CompleteProfile';
import { useAuth, isUserVerified } from './Components/Utils/AuthContext';

// someone who signed up with Google/Facebook (or never finished) must pick a username first
const ProfileGate = () => {
  const { currentUser, mongoUser } = useAuth();
  const location = useLocation();
  const needsProfileCompletion = isUserVerified(currentUser) && mongoUser && !mongoUser.username;
  if (needsProfileCompletion && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }
  return null;
};
import ForgotPassword from './Components/User/ForgotPassword';
import NewPassword from './Components/User/NewPassword';
import Profile from './Components/User/Profile';
import UpdateProfile from './Components/User/UpdateProfile';
import UpdatePassword from './Components/User/UpdatePassword';
import Cart from './Components/Cart/Cart';
import Shipping from './Components/Cart/Shipping';
import ConfirmOrder from './Components/Cart/ConfirmOrder';
import Payment from './Components/Cart/Payment';
import OrderSuccess from './Components/Cart/OrderSuccess';
import ListOrders from './Components/Order/ListOrders';
import OrderDetails from './Components/Order/OrderDetails';

import Dashboard from './Components/Admin/Dashboard';
import ProductsList from './Components/Admin/ProductsList';
import NewProduct from './Components/Admin/NewProduct';
import UpdateProduct from './Components/Admin/UpdateProduct';
import OrdersList from './Components/Admin/OrdersList';
import ProcessOrder from './Components/Admin/ProcessOrder';
import UsersList from './Components/Admin/UsersList';
import UpdateUser from './Components/Admin/UpdateUser';
import ProtectedRoute from './Components/Route/ProtectedRoute';
import ProductReviews from './Components/Admin/ProductReviews';
import BrandsList from './Components/Admin/BrandsList';
import CategoriesList from './Components/Admin/CategoriesList';
function App() {

  // const [state, setState] = useState({
  //   cartItems: localStorage.getItem('cartItems')
  //     ? JSON.parse(localStorage.getItem('cartItems'))
  //     : [],

  //   shippingInfo: localStorage.getItem('shippingInfo')
  //     ? JSON.parse(localStorage.getItem('shippingInfo'))
  //     : {},
  // })

  // const addItemToCart = async (id, quantity) => {
  //   console.log(id, quantity)
  //   try {
  //     const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
  //     console.log(data)

  //     const item = {
  //       product: data.product._id,
  //       name: data.product.name,
  //       price: data.product.price,
  //       image: data.product.images[0].url ? data.product.images[0].url : '',
  //       stock: data.product.stock,
  //       quantity: quantity
  //     }
  //     console.log(item)

  //     const isItemExist = state.cartItems.find(i => i.product === item.product)


  //     if (isItemExist) {
  //       setState({
  //         ...state,
  //         cartItems: state.cartItems.map(i => i.product === isItemExist.product ? item : i)
  //       })
  //     }
  //     else {
  //       setState({
  //         ...state,
  //         cartItems: [...state.cartItems, item]
  //       })
  //     }

  //     toast.success('Item Added to Cart', {
  //       position: 'bottom-right'
  //     })



  //   } catch (error) {
  //     toast.error(error, {
  //       position: 'top-left'
  //     });

  //   }

  // }

  // const removeItemFromCart = async (id) => {
  //   setState({
  //     ...state,
  //     cartItems: state.cartItems.filter(i => i.product !== id)
  //   })
  //   localStorage.setItem('cartItems', JSON.stringify(state.cartItems))
  // }

  // const saveShippingInfo = async (data) => {
  //   setState({
  //     ...state,
  //     shippingInfo: data
  //   })
  //   localStorage.setItem('shippingInfo', JSON.stringify(data))
  // }


  return (
    <>

      <Router>
        {/* <Header cartItems={state.cartItems} /> */}
        <Header />
        <ProfileGate />
        <Routes>
          <Route path="/" element={<Home />} exact="true" />
          {/* <Route path="/product/:id" element={<ProductDetails cartItems={state.cartItems} addItemToCart={addItemToCart} />} exact="true" /> */}
          <Route path="/product/:id" element={<ProductDetails />} exact="true" />

          <Route path="/search/:keyword" element={<Home />} exact="true" />
          <Route path="/catalog" element={<Catalog />} exact="true" />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} exact="true" />
          <Route path="/register" element={<GuestRoute><Register exact="true" /></GuestRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/password/forgot" element={<GuestRoute><ForgotPassword /></GuestRoute>} exact="true" />
          <Route path="/password/reset/:token" element={<NewPassword />} exact="true" />
          <Route path="/me" element={<Profile />} exact="true" />
          <Route path="/me/update" element={<UpdateProfile />} exact="true"
          />
          <Route path="/password/update" element={<UpdatePassword />} />
          {/* <Route path="/cart" element={<Cart cartItems={state.cartItems} addItemToCart={addItemToCart} removeItemFromCart={removeItemFromCart} />} exact="true" />
          <Route path="/shipping" element={<Shipping shipping={state.shippingInfo} saveShippingInfo={saveShippingInfo} />} />
          <Route path="/confirm" element={<ConfirmOrder cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} />
          <Route path="/payment" element={<Payment cartItems={state.cartItems} shippingInfo={state.shippingInfo} />} /> */}

          <Route path="/cart" element={<Cart />} exact="true" />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/confirm" element={<ConfirmOrder />} />
          <Route path="/payment" element={<Payment />} />


          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/orders/me" element={<Navigate to="/me#orders" replace />} />
          <Route path="/order/:id" element={<OrderDetails />} />

          {/* <Route path="/admin/products" element={<ProductsList />} /> */}
          <Route path="/admin/product" element={
            <ProtectedRoute isAdmin={true} >
              <NewProduct />
            </ProtectedRoute>} />
          <Route
            path="/admin/product/:id"
            element={<ProtectedRoute isAdmin={true}><UpdateProduct /></ProtectedRoute>} />
          {/* <Route
            path="/admin/orders"
            element={<OrdersList />}

          /> */}
          <Route
            path="/admin/order/:id"
            element={<ProtectedRoute isAdmin={true}><ProcessOrder /></ProtectedRoute>} />
          {/* <Route
            path="/admin/users"
            element={<UsersList />} /> */}
          <Route path="/admin/user/:id" element={<ProtectedRoute isAdmin={true}><UpdateUser /></ProtectedRoute>} />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute isAdmin={true}>
                <ProductsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute isAdmin={true}>
                <UsersList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute isAdmin={true}>
                <OrdersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute isAdmin={true} >
                <ProductReviews />
              </ProtectedRoute>} />

          <Route
            path="/admin/brands"
            element={
              <ProtectedRoute isAdmin={true}>
                <BrandsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute isAdmin={true}>
                <CategoriesList />
              </ProtectedRoute>
            }
          />

        </Routes>


        <div className="footer-gap" />
        <Footer />
      </Router>
      <ToastContainer />
    </>
  )
}

export default App
