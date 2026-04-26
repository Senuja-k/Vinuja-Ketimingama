import React from 'react';
import { Shield, Hammer, Clock } from 'lucide-react';

const MaintenanceMode = ({ onLoginClick }) => {
    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: '#0a0a0a',
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Minimal Header */}
            <header style={{ 
                padding: '30px 50px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-1px' }}>
                    Toko<span style={{ color: '#f97316' }}>Xpress</span>
                </div>
                <button 
                    onClick={onLoginClick}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#888',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#888'; }}
                >
                    <Shield size={16} /> Admin Access
                </button>
            </header>
            
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '40px',
                textAlign: 'center'
            }}>
                <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '30px', 
                    backgroundColor: 'rgba(249, 115, 22, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '40px',
                    color: '#f97316'
                }}>
                    <Hammer size={48} />
                </div>
                
                <h1 style={{ fontSize: 'clamp(40px, 8vw, 72px)', fontWeight: '900', marginBottom: '20px', letterSpacing: '-3px', lineHeight: '1.1' }}>
                    Website Currently<br/>Unavailable
                </h1>
                
                <p style={{ fontSize: '20px', color: '#888', maxWidth: '600px', lineHeight: '1.6', fontWeight: '400' }}>
                    TokoXpress is currently undergoing scheduled maintenance to bring you a better shopping experience. 
                    We'll be back online very soon.
                </p>

                <div style={{ 
                    marginTop: '50px', 
                    padding: '20px 40px', 
                    borderRadius: '20px', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <Clock size={20} color="#f97316" />
                    <span style={{ fontSize: '15px', color: '#aaa', fontWeight: '500' }}>Back online in approximately 45 minutes</span>
                </div>
            </div>

            <footer style={{ padding: '40px', textAlign: 'center', color: '#444', fontSize: '13px', fontWeight: '500' }}>
                © 2026 TokoXpress Platinum Edition. All systems running on secure infrastructure.
            </footer>
        </div>
    );
};

export default MaintenanceMode;
