import Swal from 'sweetalert2';
import { useState } from "react";

export default function CustomerRegisterModal({ onClose, onRegister }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal-content">
        <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={onClose}>×</button>
        
        <h2 className="freezing-modal-title" style={{ marginBottom: "35px", fontSize: "24px" }}>Register</h2>
        
        <form className="marketeer-form" onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const apiBase = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api';
          try {
            const res = await fetch(`${apiBase}/customer/register`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify(Object.fromEntries(formData.entries()))
            });
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "Registration failed");
            }
            const data = await res.json();
            localStorage.setItem('customer_token', data.token);
            if (data.customer) {
              const c = data.customer;
              localStorage.setItem('customer_name', `${c.first_name} ${c.last_name}`.trim());
              localStorage.setItem('customer_contact', c.contact || '');
              localStorage.setItem('customer_address', c.address || '');
              localStorage.setItem('customer_id', c.id || '');
            }
            Swal.fire("Registration successful!");
            if (onRegister) onRegister();
          } catch (err) {
            Swal.fire(err.message);
          }
        }}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name:</label>
              <input type="text" name="first_name" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              <input type="text" name="last_name" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Address:</label>
              <input type="text" name="address" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact no:</label>
              <input type="text" name="contact" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
            <div className="form-group">
              <label>NIC no:</label>
              <input type="text" name="nic" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Postal Code:</label>
              <input type="text" name="postal_code" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
            <div className="form-group">
              <label>Province:</label>
              <input type="text" name="province" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: "15px" }}>
            <div className="form-group">
              <label>Username:</label>
              <input type="text" name="username" autoComplete="off" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input type="password" name="password" autoComplete="new-password" className="modal-input" style={{ border: "none", backgroundColor: "#f3f4f6" }} />
            </div>
          </div>

          <div className="freezing-actions" style={{ marginTop: "20px", justifyContent: "center" }}>
            <button type="submit" className="btn-save-details" style={{ width: "200px" }}>Save Details! <span style={{ marginLeft: "5px" }}>💾</span></button>
          </div>
        </form>
      </div>
    </div>
  );
}
