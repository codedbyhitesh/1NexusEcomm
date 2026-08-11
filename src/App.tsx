import React, { useState, useEffect } from 'react';
import { Product, CartItem, User, EmailNotification } from './types';
import { api, cartStorage } from './services/api';
import { Navbar } from './components/Navbar';
import { Storefront } from './components/Storefront';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { EmailInboxDrawer } from './components/EmailInboxDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { Shield, Sparkles, Heart } from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('nexus_dark_mode') === 'true';
  });

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Store & Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);

  // Shopping Cart State (Local storage persistent for guest + server sync)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => cartStorage.getCart());
  const [syncedNotice, setSyncedNotice] = useState<boolean>(false);

  // Modals & Drawers state
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isEmailInboxOpen, setIsEmailInboxOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Email notifications
  const [emails, setEmails] = useState<EmailNotification[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus_dark_mode', darkMode.toString());
  }, [darkMode]);

  // Save cart to local storage whenever cartItems change
  useEffect(() => {
    cartStorage.saveCart(cartItems);
  }, [cartItems]);

  // Initial Data Fetching
  useEffect(() => {
    loadProducts();
    loadEmails();
  }, [selectedCategory, searchQuery, sortBy, inStockOnly, priceRange]);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        maxPrice: priceRange[1],
        sortBy,
        inStockOnly
      });
      setProducts(data);

      // Extract unique categories
      const allCat = await api.getProducts();
      const uniqueCats = Array.from(new Set(allCat.map(p => p.category)));
      setCategories(['All', ...uniqueCats]);
    } catch (e) {
      console.error('Error loading products', e);
    }
  };

  const loadEmails = async () => {
    try {
      const data = await api.getEmails();
      setEmails(data);
    } catch (e) {
      console.error('Error loading email notifications', e);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        return [...prev, { productId: product.id, product, quantity: Math.min(product.stock, quantity) }];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          return { ...item, quantity: Math.min(item.product.stock, qty) };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    cartStorage.clearCart();
  };

  // Login Success Handler & Guest Cart Sync Bridge
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (cartItems.length > 0) {
      setSyncedNotice(true);
      setTimeout(() => setSyncedNotice(false), 5000);
    }
    loadEmails();
  };

  const handleMarkEmailRead = async (id: string) => {
    await api.markEmailRead(id);
    setEmails(emails.map(e => e.id === id ? { ...e, read: true } : e));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const unreadEmailCount = emails.filter(e => !e.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans">

      {/* Main Navbar */}
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenEmailInbox={() => setIsEmailInboxOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentUser={currentUser}
        unreadEmailCount={unreadEmailCount}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        categories={categories}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Storefront
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddToCart={handleAddToCart}
          onQuickView={setActiveProduct}
          sortBy={sortBy}
          onSortChange={setSortBy}
          inStockOnly={inStockOnly}
          onToggleInStockOnly={() => setInStockOnly(!inStockOnly)}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">NEXUS Enterprise Platform</span>
            <span>— Full-Stack Security & Real-Time E-Commerce Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>AES-256 Encrypted</span>
            <span>•</span>
            <span>SHA-256 Audit Logs</span>
            <span>•</span>
            <span>Stripe Payment Proxy</span>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        currentUser={currentUser}
        syncedNotice={syncedNotice}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onClearCart={handleClearCart}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Email Inbox Drawer */}
      <EmailInboxDrawer
        isOpen={isEmailInboxOpen}
        onClose={() => setIsEmailInboxOpen(false)}
        emails={emails}
        onMarkRead={handleMarkEmailRead}
      />

      {/* Admin Security & Operational Control Console */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
      />

    </div>
  );
}
