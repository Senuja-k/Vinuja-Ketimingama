import React, { useState, useEffect } from "react";
import api from "../../api/api";
import Swal from 'sweetalert2';
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { Package, Clock, CheckCircle, XCircle, ArrowLeft, ShoppingBag, X } from "lucide-react";
import "../../styles.css";

export default function CustomerOrders({ onBack, onLogoClick, onCartClick, onLogoutClick, onProfileClick, onProductClick, cartCount, globalSettings, onAboutClick }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customer/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You want to cancel this order?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/customer/orders/${orderId}/cancel`);
        Swal.fire(
          'Cancelled!',
          'Your order has been cancelled.',
          'success'
        );
        fetchOrders(); // Refresh the list
      } catch (err) {
        Swal.fire(
          'Error!',
          err.response?.data?.message || 'Failed to cancel order.',
          'error'
        );
      }
    }
  };

  const pendingOrders = orders.filter(o => o.status === 0 || o.status === 1 || o.status === 2);
  const pastOrders = orders.filter(o => o.status === 3 || o.status === 4);

  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return { label: "Pending", color: "#f59e0b", icon: <Clock size={14} /> };
      case 1: return { label: "Confirmed", color: "#3b82f6", icon: <Package size={14} /> };
      case 2: return { label: "Shipped", color: "#8b5cf6", icon: <Package size={14} /> };
      case 3: return { label: "Delivered", color: "#10b981", icon: <CheckCircle size={14} /> };
      case 4: return { label: "Cancelled", color: "#ef4444", icon: <XCircle size={14} /> };
      default: return { label: "Unknown", color: "#6b7280", icon: <Clock size={14} /> };
    }
  };

  const OrderCard = ({ order }) => {
    const statusInfo = getStatusLabel(order.status);
    const imageUrl = order.product?.images?.[0]?.image_path 
      ? `/storage/${order.product.images[0].image_path}` 
      : "https://via.placeholder.com/150";

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        borderRadius: "16px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        overflow: "hidden",
        border: "1px solid #f0f0f0",
      }}>
        {/* Top row: image + details */}
        <div style={{ display: "flex", gap: "12px", padding: "14px 14px 10px" }}>
          <img
            src={imageUrl}
            alt={order.product?.name}
            style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#999", marginBottom: "4px" }}>
              <span>ORDER {new Date(order.created_at).toLocaleDateString()}</span>
              <span>#{order.id}</span>
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#111" }}>{order.product?.name || "Product Name"}</h3>
            <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#555" }}>Qty: {order.quantity} | Total: Rs. {order.total_amount.toLocaleString()}</p>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              backgroundColor: `${statusInfo.color}15`,
              color: statusInfo.color,
              borderRadius: "20px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Bottom row: action buttons - full width, stacked */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          gap: "8px",
          padding: "0 14px 14px",
          flexWrap: "wrap",
        }}>
          {order.status === 0 && (
            <button
              onClick={() => handleCancelOrder(order.id)}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: "10px",
                border: "1px solid #fecaca",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Cancel Order
            </button>
          )}
          {order.status === 3 && (
            <button
              onClick={() => onProductClick(order.product)}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#111",
                color: "white",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Rate Product
            </button>
          )}
          <button
            onClick={() => setSelectedOrder(order)}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              backgroundColor: "white",
              color: "#374151",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };


  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const statusInfo = getStatusLabel(order.status);
    
    return (
      <div className="order-details-overlay" onClick={onClose}>
        <div className="order-details-card" onClick={e => e.stopPropagation()}>
          <div className="order-details-header">
            <h2>Order Details</h2>
            <button className="close-modal-btn" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="order-details-body">
            <div className="details-section">
              <h3>Order Info</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Order ID</span>
                  <span className="detail-value">#{order.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Seller</span>
                  <span className="detail-value">{order.seller?.store_name || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Shipping Address</h3>
              <div className="address-box">
                <div style={{ fontWeight: 700, marginBottom: "4px" }}>Contact: {order.contact_no}</div>
                <div>{order.delivery_address}</div>
              </div>
            </div>

            <div className="details-section">
              <h3>Payment Summary</h3>
              <div className="order-summary-box">
                <div className="summary-row">
                  <span>Product Price</span>
                  <span>Rs. {order.product?.marked_price.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Quantity</span>
                  <span>x{order.quantity}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>Rs. {order.delivery_fee.toLocaleString()}</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total</span>
                  <span>Rs. {order.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Navbar 
        onLogoClick={onLogoClick} 
        onCartClick={onCartClick} 
        isCustomerAuth={true} 
        onLogoutClick={onLogoutClick} 
        onProfileClick={onProfileClick}
        onOrdersClick={() => setActiveTab("pending")}
        cartCount={cartCount}
        globalSettings={globalSettings}
        onAboutClick={onAboutClick}
      />
      
      <div className="customer-orders-container home-content-wrapper" style={{ flex: 1 }}>
        <div className="customer-orders-header">
          <button onClick={onBack} className="back-btn">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h1>My Orders</h1>
          <p>Track and manage your recent purchases and order history.</p>
        </div>

        <div className="customer-orders-tabs">
          <button 
            className={`order-tab ${activeTab === "pending" ? "active" : ""}`} 
            onClick={() => setActiveTab("pending")}
          >
            Pending Orders ({pendingOrders.length})
          </button>
          <button 
            className={`order-tab ${activeTab === "past" ? "active" : ""}`} 
            onClick={() => setActiveTab("past")}
          >
            Past Orders ({pastOrders.length})
          </button>
        </div>

        <div className="customer-orders-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Fetching your orders...</p>
            </div>
          ) : (activeTab === "pending" ? pendingOrders : pastOrders).length > 0 ? (
            <div className="orders-list">
              {(activeTab === "pending" ? pendingOrders : pastOrders).map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="empty-orders-state">
              <div className="empty-icon">
                <ShoppingBag size={48} />
              </div>
              <h3>No {activeTab} orders found</h3>
              <p>You haven't placed any {activeTab} orders yet. start shopping now!</p>
              <button onClick={onBack} className="shop-now-btn">Start Shopping</button>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      <Footer />
    </div>
  );
}
