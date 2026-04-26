export default function ProductCard({ product, onClick }) {
  // Keep backend-provided URL as-is to avoid host mismatch issues.
  const rawUrl = product.images?.[0]?.url || null;
  const imageUrl = rawUrl || null;

  const discount = product.discount_rate > 0 ? product.discount_rate : null;
  const initials = (product.name || "P").substring(0, 1).toUpperCase();
  const isOutOfStock = Number(product.quantity) <= 0;

  return (
    <div className="premium-card" style={{ ...styles.card, background: "#000" }} onClick={onClick}>
      {/* Image / Fallback */}
      <div style={styles.imageContainer}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            style={styles.image}
            loading="lazy"
            width="300"
            height="220"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{ ...styles.fallback, display: imageUrl ? 'none' : 'flex' }}>
          <span style={styles.initials}>{initials}</span>
        </div>
        {discount && !isOutOfStock && (
          <div style={styles.badge}>-{discount}%</div>
        )}
        {isOutOfStock && (
          <div style={styles.oosOverlay}>
            <div style={styles.oosBadge}>Out of Stock</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        <p style={{ ...styles.title, color: "#fff" }} title={product.name}>
          {product.name}
        </p>
        <p style={styles.storeName}>
          By {product.seller?.store_name || "Unknown Store"}
        </p>
        <div style={styles.priceRow}>
          <span style={{ ...styles.price, color: "#fff" }}>Rs. {Number(product.final_price || product.marked_price).toLocaleString()}</span>
          {discount && (
            <span style={styles.origPrice}>
              Rs. {Math.round((product.final_price || product.marked_price) / (1 - discount / 100)).toLocaleString()}
            </span>
          )}
        </div>
        <button
          style={{
            ...styles.button,
            backgroundColor: isOutOfStock ? "#555" : "#f97316",
            cursor: isOutOfStock ? "not-allowed" : "pointer",
            color: "#fff",
            border: "none"
          }}
          disabled={isOutOfStock}
          onClick={(e) => { e.stopPropagation(); if (onClick && !isOutOfStock) onClick(); }}
        >
          {isOutOfStock ? "Out of Stock" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#000",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "220px",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  fallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e8e8e8",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: "56px",
    fontWeight: "700",
    color: "#bbb",
  },
  badge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "#f97316",
    color: "white",
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  title: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text-main, #fff)",
    margin: 0,
    lineHeight: "1.4",
    height: "2.8em",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  storeName: {
    fontSize: "12px",
    color: "#f97316",
    margin: "0 0 4px 0",
    fontWeight: "600",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  price: {
    fontSize: "18px",
    fontWeight: "800",
    color: "var(--text-main, #fff)",
  },
  origPrice: {
    fontSize: "12px",
    color: "#777",
    textDecoration: "line-through",
  },
  button: {
    marginTop: "8px",
    padding: "10px",
    borderRadius: "25px",
    border: "none",
    background: "#f97316",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s",
  },
  oosOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  oosBadge: {
    backgroundColor: "#ef4444",
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "800",
    textTransform: "uppercase",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  }
};