import Swal from 'sweetalert2';
import { useState } from "react";
import { X } from "lucide-react";

export default function UpdateStoreModal({ onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    storeName: "",
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    contactNo: "",
    username: "",
    password: "",
    bankName: "",
    branch: "",
    accountNo: "",
    accountHolderName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate(formData);
    }
    Swal.fire("Updated successfully!");
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal-content update-store-modal">
        <button className="modal-close" onClick={onClose} type="button">
          ×
        </button>

        <h2 className="modal-title">Update Store Details</h2>

        <form onSubmit={handleSubmit}>
          <div className="update-store-grid">
            <div className="update-store-field">
              <label className="update-store-label">Store Name:</label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                placeholder="Enter store name"
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Address:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Contact No:</label>
              <input
                type="text"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Bank Name:</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Branch:</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Account no:</label>
              <input
                type="text"
                name="accountNo"
                value={formData.accountNo}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="update-store-field">
              <label className="update-store-label">Account holder name:</label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Enter account holder name"
                className="modal-input"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="update-store-submit">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
