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
    getCategories,
    newCategory,
    updateCategory,
    deleteCategory,
    clearErrors,
} from '../../actions/categoryActions'
import {
    NEW_CATEGORY_RESET,
    UPDATE_CATEGORY_RESET,
    DELETE_CATEGORY_RESET,
} from '../../constants/categoryConstants'

const CategoriesList = () => {
    const dispatch = useDispatch();
    const [selectedIds, setSelectedIds] = useState([])
    const { loading, error, categories } = useSelector(state => state.categories)
    const { error: createError, success } = useSelector(state => state.newCategory)
    const { error: modifyError, isDeleted, isUpdated } = useSelector(state => state.category)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [editingId, setEditingId] = useState(null)

    useEffect(() => {
        dispatch(getCategories())
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
            toast.success('Category created successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: NEW_CATEGORY_RESET })
            dispatch(getCategories())
        }

        if (isUpdated) {
            toast.success('Category updated successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: UPDATE_CATEGORY_RESET })
            dispatch(getCategories())
        }

        if (isDeleted) {
            toast.success('Category deleted successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: DELETE_CATEGORY_RESET })
            dispatch(getCategories())
        }
    }, [error, createError, modifyError, success, isUpdated, isDeleted, dispatch])

    const resetForm = () => {
        setName('')
        setDescription('')
        setEditingId(null)
    }

    const submitHandler = (e) => {
        e.preventDefault();
        const categoryData = { name, description }

        if (editingId) {
            dispatch(updateCategory(editingId, categoryData))
        } else {
            dispatch(newCategory(categoryData))
        }
        resetForm()
    }

    const editHandler = (row) => {
        setEditingId(row.id)
        setName(row.name)
        setDescription(row.description)
    }

    const deleteCategoryHandler = async (id) => {
        if (await confirmAction({ title: 'Delete this category?', text: 'This cannot be undone.', confirmText: 'Delete', danger: true })) {
            dispatch(deleteCategory(id))
        }
    }

    const bulkDeleteHandler = async () => {
        if (!selectedIds.length) return
        if (!await confirmAction({ title: `Delete ${selectedIds.length} categories?`, text: 'This cannot be undone.', confirmText: 'Delete', danger: true })) return
        const results = await Promise.allSettled(selectedIds.map((id) => axios.delete(`${import.meta.env.VITE_API}/admin/category/${id}`, { withCredentials: true })))
        const ok = results.filter((r) => r.status === 'fulfilled').length
        if (ok) toast.success(`${ok} categories deleted`, { position: 'bottom-right' })
        const failed = results.find((r) => r.status === 'rejected')
        if (failed) toast.error((failed.reason.response && failed.reason.response.data && failed.reason.response.data.message) || 'Some could not be deleted', { position: 'bottom-right' })
        setSelectedIds([])
        dispatch(getCategories())
    }

    const columns = [
        {
            field: 'id',
            headerName: 'Category ID',
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
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteCategoryHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = (categories || []).map(category => ({
        id: category._id,
        name: category.name,
        description: category.description,
    }));

    return (
        <>
            <MetaData title={'All Categories'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Categories</h1>

                        <form className="mb-4" onSubmit={submitHandler}>
                            <div className="form-row">
                                <div className="col-12 col-md-4 mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Category name"
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
                                        {editingId ? 'Update' : 'Add'} Category
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

export default CategoriesList
