import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import axios from 'axios'
// import { getToken } from '../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, updateOrder, clearErrors } from '../../actions/orderActions'
import { UPDATE_ORDER_RESET } from '../../constants/orderConstants'
import { confirmAction, requestCancellationReason } from '../Utils/confirm'

const ProcessOrder = () => {
    const dispatch = useDispatch();
    const { loading, order = {} } = useSelector(state => state.orderDetails)

    const { error, isUpdated, loading: updating, emailError } = useSelector(state => state.order)

    const [statusSelection, setStatusSelection] = useState(null)
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [order, setOrder] = useState({})
    // const [isUpdated, setIsUpdated] = useState(false)
    let { id } = useParams();
    const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus } = order
    const orderId = id;
    const status = statusSelection?.orderId === orderId ? statusSelection.value : (orderStatus || '')
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-center'
    });

    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-center'
    });

    // const getOrderDetails = async (id) => {
    //     try {
    //         const config = {
    //             headers: {

    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }

    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${id}`, config)
    //         setOrder(data.order)
    //         setLoading(false)
    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }
    // const updateOrder = async (id, formData) => {

    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/order/${id}`, formData, config)
    //         setIsUpdated(data.success)


    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }

    // useEffect(() => {
    //     getOrderDetails(orderId)
    //     if (error) {
    //         errMsg(error);
    //         setError('')
    //     }
    //     if (isUpdated) {
    //         successMsg('Order updated successfully');
    //         setIsUpdated('')
    //         navigate('/admin/orders')
    //     }
    // }, [error, isUpdated, orderId])

    useEffect(() => {
        dispatch(getOrderDetails(orderId))
        if (error) {
            errMsg(error);
            dispatch(clearErrors())
            // setError('')
        }
        if (isUpdated) {
            if (emailError) errMsg(emailError);
            else successMsg('Order updated successfully');
            dispatch(getOrderDetails(orderId))
            dispatch({ type: UPDATE_ORDER_RESET })
            // stay on this page: the status below refreshes itself
        }
    }, [dispatch, emailError, error, isUpdated, orderId])

    const updateOrderHandler = async (id) => {
        const orderData = { status }
        if (status === 'Cancelled') {
            const reason = await requestCancellationReason(id)
            if (!reason) return
            orderData.cancellationReason = reason
        }
        dispatch(updateOrder(id, orderData))
    }
    const collectPaymentHandler = async (id) => {
        const confirmed = await confirmAction({
            title: 'Confirm COD payment?',
            text: `Confirm that ₱${Number(totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} was collected for this delivered order.`,
            confirmText: 'Confirm payment collected',
            cancelText: 'Go back'
        })
        if (confirmed) dispatch(updateOrder(id, { paymentStatus: 'Paid' }))
    }

    const shippingDetails = shippingInfo && `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`
    const finalStatus = orderStatus === 'Delivered' || orderStatus === 'Cancelled'
    const pill = orderStatus === 'Delivered' ? 'status-delivered' : orderStatus === 'Cancelled' ? 'status-cancelled' : orderStatus === 'Shipped' ? 'status-shipped' : 'status-pending'
    const peso = (n) => `\u20b1${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

    return (
        <>
            <MetaData title={`Process Order # ${order && order._id}`} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    {loading ? <Loader /> : (
                        <div className="order-layout">
                            <div className="order-info-box">
                                <h2 className="mb-4">Order # {order._id}</h2>
                                <h4 className="mb-3">Shipping Info</h4>
                                <p><b>Name:</b> {user && user.name}</p>
                                <p><b>Phone:</b> {shippingInfo && shippingInfo.phoneNo}</p>
                                <p className="mb-3"><b>Address:</b> {shippingDetails}</p>
                                <p><b>Amount:</b> {peso(totalPrice)}</p>
                                <hr />
                                <h4 className="my-3">Order Items</h4>
                                {orderItems && orderItems.map(item => (
                                    <div key={item.product} className="row align-items-center my-3">
                                        <div className="col-3 col-lg-2"><img src={item.image} alt={item.name} style={{ width: 65, height: 45, objectFit: 'contain' }} /></div>
                                        <div className="col-9 col-lg-5"><Link to={`/product/${item.product}`}>{item.name}</Link></div>
                                        <div className="col-6 col-lg-2">{peso(item.price)}</div>
                                        <div className="col-6 col-lg-3">{item.quantity} Piece(s)</div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-box order-status-box">
                                <h4 className="mb-3">Status</h4>
                                <span className={`status-pill ${pill}`}>{orderStatus}</span>
                                <p className="mt-3 mb-2">
                                    <b>Payment:</b> {paymentInfo?.method || (paymentInfo?.status === 'Cash on Delivery' ? 'Cash on Delivery' : 'Not specified')}
                                    {' - '}{paymentInfo?.status || 'Pending'}
                                </p>
                                {order.paidAt && <p><b>Payment confirmed:</b> {new Date(order.paidAt).toLocaleString()}</p>}
                                {order.paidBy && <p><b>Confirmed by admin:</b> {order.paidBy.name || order.paidBy}</p>}
                                {orderStatus === 'Cancelled' && (
                                    <div className="alert alert-danger mt-3">
                                        <strong>Order cancelled</strong>
                                        {order.cancellationReason && <div>Reason: {order.cancellationReason}</div>}
                                        {order.cancelledByRole && <div>Cancelled by: {order.cancelledByRole}{order.cancelledBy ? ` (${order.cancelledBy.name || order.cancelledBy})` : ''}</div>}
                                        {order.cancelledAt && <div>Date: {new Date(order.cancelledAt).toLocaleString()}</div>}
                                    </div>
                                )}
                                {orderStatus === 'Cancelled' && order.inventoryReserved === true && !order.inventoryRestoredAt && (
                                    <button
                                        className="btn btn-warning btn-block mb-3"
                                        disabled={updating}
                                        onClick={() => dispatch(updateOrder(order._id, {
                                            status: 'Cancelled',
                                            cancellationReason: order.cancellationReason
                                        }))}
                                    >
                                        {updating ? 'Restoring inventory...' : 'Retry inventory restoration'}
                                    </button>
                                )}
                                <div className="form-group mt-3">
                                    <select
                                        className="form-control"
                                        name='status'
                                        value={status}
                                        disabled={finalStatus || updating}
                                        onChange={(e) => setStatusSelection({ orderId, value: e.target.value })}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                {finalStatus ? (
                                    <p className="text-muted mb-0">This order is {orderStatus.toLowerCase()}. It can no longer be changed.</p>
                                ) : (
                                    <button className="btn btn-primary btn-block" disabled={updating || status === orderStatus} onClick={() => updateOrderHandler(order._id)}>
                                        {updating ? 'Updating...' : 'Update Status'}
                                    </button>
                                )}
                                {orderStatus === 'Delivered' &&
                                    paymentInfo?.status === 'Pending' &&
                                    (paymentInfo?.method === 'Cash on Delivery' ||
                                        paymentInfo?.status === 'Cash on Delivery' ||
                                        String(paymentInfo?.id || '').startsWith('COD-')) && (
                                        <button
                                            className="btn btn-success btn-block mt-3"
                                            disabled={updating}
                                            onClick={() => collectPaymentHandler(order._id)}
                                        >
                                            {updating ? 'Updating...' : 'Confirm COD collected'}
                                        </button>
                                    )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
export default ProcessOrder
