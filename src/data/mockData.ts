import { Product, User, Order, Subscription, Review, AuditLog, SecurityAlert, EmailNotification } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Quantum X-1 Pro Noise-Canceling Headphones',
    category: 'Electronics',
    price: 299.99,
    originalPrice: 349.99,
    description: 'Enterprise-grade studio headphones featuring adaptive noise cancellation, spatial audio rendering, and 40-hour battery life.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewCount: 142,
    stock: 18,
    lowStockThreshold: 5,
    tags: ['Best Seller', 'Wireless', 'Audio'],
    features: ['Active Noise Cancelling', 'Bluetooth 5.3', 'Multipoint Connection', 'Fast Charging']
  },
  {
    id: 'prod-2',
    name: 'AeroBook Ultra Slim Workstation',
    category: 'Electronics',
    price: 1299.00,
    originalPrice: 1499.00,
    description: '14-inch OLED laptop with M3 Max processing power, 32GB RAM, 1TB NVMe storage, and titanium chassis built for developers.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewCount: 89,
    stock: 4,
    lowStockThreshold: 5,
    tags: ['Low Stock', 'Laptop', 'OLED'],
    features: ['32GB Unified Memory', '1TB NVMe SSD', '120Hz OLED Display', 'Thunderbolt 4']
  },
  {
    id: 'prod-3',
    name: 'Chrono Precision Mechanical Watch',
    category: 'Fashion',
    price: 450.00,
    description: 'Swiss-inspired automatic movement chronometer with sapphire crystal glass and 100m water resistance.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewCount: 64,
    stock: 25,
    lowStockThreshold: 5,
    tags: ['Luxury', 'Waterproof', 'Automatic'],
    features: ['Self-Winding Movement', 'Sapphire Crystal', '316L Stainless Steel', 'Lumishot Dial']
  },
  {
    id: 'prod-4',
    name: 'Aura Home Smart Atmosphere Hub',
    category: 'Home & Kitchen',
    price: 149.50,
    originalPrice: 179.99,
    description: 'AI-driven climate and lighting ecosystem controller with voice recognition, Matter protocol support, and real-time energy tracking.',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    reviewCount: 51,
    stock: 3,
    lowStockThreshold: 5,
    tags: ['Smart Home', 'Limited Stock', 'Eco-Friendly'],
    features: ['Matter & Zigbee Compatible', 'Energy Saver AI', 'Touchscreen Panel', 'Zero-Latency Wi-Fi 6E']
  },
  {
    id: 'prod-5',
    name: 'Enterprise Cloud Security & Analytics Pass',
    category: 'Enterprise Services',
    price: 89.00,
    description: 'Continuous server vulnerability scanning, automated SOC 2 audit reporting, and real-time threat alert system.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    rating: 4.95,
    reviewCount: 210,
    stock: 999,
    lowStockThreshold: 10,
    tags: ['SaaS Subscription', 'Enterprise', 'Security'],
    isSubscription: true,
    subscriptionPrice: 89.00,
    subscriptionInterval: 'monthly',
    features: ['Unlimited Scans', '24/7 Security Monitoring', 'Immutable Audit Storage', 'SLA Guarantee']
  },
  {
    id: 'prod-6',
    name: 'Zenith Organic Cold-Pressed Wellness Kit',
    category: 'Health & Fitness',
    price: 75.00,
    description: 'Daily nutrient-rich superfood blend crafted for sustained energy, mental focus, and immune fortification.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    reviewCount: 38,
    stock: 42,
    lowStockThreshold: 8,
    tags: ['Organic', 'Wellness', 'Subscription Option'],
    isSubscription: true,
    subscriptionPrice: 65.00,
    subscriptionInterval: 'monthly',
    features: ['100% Organic', 'Zero Preservatives', 'Monthly Auto-Refill Discount']
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Alexandra Vance (Admin)',
    email: 'admin@nexus.io',
    role: 'admin',
    mfaEnabled: true,
    mfaSecret: 'JBSWY3DPEHPK3PXP',
    encryptedData: {
      cardTokenMasked: 'tok_1N82x2E2eZvKYlo29',
      taxIdHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      addressEncrypted: 'U2FsdGVkX195M3x284N3x...'
    },
    createdAt: '2026-01-15T08:00:00Z',
    lastLoginAt: '2026-08-10T11:30:00Z'
  },
  {
    id: 'usr-mgr-1',
    name: 'Marcus Brody (Manager)',
    email: 'manager@nexus.io',
    role: 'manager',
    mfaEnabled: true,
    createdAt: '2026-02-10T09:15:00Z'
  },
  {
    id: 'usr-cust-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'customer',
    mfaEnabled: false,
    createdAt: '2026-04-20T14:22:00Z'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'usr-cust-1',
    userName: 'Sarah Jenkins',
    rating: 5,
    comment: 'The active noise cancellation is remarkable! I use these daily in my loud office and they isolate noise perfectly.',
    verifiedPurchase: true,
    helpfulCount: 24,
    createdAt: '2026-07-02T10:14:00Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userId: 'usr-cust-2',
    userName: 'David Miller',
    rating: 4,
    comment: 'Great sound fidelity and super comfortable ear pads. Battery easily lasts the advertised 40 hours.',
    verifiedPurchase: true,
    helpfulCount: 11,
    createdAt: '2026-07-15T16:30:00Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userId: 'usr-cust-3',
    userName: 'Elena Rostova',
    rating: 5,
    comment: 'Compiles heavy Rust and Docker containers in seconds without throttling. Best developer laptop I have owned.',
    verifiedPurchase: true,
    helpfulCount: 45,
    createdAt: '2026-07-28T09:05:00Z'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-94821',
    userId: 'usr-cust-1',
    userEmail: 'sarah.j@example.com',
    userName: 'Sarah Jenkins',
    items: [
      {
        productId: 'prod-1',
        productName: 'Quantum X-1 Pro Noise-Canceling Headphones',
        price: 299.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 299.99,
    status: 'shipped',
    paymentMethod: 'Stripe Credit Card (Encrypted)',
    paymentId: 'ch_3M48x2E2eZvKYlo291A8x9',
    cardLast4: '4242',
    shippingAddress: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'OR',
      zip: '97477',
      country: 'USA'
    },
    trackingNumber: 'TRK-9028198234-US',
    createdAt: '2026-08-08T14:20:00Z',
    updatedAt: '2026-08-09T09:00:00Z'
  },
  {
    id: 'ORD-94822',
    userEmail: 'enterprise.buyer@acme.corp',
    userName: 'Acme Corp Procurement',
    items: [
      {
        productId: 'prod-5',
        productName: 'Enterprise Cloud Security & Analytics Pass',
        price: 89.00,
        quantity: 5,
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
      }
    ],
    totalAmount: 445.00,
    status: 'delivered',
    paymentMethod: 'Stripe Corporate Billing',
    paymentId: 'ch_3M48y3F3fAwLZmp302B9y0',
    cardLast4: '8888',
    shippingAddress: {
      street: '100 Technology Way',
      city: 'San Jose',
      state: 'CA',
      zip: '95110',
      country: 'USA'
    },
    trackingNumber: 'TRK-1122334455-US',
    createdAt: '2026-08-05T11:10:00Z',
    updatedAt: '2026-08-06T15:30:00Z'
  }
];

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'SUB-101',
    userId: 'usr-cust-1',
    userEmail: 'sarah.j@example.com',
    productName: 'Enterprise Cloud Security & Analytics Pass',
    price: 89.00,
    billingInterval: 'monthly',
    status: 'active',
    nextBillingDate: '2026-09-08T00:00:00Z',
    createdAt: '2026-08-08T14:20:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-10T11:40:12Z',
    userId: 'usr-admin-1',
    userName: 'Alexandra Vance',
    userRole: 'admin',
    ipAddress: '192.168.1.102',
    action: 'ADMIN_MFA_AUTHENTICATED',
    resource: '/api/auth/verify-mfa',
    severity: 'INFO',
    payloadHash: '9a83f12e84c7980281b37e8c22149b294c637a28e9d300e843',
    encryptedDetails: 'AES256:4a8f90218b7c3d2e...'
  },
  {
    id: 'log-002',
    timestamp: '2026-08-10T11:35:44Z',
    ipAddress: '198.51.100.42',
    action: 'STRIPE_PAYMENT_PROCESSED',
    resource: '/api/checkout/process-payment',
    severity: 'INFO',
    payloadHash: '3f29b109e201f9814c99a8f2780b334a100f28123',
    encryptedDetails: 'AES256:91823ab02f...'
  },
  {
    id: 'log-003',
    timestamp: '2026-08-10T10:12:00Z',
    ipAddress: '203.0.113.195',
    action: 'FAILED_TRANSACTION_ALERT',
    resource: '/api/checkout/process-payment',
    severity: 'WARN',
    payloadHash: '72810a0f9b00e81248c71d2e',
    encryptedDetails: 'AES256:71629c011e... [Card Expired]'
  },
  {
    id: 'log-004',
    timestamp: '2026-08-10T09:00:00Z',
    userId: 'usr-admin-1',
    userName: 'Alexandra Vance',
    userRole: 'admin',
    ipAddress: '192.168.1.102',
    action: 'VULNERABILITY_SCAN_EXECUTED',
    resource: '/api/security/vulnerability-scan',
    severity: 'INFO',
    payloadHash: '1109a823f9901021bc45e782',
    encryptedDetails: 'AES256:00000_ALL_SYSTEMS_PASS'
  }
];

