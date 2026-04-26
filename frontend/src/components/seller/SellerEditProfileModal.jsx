import React from 'react';

export default function SellerEditProfileModal({ 
  isOpen, 
  onClose, 
  sellerProfile, 
  onProfileChange, 
  onSave, 
  errorMessage 
}) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 10001 }}>
      <div className="modal-content">
        <button 
          className="modal-close" 
          onClick={onClose} 
          style={{ fontSize: "26px", width: "40px", height: "40px", lineHeight: "38px" }}
        >
          ×
        </button>
        <h2 className="modal-title">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username:</label>
            <input 
              type="text" 
              className="modal-input" 
              value={sellerProfile.username || ""} 
              readOnly
            />
          </div>
          <div className="input-group">
            <label>First Name:</label>
            <input 
              type="text" 
              className="modal-input" 
              value={sellerProfile.firstName || ""} 
              onChange={(e) => onProfileChange('firstName', e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Last Name:</label>
            <input 
              type="text" 
              className="modal-input" 
              value={sellerProfile.lastName || ""} 
              onChange={(e) => onProfileChange('lastName', e.target.value)}
            />
          </div>
          <div style={{ borderTop: "1px solid #e0e0e0", margin: "20px 0" }}></div>
          <div style={{ fontWeight: 700, marginBottom: "15px" }}>Change Password</div>
          <div className="password-fields">
            <div className="input-group">
              <label>Current Password:</label>
              <input 
                type="password" 
                className="modal-input" 
                value={sellerProfile.currentPassword || ""} 
                onChange={(e) => onProfileChange('currentPassword', e.target.value)}
                placeholder="Current password"
              />
            </div>
            <div className="input-group">
              <label>New Password:</label>
              <input 
                type="password" 
                className="modal-input" 
                value={sellerProfile.newPassword || ""} 
                onChange={(e) => onProfileChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="input-group">
              <label>Confirm Password:</label>
              <input 
                type="password" 
                className="modal-input" 
                value={sellerProfile.confirmPassword || ""} 
                onChange={(e) => onProfileChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          {errorMessage && (
            <div style={{ color: "#b91c1c", fontWeight: 700, marginBottom: "16px", textAlign: "center" }}>
              {errorMessage}
            </div>
          )}
          <button className="login-button" type="submit" style={{ width: "260px", margin: "20px auto 0", display: "block" }}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
