import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/StaffOTPLogin.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function StaffOTPLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!restaurantId.trim()) {
      setError("Restaurant ID is required");
      return;
    }

    if (!phone.trim() || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      setError("Please enter a valid phone number (e.g., +919876543210)");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/otp/send`,
        {
          restaurantId,
          phone,
        }
      );

      setSuccessMsg(`OTP sent to ${response.data.data.phone}`);
      setOtpSent(true);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp.trim() || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/otp/verify`,
        {
          restaurantId,
          phone,
          otp,
        }
      );

      // Store tokens
      localStorage.setItem("accessToken", response.data.data.accessToken);
      localStorage.setItem("refreshToken", response.data.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      setSuccessMsg("Login successful! Redirecting...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setError("");
    setSuccessMsg("");
    setOtpSent(false);
  };

  return (
    <div className="staff-otp-container">
      <div className="staff-otp-card">
        <div className="staff-otp-header">
          <h1>Olive & Thyme</h1>
          <p>Staff Login</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {step === "phone" ? (
          <form onSubmit={handleSendOTP} className="staff-otp-form">
            <div className="form-group">
              <label htmlFor="restaurantId">Restaurant ID</label>
              <input
                id="restaurantId"
                type="text"
                placeholder="Enter your restaurant ID"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
              <small>Enter your phone number in international format</small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="login-links">
              <a href="/login">Admin Login</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="staff-otp-form">
            <div className="otp-sent-info">
              <p>OTP sent to {phone.slice(-2).padStart(phone.length, "*")}</p>
            </div>

            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                maxLength="6"
                disabled={loading}
                className="otp-input"
              />
              <small>6-digit code sent to your WhatsApp</small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleBackToPhone}
              disabled={loading}
              className="btn btn-secondary"
            >
              Change Phone Number
            </button>

            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading || !otpSent}
              className="btn btn-link"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
