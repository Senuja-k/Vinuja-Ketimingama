import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { ChevronDown, CheckCircle, Edit, PackageOpen, Search, PlusCircle, User } from 'lucide-react';
import OrdersView from '../components/seller/OrdersView';
import ProductsApprovalsView from '../components/seller/ProductsApprovalsView';
import ProductsView from '../components/seller/ProductsView';
import TransactionsModal from '../components/seller/TransactionsModal';
import TransactionsView from '../components/seller/TransactionsView';
import SellerEditProfileModal from '../components/seller/SellerEditProfileModal';
import '../styles.css';
import api from '../api/api';

export default function SellerDashboard({ name = "Seller", onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportWeek, setReportWeek] = useState(1);
  const [reportTimeframe, setReportTimeframe] = useState('Monthly');
  const [isUpdateStoreOpen, setIsUpdateStoreOpen] = useState(false);
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const TRANSACTION_REQUESTS_STORAGE_KEY = "sellerTransactionRequests";
  const [isStoreStatusOpen, setIsStoreStatusOpen] = useState(false);
  const [isStoreStatusSavedPopup, setIsStoreStatusSavedPopup] = useState(false);
  const [storeStatus, setStoreStatus] = useState('active');
  const [storeStatusError, setStoreStatusError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerAddModal, setTriggerAddModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const STORE_STATUS_STORAGE_KEY = "storeActivationStatuses";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchTransactions();
  }, [reportTimeframe, reportYear, reportMonth, reportWeek]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/seller/transactions');
      setTransactionsList(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/seller/dashboard', {
        params: {
          timeframe: reportTimeframe,
          year: reportYear,
          month: reportMonth,
          week: reportWeek
        }
      });
      const data = res.data;
      setStoreStatus(data.store_status === 1 ? 'active' : 'inactive');
      setWalletBalance(data.wallet_balance || 0);
      setClaimedAmount(data.claimed_amount || 0);
      setTotalSales(data.total_sales_amount || 0);
      setOrdersCount(data.total_orders_count || 0);
      setProductsCount(data.products_count || 0);
      setApprovalsCount(data.pending_approvals_count || 0);
      setRequestedAmount(data.requested_amount || 0);
      setTotalCommission(data.total_commission || 0);
      setRequestStatus(data.request_status || 'idle');

      // Fetch Profile for real-time data
      const profRes = await api.get('/seller/profile');
      const p = profRes.data;
      setSellerProfile({
        username: p.username || "",
        firstName: p.first_name || "",
        lastName: p.last_name || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setStoreDetails({
        storeName: p.store_name || "",
        firstName: p.first_name || "",
        lastName: p.last_name || "",
        address: p.address || "",
        email: p.email || "",
        contactNo: p.contact || "",
        username: p.username || "",
        password: "", // Security
        bankName: p.bank_name || "",
        branch: p.branch || "",
        accountNo: p.account_no || "",
        accountHolderName: p.account_holder_name || "",
        promo_code: p.promo_code || "",
        profile_picture_url: p.profile_picture_url ? p.profile_picture_url.replace('127.0.0.1', 'localhost') : null
      });
      setImagePreview(null); // Reset local preview on fetch
    } catch (err) {
      console.error(err);
    }
  };

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [approvalsCount, setApprovalsCount] = useState(0);
  const [requestedAmount, setRequestedAmount] = useState(0);
  const [requestStatus, setRequestStatus] = useState('idle');
  const [claimedAmount, setClaimedAmount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [requestErrorMessage, setRequestErrorMessage] = useState("");
  const [transactionsList, setTransactionsList] = useState([]);
  
  // Profile Modal States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSavedModalOpen, setProfileSavedModalOpen] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [sellerProfile, setSellerProfile] = useState({
    username: 'Sithum',
    firstName: 'Sithum',
    lastName: 'Sen',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [storeDetails, setStoreDetails] = useState({
    storeName: '', firstName: '', lastName: '', address: '', email: '', 
    contactNo: '', username: '', password: '', bankName: '', branch: '', 
    accountNo: '', accountHolderName: '', profile_picture: null, profile_picture_url: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleStoreDetailsChange = (field, value) => {
    if (field === 'profile_picture' && value) {
      setImagePreview(URL.createObjectURL(value));
    }
    setStoreDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateStore = async () => {
    try {
      const formData = new FormData();
      formData.append('store_name', storeDetails.storeName);
      formData.append('address', storeDetails.address);
      formData.append('email', storeDetails.email);
      formData.append('contact', storeDetails.contactNo);
      formData.append('bank_name', storeDetails.bankName);
      formData.append('branch', storeDetails.branch);
      formData.append('account_no', storeDetails.accountNo);
      formData.append('account_holder_name', storeDetails.accountHolderName);
      formData.append('_method', 'PUT'); // Spoofing PUT for FormData support in Laravel

      if (storeDetails.profile_picture instanceof File) {
        formData.append('profile_picture', storeDetails.profile_picture);
      }

      await api.post('/seller/store-details', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsUpdateStoreOpen(false);
      setShowSuccessPopup(true);
      fetchDashboardData();
    } catch (err) {
      Swal.fire(err.response?.data?.message || "Failed to update store details");
    }
  };

  const handleStoreStatusSave = async (status) => {
    if (status === 'active' && storeStatus === 'inactive') {
      setStoreStatusError('Reactivation requires admin approval. Please contact your admin to re-open the store.');
      return;
    }

    try {
      const dbStatus = status === 'active' ? 1 : 0;
      await api.put('/seller/status', { status: dbStatus });
      setStoreStatus(status);
      setStoreStatusError("");
      setIsStoreStatusOpen(false);
      setIsStoreStatusSavedPopup(true);
    } catch (err) {
      setStoreStatusError(err.response?.data?.message || 'Failed to update store status');
    }
  };

  const closeStoreStatusSavedPopup = () => {
    setIsStoreStatusSavedPopup(false);
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
  };

// Legacy localStorage sync removed. Using direct API state from fetchDashboardData.

  const handleCreateClaimRequest = async (amount) => {
    const sanitizedAmount = Number(amount);
    if (!sanitizedAmount || sanitizedAmount <= 0) {
      setRequestErrorMessage('Please enter a valid positive amount.');
      return;
    }
    if (sanitizedAmount > walletBalance) {
      setRequestErrorMessage('Requested amount exceeds current wallet balance.');
      return;
    }

    try {
      await api.post('/seller/transactions/request', { requested_amount: sanitizedAmount });
      setRequestedAmount(sanitizedAmount);
      setRequestStatus('pending');
      setRequestErrorMessage('');
      fetchTransactions();
    } catch (err) {
      setRequestErrorMessage(err.response?.data?.message || 'Unable to submit your request. Try again.');
    }
  };

  const handleSellerProfileChange = (field, value) => {
    setSellerProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    // Validation
    if (!sellerProfile.firstName.trim()) {
      setProfileErrorMessage("First name cannot be empty");
      return;
    }
    if (!sellerProfile.lastName.trim()) {
      setProfileErrorMessage("Last name cannot be empty");
      return;
    }
    if (sellerProfile.newPassword || sellerProfile.confirmPassword) {
      if (!sellerProfile.currentPassword.trim()) {
        setProfileErrorMessage("Current password is required to change password");
        return;
      }
      if (!sellerProfile.newPassword.trim()) {
        setProfileErrorMessage("New password cannot be empty");
        return;
      }
      if (sellerProfile.newPassword !== sellerProfile.confirmPassword) {
        setProfileErrorMessage("New password and confirm password do not match");
        return;
      }
    }

    try {
      const payload = {
        first_name: sellerProfile.firstName,
        last_name: sellerProfile.lastName,
        username: sellerProfile.username,
      };

      if (sellerProfile.newPassword) {
        payload.password = sellerProfile.newPassword;
      }

      await api.put('/seller/profile', payload);

      setProfileErrorMessage("");
      setProfileModalOpen(false);
      setProfileSavedModalOpen(true);
      fetchDashboardData();
    } catch (err) {
      setProfileErrorMessage(err.response?.data?.message || "Failed to update profile");
    }
  };

  const closeProfileSavedModal = () => {
    setProfileSavedModalOpen(false);
  };

  const getReportValue = (baseValue) => {
    return baseValue || 0;
  };

  const formatCurrency = (value) => `Rs. ${Number(getReportValue(value)).toLocaleString()}`;

  const renderDashboardGrid = () => (
    <>
      <div className="seller-dashboard-summary-grid responsive-grid">
        
        {/* Card 1 */}
        <div className="seller-dashboard-card" style={{ backgroundColor: "#c8a07d", cursor: "pointer" }}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#111" }}>Total Sales:</div>
          <div style={{ textAlign: "right", fontSize: "20px", fontWeight: "700", color: "#111" }}>{formatCurrency(totalSales)}</div>
        </div>

        {/* Card 2 */}
        <div className="seller-dashboard-card" style={{ backgroundColor: "#c57a6d" }}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#111" }}>Claimed Amount:</div>
          <div style={{ textAlign: "right", fontSize: "20px", fontWeight: "700", color: "#111" }}>{formatCurrency(claimedAmount)}</div>
        </div>

        {/* Card 3 */}
        <div className="seller-dashboard-card" style={{ backgroundColor: "#a66f73" }}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#111" }}>Remaining Amount :</div>
          <div style={{ textAlign: "right", fontSize: "20px", fontWeight: "700", color: "#111" }}>{formatCurrency(walletBalance)}</div>
        </div>

        {/* Card 3.5: Total Commission */}
        <div className="seller-dashboard-card" style={{ backgroundColor: "#4f46e5" }}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>Total Commission (3%):</div>
          <div style={{ textAlign: "right", fontSize: "20px", fontWeight: "700", color: "#fff" }}>{formatCurrency(totalCommission)}</div>
        </div>

        {/* Card 4 */}
        <div className="seller-dashboard-card" style={{ backgroundColor: "#77a2b4", cursor: "pointer" }} onClick={() => setActiveTab('orders')}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#111" }}>Total Orders:</div>
          <div style={{ textAlign: "right", fontSize: "20px", fontWeight: "700", color: "#111" }}>{getReportValue(ordersCount)}</div>
        </div>

        {/* Card 5: Approved Products */}
        <div className="seller-dashboard-card" style={{ backgroundColor: "#405a88", cursor: "pointer" }} onClick={() => setActiveTab('products')}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>Products</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <PackageOpen size={22} color="#fff" strokeWidth={1.5} />
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>{getReportValue(productsCount)}</div>
          </div>
        </div>

        {/* Card 6: Pending Approvals */}
        <div className="seller-dashboard-card" style={{ backgroundColor: "#ea580c", cursor: "pointer" }} onClick={() => setActiveTab('approvals')}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#fff" }}>Product Approvals</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <CheckCircle size={22} color="#fff" strokeWidth={1.5} />
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>{getReportValue(approvalsCount)}</div>
          </div>
        </div>

        {/* Card 7: Transactions History */}
        <div className="seller-dashboard-card" style={{ backgroundColor: "#9ec5bc", cursor: "pointer" }} onClick={() => setActiveTab('transactions')}>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#111" }}>Transactions History</div>
          <div style={{ textAlign: "right", fontSize: "20px", fontWeight: "700", color: "#111" }}>{transactionsList.length}</div>
        </div>

      </div>

      {/* Full-width Transaction Button */}
      <div className="seller-dashboard-summary-action" onClick={() => setIsTransactionsOpen(true)}>
        <span style={{ fontSize: "18px", fontWeight: "600", color: "#111" }}>Transaction Request</span>
      </div>
    </>
  );

  return (
    <div className="container" style={{ paddingTop: "90px", paddingBottom: "50px" }}>
      <Navbar 
        isAdminAuth={true} 
        onLogoutClick={onLogout}
        onProfileClick={() => setProfileModalOpen(true)}
      />

      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup-card">
            <button className="success-popup-close" onClick={closeSuccessPopup} type="button">×</button>
            <div className="success-popup-icon-wrapper">
              <div className="success-popup-icon-bg">
                <CheckCircle size={56} color="#fff" />
              </div>
            </div>
            <div className="success-popup-title">Store Updated Successfully!</div>
            <button className="success-popup-button" onClick={closeSuccessPopup} type="button">Close</button>
          </div>
        </div>
      )}

      <div className="seller-dashboard-header">
        <div className="seller-dashboard-header-row">
          <div className="seller-dashboard-header-left">
            <h1 className="h1-responsive" style={{ margin: 0, fontWeight: "600", color: "#111" }}>Hii {name}, Welcome to Store!</h1>
              {activeTab === 'dashboard' && (
                <>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
                    <div style={{ position: "relative", minWidth: "140px" }}>
                      <select
                        value={reportTimeframe}
                        onChange={(e) => setReportTimeframe(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 35px 10px 15px",
                          borderRadius: "15px",
                          border: "1px solid #d1d5db",
                          backgroundColor: "#ececec",
                          fontSize: "13px",
                          color: "#111",
                          appearance: "none",
                          cursor: "pointer",
                          fontWeight: "500"
                        }}
                      >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Lifetime">Lifetime</option>
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>

                    {reportTimeframe !== "Lifetime" && (
                      <div style={{ position: "relative", minWidth: "100px" }}>
                        <select
                          value={reportYear}
                          onChange={(e) => setReportYear(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 35px 10px 15px",
                            borderRadius: "15px",
                            border: "1px solid #d1d5db",
                            backgroundColor: "#ececec",
                            fontSize: "13px",
                            appearance: "none",
                            cursor: "pointer"
                          }}
                        >
                          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    )}

                    {reportTimeframe === "Monthly" && (
                      <div style={{ position: "relative", minWidth: "120px" }}>
                        <select
                          value={reportMonth}
                          onChange={(e) => setReportMonth(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 35px 10px 15px",
                            borderRadius: "15px",
                            border: "1px solid #d1d5db",
                            backgroundColor: "#ececec",
                            fontSize: "13px",
                            appearance: "none",
                            cursor: "pointer"
                          }}
                        >
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                            <option key={m} value={m}>{new Date(2000, m-1).toLocaleString('default', { month: 'long' })}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    )}

                    {reportTimeframe === "Weekly" && (
                      <div style={{ position: "relative", minWidth: "120px" }}>
                        <select
                          value={reportWeek}
                          onChange={(e) => setReportWeek(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 35px 10px 15px",
                            borderRadius: "15px",
                            border: "1px solid #d1d5db",
                            backgroundColor: "#ececec",
                            fontSize: "13px",
                            appearance: "none",
                            cursor: "pointer"
                          }}
                        >
                          {[...Array(52)].map((_, i) => <option key={i+1} value={i+1}>Week {i+1}</option>)}
                        </select>
                        <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setTriggerAddModal(true);
                    }}
                    className="add-product-btn-dashboard"
                  >
                    <PlusCircle size={20} />
                    <span>Add Product</span>
                  </button>
                </>
              )}
            </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "40px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px", borderRadius: "16px", backgroundColor: "#f0f4ff", border: "1px solid #d1d9ff" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#4f46e5" }}>Promo Code:</span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#1e1b4b" }}>{storeDetails.promo_code || "TXSB..."}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px", borderRadius: "16px", backgroundColor: "#edf7ec", border: "1px solid #d7e8d5" }}>
              <div style={{ position: "relative", width: "36px", height: "28px", borderRadius: "10px", backgroundColor: "#8b5d3b", border: "2px solid #6d4829", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
                <div style={{ position: "absolute", top: "3px", left: "4px", width: "20px", height: "16px", borderRadius: "6px", backgroundColor: "#3c8c46", transform: "rotate(-4deg)", boxShadow: "0 1px 0 rgba(0,0,0,0.12)" }} />
                <div style={{ position: "absolute", top: "5px", right: "4px", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f7ce4d", border: "2px solid #d7a61d" }} />
              </div>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#064e21" }}>Rs. {walletBalance.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setIsUpdateStoreOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              <Edit size={20} color="#111" />
            </button>
            <button
              onClick={() => { setStoreStatusError(""); setIsStoreStatusOpen(true); }}
              style={{
                backgroundColor: storeStatus === 'active' ? "#009922" : "#d97706",
                color: "white",
                border: "none",
                borderRadius: "999px",
                padding: "14px 20px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                minHeight: "48px"
              }}
            >
              Store Status: {storeStatus === 'active' ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-tabs" style={{ display: "none" }}>
        <button
          className={`tab-pill ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => { setActiveTab("dashboard"); setSearchQuery(""); }}
        >
          Dashboard
        </button>
        <button
          className={`tab-pill ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => { setActiveTab("orders"); setSearchQuery(""); }}
        >
          Orders
        </button>
        <button
          className={`tab-pill ${activeTab === "approvals" ? "active" : ""}`}
          onClick={() => { setActiveTab("approvals"); setSearchQuery(""); }}
        >
          Product Approvals
        </button>
        <button
          className={`tab-pill ${activeTab === "products" ? "active" : ""}`}
          onClick={() => { setActiveTab("products"); setSearchQuery(""); }}
        >
          Products
        </button>
      </div>

      {(activeTab === "orders" || activeTab === "approvals" || activeTab === "transactions") && (
        <div className="admin-search" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {(activeTab === "orders" || activeTab === "approvals" || activeTab === "transactions") && (
            <button
              onClick={() => { setActiveTab("dashboard"); setSearchQuery(""); }}
              style={{
                minWidth: "112px",
                height: "44px",
                borderRadius: "999px",
                border: "1px solid rgba(0,0,0,0.12)",
                background: "#ffffff",
                color: "#1f2937",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 8px 16px rgba(0,0,0,0.08)"
              }}
            >
              ← Back
            </button>
          )}
          {activeTab !== "transactions" && (
            <div style={{ position: "relative", width: "220px", minWidth: "220px" }}>
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="product-search-input"
                style={{ width: "100%", height: "44px", paddingRight: "42px" }}
              />
              <Search size={14} color="#6b7280" style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          )}
        </div>
      )}

      <div className="admin-content" style={{ flex: 1 }}>
        {activeTab === "dashboard" && renderDashboardGrid()}
        {activeTab === "orders" && <OrdersView searchQuery={searchQuery} />}
        {activeTab === "approvals" && <ProductsApprovalsView searchQuery={searchQuery} onRefresh={fetchDashboardData} />}
        {activeTab === "transactions" && <TransactionsView transactions={transactionsList} onRefresh={fetchTransactions} />}
        {activeTab === "products" && (
          <ProductsView 
            onBack={() => {
              setActiveTab('dashboard');
              setTriggerAddModal(false);
              fetchDashboardData();
            }} 
            onRefresh={fetchDashboardData}
            autoOpenAdd={triggerAddModal} 
          />
        )}
      </div>

      {/* Store Status Modal */}
      {isStoreStatusOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content">
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "20px", right: "20px" }} onClick={() => setIsStoreStatusOpen(false)}>×</button>
            <h2 className="freezing-modal-title" style={{ marginBottom: "10px" }}>Store Status</h2>
            <p style={{ marginBottom: "24px", color: "#4b5563", lineHeight: 1.8 }}>
              Your store is currently <strong style={{ color: storeStatus === 'active' ? '#047857' : '#b91c1c' }}>{storeStatus === 'active' ? 'Active' : 'Inactive'}</strong>. Use the controls below to update your storefront visibility for customers and notify admin of your current situation.
            </p>

            <div style={{ display: 'flex', gap: '18px', marginBottom: '25px' }}>
              <button
                onClick={() => handleStoreStatusSave('active')}
                disabled={storeStatus === 'inactive'}
                style={{
                  flex: 1,
                  padding: '18px 16px',
                  borderRadius: '20px',
                  border: storeStatus === 'active' ? '2px solid #047857' : '1px solid #d1d5db',
                  backgroundColor: storeStatus === 'active' ? '#ecfdf5' : storeStatus === 'inactive' ? '#f3f4f6' : '#ffffff',
                  color: storeStatus === 'inactive' ? '#6b7280' : '#065f46',
                  fontWeight: 700,
                  cursor: storeStatus === 'inactive' ? 'not-allowed' : 'pointer'
                }}
              >
                Active
                <div style={{ marginTop: '8px', fontSize: '13px', color: storeStatus === 'inactive' ? '#6b7280' : '#6b7280' }}>Open for orders</div>
              </button>
              <button
                onClick={() => handleStoreStatusSave('inactive')}
                style={{
                  flex: 1,
                  padding: '18px 16px',
                  borderRadius: '20px',
                  border: storeStatus === 'inactive' ? '2px solid #b91c1c' : '1px solid #d1d5db',
                  backgroundColor: storeStatus === 'inactive' ? '#fef2f2' : '#ffffff',
                  color: '#991b1b',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Inactive
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>Pause store visibility</div>
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '18px', padding: '22px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: storeStatus === 'active' ? '#047857' : '#d97706' }} />
                <span style={{ fontWeight: 700, color: '#111827' }}>Admin Notice</span>
              </div>
              <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.8 }}>
                When you switch your store status, the admin will know your current situation and your store will be shown accordingly. Choose <strong>Active</strong> to accept new orders, or <strong>Inactive</strong> to pause sales until you’re ready.
              </p>
              {storeStatus === 'inactive' && (
                <p style={{ margin: '14px 0 0', color: '#92400e', fontWeight: 600 }}>
                  Reactivating after inactivity requires admin approval. You cannot activate your store again without admin review.
                </p>
              )}
            </div>

            {storeStatusError && (
              <div style={{ marginBottom: '18px', color: '#b91c1c', fontWeight: 700, textAlign: 'center' }}>
                {storeStatusError}
              </div>
            )}

            <button
              onClick={() => setIsStoreStatusOpen(false)}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '14px 0',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Update Store Modal */}
      {isUpdateStoreOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content">
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "20px", right: "20px" }} onClick={() => setIsUpdateStoreOpen(false)}>×</button>
            <h2 className="freezing-modal-title" style={{ marginBottom: "25px" }}>Update Store Details</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "25px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Store Name:</label>
                  <input type="text" value={storeDetails.storeName || ""} onChange={(e) => handleStoreDetailsChange('storeName', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>First Name:</label>
                  <input type="text" value={storeDetails.firstName || ""} onChange={(e) => handleStoreDetailsChange('firstName', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Last Name:</label>
                  <input type="text" value={storeDetails.lastName || ""} onChange={(e) => handleStoreDetailsChange('lastName', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Address:</label>
                  <input type="text" value={storeDetails.address || ""} onChange={(e) => handleStoreDetailsChange('address', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Email:</label>
                  <input type="email" value={storeDetails.email || ""} onChange={(e) => handleStoreDetailsChange('email', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Contact No:</label>
                  <input type="text" value={storeDetails.contactNo || ""} onChange={(e) => handleStoreDetailsChange('contactNo', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Username:</label>
                  <input type="text" value={storeDetails.username || ""} onChange={(e) => handleStoreDetailsChange('username', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Password:</label>
                  <input type="password" value={storeDetails.password || ""} onChange={(e) => handleStoreDetailsChange('password', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Bank Name:</label>
                  <input type="text" value={storeDetails.bankName || ""} onChange={(e) => handleStoreDetailsChange('bankName', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Branch:</label>
                  <input type="text" value={storeDetails.branch || ""} onChange={(e) => handleStoreDetailsChange('branch', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Account No:</label>
                  <input type="text" value={storeDetails.accountNo || ""} onChange={(e) => handleStoreDetailsChange('accountNo', e.target.value)} className="modal-input" style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>
                <div className="input-group">
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Account Holder Name:</label>
                  <input type="text" className="modal-input" value={storeDetails.accountHolderName || ""} onChange={(e) => handleStoreDetailsChange('accountHolderName', e.target.value)} style={{ width: "100%", padding: "8px 12px", fontSize: "14px", height: "36px" }} />
                </div>

                <div className="input-group">
                  <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#333" }}>Profile Picture:</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ 
                      width: "45px", 
                      height: "45px", 
                      borderRadius: "50%", 
                      overflow: "hidden", 
                      border: "1px solid #eee",
                      backgroundColor: "#f8f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {(imagePreview || storeDetails.profile_picture_url) ? (
                        <img 
                          src={imagePreview || storeDetails.profile_picture_url} 
                          alt="Store Preview" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                        />
                      ) : (
                        <User size={20} color="#ccc" />
                      )}
                    </div>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {imagePreview ? "New Image Selected" : storeDetails.profile_picture_url ? "Current Profile Picture" : "No Profile Picture"}
                    </span>
                  </div>
                  <input 
                    type="file" 
                    className="modal-input" 
                    onChange={(e) => handleStoreDetailsChange('profile_picture', e.target.files[0])}
                    accept="image/*"
                    style={{ width: "100%", padding: '8px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button 
                onClick={handleUpdateStore}
                style={{ backgroundColor: "#008000", color: "white", border: "none", borderRadius: "20px", padding: "10px 40px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      <TransactionsModal 
        isOpen={isTransactionsOpen} 
        onClose={() => { setIsTransactionsOpen(false); setRequestErrorMessage(''); }} 
        walletBalance={walletBalance}
        onRequest={handleCreateClaimRequest}
        requestedAmount={requestedAmount}
        requestStatus={requestStatus}
        claimedAmount={claimedAmount}
        totalSales={totalSales}
        transactions={transactionsList}
      />
      {isStoreStatusSavedPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup-card">
            <button className="success-popup-close" onClick={closeStoreStatusSavedPopup} type="button">×</button>
            <div className="success-popup-icon-wrapper">
              <div className="success-popup-icon-bg">
                <CheckCircle size={56} color="#fff" />
              </div>
            </div>
            <div className="success-popup-title">Store Status Updated!</div>
            <div style={{ marginBottom: '18px', color: '#374151' }}>Your store is now <strong>{storeStatus === 'active' ? 'Active' : 'Inactive'}</strong>.</div>
            <button className="success-popup-button" onClick={closeStoreStatusSavedPopup} type="button">Close</button>
          </div>
        </div>
      )}

      {/* Seller Edit Profile Modal */}
      <SellerEditProfileModal 
        isOpen={profileModalOpen}
        onClose={() => { setProfileModalOpen(false); setProfileErrorMessage(""); }}
        sellerProfile={sellerProfile}
        onProfileChange={handleSellerProfileChange}
        onSave={handleSaveProfile}
        errorMessage={profileErrorMessage}
      />

      {/* Profile Saved Success Modal */}
      {profileSavedModalOpen && (
        <div className="success-popup-overlay">
          <div className="success-popup-card">
            <button className="success-popup-close" onClick={closeProfileSavedModal} type="button">×</button>
            <div className="success-popup-icon-wrapper">
              <div className="success-popup-icon-bg">
                <CheckCircle size={56} color="#fff" />
              </div>
            </div>
            <div className="success-popup-title">Profile Updated Successfully!</div>
            <button className="success-popup-button" onClick={closeProfileSavedModal} type="button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