export const INITIAL_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'alt-1',
    timestamp: '2026-08-10T10:12:00Z',
    type: 'Card Transaction Failure Anomaly',
    description: 'Multiple failed card authorization attempts detected from IP 203.0.113.195 within 60 seconds.',
    severity: 'medium',
    status: 'investigating',
    affectedResource: 'Payment Gateway Proxy'
  },
  {
    id: 'alt-2',
    timestamp: '2026-08-10T09:01:00Z',
    type: 'OWASP Security Scan Passed',
    description: 'Automated vulnerability scanner verified 0 SQLi, 0 XSS, and 0 unauthorized privilege escalation risks.',
    severity: 'low',
    status: 'resolved',
    affectedResource: 'Container Infrastructure'
  }
];

export const INITIAL_EMAILS: EmailNotification[] = [
  {
    id: 'email-1',
    to: 'sarah.j@example.com',
    subject: 'Order #ORD-94821 Shipped - NEXUS Store',
    body: 'Hi Sarah, your order #ORD-94821 containing Quantum X-1 Pro Noise-Canceling Headphones has been shipped via FedEX (Tracking: TRK-9028198234-US).',
    templateType: 'shipping_update',
    sentAt: '2026-08-09T09:00:00Z',
    status: 'delivered',
    read: true
  },
  {
    id: 'email-2',
    to: 'admin@nexus.io',
    subject: '[SECURITY ALERT] Transaction Failed & Logged',
    body: 'System alert: A failed credit card transaction occurred for IP 203.0.113.195. Audit log entry #log-003 created with AES-256 payload encryption.',
    templateType: 'security_alert',
    sentAt: '2026-08-10T10:12:00Z',
    status: 'delivered',
    read: false
  }
];
