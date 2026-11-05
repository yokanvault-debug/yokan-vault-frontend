import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
// import { getUser } from '../Utils/helpers'
import { useSelector } from 'react-redux'
const ConfirmOrder = () => {
    // const [user, setUser] = useState(getUser() ? getUser() : {})
    let navigate = useNavigate();
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { user } = useSelector(state => state.auth)
    const [quoteState, setQuoteState] = useState(null)
    const [quoteErrorState, setQuoteErrorState] = useState(null)
    useEffect(() => {
        if (!cartItems.length) navigate('/cart', { replace: true })
        else if (!shippingInfo || !shippingInfo.address) navigate('/shipping', { replace: true })
    }, [cartItems, shippingInfo, navigate])

    const quoteRequest = useMemo(() => ({
        orderItems: cartItems.map(({ product, quantity }) => ({ product, quantity })),
        shippingInfo
    }), [cartItems, shippingInfo])
    const quoteFingerprint = JSON.stringify(quoteRequest)
    const quote = quoteState?.fingerprint === quoteFingerprint ? quoteState.data : null
    const quoteError = quoteErrorState?.fingerprint === quoteFingerprint ? quoteErrorState.message : ''
    const displayedItems = quote?.orderItems || cartItems

    useEffect(() => {
        if (!cartItems.length || !shippingInfo || !shippingInfo.address) return undefined
        let cancelled = false
        axios.post(`${import.meta.env.VITE_API}/order/quote`, quoteRequest, { withCredentials: true })
            .then(({ data }) => {
                if (!cancelled) setQuoteState({ fingerprint: quoteFingerprint, data })
            })
            .catch((error) => {
                if (!cancelled) {
                    setQuoteErrorState({
                        fingerprint: quoteFingerprint,
                        message: error.response?.data?.message || 'Could not verify the current prices and stock.'
                    })
                }
            })
        return () => { cancelled = true }
    }, [cartItems.length, quoteFingerprint, quoteRequest, shippingInfo])

    const processToPayment = () => {
        if (!quote) return
        const data = {
            itemsPrice: quote.itemsPrice,
            shippingPrice: quote.shippingPrice,
            taxPrice: quote.taxPrice,
            totalPrice: quote.totalPrice
        }

        sessionStorage.setItem('orderInfo', JSON.stringify(data))
        navigate('/payment')
    }

    return (
        <>
            <MetaData title={'Confirm Order'} />
            <CheckoutSteps shipping confirmOrder />
            <div className="confirm-page">
            <div className="row d-flex justify-content-between">
                <div className="col-12 col-lg-8 mt-5 order-confirm">
                    <h4 className="mb-3">Shipping Info</h4>
                    {user && <p><b>Name:</b> {user && user.name}</p>}
                    <p><b>Phone:</b> {shippingInfo.phoneNo}</p>
                    <p className="mb-4"><b>Address:</b> {`${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`}</p>

                    <hr />
                    <h4 className="mt-4">Your Cart Items:</h4>

                    {displayedItems.map(item => (
                        <React.Fragment key={item.product}>

                            <div className="cart-item my-1">
                                <hr />
                                <div className="row">
                                    <div className="col-4 col-lg-2">
                                        <img src={item.image} alt={item.name} height="45" width="65" />
                                    </div>

                                    <div className="col-5 col-lg-6">
                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                    </div>


                                    <div className="col-4 col-lg-4 mt-4 mt-lg-0">
                                        <p>{item.quantity} x ₱{Number(item.price).toLocaleString()} = <b>₱{(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</b></p>
                                    </div>

                                </div>
                            </div>
                            <hr />
                        </React.Fragment>
                    ))}

                </div>

                <div className="col-12 col-lg-3 my-4">
                    <div id="order_summary">
                        <h4>Order Summary</h4>
                        <hr />
                        <p>Subtotal:  <span className="order-summary-values">₱{quote ? quote.itemsPrice.toFixed(2) : '...'}</span></p>
                        <p>Shipping: <span className="order-summary-values">₱{quote ? quote.shippingPrice.toFixed(2) : '...'}</span></p>
                        <p>Tax:  <span className="order-summary-values">₱{quote ? quote.taxPrice.toFixed(2) : '...'}</span></p>

                        <hr />

                        <p>Total: <span className="order-summary-values">₱{quote ? quote.totalPrice.toFixed(2) : '...'}</span></p>

                        <hr />
                        {quoteError && <p role="alert" className="text-danger">{quoteError}</p>}
                        <button id="checkout_btn" className="btn btn-primary btn-block" onClick={processToPayment} disabled={!quote}>Proceed to Payment</button>
                    </div>
                </div>


            </div>

            </div>
        </>
    )
}

export default ConfirmOrder