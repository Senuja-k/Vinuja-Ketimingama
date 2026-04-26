import React, { useState } from 'react';
import axios from 'axios';
import { Star, X } from 'lucide-react';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const ReviewPromptModal = ({ pendingReviews, onClose, onReviewSubmitted }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!pendingReviews || pendingReviews.length === 0) return null;

    const currentProduct = pendingReviews[currentIndex];
    const imageUrl = currentProduct?.images?.[0]?.image_path 
        ? `/storage/${currentProduct.images[0].image_path}`
        : "https://via.placeholder.com/150";

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!message.trim()) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Please enter a review message.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('customer_token');
            await axios.post(`${API_URL}/customer/feedback`, {
                product_id: currentProduct.id,
                rating,
                message
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire({ icon: 'success', title: 'Thank You!', text: 'Your review has been submitted.' });
            
            // Move to next product or close
            if (currentIndex + 1 < pendingReviews.length) {
                setCurrentIndex(prev => prev + 1);
                setRating(5);
                setMessage('');
            } else {
                if (onReviewSubmitted) onReviewSubmitted();
                onClose();
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            Swal.fire({ 
                icon: 'error', 
                title: 'Error', 
                text: error.response?.data?.message || 'Failed to submit review' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (currentIndex + 1 < pendingReviews.length) {
            setCurrentIndex(prev => prev + 1);
            setRating(5);
            setMessage('');
        } else {
            onClose();
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'sans-serif', color: '#111827', margin: 0 }}>Leave a Review</h2>
                    <button 
                        onClick={onClose}
                        style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', color: '#9ca3af', transition: 'background 0.2s' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                        How was your recent purchase? Your feedback helps others!
                        {pendingReviews.length > 1 && (
                            <span style={{ display: 'block', marginTop: '4px', fontWeight: 'bold', color: '#374151' }}>
                                ({currentIndex + 1} of {pendingReviews.length} items to review)
                            </span>
                        )}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                        <img 
                            src={imageUrl} 
                            alt={currentProduct.name} 
                            style={{ width: '128px', height: '128px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', marginBottom: '16px' }}
                        />
                        <h3 style={{ fontWeight: 'bold', fontSize: '18px', color: '#111827', textAlign: 'center', margin: 0 }}>{currentProduct.name}</h3>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Star Rating UI */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setRating(star)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', transition: 'transform 0.1s' }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Star 
                                        size={36} 
                                        fill={star <= rating ? '#facc15' : 'transparent'}
                                        color={star <= rating ? '#facc15' : '#e5e7eb'}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Text Area */}
                        <div>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us what you liked or how we can improve..."
                                style={{ width: '100%', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', color: '#111827', borderRadius: '12px', padding: '16px', outline: 'none', resize: 'none', fontFamily: 'sans-serif', fontSize: '14px', boxSizing: 'border-box' }}
                                rows="4"
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                            <button
                                type="button"
                                onClick={handleSkip}
                                style={{ flex: 1, padding: '12px 16px', backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
                            >
                                Skip
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{ flex: 1, padding: '12px 16px', backgroundColor: '#111827', color: '#ffffff', borderRadius: '12px', fontWeight: '500', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewPromptModal;
