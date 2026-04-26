import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div style={{
          position: 'fixed',
          bottom: '200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 30px)',
          maxWidth: '1400px',
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '0 24px',
          boxSizing: 'border-box',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          <button
            onClick={scrollToTop}
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.backgroundColor = '#222';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#000';
            }}
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} />
          </button>
        </div>
      )}
    </>
  );
}

const styles = {
  button: {
    pointerEvents: 'auto',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#000',
    color: '#fff',
    border: '2px solid #fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.3s ease',
  }
};
