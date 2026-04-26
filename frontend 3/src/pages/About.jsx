import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import aboutImg from '../assets/ecommerce_about_img.png';

export default function About({
  onLoginClick, onCustomerLoginClick, onCartClick, onLogoClick,
  onSellerRegisterClick, isCustomerAuth, onLogoutClick, onProfileClick,
  onOrdersClick, onSearch, onCategorySelect, cartCount, globalSettings, onAboutClick
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f8f8f8", fontFamily: "sans-serif" }}>
      <Navbar
        onLoginClick={onLoginClick}
        onCustomerLoginClick={onCustomerLoginClick}
        onCartClick={onCartClick}
        onLogoClick={onLogoClick}
        onSellerRegisterClick={onSellerRegisterClick}
        isCustomerAuth={isCustomerAuth}
        onLogoutClick={onLogoutClick}
        onProfileClick={onProfileClick}
        onOrdersClick={onOrdersClick}
        onSearch={onSearch}
        onCategorySelect={onCategorySelect}
        cartCount={cartCount}
        globalSettings={globalSettings}
        onAboutClick={onAboutClick}
      />

      <div className="home-content-wrapper" style={{ flex: 1, paddingTop: "80px", position: "relative", overflow: "hidden" }}>

        {/* Decorative Starburst SVG */}
        <div className="about-starburst">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Simple Starburst icon */}
            <path d="M50 0 L55 35 L95 15 L65 45 L100 50 L65 55 L95 85 L55 65 L50 100 L45 65 L5 85 L35 55 L0 50 L35 45 L5 15 L45 35 Z" fill="#111" />
          </svg>
        </div>

        <div className="about-hero-wrapper">

          {/* Left Column wrapper with Image */}
          <div className="about-image-col">
            <img
              src={aboutImg}
              alt="TokoXpress Ecommerce"
            />
            {/* Minimal Social Icons */}
            <div className="about-socials">
              <div style={{ cursor: "pointer", fontWeight: "bold", fontSize: "18px" }}>T</div> {/* Twitter */}
              <div style={{ cursor: "pointer", fontWeight: "bold", fontSize: "18px" }}>F</div> {/* Facebook */}
              <div style={{ cursor: "pointer", fontWeight: "bold", fontSize: "18px" }}>I</div> {/* Instagram */}
            </div>
          </div>

          {/* Right Column with Typography */}
          <div className="about-text-col">
            <h1 className="about-heading">
              ABOUT US
            </h1>

            <div className="about-body">
              <p>
                We are passionate about empowering local businesses and creators by giving their craftsmanship the recognition it deserves. Our products are carefully sourced reflecting the skill, dedication, and stories of people behind them. Step into a unique and refined shopping experience.
              </p>
              <p>
                Currently, we offer a carefully curated selection of handcrafted items designed to help you find unique aesthetics as seamlessly and painlessly as possible. We value our customers above everything else, meaning that we won't take 'OK' as an answer.
              </p>

              <div className="about-accent-bar"></div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
