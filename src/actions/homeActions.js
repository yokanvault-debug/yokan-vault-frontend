import axios from 'axios';
import {
    TOP_RATED_PRODUCTS_REQUEST,
    TOP_RATED_PRODUCTS_SUCCESS,
    TOP_RATED_PRODUCTS_FAIL,
    LATEST_PRODUCTS_REQUEST,
    LATEST_PRODUCTS_SUCCESS,
    LATEST_PRODUCTS_FAIL,
    CLEAR_ERRORS
} from '../constants/homeConstants';

// the 10 best reviewed products for the home carousel
export const getTopRatedProducts = (limit = 10) => async (dispatch) => {
    try {
        dispatch({ type: TOP_RATED_PRODUCTS_REQUEST })
        const link = `${import.meta.env.VITE_API}/products?page=1&limit=${limit}&sort=-ratings,-numOfReviews&price[lte]=1000000&price[gte]=0`
        const { data } = await axios.get(link)
        dispatch({
            type: TOP_RATED_PRODUCTS_SUCCESS,
            payload: data.products
        })
    } catch (error) {
        dispatch({
            type: TOP_RATED_PRODUCTS_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

// newest products first, one page at a time (infinite scroll)
export const getLatestProducts = (page = 1, limit = 10) => async (dispatch) => {
    try {
        dispatch({ type: LATEST_PRODUCTS_REQUEST })
        const link = `${import.meta.env.VITE_API}/products?page=${page}&limit=${limit}&sort=-createdAt&price[lte]=1000000&price[gte]=0`
        const { data } = await axios.get(link)
        dispatch({
            type: LATEST_PRODUCTS_SUCCESS,
            payload: {
                products: data.products,
                page,
                hasMore: page * limit < data.filteredProductsCount
            }
        })
    } catch (error) {
        dispatch({
            type: LATEST_PRODUCTS_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
