import React, { useEffect } from "react";
import { X, Mail, Phone, MessageCircle } from "lucide-react";

const contacts = [
  {
    icon: <WhatsAppIcon size={24} />,
    label: "WhatsApp",
    value: "+94 74 375 3742",
    sub: "Chat with us directly",
    href: "https://wa.me/94743753742",
    color: "#25d366",
    bg: "#f0fdf4",
  },
  {
    icon: <Phone size={24} color="#6366f1" />,
    label: "Phone",
    value: "074 375 3742",
    sub: "Mon–Sat, 9am–6pm",
    href: "tel:+94743753742",
    color: "#6366f1",
    bg: "#f5f3ff",
  },
  {
    icon: <Mail size={24} color="#f59e0b" />,
    label: "Email",
    value: "xpresstoko@gmail.com",
    sub: "We reply within 24 hours",
    href: "mailto:xpresstoko@gmail.com",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    icon: <MessengerIcon size={24} />,
    label: "Facebook Messenger",
    value: "TOKO Xpress",
    sub: "Message us on Messenger",
    href: "https://www.facebook.com/share/1BSP98CfoJ/?mibextid=wwXIfr",
    color: "#0084ff",
    bg: "#eff6ff",
  },
];

const socials = [
  {
    label: "Facebook",
    icon: <FacebookIcon />,
    href: "https://www.facebook.com/share/1BSP98CfoJ/?mibextid=wwXIfr",
    color: "#1877f2",
    bg: "#e7f0fd",
  },
  {
    label: "Instagram",
    icon: <InstagramIcon />,
    href: "https://www.instagram.com/toko_xpress?igsh=MTMzaWU1aGFsdnZyMA==",
    color: "#e1306c",
    bg: "#fce4ec",
  },
  {
    label: "TikTok",
    icon: <TikTokIcon />,
    href: "https://www.tiktok.com/@toko_xpress?_r=1&_t=ZS-95HbctD8v24",
    color: "#010101",
    bg: "#f3f3f3",
  },
  {
    label: "WhatsApp",
    icon: <WhatsAppIcon />,
    href: "https://wa.me/94743753742",
    color: "#25d366",
    bg: "#f0fdf4",
  },
];

export default function ContactUsModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}><MessageCircle size={22} color="#fff" /></div>
            <div>
              <h2 style={styles.headerTitle}>Contact Us</h2>
              <p style={styles.headerSub}>We're here to help — reach out anytime</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <div style={styles.body}>
          {/* Contact cards */}
          <h3 style={styles.sectionTitle}>Get in Touch</h3>
          <div style={styles.contactGrid}>
            {contacts.map((c, i) => (
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" style={{ ...styles.contactCard, border: `1.5px solid ${c.color}30` }}>
                <div style={{ ...styles.contactIconCircle, backgroundColor: c.bg }}>
                  {c.icon}
                </div>
                <div style={styles.contactInfo}>
                  <span style={styles.contactLabel}>{c.label}</span>
                  <span style={{ ...styles.contactValue, color: c.color }}>{c.value}</span>
                  <span style={styles.contactSub}>{c.sub}</span>
                </div>
                <div style={{ ...styles.arrowBadge, backgroundColor: c.color }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>Follow Us</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Social media */}
          <div style={styles.socialGrid}>
            {socials.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ ...styles.socialCard, backgroundColor: s.bg }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ ...styles.socialIconWrap, border: `2px solid ${s.color}20` }}>
                  {s.icon}
                </div>
                <span style={{ ...styles.socialLabel, color: s.color }}>{s.label}</span>
              </a>
            ))}
          </div>

          {/* Business hours */}
          <div style={styles.hoursBox}>
            <div style={styles.hoursIcon}>🕐</div>
            <div>
              <p style={styles.hoursTitle}>Business Hours</p>
              <p style={styles.hoursText}>Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)</p>
              <p style={styles.hoursText}>Sunday & Public Holidays: WhatsApp support only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- SVG Icons ---- */
function WhatsAppIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25d366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877f2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="url(#ig-grad)">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#010101">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.56V6.78a4.85 4.85 0 01-1.07-.09z"/>
    </svg>
  );
}

function MessengerIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#0084ff">
      <path d="M12 0C5.374 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.626 0 12-4.974 12-11.111C24 4.975 18.626 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z"/>
    </svg>
  );
}

const styles = {
  overlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)", zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
  },
  modal: {
    backgroundColor: "#fff", borderRadius: "20px", width: "100%", maxWidth: "580px",
    maxHeight: "90vh", display: "flex", flexDirection: "column",
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
    background: "linear-gradient(135deg, #25d366, #128c7e)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  headerTitle: { margin: 0, fontSize: "20px", fontWeight: 700, color: "#fff" },
  headerSub: { margin: "2px 0 0", fontSize: "13px", color: "#aaa" },
  closeBtn: {
    background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "10px",
    width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#fff",
  },
  body: { overflowY: "auto", padding: "24px", flex: 1 },
  sectionTitle: { margin: "0 0 14px", fontSize: "16px", fontWeight: 700, color: "#111" },
  contactGrid: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
  contactCard: {
    display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px",
    border: "1.5px solid", borderRadius: "14px", textDecoration: "none",
    background: "#fff", transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative", overflow: "hidden",
  },
  contactIconCircle: {
    width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  contactInfo: { display: "flex", flexDirection: "column", gap: "2px", flex: 1 },
  contactLabel: { fontSize: "11px", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" },
  contactValue: { fontSize: "15px", fontWeight: 700 },
  contactSub: { fontSize: "12px", color: "#888" },
  arrowBadge: {
    width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
  },
  divider: { display: "flex", alignItems: "center", gap: "12px", margin: "4px 0 20px" },
  dividerLine: { flex: 1, height: "1px", backgroundColor: "#e5e7eb" },
  dividerText: { fontSize: "13px", fontWeight: 600, color: "#888", whiteSpace: "nowrap" },
  socialGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "24px" },
  socialCard: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
    padding: "16px 8px", borderRadius: "14px", textDecoration: "none",
    transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",
  },
  socialIconWrap: {
    width: "44px", height: "44px", borderRadius: "12px", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  socialLabel: { fontSize: "11px", fontWeight: 700, textAlign: "center" },
  hoursBox: {
    display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px",
    backgroundColor: "#f8f8f8", borderRadius: "12px",
  },
  hoursIcon: { fontSize: "24px", flexShrink: 0 },
  hoursTitle: { margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#111" },
  hoursText: { margin: "2px 0 0", fontSize: "13px", color: "#555", lineHeight: 1.5 },
};
