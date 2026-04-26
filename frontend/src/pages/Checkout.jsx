import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api/api';
import { Trash2, Minus, Plus, ArrowLeft, CreditCard, Lock, CheckCircle, ChevronLeft } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT GATEWAY HELPERS
// When you receive the real bank / payment provider API keys, replace the
// marked sections below (search for "REPLACE_WITH_API" in this file).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * REPLACE_WITH_API: Credit / Debit Card Gateway
 * Integrate your bank's card-processing SDK here.
 * Expected inputs: { cardNumber, expiry, cvv, cardName, amount }
 * Expected response: { success: boolean, transactionId: string, errorMsg?: string }
 */
async function processCardPayment({ cardNumber, expiry, cvv, cardName, amount }) {
  // TODO: Replace with real payment gateway call, e.g.
  //   const resp = await fetch('https://api.yourbank.com/v1/charge', {
  //     method: 'POST',
  //     headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ card_number: cardNumber, expiry, cvv, holder_name: cardName, amount })
  //   });
  //   return await resp.json();

  // ─── SIMULATION (remove when real API is connected) ───────────────────────
  await new Promise(r => setTimeout(r, 1500)); // Simulate network delay
  return { success: true, transactionId: 'SIM-' + Date.now() };
  // ──────────────────────────────────────────────────────────────────────────
}

/**
 * REPLACE_WITH_API: Koko Pay Gateway
 * Integrate the Koko Pay SDK / API here.
 * Expected inputs: { phone, pin, amount }
 * Expected response: { success: boolean, transactionId: string, errorMsg?: string }
 */
async function processKokoPay({ phone, pin, amount }) {
  // ─── SIMULATION (remove when real API is connected) ───────────────────────
  await new Promise(r => setTimeout(r, 1200));
  return { success: true, transactionId: 'KP-' + Date.now() };
  // ──────────────────────────────────────────────────────────────────────────
}
/**
 * REPLACE_WITH_API: MintPay Gateway
 * Integrate MintPay SDK / API here.
 * Expected inputs: { phone, amount }
 * Expected response: { success: boolean, transactionId: string, errorMsg?: string }
 */
