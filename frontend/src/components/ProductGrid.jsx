import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onViewDetail }) => {
  if (!products || products.length === 0) {
    return (
      <div className="grid-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <section id="products" className="product-section">
      <div className="container">
        <div className="section-header">
          <h2>Katalog <strong>Produk</strong></h2>
          <p>
            Temukan berbagai perkakas berkualitas untuk kebutuhan bengkel, rumah tangga, maupun industri Anda.
          </p>
        </div>
        
        <div className="product-grid">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onView={onViewDetail} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
