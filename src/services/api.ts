import { Product, User, Order, Subscription, Review, AuditLog, SecurityAlert, EmailNotification, CartItem, InfrastructureHealth } from '../types';

const API_BASE = '/api';

export const api = {
  // Products
  async getProducts(params?: { category?: string; search?: string; minPrice?: number; maxPrice?: number; sortBy?: string; inStockOnly?: boolean }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.inStockOnly) query.append('inStockOnly', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async updateStock(id: string, stock: number): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock })
    });
    if (!res.ok) throw new Error('Failed to update stock');
    return res.json();
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  // Auth & MFA
  async login(email: string): Promise<{ user?: User; requiresMfa?: boolean; token?: string; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  async verifyMfa(email: string, code: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid MFA code');
    return data;
  },

  async register(name: string, email: string, role: string = 'customer'): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role })
    });
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  async updateUserRole(id: string, role: 'admin' | 'manager' | 'customer'): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  // Checkout & Payment
  async processPayment(paymentData: {
    userEmail: string;
    userName: string;
    items: { productId: string; quantity: number }[];
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
    shippingAddress: Order['shippingAddress'];
    isSubscription?: boolean;
    subscriptionPlan?: string;
  }): Promise<{ success: boolean; order: Order; message: string }> {
    const res = await fetch(`${API_BASE}/checkout/process-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment failed');
    return data;
  },

  // Orders
  async getOrders(email?: string): Promise<Order[]> {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE}/orders${query}`);
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Subscriptions
  async getSubscriptions(): Promise<Subscription[]> {
    const res = await fetch(`${API_BASE}/subscriptions`);
    return res.json();
  },

  async updateSubscriptionStatus(subId: string, status: 'active' | 'paused' | 'cancelled'): Promise<Subscription> {
    const res = await fetch(`${API_BASE}/subscriptions/${subId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Reviews
  async getReviews(productId: string): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/reviews?productId=${productId}`);
    return res.json();
  },

  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    return res.json();
  },

  async voteHelpful(reviewId: string): Promise<Review> {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
      method: 'PUT'
    });
    return res.json();
  },

  // Audit Logs & Security
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return res.json();
  },

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    const res = await fetch(`${API_BASE}/security-alerts`);
    return res.json();
  },

  async runVulnerabilityScan(): Promise<{ scanTime: string; summary: string; score: string; findings: string[] }> {
    const res = await fetch(`${API_BASE}/security/vulnerability-scan`, {
      method: 'POST'
    });
    return res.json();
  },

  // Emails
  async getEmails(): Promise<EmailNotification[]> {
    const res = await fetch(`${API_BASE}/emails`);
    return res.json();
  },

  async markEmailRead(id: string): Promise<void> {
    await fetch(`${API_BASE}/emails/${id}/read`, { method: 'PUT' });
  },

  // Infrastructure Health
  async getHealth(): Promise<{ status: string; health: InfrastructureHealth }> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }
};

// --- GUEST CART PERSISTENCE & SYNC BRIDGE ---
const CART_STORAGE_KEY = 'nexus_guest_cart_v1';

export const cartStorage = {
  getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveCart(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart in localStorage', e);
    }
  },

  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
};
