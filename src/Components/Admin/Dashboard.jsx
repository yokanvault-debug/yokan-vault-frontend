import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import ProductSalesChart from './ProductSalesChart'
import UserSalesChart from './UserSalesChart'
import MonthlySalesChart from './MonthlySalesChart'

const API = import.meta.env.VITE_API
const peso = (n) => `\u20b1${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            const get = (path) => axios.get(`${API}${path}`, { withCredentials: true }).then((r) => r.data)
            try {
                const [products, orders, users] = await Promise.all([get('/admin/products'), get('/admin/orders/'), get('/admin/users')])
                if (cancelled) return
                const visibleOrders = orders.orders || []
                setStats({
                    products: products.products.length,
                    outOfStock: products.products.filter((p) => Number(p.stock) === 0).length,
                    orders: visibleOrders.length,
                    pendingCOD: visibleOrders.filter((order) =>
                        order.orderStatus !== 'Cancelled' &&
                        order.paymentInfo?.method === 'Cash on Delivery' &&
                        order.paymentInfo?.status === 'Pending'
                    ).length,
                    paidSales: orders.totalAmount,
                    users: users.users.length,
                })
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || 'Could not load the dashboard numbers')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const cards = stats ? [
        { label: 'Products', value: stats.products, to: '/admin/products', tone: 'navy' },
        { label: 'Order volume (all statuses)', value: stats.orders, to: '/admin/orders', tone: 'tan' },
        { label: 'Pending COD', value: stats.pendingCOD, to: '/admin/orders', tone: 'warn' },
        { label: 'Users', value: stats.users, to: '/admin/users', tone: 'navy' },
        { label: 'Out of stock', value: stats.outOfStock, to: '/admin/products', tone: 'warn' },
    ] : []

    return (
        <>
            <MetaData title={'Admin Dashboard'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>

                <div className="col-12 col-md-10">
                    <h1 className="my-4">Dashboard</h1>
                    {loading ? <Loader /> : error ? (
                        <div className="alert alert-danger" role="alert">{error}</div>
                    ) : stats && (
                        <div className="dash-body">
                            <div className="dash-total">
                                <span>Paid sales (confirmed collections)</span>
                                <b>{peso(stats.paidSales)}</b>
                            </div>

                            <div className="dash-stats">
                                {cards.map((c) => (
                                    <div key={c.label} className={`dash-stat ${c.tone}`}>
                                        <span>{c.label}</span>
                                        <b>{c.value}</b>
                                        <Link to={c.to}>View details <i className="fa fa-angle-right"></i></Link>
                                    </div>
                                ))}
                            </div>

                            <div className="dash-charts">
                                <div className="dash-chart-card"><h4>Paid item sales by product</h4><ProductSalesChart /></div>
                                <div className="dash-chart-card"><h4>Paid sales by customer</h4><UserSalesChart /></div>
                                <div className="dash-chart-card"><h4>Monthly paid sales</h4><MonthlySalesChart /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Dashboard
