import axios from 'axios';
import {
    ALL_BRANDS_REQUEST,
    ALL_BRANDS_SUCCESS,
    ALL_BRANDS_FAIL,
    NEW_BRAND_REQUEST,
    NEW_BRAND_SUCCESS,
    NEW_BRAND_FAIL,
    UPDATE_BRAND_REQUEST,
    UPDATE_BRAND_SUCCESS,
    UPDATE_BRAND_FAIL,
    DELETE_BRAND_REQUEST,
    DELETE_BRAND_SUCCESS,
    DELETE_BRAND_FAIL,
    CLEAR_ERRORS
} from '../constants/brandConstants';

export const getBrands = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_BRANDS_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/brands`)
        dispatch({
            type: ALL_BRANDS_SUCCESS,
            payload: data.brands
        })
    } catch (error) {
        dispatch({
            type: ALL_BRANDS_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const newBrand = (brandData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_BRAND_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true //correct
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/brand/new`, brandData, config)
        dispatch({
            type: NEW_BRAND_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: NEW_BRAND_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const updateBrand = (id, brandData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_BRAND_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true //correct
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/brand/${id}`, brandData, config)
        dispatch({
            type: UPDATE_BRAND_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_BRAND_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const deleteBrand = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_BRAND_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true //correct
        }
        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/brand/${id}`, config)
        dispatch({
            type: DELETE_BRAND_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_BRAND_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
