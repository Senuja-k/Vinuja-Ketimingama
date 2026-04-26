import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/api";

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/banners");
      setBanners(res.data);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    }
  };

  useEffect(() => {
    fetchBanners();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    if (banners.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, banners.length]);

  if (banners.length === 0) {
    return (
      <div style={{ ...styles.bannerContainer, backgroundColor: "#f3f4f6" }}></div>
    );
  }
  return (
    <div style={styles.bannerContainer}>
      <div style={styles.bannerWrapper}>
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            style={{
              ...styles.slide,
              opacity: index === currentIndex ? 1 : 0,
              visibility: index === currentIndex ? "visible" : "hidden",
              transition: "opacity 0.8s ease-in-out, visibility 0.8s",
            }}
          >
            <img
              src={banner.url}
              alt={`banner-${index}`}
              style={styles.image}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              width="1400"
              height="400"
            />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button style={styles.navButtonLeft} onClick={prevSlide}>
            <ChevronLeft size={isMobile ? 20 : 28} strokeWidth={2.5} />
          </button>
          <button style={styles.navButtonRight} onClick={nextSlide}>
            <ChevronRight size={isMobile ? 20 : 28} strokeWidth={2.5} />
          </button>
          
          <div style={styles.dotsContainer}>
            {banners.map((_, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  ...styles.dot,
                  backgroundColor: index === currentIndex ? "#fff" : "rgba(255,255,255,0.5)",
                  width: index === currentIndex ? "24px" : "8px",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  bannerContainer: {
    position: "relative",
    margin: "20px auto",
    width: "100%",
    height: "auto",
    aspectRatio: "1400 / 400", // Maintain a consistent aspect ratio if possible
    overflow: "hidden",
    borderRadius: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  bannerWrapper: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  slide: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "24px",
  },
  navButtonLeft: {
    position: "absolute",
    top: "50%",
    left: "20px",
    transform: "translateY(-50%)",
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    width: "auto",
    height: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    zIndex: 10,
    padding: "8px",
    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  navButtonRight: {
    position: "absolute",
    top: "50%",
    right: "20px",
    transform: "translateY(-50%)",
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    width: "auto",
    height: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    zIndex: 10,
    padding: "8px",
    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  dotsContainer: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "8px",
    zIndex: 10,
  },
  dot: {
    height: "8px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
};