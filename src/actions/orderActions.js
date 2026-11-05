import axios from 'axios'
import {
    CREATE_ORDER_REQUEST,
    CREATE_ORDER_SUCCESS,
    CREATE_ORDER_FAIL,
    MY_ORDERS_REQUEST,
    MY_ORDERS_SUCCESS,
    MY_ORDERS_FAIL,
    ORDER_DETAILS_REQUEST,

    ORDER_DETAILS_SUCCESS,

    ORDER_DETAILS_FAIL,
    ALL_ORDERS_REQUEST,

    ALL_ORDERS_SUCCESS,

    ALL_ORDERS_FAIL,
    UPDATE_ORDER_SUCCESS,

    UPDATE_ORDER_REQUEST,

    UPDATE_ORDER_FAIL,
    DELETE_ORDER_REQUEST,
    DELETE_ORDER_SUCCESS,
    DELETE_ORDER_FAIL,
    CLEAR_ERRORS

} from '../constants/orderConstants'

export const createOrder = (order) => async (dispatch) => {
    try {
        dispatch({ type: CREATE_ORDER_REQUEST })
        const requestBody = {
            orderItems: (order.orderItems || []).map(({ product, quantity }) => ({ product, quantity })),
            shippingInfo: order.shippingInfo
        }
        const fingerprint = JSON.stringify(requestBody)
        const savedRequest = JSON.parse(sessionStorage.getItem('yokanCheckoutRequest') || 'null')
        let checkoutKey = savedRequest?.fingerprint === fingerprint ? savedRequest.key : null
        if (!checkoutKey) {
            const randomBytes = new Uint8Array(16)
            window.crypto.getRandomValues(randomBytes)
            checkoutKey = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
            sessionStorage.setItem('yokanCheckoutRequest', JSON.stringify({ fingerprint, key: checkoutKey }))
        }
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Idempotency-Key': checkoutKey
            },
            withCredentials: true
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API}/order/new`, requestBody, config)
        sessionStorage.removeItem('yokanCheckoutRequest')
        dispatch({
            type: CREATE_ORDER_SUCCESS,
            payload: data
        })
        return data
    } catch (error) {
        dispatch({
            type: CREATE_ORDER_FAIL,
            payload: error.response && error.response.data ? error.response.data.message : error.message
        })
        return null
    }

}

export const myOrders = () => async (dispatch) => {
    try {
        dispatch({ type: MY_ORDERS_REQUEST });
        const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, { withCredentials: true })
        dispatch({
            type: MY_ORDERS_SUCCESS,
            payload: data.orders
        })
    } catch (error) {
        dispatch({
            type: MY_ORDERS_FAIL,
            payload: error.response.data.message
        })
    }
}

export const getOrderDetails = (id) => async (dispatch) => {
    try {
        dispatch({ type: ORDER_DETAILS_REQUEST });
        const { data } = await axios.get(`${import.meta.env.VITE_API}/order/${id}`, { withCredentials: true })
        dispatch({
            type: ORDER_DETAILS_SUCCESS,
            payload: data.order
        })
    } catch (error) {
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: error.response.data.message
        })
    }
}

export const allOrders = () => async (dispatch) => {

    try {
        dispatch({ type: ALL_ORDERS_REQUEST });
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, {
            //AxiosRequestConfig parameter
            withCredentials: true //correct
        })
        dispatch({
            type: ALL_ORDERS_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: ALL_ORDERS_FAIL,
            payload: error.response.data.message
        })
    }
}

export const updateOrder = (id, orderData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_ORDER_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/order/${id}`, orderData, config)
        dispatch({
            type: UPDATE_ORDER_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: UPDATE_ORDER_FAIL,
            payload: error.response && error.response.data && error.response.data.message ? error.response.data.message : error.message
        })

    }

}
export const deleteOrder = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_ORDER_REQUEST })
        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, { withCredentials: true })
        dispatch({
            type: DELETE_ORDER_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_ORDER_FAIL,
            payload: error.response.data.message
        })
    }
}
export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}

// customer cancels their own order; resolves { ok, message }
export const cancelMyOrder = (id, reason) => async () => {
    try {
        const { data } = await axios.put(`${import.meta.env.VITE_API}/order/${id}/cancel`, { reason }, { withCredentials: true })
        return { ok: true, data }
    } catch (error) {
        return { ok: false, message: error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Could not cancel the order' }
    }
}
