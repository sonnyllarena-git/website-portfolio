import { useState } from 'react';
import StorePage from './components/Store/StorePage';
import ProductDetail from './components/Store/ProductDetail';
import Checkout from './components/Store/Checkout';
import GridBackground from './components/LoadingStates/GridBackground';
import { products, getProductById } from './data/products';
import './App.css';

function App() {
  const [page, setPage] = useState('store'); // 'store' | 'detail' | 'checkout'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cart, setCart] = useState([]);

  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;

  function handleSelectProduct(id) {
    setSelectedProductId(id);
    setPage('detail');
  }

  function handleAddToCart(product) {
    setCart((prev) => [...prev, product]);
  }

  function handleBuyNow(product) {
    setCart((prev) => [...prev, product]);
    setPage('checkout');
  }

  function handleBackToStore() {
    setSelectedProductId(null);
    setPage('store');
  }

  function handleOrderComplete() {
    setCart([]);
  }

  return (
    <>
      <GridBackground />
      <main className="app-shell">
        {page === 'store' && (
          <StorePage
            products={products}
            cartCount={cart.length}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onGoToCheckout={() => setPage('checkout')}
          />
        )}
        {page === 'detail' && (
          <ProductDetail
            product={selectedProduct}
            onBack={handleBackToStore}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}
        {page === 'checkout' && (
          <Checkout cartItems={cart} onBack={handleBackToStore} onOrderComplete={handleOrderComplete} />
        )}
      </main>
    </>
  );
}

export default App;
