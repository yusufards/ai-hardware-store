import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, ImagePlus, RefreshCcw } from 'lucide-react';
import { sendChatMessage, predictImage } from '../services/api';

const AiAssistant = ({ isOpen, onClose, onViewProduct }) => {
  const [messages, setMessages] = useState([
    { 
      type: 'ai', 
      content: 'Halo! Saya AI Assistant Toko Hardware. Anda bisa upload gambar perkakas agar saya kenali, atau tanyakan seputar harga, stok, dan rekomendasi produk.' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, imagePreview]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Mohon upload file gambar yang valid.');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  };

  const processImagePrediction = async (file) => {
    try {
      const predData = await predictImage(file);
      if (predData.is_unknown || predData.class_id === 0) {
        return `Maaf, saya tidak mengenali gambar ini sebagai alat perkakas yang kami jual. Sistem mendeteksinya sebagai "${predData.class_name}" (kategori unknown). Bisakah Anda memberikan foto lain?`;
      }

      let responseText = `Saya mengenali ini sebagai ${predData.class_name} dengan tingkat kecocokan ${(predData.confidence * 100).toFixed(1)}%.\n\n`;
      
      if (predData.product) {
        return {
          text: responseText,
          product: predData.product
        };
      } else {
        responseText += `Namun, produk ini sedang tidak tersedia di katalog kami.`;
        return responseText;
      }
    } catch (error) {
      console.error(error);
      return `Maaf, terjadi kesalahan saat memproses gambar: ${error.message}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    const userText = input.trim();
    const userImage = selectedImage;
    const userPreview = imagePreview;
    
    setInput('');
    removeImage();

    const newUserMessage = {
      type: 'user',
      content: userText,
      image: userPreview
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      let imageResponse = null;
      if (userImage) {
        imageResponse = await processImagePrediction(userImage);
      }

      let finalContextText = userText;
      let recommendedProduct = null;

      if (imageResponse) {
        if (typeof imageResponse === 'string') {
           finalContextText = `[User mengupload gambar] Hasil deteksi sistem: ${imageResponse}. Pertanyaan User: ${userText}`;
        } else {
           finalContextText = `[User mengupload gambar] Hasil deteksi sistem: ${imageResponse.text}. Pertanyaan User: ${userText}`;
           recommendedProduct = imageResponse.product;
        }
      }

      let currentContent = '';
      if (imageResponse && typeof imageResponse !== 'string' && !userText) {
          // If no user text, start with the image detection text
          currentContent = imageResponse.text + '\n\n';
      }

      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: currentContent, 
        isStreaming: true 
      }]);

      // Build conversation history
      const newMessagesForHistory = messages.map(m => ({
          role: m.type === 'ai' ? 'assistant' : 'user',
          content: m.content
      })).filter(m => m.content);

      newMessagesForHistory.push({
          role: 'user',
          content: finalContextText
      });

      await sendChatMessage(
        newMessagesForHistory, 
        recommendedProduct ? recommendedProduct.class_id : null,
        (chunk) => {
          currentContent += chunk;
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { 
              ...newMsgs[newMsgs.length - 1], 
              content: currentContent 
            };
            return newMsgs;
          });
        }
      );
      
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { 
          ...newMsgs[newMsgs.length - 1], 
          content: currentContent,
          product: recommendedProduct,
          isStreaming: false
        };
        return newMsgs;
      });

    } catch (error) {
      setMessages(prev => {
        const newMsgs = [...prev];
        // Replace streaming placeholder or append if not there
        if (newMsgs[newMsgs.length - 1].isStreaming) {
           newMsgs[newMsgs.length - 1].content += `\n[Error: ${error.message}]`;
           newMsgs[newMsgs.length - 1].isStreaming = false;
        } else {
           newMsgs.push({ type: 'ai', content: `Maaf, terjadi kendala saat menghubungi asisten AI. Details: ${error.message}` });
        }
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal-content animate-fade-in">
        
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info flex items-center gap-3">
            <div className="chat-avatar bg-accent">
              <Bot size={24} />
            </div>
            <div>
              <h3>AI Assistant</h3>
              <p>Online & Ready to Help</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message-row ${msg.type}`}>
              {msg.type === 'ai' && (
                <div className="chat-bubble-avatar">
                  <Bot size={16} />
                </div>
              )}
              
              <div className={`chat-bubble ${msg.type}`}>
                {msg.image && (
                  <div className="chat-bubble-image">
                    <img src={msg.image} alt="Uploaded preview" />
                  </div>
                )}
                {msg.content && <div className="chat-bubble-text whitespace-pre-wrap">{msg.content}</div>}
                
                {msg.product && (
                  <div 
                    className="chat-product-card"
                    onClick={() => onViewProduct(msg.product)}
                  >
                    <div className="chat-product-img">
                      {msg.product.image_url ? (
                        <img src={msg.product.image_url} alt={msg.product.name} />
                      ) : (
                        <div>{msg.product.name.charAt(0)}</div>
                      )}
                    </div>
                    <div className="chat-product-info">
                      <h4>{msg.product.name}</h4>
                      <p>Rp {msg.product.price.toLocaleString('id-ID')}</p>
                      <span className="chat-product-badge">Klik untuk Detail</span>
                    </div>
                  </div>
                )}
              </div>

              {msg.type === 'user' && (
                <div className="chat-bubble-avatar user">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="chat-message-row ai">
              <div className="chat-bubble-avatar">
                <Bot size={16} />
              </div>
              <div className="chat-bubble loading">
                <Loader2 className="animate-spin" size={20} />
                <span>AI sedang berpikir...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          {imagePreview && (
            <div className="chat-preview-zone">
              <div className="preview-image-wrap">
                <img src={imagePreview} alt="Preview" />
                <button onClick={removeImage} className="preview-remove"><X size={14}/></button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="chat-form">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="btn-icon upload-btn"
              title="Upload Gambar"
            >
              <ImagePlus size={20} />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              placeholder={imagePreview ? "Tambahkan pesan (opsional)..." : "Tanyakan sesuatu..."}
              className="chat-input-field"
            />
            
            <button 
              type="submit" 
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="btn-icon send-btn"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
