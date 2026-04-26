import React, { useState, useEffect } from 'react';
import { Cookie, X, CheckCircle } from 'lucide-react';
import api from '../../api/api';
import { getFingerprint } from '../../utils/fingerprint';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [choiceMade, setChoiceMade] = useState(false);
    const [isSystemEnabled, setIsSystemEnabled] = useState(true);

    useEffect(() => {
        const checkSettingsAndConsent = async () => {
            try {
                const res = await api.get('/settings');
                const enabled = res.data.cookies_enabled === "1";
                setIsSystemEnabled(enabled);
                if (enabled) {
                    const consent = localStorage.getItem('cookie_consent');
                    if (!consent) {
                        setTimeout(() => setIsVisible(true), 1500);
                    }
                }
            } catch (err) {
                console.error("Failed to check cookie settings", err);
            }
        };
        checkSettingsAndConsent();
    }, []);

    const handleChoice = async (accepted) => {
        localStorage.setItem('cookie_consent', accepted ? 'accepted' : 'declined');
        if (accepted) {
            document.cookie = `tx_consent=accepted; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
            try {
                const fp = getFingerprint();
                await api.post('/fingerprint', { fingerprint: fp });
            } catch (err) {
                console.error("Failed to log fingerprint", err);
            }
        } else {
            document.cookie = `tx_consent=declined; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
        }
        setChoiceMade(true);
        setTimeout(() => setIsVisible(false), 1000);
    };

    if (!isSystemEnabled || !isVisible) return null;

    return (
        <>
            <style>{`
                @keyframes cookieSlideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(30px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
                }
                .cookie-overlay {
                    position: fixed;
                    bottom: 16px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;
                    width: 92%;
                    max-width: 700px;
                    animation: cookieSlideUp 0.5s ease-out;
                }
                .cookie-box {
                    background: #fff;
                    border-radius: 20px;
                    padding: 20px 44px 20px 20px;
                    box-shadow: 0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04);
                    border: 1px solid #f3f4f6;
                    position: relative;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 16px;
                }
                .cookie-icon {
                    background: #fff7ed;
                    padding: 14px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .cookie-content {
                    flex: 1;
                    min-width: 0;
                }
                .cookie-title {
                    margin: 0 0 4px 0;
                    font-size: 17px;
                    font-weight: 700;
                    color: #111827;
                }
                .cookie-text {
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.5;
                    color: #4b5563;
                }
                .cookie-buttons {
                    display: flex;
                    gap: 10px;
                    flex-shrink: 0;
                }
                .cookie-btn-decline {
                    background: #f3f4f6;
                    color: #4b5563;
                    border: none;
                    border-radius: 12px;
                    padding: 10px 18px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .cookie-btn-accept {
                    background: #f97316;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 10px 18px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .cookie-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                }

                /* ── Mobile ── */
                @media (max-width: 540px) {
                    .cookie-box {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 16px 16px 16px 16px;
                        gap: 12px;
                    }
                    .cookie-title { font-size: 15px; }
                    .cookie-buttons {
                        width: 100%;
                    }
                    .cookie-btn-decline,
                    .cookie-btn-accept {
                        flex: 1;
                        text-align: center;
                    }
                    .cookie-close {
                        top: 8px;
                        right: 8px;
                    }
                }
            `}</style>

            <div className="cookie-overlay">
                <div className="cookie-box">
                    <div className="cookie-icon">
                        {choiceMade
                            ? <CheckCircle color="#10b981" size={32} />
                            : <Cookie color="#f97316" size={32} />}
                    </div>

                    <div className="cookie-content">
                        <h3 className="cookie-title">
                            {choiceMade ? "Preferences Saved!" : "We Value Your Privacy"}
                        </h3>
                        <p className="cookie-text">
                            {choiceMade
                                ? "Your cookie preferences have been updated. Thank you!"
                                : "We use cookies to enhance your experience, serve personalised content, and analyse traffic."}
                        </p>
                    </div>

                    {!choiceMade && (
                        <div className="cookie-buttons">
                            <button className="cookie-btn-decline" onClick={() => handleChoice(false)}>
                                Decline
                            </button>
                            <button className="cookie-btn-accept" onClick={() => handleChoice(true)}>
                                Accept All
                            </button>
                        </div>
                    )}

                    <button className="cookie-close" onClick={() => setIsVisible(false)}>
                        <X size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default CookieConsent;
