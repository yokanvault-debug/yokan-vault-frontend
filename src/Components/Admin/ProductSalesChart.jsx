import { useState, useEffect, useCallback } from 'react'
import { getToken } from "../Utils/helpers";
import axios from "axios";
import Loader from '../Layout/Loader';

import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ProductSalesChart() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const pieColors = [
        "#FF6633",
        "#FFB399",
        "#FF33FF",
        "#FFFF99",
        "#00B3E6",
        "#E6B333",
        "#3366E6",
        "#999966",
        "#809980",
        "#E6FF80",
        "#1AFF33",
        "#999933",
        "#FF3380",
        "#CCCC00",
        "#66E64D",
        "#4D80CC",
        "#FF4D4D",
        "#99E6E6",
        "#6666FF"
    ]
    // console.log(data)

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${percent}%`}
            </text>
        );
    };
    const productSales = useCallback(async (signal) => {
            const config = {
                withCredentials: true,
                headers: {

                    'Authorization': `Bearer ${getToken()}`
                }
            }

            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/product-sales`, { ...config, signal })
            return Array.isArray(data.totalPercentage) ? data.totalPercentage : []
    }, [])
    useEffect(() => {
        const controller = new AbortController()
        productSales(controller.signal)
            .then((results) => {
                if (!controller.signal.aborted) {
                    setSales(results)
                    setError('')
                    setLoading(false)
                }
            })
            .catch((requestError) => {
                if (!controller.signal.aborted) {
                    setError(requestError.response?.data?.message || 'Paid product sales could not be loaded.')
                    setLoading(false)
                }
            })
        return () => controller.abort()
    }, [productSales])


    if (loading) return <Loader />
    if (error) return <p className="text-danger" role="alert">{error}</p>
    if (!sales.length) return <p role="status">No paid product sales to display.</p>

    return (
        <ResponsiveContainer width="100%" height={440}>
            <PieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
                {/* <Pie data={data} dataKey="percent" nameKey="name" cx="34%" cy="50%" outerRadius={50} fill="#8884d8" /> */}
                <Pie
                    dataKey="percent"
                    nameKey="name"
                    isAnimationActive={true}
                    data={sales}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    fill="#8884d8"
                    label={renderCustomizedLabel}
                    labelLine={false}
                // label
                >  {
                        sales.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)
                    }
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ width: '38%', lineHeight: '1.7' }} />
            </PieChart>
        </ResponsiveContainer>


    );
}