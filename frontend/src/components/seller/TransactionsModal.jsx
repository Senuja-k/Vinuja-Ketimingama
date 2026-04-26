import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import '../../styles.css';

export default function TransactionsModal({ isOpen, onClose, walletBalance = 0, onRequest, requestedAmount = 0, requestStatus = 'idle', claimedAmount = 0, totalSales = 0 }) {
  const [claimAmount, setClaimAmount] = useState('');
  const [transactionSentModalOpen, setTransactionSentModalOpen] = useState(false);
  const [transactionErrorMessage, setTransactionErrorMessage] = useState('');

  useEffect(() => {
    if (requestStatus === 'pending' && requestedAmount) {
      setClaimAmount(String(requestedAmount));
    } else {
      setClaimAmount('');
    }
  }, [requestStatus, requestedAmount]);

  const handleSend = () => {
    const amount = Number(claimAmount);
    if (!claimAmount || isNaN(amount) || amount <= 0) {
      setTransactionErrorMessage("Please enter a valid positive amount.");
      return;
    }
    if (amount > walletBalance) {
      setTransactionErrorMessage("Amount exceeds wallet balance!");
      return;
    }

    setTransactionErrorMessage('');
    if (typeof onRequest === 'function') {
      onRequest(amount);
    }
    setClaimAmount('');
    setTransactionSentModalOpen(true);
  };

  const closeTransactionSentModal = () => {
    setTransactionSentModalOpen(false);
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" style={{ zIndex: 10001, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div 
          className="post-details-modal-content" 
          style={{ 
            width: "500px", 
            padding: "30px", 
            backgroundColor: "#d5d5d5", 
            borderRadius: "15px", 
            position: "relative",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
          }}
        >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "24px" }}>
          <button
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#ffffff",
              color: "#111",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
            }}
          >
            ← Back
          </button>
        </div>

        <h2 className="modal-title" style={{ textAlign: "center", marginBottom: "24px" }}>Transactions</h2>
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "170px", backgroundColor: "#beb6a4", borderRadius: "10px", padding: "12px 15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "16px", color: "#111" }}>Total Sales:</span>
            <span style={{ fontSize: "18px", color: "#111", fontWeight: 700 }}>Rs. {totalSales.toLocaleString()}</span>
          </div>
          <div style={{ flex: 1, minWidth: "170px", backgroundColor: "#a67a75", borderRadius: "10px", padding: "12px 15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "16px", color: "#111", lineHeight: "1.2" }}>Claimed<br />Amount:</span>
            <span style={{ fontSize: "18px", color: "#111", fontWeight: 700 }}>Rs. {claimedAmount.toLocaleString()}</span>
          </div>
          <div style={{ flex: 1, minWidth: "170px", backgroundColor: "#9ec5bc", borderRadius: "10px", padding: "12px 15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "16px", color: "#111" }}>Wallet Balance:</span>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#111" }}>Rs. {walletBalance.toLocaleString()}</span>
          </div>
        </div>

        {requestedAmount > 0 && requestStatus !== 'idle' && (
          <div style={{ marginBottom: '20px', padding: '16px 18px', borderRadius: '20px', backgroundColor: '#f3f4f6', color: '#1f2937', textAlign: 'center', fontWeight: 600 }}>
            Request status: {requestStatus === 'pending' ? 'Pending admin approval' : requestStatus === 'approved' || requestStatus === 'success' ? 'Approved and paid' : 'Rejected'}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
          <span style={{ fontSize: "14px", color: "#111" }}>Enter Amount Need To Be Claimed:</span>
          <input 
            type="number" 
            value={claimAmount}
            onChange={(e) => setClaimAmount(e.target.value)}
            disabled={requestStatus === 'pending'}
            style={{ 
              borderRadius: "15px", 
              border: "none", 
              padding: "10px 15px", 
              width: "140px", 
              outline: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              fontSize: "14px",
              backgroundColor: requestStatus === 'pending' ? '#f3f4f6' : 'white',
              color: requestStatus === 'pending' ? '#6b7280' : '#111'
            }} 
          />
        </div>

        {transactionErrorMessage && (
          <div style={{ textAlign: "center", color: "#b91c1c", fontWeight: 700, marginBottom: "20px" }}>
            {transactionErrorMessage}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button 
            onClick={handleSend}
            disabled={requestStatus === 'pending'}
            style={{ 
              backgroundColor: requestStatus === 'pending' ? '#8ca8b4' : '#00a9cb', 
              color: "white", 
              border: "none", 
              borderRadius: "20px", 
              padding: "10px 60px", 
              fontSize: "15px", 
              fontWeight: "600", 
              cursor: requestStatus === 'pending' ? 'not-allowed' : 'pointer'
            }}
          >
            {requestStatus === 'pending' ? 'Pending Approval' : 'Request Payment'}
          </button>
        </div>
      </div>
    </div>

      {transactionSentModalOpen && (
        <div className="success-popup-overlay">
          <div className="success-popup-card">
            <button className="success-popup-close" onClick={closeTransactionSentModal} type="button">×</button>
            <div className="success-popup-icon-wrapper">
              <div className="success-popup-icon-bg">
                <CheckCircle size={56} color="#fff" />
              </div>
            </div>
            <div className="success-popup-title">Successfully Sent!</div>
            <button className="success-popup-button" onClick={closeTransactionSentModal} type="button">Close</button>
          </div>
        </div>
      )}
    </>
  );
}

