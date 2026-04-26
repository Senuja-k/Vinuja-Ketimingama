import { useState, useEffect } from "react";
import { X, EyeOff, Eye, LogIn } from "lucide-react";
import "../../styles.css";

export default function AdminLoginModal({ onClose, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const apiBase = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api';

  useEffect(() => {
    // Clean up any legacy plaintext password in storage
    localStorage.removeItem("adminPassword");

    const isRemembered = localStorage.getItem("adminRememberMe") === "true";
    if (isRemembered) {
      // Only restore username — password is not persisted for security
      const savedUsername = localStorage.getItem("adminUsername") || "";
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    // Client-side guard — prevents empty-field 422 errors
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      const response = await fetch(`${apiBase}/admin/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.errors?.username?.[0] || "Invalid username or password");
      }

      const displayName = data.name;
      localStorage.setItem('admin_token', data.token);

      if (rememberMe) {
        localStorage.setItem("adminRememberMe", "true");
        localStorage.setItem("adminUsername", username.trim());
        // NOTE: Password is NOT stored for security reasons
      } else {
        localStorage.removeItem("adminRememberMe");
        localStorage.removeItem("adminUsername");
      }
      onLogin(displayName);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} style={{ top: "20px", right: "20px", fontSize: "20px" }}>
          <X size={20} />
        </button>
        
        <h2 className="modal-title" style={{ fontSize: "20px", fontWeight: "700", color: "#111", marginBottom: "30px" }}>Admin Login</h2>
        
        <div className="input-group">
          <label style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>Username:</label>
          <input 
            type="text" 
            className="modal-input" 
            style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} 
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
          />
        </div>
        
        <div className="input-group">
          <label style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>Password:</label>
          <div className="password-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              className="modal-input password-input" 
              style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4", boxSizing: "border-box" }}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
            <button 
              type="button"
              className="password-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
        
        {error && <p style={{ color: "red", fontSize: "13px", textAlign: "center", marginTop: "0", marginBottom: "15px" }}>{error}</p>}
        
        <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="remember" 
            className="custom-checkbox" 
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember">Remember me</label>
        </div>
        
        <button className="login-button" onClick={handleLogin}>
          Login <LogIn size={18} />
        </button>
      </div>
    </div>
  );
}
