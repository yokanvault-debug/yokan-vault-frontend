import axios from 'axios'
import { confirmAction } from '../Utils/confirm'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
// import { getToken } from '../Utils/helpers'
// import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { allOrders, clearErrors, deleteOrder } from '../../actions/orderActions'
import { DELETE_ORDER_RESET } from '../../constants/orderConstants'


const OrdersList = () => {
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [allOrders, setAllOrders] = useState([])
    // const [isDeleted, setIsDeleted] = useState(false)
    const dispatch = useDispatch();
    const [selectedIds, setSelectedIds] = useState([])
    const { loading, error, orders } = useSelector(state => state.allOrders);
    const { isDeleted } = useSelector(state => state.order)
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    // const listOrders = async () => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, config)
    //         setAllOrders(data.orders)
    //         setLoading(false)
    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }
    // const deleteOrder = async (id) => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, config)
    //         setIsDeleted(data.success)
    //         setLoading(false)
    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }
    // useEffect(() => {
    //     listOrders()
    //     if (error) {
    //         errMsg(error)
    //         setError('')
    //     }
    //     if (isDeleted) {
    //         successMsg('Order deleted successfully');
    //         navigate('/admin/orders');
    //     }
    // }, [error, isDeleted])

    useEffect(() => {
        dispatch(allOrders())
        if (error) {
            errMsg(error)
            dispatch(clearErrors())

        }
        if (isDeleted) {
            successMsg('Order deleted successfully');
            dispatch({ type: DELETE_ORDER_RESET })
            // navigate('/admin/orders');
        }
    }, [dispatch, error, isDeleted])
    const deleteOrderHandler = (id) => {
        dispatch(deleteOrder(id))
    }

    const bulkDeleteHandler = async () => {
        if (!selectedIds.length) return
        if (!await confirmAction({ title: `Delete ${selectedIds.length} orders?`, text: 'This cannot be undone.', confirmText: 'Delete', danger: true })) return
        const results = await Promise.allSettled(selectedIds.map((id) => axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, { withCredentials: true })))
        const ok = results.filter((r) => r.status === 'fulfilled').length
        if (ok) toast.success(`${ok} orders deleted`, { position: 'bottom-right' })
        const failed = results.find((r) => r.status === 'rejected')
        if (failed) toast.error((failed.reason.response && failed.reason.response.data && failed.reason.response.data.message) || 'Some could not be deleted', { position: 'bottom-right' })
        setSelectedIds([])
        dispatch(allOrders())
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'numofItems',
            headerName: 'Number of Items',

            width: 140,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'amount',
            headerName: 'Order total',
            width: 150,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => (
                <span className={`admin-order-status admin-order-status--${String(params.value || '').toLowerCase()}`}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'payment',
            headerName: 'Payment',
            width: 180,
            renderCell: (params) => (
                <div className="admin-order-payment" title={`${params.row.paymentMethod} — ${params.row.paymentStatus}`}>
                    <span className="admin-order-payment__method">{params.row.paymentMethod}</span>
                    <span className={`admin-order-status admin-order-status--payment-${String(params.row.paymentStatus || '').toLowerCase()}`}>
                        {params.row.paymentStatus}
                    </span>
                </div>
            )
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 118,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="admin-order-actions">
                    <Link to={`/admin/order/${params.id}`} className="admin-order-action admin-order-action--view" aria-label="View order" title="View order">
                        <i className="fa fa-eye"></i>
                    </Link>
                    <button type="button" className="admin-order-action admin-order-action--delete" aria-label="Delete order" title="Delete order" onClick={() => deleteOrderHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];
    const rows = orders.map(order => ({
        id: order._id,
        numofItems: order.orderItems.length,
        amount: `₱${Number(order.totalPrice || 0).toFixed(2)}`,
        status: order.orderStatus,
        paymentMethod: order.paymentInfo?.method || 'Cash on Delivery',
        paymentStatus: order.paymentInfo?.status || 'Pending',
    }));

    return (
        <>
            <MetaData title={'All Orders'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <div className="admin-orders-heading">
                            <div>
                                <span className="admin-orders-eyebrow">ORDER MANAGEMENT</span>
                                <h1>All Orders</h1>
                                <p>Review order status and payment at a glance.</p>
                            </div>
                            <button className="admin-orders-bulk-delete" disabled={!selectedIds.length} onClick={bulkDeleteHandler}>
                            <i className="fa fa-trash"></i> Delete selected ({selectedIds.length})
                            </button>
                        </div>

                        {loading ? <Loader /> : (
                            <div className="admin-orders-grid">
                                <DataGrid
                                    rows={rows}
                                    checkboxSelection
                                    onRowSelectionModelChange={(model) => setSelectedIds(Array.isArray(model) ? model : Array.from(model && model.ids ? model.ids : []))}
                                    columns={columns}

                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    getRowId={(row) => row.id}
                                    showToolbar
                                    sx={{
                                        border: 0,
                                        color: '#303e4b',
                                        fontFamily: '"DM Sans", sans-serif',
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f5f7f9',
                                            borderBottom: '1px solid #e8edf1',
                                            color: '#707477',
                                            fontSize: '0.76rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em'
                                        },
                                        '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus': { outline: 'none' },
                                        '& .MuiDataGrid-row': { minHeight: '58px !important' },
                                        '& .MuiDataGrid-row:hover': { backgroundColor: '#faf8f4' },
                                        '& .MuiDataGrid-cell': { borderColor: '#eef1f4', fontSize: '0.86rem' },
                                        '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e8edf1' },
                                        '& .MuiDataGrid-toolbarContainer': { padding: '12px 16px', borderBottom: '1px solid #eef1f4' }
                                    }}
                                />
                            </div>
                        )}
                    </>
                </div>
            </div>
        </>
    )
}

export default OrdersList