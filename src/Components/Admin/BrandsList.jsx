import axios from 'axios'
import { confirmAction } from '../Utils/confirm'
import React, { useEffect, useState } from 'react'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import {
    getBrands,
    newBrand,
    updateBrand,
    deleteBrand,
    clearErrors,
} from '../../actions/brandActions'
import {
    NEW_BRAND_RESET,
    UPDATE_BRAND_RESET,
    DELETE_BRAND_RESET,
} from '../../constants/brandConstants'

const BrandsList = () => {
    const dispatch = useDispatch();
    const [selectedIds, setSelectedIds] = useState([])
    const { loading, error, brands } = useSelector(state => state.brands)
    const { error: createError, success } = useSelector(state => state.newBrand)
    const { error: modifyError, isDeleted, isUpdated } = useSelector(state => state.brand)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [editingId, setEditingId] = useState(null)

    useEffect(() => {
        dispatch(getBrands())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (createError) {
            toast.error(createError, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (modifyError) {
            toast.error(modifyError, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (success) {
            toast.success('Brand created successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: NEW_BRAND_RESET })
            dispatch(getBrands())
        }

        if (isUpdated) {
            toast.success('Brand updated successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: UPDATE_BRAND_RESET })
            dispatch(getBrands())
        }

        if (isDeleted) {
            toast.success('Brand deleted successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: DELETE_BRAND_RESET })
            dispatch(getBrands())
        }
    }, [error, createError, modifyError, success, isUpdated, isDeleted, dispatch])

    const resetForm = () => {
        setName('')
        setDescription('')
        setEditingId(null)
    }

    const submitHandler = (e) => {
        e.preventDefault();
        const brandData = { name, description }

        if (editingId) {
            dispatch(updateBrand(editingId, brandData))
        } else {
            dispatch(newBrand(brandData))
        }
        resetForm()
    }

    const editHandler = (row) => {
        setEditingId(row.id)
        setName(row.name)
        setDescription(row.description)
    }

    const deleteBrandHandler = async (id) => {
        if (await confirmAction({ title: 'Delete this brand?', text: 'This cannot be undone.', confirmText: 'Delete', danger: true })) {
            dispatch(deleteBrand(id))
        }
    }

    const bulkDeleteHandler = async () => {
        if (!selectedIds.length) return
        if (!await confirmAction({ title: `Delete ${selectedIds.length} brands?`, text: 'This cannot be undone.', confirmText: 'Delete', danger: true })) return
        const results = await Promise.allSettled(selectedIds.map((id) => axios.delete(`${import.meta.env.VITE_API}/admin/brand/${id}`, { withCredentials: true })))
        const ok = results.filter((r) => r.status === 'fulfilled').length
        if (ok) toast.success(`${ok} brands deleted`, { position: 'bottom-right' })
        const failed = results.find((r) => r.status === 'rejected')
        if (failed) toast.error((failed.reason.response && failed.reason.response.data && failed.reason.response.data.message) || 'Some could not be deleted', { position: 'bottom-right' })
        setSelectedIds([])
        dispatch(getBrands())
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Brand ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
        },
        {
            field: 'description',
            headerName: 'Description',
            flex: 2,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <button className="btn btn-primary py-1 px-2" onClick={() => editHandler(params.row)}>
                        <i className="fa fa-pencil"></i>
                    </button>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteBrandHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = (brands || []).map(brand => ({
        id: brand._id,
        name: brand.name,
        description: brand.description,
    }));

    return (
        <>
            <MetaData title={'All Brands'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Brands</h1>

                        <form className="mb-4" onSubmit={submitHandler}>
                            <div className="form-row">
                                <div className="col-12 col-md-4 mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Brand name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-5 mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Description (optional)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="col-12 col-md-3 mb-2">
                                    <button type="submit" className="btn btn-primary mr-2">
                                        {editingId ? 'Update' : 'Add'} Brand
                                    </button>
                                    {editingId && (
                                        <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                                    )}
                                </div>
                            </div>
                        </form>

                        <button className="btn btn-danger mb-3" disabled={!selectedIds.length} onClick={bulkDeleteHandler}>
                            <i className="fa fa-trash"></i> Delete selected ({selectedIds.length})
                        </button>

                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    checkboxSelection
                                    onRowSelectionModelChange={(model) => setSelectedIds(Array.isArray(model) ? model : Array.from(model && model.ids ? model.ids : []))}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 25]}
                                                                        getRowId={(row) => row.id}
                                    showToolbar
                                />
                            </div>
                        )}

                    </>
                </div>
            </div>

        </>
    )
}

export default BrandsList
