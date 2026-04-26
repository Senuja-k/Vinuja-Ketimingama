import Swal from 'sweetalert2';
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/layout/Navbar";
import { Search, Home, Upload, Check, BadgeCheck, XCircle, Trash2, Edit3, Clock3, Shield, Cookie, Fingerprint, Settings, User, ChevronLeft, ChevronRight } from "lucide-react";
import { getFingerprint } from "../utils/fingerprint";
import mainPostImage from "../assets/download.jfif";
import sidePostImage1 from "../assets/download (1).jfif";
import sidePostImage2 from "../assets/chocolate-strawberry-cake-on-stand-hero.jpg";
import sidePostImage3 from "../assets/handicraft-item-bag-sri-lanka-991x558.webp";
import "../styles.css";
import api from "../api/api";

// Mock data removed in favor of live API fetching.
// Keeping empty placeholders if needed for initial states.
const adminsData = [];
const pendingTransactionsData = [];
const storeActivationData = [];
const feedbacksData = [];
const marketeersData = [];
const sellersData = [];
const ordersData = [];
const productApprovalData = [];

export default function AdminDashboard({ adminName = "Hirushan", onLogout, globalSettings, onSettingsUpdate }) {
  const STORE_STATUS_STORAGE_KEY = "storeActivationStatuses";
  const [activeTab, setActiveTab] = useState("product_approval");
  const [reportsView, setReportsView] = useState("grid");
  const [storeFreezingModalOpen, setStoreFreezingModalOpen] = useState(false);
  const [postDetailsModalOpen, setPostDetailsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [commissionPercentage, setCommissionPercentage] = useState("");
  const [commissionError, setCommissionError] = useState("");
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bankDetailsModalOpen, setBankDetailsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [updateMarketeerModalOpen, setUpdateMarketeerModalOpen] = useState(false);
  const [selectedMarketeer, setSelectedMarketeer] = useState(null);
  const [rejectReasonModalOpen, setRejectReasonModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [homePageCustomizationModalOpen, setHomePageCustomizationModalOpen] = useState(false);
  const [homePageSuccess, setHomePageSuccess] = useState(false);
  const [feedbackDeletedModalOpen, setFeedbackDeletedModalOpen] = useState(false);
  const [sellerDeletedModalOpen, setSellerDeletedModalOpen] = useState(false);
  const [orderAcceptedModalOpen, setOrderAcceptedModalOpen] = useState(false);
  const [orderSentModalOpen, setOrderSentModalOpen] = useState(false);
  const [confirmDeleteSellerModalOpen, setConfirmDeleteSellerModalOpen] = useState(false);
  const [selectedSellerIndex, setSelectedSellerIndex] = useState(null);
  const [confirmDeleteMarketeerModalOpen, setConfirmDeleteMarketeerModalOpen] = useState(false);
  const [marketeerDeletedModalOpen, setMarketeerDeletedModalOpen] = useState(false);
  
  // Scroll visibility states
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const tabsRef = useRef(null);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    }
  };

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 250;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const tabsElement = tabsRef.current;
    if (tabsElement) {
      tabsElement.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();
      // Check on window resize
      window.addEventListener("resize", checkScroll);
      
      // Also check after a short delay to account for content rendering
      const timer = setTimeout(checkScroll, 500);
      
      return () => {
        tabsElement.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        clearTimeout(timer);
      };
    }
  }, []);

  // Update scroll visibility when activeTab changes (e.g. if content shifts)
  useEffect(() => {
    checkScroll();
  }, [activeTab]);
  const [selectedUserIndexToRemove, setSelectedUserIndexToRemove] = useState(null);
  const [confirmDeleteCustomerModalOpen, setConfirmDeleteCustomerModalOpen] = useState(false);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(null);
  const [customerDeletedModalOpen, setCustomerDeletedModalOpen] = useState(false);
  const [payMarketeerModalOpen, setPayMarketeerModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [detailsSavedModalOpen, setDetailsSavedModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSavedModalOpen, setProfileSavedModalOpen] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [adminNameDisplay, setAdminNameDisplay] = useState(adminName);
  const [adminProfile, setAdminProfile] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserType, setEditingUserType] = useState("");
  const [editUserData, setEditUserData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: ""
  });

  const handleOpenEditUserModal = (user, type) => {
    setEditingUser(user);
    setEditingUserType(type);
    setEditUserData({
      first_name: user.firstName || user.customerName?.split(" ")[0] || user.sellerName?.split(" ")[0] || "",
      last_name: user.lastName || user.customerName?.split(" ").slice(1).join(" ") || user.sellerName?.split(" ").slice(1).join(" ") || "",
      username: user.username || "",
      email: user.email || "",
      password: ""
    });
    setEditUserModalOpen(true);
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingUserType === "seller" ? `/admin/sellers/${editingUser.id}` : `/admin/customers/${editingUser.id}`;
      await api.put(endpoint, editUserData);
      setEditUserModalOpen(false);
      fetchAdminData();
      Swal.fire("Success", `${editingUserType === "seller" ? "Seller" : "Customer"} updated successfully!`, "success");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to update user", "error");
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const res = await api.get('/admin/profile');
      const data = res.data;
      setAdminProfile({
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        password: "", // Security: don't show hashed password
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setAdminNameDisplay(`${data.first_name} ${data.last_name}`);
    } catch (err) {
      console.error("Failed to fetch admin profile:", err);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const initialMarketeerFields = {
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    contactNo: "",
    nic: "",
    promoCode: "",
    type: "product",
    username: "",
    password: ""
  };

  const [newMarketeer, setNewMarketeer] = useState(initialMarketeerFields);

  useEffect(() => {
    setAdminNameDisplay(adminName);
    setAdminProfile(prev => ({
      ...prev,
      username: adminName.toLowerCase().replace(/\s+/g, "") || prev.username,
      firstName: adminName.split(" ")[0] || prev.firstName,
      lastName: adminName.split(" ").slice(1).join(" ") || prev.lastName,
    }));
  }, [adminName]);

  // Convert Mock Data strictly to functional Interactive State
  // Convert Mock Data strictly to functional Interactive State
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellersList, setSellersList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [marketeersList, setMarketeersList] = useState([]);
  const [adminsList, setAdminsList] = useState(adminsData);
  const TRANSACTION_REQUESTS_STORAGE_KEY = "sellerTransactionRequests";
  const [feedbacks, setFeedbacks] = useState([]);
  const [storeActivations, setStoreActivations] = useState([]);
  const [selectedStoreActivation, setSelectedStoreActivation] = useState(null);
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [transactionSlipModalOpen, setTransactionSlipModalOpen] = useState(false);
  const [transactionSlipFileName, setTransactionSlipFileName] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionSlipFile, setTransactionSlipFile] = useState(null);
  const [transactionSlipError, setTransactionSlipError] = useState("");
  const [cookies, setCookies] = useState([]);
  const [fingerprint, setFingerprint] = useState("");
  const [settings, setSettings] = useState({ cookies_enabled: "1" });
  const [fingerprints, setFingerprints] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [recordType, setRecordType] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [platformSettings, setPlatformSettings] = useState({
    homepage_disabled: "0",
    customer_signup_disabled: "0",
    seller_signup_disabled: "0",
    admin_signup_disabled: "0"
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pmModalOpen, setPmModalOpen] = useState(false);
  const [pmFormData, setPmFormData] = useState({ name: "", icon: "", is_active: true, is_disabled: false });
  const [pmEditId, setPmEditId] = useState(null);
  const [reportTimeframe, setReportTimeframe] = useState("Monthly");
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportWeek, setReportWeek] = useState(1);
  const [pagination, setPagination] = useState({
    product_approval: { page: 1, hasMore: true },
    orders: { page: 1, hasMore: true },
    sellers: { page: 1, hasMore: true },
    customers: { page: 1, hasMore: true },
    view_feedback: { page: 1, hasMore: true },
    add_marketeers: { page: 1, hasMore: true },
    add_admin: { page: 1, hasMore: true },
    transactions: { page: 1, hasMore: true }
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // ... rest of state ...

  const [banners, setBanners] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  useEffect(() => {
    if (globalSettings) {
      setPlatformSettings({
        homepage_disabled: globalSettings.homepage_disabled || "0",
        customer_signup_disabled: globalSettings.customer_signup_disabled || "0",
        seller_signup_disabled: globalSettings.seller_signup_disabled || "0",
        admin_signup_disabled: globalSettings.admin_signup_disabled || "0"
      });
    }
  }, [globalSettings]);


  const closeTransactionSlipModal = () => {
    setTransactionSlipModalOpen(false);
    setTransactionSlipFileName("");
    setTransactionSlipFile(null);
    setTransactionSlipError("");
    setSelectedTransaction(null);
  };

  useEffect(() => {
    fetchAdminData();
    if (activeTab === "security") {
      fetchSettings();
      fetchFingerprints();
      const rawCookies = document.cookie.split(';').map(c => {
        const parts = c.trim().split('=');
        return { 
          name: parts[0], 
          name_display: parts[0],
          value: parts.slice(1).join('='), 
          enabled: true 
        };
      }).filter(c => c.name !== "");
      setCookies(rawCookies);
      setFingerprint(getFingerprint());
    }
  }, [activeTab, reportTimeframe, reportYear, reportMonth, reportWeek, reportsView]);

  const handleDownloadImage = async (url, filename) => {
    try {
      const response = await api.get(`/admin/download-file?path=${encodeURIComponent(url)}`, {
        responseType: 'blob'
      });
      
      const blob = response.data;
      const blobUrl = window.URL.createObjectURL(blob);
      
      // If it's an image, we might want to open it in a new tab for viewing
      if (blob.type.startsWith('image/')) {
        window.open(blobUrl, '_blank');
      } else {
        // Otherwise download it
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // We shouldn't revoke immediately if we opened in a new tab, 
      // but for downloads it's fine after a short delay
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Download failed", error);
      window.open(url, '_blank'); 
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const fetchFingerprints = async () => {
    try {
      const res = await api.get('/admin/fingerprints');
      setFingerprints(res.data);
    } catch (err) {
      console.error("Failed to fetch fingerprints", err);
    }
  };

  const toggleCookieSystem = async () => {
    const newVal = settings.cookies_enabled === "1" ? "0" : "1";
    try {
      await api.put('/admin/settings', { cookies_enabled: newVal });
      setSettings(prev => ({ ...prev, cookies_enabled: newVal }));
    } catch (err) {
      Swal.fire("Failed to update cookie settings");
    }
  };


  const fetchAdminData = async (page = 1, isAppend = false) => {
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      if (activeTab === "product_approval") {
        const res = await api.get(`/admin/products/pending?page=${page}`);
        const data = res.data.data.map(p => ({
          id: p.id,
          storeName: p.seller?.store_name || "Unknown",
          productName: p.name,
          price: "Rs. " + p.marked_price,
          description: p.description,
          color: p.color || "-",
          quantity: p.quantity,
          size: p.size || "-",
          markedPrice: p.marked_price,
          finalPrice: "",
          images: p.images || []
        }));
        setProducts(prev => isAppend ? [...prev, ...data] : data);
        setPagination(prev => ({ ...prev, [activeTab]: { page, hasMore: res.data.current_page < res.data.last_page } }));
      } else if (activeTab === "orders") {
        const res = await api.get(`/admin/orders?page=${page}`);
        const data = res.data.data.map(o => ({
          id: o.id,
          orderNo: `O${o.id}`,
          productId: o.product_id || o.product?.id || "-",
          storeName: o.product?.seller?.store_name || "Unknown",
          productName: o.product?.name || "Unknown",
          price: "RS. " + Number(o.total_amount).toLocaleString(),
          description: o.product?.description || "No description",
          contactNumber: o.contact_no,
          deliveryAddress: o.delivery_address,
          totalAmount: "Rs. " + o.total_amount,
          status: o.status,
          orderedDate: o.created_at ? new Date(o.created_at).toLocaleDateString() : "-",
          completedDate: (o.status === 3 && o.updated_at) ? new Date(o.updated_at).toLocaleDateString() : "-",
          sellerRef: o.seller_marketeer ? (o.seller_marketeer.first_name + " " + (o.seller_marketeer.last_name || "")) : "-",
          prodRef: o.product_marketeer ? (o.product_marketeer.first_name + " " + (o.product_marketeer.last_name || "")) : 
                   (o.promo_code?.seller ? (o.promo_code.seller.first_name + " " + (o.promo_code.seller.last_name || "")) : "-"),
          paymentSlip: o.payment_slip
        }));
        setOrders(prev => isAppend ? [...prev, ...data] : data);
        setPagination(prev => ({ ...prev, [activeTab]: { page, hasMore: res.data.current_page < res.data.last_page } }));
      } else if (activeTab === "sellers" || activeTab === "store_activation") {
        const res = await api.get(`/admin/sellers?page=${page}`);
        const data = res.data.data.map(s => ({
          id: s.id,
          sellerName: s.first_name + " " + (s.last_name || ""),
          refNo: s.ref_no || `S${s.id}`,
          nic: s.nic,
          address: s.address,
          contact: s.contact,
          storeName: s.store_name,
          status: s.status === 1 ? "active" : "inactive",
          username: s.username,
          password: s.password_plain || "********", 
          bankName: s.bank_name,
          branch: s.branch,
          accountNo: s.account_no,
          accountHolderName: s.account_holder_name,
          nicFront: s.nic_image ? `/storage/${s.nic_image}` : null,
          nicBack: s.nic_back ? `/storage/${s.nic_back}` : null,
          email: s.email,
        }));
        if (activeTab === "sellers") {
          setSellersList(prev => isAppend ? [...prev, ...data] : data);
        } else {
          setStoreActivations(prev => isAppend ? [...prev, ...data] : data);
        }
        setPagination(prev => ({ ...prev, [activeTab]: { page, hasMore: res.data.current_page < res.data.last_page } }));
      } else if (activeTab === "customers") {
        const res = await api.get(`/admin/customers?page=${page}`);
        const data = res.data.data.map(c => ({
          id: c.id,
          customerName: c.first_name + " " + c.last_name,
          username: c.username,
          nic: c.nic || "-",
          address: c.address,
          contact: c.contact,
          email: c.email
        }));
        setCustomersList(prev => isAppend ? [...prev, ...data] : data);
        setPagination(prev => ({ ...prev, [activeTab]: { page, hasMore: res.data.current_page < res.data.last_page } }));
      } else if (activeTab === "view_feedback") {
        const res = await api.get(`/admin/feedbacks?page=${page}`);
        const data = res.data.data.map(f => ({
          id: f.id,
          customer: f.customer?.first_name || "Unknown",
          nic: f.customer?.nic || "-",
          feedback: f.message
        }));
        setFeedbacks(prev => isAppend ? [...prev, ...data] : data);
        setPagination(prev => ({ ...prev, [activeTab]: { page, hasMore: res.data.current_page < res.data.last_page } }));
      } else if (activeTab === "add_marketeers") {
        const res = await api.get(`/admin/marketeers?page=${page}`);
        const data = res.data.data.map(item => ({
          id: item.id,
          name: item.name,
          promoCode: item.promoCode || item.promo_code,
          total_commission: item.total_commission || 0,
          type: item.type,
          isMarketeer: item.isMarketeer,
          nic: item.nic || (item.details && (item.details.nic || item.details.NIC)),
          address: item.address || (item.details && item.details.address),
          email: item.email || (item.details && item.details.email),
          contact: item.contact || (item.details && (item.details.contact || item.details.contact_no))
        }));
        setMarketeersList(prev => isAppend ? [...prev, ...data] : data);
        setPagination(prev => ({ ...prev, [activeTab]: { page, hasMore: res.data.current_page < res.data.last_page } }));
      } else if (activeTab === "add_admin") {
        const res = await api.get(`/admin/admins?page=${page}`);
        const data = res.data.data.map(a => ({
          id: a.id,
          name: a.first_name + " " + a.last_name,
          nic: a.nic,
          address: a.address,
          username: a.username
        }));
        setAdminsList(prev => isAppend ? [...prev, ...data] : data);
        setPagination(prev => ({ ...prev, [activeTab]: { page, hasMore: res.data.current_page < res.data.last_page } }));
      } else if (activeTab === "platform_settings" || activeTab === "payment_methods") {
        const [settingsRes, pmRes] = await Promise.all([
          api.get('/admin/settings'),
          api.get('/admin/payment-methods')
        ]);
        setPlatformSettings(settingsRes.data);
        setPaymentMethods(pmRes.data);
      }
      
      if (activeTab === "reports") {
        const statsRes = await api.get('/admin/statistics', {
          params: {
            timeframe: reportTimeframe,
            year: reportYear,
            month: reportMonth,
            week: reportWeek
          }
        });
        setStatistics(statsRes.data);

        if (reportsView === "transactionHistory" || reportsView === "transactions") {
            const txRes = await api.get(`/admin/transactions?page=${page}`);
            const data = txRes.data.data.map(t => ({
                id: t.id,
                sellerName: t.seller?.first_name || "Unknown",
                refNo: t.seller?.ref_no || `S${t.seller?.id}`,
                totalSales: t.seller?.total_sales ? t.seller.total_sales.toLocaleString() : "0",
                totalClaims: (t.seller?.claimed_amount || 0).toLocaleString(),
                remainingAmount: (t.seller?.wallet_balance || 0).toLocaleString(),
                requestedAmount: t.requested_amount.toLocaleString(),
                status: t.status === 1 ? "success" : "pending",
                bankName: t.seller?.bank_name,
                branch: t.seller?.branch,
                accountNo: t.seller?.account_no,
                accountHolderName: t.seller?.account_holder_name,
                walletBalance: (t.seller?.wallet_balance || 0).toLocaleString(),
                claimedAmount: (t.seller?.claimed_amount || 0).toLocaleString(),
                slipImage: t.slip_image
            }));
            setPendingTransactions(prev => isAppend ? [...prev, ...data] : data);
            setPagination(prev => ({ ...prev, transactions: { page, hasMore: txRes.data.current_page < txRes.data.last_page } }));
        }

        if (reportsView === "orderStatus") {
            const ordersRes = await api.get(`/admin/orders?page=${page}`);
            const data = ordersRes.data.data.map(o => ({
                id: o.id,
                orderNo: `O${o.id}`,
                productId: o.product_id || o.product?.id || "-",
                storeName: o.product?.seller?.store_name || "Unknown",
                productName: o.product?.name || "Unknown",
                price: "RS. " + Number(o.total_amount).toLocaleString(),
                description: o.product?.description || "No description",
                contactNumber: o.contact_no,
                deliveryAddress: o.delivery_address,
                totalAmount: "Rs. " + o.total_amount,
                status: o.status,
                orderedDate: o.created_at ? new Date(o.created_at).toLocaleDateString() : "-",
                completedDate: (o.status === 3 && o.updated_at) ? new Date(o.updated_at).toLocaleDateString() : "-",
                sellerRef: o.seller_marketeer ? (o.seller_marketeer.first_name + " " + (o.seller_marketeer.last_name || "")) : "-",
                prodRef: o.product_marketeer ? (o.product_marketeer.first_name + " " + (o.product_marketeer.last_name || "")) : 
                        (o.promo_code?.seller ? (o.promo_code.seller.first_name + " " + (o.promo_code.seller.last_name || "")) : "-"),
                paymentSlip: o.payment_slip
            }));
            setOrders(prev => isAppend ? [...prev, ...data] : data);
            setPagination(prev => ({ ...prev, orders: { page, hasMore: ordersRes.data.current_page < ordersRes.data.last_page } }));
        }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleTableScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      const tabKey = activeTab === "reports" ? (reportsView === "orderStatus" ? "orders" : "transactions") : activeTab;
      const current = pagination[tabKey];
      if (current && current.hasMore && !isLoadingMore && !isLoading) {
        fetchAdminData(current.page + 1, true);
      }
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await api.get('/admin/banners');
      setBanners(res.data);
    } catch (err) {
      console.error("Failed to fetch banners", err);
    }
  };

  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handlePayMarketeer = async (e) => {
    e.preventDefault();
    if (!selectedMarketeer || !payAmount) return;

    setIsPaying(true);
    try {
      await api.post('/admin/marketeers/pay', {
        id: selectedMarketeer.id,
        amount: parseFloat(payAmount),
        isMarketeer: selectedMarketeer.isMarketeer
      });
      Swal.fire("Success", "Payment processed successfully!", "success");
      setPayMarketeerModalOpen(false);
      setPayAmount("");
      fetchAdminData();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to process payment", "error");
    } finally {
      setIsPaying(false);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerFile && !editingBannerId) return;

    const formData = new FormData();
    if (bannerFile) formData.append('image', bannerFile);
    
    try {
      if (editingBannerId) {
        await api.post(`/admin/banners/${editingBannerId}?_method=PUT`, formData);
        Swal.fire("Success", "Banner updated successfully!", "success");
      } else {
        if (banners.length >= 5) {
          Swal.fire("Error", "Maximum search of 5 banners reached.", "error");
          return;
        }
        await api.post('/admin/banners', formData);
        Swal.fire("Success", "Banner added successfully!", "success");
      }
      fetchBanners();
      setBannerFile(null);
      setBannerPreview(null);
      setEditingBannerId(null);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to save banner", "error");
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBannerId(banner.id);
    setBannerPreview(banner.url);
    setBannerFile(null);
  };

  const handleDeleteBanner = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This banner will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/banners/${id}`);
        fetchBanners();
        Swal.fire("Deleted!", "Banner has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete banner", "error");
      }
    }
  };

  useEffect(() => {
    if (homePageCustomizationModalOpen) {
      fetchBanners();
    }
  }, [homePageCustomizationModalOpen]);

  const handleStoreActivationStatusChange = async (newStatus) => {
    if (!selectedStoreActivation) return;
    const sellerId = selectedStoreActivation.id;
    const statusVal = newStatus === "active" ? 1 : 0;
    
    try {
      await api.put(`/admin/sellers/${sellerId}/status`, { status: statusVal });
      fetchAdminData();
      setStoreFreezingModalOpen(false);
      setSelectedStoreActivation(null);
    } catch (err) {
      Swal.fire("Failed to update store status");
    }
  };

  const handleSlipUploadChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setTransactionSlipFile(file);
    setTransactionSlipFileName(file.name);
    setTransactionSlipError('');
  };

  const handleApprovePayment = async () => {
    if (!selectedTransaction || !transactionSlipFile) return;
    
    const formData = new FormData();
    formData.append('slip_image', transactionSlipFile);
    
    try {
      await api.post(`/admin/transactions/${selectedTransaction.id}/approve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAdminData();
      closeTransactionSlipModal();
    } catch (err) {
      Swal.fire("Failed to approve transaction");
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [marketeerFilter, setMarketeerFilter] = useState("all");

  const getReportValue = (baseValue) => {
    return baseValue || 0;
  };

  const getCalculatedFinalPrice = () => {
    if (!selectedPost || !selectedPost.markedPrice) return "";
    if (commissionPercentage === "") return "-";
    
    // First remove 'Rs.' or 'Rs ' or commas, then grab the remaining valid digits/dots
    const cleanedString = selectedPost.markedPrice.toString().replace(/Rs\.?\s*/gi, '').replace(/,/g, '');
    const numberStr = cleanedString.replace(/[^0-9.]/g, '');
    const markedPrice = parseFloat(numberStr);
    
    if (isNaN(markedPrice)) return "-";
    
    const comm = parseFloat(commissionPercentage);
    if (isNaN(comm)) return "-";
    
    const finalPrice = markedPrice + (markedPrice * (comm / 100));
    return `Rs. ${finalPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}/=`;
  };

  const filteredProducts = products.filter(item => 
    String(item.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.storeName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(item => 
    (item.orderNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.storeName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReportOrders = orders.filter(item => {
    return (item.orderNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (item.storeName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
           (item.productName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredSellers = sellersList.filter(item => 
    (item.sellerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.storeName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.refNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.nic || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customersList.filter(item => 
    (item.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.nic || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.contact || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const normalizedSearch = searchQuery.toLowerCase().replace(/,/g, "").trim();
  const isNumericSearch = /^[0-9]+$/.test(normalizedSearch);
  const filteredMarketeers = marketeersList.filter(item => {
    const matchesSearch = (item.name || "").toLowerCase().includes(normalizedSearch) || 
                          (item.promoCode || "").toLowerCase().includes(normalizedSearch);
    const matchesFilter = marketeerFilter === "all" || item.type === marketeerFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredAdmins = adminsList.filter(item => 
    (item.name || "").toLowerCase().includes(normalizedSearch) || 
    (item.nic || "").toLowerCase().includes(normalizedSearch)
  );

  const filteredFeedbacks = feedbacks.filter(item => 
    (item.customer || "").toLowerCase().includes(normalizedSearch) || 
    (item.nic || "").toLowerCase().includes(normalizedSearch) ||
    (item.feedback || "").toLowerCase().includes(normalizedSearch)
  );

  const filteredStoreActivations = storeActivations.filter(item => 
    (item.storeName || "").toLowerCase().includes(normalizedSearch) || 
    (item.sellerName || "").toLowerCase().includes(normalizedSearch) ||
    (item.nic || "").toLowerCase().includes(normalizedSearch) ||
    (item.contact || "").toLowerCase().includes(normalizedSearch)
  );

  const filteredPendingTransactions = pendingTransactions.filter(item => {
    if (reportsView === "transactionHistory" && item.status !== "success") return false;
    if (reportsView !== "transactionHistory" && item.status === "success") return false;

    const totalSalesValue = String(item.totalSales || "0").toLowerCase().replace(/,/g, "");
    const totalClaimsValue = String(item.totalClaims || "0").toLowerCase().replace(/,/g, "");
    const remainingAmountValue = String(item.remainingAmount || "0").toLowerCase().replace(/,/g, "");
    const requestedAmountValue = item.requestedAmount ? String(item.requestedAmount).toLowerCase().replace(/,/g, "") : "";

    const numericMatch = (
      totalSalesValue === normalizedSearch ||
      totalClaimsValue === normalizedSearch ||
      remainingAmountValue === normalizedSearch ||
      requestedAmountValue === normalizedSearch
    );

    const textMatch = (item.sellerName || "").toLowerCase().includes(normalizedSearch) || 
                      (item.refNo || "").toLowerCase().includes(normalizedSearch);

    const partialNumberMatch = !isNumericSearch && (
      totalSalesValue.includes(normalizedSearch) ||
      totalClaimsValue.includes(normalizedSearch) ||
      remainingAmountValue.includes(normalizedSearch) ||
      (requestedAmountValue && requestedAmountValue.includes(normalizedSearch))
    );

    if (isNumericSearch) {
      return numericMatch;
    }

    return textMatch || partialNumberMatch;
  });

  // Implement Functional Processing
  const handleRejectSelectedProduct = async () => {
    if (!rejectionReason.trim()) {
      Swal.fire("Please provide a reason for rejection.");
      return;
    }
    
    try {
      const id = selectedPostIndex !== null && selectedPostIndex >= 0 ? products[selectedPostIndex].id : selectedPost?.id;
      if (!id) return;
      
      await api.post(`/admin/products/${id}/reject`, { reason: rejectionReason });
      setProducts(prev => prev.filter(item => item.id !== id));
      setRejectReasonModalOpen(false);
      setPostDetailsModalOpen(false);
      setSelectedPost(null);
      setSelectedPostIndex(null);
      setRejectionReason("");
      Swal.fire("Success", "Product rejected successfully!", "success");
    } catch (err) {
      Swal.fire("Failed to reject product");
    }
  };

  const handleAcceptProduct = async (index) => {
    const product = products[index];
    try {
      await api.post(`/admin/products/${product.id}/reject`, { reason: "Rejected by admin layout" });
      setProducts(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      Swal.fire("Error rejecting product");
    }
  };

  const handleApproveSelectedProduct = async () => {
    if (commissionPercentage === "" || commissionPercentage === null) {
      setCommissionError("Please add the commission percentage before approving.");
      return;
    }
    
    try {
      const id = selectedPostIndex !== null && selectedPostIndex >= 0 ? products[selectedPostIndex].id : selectedPost?.id;
      if (!id) return;
      
      await api.post(`/admin/products/${id}/approve`, {
        commission: parseFloat(commissionPercentage)
      });
      
      setProducts(prev => prev.filter(item => item.id !== id));
      setSelectedPost(null);
      setSelectedPostIndex(null);
      setPostDetailsModalOpen(false);
      setOrderAcceptedModalOpen(true);
      setCommissionPercentage("");
      setCommissionError("");
    } catch (err) {
      Swal.fire("Failed to approve product");
    }
  };
  const handleAcceptOrder = async (index) => {
    const order = orders[index];
    try {
      await api.post(`/admin/orders/${order.id}/accept`);
      setOrders(prev => {
        const newOrders = [...prev];
        newOrders[index] = { ...newOrders[index], status: 1 };
        return newOrders;
      });
      setOrderAcceptedModalOpen(true);
    } catch (err) {
      Swal.fire("Failed to accept order");
    }
  };
  const handleSendOrder = async (index) => {
    const order = orders[index];
    try {
      await api.post(`/admin/orders/${order.id}/send`);
      setOrders(prev => {
        const newOrders = [...prev];
        newOrders[index] = { ...newOrders[index], status: 2 };
        return newOrders;
      });
      setOrderSentModalOpen(true);
    } catch (err) {
      Swal.fire("Failed to send order to seller");
    }
  };
  const handleDeleteSeller = (index) => {
    setSelectedSellerIndex(index);
    setConfirmDeleteSellerModalOpen(true);
  };
  const confirmDeleteSeller = async () => {
    try {
      const sellerId = sellersList[selectedSellerIndex].id;
      await api.delete(`/admin/sellers/${sellerId}`);
      setSellersList(prev => prev.filter((_, i) => i !== selectedSellerIndex));
      setConfirmDeleteSellerModalOpen(false);
      setSellerDeletedModalOpen(true);
    } catch (err) {
      Swal.fire("Failed to delete seller");
    }
  };
  
  const handleDeleteCustomer = (index) => {
    setSelectedCustomerIndex(index);
    setConfirmDeleteCustomerModalOpen(true);
  };
  const confirmDeleteCustomer = async () => {
    try {
      const customerId = customersList[selectedCustomerIndex].id;
      await api.delete(`/admin/customers/${customerId}`);
      setCustomersList(prev => prev.filter((_, i) => i !== selectedCustomerIndex));
      setConfirmDeleteCustomerModalOpen(false);
      setCustomerDeletedModalOpen(true);
    } catch (err) {
      Swal.fire("Failed to delete customer");
    }
  };

  const handleDeleteFeedback = (index) => {
    setFeedbacks(prev => prev.filter((_, i) => i !== index));
    setFeedbackDeletedModalOpen(true);
  };
  const handleRemoveMarketeerOrAdmin = (index) => {
    setSelectedUserIndexToRemove(index);
    setConfirmDeleteMarketeerModalOpen(true);
  };
  const confirmDeleteMarketeer = async () => {
    if (!selectedUserIndexToRemove && selectedUserIndexToRemove !== 0) return;
    
    const list = activeTab === "add_marketeers" ? marketeersList : adminsList;
    const user = list[selectedUserIndexToRemove];
    const endpoint = activeTab === "add_marketeers" ? `/admin/marketeers/${user.id}` : `/admin/admins/${user.id}`;

    try {
      await api.delete(endpoint);
      if (activeTab === "add_marketeers") setMarketeersList(prev => prev.filter((_, i) => i !== selectedUserIndexToRemove));
      else setAdminsList(prev => prev.filter((_, i) => i !== selectedUserIndexToRemove));
      setConfirmDeleteMarketeerModalOpen(false);
      setMarketeerDeletedModalOpen(true);
    } catch (err) {
      Swal.fire("Failed to delete user");
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "add_marketeers") {
        const payload = {
          first_name: newMarketeer.firstName,
          last_name: newMarketeer.lastName,
          address: newMarketeer.address,
          email: newMarketeer.email,
          contact: newMarketeer.contactNo,
          nic: newMarketeer.nic,
          type: newMarketeer.type,
          promo_code: newMarketeer.promoCode
        };
        const res = await api.post('/admin/marketeers', payload);
        const addedMarketeer = res.data.marketeer;
        setMarketeersList(prev => [...prev, {
          id: addedMarketeer.id,
          name: `${addedMarketeer.first_name} ${addedMarketeer.last_name}`,
          nic: addedMarketeer.nic,
          address: addedMarketeer.address,
          email: addedMarketeer.email,
          contact: addedMarketeer.contact,
          promoCode: addedMarketeer.promo_code,
          total_commission: 0,
          type: addedMarketeer.type === 1 ? 'sb' : 'pb',
          isMarketeer: true
        }]);
      } else {
        const payload = {
          first_name: newMarketeer.firstName,
          last_name: newMarketeer.lastName,
          address: newMarketeer.address,
          nic: newMarketeer.nic,
          username: newMarketeer.username,
          password: newMarketeer.password
        };
        const res = await api.post('/admin/admins', payload);
        const addedAdmin = res.data.admin;
        setAdminsList(prev => [...prev, {
          id: addedAdmin.id,
          name: `${addedAdmin.first_name} ${addedAdmin.last_name}`,
          nic: addedAdmin.nic,
          address: addedAdmin.address,
          username: addedAdmin.username
        }]);
      }
      setDetailsSavedModalOpen(true);
      setNewMarketeer(initialMarketeerFields);
    } catch (err) {
      Swal.fire("Failed to save details. " + (err.response?.data?.message || err.message));
    }
  };

  const togglePlatformSetting = async (key) => {
    const newVal = platformSettings[key] === "1" ? "0" : "1";
    try {
      await api.put('/admin/settings', { [key]: newVal });
      setPlatformSettings(prev => ({ ...prev, [key]: newVal }));
      if (onSettingsUpdate) onSettingsUpdate();
    } catch (err) {
      Swal.fire("Failed to update setting");
    }
  };

  const handleSavePaymentMethod = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', pmFormData.name);
      formData.append('is_active', pmFormData.is_active);
      formData.append('is_disabled', pmFormData.is_disabled);
      if (pmFormData.iconFile) {
        formData.append('icon', pmFormData.iconFile);
      }

      const headers = { 'Content-Type': 'multipart/form-data' };
      if (pmEditId) {
        formData.append('_method', 'PUT');
        await api.post(`/admin/payment-methods/${pmEditId}`, formData, { headers });
      } else {
        await api.post('/admin/payment-methods', formData, { headers });
      }
      const res = await api.get('/admin/payment-methods');
      setPaymentMethods(res.data);
      setPmModalOpen(false);
      setPmFormData({ name: "", icon: "", is_active: true, is_disabled: false, iconFile: null });
      setPmEditId(null);
      Swal.fire("Success", "Payment method saved", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to save payment method", "error");
    }
  };

  const handleDeletePaymentMethod = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/payment-methods/${id}`);
        setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
        Swal.fire('Deleted!', 'Payment method has been deleted.', 'success');
      } catch (err) {
        Swal.fire('Error!', 'Failed to delete payment method.', 'error');
      }
    }
  };

  const handleAdminProfileChange = (field, value) => {
    setAdminProfile(prev => ({ ...prev, [field]: value }));
    if (profileErrorMessage) setProfileErrorMessage("");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErrorMessage("");

    const wantsPasswordChange = adminProfile.newPassword || adminProfile.confirmPassword;

    if (wantsPasswordChange) {
      if (adminProfile.newPassword !== adminProfile.confirmPassword) {
        setProfileErrorMessage("Confirm password does not match the entered new password.");
        return;
      }
    }

    try {
      const payload = {
        first_name: adminProfile.firstName,
        last_name: adminProfile.lastName,
        username: adminProfile.username,
      };

      if (adminProfile.newPassword) {
        payload.password = adminProfile.newPassword;
      }

      await api.put('/admin/profile', payload);

      setAdminNameDisplay(`${adminProfile.firstName} ${adminProfile.lastName}`);
      setAdminProfile(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      setProfileModalOpen(false);
      setProfileSavedModalOpen(true);
    } catch (err) {
      setProfileErrorMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <div className="container admin-dashboard-page" style={{ paddingTop: "90px", paddingBottom: "50px" }}>
      <Navbar isAdminAuth={true} onLogoutClick={onLogout} onProfileClick={() => setProfileModalOpen(true)} />

      <div className="admin-header">
        <h1 className="h1-responsive">Hii {adminNameDisplay}!</h1>
        {isMobile ? (
          <div className="admin-header-actions mobile-icon-actions">
            <button
              className={`icon-action-btn btn-header-home ${homePageCustomizationModalOpen ? "active" : ""}`}
              onClick={() => { setHomePageCustomizationModalOpen(true); setHomePageSuccess(false); }}
              aria-label="Home Page Customization"
            >
              <Home size={20} />
            </button>
            <button
              className={`icon-action-btn btn-header-store ${activeTab === "store_activation" ? "active" : ""}`}
              onClick={() => { setActiveTab("store_activation"); setSearchQuery(""); }}
              aria-label="Store Activation Status"
            >
              <Shield size={20} />
            </button>
            <button
              className={`icon-action-btn btn-header-admin ${activeTab === "add_admin" ? "active" : ""}`}
              onClick={() => {
                if (platformSettings.admin_signup_disabled === "1") {
                  Swal.fire("Disabled", "Admin sign-ups are currently disabled via Global Switches.", "warning");
                } else {
                  setActiveTab("add_admin");
                  setSearchQuery("");
                }
              }}
              style={{
                opacity: platformSettings.admin_signup_disabled === "1" ? 0.6 : 1,
                cursor: platformSettings.admin_signup_disabled === "1" ? "not-allowed" : "pointer"
              }}
              aria-label="Add Admin"
            >
              <User size={20} />
            </button>
          </div>
        ) : (
          <div className="admin-header-actions">
            <button
              className={`btn-black-rounded btn-header-home ${homePageCustomizationModalOpen ? "active" : ""}`}
              onClick={() => { setHomePageCustomizationModalOpen(true); setHomePageSuccess(false); }}
            >
              Home Page Customization
            </button>
            <button
              className={`btn-black-rounded btn-header-store ${activeTab === "store_activation" ? "active" : ""}`}
              onClick={() => { setActiveTab("store_activation"); setSearchQuery(""); }}
            >
              Store Activation Status
            </button>
            <button
              className={`btn-blue-rounded btn-header-admin ${activeTab === "add_admin" ? "active" : ""}`}
              onClick={() => {
                if (platformSettings.admin_signup_disabled === "1") {
                  Swal.fire("Disabled", "Admin sign-ups are currently disabled via Global Switches.", "warning");
                } else {
                  setActiveTab("add_admin"); 
                  setSearchQuery("");
                }
              }}
              style={{
                opacity: platformSettings.admin_signup_disabled === "1" ? 0.6 : 1,
                cursor: platformSettings.admin_signup_disabled === "1" ? "not-allowed" : "pointer"
              }}
            >
              Add Admin
            </button>
          </div>
        )}
      </div>

      <div className="tabs-scroll-container">
        {!isMobile && showLeftArrow && (
          <button className="scroll-arrow left" onClick={() => scrollTabs("left")} title="Scroll Left">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="admin-tabs" ref={tabsRef}>
        <button
          className={`tab-pill ${activeTab === "product_approval" ? "active" : ""}`}
          onClick={() => { setActiveTab("product_approval"); setSearchQuery(""); }}
        >
          Product Approval
          {activeTab === "product_approval" && <span className="notification-dot"></span>}
        </button>
        <button
          className={`tab-pill ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => { setActiveTab("orders"); setSearchQuery(""); }}
        >
          Orders
          {activeTab === "orders" && <span className="notification-dot"></span>}
        </button>
        <button
          className={`tab-pill ${activeTab === "sellers" ? "active" : ""}`}
          onClick={() => { setActiveTab("sellers"); setSearchQuery(""); }}
        >
          Sellers
          {activeTab === "sellers" && <span className="notification-dot"></span>}
        </button>
        <button
          className={`tab-pill ${activeTab === "customers" ? "active" : ""}`}
          onClick={() => { setActiveTab("customers"); setSearchQuery(""); }}
        >
          Customers
          {activeTab === "customers" && <span className="notification-dot"></span>}
        </button>
        <button
          className={`tab-pill ${activeTab === "add_marketeers" ? "active" : ""}`}
          onClick={() => { setActiveTab("add_marketeers"); setSearchQuery(""); setMarketeerFilter("all"); }}
        >
          Add Marketeers
          {activeTab === "add_marketeers" && <span className="notification-dot"></span>}
        </button>
        <button
          className={`tab-pill ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => { setActiveTab("reports"); setReportsView("grid"); }}
        >
          Reports
          {activeTab === "reports" && <span className="notification-dot"></span>}
        </button>
        <button
          className={`tab-pill ${activeTab === "view_feedback" ? "active" : ""}`}
          onClick={() => { setActiveTab("view_feedback"); setSearchQuery(""); }}
        >
          View Feedback
          {activeTab === "view_feedback" && <span className="notification-dot"></span>}
        </button>
        <button
          className={`tab-pill ${activeTab === "security" ? "active" : ""}`}
          onClick={() => { setActiveTab("security"); setSearchQuery(""); }}
        >
          Security & Cookies
        </button>
        <button
          className={`tab-pill ${activeTab === "platform_settings" ? "active" : ""}`}
          onClick={() => { setActiveTab("platform_settings"); setSearchQuery(""); }}
        >
          Global Switches
        </button>
        <button
          className={`tab-pill ${activeTab === "payment_methods" ? "active" : ""}`}
          onClick={() => { setActiveTab("payment_methods"); setSearchQuery(""); }}
        >
          Payment Methods
        </button>
        </div>
        {!isMobile && showRightArrow && (
          <button className="scroll-arrow right" onClick={() => scrollTabs("right")} title="Scroll Right">
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {activeTab !== "add_marketeers" && activeTab !== "add_admin" && activeTab !== "reports" && (
        <div className="admin-search">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {activeTab === "add_marketeers" || activeTab === "add_admin" ? (
        <div className={`marketeers-layout ${isMobile ? "stack-on-mobile-reverse" : ""}`}>
          <div className="marketeers-left">
            <div className="marketeers-filters">
              <div className="admin-search-small">
                <Search size={20} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {activeTab === "add_marketeers" && (
                <select 
                  className="filter-select"
                  value={marketeerFilter}
                  onChange={(e) => setMarketeerFilter(e.target.value)}
                >
                  <option value="all">Select</option>
                  <option value="pb">Product Based</option>
                  <option value="sb">Seller Based</option>
                </select>
              )}
            </div>

            <div className="admin-table-container" onScroll={handleTableScroll} style={{ width: "100%", overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    {activeTab === "add_marketeers" && <th>Promo Code</th>}
                    {activeTab === "add_marketeers" && <th>Total Comm.</th>}
                    <th>Details</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === "add_marketeers" ? filteredMarketeers : filteredAdmins).map((item, index) => {
                    const originalIndex = activeTab === "add_marketeers" ? marketeersList.indexOf(item) : adminsList.indexOf(item);
                    return (
                    <tr key={index}>
                      <td>{item.name}</td>
                      {activeTab === "add_marketeers" && <td>{item.promoCode}</td>}
                      {activeTab === "add_marketeers" && <td>{item.total_commission || 0}</td>}
                      <td><a href="#" className="view-link" onClick={(e) => { e.preventDefault(); setSelectedRecord(item); setRecordType(activeTab === "add_marketeers" ? "Marketeer Profile" : "Admin Profile"); setDetailsModalOpen(true); }}>View Details</a></td>

                      <td>
                        <div className={activeTab === "add_marketeers" ? "action-buttons action-buttons-icons" : "action-buttons"}>
                          <button className="icon-button btn-remove" onClick={() => handleRemoveMarketeerOrAdmin(originalIndex)} title="Remove">
                            <Trash2 size={18} />
                          </button>
                          <button className="icon-button btn-update" onClick={() => { setSelectedMarketeer(item); setUpdateMarketeerModalOpen(true); }} title="Update">
                            <Edit3 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>

          <div className="marketeers-right">
            <div className="add-marketeer-card">
              <h3 style={{ fontSize: "24px", marginBottom: "25px" }}>{activeTab === "add_marketeers" ? "Add Marketeer" : "Add Admin"}</h3>

              <form className="marketeer-form" onSubmit={handleSaveDetails}>
                <div className="form-row" style={isMobile ? { flexDirection: "column", gap: "10px" } : {}}>
                  <div className="form-group">
                    <label>First Name:</label>
                    <input type="text" className="modal-input" value={newMarketeer.firstName} onChange={(e) => setNewMarketeer(prev => ({ ...prev, firstName: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Last Name:</label>
                    <input type="text" className="modal-input" value={newMarketeer.lastName} onChange={(e) => setNewMarketeer(prev => ({ ...prev, lastName: e.target.value }))} />
                  </div>
                </div>

                <div className="form-row" style={isMobile ? { flexDirection: "column", gap: "10px" } : {}}>
                  <div className="form-group">
                    <label>Address:</label>
                    <input type="text" className="modal-input" value={newMarketeer.address} onChange={(e) => setNewMarketeer(prev => ({ ...prev, address: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input type="email" className="modal-input" value={newMarketeer.email} onChange={(e) => setNewMarketeer(prev => ({ ...prev, email: e.target.value }))} />
                  </div>
                </div>

                <div className="form-row" style={isMobile ? { flexDirection: "column", gap: "10px" } : {}}>
                  <div className="form-group">
                    <label>Contact no:</label>
                    <input type="text" className="modal-input" value={newMarketeer.contactNo} onChange={(e) => setNewMarketeer(prev => ({ ...prev, contactNo: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>NIC no:</label>
                    <input type="text" className="modal-input" value={newMarketeer.nic} onChange={(e) => setNewMarketeer(prev => ({ ...prev, nic: e.target.value }))} />
                  </div>
                </div>

                {activeTab === "add_marketeers" && (
                  <div className="form-row">
                    <div className="form-group" style={{ width: "100%" }}>
                      <label>Type:</label>
                      <select className="modal-input" style={{ width: "100%", paddingRight: "30px" }} value={newMarketeer.type} onChange={(e) => setNewMarketeer(prev => ({ ...prev, type: e.target.value }))}>
                        <option value="product">Product Based (TXPB)</option>
                        <option value="customer">Seller Based (TXSB)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab !== "add_marketeers" && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username:</label>
                      <input type="text" className="modal-input" value={newMarketeer.username || ""} onChange={(e) => setNewMarketeer(prev => ({ ...prev, username: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Password:</label>
                      <input type="password" className="modal-input" value={newMarketeer.password || ""} onChange={(e) => setNewMarketeer(prev => ({ ...prev, password: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "stretch", justifyContent: "center", gap: "15px", marginTop: "25px" }}>
                  <button type="button" className="btn-clear-details" style={isMobile ? { width: "100%" } : {}} onClick={() => setNewMarketeer(initialMarketeerFields)}>
                    Clear
                  </button>
                  <button className="btn-save-details" style={isMobile ? { width: "100%" } : {}}>Save Details! <span style={{ marginLeft: "5px" }}>💾</span></button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : ["product_approval", "orders", "sellers", "customers", "view_feedback", "store_activation"].includes(activeTab) ? (
        <div className="admin-table-container" onScroll={handleTableScroll}>
          {activeTab === "product_approval" ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product id</th>
                  <th>Store Name</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>View Post</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.storeName}</td>
                    <td>{item.productName}</td>
                    <td>{item.price}</td>
                    <td>{item.description}</td>
                    <td><a href="#" className="view-link" onClick={(e) => { e.preventDefault(); setSelectedPost(item); setSelectedPostIndex(products.findIndex(p => p.id === item.id)); setCommissionPercentage(""); setCommissionError(""); setPostDetailsModalOpen(true); }}>View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "orders" ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ordered</th>
                  <th>Completed</th>
                  <th>Store Name</th>
                  <th>Product Name</th>
                  <th>Seller Ref</th>
                  <th>Prod Ref</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>View Order</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontSize: "13px", color: "#555" }}>{item.orderedDate}</td>
                    <td style={{ fontSize: "13px", color: "#555" }}>{item.completedDate}</td>
                    <td>{item.storeName}</td>
                    <td>{item.productName}</td>
                    <td><span style={{fontSize: "13px", color: item.sellerRef !== "-" ? "#2563eb" : "#666"}}>{item.sellerRef}</span></td>
                    <td><span style={{fontSize: "13px", color: item.prodRef !== "-" ? "#2563eb" : "#666"}}>{item.prodRef}</span></td>
                    <td>{item.price}</td>
                    <td>{item.description}</td>
                    <td><a href="#" className="view-link" onClick={(e) => { e.preventDefault(); setSelectedOrder(item); setOrderDetailsModalOpen(true); }}>View details</a></td>
                    <td>
                      {item.status === 0 ? (
                        <div className="action-buttons">
                          <button className="btn-accept" onClick={() => handleAcceptOrder(orders.indexOf(item))}>Accept</button>
                        </div>
                      ) : item.status === 1 ? (
                        <div className="action-buttons">
                          <button className="btn-send" onClick={() => handleSendOrder(orders.indexOf(item))}>Send to seller</button>
                        </div>
                      ) : (
                        <span style={{color: '#666', fontStyle: 'italic', fontSize: '13px', fontWeight: '500'}}>
                          {item.status === 2 ? 'Sent to Seller' : item.status === 3 ? 'Completed' : item.status === 4 ? 'Rejected' : 'Unknown'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "sellers" ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Seller Name</th>
                  <th>Ref No.</th>
                  <th>NIC No.</th>
                  <th>Address</th>
                  <th>Store Name</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>NIC Images</th>
                  <th>Bank Details</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((item, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: "600" }}>{item.sellerName}</td>
                    <td style={{ color: "#3b82f6", fontWeight: "600" }}>{item.refNo}</td>
                    <td>{item.nic}</td>
                    <td style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.address}>{item.address}</td>
                    <td style={{ fontWeight: "600", color: "#111" }}>{item.storeName}</td>
                    <td>{item.username}</td>
                    <td style={{ fontFamily: "monospace" }}>{item.password}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span className="view-link" style={{ cursor: "pointer", fontSize: "11px" }} onClick={() => { setSelectedRecord(item); setRecordType("Seller Profile"); setDetailsModalOpen(true); }}>View NIC</span>
                      </div>
                    </td>
                    <td>
                      <span className="view-link" style={{ cursor: "pointer" }} onClick={() => { setSelectedSeller(item); setBankDetailsModalOpen(true); }}>View Bank/Profile</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-blue-rounded" style={{ padding: "6px 12px", fontSize: "12px", height: "30px", background: "#4f46e5" }} onClick={() => handleOpenEditUserModal(item, "seller")}>Edit</button>
                        <button className="btn-delete-seller" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => handleDeleteSeller(sellersList.indexOf(item))}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "customers" ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Username</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((item, index) => (
                  <tr key={index}>
                    <td>{item.customerName}</td>
                    <td>{item.username}</td>
                    <td>
                      <div className="action-buttons">
                        <span className="view-link" style={{ cursor: "pointer", marginRight: "10px" }} onClick={() => { setSelectedRecord(item); setRecordType("Customer Profile"); setDetailsModalOpen(true); }}>View Details</span>
                        <button className="btn-blue-rounded" style={{ padding: "6px 15px", fontSize: "12px", height: "30px", background: "#4f46e5", borderRadius: "15px" }} onClick={() => handleOpenEditUserModal(item, "customer")}>Edit</button>
                        <button className="btn-delete-seller" onClick={() => handleDeleteCustomer(customersList.indexOf(item))}>Delete Customer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "view_feedback" ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Feedbcak</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map((item, index) => (
                  <tr key={index}>
                    <td>{item.customer}</td>
                    <td>
                      <span style={{ fontSize: "14px", color: "#666", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", verticalAlign: "bottom" }}>
                        {item.feedback}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <span className="view-link" style={{ cursor: "pointer", marginRight: "10px" }} onClick={() => { setSelectedRecord(item); setRecordType("Feedback"); setDetailsModalOpen(true); }}>View</span>
                        <button className="btn-delete-small" onClick={() => handleDeleteFeedback(feedbacks.indexOf(item))}>Delete</button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "store_activation" ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Seller Name</th>
                  <th>NIC</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStoreActivations.map((item, index) => (
                  <tr key={index}>
                    <td>{item.storeName}</td>
                    <td>{item.sellerName}</td>
                    <td>{item.nic}</td>
                    <td>{item.contact}</td>
                    <td>
                      <span className={`status-icon ${item.status === "active" ? "status-approved" : "status-inactive"}`}>
                        {item.status === "active" ? <Check size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
                      </span>
                      <span style={{ marginLeft: "10px", textTransform: "capitalize" }}>{item.status}</span>
                    </td>
                    <td>
                      <button className="btn-update-small" onClick={() => { setSelectedStoreActivation(item); setStoreFreezingModalOpen(true); }}>Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "40px", textAlign: "center" }}>Work in progress</div>
          )}
        </div>
      ) : activeTab === "platform_settings" ? (
        <div className="admin-table-container" style={{ padding: "20px" }}>
          {/* Global Toggles */}
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "15px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "25px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>Global Switches</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {[
                { key: "homepage_disabled", label: "Disable Homepage (Maintenance)", color: "#ef4444" },
                { key: "customer_signup_disabled", label: "Disable Customer Sign-ups", color: "#f97316" },
                { key: "seller_signup_disabled", label: "Disable Seller Sign-ups", color: "#f97316" },
                { key: "admin_signup_disabled", label: "Disable Admin Sign-ups", color: "#f97316" },
              ].map(toggle => {
                const isOn = platformSettings[toggle.key] === "1";
                return (
                  <div key={toggle.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: "12px", border: "1px solid #f1f1f1", gap: "12px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500", flex: 1 }}>{toggle.label}</span>
                    {/* iOS-compatible toggle: uses <label>+<input type=checkbox> trick */}
                    <label
                      htmlFor={`toggle-${toggle.key}`}
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: "50px",
                        height: "26px",
                        flexShrink: 0,
                        cursor: "pointer",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <input
                        id={`toggle-${toggle.key}`}
                        type="checkbox"
                        checked={isOn}
                        onChange={() => togglePlatformSetting(toggle.key)}
                        style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                      />
                      <span style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "13px",
                        backgroundColor: isOn ? toggle.color : "#d1d5db",
                        WebkitTransition: "background-color 0.3s",
                        transition: "background-color 0.3s",
                      }} />
                      <span style={{
                        position: "absolute",
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        top: "3px",
                        left: isOn ? "27px" : "3px",
                        WebkitTransition: "left 0.3s",
                        transition: "left 0.3s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }} />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === "payment_methods" ? (
        <div className="admin-table-container" onScroll={handleTableScroll}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "15px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>Payment Methods</h3>
            </div>
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ position: "relative", top: "auto" }}>Icon</th>
                  <th style={{ position: "relative", top: "auto" }}>Method Name</th>
                  <th style={{ position: "relative", top: "auto" }}>Visibility</th>
                  <th style={{ position: "relative", top: "auto" }}>Availability</th>
                  <th style={{ position: "relative", top: "auto" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((pm) => (
                  <tr key={pm.id}>
                    <td style={{ fontSize: "24px" }}>
                      {pm.icon ? (
                        pm.icon.includes('.') ? (
                          <img src={`/storage/${pm.icon}`} alt="icon" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
                        ) : pm.icon
                      ) : "💰"}
                    </td>
                    <td style={{ fontWeight: "600" }}>{pm.name}</td>
                    <td>
                      <span style={{ 
                        padding: "4px 12px", 
                        borderRadius: "20px", 
                        fontSize: "12px", 
                        fontWeight: "bold",
                        backgroundColor: pm.is_active ? "#dcfce7" : "#fee2e2",
                        color: pm.is_active ? "#166534" : "#991b1b"
                      }}>
                        {pm.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        padding: "4px 12px", 
                        borderRadius: "20px", 
                        fontSize: "12px", 
                        fontWeight: "bold",
                        backgroundColor: pm.is_disabled ? "#fee2e2" : "#dcfce7",
                        color: pm.is_disabled ? "#991b1b" : "#166534"
                      }}>
                        {pm.is_disabled ? "Disabled" : "Available"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons action-buttons-icons">
                         <button className="icon-button btn-update" onClick={() => { setPmEditId(pm.id); setPmFormData({ name: pm.name, icon: pm.icon, is_active: pm.is_active, is_disabled: pm.is_disabled }); setPmModalOpen(true); }}>
                           <Edit3 size={18} />
                         </button>
                         <button className="icon-button btn-remove" onClick={() => handleDeletePaymentMethod(pm.id)}>
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "reports" ? (
        <div className="reports-layout">
          {reportsView === "grid" ? (
            <>
              <div className="reports-filters" style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <select 
                  className="filter-select"
                  value={reportTimeframe}
                  onChange={(e) => setReportTimeframe(e.target.value)}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd' }}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Lifetime">Lifetime</option>
                </select>

                {reportTimeframe !== "Lifetime" && (
                  <select 
                    className="filter-select"
                    value={reportYear}
                    onChange={(e) => setReportYear(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd' }}
                  >
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                )}

                {reportTimeframe === "Monthly" && (
                  <select 
                    className="filter-select"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd' }}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{new Date(2000, m-1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                )}

                {reportTimeframe === "Weekly" && (
                  <select 
                    className="filter-select"
                    value={reportWeek}
                    onChange={(e) => setReportWeek(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd' }}
                  >
                    {[...Array(52)].map((_, i) => <option key={i+1} value={i+1}>Week {i+1}</option>)}
                  </select>
                )}
              </div>

              <div className="reports-grid">
                <div className="report-card" style={{ backgroundColor: "#cba587" }}>
                  <div className="report-card-title">Total Sales:</div>
                  <div className="report-card-value">{statistics ? `Rs. ${Number(getReportValue(statistics.total_sales)).toLocaleString()}` : "Loading..."}</div>
                </div>
                <div className="report-card" style={{ backgroundColor: "#fadee3" }}>
                  <div className="report-card-title">Total Income:</div>
                  <div className="report-card-value">{statistics ? `Rs. ${Number(getReportValue(statistics.total_income)).toLocaleString()}` : "Loading..."}</div>
                </div>
                <div className="report-card" style={{ backgroundColor: "#baca95" }}>
                  <div className="report-card-title">Total Orders:</div>
                  <div className="report-card-value">{statistics ? getReportValue(statistics.total_orders) : "Loading..."}</div>
                </div>
                <div className="report-card" style={{ backgroundColor: "#8ab1ce" }}>
                  <div className="report-card-title">Total Products:</div>
                  <div className="report-card-value">{statistics ? statistics.total_products : "Loading..."}</div>
                </div>

                <div className="report-card" style={{ backgroundColor: "#627593", color: "black" }}>
                  <div className="report-card-title">Number of Stores:</div>
                  <div className="report-card-value">{statistics ? statistics.total_stores : "Loading..."}</div>
                </div>
                <div className="report-card" style={{ backgroundColor: "#bfa5d3" }}>
                  <div className="report-card-title">Active Stores:</div>
                  <div className="report-card-value">{statistics ? statistics.active_stores : "Loading..."}</div>
                </div>
                <div className="report-card" style={{ backgroundColor: "#d1c1ab" }}>
                  <div className="report-card-title">Number of Customers:</div>
                  <div className="report-card-value">{statistics ? statistics.total_customers : "Loading..."}</div>
                </div>
                <div className="report-card" style={{ backgroundColor: "#c0ebbc" }}>
                  <div className="report-card-title">Customer Feedbacks:</div>
                  <div className="report-card-value">{statistics ? statistics.total_feedbacks : "Loading..."}</div>
                </div>

                <div className="report-card" style={{ backgroundColor: "#bcbaaa", cursor: "pointer", gridColumn: "span 2", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 30px", minHeight: "50px", borderRadius: "30px" }} onClick={() => setReportsView("transactionHistory")}>
                  <div className="report-card-title" style={{ marginBottom: "0", fontSize: "16px" }}>Transaction History:</div>
                  <div className="report-card-value" style={{ marginTop: "0", fontSize: "24px" }}>{statistics ? statistics.transaction_history : "Loading..."}</div>
                </div>
                <div className="report-card" style={{ backgroundColor: "#b67768", cursor: "pointer", gridColumn: "span 2", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 30px", minHeight: "50px", borderRadius: "30px" }} onClick={() => setReportsView("transactions")}>
                  <div className="report-card-title" style={{ marginBottom: "0", fontSize: "16px" }}>Pending Transaction:</div>
                  <div className="report-card-value" style={{ marginTop: "0", fontSize: "24px" }}>{statistics ? statistics.pending_transactions : "Loading..."}</div>
                </div>
                <div className="report-card report-card-order-status" style={{ backgroundColor: "#8a9a8a", cursor: "pointer", gridColumn: "span 4", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 30px", minHeight: "50px", borderRadius: "30px" }} onClick={() => setReportsView("orderStatus")}>
                  <div className="report-card-title" style={{ marginBottom: "0", fontSize: "16px" }}>Order Status</div>
                  <div className="report-card-value" style={{ marginTop: "0", fontSize: "24px" }}>{statistics ? statistics.order_status : "Loading..."}</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginTop: "10px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: "44px" }}>
                <div style={{ position: "absolute", left: 0, display: "flex", gap: "10px", alignItems: "center" }}>
                  <button 
                    onClick={() => { setReportsView("grid"); setSearchQuery(""); }} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px", 
                      height: "40px", 
                      padding: "0 20px", 
                      borderRadius: "20px", 
                      backgroundColor: "#e0e0e0", 
                      border: "1px solid #d4d4d4", 
                      color: "#004080", 
                      fontSize: "16px", 
                      fontWeight: "500", 
                      cursor: "pointer", 
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)" 
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d6d6d6"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e0e0e0"}
                    title="Back to Reports Grid"
                  >
                    <span style={{ fontSize: "18px", color: "#333", marginTop: "-2px" }}>←</span> Back
                  </button>
                  <div className="admin-search-small">
                    <Search size={20} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <h2 style={{ margin: 0, fontWeight: "500", fontSize: "20px" }}>
                  {reportsView === "transactionHistory" ? "Transaction History" : 
                   reportsView === "orderStatus" ? "Order Status" : "Pending Transactions"}
                </h2>
              </div>

              <div
                className="admin-table-container"
                onScroll={handleTableScroll}
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  maxHeight: (reportsView === "orderStatus" ? filteredReportOrders.length : filteredPendingTransactions.length) > 4 ? "420px" : "none",
                  overflowY: (reportsView === "orderStatus" ? filteredReportOrders.length : filteredPendingTransactions.length) > 4 ? "auto" : "visible",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
                }}
              >
                {reportsView === "orderStatus" ? (
                  <table className="admin-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Order id</th>
                        <th>Product id</th>
                        <th>Delivery Address</th>
                        <th>Product Name</th>
                        <th>Contact No</th>
                        <th>Price</th>
                        <th>Order Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReportOrders.map((item, index) => (
                        <tr key={index}>
                          <td>{item.orderNo}</td>
                          <td>{item.productId ? `A${item.productId}` : "A1"}</td>
                          <td style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px" }} title={item.deliveryAddress}>
                            {item.deliveryAddress}
                          </td>
                          <td>{item.productName}</td>
                          <td style={{ fontSize: "13px", color: "#555" }}>{item.contactNumber}</td>
                          <td style={{ fontSize: "13px", fontWeight: "600" }}>{item.price}</td>
                          <td>
                            {(() => {
                              const statusMap = {
                                0: { label: "Pending",       bg: "#fef3c7", color: "#b45309", border: "#fde68a" },
                                1: { label: "Accepted",      bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" },
                                2: { label: "Sent to Seller",bg: "#ede9fe", color: "#7c3aed", border: "#ddd6fe" },
                                3: { label: "Completed",     bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
                                4: { label: "Cancelled",     bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
                              };
                              const s = statusMap[item.status] || { label: "Unknown", bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };
                              return (
                                <div style={{
                                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  padding: "4px 16px", backgroundColor: s.bg, borderRadius: "20px",
                                  border: `1px solid ${s.border}`, fontSize: "13px", fontWeight: "600",
                                  color: s.color, minWidth: "110px", textAlign: "center"
                                }}>
                                  {s.label}
                                </div>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                      {filteredReportOrders.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#999" }}>No orders found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="admin-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        <th>Seller Name</th>
                        <th>Ref No.</th>
                        <th>Total Sales</th>
                        <th>Total Claims</th>
                        <th>Remaining<br/>Amount</th>
                        {reportsView !== "transactionHistory" && <th>Requested<br/>Amount</th>}
                        <th>Bank Details</th>
                        {reportsView === "transactionHistory" && <th>Receipt</th>}
                        {reportsView !== "transactionHistory" && (
                          <>
                            <th>Action</th>
                            <th>Status</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPendingTransactions.map((item, index) => (
                        <tr key={index}>
                          <td>{item.sellerName}</td>
                          <td>{item.refNo}</td>
                          <td>{item.totalSales}</td>
                          <td>{item.totalClaims}</td>
                          <td>{item.remainingAmount}</td>
                          {reportsView !== "transactionHistory" && <td>{item.requestedAmount}</td>}
                          <td><a href="#" className="view-link" onClick={(e) => { e.preventDefault(); setSelectedSeller(item); setBankDetailsModalOpen(true); }}>View details</a></td>
                          {reportsView === "transactionHistory" && (
                            <td>
                              {item.slipImage ? (
                                <span 
                                  className="view-link" 
                                  style={{ cursor: "pointer" }} 
                                  onClick={() => handleDownloadImage(item.slipImage, `receipt_${item.refNo}.jpg`)}
                                >
                                  View Slip
                                </span>
                              ) : (
                                <span style={{ color: "#9ca3af" }}>No Slip</span>
                              )}
                            </td>
                          )}
                          {reportsView !== "transactionHistory" && (
                            <>
                              <td>
                                <div className="action-buttons">
                                  <button className="btn-send" style={{ borderRadius: "20px", padding: "5px 15px", fontSize: "11px" }} onClick={() => { const originalIndex = pendingTransactions.indexOf(item); setSelectedTransaction({ ...item, originalIndex }); setTransactionSlipModalOpen(true); }}>Proceed to pay</button>
                                </div>
                              </td>
                              <td>
                                {item.status === "success" ? (
                                  <div className="status-icon status-approved" title="Approved">
                                    <BadgeCheck size={16} strokeWidth={3} />
                                  </div>
                                ) : (
                                  <div className="status-icon status-rejected" title="Rejected">
                                    <XCircle size={16} strokeWidth={3} />
                                  </div>
                                )}{" "}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      ) : activeTab === "security" ? (
        <div className="security-dashboard" style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Hardware & Browser Identity Card */}
          <div style={{ 
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", 
            padding: isMobile ? "24px" : "32px", 
            borderRadius: "24px", 
            color: "white",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? "20px" : "32px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
          }}>
            <div style={{ 
              backgroundColor: "rgba(255,255,255,0.1)", 
              padding: "20px", 
              borderRadius: "20px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)"
            }}>
              <Fingerprint size={48} color="#38bdf8" />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>Device Fingerprint</h2>
              <p style={{ color: "#94a3b8", fontSize: "14px", maxWidth: "600px", margin: "0 0 16px 0" }}>
                This unique identifier is generated based on your browser and hardware configuration. It helps us secure your admin session and detect unauthorized access attempts.
              </p>
              <div style={{ 
                fontFamily: "monospace", 
                fontSize: "20px", 
                fontWeight: "700", 
                backgroundColor: "rgba(0,0,0,0.3)", 
                display: "inline-block", 
                padding: "8px 20px", 
                borderRadius: "12px",
                color: "#38bdf8",
                letterSpacing: "2px",
                border: "1px solid rgba(56, 189, 248, 0.3)"
              }}>
                {fingerprint || "GENERATING..."}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Status</div>
              <div style={{ color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <Shield size={16} /> VERIFIED
              </div>
            </div>
          </div>

          {/* Global Enable/Disable Cookies */}
          <div style={{ 
            background: "white", 
            padding: "24px", 
            borderRadius: "24px", 
            border: "1px solid #eee",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ 
                backgroundColor: settings.cookies_enabled === "1" ? "#f0fdf4" : "#fef2f2", 
                padding: "12px", 
                borderRadius: "15px" 
              }}>
                <Cookie size={24} color={settings.cookies_enabled === "1" ? "#16a34a" : "#dc2626"} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>Global Cookie Support</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                  {settings.cookies_enabled === "1" 
                    ? "The cookie banner and device tracking are currently ACTIVE for all visitors." 
                    : "The cookie system is DISABLED. No banner will be shown to new visitors."}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleCookieSystem}
              style={{
                backgroundColor: settings.cookies_enabled === "1" ? "#16a34a" : "#dc2626",
                color: "white",
                border: "none",
                padding: "10px 24px",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {settings.cookies_enabled === "1" ? "Disable System" : "Enable System"}
            </button>
          </div>


          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: "24px" }}>
            
            {/* Cookies Table */}
            <div className="admin-table-container" onScroll={handleTableScroll} style={{ margin: 0, padding: isMobile ? "12px" : "24px", borderRadius: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <Cookie size={24} color="#f97316" />
                <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Active Browser Cookies</h3>
              </div>
              
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cookie Name</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: "600" }}>{c.name}</td>
                      <td style={{ 
                        maxWidth: "300px", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis", 
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "#666"
                      }}>
                        {c.value}
                      </td>
                      <td>
                        <span style={{ 
                          backgroundColor: c.enabled ? "#ecfdf5" : "#fef2f2",
                          color: c.enabled ? "#059669" : "#dc2626",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {c.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            className="view-link"
                            style={{ background: "none", border: "none", padding: 0 }}
                            onClick={() => {
                              setSelectedRecord(c);
                              setRecordType("Cookie");
                              setDetailsModalOpen(true);
                            }}
                          >
                            View Details
                          </button>
                          <button 
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              border: "1px solid #ddd",
                              background: "#f8fafc",
                              fontSize: "11px",
                              fontWeight: "600",
                              cursor: "pointer",
                              color: "#64748b"
                            }}
                            onClick={() => {
                              setCookies(prev => prev.map((item, idx) => 
                                idx === i ? { ...item, enabled: !item.enabled } : item
                              ));
                            }}
                          >
                            {c.enabled ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {cookies.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>No cookies found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Sidebar Security Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Settings size={20} color="#666" />
                  <h4 style={{ margin: 0, fontWeight: "700" }}>Quick Actions</h4>
                </div>
                <button 
                  onClick={() => {
                    document.cookie.split(";").forEach(function(c) { 
                      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                    });
                    setCookies([]);
                    Swal.fire("All non-essential cookies have been cleared.");
                  }}
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    borderRadius: "12px", 
                    backgroundColor: "#fee2e2", 
                    color: "#991b1b", 
                    border: "none", 
                    fontWeight: "600",
                    cursor: "pointer",
                    marginBottom: "12px"
                  }}
                >
                  Clear All Cookies
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('cookie_consent');
                    Swal.fire("Consent reset. Refesh to see the banner.");
                  }}
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    borderRadius: "12px", 
                    backgroundColor: "#f3f4f6", 
                    color: "#374151", 
                    border: "none", 
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Reset Consent
                </button>
              </div>

              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px dashed #cbd5e1" }}>
                <h5 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "700" }}>Security Analytics</h5>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
                  Active Device Tracker: Captured fingerprints from users who accepted cookies.
                </p>
              </div>
            </div>

          </div>

          {/* Fingerprint History Table */}
          <div className="admin-table-container" onScroll={handleTableScroll} style={{ margin: 0, padding: "24px", borderRadius: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <Fingerprint size={24} color="#3b82f6" />
              <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Device Tracking History (Accepted Cookies)</h3>
            </div>
            
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>IP Address</th>
                  <th>User Agent</th>
                  <th>First Seen</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {fingerprints.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: "700", color: "#3b82f6", fontFamily: "monospace" }}>{f.fingerprint}</td>
                    <td>{f.ip_address}</td>
                    <td style={{ fontSize: "12px", color: "#666", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.user_agent}>
                      {f.user_agent}
                    </td>
                    <td>{new Date(f.created_at).toLocaleString()}</td>
                    <td>
                      <span 
                        className="view-link" 
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedRecord(f);
                          setRecordType("Device Fingerprint");
                          setDetailsModalOpen(true);
                        }}
                      >
                        View More
                      </span>
                    </td>

                  </tr>
                ))}

                {fingerprints.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>No device fingerprints tracked yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <div className="admin-table-container">
          <div style={{ padding: "40px", textAlign: "center" }}>Work in progress</div>
        </div>
      )}

      {/* Order Accepted Modal */}
      {orderAcceptedModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setOrderAcceptedModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#22c55e", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={40} color="white" strokeWidth={4} />
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Order Accepted<br />Successfully!
            </h2>

            <div>
              <button 
                onClick={() => setOrderAcceptedModalOpen(false)}
                style={{ backgroundColor: "#9ca3af", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Sent Modal */}
      {orderSentModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setOrderSentModalOpen(false)}>×</button>

            <div style={{ width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <BadgeCheck size={90} strokeWidth={2} fill="#22c55e" color="white" />
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Order Details<br />Sent!
            </h2>

            <div>
              <button 
                onClick={() => setOrderSentModalOpen(false)}
                style={{ backgroundColor: "#9ca3af", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Seller Modal */}
      {confirmDeleteSellerModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setConfirmDeleteSellerModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#ff1b44", width: "90px", height: "90px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ color: "white", fontSize: "65px", fontWeight: "bold", lineHeight: "1" }}>?</span>
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Delete Seller?
            </h2>

            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button 
                onClick={confirmDeleteSeller}
                style={{ backgroundColor: "#00d800", color: "white", padding: "8px 35px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Yes
              </button>
              <button 
                onClick={() => setConfirmDeleteSellerModalOpen(false)}
                style={{ backgroundColor: "#e21e1e", color: "white", padding: "8px 35px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seller Deleted Modal */}
      {sellerDeletedModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setSellerDeletedModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#e21e1e", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={40} color="white" strokeWidth={4} />
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Seller Deleted<br />Successfully!
            </h2>

            <div>
              <button 
                onClick={() => setSellerDeletedModalOpen(false)}
                style={{ backgroundColor: "#9ca3af", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Deleted Modal */}
      {feedbackDeletedModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setFeedbackDeletedModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#e21e1e", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={40} color="white" strokeWidth={4} />
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Feedback Deleted<br />Successfully!
            </h2>

            <div>
              <button 
                onClick={() => setFeedbackDeletedModalOpen(false)}
                style={{ backgroundColor: "#9ca3af", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Saved Modal */}
      {detailsSavedModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setDetailsSavedModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#22c55e", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={40} color="white" strokeWidth={4} />
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Successfully Saved<br />Details!
            </h2>

            <div>
              <button 
                onClick={() => setDetailsSavedModalOpen(false)}
                style={{ backgroundColor: "#9ca3af", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {profileSavedModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ textAlign: "center" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setProfileSavedModalOpen(false)}>×</button>
            <div style={{ backgroundColor: "#22c55e", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={40} color="white" strokeWidth={4} />
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Profile Updated!
            </h2>
            <div>
              <button 
                onClick={() => setProfileSavedModalOpen(false)}
                style={{ backgroundColor: "#9ca3af", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {profileModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="modal-content">
            <button className="modal-close" onClick={() => setProfileModalOpen(false)} style={{ fontSize: "26px", width: "40px", height: "40px", lineHeight: "38px" }}>×</button>
            <h2 className="modal-title">Edit Profile</h2>
            <form onSubmit={handleSaveProfile}>
              <div className="input-group">
                <label>Username:</label>
                <input type="text" className="modal-input" value={adminProfile.username} readOnly />
              </div>
              <div className="input-group">
                <label>First Name:</label>
                <input type="text" className="modal-input" value={adminProfile.firstName || ""} onChange={(e) => handleAdminProfileChange('firstName', e.target.value)} />
              </div>
              <div className="input-group">
                <label>Last Name:</label>
                <input type="text" className="modal-input" value={adminProfile.lastName || ""} onChange={(e) => handleAdminProfileChange('lastName', e.target.value)} />
              </div>
              <div style={{ borderTop: "1px solid #e0e0e0", margin: "20px 0" }}></div>
              <div style={{ fontWeight: 700, marginBottom: "15px" }}>Change Password</div>
              <div className="password-fields">

                <div className="input-group">
                  <label>New Password:</label>
                  <input type="password" className="modal-input" value={adminProfile.newPassword || ""} onChange={(e) => handleAdminProfileChange('newPassword', e.target.value)} placeholder="Enter new password" />
                </div>
                <div className="input-group">
                  <label>Confirm Password:</label>
                  <input type="password" className="modal-input" value={adminProfile.confirmPassword || ""} onChange={(e) => handleAdminProfileChange('confirmPassword', e.target.value)} placeholder="Confirm new password" />
                </div>
              </div>
              {profileErrorMessage && (
                <div style={{ color: "#b91c1c", fontWeight: 700, marginBottom: "16px", textAlign: "center" }}>
                  {profileErrorMessage}
                </div>
              )}
              <button className="login-button" type="submit" style={{ width: "260px", margin: "20px auto 0", display: "block" }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="modal-content" style={{ width: "450px", padding: "40px" }}>
            <button className="modal-close" onClick={() => setEditUserModalOpen(false)} style={{ fontSize: "26px", width: "40px", height: "40px", lineHeight: "38px" }}>×</button>
            <h2 className="modal-title">Edit {editingUserType === "seller" ? "Seller" : "Customer"}</h2>
            <form onSubmit={handleSaveUserEdit}>
              <div className="input-group">
                <label style={{ width: "120px" }}>First Name:</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  value={editUserData.first_name} 
                  onChange={(e) => setEditUserData({...editUserData, first_name: e.target.value})} 
                  required
                />
              </div>
              <div className="input-group">
                <label style={{ width: "120px" }}>Last Name:</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  value={editUserData.last_name} 
                  onChange={(e) => setEditUserData({...editUserData, last_name: e.target.value})} 
                  required
                />
              </div>
              <div className="input-group">
                <label style={{ width: "120px" }}>Username:</label>
                <input 
                  type="text" 
                  className="modal-input" 
                  value={editUserData.username} 
                  onChange={(e) => setEditUserData({...editUserData, username: e.target.value})} 
                  required
                />
              </div>
              <div className="input-group">
                <label style={{ width: "120px" }}>Email:</label>
                <input 
                  type="email" 
                  className="modal-input" 
                  value={editUserData.email} 
                  onChange={(e) => setEditUserData({...editUserData, email: e.target.value})} 
                  required
                />
              </div>
              <div style={{ borderTop: "1px solid #e0e0e0", margin: "20px 0" }}></div>
              <div style={{ fontWeight: 700, marginBottom: "15px" }}>Change Password (Optional)</div>
              <div className="input-group">
                <label style={{ width: "120px" }}>New Password:</label>
                <input 
                  type="password" 
                  className="modal-input" 
                  value={editUserData.password} 
                  onChange={(e) => setEditUserData({...editUserData, password: e.target.value})} 
                  placeholder="Leave blank to keep current"
                />
              </div>
              <button className="login-button" type="submit" style={{ width: "200px", margin: "30px auto 0", display: "block" }}>Update User</button>
            </form>
          </div>
        </div>
      )}

      {/* Store Freezing Modal */}
      {storeFreezingModalOpen && (
        <div className="modal-overlay">
          <div className="freezing-modal-content">
            <button className="freezing-modal-close" onClick={() => { setStoreFreezingModalOpen(false); setSelectedStoreActivation(null); }}>×</button>
            <h2 className="freezing-modal-title">Store Activation</h2>

            <div className="freezing-details">
              <div className="freezing-row">
                <div className="freezing-label">Store Name:</div>
                <div className="freezing-value">{selectedStoreActivation?.storeName || "-"}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Seller Name:</div>
                <div className="freezing-value">{selectedStoreActivation?.sellerName || "-"}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">NIC:</div>
                <div className="freezing-value">{selectedStoreActivation?.nic || "-"}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Contact:</div>
                <div className="freezing-value">{selectedStoreActivation?.contact || "-"}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Current Status:</div>
                <div className="freezing-value">
                  <span className={`status-icon ${selectedStoreActivation?.status === "active" ? "status-approved" : "status-inactive"}`}>
                    {selectedStoreActivation?.status === "active" ? <Check size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
                  </span>
                  <span style={{ marginLeft: "10px", textTransform: "capitalize" }}>{selectedStoreActivation?.status || "unknown"}</span>
                </div>
              </div>
            </div>

            <div className="freezing-actions">
              <button className="btn-reject" onClick={() => handleStoreActivationStatusChange("inactive")}>Reject</button>
              <button className="btn-accept-green" onClick={() => handleStoreActivationStatusChange("active")}>Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {postDetailsModalOpen && (
        <div className="modal-overlay">
          <div className="post-details-modal-content" style={{ minHeight: commissionError ? "700px" : "640px", paddingBottom: "35px" }}>
            <button className="freezing-modal-close" onClick={() => setPostDetailsModalOpen(false)}>×</button>

            <div className="post-images-grid">
              <div className="post-main-image">
                <img 
                  src={selectedPost?.images?.[0]?.url || "https://placehold.co/300x300?text=No+Image"} 
                  alt="Main View" 
                />
              </div>
              <div className="post-side-images">
                {[1, 2, 3].map((num) => (
                  <img 
                    key={num}
                    src={selectedPost?.images?.[num]?.url || "https://placehold.co/150x150?text=No+Image"} 
                    alt={`Side ${num}`} 
                  />
                ))}
              </div>
            </div>

            <h2 className="freezing-modal-title">Post Details</h2>

            <div className="freezing-details">
              <div className="freezing-row">
                <div className="freezing-label">Id:</div>
                <div className="freezing-value">{selectedPost?.id || "A1"}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Description:</div>
                <div className="freezing-value">{selectedPost?.description}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Color:</div>
                <div className="freezing-value">{selectedPost?.color}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Quantity:</div>
                <div className="freezing-value">{selectedPost?.quantity}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Size:</div>
                <div className="freezing-value">{selectedPost?.size}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Marked Price:</div>
                <div className="freezing-value">{selectedPost?.markedPrice}</div>
              </div>
              <div className="freezing-row" style={{ alignItems: "center" }}>
                <div className="freezing-label">Enter Commission Percentage:</div>
                <div className="freezing-value">
                  <input
                    type="number"
                    placeholder="--%"
                    value={commissionPercentage}
                    onChange={(e) => { setCommissionPercentage(e.target.value); if (commissionError) setCommissionError(""); }}
                    style={{
                      width: "80px",
                      padding: "5px",
                      borderRadius: "15px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
              {commissionError && (
                <div style={{ display: "flex", justifyContent: "center", width: "100%", color: "#b91c1c", fontWeight: 700, margin: "18px 0", textAlign: "center", padding: "0 8px" }}>
                  {commissionError}
                </div>
              )}
              {commissionPercentage !== "" && (
                <div className="freezing-row">
                  <div className="freezing-label">Final price:</div>
                  <div className="freezing-value">{getCalculatedFinalPrice()}</div>
                </div>
              )}
            </div>

            <div className="freezing-actions" style={{ marginTop: "25px" }}>
              <button className="btn-accept-green" onClick={handleApproveSelectedProduct}>Approve</button>
              <button className="btn-reject" onClick={() => setRejectReasonModalOpen(true)}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {orderDetailsModalOpen && (
        <div className="modal-overlay">
          <div className="post-details-modal-content" style={{ width: "450px", padding: "40px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "20px", right: "20px" }} onClick={() => setOrderDetailsModalOpen(false)}>×</button>

            <h2 className="freezing-modal-title" style={{ marginBottom: "35px" }}>Order Details</h2>

            <div className="freezing-details" style={{ gap: "18px" }}>
              <div className="freezing-row">
                <div className="freezing-label">Order No:</div>
                <div className="freezing-value">{selectedOrder?.orderNo || "O1"}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Store Name:</div>
                <div className="freezing-value">{selectedOrder?.storeName}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Product Name:</div>
                <div className="freezing-value">{selectedOrder?.productName}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Contact number:</div>
                <div className="freezing-value">{selectedOrder?.contactNumber}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Delivery Address:</div>
                <div className="freezing-value">{selectedOrder?.deliveryAddress}</div>
              </div>
              <div className="freezing-row">
                <div className="freezing-label">Total Amount:</div>
                <div className="freezing-value">{selectedOrder?.totalAmount}</div>
              </div>
              {selectedOrder?.paymentSlip && (
                <div className="freezing-row" style={{ marginTop: '10px', borderTop: '1px dashed #eee', paddingTop: '15px' }}>
                  <div className="freezing-label">Payment Slip:</div>
                  <div className="freezing-value">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {['jpg', 'jpeg', 'png', 'gif'].includes(selectedOrder.paymentSlip.split('.').pop().toLowerCase()) && (
                        <div style={{ width: '100%', maxHeight: '200px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #eee' }}>
                          <img 
                            src={`/storage/${selectedOrder.paymentSlip}`} 
                            alt="Slip Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                            onClick={() => window.open(`/storage/${selectedOrder.paymentSlip}`, '_blank')}
                          />
                        </div>
                      )}
                      <button 
                        onClick={() => handleDownloadImage(`/storage/${selectedOrder.paymentSlip}`, `slip_${selectedOrder.orderNo}`)}
                        style={{ 
                          backgroundColor: '#f3f4f6', 
                          border: '1px solid #ddd', 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>📄 View / Download Slip</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="freezing-actions" style={{ marginTop: "40px" }}>
              <button className="btn-black-rounded" style={{ padding: "10px 40px", fontSize: "16px" }} onClick={() => setOrderDetailsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {bankDetailsModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "450px", padding: "40px", background: "#f8f9fa", borderRadius: "20px", position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "#111" }} onClick={() => setBankDetailsModalOpen(false)}>×</button>

            <h2 style={{ fontSize: "22px", fontWeight: "400", color: "#111", marginBottom: "40px", textAlign: "center" }}>
              Bank Details
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "25px", padding: "0 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#333" }}>Bank Name:</span>
                <span style={{ fontSize: "14px", color: "#111", width: "180px", textAlign: "left" }}>{selectedSeller?.bankName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#333" }}>Branch:</span>
                <span style={{ fontSize: "14px", color: "#111", width: "180px", textAlign: "left" }}>{selectedSeller?.branch}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#333" }}>Account No:</span>
                <span style={{ fontSize: "14px", color: "#111", width: "180px", textAlign: "left" }}>{selectedSeller?.accountNo}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", color: "#333" }}>Account Holder Name:</span>
                <span style={{ fontSize: "14px", color: "#111", width: "180px", textAlign: "left" }}>{selectedSeller?.accountHolderName}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Marketeer Modal */}
      {updateMarketeerModalOpen && (
        <div className="modal-overlay">
          <div className="post-details-modal-content" style={{ width: "500px", padding: "40px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "20px", right: "20px" }} onClick={() => setUpdateMarketeerModalOpen(false)}>×</button>

            <h2 className="freezing-modal-title" style={{ marginBottom: "35px", fontSize: "28px" }}>
              {activeTab === "add_marketeers" ? "Update Marketeer" : "Update Admin"}
            </h2>

            <form className="marketeer-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-row" style={isMobile ? { flexDirection: "column", gap: "10px" } : {}}>
                <div className="form-group">
                  <label>First Name:</label>
                  <input type="text" className="modal-input" defaultValue={selectedMarketeer?.name?.split(' ')[0] || ''} />
                </div>
                <div className="form-group">
                  <label>Last Name:</label>
                  <input type="text" className="modal-input" defaultValue={selectedMarketeer?.name?.split(' ').slice(1).join(' ') || ''} />
                </div>
              </div>

              <div className="form-row" style={isMobile ? { flexDirection: "column", gap: "10px" } : {}}>
                <div className="form-group">
                  <label>Address:</label>
                  <input type="text" className="modal-input" defaultValue={selectedMarketeer?.address || ''} />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input type="email" className="modal-input" />
                </div>
              </div>

              <div className="form-row" style={isMobile ? { flexDirection: "column", gap: "10px" } : {}}>
                <div className="form-group">
                  <label>Contact no:</label>
                  <input type="text" className="modal-input" />
                </div>
                {activeTab !== "add_marketeers" && (
                  <div className="form-group">
                    <label>NIC:</label>
                    <input type="text" className="modal-input" defaultValue={selectedMarketeer?.nic || ''} />
                  </div>
                )}
              </div>

              {activeTab !== "add_marketeers" && (
                <div className="form-row" style={isMobile ? { flexDirection: "column", gap: "10px" } : {}}>
                  <div className="form-group">
                    <label>Username:</label>
                    <input type="text" className="modal-input" />
                  </div>
                  <div className="form-group">
                    <label>Password:</label>
                    <input type="password" className="modal-input" />
                  </div>
                </div>
              )}

              <div className="freezing-actions" style={{ marginTop: "30px", justifyContent: "center" }}>
                <button className="btn-black-rounded" style={{ padding: "10px 40px", fontSize: "16px" }} onClick={() => setUpdateMarketeerModalOpen(false)}>Update Details!</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectReasonModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "500px", padding: "40px", background: "white" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "20px", right: "20px" }} onClick={() => setRejectReasonModalOpen(false)}>×</button>

            <h2 className="freezing-modal-title" style={{ marginBottom: "25px", fontWeight: "500" }}>Reason for Rejection</h2>

            <div style={{ textAlign: "left", marginBottom: "30px", padding: "0 15px" }}>
              <label style={{ fontSize: "14px", color: "#333", marginBottom: "15px", display: "block" }}>State the reason for rejection:</label>
              <textarea
                className="modal-input"
                rows="4"
                style={{ width: "100%", borderRadius: "12px", resize: "none", padding: "15px", boxSizing: "border-box", border: "1px solid #ccc" }}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                className="btn-blue-rounded"
                style={{ padding: "10px 50px", fontSize: "16px", backgroundColor: "#0284c7" }}
                onClick={handleRejectSelectedProduct}
              >
                Done!
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Home Page Customization Modal */}
      {homePageCustomizationModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "600px", padding: "40px", background: "white", borderRadius: "24px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => {
              setHomePageCustomizationModalOpen(false);
              setEditingBannerId(null);
              setBannerFile(null);
              setBannerPreview(null);
            }}>×</button>

            <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#111", marginBottom: "30px", textAlign: "center" }}>
              Home Page Customization
            </h2>

            {/* Banner List */}
            <div style={{ marginBottom: "40px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "500", color: "#666", marginBottom: "15px" }}>Existing Banners ({banners.length}/5)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "300px", overflowY: "auto", padding: "5px" }}>
                {banners.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#999", border: "1px dashed #ccc", borderRadius: "15px" }}>
                    No banners added yet.
                  </div>
                ) : (
                  banners.map((banner) => (
                    <div key={banner.id} style={{ display: "flex", alignItems: "center", gap: "15px", background: "#f8f9fa", padding: "10px", borderRadius: "15px", border: "1px solid #eee" }}>
                      <img src={banner.url} alt="Banner" style={{ width: "100px", height: "50px", objectFit: "cover", borderRadius: "8px" }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "14px", color: "#333" }}>Banner #{banner.id}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleEditBanner(banner)} style={{ padding: "6px", borderRadius: "8px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Edit3 size={16} color="#444" />
                        </button>
                        <button onClick={() => handleDeleteBanner(banner.id)} style={{ padding: "6px", borderRadius: "8px", border: "1px solid #fee2e2", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add / Edit Form */}
            <div style={{ padding: "20px", background: "#f1f5f9", borderRadius: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "500", color: "#334155", marginBottom: "15px" }}>
                {editingBannerId ? "Edit Banner" : "Add New Banner"}
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ position: "relative" }}>
                  <label style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "10px", 
                    width: "100%", 
                    height: "150px", 
                    border: "2px dashed #94a3b8", 
                    borderRadius: "15px", 
                    cursor: "pointer", 
                    backgroundColor: "#fff",
                    overflow: "hidden"
                  }}>
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <>
                        <Upload size={32} color="#64748b" />
                        <span style={{ fontSize: "14px", color: "#64748b" }}>Click to upload banner image</span>
                      </>
                    )}
                    <input type="file" hidden accept="image/*" onChange={handleBannerFileChange} />
                  </label>
                  {bannerPreview && (
                    <button 
                      onClick={() => { setBannerFile(null); setBannerPreview(null); if (editingBannerId) setEditingBannerId(null); }}
                      style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.5)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ×
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    onClick={handleSaveBanner}
                    disabled={!bannerFile && (!editingBannerId || bannerPreview === banners.find(b => b.id === editingBannerId)?.url)}
                    style={{ 
                      flex: 1, 
                      backgroundColor: "#0f172a", 
                      color: "white", 
                      padding: "12px", 
                      borderRadius: "12px", 
                      border: "none", 
                      fontWeight: "600", 
                      fontSize: "14px", 
                      cursor: "pointer",
                      opacity: (!bannerFile && (!editingBannerId || bannerPreview === banners.find(b => b.id === editingBannerId)?.url)) ? 0.6 : 1
                    }}>
                    {editingBannerId ? "Update Banner" : "Upload Banner"}
                  </button>
                  {editingBannerId && (
                    <button 
                      onClick={() => { setEditingBannerId(null); setBannerPreview(null); setBannerFile(null); }}
                      style={{ backgroundColor: "#e2e8f0", color: "#475569", padding: "12px 20px", borderRadius: "12px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Slip Modal */}
      {transactionSlipModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "420px", padding: "35px 30px", background: "#f8f9fa", borderRadius: "20px", position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px", background: "none", border: "none", cursor: "pointer", color: "#666" }} onClick={closeTransactionSlipModal}>×</button>

            <h2 style={{ fontSize: "22px", fontWeight: "400", color: "#111", marginBottom: "40px", textAlign: "center" }}>
              Transaction Slip
            </h2>

            <div className="marketeer-form" style={{ padding: "0 10px" }}>
              <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                <label style={{ flex: 1, fontSize: "12px", margin: 0, color: "#333", textAlign: "left", fontWeight: "500" }}>Requested Amount:</label>
                <input type="text" disabled value={selectedTransaction?.requestedAmount ?? ""} style={{ flex: 1.5, backgroundColor: "#f3f4f6", color: "#666", textAlign: "center", border: "2px solid #d1d5db", borderRadius: "20px", padding: "6px 15px", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                <label style={{ flex: 1, fontSize: "12px", margin: 0, color: "#333", textAlign: "left", fontWeight: "500" }}>Paying Amount:</label>
                <input type="text" defaultValue={selectedTransaction?.requestedAmount ?? ""} style={{ flex: 1.5, backgroundColor: "#f9fafb", color: "#111", textAlign: "center", border: "2px solid #d1d5db", borderRadius: "20px", padding: "6px 15px", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
              </div>

              <div className="form-group" style={{ flexDirection: "row", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                <label style={{ flex: 1, fontSize: "12px", margin: 0, color: "#333", textAlign: "left", fontWeight: "500", marginTop: "8px" }}>Upload Slip:</label>
                <div style={{ flex: 1.5, display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ position: "relative" }}>
                    <input type="file" id="slip-upload" style={{ display: "none" }} onChange={handleSlipUploadChange} accept="image/*" />
                    <label htmlFor="slip-upload" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9fafb", cursor: "pointer", padding: "6px 15px", border: "2px solid #d1d5db", borderRadius: "20px", boxSizing: "border-box" }}>
                      <span style={{ color: "#111", fontSize: "12px", minHeight: "15px" }}>{transactionSlipFileName || 'Choose receipt file'}</span>
                      <Upload size={14} color="#666" />
                    </label>
                  </div>
                  <span style={{ color: "#e21e1e", fontSize: "10px" }}>*required</span>
                  {transactionSlipError && (
                    <div style={{ color: '#b91c1c', fontSize: '12px', marginTop: '8px' }}>{transactionSlipError}</div>
                  )}
                  <button 
                    onClick={handleApprovePayment}
                    style={{ backgroundColor: "#16a34a", color: "white", padding: "6px 20px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "11px", cursor: "pointer", alignSelf: "flex-start", marginTop: "8px" }}>
                    Proceed to pay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Marketeer Modal */}
      {confirmDeleteMarketeerModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "400px", padding: "40px", background: "white", textAlign: "center", borderRadius: "15px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setConfirmDeleteMarketeerModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#ff1b44", width: "90px", height: "90px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ color: "white", fontSize: "65px", fontWeight: "bold", lineHeight: "1" }}>?</span>
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Delete {activeTab === "add_marketeers" ? "Marketeer" : "Admin"}?
            </h2>

            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button 
                onClick={confirmDeleteMarketeer}
                style={{ backgroundColor: "#00d800", color: "white", padding: "8px 35px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Yes
              </button>
              <button 
                onClick={() => setConfirmDeleteMarketeerModalOpen(false)}
                style={{ backgroundColor: "#e21e1e", color: "white", padding: "8px 35px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marketeer Deleted Modal */}
      {marketeerDeletedModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "400px", padding: "40px", background: "white", textAlign: "center", borderRadius: "15px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setMarketeerDeletedModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#e21e1e", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={40} color="white" strokeWidth={4} />
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              {activeTab === "add_marketeers" ? "Marketeer" : "Admin"} Deleted<br />Successfully!
            </h2>

            <div>
              <button 
                onClick={() => setMarketeerDeletedModalOpen(false)}
                style={{ backgroundColor: "#9ca3af", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Customer Modal */}
      {confirmDeleteCustomerModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "400px", padding: "40px", background: "white", textAlign: "center", borderRadius: "15px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setConfirmDeleteCustomerModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#ff1b44", width: "90px", height: "90px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ color: "white", fontSize: "65px", fontWeight: "bold", lineHeight: "1" }}>?</span>
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Delete Customer?
            </h2>

            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button 
                onClick={confirmDeleteCustomer}
                style={{ backgroundColor: "#00d800", color: "white", padding: "8px 35px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Yes
              </button>
              <button 
                onClick={() => setConfirmDeleteCustomerModalOpen(false)}
                style={{ backgroundColor: "#e21e1e", color: "white", padding: "8px 35px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Deleted Modal */}
      {customerDeletedModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "400px", padding: "40px", background: "white", textAlign: "center", borderRadius: "15px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setCustomerDeletedModalOpen(false)}>×</button>

            <div style={{ backgroundColor: "#e21e1e", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={40} color="white" strokeWidth={4} />
            </div>

            <h2 style={{ fontSize: "28px", fontWeight: "500", color: "#111", marginBottom: "30px", padding: "0 20px", lineHeight: "1.2" }}>
              Customer Deleted<br />Successfully!
            </h2>

            <div>
              <button 
                onClick={() => setCustomerDeletedModalOpen(false)}
                style={{ backgroundColor: "#9ca3af", color: "white", padding: "10px 40px", borderRadius: "20px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Record Details Modal */}
      {detailsModalOpen && selectedRecord && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "550px", padding: "40px", background: "white", borderRadius: "24px", maxHeight: "85vh", overflowY: "auto" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setDetailsModalOpen(false)}>×</button>
            <div style={{ backgroundColor: "#f8fafc", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid #e2e8f0" }}>
              {recordType.includes("Profile") ? <User size={40} color="#64748b" /> : 
               recordType === "Cookie" ? <Cookie size={40} color="#f97316" /> :
               recordType === "Feedback" ? <Clock3 size={40} color="#3b82f6" /> :
               <Shield size={40} color="#64748b" />}
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111", marginBottom: "30px", textAlign: "center" }}>
              {recordType} Details
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {recordType === "Seller Profile" && (
                <div style={{ display: "flex", gap: "15px", marginBottom: "20px", justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px" }}>NIC FRONT</div>
                    {selectedRecord.nicFront ? (
                      <div style={{ position: "relative", group: "true" }}>
                        <img 
                          src={selectedRecord.nicFront} 
                          alt="NIC Front" 
                          style={{ width: "200px", height: "120px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e2e8f0", cursor: "pointer" }} 
                          onClick={() => setFullScreenImage(selectedRecord.nicFront)}
                        />
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
                          <button 
                            onClick={() => setFullScreenImage(selectedRecord.nicFront)}
                            style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "5px", border: "1px solid #ccc", background: "white", cursor: "pointer" }}
                          >
                            Full Screen
                          </button>
                          <button 
                            onClick={() => handleDownloadImage(selectedRecord.nicFront, `NIC_Front_${selectedRecord.sellerName.replace(/\s+/g, '_')}.jpg`)}
                            style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "5px", border: "1px solid #ccc", background: "#f8fafc", color: "#333", cursor: "pointer" }}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: "200px", height: "120px", background: "#f1f5f9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>No Front Image</div>
                    )}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "5px" }}>NIC BACK</div>
                    {selectedRecord.nicBack ? (
                      <div style={{ position: "relative" }}>
                        <img 
                          src={selectedRecord.nicBack} 
                          alt="NIC Back" 
                          style={{ width: "200px", height: "120px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e2e8f0", cursor: "pointer" }} 
                          onClick={() => setFullScreenImage(selectedRecord.nicBack)}
                        />
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
                          <button 
                            onClick={() => setFullScreenImage(selectedRecord.nicBack)}
                            style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "5px", border: "1px solid #ccc", background: "white", cursor: "pointer" }}
                          >
                            Full Screen
                          </button>
                          <button 
                            onClick={() => handleDownloadImage(selectedRecord.nicBack, `NIC_Back_${selectedRecord.sellerName.replace(/\s+/g, '_')}.jpg`)}
                            style={{ fontSize: "10px", padding: "4px 8px", borderRadius: "5px", border: "1px solid #ccc", background: "#f8fafc", color: "#333", cursor: "pointer" }}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: "200px", height: "120px", background: "#f1f5f9", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>No Back Image</div>
                    )}
                  </div>
                </div>
              )}
              {Object.entries(selectedRecord).map(([key, value]) => {
                // Skip internal keys or objects
                if (key.includes("id") && key !== "id" && key !== "orderNo") return null;
                if (key === "wallet_balance" || key === "walletBalance") return null;
                if (key === "nicFront" || key === "nicBack") return null;
                if (typeof value === "object" && value !== null) return null;
                if (key === "status" && typeof value === "number") {
                  const statusMap = { 0: "Pending", 1: "Accepted", 2: "Sent", 3: "Completed", 4: "Rejected" };
                  value = statusMap[value] || value;
                }
                
                // Format label
                const label = key.replace(/_/g, " ").replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                
                return (
                  <div key={key} style={{ display: "flex", flexDirection: "column", gap: "6px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                    <span style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                    <span style={{ 
                      fontWeight: "500", 
                      color: "#1e293b", 
                      fontSize: "15px", 
                      wordBreak: "break-all",
                      backgroundColor: key === "feedback" || key === "user_agent" || key === "value" ? "#f8fafc" : "transparent",
                      padding: key === "feedback" || key === "user_agent" || key === "value" ? "10px" : "0",
                      borderRadius: "8px"
                    }}>
                      {String(value)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: "30px", textAlign: "center" }}>
              <button 
                onClick={() => setDetailsModalOpen(false)}
                style={{ backgroundColor: "#1e293b", color: "white", padding: "12px 60px", borderRadius: "12px", border: "none", fontWeight: "bold", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Payment Method Modal */}
      {pmModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="post-details-modal-content" style={{ width: "450px", padding: "40px", background: "white", borderRadius: "20px" }}>
            <button className="freezing-modal-close" style={{ fontSize: "24px", top: "15px", right: "20px" }} onClick={() => setPmModalOpen(false)}>×</button>
            <h2 style={{ fontSize: "22px", fontWeight: "700", textAlign: "center", marginBottom: "30px" }}>{pmEditId ? "Edit" : "Add"} Payment Method</h2>
            
            <form onSubmit={handleSavePaymentMethod}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}>Method Name:</label>
                  <input 
                    type="text" 
                    style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", width: "100%", boxSizing: "border-box" }}
                    value={pmFormData.name} 
                    onChange={(e) => setPmFormData(prev => ({ ...prev, name: e.target.value }))} 
                    required 
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "600", color: "#64748b" }}>Icon (Image):</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {pmFormData.icon && typeof pmFormData.icon === "string" && (
                      <img src={`/storage/${pmFormData.icon}`} alt="icon" style={{ width: "30px", height: "30px", objectFit: "contain" }} />
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ padding: "8px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", width: "100%", boxSizing: "border-box" }}
                      onChange={(e) => setPmFormData(prev => ({ ...prev, iconFile: e.target.files[0] }))} 
                    />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input 
                    type="checkbox" 
                    id="pm_active"
                    checked={pmFormData.is_active} 
                    onChange={(e) => setPmFormData(prev => ({ ...prev, is_active: e.target.checked }))} 
                  />
                  <label htmlFor="pm_active" style={{ fontSize: "14px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>Show to Customers</label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input 
                    type="checkbox" 
                    id="pm_disabled"
                    checked={pmFormData.is_disabled} 
                    onChange={(e) => setPmFormData(prev => ({ ...prev, is_disabled: e.target.checked }))} 
                  />
                  <label htmlFor="pm_disabled" style={{ fontSize: "14px", fontWeight: "600", color: "#334155", cursor: "pointer" }}>Disable (Show as unavailable)</label>
                </div>
                
                <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "10px" }}>
                  <button type="button" className="btn-black-rounded" style={{ padding: "10px 30px" }} onClick={() => setPmModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-accept-green" style={{ padding: "10px 30px" }}>Save Method</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {fullScreenImage && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 100000, backgroundColor: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setFullScreenImage(null)}
        >
          <button 
            onClick={() => setFullScreenImage(null)}
            style={{ position: "absolute", top: "30px", right: "30px", background: "none", border: "none", color: "white", fontSize: "40px", cursor: "pointer" }}
          >
            ×
          </button>
          <img 
            src={fullScreenImage} 
            alt="Full Screen" 
            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", borderRadius: "10px", boxShadow: "0 0 30px rgba(0,0,0,0.5)" }} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* Pay Marketeer Modal */}
      {payMarketeerModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div className="modal-content" style={{ width: "400px", padding: "40px" }}>
            <button className="modal-close" onClick={() => setPayMarketeerModalOpen(false)}>×</button>
            <h2 className="modal-title">Pay Marketeer</h2>
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#111" }}>{selectedMarketeer?.name}</div>
              <div style={{ fontSize: "14px", color: "#64748b" }}>Current Commission: Rs. {selectedMarketeer?.total_commission || 0}</div>
            </div>
            <form onSubmit={handlePayMarketeer}>
              <div className="input-group">
                <label>Amount to Pay:</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="modal-input" 
                  value={payAmount} 
                  onChange={(e) => setPayAmount(e.target.value)} 
                  placeholder="Enter amount"
                  required
                />
              </div>
              <button 
                className="login-button" 
                type="submit" 
                disabled={isPaying}
                style={{ width: "100%", marginTop: "20px" }}
              >
                {isPaying ? "Processing..." : "Confirm Payment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>

  );
}
