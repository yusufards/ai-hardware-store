import React from 'react';
import { Bot, Image as ImageIcon, Zap, Sparkles } from 'lucide-react';

const Hero = ({ onAiClick }) => {
  return (
    <section className="hero-section">
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div className="container relative">
        <div className="hero-grid">
          
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Pionir Toko Perkakas Pintar</span>
            </div>
            
            <h1 className="hero-title">
              Hardware Store <br/>
              <strong>Powered by AI.</strong>
            </h1>
            
            <p className="hero-subtitle">
              Cari perkakas tak pernah semudah ini. Upload gambar barang yang Anda cari, dan AI Assistant kami akan langsung menemukan produk yang tepat di katalog kami.
            </p>
            
            <div className="hero-actions">
              <button onClick={onAiClick} className="btn-primary btn-large">
                <ImageIcon size={20} />
                Coba Cari dengan Gambar
              </button>
              <a href="#products" className="btn-secondary btn-large">
                Lihat Katalog
              </a>
            </div>
          </div>

          <div className="hero-visual animate-fade-in">
             <div className="bento-container glass-panel">
                <div className="bento-main">
                   <div className="bento-icon-large">
                      <Bot size={32} />
                   </div>
                   <h3>AI Assistant Aktif</h3>
                   <p>Siap membantu Anda 24/7 menemukan perkakas yang tepat.</p>
                </div>

                <div className="bento-row">
                   <div className="bento-small">
                      <div className="bento-icon"><ImageIcon size={24} /></div>
                      <div>
                        <strong>Image Search</strong>
                        <span>Deteksi via foto</span>
                      </div>
                   </div>
                   <div className="bento-small">
                      <div className="bento-icon"><Zap size={24} /></div>
                      <div>
                        <strong>Fast Result</strong>
                        <span>&lt; 2 detik</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
