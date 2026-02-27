import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEye,
  FaCheck,
  FaCreditCard,
} from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

interface Bill {
  _id: string;
  customerId: {
    name: string;
    email: string;
  };
  customerName: string;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  status: 'UNPAID' | 'PAID';
  createdAt: string;
}

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAuthenticated) navigate('/admin');
  }, [navigate]);

  useEffect(() => {
    const fetchBills = async () => {
      console.log('Frontend: Fetching unpaid bills...');
      try {
        const response = await fetch('http://localhost:5000/api/bills/unpaid');
        console.log('Frontend: API response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Frontend: Received bills data:', data);
          setBills(data);
        } else {
          console.error('Frontend: Failed to fetch bills');
        }
      } catch (error) {
        console.error('Frontend: Error fetching bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

  const handleView = (bill: Bill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const handleMarkAsPaid = async (billId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bills/pay/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        // Remove the paid bill from the list since we only show unpaid bills
        setBills(prev => prev.filter(b => b._id !== billId));
      } else {
        console.error('Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'PAID' ? 'bg-success text-white' : 'bg-warning text-dark';
  };

  if (loading) {
    return (
      <AdminLayout title="Billing & Payments">
        <div className="container-fluid py-4 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'var(--color-bg-secondary)', minHeight: '100vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Billing & Payments">
      <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', color: '#212529', marginTop: '50px'}}>
        <div className="mb-4">
          <h1 className="display-6 fw-bold text-primary" style={{ color: '#212529' }}>Billing & Payments</h1>
        </div>

        <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '12px', backgroundColor: '#ffffff', color: '#212529' }}>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ borderBottom: '2px solid #dee2e6' }}>
            <h5 className="fw-semibold d-flex align-items-center">
              <FaCreditCard className="me-2 text-warning" /> Bills
            </h5>
            <span className="badge bg-warning text-dark">{bills.length} bills</span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(bill => (
                  <tr key={bill._id}>
                    <td>{bill.customerName}</td>
                    <td>₹{bill.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(bill.status)} px-3 py-2`}>
                        {bill.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleView(bill)}
                      >
                        <FaEye /> View
                      </button>
                      {bill.status === 'UNPAID' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleMarkAsPaid(bill._id)}
                        >
                          <FaCheck /> Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for viewing bill details */}
        {showModal && selectedBill && (
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{marginTop: '100px'}}>
                <div className="modal-header">
                  <h5 className="modal-title">Bill Details - {selectedBill.customerName}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <h6>Ordered Items:</h6>
                  <ul className="list-group">
                    {selectedBill.items.map((item, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {item.name} (x{item.quantity})
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <hr />
                  {(() => {
                    const subtotal = selectedBill.subtotal || selectedBill.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                    const deliveryFee = selectedBill.deliveryFee || 2.99;
                    const tax = selectedBill.tax || subtotal * 0.08;
                    const total = subtotal + deliveryFee + tax;
                    return (
                      <>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal:</span>
                          <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Delivery Fee:</span>
                          <span>₹{deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Tax:</span>
                          <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <strong>Total:</strong>
                          <strong>₹{total.toFixed(2)}</strong>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Billing;