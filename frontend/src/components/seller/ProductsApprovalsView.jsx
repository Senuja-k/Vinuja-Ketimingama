import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import '../../styles.css';
import api from '../../api/api';

export default function ProductsApprovalsView({ searchQuery = "", onRefresh }) {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedApprovalIndex, setSelectedApprovalIndex] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchApprovals(1, false);
  }, []);

  const fetchApprovals = async (targetPage = 1, isAppend = false) => {
    if (targetPage === 1 && !isAppend) setApprovals([]);
    else setIsLoadingMore(true);

    try {
      const res = await api.get(`/seller/approvals?page=${targetPage}`);
      const data = res.data.data.map(p => ({
        id: "P" + p.id,
        dbId: p.id,
        name: p.name,
        desc: p.description,
        cat: p.categories?.[0]?.name || 'Uncategorized',
        price: 'Rs. ' + (p.marked_price || 0).toLocaleString(),
        qty: (p.quantity || 0).toString(),
        status: p.approval_status === 0 ? 'Pending' : p.approval_status === 1 ? 'Approved' : 'Rejected',
        feedback: p.reject_reason || (p.approval_status === 1 ? 'All Good' : '-')
      }));
      
      setApprovals(prev => isAppend ? [...prev, ...data] : data);
      setPage(targetPage);
      setHasMore(res.data.current_page < res.data.last_page);
    } catch (err) {
      console.error("Failed to fetch approvals", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoadingMore) {
      fetchApprovals(page + 1, true);
    }
  };

  const handleDelete = async () => {
    if (selectedApprovalIndex === null) return;
    const prod = approvals[selectedApprovalIndex];
    try {
      await api.delete(`/seller/products/${prod.dbId}`);
      setApprovals(prev => prev.filter((_, i) => i !== selectedApprovalIndex));
      onRefresh?.();
      setIsDeleteConfirmOpen(false);
      setSelectedApprovalIndex(null);
    } catch (err) {
      Swal.fire("Failed to delete product");
    }
  };

  const normalizedSearch = (searchQuery || "").trim().toLowerCase();
  const filteredApprovals = normalizedSearch
    ? approvals.filter((item) => {
        const normalizedName = (item.name || "").toLowerCase();
        const normalizedId = (item.id || "").toLowerCase();
        return normalizedName.includes(normalizedSearch) || normalizedId.includes(normalizedSearch);
      })
    : approvals;

  return (
    <div style={{ paddingBottom: "10px" }}>
      <h2 style={{ textAlign: "center", color: "#111", fontSize: "24px", fontWeight: "700", marginBottom: "20px" }}>Product Approvals</h2>
      
      <div className="admin-table-container approvals-table-container" onScroll={handleScroll} style={{ boxShadow: "none" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product id</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Price</th>
              <th>QTY</th>
              <th>Status</th>
              <th>Feedbacks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApprovals.map((item, idx) => (
              <tr key={idx}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.desc}</td>
                <td>{item.cat}</td>
                <td>{item.price}</td>
                <td>{item.qty}</td>
                <td>{item.status}</td>
                <td>{item.feedback}</td>
                <td>
                  <div style={{ display: "inline-flex", justifyContent: "center" }}>
                    <div 
                      onClick={() => { setSelectedApprovalIndex(idx); setIsDeleteConfirmOpen(true); }}
                      style={{ backgroundColor: "#cc1111", color: "white", width: "28px", height: "28px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <Trash2 size={16} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDeleteConfirmOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "400px", padding: "40px", background: "white", textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setIsDeleteConfirmOpen(false)}>×</button>

            <div style={{ backgroundColor: "#ff4d4f", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ color: "white", fontSize: "28px", lineHeight: 1 }}>×</span>
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px" }}>
              Are You Sure, You Wanna Delete?
            </h2>

            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <button 
                onClick={handleDelete}
                style={{ backgroundColor: "#009922", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                Yes
              </button>
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                style={{ backgroundColor: "#ff0000", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
