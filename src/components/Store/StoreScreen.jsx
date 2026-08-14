import { useState } from 'react';
import StorePage from './StorePage';
import ProductDetail from './ProductDetail';
import Checkout from './Checkout';
import { products, getProductById } from '../../data/storeProducts';

export default function StoreScreen({ onBack }) {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'checkout'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cart, setCart] = useState([]);

  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;

  function handleSelectProduct(id) {
    setSelectedProductId(id);
    setView('detail');
  }

  function handleAddToCart(product) {
    setCart((prev) => [...prev, product]);
  }

  function handleBuyNow(product) {
    setCart((prev) => [...prev, product]);
    setView('checkout');
  }

  function handleBackToList() {
    setSelectedProductId(null);
    setView('list');
  }

  function handleOrderComplete() {
    setCart([]);
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="max-w-5xl mx-auto px-6 pt-24">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-white/50 hover:text-accent transition-colors"
        >
          ← Exit to site
        </button>
      </div>

      {view === 'list' && (
        <StorePage
          products={products}
          cartCount={cart.length}
          onSelectProduct={handleSelectProduct}
          onAddToCart={handleAddToCart}
          onGoToCheckout={() => setView('checkout')}
        />
      )}
      {view === 'detail' && (
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackToList}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
      {view === 'checkout' && (
        <Checkout cartItems={cart} onBack={handleBackToList} onOrderComplete={handleOrderComplete} />
      )}
    </div>
  );
}
