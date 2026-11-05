import {
    ALL_CATEGORIES_REQUEST,
    ALL_CATEGORIES_SUCCESS,
    ALL_CATEGORIES_FAIL,
    NEW_CATEGORY_REQUEST,
    NEW_CATEGORY_SUCCESS,
    NEW_CATEGORY_RESET,
    NEW_CATEGORY_FAIL,
    UPDATE_CATEGORY_REQUEST,
    UPDATE_CATEGORY_SUCCESS,
    UPDATE_CATEGORY_RESET,
    UPDATE_CATEGORY_FAIL,
    DELETE_CATEGORY_REQUEST,
    DELETE_CATEGORY_SUCCESS,
    DELETE_CATEGORY_RESET,
    DELETE_CATEGORY_FAIL,
    CLEAR_ERRORS
} from '../constants/categoryConstants'

export const categoriesReducer = (state = { categories: [] }, action) => {
    switch (action.type) {
        case ALL_CATEGORIES_REQUEST:
            return {
                ...state,
                loading: true,
                categories: []
            }
        case ALL_CATEGORIES_SUCCESS:
            return {
                ...state,
                loading: false,
                categories: action.payload
            }
        case ALL_CATEGORIES_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case CLEAR_ERRORS:
            return {
                ...state,
                error: null
            }
        default:
            return state;
    }
}

export const newCategoryReducer = (state = { category: {} }, action) => {
    switch (action.type) {
        case NEW_CATEGORY_REQUEST:
            return {
                ...state,
                loading: true
            }
        case NEW_CATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                success: action.payload.success,
                category: action.payload.category
            }
        case NEW_CATEGORY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case NEW_CATEGORY_RESET:
            return {
                ...state,
                success: false
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

export const categoryReducer = (state = {}, action) => {
    switch (action.type) {
        case DELETE_CATEGORY_REQUEST:
        case UPDATE_CATEGORY_REQUEST:
            return {
                ...state,
                loading: true
            }
        case DELETE_CATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                isDeleted: action.payload
            }
        case UPDATE_CATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                isUpdated: action.payload
            }
        case DELETE_CATEGORY_FAIL:
        case UPDATE_CATEGORY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case DELETE_CATEGORY_RESET:
            return {
                ...state,
                isDeleted: false
            }
        case UPDATE_CATEGORY_RESET:
            return {
                ...state,
                isUpdated: false
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
