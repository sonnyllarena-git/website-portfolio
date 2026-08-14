import GlitchText from '../GlitchText';
import './Buttons.css';
import './StorePage.css';

export default function StorePage({ products, cartCount, onSelectProduct, onAddToCart, onGoToCheckout }) {
  return (
    <div className="store-page">
      <header className="store-header">
        <h1 className="store-title">Store</h1>
        <button className="btn-secondary cart-button" onClick={onGoToCheckout}>
          Cart ({cartCount})
        </button>
      </header>

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card-body">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price}</p>
            </div>
            <div className="product-card-actions">
              <button className="btn-secondary" onClick={() => onSelectProduct(product.id)}>
                View Details
              </button>
              <button className="btn-primary" onClick={() => onAddToCart(product)}>
                <GlitchText text="Add to Cart" animated intensity="medium" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
