import axios from 'axios';
import {
    ALL_CATEGORIES_REQUEST,
    ALL_CATEGORIES_SUCCESS,
    ALL_CATEGORIES_FAIL,
    NEW_CATEGORY_REQUEST,
    NEW_CATEGORY_SUCCESS,
    NEW_CATEGORY_FAIL,
    UPDATE_CATEGORY_REQUEST,
    UPDATE_CATEGORY_SUCCESS,
    UPDATE_CATEGORY_FAIL,
    DELETE_CATEGORY_REQUEST,
    DELETE_CATEGORY_SUCCESS,
    DELETE_CATEGORY_FAIL,
    CLEAR_ERRORS
} from '../constants/categoryConstants';

export const getCategories = () => async (dispatch) => {
    try {
        dispatch({ type: ALL_CATEGORIES_REQUEST })
        const { data } = await axios.get(`${import.meta.env.VITE_API}/categories`)
        dispatch({
            type: ALL_CATEGORIES_SUCCESS,
            payload: data.categories
        })
    } catch (error) {
        dispatch({
            type: ALL_CATEGORIES_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const newCategory = (categoryData) => async (dispatch) => {
    try {
        dispatch({ type: NEW_CATEGORY_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true //correct
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/category/new`, categoryData, config)
        dispatch({
            type: NEW_CATEGORY_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: NEW_CATEGORY_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const updateCategory = (id, categoryData) => async (dispatch) => {
    try {
        dispatch({ type: UPDATE_CATEGORY_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true //correct
        }
        const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/category/${id}`, categoryData, config)
        dispatch({
            type: UPDATE_CATEGORY_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: UPDATE_CATEGORY_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const deleteCategory = (id) => async (dispatch) => {
    try {
        dispatch({ type: DELETE_CATEGORY_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true //correct
        }
        const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/category/${id}`, config)
        dispatch({
            type: DELETE_CATEGORY_SUCCESS,
            payload: data.success
        })
    } catch (error) {
        dispatch({
            type: DELETE_CATEGORY_FAIL,
            payload: error.response ? error.response.data.message : error.message
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
