import React from 'react';
import { Download, ExternalLink, Search, RefreshCw } from 'lucide-react';
import api from '../../api/api';

export default function TransactionsView({ transactions = [], onRefresh }) {
  const handleDownloadReceipt = async (path) => {
    try {
      const response = await api.get(`/seller/download-file?path=${encodeURIComponent(path)}`, {
        responseType: 'blob'
      });
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      window.open(`/storage/${path}`, '_blank');
    }
  };

  return (
    <div className="admin-table-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontWeight: "600", color: "#111" }}>Transaction History</h2>
        <button 
          onClick={onRefresh}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
            borderRadius: '12px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' 
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference No</th>
            <th>Requested Amount</th>
            <th>Status</th>
            <th>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <tr key={idx}>
                <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                <td>{tx.id ? `TXN-${tx.id}` : '-'}</td>
                <td style={{ fontWeight: "700" }}>Rs. {tx.requested_amount.toLocaleString()}</td>
                <td>
                  <span style={{ 
                    padding: "4px 12px", 
                    borderRadius: "20px", 
                    fontSize: "12px", 
                    fontWeight: 700,
                    backgroundColor: tx.status === 1 ? "#dcfce7" : tx.status === 2 ? "#fee2e2" : "#fef3c7",
                    color: tx.status === 1 ? "#166534" : tx.status === 2 ? "#991b1b" : "#92400e"
                  }}>
                    {tx.status === 1 ? 'Approved' : tx.status === 2 ? 'Rejected' : 'Pending'}
                  </span>
                </td>
                <td>
                  {tx.status === 1 && tx.slip_image ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => handleDownloadReceipt(tx.slip_image)}
                        title="Download Receipt"
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#2563eb" }}
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => window.open(`/storage/${tx.slip_image}`, '_blank')}
                        title="View Receipt"
                        style={{ border: "none", background: "none", cursor: "pointer", color: "#4b5563" }}
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                      {tx.status === 0 ? "Pending admin approval" : "No receipt"}
                    </span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>No transactions found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
