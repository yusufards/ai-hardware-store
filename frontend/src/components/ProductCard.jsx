import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onView }) => {
  return (
    <div className="product-card" onClick={() => onView(product)}>
      <div className="card-image-container">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="card-image"
          />
        ) : (
          <div className="card-image-placeholder">
            {product.name.charAt(0)}
          </div>
        )}
        
        <div className="card-badges-top-left">
          {product.old_price && <span className="badge-sale">SALE</span>}
        </div>
        
        <div className="card-badges-top-right">
          <div className="badge-rating">
            <Star size={12} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>

      <div className="card-content">
        <div className="card-category">{product.category}</div>
        <h3 className="card-title">{product.name}</h3>
        
        <div className="card-meta">
          <span>Stok: {product.stock}</span>
          <span className="dot"></span>
          <span>Terjual: {product.sold}</span>
        </div>

        <div className="card-footer">
          <div className="card-pricing">
            {product.old_price && (
              <div className="price-old">Rp {product.old_price.toLocaleString('id-ID')}</div>
            )}
            <div className="price-current">Rp {product.price.toLocaleString('id-ID')}</div>
          </div>
          
          <button className="btn-cart">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
