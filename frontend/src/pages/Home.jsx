import Navbar from "../components/layout/Navbar";
import Banner from "../components/shop/Banner";
import ProductList from "../components/shop/ProductList";
import Footer from "../components/layout/Footer";
import { ArrowLeft } from 'lucide-react';

export default function Home({ onLoginClick, onCustomerLoginClick, onCartClick, onProductClick, onSellerRegisterClick, isCustomerAuth, onLogoutClick, onProfileClick, onOrdersClick, onSearch, onCategorySelect, searchQuery, categoryFilter, sellerFilter, onBack, cartCount, globalSettings, onAboutClick, onLogoClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff", fontFamily: "sans-serif" }}>
      <Navbar 
        onLoginClick={onLoginClick} 
        onCustomerLoginClick={onCustomerLoginClick} 
        onCartClick={onCartClick} 
        onSellerRegisterClick={onSellerRegisterClick} 
        isCustomerAuth={isCustomerAuth} 
        onLogoutClick={onLogoutClick} 
        onProfileClick={onProfileClick} 
        onOrdersClick={onOrdersClick}
        onSearch={onSearch}
        onCategorySelect={onCategorySelect}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        cartCount={cartCount}
        globalSettings={globalSettings}
        onAboutClick={onAboutClick}
        onLogoClick={onLogoClick}
      />
      <div className="home-content-wrapper" style={{ paddingTop: "90px", flex: 1 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}>
          {(categoryFilter || sellerFilter) && onBack && (
            <button onClick={onBack} className="back-btn" style={{ margin: '24px 0 24px 0' }}>
              <ArrowLeft size={18} />
              Back
            </button>
          )}
          {!searchQuery && !categoryFilter && !sellerFilter && <Banner />}
          <ProductList 
            onProductClick={onProductClick} 
            searchQuery={searchQuery} 
            categoryFilter={categoryFilter} 
            sellerFilter={sellerFilter}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
