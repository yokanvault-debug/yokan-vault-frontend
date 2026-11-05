import axios from 'axios';
import {
    PULL_BLINDBOX_REQUEST,
    PULL_BLINDBOX_SUCCESS,
    PULL_BLINDBOX_FAIL,
    CLEAR_ERRORS
} from '../constants/blindBoxConstants';

export const pullBlindBox = (productId) => async (dispatch) => {
    try {
        dispatch({ type: PULL_BLINDBOX_REQUEST })
        const config = {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true //correct
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API}/blindbox/${productId}/pull`, {}, config)
        dispatch({
            type: PULL_BLINDBOX_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: PULL_BLINDBOX_FAIL,
            payload: error.response && error.response.data.message ? error.response.data.message : 'Please try again in a moment.'
        })
    }
}

export const clearErrors = () => async (dispatch) => {
    dispatch({
        type: CLEAR_ERRORS
    })
}
