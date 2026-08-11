export type UserRole = 'admin' | 'manager' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
  mfaSecret?: string;
  encryptedData?: {
    cardTokenMasked?: string;
    taxIdHash?: string;
    addressEncrypted?: string;
  };
  createdAt: string;
  lastLoginAt?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  tags: string[];
  isSubscription?: boolean;
  subscriptionPrice?: number;
  subscriptionInterval?: 'monthly' | 'yearly';
  features?: string[];
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  isSubscription?: boolean;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentId: string;
  cardLast4?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  productName: string;
  price: number;
  billingInterval: 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export type LogSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipAddress: string;
  action: string;
  resource: string;
  severity: LogSeverity;
  payloadHash: string; // SHA-256 immutable checksum chaining
  previousHash?: string;
  encryptedDetails?: string; // AES-256 encrypted payload preview
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved';
  affectedResource: string;
}

export interface InfrastructureHealth {
  cpuUsage: number;
  memoryUsage: number;
  containerStatus: 'healthy' | 'degraded' | 'down';
  loadBalancerStatus: 'active' | 'failover';
  activeConnections: number;
  apiLatencyMs: number;
  uptimeSeconds: number;
  threatLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  templateType: 'order_confirmation' | 'shipping_update' | 'failed_payment' | 'mfa_code' | 'security_alert';
  sentAt: string;
  status: 'delivered' | 'failed';
  read: boolean;
}
