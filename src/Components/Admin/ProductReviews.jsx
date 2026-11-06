import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { DataGrid } from '@mui/x-data-grid'
import { toast } from 'react-toastify'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

const normalizeReview = (review) => {
    const product = review.product
    const user = review.user
    return {
        ...review,
        id: review._id || review.id,
        productId: review.productId || (typeof product === 'object' ? product?._id : product),
        productName: review.productName || product?.name || 'Unknown product',
        reviewer: review.reviewer || review.name || user?.name || user?.email || 'Customer',
        comment: review.filteredComment ?? review.comment ?? '',
        originalComment: review.originalComment ?? review.rawComment ?? review.uncensoredComment ?? ''
    }
}

const ProductReviews = () => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchReviews = useCallback(async () => {
        const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/reviews`, {
            withCredentials: true
        })
        const reviews = Array.isArray(data) ? data : data.reviews
        return Array.isArray(reviews) ? reviews.map(normalizeReview) : []
    }, [])

    const loadReviews = useCallback(async () => {
        try {
            setReviews(await fetchReviews())
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reviews could not be loaded.', { position: 'bottom-right' })
        } finally {
            setLoading(false)
        }
    }, [fetchReviews])

    useEffect(() => {
        let active = true
        fetchReviews()
            .then(data => {
                if (active) setReviews(data)
            })
            .catch(error => {
                if (active) toast.error(error.response?.data?.message || 'Reviews could not be loaded.', { position: 'bottom-right' })
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [fetchReviews])

    const deleteReview = useCallback(async (review) => {
        const result = await Swal.fire({
            title: 'Delete review?',
            text: `Remove this review for ${review.productName}? This cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete review',
            confirmButtonColor: '#b4232f'
        })
        if (!result.isConfirmed) return

        try {
            await axios.delete(
                `${import.meta.env.VITE_API}/admin/reviews/${encodeURIComponent(review.productId)}/${encodeURIComponent(review.id)}`,
                { withCredentials: true }
            )
            toast.success('Review deleted.', { position: 'bottom-right' })
            await loadReviews()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Review could not be deleted.', { position: 'bottom-right' })
        }
    }, [loadReviews])

    const columns = useMemo(() => [
        { field: 'productName', headerName: 'Product', minWidth: 150, flex: 1 },
        { field: 'reviewer', headerName: 'Customer', minWidth: 150, flex: 1 },
        { field: 'rating', headerName: 'Rating', width: 90, valueFormatter: value => `${value}/5` },
        {
            field: 'comment',
            headerName: 'Filtered (storefront)',
            minWidth: 220,
            flex: 1,
            renderCell: ({ value }) => <div style={{ whiteSpace: 'normal', overflowWrap: 'anywhere', padding: '8px 0' }}>{value}</div>
        },
        {
            field: 'originalComment',
            headerName: 'Original (admin only)',
            minWidth: 220,
            flex: 1,
            renderCell: ({ value }) => <div style={{ whiteSpace: 'normal', overflowWrap: 'anywhere', padding: '8px 0' }}>{value}</div>
        },
        {
            field: 'actions',
            headerName: 'Delete',
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
                <button type="button" className="btn btn-danger btn-sm" aria-label="Delete review" onClick={() => deleteReview(row)}>
                    <i className="fa fa-trash" />
                </button>
            )
        }
    ], [deleteReview])

    const rows = reviews

    return (
        <>
            <MetaData title="Product Reviews" />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <div className="admin-orders-heading">
                        <div>
                            <span className="admin-orders-eyebrow">REVIEW MODERATION</span>
                            <h1>Customer Reviews</h1>
                            <p>Admins can compare the original review with its filtered storefront version.</p>
                        </div>
                    </div>
                    {loading ? <Loader /> : (
                        <div className="admin-orders-grid">
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                autoHeight
                                getRowHeight={() => 'auto'}
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                disableRowSelectionOnClick
                                showToolbar
                                sx={{
                                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f3ef', color: '#435266', fontWeight: 700 },
                                    '& .MuiDataGrid-row:hover': { backgroundColor: '#faf8f4' },
                                    '& .MuiDataGrid-cell': { borderColor: '#eef1f4' }
                                }}
                            />
                        </div>
                    )}
                    {!loading && reviews.length === 0 && <p className="mt-4 text-center">No Reviews.</p>}
                </div>
            </div>
        </>
    )
}

export default ProductReviews
