import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const predictImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/predict`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const sendChatMessage = async (messages, contextProductId = null, onChunk = null) => {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context_product_id: contextProductId })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.substring(6));
          if (data.error) throw new Error(data.error);
          if (data.content) {
            fullText += data.content;
            if (onChunk) onChunk(data.content);
          }
        } catch (e) {
          if (e.message !== "Unexpected end of JSON input") {
            console.error("SSE Parse Error:", e);
          }
        }
      }
    }
  }
  return { reply: fullText };
};
