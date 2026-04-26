import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, MessageCircle, Mail, Phone, HelpCircle, ShoppingBag, Truck, RotateCcw, CreditCard, Shield } from "lucide-react";

const faqs = [
  {
    category: "Orders & Shipping",
    icon: <Truck size={18} />,
    color: "#6366f1",
    items: [
      {
        q: "How do I track my order?",
        a: "Go to 'My Orders' from the user menu in the top-right corner. Each order shows a live status — Pending, Processing, Shipped, Delivered, or Cancelled."
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3–7 business days depending on your location. Sellers may set their own shipping timelines which are shown on each product page."
      },
      {
        q: "Can I change my delivery address after ordering?",
        a: "Contact us immediately via WhatsApp (+94 74 375 3742) with your order ID and new address. We can update it if the order hasn't been shipped yet."
      }
    ]
  },
  {
    category: "Returns & Refunds",
    icon: <RotateCcw size={18} />,
    color: "#10b981",
    items: [
      {
        q: "Can I cancel my order?",
        a: "Yes! You can cancel a Pending order directly from 'My Orders'. Once an order is Processing or Shipped, cancellations must be requested via WhatsApp."
      },
      {
        q: "What is the return policy?",
        a: "Returns are accepted within 7 days of delivery for items that are damaged, defective, or not as described. Contact us via WhatsApp with photos of the item."
      },
      {
        q: "How long do refunds take?",
        a: "Approved refunds are processed within 5–10 business days back to your original payment method."
      }
    ]
  },
  {
    category: "Payments",
    icon: <CreditCard size={18} />,
    color: "#f59e0b",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We accept all major payment methods as configured by our platform, including bank transfers and online payments. Available options are shown at checkout."
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. We use industry-standard encryption for all transactions. We never store raw card details on our servers."
      }
    ]
  },
  {
    category: "Account & Orders",
    icon: <ShoppingBag size={18} />,
    color: "#ec4899",
    items: [
      {
        q: "How do I create an account?",
        a: "Click the user icon in the top navigation bar and select 'Customer' to sign up or log in. Registration only requires your name, email, and password."
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Please contact us via email at xpresstoko@gmail.com or WhatsApp (+94 74 375 3742) and we'll help you reset your password."
      }
    ]
  },
  {
    category: "Sellers & Trust",
    icon: <Shield size={18} />,
    color: "#8b5cf6",
    items: [
      {
        q: "Are sellers on Toko Xpress verified?",
        a: "All sellers go through an approval process before they can list products. We review seller information and product listings to ensure quality and authenticity."
      },
      {
        q: "How do I become a seller?",
        a: "Click the hamburger menu (≡) in the top navigation bar and select 'Become a seller'. Fill out the registration form and our team will review your application."
      }
    ]
  }
];

