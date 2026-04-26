import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import '../../styles.css';
import api from '../../api/api';

export default function OrdersView({ searchQuery = "" }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchOrders(1, false);
  }, []);

  const fetchOrders = async (targetPage = 1, isAppend = false) => {
    if (targetPage === 1 && !isAppend) setOrders([]);
    else setIsLoadingMore(true);

    try {
      const res = await api.get(`/seller/orders?page=${targetPage}`);
      const data = res.data.data.map(o => ({
        id: o.id.toString(),
        pid: o.product_id ? "P" + o.product_id : "-",
        address: o.delivery_address,
        name: o.product?.name || "Unknown Product",
        contact: o.contact_no,
        price: 'Rs. ' + o.total_amount.toLocaleString(),
        status: o.status === 3 ? 'completed' : o.status === 4 ? 'rejected' : 'pending'
      }));
      
      setOrders(prev => isAppend ? [...prev, ...data] : data);
      setPage(targetPage);
      setHasMore(res.data.current_page < res.data.last_page);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !isLoadingMore) {
      fetchOrders(page + 1, true);
    }
  };

  const handleStatusChange = async (orderId, newLabel) => {
    const statusVal = newLabel === 'completed' ? 3 : newLabel === 'rejected' ? 4 : 0;
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: statusVal });
      fetchOrders();
    } catch (err) {
      Swal.fire("Failed to update status");
    }
  };

  const normalizedSearch = (searchQuery || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  const filteredOrders = normalizedSearch
    ? orders.filter((order) => {
        const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);
        const searchableValues = [
          order.id,
          order.pid,
          order.address,
          order.name,
          order.contact,
          order.price,
          order.status,
          statusLabel
        ];
        return searchableValues.some((value) => {
          const normalizedValue = String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return normalizedValue.includes(normalizedSearch);
        });
      })
    : orders;

  return (
    <div style={{ paddingBottom: "10px" }}>
      <h2 style={{ textAlign: "center", color: "#111", fontSize: "24px", fontWeight: "700", marginBottom: "20px" }}>Orders</h2>
      <div
        className="admin-table-container"
        onScroll={handleScroll}
        style={{
          maxHeight: filteredOrders.length > 5 ? "340px" : "none",
          overflowY: filteredOrders.length > 5 ? "auto" : "visible",
          boxShadow: "none"
        }}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order id</th>
              <th>Product id</th>
              <th>Delivery Address</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Delivery Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, idx) => {
              const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);
              const rowColor = order.status === "completed"
                ? "#dbeafe"
                : order.status === "pending"
                ? "#fef9c3"
                : "#fecaca";

              return (
                <tr key={`${order.id}-${idx}`} style={{ backgroundColor: rowColor }}>
                  <td>{order.id}</td>
                  <td>{order.pid}</td>
                  <td>{order.address}</td>
                  <td>{order.name}</td>
                  <td>{order.price}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        handleStatusChange(order.id, e.target.value);
                      }}
                      style={{
                        width: "140px",
                        padding: "8px 12px",
                        borderRadius: "18px",
                        border: "1px solid #ccc",
                        backgroundColor: "white",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#111"
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
