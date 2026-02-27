import React, { useState, useEffect } from 'react'
import { FaUser, FaShoppingBag, FaHistory, FaMapMarkerAlt, FaPhone, FaEnvelope, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface Order {
  _id: string
  user: string
  items: Array<{
    menuItemId: number
    name: string
    price: number
    quantity: number
  }>
  total: number
  orderStatus: string
  createdAt: string 
}

interface Bill {
  _id: string
  customerId: string
  customerName: string
  items: Array<{
    productId: number
    name: string
    price: number
    quantity: number
  }>
  totalAmount: number
  status: string
  createdAt: string
}

   

const Profile: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [paidBills, setPaidBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  const calculateTotal = (items: Order['items']) => {
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  }

  // Removed userData from localStorage 'userInfo' as it's not used in login/signup

  useEffect(() => {
    const fetchData = () => {
      const userId = user?.id
      console.log('Fetching data for user:', userId)
      if (userId) {
        // Fetch orders
        fetch(`${import.meta.env.VITE_API_URL}/api/orders/user/${userId}`)
          .then(res => res.json())
          .then(data => {
            console.log('Fetched orders data:', data)
            setOrders(data)
          })
          .catch(err => console.error('Error fetching orders:', err))

        // Fetch paid bills
        fetch(`${import.meta.env.VITE_API_URL}/api/bills/paid/${userId}`)
          .then(res => res.json())
          .then(data => {
            console.log('Fetched paid bills data:', data)
            setPaidBills(data)
          })
          .catch(err => console.error('Error fetching paid bills:', err))
          .finally(() => setLoading(false))
      } else {
        console.log('No user found, skipping fetch')
        setLoading(false)
      }
    }

    fetchData() // initial fetch

    const interval = setInterval(fetchData, 10000) // poll every 10 seconds

    return () => clearInterval(interval) // cleanup
  }, [user])

  const currentOrders = orders.filter(order => order.orderStatus !== 'DELIVERED')
  const previousOrders = orders.filter(order => order.orderStatus === 'DELIVERED')
  const historyItems = [
    ...previousOrders.map(order => ({ type: 'order', data: order })),
    ...paidBills.map(bill => ({ type: 'bill', data: bill }))
  ].sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime())
  console.log('Total orders:', orders.length, 'Current orders:', currentOrders.length, 'Previous orders:', previousOrders.length, 'Paid bills:', paidBills.length, 'History items:', historyItems.length)

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5" style={{ background: 'linear-gradient(to bottom, #fffaf4, #fff3e0)', minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          <h1 className="display-5 fw-bold text-center mb-5" style={{
            background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            My Profile
          </h1>
        </div>
      </div>

      {/* User Info Card */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <div className="card-header bg-primary text-white text-center py-4">
              <FaUser size={48} className="mb-3" />
              <h4 className="mb-0">Personal Information</h4>
            </div>
            <div className="card-body p-4">
              {user ? (
                <>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 bg-light rounded-3">
                        <FaUser className="text-primary me-3" size={20} />
                        <div>
                          <small className="text-muted d-block">Name</small>
                          <strong>{user.name}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 bg-light rounded-3">
                        <FaEnvelope className="text-primary me-3" size={20} />
                        <div>
                          <small className="text-muted d-block">Email</small>
                          <strong>{user.email}</strong>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center p-3 bg-light rounded-3">
                        <FaPhone className="text-primary me-3" size={20} />
                        <div>
                          <small className="text-muted d-block">Phone</small>
                          <strong>{user.phone}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      className="btn btn-outline-danger d-flex align-items-center gap-2"
                      onClick={() => {
                        logout()
                        navigate('/')
                      }}
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No user information available. Please place an order first.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Orders */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto">
          <h3 className="fw-bold mb-4 text-center">
            <FaShoppingBag className="me-2 text-primary" />
            Current Orders
          </h3>
          {currentOrders.length === 0 ? (
            <div className="text-center py-5">
              <FaShoppingBag size={64} className="text-muted mb-3" />
              <p className="text-muted">No current orders</p>
            </div>
          ) : (
            <div className="row g-4">
              {currentOrders.map(order => (
                <div key={order._id} className="col-12">
                  <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                    <div className="card-header bg-warning text-dark">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">Order #{order._id.slice(-6)}</h6>
                        <span className="badge bg-light text-dark">{order.orderStatus}</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <small className="text-muted">Items:</small>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="d-flex justify-content-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total:</span>
                        <span>₹{(order.total || calculateTotal(order.items)).toFixed(2)}</span>
                      </div>
                      <small className="text-muted">
                        Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Previous Orders */}
      <div className="row">
        <div className="col-12">
          <h3 className="fw-bold mb-4 text-center">
            <FaHistory className="me-2 text-success" />
            Order History
          </h3>
          {historyItems.length === 0 ? (
            <div className="text-center py-5">
              <FaHistory size={64} className="text-muted mb-3" />
              <p className="text-muted">No order history</p>
            </div>
          ) : (
            <div className="row g-4 justify-content-center">
              {historyItems.map(item => {
                if (item.type === 'order') {
                  const order = item.data as Order;
                  return (
                    <div key={order._id} className="col-lg-4">
                      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                        <div className="card-header bg-success text-white">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Order #{order._id.slice(-6)}</h6>
                            <span className="badge bg-light text-success">Delivered</span>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <small className="text-muted">Items: {order.items.length}</small>
                            <div className="mt-2">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="small text-truncate">
                                  {item.name} x{item.quantity}
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="small text-muted">+{order.items.length - 2} more items</div>
                              )}
                            </div>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span>₹{(order.total || calculateTotal(order.items)).toFixed(2)}</span>
                          </div>
                          <small className="text-muted">
                            Delivered on: {new Date(order.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const bill = item.data as Bill;
                  return (
                    <div key={bill._id} className="col-lg-4">
                      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                        <div className="card-header bg-primary text-white">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">Bill #{bill._id.slice(-6)}</h6>
                            <span className="badge bg-light text-primary">Paid</span>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="mb-3">
                            <small className="text-muted">Items: {bill.items.length}</small>
                            <div className="mt-2">
                              {bill.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="small text-truncate">
                                  {item.name} x{item.quantity}
                                </div>
                              ))}
                              {bill.items.length > 2 && (
                                <div className="small text-muted">+{bill.items.length - 2} more items</div>
                              )}
                            </div>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span>₹{bill.totalAmount.toFixed(2)}</span>
                          </div>
                          <small className="text-muted">
                            Paid on: {new Date(bill.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
