import Swal from 'sweetalert2';
import { useState, useEffect } from "react";
import { EyeOff, Eye, LogIn } from "lucide-react";

export default function CustomerLoginModal({ onClose, onLogin, onRegisterSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const apiBase = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api';

  useEffect(() => {
    const isRemembered = localStorage.getItem("customerRememberMe") === "true";
    if (isRemembered) {
      setUsername(localStorage.getItem("customerUsername") || "");
      setPassword(localStorage.getItem("customerPassword") || "");
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBase}/customer/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid customer credentials");
      }

      localStorage.setItem('customer_token', data.token);
      // Save profile for use in checkout
      if (data.customer) {
        const c = data.customer;
        localStorage.setItem('customer_name', `${c.first_name} ${c.last_name}`.trim());
        localStorage.setItem('customer_contact', c.contact || '');
        localStorage.setItem('customer_address', c.address || '');
        localStorage.setItem('customer_id', c.id || '');
      }

      if (rememberMe) {
        localStorage.setItem("customerRememberMe", "true");
        localStorage.setItem("customerUsername", username);
        localStorage.setItem("customerPassword", password);
      } else {
        localStorage.removeItem("customerRememberMe");
        localStorage.removeItem("customerUsername");
        localStorage.removeItem("customerPassword");
      }
      if (onLogin) onLogin();
    } catch (err) {
      Swal.fire(err.message);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal-content">
        <button className="freezing-modal-close" onClick={onClose} style={{ fontSize: "24px", top: "15px", right: "20px" }}>×</button>
        
        <h2 className="freezing-modal-title" style={{ fontSize: "22px", marginBottom: "35px" }}>Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: "20px" }}>
            <label style={{ width: "100px", fontSize: "14px", fontWeight: "500", color: "#333" }}>Username:</label>
            <input 
              type="text" 
              className="modal-input" 
              style={{ flex: 1, padding: "10px 15px", borderRadius: "20px", border: "none", backgroundColor: "#f3f4f6" }} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group" style={{ marginBottom: "15px" }}>
            <label style={{ width: "100px", fontSize: "14px", fontWeight: "500", color: "#333" }}>Password:</label>
            <div className="password-wrapper" style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="modal-input" 
                style={{ width: "100%", padding: "10px 15px", borderRadius: "20px", border: "none", backgroundColor: "#f3f4f6", boxSizing: "border-box" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "#666", padding: 0, display: "flex", alignItems: "center" }}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "25px" }}>
            <input 
              type="checkbox" 
              id="rememberMe" 
              style={{ accentColor: "#6366f1" }} 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" style={{ color: "#666", fontStyle: "italic", fontSize: "12px" }}>Remember me</label>
          </div>

          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <button type="submit" style={{ backgroundColor: "#ff8c00", color: "white", padding: "10px 40px", borderRadius: "25px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              Login <LogIn size={16} />
            </button>
            <div style={{ marginTop: "5px", fontSize: "13px", color: "#666" }}>
              Don't you have an account? <a href="#" onClick={(e) => { e.preventDefault(); onRegisterSwitch(); }} style={{ color: "#3b82f6", fontStyle: "italic", textDecoration: "none", fontWeight: "bold" }}>Sign up</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
