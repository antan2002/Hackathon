import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Homepage from './pages/Homepage';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import FoodSection from './pages/FoodSection';

const App: React.FC = () => {
  return (
    <CartProvider>
      <WishlistProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/food" element={<FoodSection />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/account" element={<Account />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;
