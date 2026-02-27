import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { FaPlus, FaMinus, FaShoppingCart, FaArrowLeft, FaTrash } from 'react-icons/fa'
 
const Cart: React.FC = () => {
  const { cart, updateQuantity, getTotalPrice, clearCart, removeFromCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  console.log('Cart component rendered, cart length:', cart.length)

  const handleQuantityChange = (id: number, newQty: number) => {
    if (newQty <= 0) removeFromCart(id)
    else updateQuantity(id, newQty)
  }

  const placeOrder = async () => {
    if (!user) {
      alert('Please login to place order.')
      return
    }

    const orderPayload = {
      user: user.id,
      items: cart.map(item => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount: getTotalPrice() + (getTotalPrice() * 0.05)
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      })

      if (response.ok) {
        alert('Order placed successfully!')
        clearCart()
        navigate('/profile')
      } else {
        alert('Failed to place order. Please try again.')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    }
  }

 
  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <FaShoppingCart className="text-muted fs-1 mb-4" />
        <h2 className="fw-bold mb-3">Your cart is empty</h2>
        <p className="text-muted mb-4">Add something tasty from our menu!</p>
        <Link
          to="/category"
          className="btn rounded-pill px-4 text-white text-decoration-none"
          style={{
            background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
            border: 'none'
          }}
        >
          Browse Menu
        </Link>
      </div>
    )
  }
 
  return (
    <div className="container py-5" style={{ overflowX: 'hidden' }}>
      {/* 🧭 Header */}
      <div className="d-flex align-items-center mb-4">
        <Link
          to="/menu"
          className="btn btn-outline-secondary me-3 rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '40px', height: '40px' }}
        >
          <FaArrowLeft />
        </Link>
        <h1
          className="h4 fw-bold mb-0"
          style={{
            background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Your Order
        </h1>
      </div>
 
      <div className="row g-4">
        {/* 🧺 Cart Items */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-3 p-md-4" style={{ overflowX: 'hidden' }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center justify-content-between border-bottom py-3 flex-wrap flex-md-nowrap"
                  style={{ gap: '10px', overflow: 'hidden' }}
                >
                  {/* 🖼️ Image + Details */}
                  <div
                    className="d-flex align-items-center flex-grow-1"
                    style={{ minWidth: '180px', overflow: 'hidden', flexShrink: 1 }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rounded"
                      style={{
                        width: '55px',
                        height: '55px',
                        objectFit: 'cover',
                        border: '2px solid #f3f3f3',
                        flexShrink: 0
                      }}
                    />
                    <div className="ms-3 text-truncate" style={{ maxWidth: '120px' }}>
                      <h6 className="fw-semibold mb-0 text-truncate" style={{ fontSize: '15px' }}>
                        {item.name}
                      </h6>
                      {/* <small className="text-muted" style={{ fontSize: '12px' }}>
                        Spice: {item.spiceLevel || 'Medium'}
                      </small> */}
                    </div>
                  </div>
 
                  {/* 🔢 Quantity Control */}
                  <div
                    className="d-flex align-items-center justify-content-center rounded-pill"
                    style={{
                      background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                      border: 'none',
                      padding: '4px 10px',
                      minWidth: '80px',
                      flexShrink: 0
                    }}
                  >
                    <button
                      className="btn btn-sm text-white fw-bold p-0"
                      style={{ background: 'transparent', border: 'none', fontSize: '12px' }}
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <FaMinus />
                    </button>
                    <span
                      className="fw-bold text-white mx-2"
                      style={{ fontSize: '14px', minWidth: '15px', textAlign: 'center' }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      className="btn btn-sm text-white fw-bold p-0"
                      style={{ background: 'transparent', border: 'none', fontSize: '12px' }}
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>
 
                  {/* 💰 Price */}
                  <div
                    className="fw-bold mx-2 text-nowrap"
                    style={{
                      color: '#FF6A00',
                      fontSize: '15px',
                      minWidth: '70px',
                      textAlign: 'right',
                      flexShrink: 0
                    }}
                  >
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
 
                  {/* 🗑️ Delete Icon */}
                  <button
                    className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '32px', height: '32px', flexShrink: 0 }}
                    onClick={() => handleQuantityChange(item.id, 0)}
                    title="Remove item"
                  >
                    <FaTrash size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* 🧾 Order Summary */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div
              className="card-header text-white rounded-top-4"
              style={{ background: 'linear-gradient(90deg, #FF6A00, #FF9900)' }}
            >
              <h5 className="mb-0 fw-semibold">Order Summary</h5>
            </div>
 
            <div className="card-body p-4">
              {/* 💰 Price Details */}
              <div className="d-flex justify-content-between mb-3">
                <span>Subtotal:</span>
                <span
                  className="fw-bold"
                  style={{
                    background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ₹{getTotalPrice().toFixed(2)}
                </span>
              </div>
 
              <div className="d-flex justify-content-between mb-3">
                <span>Tax (5%):</span>
                <span
                  className="fw-bold"
                  style={{
                    background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ₹{(getTotalPrice() * 0.05).toFixed(2)}
                </span>
              </div>
 
              <hr />
 
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total Amount:</span>
                <span
                  className="fw-bold fs-5"
                  style={{
                    background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ₹{(getTotalPrice() + getTotalPrice() * 0.05).toFixed(2)}
                </span>
              </div>
 
             <button
               onClick={placeOrder}
               className="btn w-100 mb-2 fw-semibold rounded-pill py-2 text-white"
               style={{
                 background: 'linear-gradient(90deg, #FF6A00, #FF9900)',
                 border: 'none',
                 transition: 'all 0.3s ease-in-out'
               }}
             >
               Place Order
             </button>
 
              <button
                className="btn btn-outline-danger w-100 fw-semibold rounded-pill py-2"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
 
export default Cart