async function processMintPay({ phone, amount }) {
  // TODO: Replace with real MintPay API call
  await new Promise(r => setTimeout(r, 1500));
  return { success: true, transactionId: 'MINT-' + Date.now() };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Checkout({ cart, updateQty, removeItem, clearCart, onLoginClick, onCustomerLoginClick, onLogoClick, onSellerRegisterClick, isCustomerAuth, onLogoutClick, onProfileClick, onOrdersClick, onSearch, onCategorySelect, onAboutClick, cartCount, searchQuery, categoryFilter, globalSettings }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCodeId, setPromoCodeId] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoadingPM, setIsLoadingPM] = useState(true);

  // Payment gateway state
  const [payStep, setPayStep] = useState('select'); // 'select' | 'form' | 'processing' | 'success'
  const [selectedPM, setSelectedPM] = useState(null);
  const [cardData, setCardData] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
  const [kokoData, setKokoData] = useState({ phone: '', pin: '' });
  const [mintData, setMintData] = useState({ phone: '' });
  const [slipFile, setSlipFile] = useState(null);
  const [gwError, setGwError] = useState('');

  // Shipping details state
  const [shippingDetails, setShippingDetails] = useState({
    address: localStorage.getItem('customer_address') || '',
    contact: localStorage.getItem('customer_contact') || ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/customer/profile');
        if (res.data) {
          setShippingDetails({
            address: res.data.address || localStorage.getItem('customer_address') || '',
            contact: res.data.contact || localStorage.getItem('customer_contact') || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchProfile();
  }, []);

  // Initialize selected items on cart change
  useEffect(() => {
    setSelectedItems(cart.map(item => item.cartItemId || item.id));
  }, [cart.length]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await api.get('/payment-methods');
        setPaymentMethods(res.data);
      } catch (err) {
        console.error("Failed to fetch payment methods", err);
      } finally {
        setIsLoadingPM(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  const openPaymentModal = () => {
    setPayStep('select');
    setSelectedPM(null);
    setCardData({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
    setKokoData({ phone: '', pin: '' });
    setMintData({ phone: '' });
    setSlipFile(null);
    setGwError('');
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    if (payStep === 'processing') return; // Don't allow closing during processing
    setPaymentModalOpen(false);
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item.cartItemId || item.id));
    }
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(id => removeItem(id));
    setSelectedItems([]);
  };

  const itemTotal = cart.filter(item => selectedItems.includes(item.cartItemId || item.id))
    .reduce((sum, item) => sum + ((item.final_price || item.marked_price) * item.qty), 0);
  
  const promoSaving = Math.round(itemTotal * promoDiscount / 100);
  const selectedCartItems = cart.filter(item => selectedItems.includes(item.cartItemId || item.id));
  const deliveryFee = selectedCartItems.reduce((sum, item) => sum + (Number(item.delivery_fee) || 250), 0);
  const total = itemTotal - promoSaving + deliveryFee;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Swal.fire('No Promo Code Applied', 'Please enter a promo code to apply a discount.', 'info');
      return;
    }
    try {
      const res = await api.post('/customer/validate-promo', { code: promoCode });
      setPromoDiscount(res.data.discount_percent || 0);
      setPromoCodeId(res.data.id || null);
      Swal.fire(`Promo applied! ${res.data.discount_percent}% discount.`);
    } catch (err) {
      setPromoDiscount(0);
      setPromoCodeId(null);
      Swal.fire(err.response?.data?.message || 'Invalid promo code');
    }
  };

  const handlePlaceOrder = async (paymentMethodId) => {
    const selectedCartItems = cart.filter(item => selectedItems.includes(item.cartItemId || item.id));
    if (selectedCartItems.length === 0) return Swal.fire('No items selected.');
    
    try {
      for (const item of selectedCartItems) {
        const formData = new FormData();
        formData.append('product_id', item.id);
        formData.append('seller_id', item.seller_id);
        formData.append('quantity', item.qty);
        formData.append('size', item.size || 'none');
        formData.append('color', item.color || 'none');
        formData.append('delivery_address', shippingDetails.address || 'Default Address');
        formData.append('contact_no', shippingDetails.contact || '0000000000');
        formData.append('delivery_fee', item.delivery_fee || 250);
        formData.append('payment_method', paymentMethodId);
        if (promoCodeId) formData.append('promo_code_id', promoCodeId);
        formData.append('total_amount', Math.round((((item.final_price || item.marked_price) * item.qty) * (1 - (promoDiscount / 100))) + (item.delivery_fee || 250)));
        
        if (slipFile) {
          formData.append('payment_slip', slipFile);
        }

        await api.post('/customer/orders', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      selectedCartItems.forEach(item => removeItem(item.cartItemId || item.id));
      setPayStep('success');
    } catch (err) {
      setGwError('Error placing order: ' + (err.response?.data?.message || err.message));
      setPayStep('form');
    }
  };

  // Determine the "type" of a payment method by name
  const getPMType = (pm) => {
    const n = (pm?.name || '').toLowerCase();
    if (n.includes('cash') || n.includes('cod') || n.includes('delivery')) return 'cod';
    if (n.includes('koko')) return 'koko';
    if (n.includes('mint')) return 'mint';
    if (n.includes('transfer') || n.includes('online')) return 'online_transfer';
    if (n.includes('card') || n.includes('credit') || n.includes('debit') || n.includes('visa') || n.includes('master')) return 'card';
    return 'generic';
  };

  const handleMethodSelect = (pm) => {
    if (pm.is_disabled) return;
    setSelectedPM(pm);
    setGwError('');
    setPayStep('form');
  };

  const handlePaymentFormSubmit = async (e) => {
    e.preventDefault();
    setGwError('');
    const pmType = getPMType(selectedPM);

    setPayStep('processing');
    try {
      let gatewayResult = { success: true };

      if (pmType === 'card') {
        // Basic client-side validation
        if (cardData.cardNumber.replace(/\s/g,'').length < 16) {
          setGwError('Please enter a valid 16-digit card number.');
          setPayStep('form');
          return;
        }
        // REPLACE_WITH_API: call real card gateway
        gatewayResult = await processCardPayment({ ...cardData, amount: total });
      } else if (pmType === 'koko') {
        if (!kokoData.phone || kokoData.pin.length < 4) {
          setGwError('Please enter a valid phone number and PIN.');
          setPayStep('form');
          return;
        }
        // REPLACE_WITH_API: call real Koko Pay gateway
        gatewayResult = await processKokoPay({ ...kokoData, amount: total });
      } else if (pmType === 'mint') {
        if (!mintData.phone || mintData.phone.length < 9) {
          setGwError('Please enter a valid mobile number.');
          setPayStep('form');
          return;
        }
        // REPLACE_WITH_API: call real MintPay gateway
        gatewayResult = await processMintPay({ ...mintData, amount: total });
      } else if (pmType === 'online_transfer') {
        if (!slipFile) {
          setGwError('Please upload your payment slip.');
          setPayStep('form');
          return;
        }
      }
      // COD / generic: no external gateway call needed

      if (!gatewayResult.success) {
        setGwError(gatewayResult.errorMsg || 'Payment declined. Please try again.');
        setPayStep('form');
        return;
      }

      await handlePlaceOrder(selectedPM.id);
    } catch (err) {
      setGwError('An unexpected error occurred. Please try again.');
      setPayStep('form');
    }
  };

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const getPMIcon = (pm) => {
    // Use uploaded image URL if available
    if (pm.icon_url) return <img src={pm.icon_url} alt={pm.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px' }} />;
    // Otherwise use emoji
    if (pm.icon) return <span style={{ fontSize: '36px' }}>{pm.icon}</span>;
    return <span style={{ fontSize: '36px' }}>💰</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#fff", fontFamily: "sans-serif" }}>
      <Navbar 
        onLoginClick={onLoginClick} 
        onCustomerLoginClick={onCustomerLoginClick} 
        onLogoClick={onLogoClick} 
        onSellerRegisterClick={onSellerRegisterClick} 
        isCustomerAuth={isCustomerAuth} 
        onLogoutClick={onLogoutClick} 
        onProfileClick={onProfileClick} 
        onOrdersClick={onOrdersClick}
        onSearch={onSearch}
        onCategorySelect={onCategorySelect}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        cartCount={cart.length}
        globalSettings={globalSettings}
        onAboutClick={onAboutClick}
      />

      <div style={{ paddingTop: "100px", flex: 1, paddingBottom: "50px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <button onClick={onLogoClick} className="back-btn" style={{ marginBottom: "20px" }}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          
          <div className="stack-on-mobile" style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
          
          {/* List Section */}
          <div style={{ flex: 1 }}>
            {cart.length > 0 && (
              <div style={{ backgroundColor: "#f3f3f3", padding: "15px 20px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === cart.length && cart.length > 0} 
                  onChange={toggleSelectAll} 
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontWeight: "600", fontSize: "15px" }}>Select All ({cart.length} item(s))</span>
              </div>
              <div onClick={handleDeleteSelected} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", color: "#666" }}>
                <Trash2 size={18} />
                <span style={{ fontSize: "14px", fontWeight: "600" }}>Delete</span>
              </div>
            </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {cart.map(item => {
                const imageUrl = item.images?.[0]?.url?.replace('127.0.0.1', 'localhost') || null;
                const isSelected = selectedItems.includes(item.cartItemId || item.id);

                return (
                  <div key={item.cartItemId || item.id} className="stack-on-mobile" style={{ backgroundColor: "#f3f3f3", padding: "20px", borderRadius: "15px", display: "flex", alignItems: "center", gap: "20px" }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => toggleItemSelection(item.cartItemId || item.id)}
                      style={{ width: "18px", height: "18px", cursor: "pointer" }}
                    />
                    <div style={{ width: "100px", height: "110px", backgroundColor: "#fff", borderRadius: "10px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ fontSize: "30px", color: "#ddd" }}>?</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "16px", fontWeight: "500", color: "#333", marginBottom: "4px" }}>{item.name}</div>
                      {(item.size || item.color) && (
                        <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px", display: "flex", gap: "10px" }}>
                          {item.size && item.size !== 'none' && <span>Size: <strong style={{color:"#000"}}>{item.size}</strong></span>}
                          {item.color && item.color !== 'none' && <span>Color: <strong style={{color:"#000"}}>{item.color}</strong></span>}
                        </div>
                      )}
                      <div style={{ fontSize: "20px", fontWeight: "700", color: "#000" }}>Rs. {(item.final_price || item.marked_price).toLocaleString()}</div>
                      {item.discount_rate > 0 && (
                        <div style={{ fontSize: "14px", color: "#999", textDecoration: "line-through" }}>
                          Rs. {Math.round((item.final_price || item.marked_price) / (1 - item.discount_rate / 100)).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <button onClick={() => updateQty(item.cartItemId || item.id, -1)} style={{ background: "none", border: "none", cursor: "pointer" }}><Minus size={20} /></button>
                      <span style={{ fontSize: "18px", fontWeight: "600" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.cartItemId || item.id, 1)} style={{ background: "none", border: "none", cursor: "pointer" }}><Plus size={20} /></button>
                    </div>
                  </div>
                );
              })}
              {cart.length === 0 && (
                <div style={{ textAlign: "center", padding: "100px 0", color: "#999", fontSize: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                  <div>Your cart is empty.</div>
                  <button 
                    onClick={onLogoClick} 
                    style={{ padding: "12px 30px", backgroundColor: "#f97316", color: "#fff", border: "none", borderRadius: "30px", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          <div style={{ backgroundColor: "#f3f3f3", borderRadius: "15px", padding: "25px", alignSelf: "start", width: "400px", minWidth: "350px" }}>
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ fontSize: "14px", color: "#666", marginBottom: "12px", fontWeight: "600" }}>Promotion Code</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ flex: 1, padding: "10px 15px", borderRadius: "20px", border: "1px solid #ddd", fontSize: "14px", outline: "none" }}
                />
                <button 
                  onClick={handleApplyPromo}
                  style={{ backgroundColor: "#3b82f6", color: "#fff", border: "none", borderRadius: "20px", padding: "0 25px", fontWeight: "700", cursor: "pointer" }}
                >
                  Apply
                </button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #ddd", paddingTop: "25px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Order Summary</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "#333" }}>
                <span>Item Total ({selectedItems.length} items)</span>
                <span>Rs. {itemTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "#333" }}>
                <span>Delivery Fee</span>
                <span>Rs. {deliveryFee.toLocaleString()}</span>
              </div>
              {promoDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "#22a549" }}>
                  <span>Promo Discount</span>
                  <span>-Rs. {promoSaving.toLocaleString()}</span>
                </div>
              )}
              
              <div style={{ borderTop: "1px solid #ddd", marginTop: "20px", paddingTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "700", color: "#000", marginBottom: "5px" }}>
                  <span>Total:</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#999", textAlign: "right", marginBottom: "20px" }}>VAT Included, where applicable</div>
              </div>

              {/* Shipping Details Section */}
              <div style={{ marginBottom: "25px", padding: "15px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>Delivery Information</h4>
                  <button 
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    style={{ background: "none", border: "none", color: "#3b82f6", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                  >
                    {isEditingAddress ? "Cancel" : "Edit"}
                  </button>
                </div>
                
                {isEditingAddress ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <textarea 
                      placeholder="Delivery Address"
                      value={shippingDetails.address}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, address: e.target.value }))}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", resize: "none", height: "60px", boxSizing: "border-box" }}
                    />
                    <input 
                      type="text"
                      placeholder="Contact Number"
                      value={shippingDetails.contact}
                      onChange={(e) => setShippingDetails(prev => ({ ...prev, contact: e.target.value }))}
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", boxSizing: "border-box" }}
                    />
                    <button 
                      onClick={async () => {
                        try {
                          await api.put('/customer/update-shipping', {
                            address: shippingDetails.address,
                            contact: shippingDetails.contact
                          });
                          localStorage.setItem('customer_address', shippingDetails.address);
                          localStorage.setItem('customer_contact', shippingDetails.contact);
                          setIsEditingAddress(false);
                          Swal.fire({
                            title: "Updated!",
                            text: "Shipping information saved successfully.",
                            icon: "success",
                            timer: 1500,
                            showConfirmButton: false
                          });
                        } catch (err) {
                          Swal.fire("Error", "Failed to save shipping info", "error");
                        }
                      }}
                      style={{ backgroundColor: "#111", color: "#fff", border: "none", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}
                    >
                      Save Details
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.5" }}>
                    <div style={{ fontWeight: "600", color: "#111" }}>Address:</div>
                    <div style={{ marginBottom: "8px" }}>{shippingDetails.address || "No address provided"}</div>
                    <div style={{ fontWeight: "600", color: "#111" }}>Contact:</div>
                    <div>{shippingDetails.contact || "No contact provided"}</div>
                  </div>
                )}
              </div>

              <button 
                onClick={openPaymentModal}
                disabled={!shippingDetails.address || !shippingDetails.contact || selectedItems.length === 0}
                style={{ width: "100%", backgroundColor: (!shippingDetails.address || !shippingDetails.contact || selectedItems.length === 0) ? "#ccc" : "#f97316", color: "#fff", border: "none", padding: "15px", borderRadius: "30px", fontSize: "16px", fontWeight: "700", cursor: (!shippingDetails.address || !shippingDetails.contact || selectedItems.length === 0) ? "not-allowed" : "pointer" }}
              >
                Proceed to pay
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <Footer />

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
          <div style={{ width: "720px", maxWidth: "95vw", padding: "40px", borderRadius: "20px", background: "white", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            
            {/* Close button – hidden during processing */}
            {payStep !== 'processing' && payStep !== 'success' && (
              <button onClick={closePaymentModal} style={{ position: "absolute", right: "20px", top: "20px", background: "transparent", border: "none", cursor: "pointer", fontSize: "22px", color: "#555" }}>✕</button>
            )}

            {/* ── STEP 1: Select Payment Method ── */}
            {payStep === 'select' && (
              <>
                <h2 style={{ fontSize: "22px", margin: "0 0 8px 0", fontWeight: "700" }}>Select Payment Method</h2>
                <p style={{ margin: "0 0 28px 0", fontSize: "14px", color: "#888" }}>Choose how you'd like to pay. Your payment is secured with 256-bit SSL encryption.</p>

                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {/* Payment Method Cards */}
                  <div style={{ flex: 1.5, display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    {isLoadingPM ? (
                      <div style={{ width: "100%", textAlign: "center", padding: "20px", color: "#666" }}>Loading payment options...</div>
                    ) : paymentMethods.length > 0 ? (
                      paymentMethods.map((pm) => (
                        <div
                          key={pm.id}
                          onClick={() => handleMethodSelect(pm)}
                          style={{ 
                            flex: "1 1 150px", 
                            backgroundColor: pm.is_disabled ? "#f0f0f0" : "#f8f8f8", 
                            border: pm.is_disabled ? "2px solid #e0e0e0" : "2px solid #f0f0f0",
                            borderRadius: "16px", 
                            padding: "24px 10px", 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            cursor: pm.is_disabled ? "not-allowed" : "pointer", 
                            textAlign: "center", 
                            gap: "12px", 
                            transition: "all 0.2s",
                            minWidth: "140px",
                            opacity: pm.is_disabled ? 0.7 : 1,
                            position: "relative"
                          }}
                          onMouseOver={(e) => { 
                            if (!pm.is_disabled) {
                              e.currentTarget.style.border = '2px solid #f97316'; 
                              e.currentTarget.style.transform = 'translateY(-3px)'; 
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(249,115,22,0.15)'; 
                            }
                          }}
                          onMouseOut={(e) => { 
                            if (!pm.is_disabled) {
                              e.currentTarget.style.border = '2px solid #f0f0f0'; 
                              e.currentTarget.style.transform = 'translateY(0)'; 
                              e.currentTarget.style.boxShadow = 'none'; 
                            }
                          }}
                        >
                          {pm.is_disabled && (
                            <div style={{ 
                              position: "absolute", 
                              top: "10px", 
                              right: "10px", 
                              backgroundColor: "#fee2e2", 
                              color: "#b91c1c", 
                              padding: "2px 8px", 
                              borderRadius: "10px", 
                              fontSize: "10px", 
                              fontWeight: "700" 
                            }}>
                              Unavailable
                            </div>
                          )}
                          {getPMIcon(pm)}
                          <span style={{ fontSize: "14px", fontWeight: "600", color: pm.is_disabled ? "#999" : "#222" }}>{pm.name}</span>
                          {pm.is_disabled && (
                             <span style={{ fontSize: "11px", color: "#b91c1c", fontWeight: "500" }}>can't be using it currently</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ width: "100%", textAlign: "center", padding: "20px", color: "#ef4444" }}>No payment methods available. Please contact support.</div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div style={{ flex: 1, backgroundColor: "#f9f9f9", borderRadius: "16px", padding: "20px", fontSize: "13px", color: "#444", minWidth: "160px" }}>
                    <div style={{ fontWeight: "700", marginBottom: "14px", color: "#111", fontSize: "14px" }}>Order Summary</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Subtotal</span><span>Rs. {itemTotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Delivery</span><span>Rs. {deliveryFee.toLocaleString()}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#22a549" }}>
                        <span>Promo</span><span>-Rs. {promoSaving.toLocaleString()}</span>
                      </div>
                    )}
                    <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "12px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#111", fontSize: "15px" }}>
                      <span>Total</span><span>Rs. {total.toLocaleString()}</span>
                    </div>
                    <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px", color: "#888", fontSize: "12px" }}>
                      <Lock size={12} /> SSL Secured Payment
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: Payment Form ── */}
            {payStep === 'form' && selectedPM && (() => {
              const pmType = getPMType(selectedPM);
              return (
                <>
                  <button onClick={() => setPayStep('select')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '14px', marginBottom: '20px', padding: '0' }}>
                    <ChevronLeft size={16} /> Back to methods
                  </button>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
                    {getPMIcon(selectedPM)}
                    <div>
                      <h2 style={{ fontSize: "20px", margin: "0 0 2px 0", fontWeight: "700" }}>{selectedPM.name}</h2>
                      <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>Total: <strong style={{ color: '#111' }}>Rs. {total.toLocaleString()}</strong></p>
                    </div>
                  </div>

                  {gwError && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
                      ⚠ {gwError}
                    </div>
                  )}

                  <form onSubmit={handlePaymentFormSubmit}>
                    {pmType === 'card' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="John Smith"
                            required
                            value={cardData.cardName}
                            onChange={e => setCardData(p => ({ ...p, cardName: e.target.value }))}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>Card Number</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              required
                              value={cardData.cardNumber}
                              onChange={e => setCardData(p => ({ ...p, cardNumber: formatCardNumber(e.target.value) }))}
                              maxLength={19}
                              style={{ width: '100%', padding: '12px 48px 12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', letterSpacing: '1px', boxSizing: 'border-box' }}
                            />
                            <CreditCard size={20} color="#aaa" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              required
                              value={cardData.expiry}
                              onChange={e => setCardData(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                              maxLength={5}
                              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>CVV / CVC</label>
                            <input
                              type="password"
                              placeholder="•••"
                              required
                              maxLength={4}
                              value={cardData.cvv}
                              onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                        <div style={{ backgroundColor: '#f0f9ff', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#0369a1' }}>
                          <Lock size={14} /> Your card details are processed securely.
                          {/* REPLACE_WITH_API: Display your bank's security badge/logo here */}
                        </div>
                      </div>
                    )}

                    {pmType === 'koko' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ backgroundColor: '#faf5ff', borderRadius: '16px', padding: '16px', border: '1px solid #e9d5ff', fontSize: '13px', color: '#7c3aed' }}>
                          Pay securely with your Koko Pay wallet. Enter the mobile number linked to your account and your 4-digit PIN.
                          {/* REPLACE_WITH_API: Replace static text with Koko Pay SDK widget or redirect */}
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>Koko Pay Mobile Number</label>
                          <input
                            type="tel"
                            placeholder="07X XXXXXXX"
                            required
                            value={kokoData.phone}
                            onChange={e => setKokoData(p => ({ ...p, phone: e.target.value }))}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>Koko Pay PIN</label>
                          <input
                            type="password"
                            placeholder="••••"
                            required
                            maxLength={6}
                            value={kokoData.pin}
                            onChange={e => setKokoData(p => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    )}

                    {pmType === 'mint' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '16px', border: '1px solid #bcf0da', fontSize: '13px', color: '#047857' }}>
                          Split your payment into 3 interest-free installments with MintPay. Enter your mobile number to receive an OTP.
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>MintPay Mobile Number</label>
                          <input
                            type="tel"
                            placeholder="07X XXXXXXX"
                            required
                            value={mintData.phone}
                            onChange={e => setMintData(p => ({ ...p, phone: e.target.value }))}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    )}

                    {pmType === 'online_transfer' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', padding: '16px', border: '1px solid #bfdbfe', fontSize: '13px', color: '#1e40af' }}>
                          Please transfer the total amount to the bank account below and upload the payment slip (Image, PDF or Doc).
                          <div style={{ marginTop: '10px', fontWeight: '700' }}>
                            Bank: Bank of Ceylon<br/>
                            Acc Name: TokoXpress (PVT) LTD<br/>
                            Acc No: 1234567890<br/>
                            Branch: Colombo Main
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' }}>Upload Payment Slip</label>
                          <div 
                            onClick={() => document.getElementById('slip-upload').click()}
                            style={{ 
                              border: `2px dashed ${slipFile ? '#22c55e' : '#ddd'}`,
                              borderRadius: '12px', 
                              padding: '30px', 
                              textAlign: 'center', 
                              cursor: 'pointer',
                              backgroundColor: slipFile ? '#f0fdf4' : '#fafafa',
                              transition: 'all 0.2s'
                            }}
                          >
                            <input 
                              id="slip-upload"
                              type="file" 
                              hidden 
                              onChange={(e) => setSlipFile(e.target.files[0])}
                              accept="image/*,.pdf,.doc,.docx"
                            />
                            {slipFile ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle size={32} color="#22c55e" />
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>{slipFile.name}</span>
                                <span style={{ fontSize: '12px', color: '#666' }}>Click to change file</span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ fontSize: '32px' }}>📄</div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#444' }}>Select Payment Slip</span>
                                <span style={{ fontSize: '12px', color: '#888' }}>Supports PNG, JPG, PDF, DOC (Max 2MB)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(pmType === 'cod' || pmType === 'generic') && (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '56px', marginBottom: '16px' }}>{selectedPM.icon || '🚚'}</div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Cash on Delivery</h3>
                        <p style={{ fontSize: '15px', color: '#555', maxWidth: '380px', margin: '0 auto 20px' }}>
                          Your order will be delivered to your address. Please have <strong>Rs. {total.toLocaleString()}</strong> ready when the delivery arrives.
                        </p>
                        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '12px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#166534' }}>
                          <CheckCircle size={14} /> No online payment needed — pay on delivery
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      style={{ 
                        width: '100%', marginTop: '24px', padding: '16px', borderRadius: '14px', border: 'none',
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#fff', fontSize: '17px',
                        fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 25px rgba(249,115,22,0.3)', transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {pmType === 'cod' || pmType === 'generic' ? 'Confirm Order' : `Pay Rs. ${total.toLocaleString()}`}
                    </button>
                  </form>
                </>
              );
            })()}

            {/* ── STEP 3: Processing ── */}
            {payStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '64px', height: '64px', border: '4px solid #f0f0f0', borderTop: '4px solid #f97316', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 0.8s linear infinite' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Processing Payment…</h3>
                <p style={{ color: '#888', fontSize: '14px' }}>Please do not close this window.</p>
              </div>
            )}

            {/* ── STEP 4: Success ── */}
            {payStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <div style={{ width: '72px', height: '72px', backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={40} color="#059669" />
                </div>
                <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#111' }}>Order Placed! 🎉</h2>
                <p style={{ fontSize: '15px', color: '#555', marginBottom: '28px' }}>
                  Your order has been successfully placed with <strong>{selectedPM?.name}</strong>. You'll receive a confirmation soon.
                </p>
                <button
                  onClick={() => { setPaymentModalOpen(false); onLogoClick && onLogoClick(); }}
                  style={{ padding: '14px 36px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
