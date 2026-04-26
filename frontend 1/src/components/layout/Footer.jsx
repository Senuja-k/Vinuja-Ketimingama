import React from 'react';
import quantaraLogo from '../../assets/Quantara  logo.jpeg';

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1BSP98CfoJ/?mibextid=wwXIfr",
    color: "#1877f2",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/toko_xpress?igsh=MTMzaWU1aGFsdnZyMA==",
    color: "#e1306c",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@toko_xpress?_r=1&_t=ZS-95HbctD8v24",
    color: "#fff",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.56V6.78a4.85 4.85 0 01-1.07-.09z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/94743753742",
    color: "#25d366",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:xpresstoko@gmail.com",
    color: "#f59e0b",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer style={styles.footer}>
      <div style={styles.topBar}>
        <div className="container-padding footer-top-container" style={styles.topContainer}>

          {/* Brand Row: logo+name LEFT, scroll arrow RIGHT */}
          <div className="footer-brand-row" style={styles.brandRow}>
            <div style={styles.brand}>
              <div style={styles.brandLogo}>
                <div style={{ transform: "scale(0.95)" }}>TOKO<br />XPRESS</div>
              </div>
              <div>
                <div style={styles.brandName}>Toko Xpress</div>
                <div style={styles.brandTagline}>Your trusted marketplace</div>
              </div>
            </div>
          </div>

          {/* Social Icons */}
          <div className="footer-social-section" style={styles.socialSection}>
            <span style={styles.followLabel}>Follow Us</span>
            <div style={styles.socialIcons}>
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={styles.socialIcon}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = s.color;
                    e.currentTarget.style.color = s.color === "#fff" ? "#000" : "#fff";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#1a1a1a";
                    e.currentTarget.style.color = "#aaa";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Developed by */}
          <div style={styles.devWrapper}>
            <img src={quantaraLogo} alt="Quantara360 Logo" style={styles.devLogo} />
            <div style={styles.devSection}>
              <span style={styles.devLabel}>Developed by</span>
              <span style={styles.devName}>Quantara360°</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <div className="container-padding footer-bottom-container" style={styles.bottomContainer}>
          <span>© 2026 Toko Xpress. All rights reserved.</span>
          <span style={{ color: "#555" }}>|</span>
          <a href="mailto:xpresstoko@gmail.com" style={styles.emailLink}>xpresstoko@gmail.com</a>
          <span style={{ color: "#555" }}>|</span>
          <a href="tel:+94743753742" style={styles.emailLink}>+94 74 375 3742</a>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#0a0a0a",
    color: "#fff",
    marginTop: "auto",
    width: "100%",
    borderTop: "1px solid #1e1e1e",
  },
  topBar: {
    padding: "30px 0",
    borderBottom: "1px solid #1a1a1a",
  },
  topContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  brandLogo: {
    width: "52px",
    height: "52px",
    backgroundColor: "#000",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    border: "1.5px solid #fff",
    flexShrink: 0,
    fontSize: "10px",
    fontWeight: "bold",
    textAlign: "center"
  },
  brandName: {
    fontWeight: 700,
    fontSize: "19px",
    color: "#fff",
    letterSpacing: "0.5px",
  },
  brandTagline: {
    fontSize: "13px",
    color: "#888",
    marginTop: "4px",
  },
  socialSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  followLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  socialIcons: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  socialIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#1a1a1a",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    transition: "background-color 0.25s, color 0.25s, transform 0.25s",
    border: "1px solid #2a2a2a",
  },
  scrollBtn: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    border: "1.5px solid rgba(255,255,255,0.5)",
    backgroundColor: "transparent",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.2s, border-color 0.2s",
  },
  devWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  devSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "2px",
  },
  devLogo: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  devLabel: {
    fontSize: "11px",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  devName: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#888",
  },
  bottomBar: {
    padding: "10px 0",
  },
  bottomContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    fontSize: "13px",
    color: "#666",
  },
  emailLink: {
    color: "#666",
    textDecoration: "none",
    transition: "color 0.2s",
  },
};
