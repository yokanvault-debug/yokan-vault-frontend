import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import { Carousel } from 'react-bootstrap'

import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import { createPortal } from 'react-dom'
import ListReviews from '../Review/ListReviews';

import { getUser, getToken, successMsg, errMsg } from '../Utils/helpers'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProductDetails, clearErrors, } from '../../actions/productActions'
import { addItemToCart } from '../../actions/cartActions'
const ProductDetails = () => {
    // const [product, setProduct] = useState({})
    const { loading, error, product } = useSelector(state => state.productDetails);
    const [quantity, setQuantity] = useState(1)
    const { user } = useSelector(state => state.auth)
    const [activeImg, setActiveImg] = useState(0)
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [errorReview, setErrorReview] = useState('');
    const [success, setSuccess] = useState('')
    let { id } = useParams()
    const [searchParams] = useSearchParams()
    const requestedOrderId = searchParams.get('reviewOrder') || ''
    const [reviewOrderId, setReviewOrderId] = useState('')
    const autoOpenedOrderId = useRef('')
    // review state: 'login' | 'order' | 'submit' | 'update'
    const [reviewState, setReviewState] = useState('login')
    const [reviewOpen, setReviewOpen] = useState(false)
    const [hoverStar, setHoverStar] = useState(0)
    const [sending, setSending] = useState(false)
    const openReview = useCallback((orderId = reviewOrderId) => {
        const mine = (product.reviews || []).find((r) => user && String(r.user?._id || r.user) === String(user._id))
        setRating(mine ? mine.rating : 0)
        setComment(mine ? mine.comment : '')
        setReviewOrderId(orderId)
        setErrorReview('')
        setReviewOpen(true)
    }, [product.reviews, reviewOrderId, user])
    const dispatch = useDispatch()

    useEffect(() => {
        if (!user) return
        if (!product?._id) return
        let cancelled = false
        const query = requestedOrderId ? `?orderId=${encodeURIComponent(requestedOrderId)}` : ''
        axios.get(`${import.meta.env.VITE_API}/review/eligibility/${id}${query}`, { withCredentials: true })
            .then(({ data }) => {
                if (!cancelled) {
                    setReviewOrderId(data.orderId || requestedOrderId)
                    setReviewState(!data.canReview ? 'order' : data.hasReviewed ? 'update' : 'submit')
                    if (requestedOrderId && data.canReview && autoOpenedOrderId.current !== requestedOrderId) {
                        openReview(requestedOrderId)
                        autoOpenedOrderId.current = requestedOrderId
                    }
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setReviewState('order')
                    errMsg('Review availability could not be loaded. Please try again.')
                }
            })
        return () => { cancelled = true }
    }, [id, openReview, product?._id, requestedOrderId, success, user])
    // const productDetails = async (id) => {
    //     let link = `http://localhost:4001/api/v1/product/${id}`
    //     try {
    //         let res = await axios.get(link)
    //         setProduct(res.data.product)
    //     } catch (err) {
    //         console.log(err)
    //         // setError('Product not found')
    //     }
    // }

    const increaseQty = () => {
        const count = document.querySelector('.count')
        if (count.valueAsNumber >= product.stock) return;
        const qty = count.valueAsNumber + 1;
        setQuantity(qty)
    }

    const decreaseQty = () => {
        const count = document.querySelector('.count')
        if (count.valueAsNumber <= 1) return;
        const qty = count.valueAsNumber - 1;
        setQuantity(qty)
    }

    const addToCart = async () => {
        await dispatch(addItemToCart(id, quantity));

    }

    function setUserRatings() {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.starValue = index + 1;
            ['click', 'mouseover', 'mouseout'].forEach(function (e) {
                star.addEventListener(e, showRatings);
            })
        })
        function showRatings(e) {
            stars.forEach((star, index) => {
                if (e.type === 'click') {
                    if (index < this.starValue) {
                        star.classList.add('orange');
                        setRating(this.starValue)
                    } else {
                        star.classList.remove('orange')
                    }
                }
                if (e.type === 'mouseover') {
                    if (index < this.starValue) {
                        star.classList.add('yellow');
                    } else {
                        star.classList.remove('yellow')
                    }
                }
                if (e.type === 'mouseout') {
                    star.classList.remove('yellow')
                }
            })
        }
    }

    const newReview = async (reviewData) => {
        try {
            const config = {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.put(`${import.meta.env.VITE_API}/review`, reviewData, config)
            setSuccess(data.success)
            setReviewOpen(false)
            successMsg(data.updated ? 'Review updated' : 'Review posted')
            dispatch(getProductDetails(id))
        } catch (error) {
            setErrorReview(error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Could not save your review')
        }
    }

    const reviewHandler = async () => {
        if (!rating) { setErrorReview('Please choose a star rating'); return }
        if (!comment.trim()) { setErrorReview('Please enter a review comment'); return }
        if (comment.trim().length > 500) { setErrorReview('Your review cannot exceed 500 characters'); return }
        if (!reviewOrderId) { setErrorReview('A delivered order is required to submit a review'); return }
        setSending(true)
        await newReview({ rating, comment: comment.trim(), productId: id, orderId: reviewOrderId })
        setSending(false)
    }

    useEffect(() => {
        dispatch(getProductDetails(id))

    }, [id,]);

    const visibleReviewState = user ? reviewState : 'login'

    // useEffect(() => {
    //     localStorage.setItem('cartItems', JSON.stringify(cartItems));
    // }, [cartItems]);

    return (
        <>
            <MetaData title={product.name} />
            <div className="row d-flex justify-content-around">
                <div className="col-12 col-lg-5 img-fluid glass-box" id="product_image">
                    {(() => {
                        const imgs = product.images && product.images.length ? product.images : [{ public_id: 'none', url: '/images/default-product.png' }]
                        const current = imgs[Math.min(activeImg, imgs.length - 1)]
                        return (
                            <>
                                <div className="pd-main"><img src={current.url} alt={product.name} /></div>
                                {imgs.length > 1 && (
                                    <div className="pd-thumbs">
                                        {imgs.map((image, i) => (
                                            <button type="button" key={image.public_id || i} className={i === activeImg ? 'active' : ''} onClick={() => setActiveImg(i)} aria-label={`Show photo ${i + 1}`}>
                                                <img src={image.url} alt="" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )
                    })()}
                </div>

                <div className="col-12 col-lg-5 mt-5 glass-box">
                    <h3>{product.name}</h3>
                    <p id="product_id">Product # {product._id}</p>

                    <hr />

                    <div className="rating-outer">
                        <div className="rating-inner" style={{ width: `${(product.ratings / 5) * 100}%` }}></div>
                    </div>
                    <span id="no_of_reviews">({product.numOfReviews} Reviews)</span>

                    <hr />

                    <p id="product_price">${product.price}</p>
                    <div className="stockCounter d-inline">
                        {/* <span className="btn btn-danger minus" >-</span>

                        <input type="number" className="form-control count d-inline" readOnly />

                        <span className="btn btn-primary plus" >+</span> */}
                        <span className="btn btn-danger minus" onClick={decreaseQty}>-</span>

                        <input type="number" className="form-control count d-inline" value={quantity} readOnly />

                        <span className="btn btn-primary plus" onClick={increaseQty}>+</span>

                    </div>


                    <button type="button" id="cart_btn" className="btn btn-primary d-inline ml-4" disabled={product.stock === 0} onClick={addToCart} >Add to Cart</button>
                    <hr />

                    <p>Status: <span id="stock_status" className={product.stock > 0 ? 'greenColor' : 'redColor'} >{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></p>

                    <hr />

                    <h4 className="mt-2">Description:</h4>
                    <p>{product.description}</p>
                    <hr />
                    <p id="product_seller mb-3">Sold by: <strong>{product.seller}</strong></p>
                    {/* <div className="alert alert-danger mt-5" type='alert'>Login to post your review.</div>
                    <button id="review_btn" type="button" className="btn btn-primary mt-4" data-toggle="modal" data-target="#ratingModal"  >
                        Submit Your Review
                    </button> */}
                    {visibleReviewState === 'login' && <Link to="/login" className="btn btn-outline-secondary mt-4">Login to review</Link>}
                    {visibleReviewState === 'order' && <button type="button" className="btn btn-outline-secondary mt-4" disabled title="Only customers who bought this product can review it">Order to review</button>}
                    {(visibleReviewState === 'submit' || visibleReviewState === 'update') && (
                        <button id="review_btn" type="button" className="btn btn-primary mt-4" onClick={openReview}>
                            {visibleReviewState === 'update' ? 'Update Your Review' : 'Submit Your Review'}
                        </button>
                    )}

                    {/* <div className="row mt-2 mb-5">
                        <div className="rating w-50">

                            <div className="modal fade" id="ratingModal" tabIndex="-1" role="dialog" aria-labelledby="ratingModalLabel" aria-hidden="true">
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="ratingModalLabel">Submit Review</h5>
                                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">

                                            <ul className="stars" >
                                                <li className="star"><i className="fa fa-star"></i></li>
                                                <li className="star"><i className="fa fa-star"></i></li>
                                                <li className="star"><i className="fa fa-star"></i></li>
                                                <li className="star"><i className="fa fa-star"></i></li>
                                                <li className="star"><i className="fa fa-star"></i></li>
                                            </ul>

                                            <textarea
                                                name="review"
                                                id="review" className="form-control mt-3"


                                            >
                                            </textarea>


                                            <button className="btn my-3 float-right review-btn px-4 text-white" data-dismiss="modal" aria-label="Close" >Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div> */}
                    {reviewOpen && createPortal(
                        <div className="yk-modal-backdrop" onClick={() => setReviewOpen(false)}>
                            <div className="yk-modal" style={{ textAlign: 'left', maxWidth: 520 }} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                                <h2 style={{ fontSize: '1.5rem' }}>{reviewState === 'update' ? 'Update Your Review' : 'Submit Review'}</h2>
                                <div className="yk-stars" onMouseLeave={() => setHoverStar(0)}>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button type="button" key={n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={n <= (hoverStar || rating) ? 'on' : ''} onMouseEnter={() => setHoverStar(n)} onClick={() => setRating(n)}>
                                            <i className="fa fa-star"></i>
                                        </button>
                                    ))}
                                </div>
                                <textarea className="form-control mt-3" rows="4" maxLength={500} placeholder="Tell others what you think" value={comment} onChange={(e) => setComment(e.target.value)} />
                                {errorReview && <div className="alert alert-danger mt-3 py-2">{errorReview}</div>}
                                <div className="yk-modal-actions" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
                                    <button type="button" className="yk-btn-light" onClick={() => setReviewOpen(false)} disabled={sending}>Cancel</button>
                                    <button type="button" className="yk-btn-dark" onClick={reviewHandler} disabled={sending}>{sending ? 'Saving...' : 'Submit'}</button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}
                    {product.reviews && product.reviews.length > 0 && (

                        <ListReviews reviews={product.reviews} />

                    )}
                </div>

            </div>


        </>
    )
}

export default ProductDetails