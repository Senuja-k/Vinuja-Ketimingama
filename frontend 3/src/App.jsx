import Swal from 'sweetalert2';
import { useState, useEffect, lazy, Suspense } from 'react'
import './App.css'
import Home from "./pages/Home";
import AdminLoginModal from "./components/admin/AdminLoginModal";
import SellerLoginModal from "./components/seller/SellerLoginModal";
import SellerRegisterModal from "./components/seller/SellerRegisterModal";
import CustomerLoginModal from "./components/customer/CustomerLoginModal";
import CustomerRegisterModal from "./components/customer/CustomerRegisterModal";
import CustomerEditProfileModal from "./components/customer/CustomerEditProfileModal";
import SEO from "./components/common/SEO";
import CookieConsent from "./components/common/CookieConsent";
import MaintenanceMode from "./components/layout/MaintenanceMode";
import ScrollToTop from "./components/common/ScrollToTop";
import api from './api/api';
import CustomerOrders from "./components/customer/CustomerOrders";

// Lazy load heavy pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const About = lazy(() => import("./pages/About"));

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminName, setAdminName] = useState("Hirushan");
  const [isCheckout, setIsCheckout] = useState(false);
  const [isProductDetails, setIsProductDetails] = useState(false);
  const [isCustomerOrders, setIsCustomerOrders] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSellerLoginOpen, setIsSellerLoginOpen] = useState(false);
  const [isSellerRegisterOpen, setIsSellerRegisterOpen] = useState(false);
  const [isSellerAuth, setIsSellerAuth] = useState(false);
  const [sellerName, setSellerName] = useState("");
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);
  const [isCustomerRegisterOpen, setIsCustomerRegisterOpen] = useState(false);
  const [isCustomerAuth, setIsCustomerAuth] = useState(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [sellerFilter, setSellerFilter] = useState(null);
  const [previousPageState, setPreviousPageState] = useState(null);
  const [globalSettings, setGlobalSettings] = useState({
    homepage_disabled: "0",
    customer_signup_disabled: "0",
    seller_signup_disabled: "0",
    admin_signup_disabled: "0"
  });

  const pushHistoryState = (state) => {
    if (window && window.history && window.history.pushState) {
      window.history.pushState(state, "", window.location.pathname);
    }
  };

  const replaceHistoryState = (state) => {
    if (window && window.history && window.history.replaceState) {
      window.history.replaceState(state, "", window.location.pathname);
    }
  };

  const restoreStateFromHistory = (state) => {
    if (!state) {
      setIsProductDetails(false);
      setIsCheckout(false);
      setIsCustomerOrders(false);
      setIsAboutOpen(false);
      resetFilters();
      setPreviousPageState(null);
      return;
    }

    const {
      view,
      searchQuery: stateSearchQuery,
      categoryFilter: stateCategoryFilter,
      sellerFilter: stateSellerFilter,
      selectedProduct: stateSelectedProduct,
      previousState: statePreviousPage,
    } = state;

    setSearchQuery(stateSearchQuery || "");
    setCategoryFilter(stateCategoryFilter || null);
    setSellerFilter(stateSellerFilter || null);
    setPreviousPageState(statePreviousPage || null);

    setIsCheckout(view === "checkout");
    setIsProductDetails(view === "productDetails");
    setIsCustomerOrders(view === "orders");
    setIsAboutOpen(view === "about");

    if (view === "productDetails" && stateSelectedProduct) {
      setSelectedProduct(stateSelectedProduct);
    } else if (view !== "productDetails") {
      setSelectedProduct(null);
    }
  };

  // Cart State
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('toko_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse cart", e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    // Load auth
    if (localStorage.getItem('admin_token')) {
      setIsAdminAuth(true);
      setAdminName(localStorage.getItem('adminUsername') || "Admin");
    } else if (localStorage.getItem('seller_token')) {
      setIsSellerAuth(true);
      setSellerName(localStorage.getItem('sellerUsername') || "Seller");
    } else if (localStorage.getItem('customer_token')) {
      setIsCustomerAuth(true);
    }

    fetchGlobalSettings();

    // Check for shared product link
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
      api.get(`/products/${productId}`)
        .then(res => {
          if (res.data) {
            setSelectedProduct(res.data);
            setIsProductDetails(true);
            setPreviousPageState({ view: 'home', searchQuery: "", categoryFilter: null, sellerFilter: null });
            replaceHistoryState({
              view: "productDetails",
              selectedProduct: res.data,
              searchQuery: "",
              categoryFilter: null,
              sellerFilter: null,
              previousState: { view: 'home', searchQuery: "", categoryFilter: null, sellerFilter: null }
            });
          }
        })
        .catch(err => console.error("Failed to fetch shared product", err));
    } else {
      replaceHistoryState({
        view: "home",
        searchQuery: "",
        categoryFilter: null,
        sellerFilter: null,
        previousState: null
      });
    }
  }, []);

  useEffect(() => {
    const handlePopState = (event) => {
      restoreStateFromHistory(event.state);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      const res = await api.get("/settings");
      setGlobalSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  // Save cart on change
  useEffect(() => {
    localStorage.setItem('toko_cart', JSON.stringify(cart));
  }, [cart]);


  const handleAddToCart = (product, qty = 1, size = null, color = null, maxQty = null) => {
    // If maxQty is not provided, use product.quantity as fallback
    const actualMaxQty = maxQty !== null ? maxQty : (product.quantity || 999);

    setCart(prev => {
      const uniqueId = `${product.id}-${size || 'none'}-${color || 'none'}`;
      const existing = prev.find(item => (item.cartItemId || item.id) === uniqueId);
      
      if (existing) {
        const potentialQty = existing.qty + qty;
        if (potentialQty > actualMaxQty) {
          Swal.fire("Limited stock", `Only ${actualMaxQty} items available.`, "warning");
          return prev.map(item => (item === existing) ? { ...item, qty: actualMaxQty, maxQty: actualMaxQty } : item);
        }
        return prev.map(item => (item === existing) ? { ...item, qty: potentialQty, maxQty: actualMaxQty } : item);
      }
      return [...prev, { ...product, cartItemId: uniqueId, size, color, qty: Math.min(qty, actualMaxQty), maxQty: actualMaxQty }];
    });
    Swal.fire("Added to cart!");
  };

  const handleUpdateCartQty = (uniqueId, delta) => {
    setCart(prev => prev.map(item => {
      const itemId = item.cartItemId || item.id;
      if (itemId === uniqueId) {
        const itemMax = item.maxQty !== undefined ? item.maxQty : (item.quantity || 999);
        let newQty = item.qty + delta;
        if (newQty > itemMax) {
          newQty = itemMax;
          Swal.fire("Max quantity reached", `Only ${itemMax} available.`, "info");
        }
        newQty = Math.max(1, newQty);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (uniqueId) => {
    setCart(prev => prev.filter(item => (item.cartItemId || item.id) !== uniqueId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleLogin = (name) => {
    setAdminName(name || "Hirushan");
    setIsAdminAuth(true);
    setIsLoginOpen(false);
    setIsCheckout(false); 
    setIsProductDetails(false);
    setIsCustomerOrders(false);
    setIsAboutOpen(false);
  };

  const handleSearch = (query) => {
    const previousState = isProductDetails
      ? { view: 'productDetails', selectedProduct, searchQuery, categoryFilter, sellerFilter }
      : isCheckout
        ? { view: 'checkout', searchQuery, categoryFilter, sellerFilter }
        : { view: 'home', searchQuery, categoryFilter, sellerFilter };

    setPreviousPageState(previousState);
    setSearchQuery(query);
    setCategoryFilter(null); // Reset category when searching
    setSellerFilter(null);
    setIsCheckout(false);
    setIsProductDetails(false);
    setIsCustomerOrders(false);
    setIsAboutOpen(false);
  };

  const handleCategorySelect = (categoryId) => {
    const previousState = isProductDetails
      ? { view: 'productDetails', selectedProduct, searchQuery, categoryFilter, sellerFilter }
      : isCheckout
        ? { view: 'checkout', searchQuery, categoryFilter, sellerFilter }
        : { view: 'home', searchQuery, categoryFilter, sellerFilter };

    setPreviousPageState(previousState);
    setCategoryFilter(categoryId);
    setSearchQuery(""); // Reset search when category selected
    setSellerFilter(null);
    setSelectedProduct(null);
    setIsCheckout(false);
    setIsProductDetails(false);
    setIsCustomerOrders(false);
    setIsAboutOpen(false);

    pushHistoryState({
      view: "home",
      searchQuery: "",
      categoryFilter: categoryId,
      sellerFilter: null,
      previousState,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSellerSelect = (sellerId) => {
    const previousState = isProductDetails
      ? { view: 'productDetails', selectedProduct, searchQuery, categoryFilter, sellerFilter }
      : isCheckout
        ? { view: 'checkout', searchQuery, categoryFilter, sellerFilter }
        : { view: 'home', searchQuery, categoryFilter, sellerFilter };

    setPreviousPageState(previousState);
    setSellerFilter(sellerId);
    setSearchQuery("");
    setCategoryFilter(null);
    setIsCheckout(false);
    setIsProductDetails(false);
    setIsCustomerOrders(false);
    setIsAboutOpen(false);
    pushHistoryState({
      view: "home",
      searchQuery: "",
      categoryFilter: null,
      sellerFilter: sellerId,
      previousState,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter(null);
    setSellerFilter(null);
  };

  const navigateToHome = ({ searchQuery: nextSearchQuery = "", categoryFilter: nextCategoryFilter = null, sellerFilter: nextSellerFilter = null, previousState = null, replace = false } = {}) => {
    setSearchQuery(nextSearchQuery);
    setCategoryFilter(nextCategoryFilter);
    setSellerFilter(nextSellerFilter);
    setSelectedProduct(null);
    setIsProductDetails(false);
    setIsCheckout(false);
    setIsCustomerOrders(false);
    setIsAboutOpen(false);
    setPreviousPageState(previousState);

    const state = {
      view: "home",
      searchQuery: nextSearchQuery,
      categoryFilter: nextCategoryFilter,
      sellerFilter: nextSellerFilter,
      previousState,
    };

    if (replace) {
      replaceHistoryState(state);
    } else {
      pushHistoryState(state);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProductDetails = (product, fromState = null, replace = false) => {
    const previousState = fromState || { view: 'home', searchQuery, categoryFilter, sellerFilter };

    setSelectedProduct(product);
    setIsProductDetails(true);
    setIsCheckout(false);
    setIsCustomerOrders(false);
    setIsAboutOpen(false);
    setPreviousPageState(previousState);

    const state = {
      view: "productDetails",
      searchQuery,
      categoryFilter,
      sellerFilter,
      selectedProduct: product,
      previousState,
    };

    if (replace) {
      replaceHistoryState(state);
    } else {
      pushHistoryState(state);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateBack = () => {
    if (!previousPageState) {
      navigateToHome({ replace: true });
      return;
    }

    const { view, selectedProduct: prevSelectedProduct, searchQuery: prevSearchQuery = "", categoryFilter: prevCategoryFilter = null, sellerFilter: prevSellerFilter = null } = previousPageState;

    if (view === 'productDetails' && prevSelectedProduct) {
      setSelectedProduct(prevSelectedProduct);
      setIsProductDetails(true);
      setIsCheckout(false);
      setIsCustomerOrders(false);
      setIsAboutOpen(false);
      setSearchQuery(prevSearchQuery);
      setCategoryFilter(prevCategoryFilter);
      setSellerFilter(prevSellerFilter);
      setPreviousPageState(null);
    } else if (view === 'checkout') {
      setIsProductDetails(false);
      setIsCheckout(true);
      setIsCustomerOrders(false);
      setIsAboutOpen(false);
      setSearchQuery(prevSearchQuery);
      setCategoryFilter(prevCategoryFilter);
      setSellerFilter(prevSellerFilter);
      setPreviousPageState(null);
    } else if (view === 'orders') {
      setIsProductDetails(false);
      setIsCheckout(false);
      setIsCustomerOrders(true);
      setIsAboutOpen(false);
      setPreviousPageState(null);
    } else {
      navigateToHome({ searchQuery: prevSearchQuery, categoryFilter: prevCategoryFilter, sellerFilter: prevSellerFilter, previousState: null, replace: true });
    }
  };

  const handleCartClick = () => {
    if (!isCustomerAuth) {
      setPendingCheckout(true);
      setIsCustomerLoginOpen(true);
    } else {
      const previousState = isProductDetails ? { view: 'productDetails', selectedProduct, searchQuery, categoryFilter, sellerFilter } : { view: 'home', searchQuery, categoryFilter, sellerFilter };
      setPreviousPageState(previousState);
      setIsCheckout(true);
      setIsProductDetails(false);
      setIsCustomerOrders(false);
      setIsAboutOpen(false);
      pushHistoryState({
        view: "checkout",
        searchQuery,
        categoryFilter,
        sellerFilter,
        previousState
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBuyNowClick = (product, qty = 1, size = null, color = null) => {
    if (!isCustomerAuth) {
      setPendingCheckout(true);
      setIsCustomerLoginOpen(true);
    } else {
      // Add and go to cart
      handleAddToCart(product, qty, size, color);
      setIsProductDetails(false);
      setIsCustomerOrders(false);
      setIsAboutOpen(false);
      const previousState = isProductDetails ? { view: 'productDetails', selectedProduct, searchQuery, categoryFilter, sellerFilter } : { view: 'home', searchQuery, categoryFilter, sellerFilter };
      setPreviousPageState(previousState);
      setIsCheckout(true);
      pushHistoryState({
        view: "checkout",
        searchQuery,
        categoryFilter,
        sellerFilter,
        previousState
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCustomerAuth = () => {
    setIsCustomerAuth(true);
    setIsCustomerLoginOpen(false);
    setIsCustomerRegisterOpen(false);
    if (pendingCheckout) {
      const previousState = isProductDetails ? { view: 'productDetails', selectedProduct, searchQuery, categoryFilter, sellerFilter } : { view: 'home', searchQuery, categoryFilter, sellerFilter };
      setPreviousPageState(previousState);
      setIsCheckout(true);
      setIsProductDetails(false);
      setIsCustomerOrders(false);
      setPendingCheckout(false);
      pushHistoryState({
        view: "checkout",
        searchQuery,
        categoryFilter,
        sellerFilter,
        previousState
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsCheckout(false);
      setIsProductDetails(false); 
      setIsCustomerOrders(false);
    }
  };

  const handleSellerLogin = (name) => {
    setSellerName(name);
    setIsSellerAuth(true);
    setIsSellerLoginOpen(false);
    setIsSellerRegisterOpen(false);
    setIsCheckout(false);
    setIsProductDetails(false);
    setIsCustomerOrders(false);
  };

  const handleSellerRegister = (name) => {
    setIsSellerRegisterOpen(false);
    setIsSellerLoginOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('seller_token');
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_contact');
    localStorage.removeItem('customer_address');
    localStorage.removeItem('customer_id');
    
    setIsAdminAuth(false);
    setIsSellerAuth(false);
    setIsCustomerAuth(false);
    setIsCheckout(false);
    setIsProductDetails(false);
    setIsCustomerOrders(false);
    setIsAboutOpen(false);
    setSelectedProduct(null);
    setSellerName("");
  };

  return(
    <Suspense fallback={
      <div style={{ height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      {isAdminAuth ? (
        <>
          <SEO title="Admin Dashboard" noindex={true} />
          <AdminDashboard adminName={adminName} onLogout={handleLogout} globalSettings={globalSettings} onSettingsUpdate={fetchGlobalSettings} />
        </>
      ) : isSellerAuth ? (
        <>
          <SEO title="Seller Dashboard" noindex={true} />
          <SellerDashboard name={sellerName} onLogout={handleLogout} />
        </>
      ) : isCheckout ? (
        <>
          <SEO title="Checkout" noindex={true} />
          <Checkout 
            cart={cart}
            updateQty={handleUpdateCartQty}
            removeItem={handleRemoveFromCart}
            clearCart={handleClearCart}
            onLoginClick={() => {
              setIsCheckout(false);
              setIsLoginOpen(true);
            }} 
            onCustomerLoginClick={() => setIsCustomerLoginOpen(true)}
            onLogoClick={navigateBack}
            onSellerRegisterClick={() => setIsSellerLoginOpen(true)}
            isCustomerAuth={isCustomerAuth}
            onLogoutClick={handleLogout}
            onProfileClick={() => setIsCustomerProfileOpen(true)}
            onOrdersClick={() => { setIsCustomerOrders(true); setIsCheckout(false); }}
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            onAboutClick={() => { setIsAboutOpen(true); setIsCheckout(false); }}
            cartCount={cart.length}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            globalSettings={globalSettings}
          />
        </>
      ) : isCustomerOrders ? (
        <>
          <SEO title="My Orders" noindex={true} />
          <CustomerOrders 
            onBack={() => setIsCustomerOrders(false)}
            onLogoClick={() => { setIsCustomerOrders(false); resetFilters(); }}
            onCartClick={handleCartClick}
            onLogoutClick={handleLogout}
            onProfileClick={() => setIsCustomerProfileOpen(true)}
            onProductClick={(p) => navigateToProductDetails(p, { view: 'orders' })}
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            cartCount={cart.length}
            globalSettings={globalSettings}
          />
        </>
      ) : isProductDetails ? (
        <>
          <SEO 
            title={selectedProduct?.name || "Product Details"} 
            description={selectedProduct?.description || "Product details on TokoXpress"}
            image={selectedProduct?.images?.[0]?.image_path ? `/storage/${selectedProduct.images[0].image_path}` : "/og-image.jpg"}
          />
          <ProductDetails 
            product={selectedProduct}
            onLoginClick={() => setIsLoginOpen(true)}
            onCustomerLoginClick={() => setIsCustomerLoginOpen(true)}
            onLogoClick={navigateBack}
            onSellerRegisterClick={() => setIsSellerLoginOpen(true)}
            onCartClick={(p, q, size, color, max) => handleAddToCart(p, q, size, color, max)}
            onBuyNow={(p, q, size, color, max) => handleBuyNowClick(p, q, size, color, max)}
            onHeaderCartClick={handleCartClick}
            isCustomerAuth={isCustomerAuth}
            onLogoutClick={handleLogout}
            onProfileClick={() => setIsCustomerProfileOpen(true)}
            onOrdersClick={() => { setIsCustomerOrders(true); setIsProductDetails(false); }}
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            onSellerSelect={handleSellerSelect}
            cartCount={cart.length}
            globalSettings={globalSettings}
            onAboutClick={() => { setIsAboutOpen(true); setIsCheckout(false); setIsProductDetails(false); setIsCustomerOrders(false); }}
          />
        </>
      ) : isAboutOpen ? (
        <>
          <SEO title="About Us" />
          <About 
            onLoginClick={() => setIsLoginOpen(true)}
            onCustomerLoginClick={() => setIsCustomerLoginOpen(true)}
            onLogoClick={() => { setIsAboutOpen(false); resetFilters(); }}
            onSellerRegisterClick={() => setIsSellerLoginOpen(true)}
            isCustomerAuth={isCustomerAuth}
            onLogoutClick={handleLogout}
            onProfileClick={() => setIsCustomerProfileOpen(true)}
            onOrdersClick={() => { setIsCustomerOrders(true); setIsAboutOpen(false); }}
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            onCartClick={handleCartClick}
            cartCount={cart.length}
            globalSettings={globalSettings}
            onAboutClick={() => setIsAboutOpen(true)}
          />
        </>
      ) : globalSettings.homepage_disabled === "1" ? (
        <MaintenanceMode 
          onLoginClick={() => setIsLoginOpen(true)} 
          onCustomerLoginClick={() => setIsCustomerLoginOpen(true)}
          onSellerRegisterClick={() => setIsSellerLoginOpen(true)}
          globalSettings={globalSettings}
        />
      ) : (
        <>
          <SEO />
          <Home 
            onLoginClick={() => setIsLoginOpen(true)} 
            onCustomerLoginClick={() => setIsCustomerLoginOpen(true)}
            onLogoClick={() => { setIsAboutOpen(false); resetFilters(); }}
            onCartClick={handleCartClick} 
            onProductClick={(p) => navigateToProductDetails(p)}
            onSellerRegisterClick={() => setIsSellerLoginOpen(true)}
            isCustomerAuth={isCustomerAuth}
            onLogoutClick={handleLogout}
            onProfileClick={() => setIsCustomerProfileOpen(true)}
            onOrdersClick={() => setIsCustomerOrders(true)}
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            sellerFilter={sellerFilter}
            onBack={navigateBack}
            cartCount={cart.length}
            globalSettings={globalSettings}
            onAboutClick={() => { setIsAboutOpen(true); setIsCheckout(false); setIsProductDetails(false); setIsCustomerOrders(false); }}
          />
        </>
      )}
      
      {isLoginOpen && !isAdminAuth && (
        <AdminLoginModal onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />
      )}

      {isCustomerLoginOpen && (
        <CustomerLoginModal 
          onClose={() => { setIsCustomerLoginOpen(false); setPendingCheckout(false); }} 
          onLogin={handleCustomerAuth} 
          onRegisterSwitch={() => {
            if (globalSettings.customer_signup_disabled === "1") {
              Swal.fire("Registration Closed", "New customer accounts are temporarily disabled.", "info");
            } else {
              setIsCustomerLoginOpen(false); 
              setIsCustomerRegisterOpen(true);
            }
          }}
        />
      )}

      {isCustomerRegisterOpen && (
        <CustomerRegisterModal 
          onClose={() => { setIsCustomerRegisterOpen(false); setPendingCheckout(false); }} 
          onRegister={handleCustomerAuth}
        />
      )}

      {isSellerLoginOpen && (
        <SellerLoginModal 
          onClose={() => setIsSellerLoginOpen(false)}
          onLogin={handleSellerLogin}
          onSwitchToRegister={() => {
            if (globalSettings.seller_signup_disabled === "1") {
              Swal.fire("Registration Closed", "New seller accounts are temporarily disabled.", "info");
            } else {
              setIsSellerLoginOpen(false);
              setIsSellerRegisterOpen(true);
            }
          }}
        />
      )}

      {isSellerRegisterOpen && (
        <SellerRegisterModal 
          onClose={() => setIsSellerRegisterOpen(false)} 
          onRegister={handleSellerRegister} 
        />
      )}

      <ScrollToTop />
      <CookieConsent />

      {isCustomerProfileOpen && (
        <CustomerEditProfileModal 
          isOpen={isCustomerProfileOpen} 
          onClose={() => setIsCustomerProfileOpen(false)} 
        />
      )}


    </Suspense>
  );
}

export default App
