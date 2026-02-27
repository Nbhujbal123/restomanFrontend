import React, { useState } from 'react'
import axios from 'axios'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa'

const API_BASE_URL = 'http://localhost:5000/api/auth'

interface LoginProps {
  onClose: () => void
  onSwitchToSignup: () => void
  onLogin: (email: string, password: string) => void
}

const Login: React.FC<LoginProps> = ({ onClose, onSwitchToSignup, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      onLogin(email, password)
      setIsLoading(false)
    }, 1000)
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/forgot-password`, { email: resetEmail })
      alert(res.data.message || 'OTP sent to your email')
      setShowForgotPassword(false)
      setShowOTPVerification(true)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setResetLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/verify-reset-otp`, { email: resetEmail, otp })
      alert(res.data.message || 'OTP verified')
      setShowOTPVerification(false)
      setShowPasswordReset(true)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setResetLoading(false)
    }
  }

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    setResetLoading(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/reset-password`, { email: resetEmail, newPassword })
      alert(res.data.message || 'Password reset successfully')
      setShowPasswordReset(false)
      setResetEmail('')
      setOtp('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            {(showForgotPassword || showOTPVerification || showPasswordReset) && (
              <button
                type="button"
                className="btn btn-link text-dark border-0 p-0 me-3"
                onClick={() => {
                  if (showPasswordReset) {
                    setShowPasswordReset(false)
                    setShowOTPVerification(true)
                  } else if (showOTPVerification) {
                    setShowOTPVerification(false)
                    setShowForgotPassword(true)
                  } else {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setOtp('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }
                }}
              >
                <FaArrowLeft />
              </button>
            )}
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={onClose}
              style={{ fontSize: '14px' }}
            ></button>
          </div>

          <div className="modal-body px-4 pb-4">
            {/* Logo */}
            <div className="text-center mb-4">
              <img
                src="/assets/images/Logo.png"
                alt="Logo"
                style={{
                  width: '150px',
                  height: '50px',
                  objectFit: 'contain',
                }}
              />
            </div>

            {showForgotPassword ? (
              <>
                <h4 className="text-center fw-bold mb-4" style={{ color: '#333' }}>
                  Forgot Password
                </h4>
                <form onSubmit={handleForgotSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#555' }}>
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                        <FaUser style={{ color: '#FF6A00' }} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        style={{
                          borderRadius: '0 8px 8px 0',
                          borderLeft: 'none',
                          padding: '12px 16px'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-semibold py-3 mb-3"
                    disabled={resetLoading}
                    style={{
                      background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }}
                  >
                    {resetLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              </>
            ) : showOTPVerification ? (
              <>
                <h4 className="text-center fw-bold mb-4" style={{ color: '#333' }}>
                  Verify OTP
                </h4>
                <form onSubmit={handleOTPSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#555' }}>
                      Enter OTP sent to {resetEmail}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      style={{ padding: '12px 16px', borderRadius: '8px' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-semibold py-3 mb-3"
                    disabled={resetLoading}
                    style={{
                      background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }}
                  >
                    {resetLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              </>
            ) : showPasswordReset ? (
              <>
                <h4 className="text-center fw-bold mb-4" style={{ color: '#333' }}>
                  Set New Password
                </h4>
                <form onSubmit={handlePasswordResetSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#555' }}>
                      New Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-control border-end-0 ps-3"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                          borderRadius: '8px 0 0 8px',
                          borderRight: 'none',
                          padding: '12px 16px'
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          borderRadius: '0 8px 8px 0',
                          borderLeft: 'none'
                        }}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: '#555' }}>
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-control border-end-0 ps-3"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{
                          borderRadius: '8px 0 0 8px',
                          borderRight: 'none',
                          padding: '12px 16px'
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          borderRadius: '0 8px 8px 0',
                          borderLeft: 'none'
                        }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-semibold py-3 mb-3"
                    disabled={resetLoading}
                    style={{
                      background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }}
                  >
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h4 className="text-center fw-bold mb-4" style={{ color: '#333' }}>
                  Welcome Back
                </h4>

                <form onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: '#555' }}>
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                        <FaUser style={{ color: '#FF6A00' }} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          borderRadius: '0 8px 8px 0',
                          borderLeft: 'none',
                          padding: '12px 16px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: '#555' }}>
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0" style={{ backgroundColor: '#f8f9fa' }}>
                        <FaLock style={{ color: '#FF6A00' }} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                          borderLeft: 'none',
                          borderRight: 'none',
                          padding: '12px 16px'
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary border-start-0"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          borderRadius: '0 8px 8px 0',
                          borderLeft: 'none'
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-semibold py-3 mb-3"
                    disabled={isLoading}
                    style={{
                      background: 'linear-gradient(90deg, #FFA500, #FF6B00)',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  {/* Forgot Password */}
                  <div className="text-center mb-3">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      style={{ color: '#FF6A00', fontSize: '14px' }}
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="text-center mb-3">
                    <span style={{ color: '#999', fontSize: '14px' }}>Don't have an account?</span>
                  </div>

                  {/* Switch to Signup */}
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100 fw-semibold py-2"
                    onClick={onSwitchToSignup}
                    style={{
                      borderRadius: '12px',
                      borderColor: '#FF6A00',
                      color: '#FF6A00'
                    }}
                  >
                    Create New Account
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login