import { useState } from 'react';
import GlitchText from '../GlitchText';
import OrbitalLoader from '../LoadingStates/OrbitalLoader';
import './Buttons.css';
import './ProductDetail.css';

export default function ProductDetail({ product, onBack, onAddToCart, onBuyNow }) {
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  if (!product) {
    return null;
  }

  const isCourse = product.type === 'course';

  function handleStartCourse() {
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      setEnrolled(true);
    }, 1500);
  }

  return (
    <div className="product-detail">
      <button className="btn-secondary back-button" onClick={onBack}>
        ← Back to Store
      </button>

      <h1 className="product-detail-name">{product.name}</h1>
      <p className="product-detail-description">{product.description}</p>
      <p className="product-detail-price">${product.price}</p>

      {isCourse ? (
        enrolling ? (
          <OrbitalLoader text="Enrolling..." />
        ) : enrolled ? (
          <p className="enrolled-message">You're enrolled. Check your email for access.</p>
        ) : (
          <button className="btn-primary" onClick={handleStartCourse}>
            <GlitchText text="Start Course" animated intensity="medium" />
          </button>
        )
      ) : (
        <div className="product-detail-actions">
          <button className="btn-primary" onClick={() => onAddToCart(product)}>
            <GlitchText text="Add to Cart" animated intensity="medium" />
          </button>
          <button className="btn-primary" onClick={() => onBuyNow(product)}>
            <GlitchText text="Buy Now" animated intensity="medium" />
          </button>
        </div>
      )}
    </div>
  );
}
