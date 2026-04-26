import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, User, Menu, Search } from "lucide-react";
import Swal from 'sweetalert2';
import api from "../../api/api";
import HelpSupportModal from "../common/HelpSupportModal";
import ContactUsModal from "../common/ContactUsModal";

export default function Navbar({ onLoginClick, onCustomerLoginClick, onCartClick, onLogoClick, isAdminAuth, isCustomerAuth, onLogoutClick, onSellerRegisterClick, onProfileClick, onOrdersClick, onSearch, onCategorySelect, cartCount = 0, globalSettings, onAboutClick, searchQuery = "", categoryFilter = null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleSellerClick = () => {
    setIsProfileOpen(false); 
    if (onSellerRegisterClick) onSellerRegisterClick();
  };

  const handleCustomerClick = () => {
    setIsProfileOpen(false); 
    if (onCustomerLoginClick) onCustomerLoginClick();
  };
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const categoryEmojiMap = {
    "Gifts & Personalization": "🎁",
    "Home & Decorations": "🛋️",
    "Wearable & Accessories": "�",
    "Electronics & accessories": "🎧",
    "Baked Items & Chocolate Gifts": "🧁",
    "Baked, Homemade & Chocolate": "🍫",
    "Beauty & Self care": "💄",
    "Other Handmade items": "🎨",
    "Home & Decos": "🏠",
    "Ayurvedic": "🌿",
    "Clothes": "👕",
    "Electronics": "💻",
    "Home & Kitchen": "🍳"
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const categoriesRef = useRef(null);
  const mobileCategoriesRef = useRef(null);
  const profileRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoriesRef.current && !categoriesRef.current.contains(event.target) &&
        mobileCategoriesRef.current && !mobileCategoriesRef.current.contains(event.target)
      ) {
        setIsCategoriesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "77px", backgroundColor: "#fff", zIndex: 998 }}></div>
    <div style={styles.navbar} className="navbar-pill">
       {/* Content Container */}
      <div style={styles.container} className="container-padding">
        {/* Left side: Logo */}
        <div onClick={onLogoClick} style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
          <div style={{ width: "42px", height: "42px", backgroundColor: "#000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", border: "1.5px solid #fff", fontSize: "10px", fontWeight: "bold", textAlign: "center" }}>
            <div style={{ transform: "scale(0.8)" }}>TOKO<br />XPRESS</div>
          </div>
          <div style={{ fontWeight: "600", fontSize: "24px", letterSpacing: "0.2px", color: "#fff", whiteSpace: "nowrap" }}>Toko Xpress</div>
        </div>

        {/* Right side: Nav links + Icons */}
        <div style={styles.right}>
          {!isAdminAuth && (
            <>
              <div style={styles.menuContainer} ref={categoriesRef} className="mobile-hide">
                <span
                  style={{ cursor: 'pointer', fontSize: "14px", fontWeight: "500", color: "#fff", whiteSpace: "nowrap" }}
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                >
                  {categoryFilter ? categories.find(c => Number(c.id) === Number(categoryFilter))?.name : "All Categories"}
                </span>
                {isCategoriesOpen && (
                  <div className="categories-dropdown">
                    {categories.length > 0 ? categories.map((cat, idx) => (
                      <React.Fragment key={cat.id}>
                        <div 
                          className="category-item" 
                          onClick={() => {
                            setIsCategoriesOpen(false);
                            if (onCategorySelect) onCategorySelect(cat.id);
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>{categoryEmojiMap[cat.name] || "🏷️"}</span>
                          {cat.name}
                        </div>
                        {idx < categories.length - 1 && <div className="dropdown-divider"></div>}
                      </React.Fragment>
                    )) : (
                      <div className="category-item" style={{ fontSize: "13px", color: "#666" }}>Loading categories...</div>
                    )}
                  </div>
                )}
              </div>
              <span
                className="mobile-hide"
                style={{ cursor: 'pointer', fontSize: "14px", fontWeight: "500", color: "#fff", whiteSpace: "nowrap" }}
                onClick={() => setIsHelpOpen(true)}
              >Help & Support</span>
              
              <div className="cart-icon-container" onClick={onCartClick} style={{ cursor: 'pointer' }}>
                <ShoppingCart size={22} style={{ color: "#fff" }} />
                {isCustomerAuth && cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
            </>
          )}

          <div style={styles.menuContainer} ref={profileRef}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <User size={22} onClick={() => setIsProfileOpen(!isProfileOpen)} style={{ cursor: 'pointer', color: "#fff" }} />
              {(isCustomerAuth || isAdminAuth) && <span className="profile-status-dot"></span>}
            </div>
            {isProfileOpen && (
              <div className="dropdown-menu" style={{ width: "180px", right: "0", top: "45px" }}>
                {!isCustomerAuth && !isAdminAuth ? (
                  <>
                    <div className="dropdown-item" onClick={handleCustomerClick}>Customer</div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => { setIsProfileOpen(false); if (onLoginClick) onLoginClick(); }}>Admin</div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={handleSellerClick}>Seller</div>
                  </>
                ) : (
                  <>
                    <div className="dropdown-item" onClick={() => { setIsProfileOpen(false); if (onProfileClick) onProfileClick(); }}>Edit Profile</div>
                    {isCustomerAuth && (
                      <>
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-item" onClick={() => { setIsProfileOpen(false); if (onOrdersClick) onOrdersClick(); }}>My Orders</div>
                      </>
                    )}
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => { setIsProfileOpen(false); if (onLogoutClick) onLogoutClick(); }}>Logout</div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search Bar */}
          {!isAdminAuth && (
            <div className="mobile-hide" style={{ display: "flex", alignItems: "center", backgroundColor: "#fff", borderRadius: "50px", padding: "0 15px", height: "38px", width: "220px", boxSizing: "border-box" }}>
              <input 
                placeholder="Search Here..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", fontStyle: "italic", backgroundColor: "transparent", color: "#333", height: "100%" }} 
              />
            </div>
          )}

          {/* Hamburger Menu */}
          {!isAdminAuth && (
            <div style={styles.menuContainer} ref={menuRef}>
              <div
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#000", border: "1px solid rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Menu size={20} color="#fff" />
              </div>
              {isMenuOpen && (
                <div className="dropdown-menu" style={{ right: "0", top: "45px" }}>
                  <div className="dropdown-item" onClick={() => {
                    setIsMenuOpen(false);
                    if (onAboutClick) {
                      onAboutClick();
                    } else {
                      window.location.href = '/';
                    }
                  }}>About</div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={handleSellerClick}>Become a seller</div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item" onClick={() => { setIsMenuOpen(false); setIsContactOpen(true); }}>Contact us</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search & Category Bar - Only visible on screens <= 768px */}
      {!isAdminAuth && (
        <div className="mobile-show" style={{ display: "none" }} ref={mobileCategoriesRef}>
          <div style={{ 
            display: "flex", 
            gap: "10px", 
            padding: "8px 15px 10px", 
            backgroundColor: "#111", 
            borderTop: "1.5px solid rgba(255,255,255,0.35)",
            alignItems: "center",
            borderRadius: "0 0 30px 30px",
          }}>
            <div 
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "6px", 
                backgroundColor: "#222", 
                padding: "8px 12px", 
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                whiteSpace: "nowrap",
                color: "#fff"
              }}
            >
              <Menu size={16} />
              {categoryFilter ? categories.find(c => Number(c.id) === Number(categoryFilter))?.name : "Categories"}
            </div>

            <div style={{ 
              flex: "0 0 48%", 
              maxWidth: "48%",
              display: "flex", 
              alignItems: "center", 
              backgroundColor: "#222", 
              borderRadius: "20px", 
              padding: "0 10px 0 14px", 
              height: "36px",
              overflow: "hidden",
              minWidth: 0,
            }}>
              <input 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                style={{ 
                  flex: 1, 
                  border: "none", 
                  outline: "none", 
                  fontSize: "15px", 
                  backgroundColor: "transparent", 
                  color: "#fff",
                  height: "100%",
                  minWidth: 0,
                }} 
              />
              <Search size={16} color="#94a3b8" style={{ cursor: "pointer", flexShrink: 0 }} onClick={() => onSearch && onSearch(searchTerm)} />
            </div>
          </div>
          
          {isCategoriesOpen && (
            <div className="categories-dropdown" style={{ 
              top: "100%", 
              left: "15px", 
              width: "calc(100% - 30px)",
              position: "absolute",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              padding: "10px",
              zIndex: 1101
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", padding: "0 5px" }}>
                <span style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>Select Category</span>
                <span onClick={() => setIsCategoriesOpen(false)} style={{ fontSize: "20px", cursor: "pointer", color: "#999" }}>×</span>
              </div>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {categories.map((cat, idx) => (
                  <div 
                    key={cat.id}
                    className="category-item" 
                    onClick={() => {
                      setIsCategoriesOpen(false);
                      if (onCategorySelect) onCategorySelect(cat.id);
                    }}
                    style={{ color: "#333" }}
                  >
                    <span style={{ fontSize: "20px" }}>{categoryEmojiMap[cat.name] || "🏷️"}</span>
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {isHelpOpen && (
      <HelpSupportModal
        onClose={() => setIsHelpOpen(false)}
        onContactClick={() => { setIsHelpOpen(false); setIsContactOpen(true); }}
      />
    )}
    {isContactOpen && (
      <ContactUsModal onClose={() => setIsContactOpen(false)} />
    )}
    </>
  );
}

const styles = {
  navbar: {
    background: "#000",
    color: "#fff",
    padding: "0",
    position: "fixed",
    top: "15px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 30px)",
    maxWidth: "1400px",
    zIndex: 1000,
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    borderRadius: "100px",
  },
  container: {
    margin: "0 auto",
    padding: "10px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  right: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  menuContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
};