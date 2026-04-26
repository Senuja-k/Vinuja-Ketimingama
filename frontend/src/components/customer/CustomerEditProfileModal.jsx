import React, { useState, useEffect } from 'react';
import api from '../../api/api';

export default function CustomerEditProfileModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact: "",
    address: "",
    nic: "",
    password: "",
    password_confirmation: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setSuccess(false);
      setError("");
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customer/profile');
      const data = res.data;
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        contact: data.contact || "",
        address: data.address || "",
        nic: data.nic || "",
        password: "",
        password_confirmation: ""
      });
    } catch (err) {
      setError("Failed to fetch profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (formData.password && formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }

      await api.put('/customer/profile', payload);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal-content">
        <button 
          onClick={onClose} 
          style={{ position: "absolute", right: "20px", top: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666" }}
        >
          ✕
        </button>
        
        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "30px", textAlign: "center", color: "#000" }}>Edit Your Profile</h2>
        
        {success ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "50px", color: "#22c55e", marginBottom: "15px" }}>✓</div>
            <p style={{ fontSize: "18px", fontWeight: "600", color: "#22c55e" }}>Profile Updated Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="input-group">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#666", marginBottom: "5px" }}>First Name</label>
                <input 
                  type="text" 
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#666", marginBottom: "5px" }}>Last Name</label>
                <input 
                  type="text" 
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#666", marginBottom: "5px" }}>Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#666", marginBottom: "5px" }}>Contact Number</label>
              <input 
                type="text" 
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#666", marginBottom: "5px" }}>Address</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box", minHeight: "80px", resize: "vertical" }}
              ></textarea>
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#666", marginBottom: "5px" }}>NIC (Optional)</label>
              <input 
                type="text" 
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ height: "1px", backgroundColor: "#eee", margin: "10px 0" }}></div>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#000", margin: "0 0 5px 0" }}>Change Password (leave blank to keep current)</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div className="input-group">
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "5px" }}>New Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div className="input-group">
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#666", marginBottom: "5px" }}>Confirm Password</label>
                <input 
                  type="password" 
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {error && <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: "600", textAlign: "center", margin: "10px 0 0 0" }}>{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                marginTop: "10px",
                width: "100%", 
                padding: "15px", 
                backgroundColor: "#000", 
                color: "#fff", 
                border: "none", 
                borderRadius: "12px", 
                fontSize: "16px", 
                fontWeight: "700", 
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "background-color 0.2s"
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
