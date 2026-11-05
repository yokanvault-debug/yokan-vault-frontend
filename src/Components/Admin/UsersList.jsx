import axios from 'axios'
import { confirmAction } from '../Utils/confirm'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import 'react-toastify/dist/ReactToastify.css';

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'

// import axios from 'axios';
// import { getToken, errMsg, successMsg } from '../Utils/helpers';
import { DataGrid, } from '@mui/x-data-grid'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useDispatch, useSelector } from 'react-redux'
import { allUsers, deleteUser, clearErrors } from '../../actions/userActions'
import { DELETE_USER_RESET } from '../../constants/userConstants'


const UsersList = () => {
    const dispatch = useDispatch();
    const [selectedIds, setSelectedIds] = useState([])
    const { loading, error, users } = useSelector(state => state.allUsers);
    const { isDeleted } = useSelector(state => state.user)
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [allUsers, setAllUsers] = useState([])
    // const [isDeleted, setIsDeleted] = useState('')
    let navigate = useNavigate();
    // const config = {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${getToken()}`
    //     }
    // }
    // const listUsers = async () => {
    //     try {

    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/users`, config)
    //         setAllUsers(data.users)
    //         setLoading(false)

    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }
    // const deleteUser = async (id) => {
    //     try {
    //         const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, config)
    //         setIsDeleted(data.success)
    //         setLoading(false)

    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }

    // useEffect(() => {
    //     listUsers();
    //     if (error) {
    //         errMsg(error);
    //         setError('')
    //     }
    //     if (isDeleted) {
    //         successMsg('User deleted successfully');
    //         navigate('/admin/users');

    //     }

    // }, [error, isDeleted,])

    useEffect(() => {
        dispatch(allUsers());

        if (error) {
            errMsg(error);
            dispatch(clearErrors())
        }

        if (isDeleted) {
            successMsg('User deleted successfully');
            // navigate('/admin/users');
            dispatch({ type: DELETE_USER_RESET })
        }

    }, [dispatch, error, isDeleted, navigate])


    const deleteUserHandler = async (id) => {
        const ok = await confirmAction({ title: 'Remove this user?', text: 'They will no longer be able to log in. Their orders are kept.', confirmText: 'Remove user', danger: true })
        if (!ok) return
        dispatch(deleteUser(id))
    }

    const bulkDeleteHandler = async () => {
        if (!selectedIds.length) return
        if (!await confirmAction({ title: `Delete ${selectedIds.length} users?`, text: 'This cannot be undone.', confirmText: 'Delete', danger: true })) return
        const results = await Promise.allSettled(selectedIds.map((id) => axios.delete(`${import.meta.env.VITE_API}/admin/user/${id}`, { withCredentials: true })))
        const ok = results.filter((r) => r.status === 'fulfilled').length
        if (ok) toast.success(`${ok} users deleted`, { position: 'bottom-right' })
        const failed = results.find((r) => r.status === 'rejected')
        if (failed) toast.error((failed.reason.response && failed.reason.response.data && failed.reason.response.data.message) || 'Some could not be deleted', { position: 'bottom-right' })
        setSelectedIds([])
        dispatch(allUsers())
    }

    const columns = [
        {
            field: 'id',
            headerName: 'User ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'name',
            headerName: 'Name',

            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (

                <>
                    {console.log(params)}
                    <Link to={`/admin/user/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteUserHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];
    const rows = users.map(user => ({
        id: user._id,
        name: user.name,

        email: user.email,
        role: user.role,
    }));

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <>
                        <h1 className="my-5">All Users</h1>
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

export default UsersList

