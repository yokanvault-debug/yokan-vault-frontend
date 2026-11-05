import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import axios from 'axios'
import Loader from '../Layout/Loader'
import MetaData from '../Layout/MetaData'
import { updateProfile, loadUser, clearErrors } from '../../actions/userActions'
import { myOrders } from '../../actions/orderActions'
import { UPDATE_PROFILE_RESET } from '../../constants/userConstants'
import { profileSchema, validateWithYup } from '../Utils/validation'
import { cancelMyOrder } from '../../actions/orderActions'
import { requestCancellationReason } from '../Utils/confirm'

const money = (n) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

const statusClass = (status = '') => {
    const s = status.toLowerCase()
    if (s.includes('cancel')) return 'status-cancelled'
    if (s.includes('deliver')) return 'status-delivered'
    if (s.includes('ship')) return 'status-shipped'
    return 'status-pending'
}

// My profile + my orders in one page (account card on the left, order history on the right)
const Profile = () => {
    const dispatch = useDispatch()
    const location = useLocation()
    const fileRef = useRef(null)
    const { user, loading } = useSelector(state => state.auth)
    const { isUpdated, error: updateError, loading: updating } = useSelector(state => state.user)
    const { loading: ordersLoading, orders = [], error: ordersError } = useSelector(state => state.myOrders)

    const [name, setName] = useState('')
    const [avatar, setAvatar] = useState('')
    const [preview, setPreview] = useState('')
    const [formErrors, setFormErrors] = useState({})
    const [cancellingOrderId, setCancellingOrderId] = useState('')
    const [reviewEligibility, setReviewEligibility] = useState({})

    useEffect(() => { dispatch(myOrders()) }, [dispatch])

    useEffect(() => {
        let cancelled = false
        const deliveredOrders = orders.filter(order => order.orderStatus === 'Delivered')
        Promise.all(deliveredOrders.map(async order => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API}/review/eligibility/order/${order._id}`,
                    { withCredentials: true }
                )
                return {
                    entries: Object.entries(data.products || {}).map(([productId, eligibility]) => [
                        `${order._id}:${productId}`,
                        eligibility
                    ]),
                    failed: false
                }
            } catch {
                return { entries: [], failed: true }
            }
        })).then(results => {
            if (!cancelled) {
                setReviewEligibility(Object.fromEntries(results.flatMap(result => result.entries)))
                if (results.some(result => result.failed)) {
                    toast.error('Review availability could not be loaded. Please refresh to try again.', { position: 'bottom-right' })
                }
            }
        })
        return () => { cancelled = true }
    }, [orders])

    useEffect(() => {
        if (user) {
            setName(user.name || user.displayName || '')
            setPreview((user.avatar && user.avatar.url) || user.photoURL || '/images/default-avatar.png')
        }
    }, [user])

    useEffect(() => {
        if (updateError) { toast.error(updateError, { position: 'bottom-right' }); dispatch(clearErrors()) }
        if (ordersError) { toast.error(ordersError, { position: 'bottom-right' }) }
        if (isUpdated) {
            toast.success('Profile updated', { position: 'bottom-right' })
            setAvatar('')
            dispatch(loadUser())
            dispatch({ type: UPDATE_PROFILE_RESET })
        }
    }, [dispatch, updateError, ordersError, isUpdated])

    // /me#orders scrolls to the order history
    useEffect(() => {
        if (location.hash === '#orders') {
            const el = document.getElementById('orders')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [location.hash, ordersLoading])

    const pickFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) { toast.error('Max photo size is 5MB', { position: 'bottom-right' }); return }
        const reader = new FileReader()
        reader.onload = () => { setPreview(reader.result); setAvatar(reader.result) }
        reader.readAsDataURL(file)
    }

    const save = async (e) => {
        e.preventDefault()
        const errors = await validateWithYup(profileSchema, { name, email: user.email })
        setFormErrors(errors)
        if (Object.keys(errors).length) return
        const formData = new FormData()
        formData.set('name', name)
        formData.set('email', user.email)
        formData.set('avatar', avatar)
        dispatch(updateProfile(formData))
    }

    const cancelOrder = async (order) => {
        const reason = await requestCancellationReason(order._id)
        if (!reason) return
        setCancellingOrderId(order._id)
        const result = await dispatch(cancelMyOrder(order._id, reason))
        setCancellingOrderId('')
        if (!result.ok) {
            toast.error(result.message, { position: 'bottom-right' })
            dispatch(myOrders())
            return
        }
        if (result.data.emailError) toast.warning(`Order cancelled. ${result.data.emailError}`, { position: 'bottom-right' })
        else toast.success('Order cancelled', { position: 'bottom-right' })
        dispatch(myOrders())
    }

    if (loading || !user) return <Loader />

    return (
        <>
            <MetaData title={'My account'} />
            <div className="account-page">
                <aside className="account-card">
                    <h2 className="account-title">Account profile</h2>

                    <button type="button" className="account-avatar" onClick={() => fileRef.current.click()} aria-label="Change profile photo">
                        <img src={preview} alt={user.name || 'avatar'} />
                        <span className="account-avatar-cam"><i className="fa fa-camera"></i></span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={pickFile} />
                    <p className="account-hint">Click avatar to change (Max 5MB)</p>

                    <form onSubmit={save}>
                        <label className="account-field">
                            <span>Email address</span>
                            <input value={user.email || ''} disabled readOnly />
                        </label>
                        <label className="account-field">
                            <span>Username</span>
                            <input value={user.username || ''} disabled readOnly placeholder="-" />
                        </label>
                        <label className="account-field">
                            <span>Full name</span>
                            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />
                        </label>
                        {Object.keys(formErrors).length > 0 && (
                            <div className="alert alert-danger py-2">{Object.values(formErrors).map((m, i) => <div key={i}>{m}</div>)}</div>
                        )}
                        <button type="submit" className="account-save" disabled={updating}>{updating ? 'Saving...' : 'Save changes'}</button>
                        <Link to="/password/update" className="account-link">Change password</Link>
                    </form>
                </aside>

                <section className="account-orders" id="orders">
                    <h2 className="account-title left">Order history</h2>
                    {ordersLoading ? <Loader /> : orders.length === 0 ? (
                        <div className="account-empty">You have no orders yet. <Link to="/catalog">Browse the vault</Link></div>
                    ) : (
                        <div className="orders-table-wrap">
                            <table className="orders-table">
                                <thead>
                                    <tr><th>Order ID</th><th>Items / Reviews</th><th>Date</th><th>Total</th><th>Status / Payment</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => {
                                        const orderItems = order.orderItems || []
                                        const first = orderItems[0]
                                        const more = orderItems.length - 1
                                        return (
                                            <tr key={order._id}>
                                                <td><Link to={`/order/${order._id}`} className="order-id">{order._id.slice(0, 8)}...</Link></td>
                                                <td>
                                                    <div className="order-item">
                                                        <img src={(first && first.image) || '/images/default-product.png'} alt="" />
                                                        <span>{first ? first.name : '-'}{more > 0 ? ` +${more} more` : ''}</span>
                                                    </div>
                                                    {order.orderStatus === 'Delivered' && (
                                                        <div className="mt-2">
                                                            {orderItems.map(item => {
                                                                const productId = String(item.product?._id || item.product)
                                                                const eligibility = reviewEligibility[`${order._id}:${productId}`]
                                                                return (
                                                                    <div key={productId} className="small">
                                                                        {eligibility?.hasReviewed ? (
                                                                            <span className="text-success">{item.name}: Reviewed</span>
                                                                        ) : eligibility?.canReview ? (
                                                                            <Link to={`/product/${productId}?reviewOrder=${order._id}`}>Review {item.name}</Link>
                                                                        ) : null}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{new Date(order.createdAt || order.paidAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td>{money(order.totalPrice)}</td>
                                                <td>
                                                    <span className={`status-pill ${statusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                                                    <div className="small mt-1">{order.paymentInfo?.method || 'Cash on Delivery'}: {order.paymentInfo?.status || 'Pending'}</div>
                                                    {order.paidAt && <div className="small text-muted">Paid {new Date(order.paidAt).toLocaleDateString()}</div>}
                                                </td>
                                                <td>
                                                    {order.orderStatus === 'Processing' && (
                                                        <button type="button" className="btn btn-outline-danger btn-sm" disabled={cancellingOrderId === order._id} onClick={() => cancelOrder(order)}>
                                                            {cancellingOrderId === order._id ? 'Cancelling...' : 'Cancel order'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </>
    )
}

export default Profile
