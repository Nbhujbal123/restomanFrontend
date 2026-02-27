import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaShoppingCart,
  FaClock,
  FaCheckCircle,
  FaUtensils,
  FaRupeeSign,
} from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

interface Order {
  _id: string;
  user?: {
    name: string;
    email: string;
  } | null;
  items: Array<{
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  orderStatus: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateTotal = (items: Order['items']) => {
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  }

useEffect(() => {
  const isAuthenticated = localStorage.getItem('adminAuthenticated');
  if (!isAuthenticated) navigate('/admin');
}, [navigate]);

useEffect(() => {
  const fetchOrders = async () => {
    console.log('Fetching orders from admin dashboard');
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      console.log('Fetch response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched orders data:', data);
        setLocalOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchOrders(); // initial fetch

  const interval = setInterval(fetchOrders, 10000); // poll every 10 seconds

  return () => clearInterval(interval); // cleanup
}, []);

const totalOrders = localOrders.length;
const totalRevenue = localOrders.reduce((sum, o) => sum + Number(o.total || calculateTotal(o.items)), 0);
const activeOrders = localOrders.filter(o => o.orderStatus !== 'DELIVERED').length;
const completedOrders = localOrders.filter(o => o.orderStatus === 'DELIVERED').length;

const updateOrderStatus = async (orderId: string, status: 'PENDING' | 'PREPARING' | 'OUT FOR DELIVERY' | 'DELIVERED') => {
  try {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      setLocalOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, orderStatus: status } : o))
      );
    } else {
      console.error('Failed to update order status');
    }
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-warning text-dark';
    case 'PREPARING':
      return 'bg-info text-white';
    case 'OUT FOR DELIVERY':
      return 'bg-primary text-white';
    case 'DELIVERED':
      return 'bg-success text-white';
    default:
      return 'bg-secondary';
  }
};

if (loading) {
  return (
    <AdminLayout title="Dashboard">
      <div className="container-fluid py-4 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </AdminLayout>
  );
}

return (
  <AdminLayout title="Dashboard">
    {/* 🔑 Main background color uses CSS variable for dynamic theme support */}
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', color: '#212529' }}>

      {/* Header */}
      <div className="mb-4">
        <h1 className="display-6 fw-bold text-primary" style={{ color: '#212529', margin: '20px 0px' , marginTop: '50px', fontSize: '2.5rem'}}>Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        {[
          { icon: <FaShoppingCart />, label: 'Total Orders', value: totalOrders, color: '#FF6B00' },
          { icon: <FaRupeeSign />, label: 'Revenue', value: `₹${totalRevenue.toFixed(2)}`, color: '#00B050' },
          { icon: <FaClock />, label: 'Active Orders', value: activeOrders, color: '#FF9500' },
          { icon: <FaCheckCircle />, label: 'Completed', value: completedOrders, color: '#17A2B8' },
        ].map((card, i) => (
          <div className="col-6 col-md-3" key={i}>
            <div
              className="card shadow-sm border-0 h-100 text-center"
              style={{
                // Background gradient retained for vibrant look
                background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`,
                color: 'white', // Text color remains white for contrast on gradient
                borderRadius: '12px',
              }}
            >
              <div className="card-body">
                <div className="fs-1 mb-3">{card.icon}</div>
                <h3 className="fw-bold mb-1">{card.value}</h3>
                <p className="mb-0">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Section */}
      <div
        className="card border-0 shadow-sm p-3"
        style={{
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            color: '#212529'
        }}>
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ borderBottom: '2px solid #dee2e6' }}
        >
          <h5 className="fw-semibold d-flex align-items-center">
            <FaUtensils className="me-2 text-warning" /> Recent Orders
          </h5>
          <span className="badge bg-warning text-dark">{localOrders.length} orders</span>
        </div>

        {/* Order Cards (Desktop View) */}
        <div className="d-none d-md-block">
          {/* Table Header */}
          <div className="d-flex align-items-center justify-content-between p-3 mb-2 rounded fw-bold" style={{ backgroundColor: '#e9ecef', border: '1px solid #dee2e6' }}>
            <div className="col-md-2">Order ID</div>
            <div className="col-md-2">Customer</div>
            <div className="col-md-3">Items</div>
            <div className="col-md-1">Total</div>
            <div className="col-md-2">Status</div>
            <div className="col-md-2">Actions</div>
          </div>
          {localOrders.map(order => (
            <div
              key={order._id}
              className="d-flex align-items-center justify-content-between p-3 mb-2 rounded"
              style={{
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #dee2e6'
              }}
            >
              <div className="col-md-2 fw-bold" style={{ color: '#212529' }}>{order._id.slice(-6)}</div>

              <div className="col-md-2">
                <div className="fw-semibold" style={{ color: '#212529' }}>{order.user?.name || 'Unknown'}</div>
                <small style={{ color: '#6c757d' }}>{order.user?.email || 'N/A'}</small>
              </div>

              <div className="col-md-3">
                {order.items.map(item => (
                  <div key={item.menuItemId} className="small" style={{ color: '#212529' }}>
                    {item.name} <span className="badge bg-light text-dark">x{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div
                className="col-md-1 fw-bold"
                style={{
                  // Revenue gradient retained
                  background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ₹{(order.total || calculateTotal(order.items)).toFixed(2)}
              </div>

              <div className="col-md-2">
                <span className={`badge ${getStatusBadgeClass(order.orderStatus)} px-3 py-2`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="col-md-2">
                <select
                  className="form-select form-select-sm shadow-sm"
                  style={{ borderRadius: '8px', backgroundColor: '#f8f9fa', color: '#212529' }}
                  value={order.orderStatus}
                  onChange={e =>
                    updateOrderStatus(order._id, e.target.value as 'PENDING' | 'PREPARING' | 'OUT FOR DELIVERY' | 'DELIVERED')
                  }
                >
                  <option value="PENDING">Pending</option>
                  <option value="PREPARING">Preparing</option>
                  <option value="OUT FOR DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View (Responsive) */}
        <div className="d-md-none">
          {localOrders.map(order => (
            <div
              key={order._id}
              className="p-3 mb-3 rounded shadow-sm"
              style={{
                  borderLeft: '5px solid orange',
                  backgroundColor: '#ffffff',
                  color: '#212529'
              }}
            >
              <div className="fw-bold mb-1" style={{ color: '#212529' }}>{order.user?.name || 'Unknown'}</div>
              <small style={{ color: '#6c757d' }}>{order.user?.email || 'N/A'}</small>
              <div className="mt-2">
                {order.items.map(item => (
                  <div key={item.menuItemId} className="d-flex align-items-center small" style={{ color: '#212529' }}>
                    <span className="me-2">{item.name}</span>
                    <span className="badge bg-light text-dark me-2">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span
                      className="fw-bold"
                      style={{
                          // Revenue gradient retained for consistency
                          background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                      }}>
                      ₹{(order.total || calculateTotal(order.items)).toFixed(2)}
                  </span>
                <span className={`badge ${getStatusBadgeClass(order.orderStatus)} px-3`}>
                  {order.orderStatus}
                </span>
              </div>
              <select
                className="form-select form-select-sm mt-2"
                value={order.orderStatus}
                onChange={e =>
                  updateOrderStatus(order._id, e.target.value as 'PENDING' | 'PREPARING' | 'OUT FOR DELIVERY' | 'DELIVERED')
                }
                style={{ backgroundColor: '#f8f9fa', color: '#212529' }}
              >
                <option value="PENDING">Pending</option>
                <option value="PREPARING">Preparing</option>
                <option value="OUT FOR DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default Dashboard;