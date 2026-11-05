import {
    PULL_BLINDBOX_REQUEST,
    PULL_BLINDBOX_SUCCESS,
    PULL_BLINDBOX_RESET,
    PULL_BLINDBOX_FAIL,
    CLEAR_ERRORS
} from '../constants/blindBoxConstants'

export const blindBoxReducer = (state = { item: null }, action) => {
    switch (action.type) {
        case PULL_BLINDBOX_REQUEST:
            return {
                ...state,
                loading: true
            }
        case PULL_BLINDBOX_SUCCESS:
            return {
                ...state,
                loading: false,
                item: action.payload.item,
                pull: action.payload.pull
            }
        case PULL_BLINDBOX_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case PULL_BLINDBOX_RESET:
            return {
                ...state,
                item: null,
                pull: null
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}
