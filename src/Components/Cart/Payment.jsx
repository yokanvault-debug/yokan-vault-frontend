import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { createOrder, clearErrors } from '../../actions/orderActions'
import { clearCart } from '../../actions/cartActions'

const money = (n) => `\u20b1${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

// Payment step: cash on delivery, confirmed in a small dialog (no card details)
const Payment = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { cartItems, shippingInfo } = useSelector(state => state.cart)
    const { error } = useSelector(state => state.newOrder)
    const [placing, setPlacing] = useState(false)
    const orderInfo = JSON.parse(sessionStorage.getItem('orderInfo') || 'null')

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
    }, [dispatch, error])

    useEffect(() => {
        if (!placing && (!orderInfo || !cartItems.length || !shippingInfo || !shippingInfo.address)) {
            navigate(cartItems.length ? '/shipping' : '/cart', { replace: true })
        }
    }, [orderInfo, cartItems, shippingInfo, navigate, placing])

    const confirmOrder = async () => {
        if (placing) return
        setPlacing(true)
        const order = {
            orderItems: cartItems,
            shippingInfo,
        }
        const created = await dispatch(createOrder(order))
        if (created) {
            sessionStorage.removeItem('orderInfo')
            dispatch(clearCart())
            navigate('/success', { state: { order: created.order } })
        } else {
            setPlacing(false)
        }
    }

    if (!orderInfo) return null

    return (
        <>
            <MetaData title={'Payment'} />
            <CheckoutSteps shipping confirmOrder payment />
            <div className="checkout-page">
                <div className="checkout-card">
                    <h2 className="checkout-title">Order Summary</h2>
                    <div className="checkout-row"><span>Items</span><b>{money(orderInfo.itemsPrice)}</b></div>
                    <div className="checkout-row"><span>Shipping</span><b>{money(orderInfo.shippingPrice)}</b></div>
                    <div className="checkout-row"><span>Tax</span><b>{money(orderInfo.taxPrice)}</b></div>
                    <div className="checkout-row total"><span>Total</span><b>{money(orderInfo.totalPrice)}</b></div>
                </div>
            </div>

            <div className="yk-modal-backdrop">
                <div className="yk-modal" role="dialog" aria-modal="true" aria-labelledby="cod-title">
                    <h2 id="cod-title">Confirm Your Order</h2>
                    <p>Your order will be processed via <b>Cash on Delivery</b>.</p>
                    <div className="yk-modal-actions">
                        <button className="yk-btn-dark" onClick={confirmOrder} disabled={placing}>{placing ? 'Placing...' : 'Confirm Order'}</button>
                        <button className="yk-btn-light" onClick={() => navigate('/confirm')} disabled={placing}>Cancel</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Payment
