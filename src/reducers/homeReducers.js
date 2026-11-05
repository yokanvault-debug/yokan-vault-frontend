import {
    TOP_RATED_PRODUCTS_REQUEST,
    TOP_RATED_PRODUCTS_SUCCESS,
    TOP_RATED_PRODUCTS_FAIL,
    LATEST_PRODUCTS_REQUEST,
    LATEST_PRODUCTS_SUCCESS,
    LATEST_PRODUCTS_FAIL,
    CLEAR_ERRORS
} from '../constants/homeConstants'

export const topRatedProductsReducer = (state = { products: [] }, action) => {
    switch (action.type) {
        case TOP_RATED_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true
            }
        case TOP_RATED_PRODUCTS_SUCCESS:
            return {
                ...state,
                loading: false,
                products: action.payload
            }
        case TOP_RATED_PRODUCTS_FAIL:
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

// keeps every page loaded so far, so scrolling only ever adds products
export const latestProductsReducer = (state = { products: [], page: 0, hasMore: true }, action) => {
    switch (action.type) {
        case LATEST_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true
            }
        case LATEST_PRODUCTS_SUCCESS: {
            const kept = action.payload.page === 1 ? [] : state.products
            const known = new Set(kept.map(p => p._id))
            return {
                ...state,
                loading: false,
                error: null,
                products: [...kept, ...action.payload.products.filter(p => !known.has(p._id))],
                page: action.payload.page,
                hasMore: action.payload.hasMore
            }
        }
        case LATEST_PRODUCTS_FAIL:
            return {
                ...state,
                loading: false,
                hasMore: false,
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
