import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DataGrid } from '@mui/x-data-grid'

import { confirmAction } from '../Utils/confirm'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

const API = import.meta.env.VITE_API
const errText = (err, fallback) => (err.response && err.response.data && err.response.data.message) || fallback

const ProductsList = () => {
    // 'active' = all products, 'deleted' = soft-deleted products with a restore button
    const [view, setView] = useState('active')
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState([])

    const loadProducts = useCallback(async (which) => {
        setLoading(true)
        try {
            const { data } = await axios.get(`${API}/admin/products`, { params: { deleted: which === 'deleted' }, withCredentials: true })
            setProducts(data.products)
        } catch (err) {
            toast.error(errText(err, 'Could not load products'), { position: 'bottom-right' })
        } finally {
            setLoading(false)
        }
    }, [])

    // the list reloads by itself whenever the view changes (and after every delete/restore below)
    useEffect(() => {
        loadProducts(view)
    }, [view, loadProducts])

    const deleteOne = async (id) => {
        if (!await confirmAction({ title: 'Delete this product?', text: 'You can restore it later from the deleted list.', confirmText: 'Delete', danger: true })) return
        try {
            await axios.delete(`${API}/admin/product/${id}`, { withCredentials: true })
            toast.success('Product deleted', { position: 'bottom-right' })
            setProducts((list) => list.filter((p) => p._id !== id))
        } catch (err) {
            toast.error(errText(err, 'Delete failed'), { position: 'bottom-right' })
        }
    }

    const bulkDelete = async () => {
        if (!selectedIds.length) return
        if (!await confirmAction({ title: `Delete ${selectedIds.length} product(s)?`, text: 'You can restore them later from the deleted list.', confirmText: 'Delete', danger: true })) return
        try {
            await axios.delete(`${API}/admin/products`, { data: { ids: selectedIds }, withCredentials: true })
            toast.success(`${selectedIds.length} product(s) deleted`, { position: 'bottom-right' })
            setProducts((list) => list.filter((p) => !selectedIds.includes(p._id)))
            setSelectedIds([])
        } catch (err) {
            toast.error(errText(err, 'Bulk delete failed'), { position: 'bottom-right' })
        }
    }

    const restore = async (ids) => {
        try {
            await axios.put(`${API}/admin/products/restore`, { ids }, { withCredentials: true })
            toast.success(`${ids.length} product(s) restored`, { position: 'bottom-right' })
            setProducts((list) => list.filter((p) => !ids.includes(p._id)))
            setSelectedIds([])
        } catch (err) {
            toast.error(errText(err, 'Restore failed'), { position: 'bottom-right' })
        }
    }

    const showingDeleted = view === 'deleted'

    const baseColumns = [
        {
            field: 'image',
            headerName: 'Image',
            width: 90,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <img
                    src={params.value}
                    alt={`${params.row.name} product`}
                    onError={(event) => { event.currentTarget.src = '/images/default-product.png' }}
                    style={{ width: 56, height: 56, objectFit: 'contain' }}
                />
            )
        },
        { field: 'id', headerName: 'Product ID', flex: 1, renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span> },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
        { field: 'price', headerName: 'Price', width: 120, align: 'right', headerAlign: 'right' },
        { field: 'stock', headerName: 'Stock', width: 100, align: 'right', headerAlign: 'right' },
    ]
    const columns = showingDeleted
        ? [
            ...baseColumns,
            { field: 'deletedOn', headerName: 'Deleted on', width: 130 },
            {
                field: 'actions', headerName: 'Actions', width: 130, sortable: false, filterable: false,
                renderCell: (params) => (
                    <button className="btn btn-success py-1 px-2" onClick={() => restore([params.id])}>
                        <i className="fa fa-undo"></i> Restore
                    </button>
                )
            }
        ]
        : [
            ...baseColumns,
            {
                field: 'actions', headerName: 'Actions', width: 120, sortable: false, filterable: false,
                renderCell: (params) => (
                    <>
                        <Link to={`/admin/product/${params.id}`} className="btn btn-primary py-1 px-2">
                            <i className="fa fa-pencil"></i>
                        </Link>
                        <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteOne(params.id)}>
                            <i className="fa fa-trash"></i>
                        </button>
                    </>
                )
            }
        ]

    const rows = products.map((product) => ({
        id: product._id,
        image: product.images?.[0]?.url || '/images/default-product.png',
        name: product.name,
        price: `₱${Number(product.price).toLocaleString()}`,
        stock: product.stock,
        deletedOn: product.deletedAt ? new Date(product.deletedAt).toLocaleDateString() : '',
    }))

    return (
        <>
            <MetaData title={showingDeleted ? 'Deleted Products' : 'All Products'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <div className="d-flex flex-wrap align-items-center justify-content-between my-5">
                        <h1 className="mb-3 mb-md-0">{showingDeleted ? 'Deleted Products' : 'All Products'}</h1>
                        {!showingDeleted && (
                            <Link to="/admin/product" className="btn btn-primary">
                                <i className="fa fa-plus mr-2"></i> Add Product
                            </Link>
                        )}
                    </div>

                    {!showingDeleted && (
                        <button className="btn btn-danger mb-3 mr-2" disabled={!selectedIds.length} onClick={bulkDelete}>
                            <i className="fa fa-trash"></i> Delete selected ({selectedIds.length})
                        </button>
                    )}
                    {showingDeleted && (
                        <button className="btn btn-success mb-3 mr-2" disabled={!selectedIds.length} onClick={() => restore(selectedIds)}>
                            <i className="fa fa-undo"></i> Restore selected ({selectedIds.length})
                        </button>
                    )}
                    <button className="btn btn-outline-secondary mb-3" onClick={() => {
                        setSelectedIds([])
                        setView(showingDeleted ? 'active' : 'deleted')
                    }}>
                        <i className={`fa ${showingDeleted ? 'fa-th-list' : 'fa-archive'}`}></i>{' '}
                        {showingDeleted ? 'View all products' : 'Deleted products'}
                    </button>

                    {loading ? <Loader /> : (
                        <div style={{ width: '100%' }}>
                            <DataGrid
                                key={view}
                                rows={rows}
                                columns={columns}
                                pageSizeOptions={[5, 10, 25]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                rowHeight={72}
                                checkboxSelection
                                onRowSelectionModelChange={(model) => setSelectedIds(Array.isArray(model) ? model : Array.from(model && model.ids ? model.ids : []))}
                                getRowId={(row) => row.id}
                                showToolbar
                                autoHeight
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProductsList
