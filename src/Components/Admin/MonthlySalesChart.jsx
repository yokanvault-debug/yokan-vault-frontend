import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getToken } from "../Utils/helpers";
import axios from "axios";
import Loader from '../Layout/Loader';

export default function MonthlySalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const monthlySales = useCallback(async (signal) => {
            const config = {
                withCredentials: true,
                headers: {

                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const params = {
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {})
            }
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/sales-per-month`, {
                ...config,
                params,
                signal
            })
            return Array.isArray(data.salesPerMonth) ? data.salesPerMonth : []
    }, [startDate, endDate])
    useEffect(() => {
        const controller = new AbortController()
        monthlySales(controller.signal)
            .then((results) => {
                if (!controller.signal.aborted) {
                    setSales(results)
                    setError('')
                    setLoading(false)
                }
            })
            .catch((requestError) => {
                if (!controller.signal.aborted) {
                    setError(requestError.response?.data?.message || 'Monthly paid sales could not be loaded.')
                    setLoading(false)
                }
            })
        return () => controller.abort()
    }, [monthlySales])

    return (
        <>
        <div className="form-inline mb-3">
            <label className="mr-2">From</label>
            <input type="date" className="form-control mr-3" value={startDate} max={endDate || undefined} onChange={(e) => { setLoading(true); setError(''); setStartDate(e.target.value) }} />
            <label className="mr-2">To</label>
            <input type="date" className="form-control mr-3" value={endDate} min={startDate || undefined} onChange={(e) => { setLoading(true); setError(''); setEndDate(e.target.value) }} />
            <button className="btn btn-outline-secondary" onClick={() => { setLoading(true); setError(''); setStartDate(''); setEndDate('') }}>Reset</button>
            {error && <span className="text-danger ml-3" role="alert">{error}</span>}
        </div>
        {loading ? <Loader /> : error ? null : sales.length === 0 ? (
            <p role="status">No paid sales for the selected date range.</p>
        ) : (
            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={sales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="total" stroke="#8884d8" />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                </LineChart>
            </ResponsiveContainer>
        )}
        </>
    );
}