import { useState, useEffect, useCallback } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { getToken } from "../Utils/helpers";
import axios from "axios";
import Loader from '../Layout/Loader';

const UserSalesChart = () => {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const userSales = useCallback(async (signal) => {
            const config = {
                withCredentials: true,
                headers: {

                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/customer-sales`, { ...config, signal })
            return Array.isArray(data.customerSales) ? data.customerSales : []
    }, [])
    const barColors = ["#1f77b4", "#ff7f0e", "#2ca02c"]
    useEffect(() => {
        const controller = new AbortController()
        userSales(controller.signal)
            .then((results) => {
                if (!controller.signal.aborted) {
                    setSales(results)
                    setError('')
                    setLoading(false)
                }
            })
            .catch((requestError) => {
                if (!controller.signal.aborted) {
                    setError(requestError.response?.data?.message || 'Paid customer sales could not be loaded.')
                    setLoading(false)
                }
            })
        // allUsers()
        return () => controller.abort()
    }, [userSales])

    if (loading) return <Loader />
    if (error) return <p className="text-danger" role="alert">{error}</p>
    if (!sales.length) return <p role="status">No paid customer sales to display.</p>

    return (
        <ResponsiveContainer width="100%" height={380}>
            <BarChart
                data={sales}
            >
                <CartesianGrid strokeDasharray="2 2" />
                <XAxis dataKey="userDetails.name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="total" stroke="#000000"
                    strokeWidth={5} >
                    {
                        sales.map((item, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % 20]} />
                        ))
                    }
                </Bar>
            </BarChart>
        </ResponsiveContainer>


    );
}
export default UserSalesChart