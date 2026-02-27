import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFilePdf, FaFileExcel } from 'react-icons/fa'
import AdminLayout from '../../components/AdminLayout'

interface Order {
  _id: string
  user?: { name: string; email: string } | null
  items: Array<{ menuItemId: number; name: string; price: number; quantity: number }>
  total: number
  orderStatus: string
  createdAt: string
}

const Reports: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: '2020-01-01',
    end: '2030-12-31'
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin')
    }
  }, [navigate])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`)
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    return orderDate >= dateRange.start && orderDate <= dateRange.end
  })

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const totalOrders = filteredOrders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleExport = (format: 'pdf' | 'excel') => {
    const data = {
      dateRange,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      orders: filteredOrders
    }

    if (format === 'pdf') {
      console.log('Exporting PDF:', data)
      alert('PDF export functionality would be implemented here')
    } else {
      console.log('Exporting Excel:', data)
      alert('Excel export functionality would be implemented here')
    }
  }

  return (
    <AdminLayout title="Sales Reports">
      <div className="container-fluid " style={{
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        
      }}>
        <div className="row mb-4" style={{ marginTop: '50px' }}>
          <div className="col-12">
            <h1 className="display-5 fw-bold text-primary mb-4" style={{marginTop: '20px', fontSize: '2.5rem'}}>
              Sales Reports
            </h1>
          </div>
        </div>

        {/* Date Range Filter */}
        



        {/* Summary Statistics */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center">
                <h3 className="fw-bold text-primary">{totalOrders}</h3>
                <p className="text-muted mb-0">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center">
                <h3 className="fw-bold text-success">
                  ₹{totalRevenue.toFixed(2)}
                </h3>
                <p className="text-muted mb-0">Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-body text-center">
                <h3 className="fw-bold text-info">
                  ₹{averageOrderValue.toFixed(2)}
                </h3>
                <p className="text-muted mb-0">Average Order Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Report */}
        <div className="row">
  <div className="col-12">
    <div className="card shadow-sm border-0">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-semibold">Detailed Sales Report</h5>
        <span className="badge bg-light text-dark fw-semibold">
          {filteredOrders.length} Orders
        </span>
      </div>

      <div className="card-body">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">
              No orders found for the selected date range.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="table-responsive d-none d-md-block">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td className="fw-bold">{order._id.slice(-6)}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div>
                          <div className="fw-bold">{order.user?.name || 'Unknown'}</div>
                          <small className="text-muted">{order.user?.email || 'N/A'}</small>
                        </div>
                      </td>
                      <td>
                        {order.items.map(item => (
                          <div key={item.menuItemId} className="small">
                            {item.name} <span className="text-muted">x{item.quantity}</span>
                          </div>
                        ))}
                      </td>
                      <td className="fw-bold text-success">
                        ₹{(order.total || 0).toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-success'
                              : order.orderStatus === 'Preparing'
                              ? 'bg-info text-white'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="d-md-none">
              {filteredOrders.map(order => (
                <div
                  key={order._id}
                  className="p-3 mb-3 bg-white rounded shadow-sm"
                  style={{
                    borderLeft: '5px solid #0d6efd',
                  }}
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold text-dark">{order.user?.name || 'Unknown'}</div>
                      <small className="text-muted">{order.user?.email || 'N/A'}</small>
                    </div>
                    <div>
                      <span
                        className={`badge ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-success'
                            : order.orderStatus === 'Preparing'
                            ? 'bg-info text-white'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 small text-muted">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </div>

                  <div className="mt-2">
                    {order.items.map(item => (
                      <div key={item.menuItemId} className="d-flex align-items-center small">
                        <span className="me-2 text-dark">{item.name}</span>
                        <span className="badge bg-light text-dark me-2">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-success">
                      ₹{(order.total || 0).toFixed(2)}
                    </span>
                    <span className="text-muted small">#{order._id.slice(-6)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
</div>

      </div>
    </AdminLayout>
  )
}

export default Reports
