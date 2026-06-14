import React from 'react';
import { X, Star, CheckCircle, Tag, Package, ShoppingCart } from 'lucide-react';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>

        <div className="modal-body">
          <div className="modal-image-col">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="modal-image"
              />
            ) : (
              <div className="modal-image-placeholder">
                {product.name.charAt(0)}
              </div>
            )}
            {product.old_price && (
              <div className="modal-badge-sale">Sedang Diskon!</div>
            )}
          </div>

          <div className="modal-info-col">
            <div className="modal-header-row">
              <div className="tag modal-category">
                <Tag size={12} />
                {product.category}
              </div>
              <div className="modal-stats">
                <div className="stat-box">
                  <Star size={14} fill="currentColor" />
                  <strong>{product.rating}</strong>
                </div>
                <div className="stat-text">
                  <Package size={14} />
                  Sisa: <strong>{product.stock}</strong>
                </div>
                <div className="stat-text">
                  Terjual: <strong>{product.sold}</strong>
                </div>
              </div>
            </div>
            
            <h2 className="modal-title">{product.name}</h2>
            
            <div className="modal-pricing-row">
              <div className="modal-pricing">
                <div className="pricing-label">Harga Spesial</div>
                <div className="pricing-values">
                  <span className="price-main">Rp {product.price.toLocaleString('id-ID')}</span>
                  {product.old_price && (
                    <span className="price-strike">Rp {product.old_price.toLocaleString('id-ID')}</span>
                  )}
                </div>
              </div>
              <button className="btn-primary btn-cart-large">
                <ShoppingCart size={18} />
                Keranjang
              </button>
            </div>

            <div className="modal-section">
              <h3>Deskripsi Produk</h3>
              <p className="desc-text">{product.description}</p>
            </div>

            <div className="modal-section" style={{marginBottom: 0}}>
              <h3>Spesifikasi</h3>
              <ul className="specs-list">
                {product.specs.map((spec, idx) => (
                  <li key={idx}>
                    <CheckCircle size={14} className="spec-icon" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
