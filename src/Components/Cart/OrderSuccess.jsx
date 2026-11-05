import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import MetaData from '../Layout/MetaData'

const OrderSuccess = () => {
    const { state } = useLocation()
    const order = state?.order
    const money = (amount) => `₱${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    return (
        <>

            <MetaData title={'Order Success'} />

            <div className="row justify-content-center">
                <div className="col-6 mt-5 text-center">
                    <img className="my-5 img-fluid d-block mx-auto" src="/images/order_success.png" alt="Order Success" width="200" height="200" />

                    <h2>Your Order has been placed successfully.</h2>
                    {order && (
                        <div className="my-3" role="status">
                            <p>Order #{order._id}</p>
                            <p>Total: <strong>{money(order.totalPrice)}</strong></p>
                            <p>Payment status: {order.paymentInfo?.status || 'Pending'}</p>
                        </div>
                    )}

                    <Link to="/orders/me">Go to Orders</Link>
                </div>

            </div>

        </>
    )
}

export default OrderSuccess