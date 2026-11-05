import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { getOrderDetails, cancelMyOrder } from '../../actions/orderActions'
import { requestCancellationReason } from '../Utils/confirm'

// import { getToken } from '../Utils/helpers'

const OrderDetails = () => {
    const dispatch = useDispatch();
    const { loading, error, order = {} } = useSelector(state => state.orderDetails);
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [order, setOrder] = useState({})

    const { shippingInfo, orderItems, paymentInfo, user, totalPrice, orderStatus } = order
    let { id } = useParams();

    // const getOrderDetails = async (id) => {
    //     try {

    //         const config = {
    //             headers: {
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }

    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${id}`, config)
    //         console.log(data)
    //         setOrder(data.order)

    //         setLoading(false)


    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }

    useEffect(() => {
        dispatch(getOrderDetails(id))

        if (error) {
            toast.error(error, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
    }, [dispatch, error, id])

    const [cancelling, setCancelling] = useState(false)
    const cancelHandler = async () => {
        const reason = await requestCancellationReason(id)
        if (!reason) return
        setCancelling(true)
        const result = await dispatch(cancelMyOrder(id, reason))
        setCancelling(false)
        if (result.ok) {
            if (result.data.emailError) {
                toast.warning(`Order cancelled. ${result.data.emailError}`, { position: 'bottom-right' })
            } else {
                toast.success('Order cancelled', { position: 'bottom-right' })
            }
            dispatch(getOrderDetails(id))
        } else {
            toast.error(result.message, { position: 'bottom-right' })
            dispatch(getOrderDetails(id))
        }
    }

    const downloadReceipt = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API}/order/${id}/receipt`,
                { withCredentials: true, responseType: 'blob' }
            )
            const fileUrl = window.URL.createObjectURL(response.data)
            const link = document.createElement('a')
            link.href = fileUrl
            link.download = `receipt-${id}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(fileUrl)
        } catch {
            toast.error('The receipt could not be downloaded. Please try again.', { position: 'bottom-right' })
        }
    }

    const shippingDetails = shippingInfo && `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`


    return (
        <>
            <MetaData title={'Order Details'} />

            {loading ? <Loader /> : (
                <>
                    <div className="row d-flex justify-content-between">
                        <div className="col-12 col-lg-8 mt-5 order-details">
                          <div className="order-info-box">
                            <h1 className="mb-4">Order # {order._id}</h1>

                            <h4 className="mb-3">Shipping Info</h4>
                            <p><b>Name:</b> {user && user.name}</p>
                            <p><b>Phone:</b> {shippingInfo && shippingInfo.phoneNo}</p>
                            <p className="mb-3"><b>Address:</b> {shippingDetails}</p>
                            <p><b>Amount:</b> {`\u20b1${Number(totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</p>
                            <p><b>Payment:</b> {paymentInfo?.method || (paymentInfo?.status === 'Cash on Delivery' ? 'Cash on Delivery' : 'Not specified')} - {paymentInfo?.status || 'Pending'}</p>
                            {order.paidAt && <p><b>Payment confirmed:</b> {new Date(order.paidAt).toLocaleString()}</p>}
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={downloadReceipt}>Download order receipt (PDF)</button>
                          </div>

                          <div className="glass-box order-status-box my-4">
                            <h4 className="mb-3">Order Status</h4>
                            <div className="d-flex align-items-center flex-wrap" style={{ gap: 12 }}>
                                <span className={`status-pill ${orderStatus === 'Delivered' ? 'status-delivered' : orderStatus === 'Cancelled' ? 'status-cancelled' : orderStatus === 'Shipped' ? 'status-shipped' : 'status-pending'}`}>{orderStatus}</span>
                                {orderStatus === 'Processing' && (
                                    <button className="btn btn-outline-danger btn-sm" disabled={cancelling} onClick={cancelHandler}>
                                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                                    </button>
                                )}
                                {orderStatus === 'Cancelled' && (
                                    <div className="text-danger">
                                    <span>This order was cancelled.</span>
                                    {order.cancellationReason && <p className="mb-1"><b>Reason:</b> {order.cancellationReason}</p>}
                                    {order.cancelledAt && <p className="mb-0"><b>Cancelled:</b> {new Date(order.cancelledAt).toLocaleString()}</p>}
                                    </div>
                                )}
                            </div>
                          </div>

                            <h4 className="my-4">Order Items:</h4>

                            <hr />
                            <div className="cart-item my-1">
                                {orderItems && orderItems.map(item => (
                                    <div key={item.product} className="row my-5">
                                        <div className="col-4 col-lg-2">
                                            <img src={item.image} alt={item.name} height="45" width="65" />
                                        </div>

                                        <div className="col-5 col-lg-5">
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                        </div>


                                        <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                            <p>₱{Number(item.price).toLocaleString()}</p>
                                        </div>

                                        <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                            <p>{item.quantity} Piece(s)</p>
                                            {orderStatus === 'Delivered' && (
                                                <Link className="btn btn-outline-primary btn-sm" to={`/product/${item.product}?reviewOrder=${id}`}>
                                                    Review Product
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <hr />
                        </div>
                    </div>
                </>
            )}

        </>
    )
}

export default OrderDetails