export default function HelpSupportModal({ onClose, onContactClick }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCat, setActiveCat] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}><HelpCircle size={22} color="#fff" /></div>
            <div>
              <h2 style={styles.headerTitle}>Help & Support</h2>
              <p style={styles.headerSub}>Find answers to common questions</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        {/* Hero banner */}
        <div style={styles.heroBanner}>
          <div style={styles.heroContent}>
            <h3 style={styles.heroTitle}>How can we help you today?</h3>
            <p style={styles.heroText}>Browse the topics below or contact our support team directly.</p>
            <button style={styles.contactBtn} onClick={onContactClick}>
              <MessageCircle size={16} />
              Contact Us
            </button>
          </div>
          <div style={styles.heroDeco}>
            {["📦", "🎁", "💬", "🛒"].map((e, i) => (
              <span key={i} style={{ ...styles.decoEmoji, animationDelay: `${i * 0.4}s` }}>{e}</span>
            ))}
          </div>
        </div>

        <div style={styles.body}>
          {/* Category tabs */}
          <div style={styles.catTabs}>
            {faqs.map((cat, ci) => (
              <button
                key={ci}
                style={{ ...styles.catTab, ...(activeCat === ci ? { ...styles.catTabActive, border: `1.5px solid ${cat.color}`, color: cat.color } : {}) }}
                onClick={() => { setActiveCat(ci); setOpenIndex(null); }}
              >
                <span style={{ color: activeCat === ci ? cat.color : "#888" }}>{cat.icon}</span>
                <span className="mobile-hide">{cat.category}</span>
              </button>
            ))}
          </div>

          {/* FAQ accordion */}
          <div style={styles.faqList}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ ...styles.catBadge, backgroundColor: faqs[activeCat].color + "20", color: faqs[activeCat].color }}>
                {faqs[activeCat].icon}
                {faqs[activeCat].category}
              </span>
            </div>
            {faqs[activeCat].items.map((item, idx) => (
              <div key={idx} style={styles.faqItem}>
                <button style={styles.faqQ} onClick={() => toggle(idx)}>
                  <span style={styles.faqQText}>{item.q}</span>
                  <span style={{ color: faqs[activeCat].color, flexShrink: 0 }}>
                    {openIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {openIndex === idx && (
                  <div style={styles.faqA}>{item.a}</div>
                )}
              </div>
            ))}
          </div>

          {/* Still need help? */}
          <div style={styles.stillHelp}>
            <p style={styles.stillHelpText}>Still can't find what you're looking for?</p>
            <div style={styles.quickContacts}>
              <a href="https://wa.me/94743753742" target="_blank" rel="noopener noreferrer" style={{ ...styles.qcBtn, backgroundColor: "#25d366" }}>
                <WhatsAppIcon /> WhatsApp
              </a>
              <a href="mailto:xpresstoko@gmail.com" style={{ ...styles.qcBtn, backgroundColor: "#6366f1" }}>
                <Mail size={16} /> Email
              </a>
              <a href="tel:+94743753742" style={{ ...styles.qcBtn, backgroundColor: "#000" }}>
                <Phone size={16} /> Call
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-10px) rotate(5deg); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)", zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "5px 20px 5px",
  },
  modal: {
    backgroundColor: "#fff", borderRadius: "20px", width: "100%", maxWidth: "680px",
    maxHeight: "calc(100vh - 10px)", display: "flex", flexDirection: "column",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
    background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon: {
    width: "44px", height: "44px", borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { margin: 0, fontSize: "20px", fontWeight: 700, color: "#fff" },
  headerSub: { margin: "2px 0 0", fontSize: "13px", color: "#aaa" },
  closeBtn: {
    background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "10px",
    width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#fff", transition: "background 0.2s",
  },
  heroBanner: {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
    padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  heroContent: { flex: 1 },
  heroTitle: { margin: 0, fontSize: "18px", fontWeight: 700, color: "#fff" },
  heroText: { margin: "6px 0 14px", fontSize: "13px", color: "rgba(255,255,255,0.8)" },
  contactBtn: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    backgroundColor: "#fff", color: "#6366f1", border: "none",
    borderRadius: "25px", padding: "9px 20px", fontWeight: 600, fontSize: "13px",
    cursor: "pointer", transition: "transform 0.2s",
  },
  heroDeco: { display: "flex", gap: "8px", flexShrink: 0 },
  decoEmoji: {
    fontSize: "28px", animation: "floatEmoji 3s ease-in-out infinite",
  },
  body: { overflowY: "hidden", padding: "20px 24px", flex: 1 },
  catTabs: {
    display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px",
  },
  catTab: {
    display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
    borderRadius: "25px", border: "1.5px solid #e5e7eb", background: "#fff",
    cursor: "pointer", fontSize: "13px", fontWeight: 500, color: "#555",
    transition: "all 0.2s",
  },
  catTabActive: { background: "#f8f7ff", fontWeight: 600 },
  catBadge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "4px 12px", borderRadius: "25px", fontSize: "13px", fontWeight: 600,
  },
  faqList: { display: "flex", flexDirection: "column", gap: "8px", minHeight: "260px", overflowY: "auto" },
  faqItem: {
    border: "1.5px solid #f0f0f0", borderRadius: "12px", overflow: "hidden",
    transition: "border-color 0.2s",
  },
  faqQ: {
    width: "100%", background: "#fff", border: "none", padding: "14px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    cursor: "pointer", textAlign: "left", gap: "12px",
  },
  faqQText: { fontSize: "14px", fontWeight: 600, color: "#111", lineHeight: 1.4 },
  faqA: {
    padding: "0 16px 14px", fontSize: "14px", color: "#555",
    lineHeight: 1.7, background: "#fafafa", borderTop: "1px solid #f0f0f0",
  },
  stillHelp: {
    marginTop: "-20px", padding: "20px", background: "#f8f8f8",
    borderRadius: "14px", textAlign: "center",
  },
  stillHelpText: { margin: "0 0 14px", fontSize: "14px", fontWeight: 600, color: "#333" },
  quickContacts: { display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" },
  qcBtn: {
    display: "inline-flex", alignItems: "center", gap: "7px",
    color: "#fff", textDecoration: "none", borderRadius: "25px",
    padding: "9px 20px", fontSize: "13px", fontWeight: 600, transition: "opacity 0.2s",
  },
};
