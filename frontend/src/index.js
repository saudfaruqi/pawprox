// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { CartProvider } from "./context/CartContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <CartProvider>
    <App />
  </CartProvider>
  </BrowserRouter>
);
