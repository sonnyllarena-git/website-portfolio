import { useState } from 'react';
import GlitchText from '../GlitchText';
import OrbitalLoader from '../LoadingStates/OrbitalLoader';
import './Buttons.css';
import './Checkout.css';

export default function Checkout({ cartItems, onBack, onOrderComplete }) {
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  function handleCompletePurchase() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setComplete(true);
      onOrderComplete();
    }, 1800);
  }

  if (processing) {
    return (
      <div className="checkout-page checkout-processing">
        <OrbitalLoader text="Processing Payment..." />
      </div>
    );
  }

  if (complete) {
    return (
      <div className="checkout-page checkout-complete">
        <p className="order-complete-message">Order complete. Thank you.</p>
        <button className="btn-secondary" onClick={onBack}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <button className="btn-secondary back-button" onClick={onBack}>
        ← Back to Store
      </button>

      <h1 className="checkout-title">Checkout</h1>

      {cartItems.length === 0 ? (
        <p className="checkout-empty">Your cart is empty.</p>
      ) : (
        <>
          <ul className="checkout-items">
            {cartItems.map((item, index) => (
              <li key={`${item.id}-${index}`} className="checkout-item">
                <span>{item.name}</span>
                <span>${item.price}</span>
              </li>
            ))}
          </ul>

          <div className="checkout-total">
            <span>Total</span>
            <span>${total}</span>
          </div>

          <button className="btn-primary complete-purchase-button" onClick={handleCompletePurchase}>
            <GlitchText text="Complete Purchase" animated intensity="high" />
          </button>
        </>
      )}
    </div>
  );
}
