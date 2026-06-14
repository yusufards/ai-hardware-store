import React from 'react';
import { Wrench, Bot } from 'lucide-react';

const Navbar = ({ onAiClick }) => {
  return (
    <nav className="navbar-container">
      <div className="navbar glass-panel">
        <div className="navbar-brand">
          <div className="brand-icon">
            <Wrench size={20} />
          </div>
          <span className="brand-text">
            Hardware<strong>AI</strong>
          </span>
        </div>
        
        <div className="navbar-links">
          <a href="#" className="nav-link active">Home</a>
          <a href="#products" className="nav-link">Products</a>
        </div>

        <div className="navbar-actions">
          <button onClick={onAiClick} className="btn-primary">
            <Bot size={20} />
            <span>Try Assistant</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
