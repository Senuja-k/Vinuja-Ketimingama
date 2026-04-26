import Swal from 'sweetalert2';
import { useState, useRef } from "react";
import { X, Upload, Save } from "lucide-react";
import "../../styles.css";

export default function SellerRegisterModal({ onClose, onRegister }) {
  const [frontFileName, setFrontFileName] = useState("");
  const [backFileName, setBackFileName] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const handleFrontChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFrontFileName(e.target.files[0].name);
    }
  };

  const handleBackChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setBackFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10005 }}>
      <div 
        className="modal-content" 
        style={{ width: "760px", padding: "25px 40px", borderRadius: "20px", background: "white", position: "relative", maxHeight: "98vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} style={{ top: "20px", right: "20px", fontSize: "20px" }}>
          <X size={20} />
        </button>
        
        <h2 style={{ textAlign: "center", fontSize: "20px", fontWeight: "700", marginTop: 0, marginBottom: "15px", color: "#111" }}>
          Seller Register
        </h2>

        <form className="marketeer-form" style={{ gap: "12px" }} onSubmit={async (e) => {
          e.preventDefault();
          if (!agreed) {
            Swal.fire("Please agree to the Terms & Conditions first.");
            return;
          }
          const formData = new FormData(e.target);
          if (frontInputRef.current?.files[0]) {
            formData.append('nic_front', frontInputRef.current.files[0]);
          }
          if (backInputRef.current?.files[0]) {
            formData.append('nic_back', backInputRef.current.files[0]);
          }
          const apiBase = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api';
          try {
            const res = await fetch(`${apiBase}/seller/register`, {
              method: "POST",
              headers: {
                "Accept": "application/json"
              },
              body: formData
            });
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "Registration failed");
            }
            Swal.fire("Registration successful!");
            if (onRegister) onRegister(formData.get("first_name") || "Seller");
          } catch (err) {
            Swal.fire(err.message);
          }
        }}>
          <div className="form-row">
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>First Name:</label>
              <input 
                type="text" 
                name="first_name"
                className="modal-input" 
                style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} 
              />
            </div>
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Last Name:</label>
              <input type="text" name="last_name" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Address:</label>
              <input type="text" name="address" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Email:</label>
              <input type="email" name="email" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: "10px" }}>
              <label style={{ width: "90px", marginBottom: 0 }}>Store Name:</label>
              <input type="text" name="store_name" className="modal-input" style={{ flex: 1, padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: "5px" }}>
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Contact no:</label>
              <input type="text" name="contact" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>NIC no:</label>
              <input type="text" name="nic" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ marginBottom: "3px" }}>NIC Front Side:</label>
              <div 
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => frontInputRef.current?.click()}
              >
                 <input 
                   type="text" 
                   className="modal-input" 
                   value={frontFileName || ""}
                   style={{ width: "100%", padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4", boxSizing: "border-box", cursor: "pointer" }} 
                   readOnly 
                 />
                 <Upload size={16} color="#666" style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)" }} />
                 <input 
                   type="file" 
                   ref={frontInputRef} 
                   accept="image/*"
                   style={{ display: "none" }} 
                   onChange={handleFrontChange} 
                 />
              </div>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ marginBottom: "3px" }}>NIC Back Side:</label>
              <div 
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => backInputRef.current?.click()}
              >
                 <input 
                   type="text" 
                   className="modal-input" 
                   value={backFileName || ""}
                   style={{ width: "100%", padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4", boxSizing: "border-box", cursor: "pointer" }} 
                   readOnly 
                 />
                 <Upload size={16} color="#666" style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)" }} />
                 <input 
                   type="file" 
                   ref={backInputRef} 
                   accept="image/*"
                   style={{ display: "none" }} 
                   onChange={handleBackChange} 
                 />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{ width: "100%" }}>
              <label style={{ marginBottom: "3px" }}>Referral Promo Code (Optional):</label>
              <input type="text" name="referral_code" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} placeholder="TXSB001, etc." />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Username:</label>
              <input type="text" name="username" autoComplete="off" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Password:</label>
              <input type="password" name="password" autoComplete="new-password" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "10px 0" }} />

          <h3 style={{ textAlign: "center", fontSize: "16px", fontWeight: "600", marginTop: 0, marginBottom: "10px", color: "#111" }}>
            Bank Details
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Bank name:</label>
              <input type="text" name="bank_name" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Branch:</label>
              <input type="text" name="branch" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Account no:</label>
              <input type="text" name="account_no" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
            <div className="form-group">
              <label style={{ marginBottom: "3px" }}>Account holder name:</label>
              <input type="text" name="account_holder_name" className="modal-input" style={{ padding: "8px 15px", borderRadius: "15px", backgroundColor: "#f4f4f4" }} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", marginBottom: "5px" }}>
            <input 
              type="checkbox" 
              id="declare" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ accentColor: "#6366f1", width: "16px", height: "16px", cursor: "pointer" }} 
            />
            <label htmlFor="declare" style={{ fontSize: "11px", color: "#666", cursor: "pointer" }}>
              I agree to the <span style={{ color: "#111", fontWeight: "bold", textDecoration: "underline" }} onClick={() => setShowTerms(true)}>Seller Terms & Conditions</span>
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
            <input type="checkbox" id="declare2" style={{ accentColor: "#6366f1", width: "16px", height: "16px", cursor: "pointer" }} required />
            <label htmlFor="declare2" style={{ fontSize: "11px", color: "#666", fontStyle: "italic", cursor: "pointer" }}>
              I hereby declare that the information provided is true and correct.
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <button 
              type="submit"
              style={{ backgroundColor: "#ff8c00", color: "#fff", border: "none", borderRadius: "25px", padding: "10px 30px", fontSize: "14px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", transition: "opacity 0.2s" }} 
              onMouseOver={e => e.currentTarget.style.opacity = '0.8'} 
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              Save Details!
            </button>
          </div>
        </form>

        {showTerms && (
          <div className="modal-overlay" style={{ zIndex: 10006, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="modal-content" style={{ width: "650px", height: "80vh", padding: "40px", position: "relative", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={() => setShowTerms(false)} 
                style={{ top: "20px", right: "20px", fontSize: "24px", color: "#666" }}
              >
                ×
              </button>
              <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#111" }}>Seller Agreement</h2>
              <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px", fontSize: "14px", lineHeight: "1.6", color: "#444", textAlign: "left" }}>
                <div style={{ padding: "10px" }}>
                  <p><strong>PURPOSE</strong><br/>
                  Under this agreement, the Seller is granted permission to display and sell their products/services on the website owned by the Platform Owner.</p>
                  
                  <p><strong>SELLER RESPONSIBILITIES</strong><br/>
                  - Provide accurate product descriptions, prices, and images<br/>
                  - Ensure the quality and legality of products<br/>
                  - Respond promptly to customer inquiries<br/>
                  - Comply with the website’s rules and regulations</p>
                  
                  <p><strong>RESPONSIBILITIES OF THE WEBSITE OWNER</strong><br/>
                  - Provide Sellers access to use the website<br/>
                  - Promote products when necessary<br/>
                  - Facilitate communication with customers</p>
                  
                  <p><strong>COMMISSION / FEES</strong><br/>
                  A commission of [__%], as agreed with the platform owner, will be charged for each sale</p>
                  
                  <p><strong>PAYMENTS</strong><br/>
                  Payments due to the Seller will be made within 24 hours after a successful order completion and upon request</p>
                  
                  <p><strong>RETURNS AND REFUNDS</strong><br/>
                  The Seller is responsible for handling returns and refunds</p>
                  
                  <p><strong>PROHIBITED PRODUCTS</strong><br/>
                  Illegal, harmful, or restricted items are strictly prohibited</p>
                  
                  <p><strong>PRODUCT SUPPLY QUANTITY POLICY</strong><br/>
                  1. Minimum Supply Obligation: Sellers must maintain the minimum quantity set by Store management.<br/>
                  2. Continuity of Supply: Sellers must maintain continuous supply and minimize out-of-stock situations.<br/>
                  3. Delivery Timeline: Orders must be fulfilled within 3–7 working days.<br/>
                  4. Short Supply & Delays: Sellers must inform in advance. Failure may result in penalties.</p>
                  
                  <p><strong>FAIR PRICING POLICY</strong><br/>
                  1. Fair Pricing: Prices must consider market standards and affordability.<br/>
                  2. Market Alignment: Prices must not be unreasonably high or low.<br/>
                  3. Price Gouging: Excessive increases during high demand are prohibited.</p>
                  
                  <p><strong>COURIER BRANDING & DISPATCH POLICY</strong><br/>
                  1. Store Name Only: All orders must be dispatched under (TOKO Xpress) only.<br/>
                  2. Store Sticker: Official Store stickers/labels are mandatory.<br/>
                  3. No Direct Customer Contact: Sellers must not directly contact customers unless authorized.</p>
                  
                  <p><strong>PACKAGING POLICY</strong><br/>
                  1. Proper Packaging: Securely pack to avoid damage.<br/>
                  2. Brand Compliance: Use strong materials and follow branding guidelines.<br/>
                  3. Expiry & Labeling: Include product name, quantity, and handling instructions.</p>
                  
                  <p><strong>TERMINATION</strong><br/>
                  Either party can terminate with prior notice.</p>
                  
                  <p><strong>CONTACT</strong><br/>
                  For questions, WhatsApp: TOKO Xpress – 0763423113</p>
                </div>
              </div>
              <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
                <button 
                  className="btn-blue-rounded" 
                  style={{ padding: "10px 40px", backgroundColor: "#111" }}
                  onClick={() => { setAgreed(true); setShowTerms(false); }}
                >
                  I Agree to the Terms
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
