import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import AiAssistant from './components/AiAssistant';
import { getProducts } from './services/api';

function App() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="app-container">
      <Navbar onAiClick={() => setIsAiOpen(true)} />
      
      <main>
        <Hero onAiClick={() => setIsAiOpen(true)} />
        <ProductGrid 
          products={products} 
          onViewDetail={setSelectedProduct} 
        />
      </main>

      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)} 
      />

      <AiAssistant 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        onViewProduct={setSelectedProduct}
      />
    </div>
  );
}

export default App;
