import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Star, Share2, ShoppingCart, MapPin, Truck, RefreshCcw, Heart, ArrowLeft, Minus, Plus } from 'lucide-react';

import api from '../api/api';

export default function ProductDetails({ 
  product: initialProduct, 
  onLoginClick, 
  onCustomerLoginClick, 
  onLogoClick, 
  onSellerRegisterClick, 
  onBuyNow, 
  onCartClick, 
  onHeaderCartClick, 
  isCustomerAuth, 
  onLogoutClick, 
  onProfileClick, 
  onOrdersClick, 
  cartCount, 
  globalSettings, 
  onAboutClick,
  onSellerSelect,
  onSearch,
  onCategorySelect
}) {
  const [product, setProduct] = useState(initialProduct);
  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    try {
      // Build a product-specific shareable URL
      const productUrl = `${window.location.origin}/?product=${product.id}`;
      
      if (navigator.share) {
        // Use native iOS/Android share sheet when available
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on TokoXpress!`,
          url: productUrl,
        });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      } else {
        // Fallback for older browsers
        const el = document.createElement('textarea');
        el.value = productUrl;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to share/copy link', err);
    }
  };


  useEffect(() => {
    setProduct(initialProduct);
    if (initialProduct) {
      if (isCustomerAuth) checkReviewEligibility(initialProduct.id);
      
      // Fetch full product object including feedbacks, as initialProduct from home lacks them
      api.get(`/products/${initialProduct.id}`)
        .then(res => {
          setProduct(res.data);
        })
        .catch(err => console.error("Failed to load full product data", err));

      // Try to parse dynamic variants
      try {
        const variants = JSON.parse(initialProduct.color);
        if (variants && variants.length > 0) {
          const firstSize = variants[0];
          setSelectedSize(firstSize.size);
          const firstVariant = firstSize.variants[0];
          setSelectedColor(firstVariant.color);
        }
      } catch (e) {
        setSelectedSize('Standard');
        setSelectedColor('Default');
      }
    }
  }, [initialProduct, isCustomerAuth]);

  const checkReviewEligibility = async (pid) => {
    try {
      const res = await api.get('/customer/orders');
      const orders = res.data;
      // Find a delivered order for this product
      const hasDelivered = orders.some(o => o.product_id === pid && o.status === 3);
      
      if (hasDelivered) {
        // Also check if they already reviewed it (optional optimization, but let's just check purchase for now)
        setCanReview(true);
      }
    } catch (err) {
      console.error("Failed to check review eligibility", err);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/customer/feedback', {
        product_id: product.id,
        rating: feedbackRating,
        message: feedbackMsg
      });
      Swal.fire("Thank you!", "Your review has been submitted successfully.", "success");
      setFeedbackMsg("");
      setCanReview(false); // Hide form after success
      fetchProduct(); // Refresh to show new review
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${product.id}`);
      setProduct(res.data);
    } catch (err) { console.error("Failed to refresh product", err); }
  };

  // Logic to filter images by color
  const allImages = (product?.images || []).map(img => ({
    ...img,
    url: img.url ? img.url.replace('127.0.0.1', 'localhost') : (img.image_path ? `/storage/${img.image_path}` : null)
  }));

  // Filter images by color+size for clothing variants
  const colorSizeImages = allImages.filter(img => img.color === selectedColor && img.size === selectedSize);
  const colorImages = allImages.filter(img => !img.color || img.color === selectedColor);
  // Priority: exact color+size → color-only → all images
  const displayImages = colorSizeImages.length > 0 ? colorSizeImages : (colorImages.length > 0 ? colorImages : allImages);
  const mainImage = displayImages[activeImageIdx]?.url || (allImages[0]?.url) || null;

  const sellPrice = product?.final_price || product?.marked_price || 0;
  const price = product ? Number(sellPrice).toLocaleString() : '0';
  const disc = product?.discount_rate || 0;
  const originalPrice = disc > 0 ? Math.round(sellPrice / (1 - disc / 100)).toLocaleString() : null;

  // Extract unique sizes and colors from JSON
  let availableSizes = [];
  let availableColorsForSize = [];
  let outOfStockSizes = [];
  let outOfStockColors = [];

  try {
    const rawVariants = JSON.parse(product.color);
    
    // Size check: A size is out of stock if ALL its color variants have 0 qty
    availableSizes = rawVariants.map(v => v.size);
    outOfStockSizes = rawVariants
      .filter(sData => sData.variants.every(v => (v.qty || 0) <= 0))
      .map(sData => sData.size);

    const sizeData = rawVariants.find(v => v.size === selectedSize);
    if (sizeData) {
      availableColorsForSize = sizeData.variants;
      outOfStockColors = sizeData.variants
        .filter(v => (v.qty || 0) <= 0)
        .map(v => v.color);
    }
  } catch(e) {
    availableSizes = ["Standard"];
    availableColorsForSize = [{color: "#777", name: "Default", qty: product.quantity}];
    if (product.quantity <= 0) {
      outOfStockSizes = ["Standard"];
      outOfStockColors = ["#777"];
    }
  }

  const isGlobalOutOfStock = product.quantity <= 0;
  
  // Calculate max available quantity for current selection
  const maxAvailableQty = (() => {
    let maxQty = Number(product?.quantity || 0);
    try {
      if (product?.color) {
        const rawVariants = JSON.parse(product.color);
        const sizeData = rawVariants.find(v => v.size === selectedSize);
        if (sizeData) {
          const colorData = sizeData.variants.find(v => v.color === selectedColor);
          if (colorData && colorData.qty !== undefined) {
            maxQty = Number(colorData.qty);
          }
        }
      }
    } catch (e) {}
    return maxQty;
  })();

  const isSelectedVariantOutOfStock = maxAvailableQty <= 0 || isGlobalOutOfStock;

  // React effect to bring qty down if user switches to a variant with less stock
  useEffect(() => {
    if (qty > maxAvailableQty && maxAvailableQty > 0) {
      setQty(maxAvailableQty);
    } else if (maxAvailableQty === 0 && qty !== 1) {
      setQty(1); // Reset to 1 visually if out of stock, so it doesn't show 0
    }
  }, [maxAvailableQty, qty]);

  // React effect to auto-select the first available color when size changes
  useEffect(() => {
    try {
      if (product?.color) {
        const rawVariants = JSON.parse(product.color);
        const sizeData = rawVariants.find(v => v.size === selectedSize);
        if (sizeData && sizeData.variants && sizeData.variants.length > 0) {
          const isCurrentColorValid = sizeData.variants.some(v => v.color === selectedColor);
          // If the currently selected color doesn't exist for the new size, switch to the first available one
          if (!isCurrentColorValid) {
            setSelectedColor(sizeData.variants[0].color);
          }
        }
      }
    } catch(e) {}
  }, [selectedSize, product, selectedColor]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <Navbar
        onLoginClick={onLoginClick}
        onCustomerLoginClick={onCustomerLoginClick}
        onLogoClick={onLogoClick}
        onSellerRegisterClick={onSellerRegisterClick}
        onCartClick={onHeaderCartClick}
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

      <div className="home-content-wrapper" style={{ paddingTop: "120px", flex: 1, paddingBottom: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 25px" }}>
          
          <button onClick={onLogoClick} className="back-btn" style={{ marginBottom: "30px", border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#111', fontWeight: '500' }}>
            <ArrowLeft size={20} />
            <span style={{fontSize: '16px'}}>Back</span>
          </button>
          
          <div className="stack-on-mobile" style={{ display: "flex", gap: "60px", alignItems: 'flex-start' }}>
            
            {/* Gallery Section */}
            <div style={{ flex: "1.2" }}>
              <div style={{ width: "100%", height: "550px", borderRadius: "30px", overflow: "hidden", backgroundColor: "#fcfcfc", border: "1px solid #f0f0f0", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {mainImage ? (
                  <img src={mainImage} alt="Main" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : (
                  <div style={{ fontSize: "100px", color: "#eee" }}>?</div>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px", overflowX: 'auto', paddingBottom: '10px' }}>
                {displayImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImageIdx(idx)}
                    style={{ 
                      flexShrink: 0, width: "90px", height: "90px", borderRadius: "15px", overflow: "hidden", cursor: "pointer",
                      border: activeImageIdx === idx ? "2px solid #ff7a1a" : "1px solid #e0e0e0",
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={img.url} alt={`thumb-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div style={{ flex: "1" }}>
              <h1 style={{ fontSize: "42px", fontWeight: "700", color: "#111", margin: "0 0 15px 0", letterSpacing: '-1px' }}>{product?.name}</h1>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
                <div style={{ display: "flex", gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(s => {
                    const avg = parseFloat(product?.rating_avg || 0);
                    const filled = s <= Math.round(avg);
                    return <Star key={s} size={18} fill={filled ? "#ffc107" : "none"} color={filled ? "#ffc107" : "#ddd"} />;
                  })}
                </div>
                {(product?.rating_count || 0) > 0 ? (
                  <span style={{ fontSize: "15px", color: "#0284c7", fontWeight: '500' }}>
                    {parseFloat(product.rating_avg || 0).toFixed(1)} ({product.rating_count} {product.rating_count === 1 ? 'review' : 'reviews'})
                  </span>
                ) : (
                  <span style={{ fontSize: "14px", color: "#aaa", fontWeight: '400' }}>No reviews yet</span>
                )}
                <div style={{ marginLeft: "auto", position: 'relative' }}>
                  <div 
                    onClick={handleShare}
                    title="Copy link to share"
                    style={{ background: shareCopied ? '#111' : '#f5f5f5', padding: '10px', borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' }}
                  >
                    <Share2 size={20} color={shareCopied ? '#fff' : '#555'} />
                  </div>
                  {shareCopied && (
                    <div style={{
                      position: 'absolute', top: '-38px', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: '#111', color: '#fff', fontSize: '12px', fontWeight: '600',
                      padding: '5px 12px', borderRadius: '20px', whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease'
                    }}>
                      ✓ Link copied!
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "30px" }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px' }}>
                  <span style={{ fontSize: "40px", fontWeight: "800", color: "#111" }}>Rs. {price}</span>
                </div>
                {disc > 0 && (
                  <div style={{ fontSize: "18px", marginTop: '5px' }}>
                    <span style={{ textDecoration: "line-through", color: "#999" }}>Rs. {originalPrice}</span>
                    <span style={{ marginLeft: "12px", color: "#111", fontWeight: "700" }}>-{disc}%</span>
                  </div>
                )}
                {isGlobalOutOfStock && (
                  <div style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '15px', display: 'inline-block', fontWeight: '700', fontSize: '14px' }}>
                    Temporarily Out of Stock
                  </div>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', marginBottom: '30px' }} />

              {/* Variation Selectors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Quantity */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: "120px", fontSize: "16px", color: "#666", fontWeight: '500' }}>Quantity</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid #e0e0e0", borderRadius: "12px", padding: '5px' }}>
                      <button onClick={() => qty > 1 && setQty(qty - 1)} style={{...qtyBtnStyle, opacity: qty <= 1 ? 0.5 : 1, cursor: qty <= 1 ? 'not-allowed' : 'pointer'}}><Minus size={16}/></button>
                      <span style={{ width: "40px", textAlign: "center", fontWeight: '700', fontSize: '18px' }}>{qty}</span>
                      <button onClick={() => qty < maxAvailableQty && setQty(qty + 1)} style={{...qtyBtnStyle, opacity: qty >= maxAvailableQty ? 0.5 : 1, cursor: qty >= maxAvailableQty ? 'not-allowed' : 'pointer'}}><Plus size={16}/></button>
                    </div>
                    {maxAvailableQty > 0 && maxAvailableQty < 10 && (
                      <span style={{ fontSize: '13px', color: '#f97316', fontWeight: '600' }}>Only {maxAvailableQty} items left!</span>
                    )}
                  </div>
                </div>

                {/* Sizes */}
                {(availableSizes.length > 1 || (availableSizes.length === 1 && availableSizes[0] !== 'Standard' && availableSizes[0] !== '')) && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: "120px", fontSize: "16px", color: "#666", fontWeight: '500' }}>Size</span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {availableSizes.map(s => {
                        const isOOS = outOfStockSizes.includes(s);
                        return (
                          <button 
                            key={s}
                            disabled={isOOS}
                            onClick={() => !isOOS && setSelectedSize(s)}
                            style={{ 
                              padding: '10px 24px', borderRadius: '25px', 
                              border: selectedSize === s ? 'none' : '1px solid #ddd',
                              backgroundColor: selectedSize === s ? '#777' : '#fff', 
                              color: selectedSize === s ? '#fff' : (isOOS ? '#ccc' : '#444'),
                              fontWeight: '700', 
                              cursor: isOOS ? 'not-allowed' : 'pointer', 
                              transition: 'all 0.2s',
                              position: 'relative',
                              opacity: isOOS ? 0.6 : 1
                            }}
                          >
                            {s}
                            {isOOS && <div style={{ position: 'absolute', top: '-10px', right: '-5px', background: '#ff0000', color: '#fff', fontSize: '8px', padding: '2px 5px', borderRadius: '5px' }}>Sold Out</div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {(availableColorsForSize.length > 1 || (availableColorsForSize.length === 1 && availableColorsForSize[0].color !== '#000000' && availableColorsForSize[0].color !== '#777' && availableColorsForSize[0].name !== 'Default')) && (
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ width: "120px", fontSize: "16px", color: "#666", fontWeight: '500', marginTop: '12px' }}>Color Family</span>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {availableColorsForSize.map((c, idx) => {
                        const isOOS = outOfStockColors.includes(c.color);
                        return (
                          <div key={idx} style={{ textAlign: "center", position: 'relative' }}>
                            <div 
                              onClick={() => { if(!isOOS) { setSelectedColor(c.color); setActiveImageIdx(0); } }}
                              style={{ 
                                width: "48px", height: "48px", borderRadius: "50%", background: c.color, border: '4px solid #fff', 
                                cursor: isOOS ? "not-allowed" : "pointer",
                                boxShadow: selectedColor === c.color ? "0 0 0 2px #ff7a1a" : "0 0 0 1px #eee",
                                transition: 'all 0.2s',
                                opacity: isOOS ? 0.3 : 1
                              }}
                            />
                            {isOOS && <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: '#ff0000', transform: 'rotate(45deg)' }} />}
                            <div style={{ fontSize: "12px", marginTop: "8px", fontWeight: '500', color: isOOS ? "#ccc" : "#666" }}>{c.name || 'Color'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Seller Profile Section */}
              <div 
                onClick={() => onSellerSelect && onSellerSelect(product?.seller_id)}
                style={{ 
                  marginTop: "40px", 
                  padding: "20px", 
                  backgroundColor: "#f8fafc", 
                  borderRadius: "20px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "15px",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
              >
                <div style={{ 
                  width: "60px", 
                  height: "60px", 
                  borderRadius: "50%", 
                  overflow: "hidden", 
                  backgroundColor: "#e2e8f0",
                  border: "2px solid #fff",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                }}>
                  {product?.seller?.profile_picture_url ? (
                    <img 
                      src={product.seller.profile_picture_url.replace('127.0.0.1', 'localhost')} 
                      alt="Seller" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontWeight: "700", fontSize: "20px" }}>
                      {(product?.seller?.store_name || "S").substring(0, 1)}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sold By</div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>{product?.seller?.store_name || "Official Store"}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "20px", marginTop: "50px" }}>
                <button 
                  disabled={isSelectedVariantOutOfStock || isGlobalOutOfStock}
                  onClick={() => onBuyNow(product, qty, selectedSize, selectedColor, maxAvailableQty)}
                  style={{ 
                    flex: 1, padding: "20px", borderRadius: "40px", border: "none", 
                    background: (isSelectedVariantOutOfStock || isGlobalOutOfStock) ? "#ccc" : "#ff7a1a", 
                    color: "#fff", fontSize: "18px", fontWeight: "800", 
                    cursor: (isSelectedVariantOutOfStock || isGlobalOutOfStock) ? "not-allowed" : "pointer", 
                    boxShadow: (isSelectedVariantOutOfStock || isGlobalOutOfStock) ? 'none' : '0 10px 25px rgba(255,122,26,0.3)', 
                    transition: 'all 0.3s' 
                  }}
                >
                  {isSelectedVariantOutOfStock ? "Out of Stock" : "Buy Now"}
                </button>
                <button 
                  disabled={isSelectedVariantOutOfStock || isGlobalOutOfStock}
                  onClick={() => {
                    if (isSelectedVariantOutOfStock || isGlobalOutOfStock) return;
                    if (!isCustomerAuth) {
                      onCustomerLoginClick();
                      return;
                    }
                    onCartClick && onCartClick(product, qty, selectedSize, selectedColor, maxAvailableQty);
                  }}
                  style={{ 
                    flex: 1, padding: "20px", borderRadius: "40px", border: "none", 
                    background: (isSelectedVariantOutOfStock || isGlobalOutOfStock) ? "#f3f3f3" : "#111", 
                    color: (isSelectedVariantOutOfStock || isGlobalOutOfStock) ? "#aaa" : "#fff", 
                    fontSize: "18px", fontWeight: "800", 
                    cursor: (isSelectedVariantOutOfStock || isGlobalOutOfStock) ? "not-allowed" : "pointer", 
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", 
                    boxShadow: (isSelectedVariantOutOfStock || isGlobalOutOfStock) ? 'none' : '0 10px 25px rgba(0,0,0,0.1)', 
                    transition: 'all 0.3s' 
                  }}
                >
                  <ShoppingCart size={22} /> Add to Cart
                </button>
              </div>
            </div>
          </div>


          {/* Reviews Section */}
          <div style={{ marginTop: '80px', borderTop: '1px solid #eee', paddingTop: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111' }}>Customer Reviews</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#111' }}>{parseFloat(product?.rating_avg || 0).toFixed(1)}</div>
                <div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(s => {
                      const avg = parseFloat(product?.rating_avg || 0);
                      const filled = s <= Math.round(avg);
                      return <Star key={s} size={16} fill={filled ? "#ffc107" : "none"} color={filled ? "#ffc107" : "#ddd"} />;
                    })}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>Based on {product?.rating_count || 0} reviews</div>
                </div>
              </div>
            </div>

            <div className="stack-on-mobile" style={{ display: 'flex', gap: '60px' }}>
              {/* Feedback Form */}
              {canReview && (
                <div style={{ flex: '1', background: '#f8fafc', padding: '35px', borderRadius: '25px', height: 'fit-content', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Write a Review</h3>
                  <form onSubmit={handleSubmitFeedback}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '10px' }}>Rating</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}
                          >
                            <Star 
                              size={24} 
                              fill={star <= feedbackRating ? "#ffc107" : "none"} 
                              color={star <= feedbackRating ? "#ffc107" : "#cbd5e1"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: '25px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '10px' }}>Your Experience</label>
                      <textarea
                        value={feedbackMsg}
                        onChange={(e) => setFeedbackMsg(e.target.value)}
                        placeholder="Tell us what you liked or disliked about this product..."
                        required
                        style={{ 
                          width: '100%', minHeight: '120px', padding: '15px', borderRadius: '15px', border: '1px solid #cbd5e1', 
                          fontSize: '15px', fontFamily: 'inherit', outline: 'none', transition: 'all 0.2s', resize: 'vertical'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ 
                        width: '100%', padding: '15px', borderRadius: '15px', background: '#111', color: '#fff', 
                        fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer', border: 'none'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div style={{ flex: '1.5' }}>
                {(product?.feedbacks || []).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {product.feedbacks.map((f, idx) => (
                      <div key={idx} style={{ paddingBottom: '30px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' }}>
                              {(f.customer?.first_name || 'C').substring(0, 1)}
                            </div>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>{f.customer?.first_name} {f.customer?.last_name}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(f.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} size={14} fill={s <= f.rating ? "#ffc107" : "none"} color={s <= f.rating ? "#ffc107" : "#ddd"} />
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 10px 52px' }}>{f.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>💬</div>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#475569' }}>No reviews yet</h4>
                    <p style={{ fontSize: '14px' }}>Be the first to share your experience after purchasing!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const qtyBtnStyle = {
  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#f5f5f5', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
};
