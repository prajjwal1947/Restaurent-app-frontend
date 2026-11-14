import { useState, useEffect, useEffectEvent } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { apiRequest } from "../services/api";
import { useRestaurantBranding } from "../context/BrandingStore";
import "../styles/OTPSettings.css";

export default function OTPSettings() {
  const { restaurant } = useRestaurantBranding();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const [otpHistory, setOtpHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [whatsappConnection, setWhatsappConnection] = useState(null);
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);

  const gradientStart = restaurant?.branding?.gradientStart || "#e86a33";
  const gradientEnd = restaurant?.branding?.gradientEnd || "#f7c59f";

  const loadWhatsAppConnection = async () => {
    try {
      const response = await apiRequest("/settings/whatsapp");
      setWhatsappConnection(response);
    } catch (err) {
      setError(err.message || "Failed to load WhatsApp connection");
    }
  };

  const loadOTPSettings = async () => {
    try {
      const response = await apiRequest("/settings/otp");
      setIsEnabled(response.isEnabled);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load OTP settings");
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const response = await apiRequest("/staff");
      setStaffList(response);
    } catch (err) {
      console.error("Failed to load staff:", err);
    }
  };

  const loadOTPHistory = async () => {
    try {
      const response = await apiRequest("/otp-history");
      setOtpHistory(response);
    } catch (err) {
      console.error("Failed to load OTP history:", err);
    }
  };

  const loadInitialData = useEffectEvent(() => {
    loadOTPSettings();
    loadStaffList();
    loadOTPHistory();
    loadWhatsAppConnection();
  });

  useEffect(() => {
    Promise.resolve().then(() => loadInitialData());
  }, []);

  const toggleOTPFeature = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await apiRequest("/settings/otp", { method: "PATCH", body: { isEnabled: !isEnabled } });
      setIsEnabled(response.isEnabled);
      setSuccessMsg(
        `OTP login has been ${!isEnabled ? "enabled" : "disabled"}`
      );
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update OTP settings");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectWhatsAppOAuth = async () => {
    try {
      const response = await apiRequest("/settings/whatsapp/oauth/authorize", {
        method: "POST",
        body: { redirectUri: `${window.location.origin}/admin/oauth/whatsapp/callback` },
      });
      
      if (response.authorizationUrl) {
        // Redirect to Meta's OAuth page
        window.location.href = response.authorizationUrl;
      }
    } catch (err) {
      setError(err.message || "Failed to initiate WhatsApp connection");
    }
  };

  const handleConnectWhatsApp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSavingWhatsApp(true);

    try {
      const response = await apiRequest("/settings/whatsapp", {
        method: "PATCH",
        body: { phoneNumberId, accessToken },
      });
      setWhatsappConnection(response);
      setPhoneNumberId("");
      setAccessToken("");
      setShowAccessToken(false);
      setShowWhatsAppForm(false);
      setSuccessMsg("WhatsApp Business connected");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to connect WhatsApp Business");
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!window.confirm("Disconnect this restaurant's WhatsApp Business account?")) return;

    setSavingWhatsApp(true);
    setError("");
    setSuccessMsg("");

    try {
      await apiRequest("/settings/whatsapp", { method: "DELETE" });
      setWhatsappConnection({ connected: false });
      setSuccessMsg("WhatsApp Business disconnected");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to disconnect WhatsApp Business");
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!selectedStaff) return;

    if (!newPhone.trim() || !/^\+?[1-9]\d{1,14}$/.test(newPhone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setUpdatingPhone(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await apiRequest(`/staff/${selectedStaff.id}/phone`, {
        method: "PATCH",
        body: { phone: newPhone },
      });

      setStaffList(
        staffList.map((staff) =>
          staff.id === selectedStaff.id
            ? { ...staff, phone: response.phone }
            : staff
        )
      );

      setSuccessMsg(`Phone updated for ${response.name}`);
      setSelectedStaff(null);
      setNewPhone("");
      setShowPhoneInput(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update phone number");
    } finally {
      setUpdatingPhone(false);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "Not set";
    return phone;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="otp-settings-loading">Loading OTP settings...</div>;
  }

  return (
    <div className="otp-settings-container">
      <div 
        className="otp-settings-panel"
        style={{
          "--brand-primary": gradientStart,
          "--brand-secondary": gradientEnd,
        }}
      >
        <h2>OTP-Based Staff Login</h2>

        {error && <div className="otp-alert alert-error">{error}</div>}
        {successMsg && <div className="otp-alert alert-success">{successMsg}</div>}

        {/* Feature Toggle Section */}
        <div className="otp-section">
          <div className="otp-feature-toggle">
            <div className="otp-toggle-content">
              <h3>Enable OTP Login</h3>
              <p>Allow staff to login using WhatsApp OTP</p>
            </div>
            <button
              className={`otp-toggle-btn ${isEnabled ? "enabled" : "disabled"}`}
              onClick={toggleOTPFeature}
              disabled={saving}
            >
              <div className="toggle-switch">
                <div className="toggle-slider"></div>
              </div>
              <span>{isEnabled ? "Enabled" : "Disabled"}</span>
            </button>
          </div>
        </div>

        <div className="otp-section">
          <div className="otp-section-header">
            <div>
              <h3>Restaurant WhatsApp Business</h3>
              <p>OTP messages are sent from this restaurant's WhatsApp number.</p>
            </div>
            {whatsappConnection?.connected && !showWhatsAppForm && (
              <div className="whatsapp-actions">
                <button
                  className="otp-btn otp-btn-secondary"
                  onClick={() => setShowWhatsAppForm(true)}
                  disabled={savingWhatsApp}
                >
                  Replace
                </button>
                <button
                  className="otp-btn otp-btn-danger"
                  onClick={handleDisconnectWhatsApp}
                  disabled={savingWhatsApp}
                  aria-label="Disconnect WhatsApp Business"
                  title="Disconnect WhatsApp Business"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {whatsappConnection?.connected && !showWhatsAppForm ? (
            <div className="whatsapp-connection-status">
              <span className="whatsapp-status-indicator" />
              <div>
                <strong>Connected</strong>
                <span>
                  {whatsappConnection.displayPhoneNumber || whatsappConnection.phoneNumberId}
                </span>
              </div>
            </div>
          ) : (
            <div className="whatsapp-connection-options">
              <div className="whatsapp-oauth-section">
                <div className="oauth-option">
                  <h4>Connect with Meta Account</h4>
                  <p>Sign in with your Meta account to authorize WhatsApp Business. This is the recommended way to connect.</p>
                  <button
                    className="otp-btn otp-btn-primary"
                    onClick={handleConnectWhatsAppOAuth}
                    disabled={savingWhatsApp}
                    type="button"
                  >
                    {savingWhatsApp ? "Connecting..." : "Connect with Meta"}
                  </button>
                </div>

                <div className="oauth-divider">
                  <span>or</span>
                </div>

                <form className="whatsapp-connection-form" onSubmit={handleConnectWhatsApp}>
                  <div className="manual-option">
                    <h4>Manual Token Entry</h4>
                    <p className="whatsapp-form-note">
                      If you already have a system-user token, you can enter it manually. The token is encrypted before it is stored.
                    </p>
                    <div className="form-group">
                      <label htmlFor="whatsapp-phone-number-id">Phone Number ID</label>
                      <input
                        id="whatsapp-phone-number-id"
                        type="text"
                        value={phoneNumberId}
                        onChange={(event) => setPhoneNumberId(event.target.value)}
                        autoComplete="off"
                        required
                        disabled={savingWhatsApp}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="whatsapp-access-token">System-user access token</label>
                      <div className="whatsapp-token-input">
                        <input
                          id="whatsapp-access-token"
                          type={showAccessToken ? "text" : "password"}
                          value={accessToken}
                          onChange={(event) => setAccessToken(event.target.value)}
                          autoComplete="new-password"
                          required
                          disabled={savingWhatsApp}
                        />
                        <button
                          type="button"
                          className="whatsapp-token-visibility"
                          onClick={() => setShowAccessToken(!showAccessToken)}
                          aria-label={showAccessToken ? "Hide access token" : "Show access token"}
                          title={showAccessToken ? "Hide access token" : "Show access token"}
                        >
                          {showAccessToken ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button className="otp-btn otp-btn-primary" type="submit" disabled={savingWhatsApp}>
                        {savingWhatsApp ? "Connecting..." : "Connect WhatsApp"}
                      </button>
                      {whatsappConnection?.connected && (
                        <button
                          className="otp-btn otp-btn-secondary"
                          type="button"
                          onClick={() => setShowWhatsAppForm(false)}
                          disabled={savingWhatsApp}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Staff Phone Management Section */}
        <div className="otp-section">
          <div className="otp-section-header">
            <h3>Manage Staff Phone Numbers</h3>
            <p>Assign phone numbers to staff for OTP login</p>
          </div>

          {!showPhoneInput ? (
            <div className="staff-list">
              {staffList.length === 0 ? (
                <p className="no-staff">No staff members found</p>
              ) : (
                staffList.map((staff) => (
                  <div key={staff.id} className="staff-item">
                    <div className="staff-info">
                      <div className="staff-name">{staff.name}</div>
                      <div className="staff-phone">
                        {formatPhoneNumber(staff.phone)}
                      </div>
                    </div>
                    <button
                      className="otp-btn otp-btn-edit"
                      onClick={() => {
                        setSelectedStaff(staff);
                        setNewPhone(staff.phone || "");
                        setShowPhoneInput(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="phone-input-form">
              <div className="form-group">
                <label>Staff: {selectedStaff?.name}</label>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  disabled={updatingPhone}
                />
              </div>
              <div className="form-actions">
                <button
                  className="otp-btn otp-btn-primary"
                  onClick={handleUpdatePhone}
                  disabled={updatingPhone}
                >
                  {updatingPhone ? "Updating..." : "Update Phone"}
                </button>
                <button
                  className="otp-btn otp-btn-secondary"
                  onClick={() => {
                    setShowPhoneInput(false);
                    setSelectedStaff(null);
                    setNewPhone("");
                  }}
                  disabled={updatingPhone}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OTP History Section */}
        <div className="otp-section">
          <div className="otp-section-header">
            <h3>OTP Login History</h3>
            <button
              className="otp-btn otp-btn-small"
              onClick={() => {
                setShowHistory(!showHistory);
                if (!showHistory) loadOTPHistory();
              }}
            >
              {showHistory ? "Hide" : "Show"} History
            </button>
          </div>

          {showHistory && (
            <div className="otp-history">
              {otpHistory.length === 0 ? (
                <p className="no-history">No OTP login attempts yet</p>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Phone</th>
                      <th>Attempts</th>
                      <th>Status</th>
                      <th>Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otpHistory.map((history) => (
                      <tr key={history.id}>
                        <td>{history.phone}</td>
                        <td>
                          {history.attempts}/{history.maxAttempts}
                        </td>
                        <td>
                          <span
                            className={`status ${
                              history.verifiedAt ? "verified" : "pending"
                            }`}
                          >
                            {history.verifiedAt ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td>{formatDate(history.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="otp-section otp-instructions">
          <h3>How It Works</h3>
          <ol>
            <li>Enable OTP login from the toggle above</li>
            <li>Assign phone numbers to each staff member</li>
            <li>Staff can login at /staff-login using their phone number</li>
            <li>They'll receive a WhatsApp OTP to verify</li>
            <li>After verification, they can access the ordering system</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
