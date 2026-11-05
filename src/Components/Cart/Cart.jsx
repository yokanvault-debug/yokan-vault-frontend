import React from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItemToCart, removeItemFromCart } from '../../actions/cartActions'


const Cart = () => {
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.cart)
    const { isAuthenticated } = useSelector(state => state.auth)

    const navigate = useNavigate()


    const increaseQty = (id, quantity, stock) => {
        const newQty = quantity + 1;
        if (newQty > stock) return;
        dispatch(addItemToCart(id, newQty))
    }

    const decreaseQty = (id, quantity) => {
        const newQty = quantity - 1;
        if (newQty <= 0) return;
        dispatch(addItemToCart(id, newQty))
    }

    const removeCartItemHandler = (id) => {
        dispatch(removeItemFromCart(id))
    }
    const checkoutHandler = () => {
        navigate(isAuthenticated ? '/shipping' : '/login?redirect=shipping')
    }
    // localStorage.setItem('cartItems', JSON.stringify(cartItems))
    // useEffect(() => {
    //     localStorage.setItem('cartItems', JSON.stringify(cartItems));
    // }, [cartItems]);
    return (
        <>
            <MetaData title={'Your Cart'} />
            <div className="cart-page">
            {cartItems.length === 0 ? <div className="text-center mt-5"><h2>Your Cart is Empty</h2><Link to="/catalog" className="btn btn-primary mt-3">Browse the vault</Link></div> : (
                <>
                    <h2 className="mt-5">Your Cart: <b>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</b></h2>

                    <div className="row d-flex justify-content-between">
                        <div className="col-12 col-lg-8">

                            {cartItems.map(item => (
                                <React.Fragment key={item.product}>
                                    <hr />

                                    <div className="cart-item">
                                        <div className="row">
                                            <div className="col-4 col-lg-3">
                                                <img src={item.image} alt={item.name} height="90" width="115" />
                                            </div>

                                            <div className="col-5 col-lg-3">
                                                <Link to={`/product/${item.product}`}>{item.name}</Link>
                                            </div>


                                            <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                                                <p id="card_item_price">₱{Number(item.price).toLocaleString()}</p>
                                            </div>

                                            <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                                                <div className="stockCounter d-inline">
                                                    <span className="btn btn-danger minus" onClick={() => decreaseQty(item.product, item.quantity)}>-</span>

                                                    <input type="number" className="form-control count d-inline" value={item.quantity} readOnly />

                                                    <span className="btn btn-primary plus" onClick={() => increaseQty(item.product, item.quantity, item.stock)}>+</span>
                                                </div>
                                            </div>

                                            <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                                                <i id="delete_cart_item" className="fa fa-trash btn btn-danger" onClick={() => removeCartItemHandler(item.product)} ></i>
                                                {/* <i id="delete_cart_item" className="fa fa-trash btn btn-danger" ></i> */}
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
                                <p>Subtotal:  <span className="order-summary-values">{cartItems.reduce((acc, item) => (acc + Number(item.quantity)), 0)} (Units)</span></p>
                                <p>Est. total: <span className="order-summary-values">₱{cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></p>


                                <hr />
                                <button id="checkout_btn" className="btn btn-primary btn-block" onClick={checkoutHandler}>Check out</button>
                                {/*<button id="checkout_btn" className="btn btn-primary btn-block" >Check out</button>*/}
                            </div>
                        </div>
                    </div>
                </>
            )}
            </div>
        </>
    )
}

export default Cart