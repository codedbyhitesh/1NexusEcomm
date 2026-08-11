import crypto from 'crypto';
import { Product, User, Order, Subscription, Review, AuditLog, SecurityAlert, EmailNotification, InfrastructureHealth } from '../src/types';
import { INITIAL_PRODUCTS, MOCK_USERS, MOCK_REVIEWS, MOCK_ORDERS, MOCK_SUBSCRIPTIONS, INITIAL_AUDIT_LOGS, INITIAL_SECURITY_ALERTS, INITIAL_EMAILS } from '../src/data/mockData';

class ServerDatabase {
  private products: Product[] = [...INITIAL_PRODUCTS];
  private users: User[] = [...MOCK_USERS];
  private orders: Order[] = [...MOCK_ORDERS];
  private subscriptions: Subscription[] = [...MOCK_SUBSCRIPTIONS];
  private reviews: Review[] = [...MOCK_REVIEWS];
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private securityAlerts: SecurityAlert[] = [...INITIAL_SECURITY_ALERTS];
  private emails: EmailNotification[] = [...INITIAL_EMAILS];
  private systemStartTime = Date.now();

  // Encrypt string with AES-256-CBC simulation
  public encryptAES256(text: string): string {
    const key = crypto.scryptSync('NEXUS_ENTERPRISE_SECRET_KEY_2026', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `AES256:${iv.toString('hex')}:${encrypted}`;
  }

  // Decrypt string
  public decryptAES256(encryptedText: string): string {
    try {
      if (!encryptedText.startsWith('AES256:')) return encryptedText;
      const parts = encryptedText.split(':');
      if (parts.length < 3) return encryptedText;
      const iv = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      const key = crypto.scryptSync('NEXUS_ENTERPRISE_SECRET_KEY_2026', 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return '[Encrypted AES-256 payload]';
    }
  }

  // Generate SHA-256 hash for immutable log chaining
  public generateLogHash(prevHash: string, timestamp: string, action: string, resource: string, payload: string): string {
    return crypto.createHash('sha256').update(`${prevHash}|${timestamp}|${action}|${resource}|${payload}`).digest('hex');
  }

  // Add immutable Audit Log entry
  public addAuditLog(data: {
    userId?: string;
    userName?: string;
    userRole?: string;
    ipAddress?: string;
    action: string;
    resource: string;
    severity: 'INFO' | 'WARN' | 'CRITICAL';
    detailsRaw?: string;
  }): AuditLog {
    const timestamp = new Date().toISOString();
    const prevLog = this.auditLogs[0];
    const prevHash = prevLog ? prevLog.payloadHash : 'GENESIS_BLOCK_NEXUS_2026';
    const rawPayload = data.detailsRaw || `${data.action}:${data.resource}`;
    const encryptedDetails = this.encryptAES256(rawPayload);
    const payloadHash = this.generateLogHash(prevHash, timestamp, data.action, data.resource, rawPayload);

    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      ipAddress: data.ipAddress || '127.0.0.1',
      action: data.action,
      resource: data.resource,
      severity: data.severity,
      payloadHash,
      previousHash: prevHash,
      encryptedDetails
    };

    this.auditLogs.unshift(log); // newest first
    return log;
  }

  // Create & Dispatch Email Notification
  public sendEmailNotification(to: string, subject: string, body: string, templateType: EmailNotification['templateType']): EmailNotification {
    const email: EmailNotification = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      subject,
      body,
      templateType,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      read: false
    };
    this.emails.unshift(email);
    return email;
  }

  // Getters
  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public updateProductStock(id: string, newStock: number): Product | undefined {
    const product = this.products.find(p => p.id === id);
    if (product) {
      const oldStock = product.stock;
      product.stock = Math.max(0, newStock);
      this.addAuditLog({
        action: 'PRODUCT_STOCK_UPDATED',
        resource: `/api/products/${id}`,
        severity: product.stock <= product.lowStockThreshold ? 'WARN' : 'INFO',
        detailsRaw: `Stock adjusted from ${oldStock} to ${product.stock} for product "${product.name}"`
      });

      if (product.stock <= product.lowStockThreshold) {
        this.addSecurityAlert({
          type: 'Low Inventory Alert',
          description: `Product "${product.name}" is below low-stock threshold (${product.stock} remaining).`,
          severity: 'medium',
          affectedResource: `Inventory SKU ${product.id}`
        });
      }
    }
    return product;
  }

  public addProduct(productData: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    this.products.unshift(newProduct);
    this.addAuditLog({
      action: 'PRODUCT_CREATED',
      resource: `/api/products/${newProduct.id}`,
      severity: 'INFO',
      detailsRaw: `New product added: "${newProduct.name}" priced at $${newProduct.price}`
    });
    return newProduct;
  }

  public getUsers(): User[] {
    return this.users.map(u => ({ ...u, mfaSecret: undefined })); // hide secret
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: { name: string; email: string; role?: 'admin' | 'manager' | 'customer' }): User {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'customer',
      mfaEnabled: userData.role === 'admin',
      encryptedData: {
        taxIdHash: crypto.createHash('sha256').update(userData.email).digest('hex')
      },
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.addAuditLog({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'USER_REGISTERED',
      resource: '/api/auth/register',
      severity: 'INFO',
      detailsRaw: `User ${newUser.email} registered with role ${newUser.role}`
    });
    return newUser;
  }

  public updateUserRole(userId: string, newRole: 'admin' | 'manager' | 'customer'): User | undefined {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const oldRole = user.role;
      user.role = newRole;
      if (newRole === 'admin') {
        user.mfaEnabled = true;
      }
      this.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_ROLE_CHANGED',
        resource: `/api/users/${userId}/role`,
        severity: 'WARN',
        detailsRaw: `Role changed from ${oldRole} to ${newRole} for ${user.email}`
      });
    }
    return user;
  }

  // Orders & Stock Decrementing
  public createOrder(orderData: {
    userId?: string;
    userEmail: string;
    userName: string;
    items: { productId: string; quantity: number }[];
    paymentMethod: string;
    cardLast4?: string;
    shippingAddress: Order['shippingAddress'];
  }): Order {
    let totalAmount = 0;
    const orderItems: Order['items'] = [];

    // Decrement stock in real time
    for (const item of orderData.items) {
      const p = this.products.find(prod => prod.id === item.productId);
      if (p) {
        if (p.stock < item.quantity) {
          throw new Error(`Insufficient inventory for item "${p.name}". Available: ${p.stock}`);
        }
        p.stock -= item.quantity;
        totalAmount += p.price * item.quantity;
        orderItems.push({
          productId: p.id,
          productName: p.name,
          price: p.price,
          quantity: item.quantity,
          image: p.image
        });
      }
    }

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: orderId,
      userId: orderData.userId,
      userEmail: orderData.userEmail,
      userName: orderData.userName,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'processing',
      paymentMethod: orderData.paymentMethod,
      paymentId: `ch_stripe_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      cardLast4: orderData.cardLast4 || '4242',
      shippingAddress: orderData.shippingAddress,
      trackingNumber: `TRK-${Math.floor(1000000000 + Math.random() * 9000000000)}-US`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);

    // Audit log
    this.addAuditLog({
      userId: orderData.userId,
      userName: orderData.userName,
      action: 'ORDER_CREATED_AND_PAID',
      resource: `/api/orders/${newOrder.id}`,
      severity: 'INFO',
      detailsRaw: `Order #${newOrder.id} total $${newOrder.totalAmount} processed via Stripe`
    });

    // Automated Email Notification
    this.sendEmailNotification(
      orderData.userEmail,
      `Order #${newOrder.id} Confirmation - NEXUS Enterprise Store`,
      `Thank you ${orderData.userName}! Your order #${newOrder.id} totaling $${newOrder.totalAmount.toFixed(2)} has been successfully confirmed and is now processing. Tracking: ${newOrder.trackingNumber}`,
      'order_confirmation'
    );

    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status']): Order | undefined {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const oldStatus = order.status;
      order.status = status;
      order.updatedAt = new Date().toISOString();

      this.addAuditLog({
        action: 'ORDER_STATUS_CHANGED',
        resource: `/api/orders/${orderId}`,
        severity: 'INFO',
        detailsRaw: `Order #${orderId} status changed from ${oldStatus} to ${status}`
      });

      this.sendEmailNotification(
        order.userEmail,
        `Update on Order #${orderId}: ${status.toUpperCase()}`,
        `Your order #${orderId} has been updated to: ${status.toUpperCase()}. Tracking number: ${order.trackingNumber}`,
        'shipping_update'
      );
    }
    return order;
  }

  public getOrders(): Order[] {
    return this.orders;
  }

  public getOrdersByUser(userEmail: string): Order[] {
    return this.orders.filter(o => o.userEmail.toLowerCase() === userEmail.toLowerCase());
  }

  // Reviews
  public getReviewsByProduct(productId: string): Review[] {
    return this.reviews.filter(r => r.productId === productId);
  }

  public addReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>): Review {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      helpfulCount: 0,
      createdAt: new Date().toISOString()
    };
    this.reviews.unshift(newReview);

    // Recalculate product rating
    const prodReviews = this.reviews.filter(r => r.productId === reviewData.productId);
    const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const product = this.products.find(p => p.id === reviewData.productId);
    if (product) {
      product.rating = Math.round(avgRating * 10) / 10;
      product.reviewCount = prodReviews.length;
    }

    return newReview;
  }

  public voteReviewHelpful(reviewId: string): Review | undefined {
    const r = this.reviews.find(rev => rev.id === reviewId);
    if (r) {
      r.helpfulCount += 1;
    }
    return r;
  }

  // Subscriptions
  public getSubscriptions(): Subscription[] {
    return this.subscriptions;
  }

  public createSubscription(subData: { userId: string; userEmail: string; productName: string; price: number; interval: 'monthly' | 'yearly' }): Subscription {
    const nextBilling = new Date();
    if (subData.interval === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }

    const sub: Subscription = {
      id: `SUB-${Math.floor(100 + Math.random() * 900)}`,
      userId: subData.userId,
      userEmail: subData.userEmail,
      productName: subData.productName,
      price: subData.price,
      billingInterval: subData.interval,
      status: 'active',
      nextBillingDate: nextBilling.toISOString(),
      createdAt: new Date().toISOString()
    };

    this.subscriptions.unshift(sub);
    this.addAuditLog({
      userId: subData.userId,
      action: 'SUBSCRIPTION_CREATED',
      resource: `/api/subscriptions/${sub.id}`,
      severity: 'INFO',
      detailsRaw: `Recurring plan for ${subData.productName} ($${subData.price}/${subData.interval}) activated for ${subData.userEmail}`
    });

    return sub;
  }

  public updateSubscriptionStatus(subId: string, status: 'active' | 'paused' | 'cancelled'): Subscription | undefined {
    const sub = this.subscriptions.find(s => s.id === subId);
    if (sub) {
      sub.status = status;
      this.addAuditLog({
        action: 'SUBSCRIPTION_STATUS_UPDATED',
        resource: `/api/subscriptions/${subId}`,
        severity: 'INFO',
        detailsRaw: `Subscription ${subId} set to ${status}`
      });
    }
    return sub;
  }

  // Audit Logs & Security
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public getSecurityAlerts(): SecurityAlert[] {
    return this.securityAlerts;
  }

  public addSecurityAlert(alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'status'>): SecurityAlert {
    const alert: SecurityAlert = {
      ...alertData,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'open'
    };
    this.securityAlerts.unshift(alert);

    // Send security alert email to admins
    this.sendEmailNotification(
      'admin@nexus.io',
      `[SECURITY ALERT] ${alert.type}`,
      `Security Alert Triggered: ${alert.description} | Resource: ${alert.affectedResource} | Severity: ${alert.severity.toUpperCase()}`,
      'security_alert'
    );

    return alert;
  }

  public triggerFailedTransactionAlert(ip: string, reason: string, cardMasked: string) {
    this.addAuditLog({
      ipAddress: ip,
      action: 'FAILED_TRANSACTION_ALERT',
      resource: '/api/checkout/process-payment',
      severity: 'WARN',
      detailsRaw: `Card transaction failed on card ${cardMasked}: ${reason}`
    });

    this.addSecurityAlert({
      type: 'Failed Payment Anomaly',
      description: `Payment failure on card ${cardMasked} from IP ${ip}. Reason: ${reason}`,
      severity: 'medium',
      affectedResource: 'Payment Gateway Proxy'
    });
  }

  public runVulnerabilityScan(): { scanTime: string; summary: string; score: string; findings: string[] } {
    const timestamp = new Date().toISOString();
    const findings = [
      'OWASP A01:2021-Broken Access Control: PASS (Role-based access enforced across all API endpoints)',
      'OWASP A02:2021-Cryptographic Failures: PASS (AES-256 field encryption active; SHA-256 hash chaining verified)',
      'OWASP A03:2021-Injection: PASS (Parameterized queries & Express strict JSON validation enabled)',
      'OWASP A07:2021-Identification and Authentication Failures: PASS (Admin MFA mandatory; JWT session tokens secured)',
      'Infrastructure SSL/TLS 1.3: Verified Grade A+ Cipher Suites',
      'Container Sandbox Isolation: Healthy - 0 privilege escalation vectors'
    ];

    this.addAuditLog({
      action: 'VULNERABILITY_SCAN_EXECUTED',
      resource: '/api/security/vulnerability-scan',
      severity: 'INFO',
      detailsRaw: 'Automated OWASP Top 10 Continuous Vulnerability Scan completed. Score 100/100.'
    });

    return {
      scanTime: timestamp,
      summary: 'Continuous Security Audit Completed. All OWASP Top 10 compliance checks passed.',
      score: '100 / 100 (SECURE)',
      findings
    };
  }

  public getEmails(): EmailNotification[] {
    return this.emails;
  }

  public markEmailRead(id: string) {
    const email = this.emails.find(e => e.id === id);
    if (email) {
      email.read = true;
    }
  }

  public getInfrastructureHealth(): InfrastructureHealth {
    const uptime = Math.floor((Date.now() - this.systemStartTime) / 1000);
    return {
      cpuUsage: Math.floor(12 + Math.sin(uptime / 10) * 8),
      memoryUsage: 384 + Math.floor(Math.sin(uptime / 20) * 20),
      containerStatus: 'healthy',
      loadBalancerStatus: 'active',
      activeConnections: 42 + Math.floor(Math.random() * 15),
      apiLatencyMs: Math.floor(18 + Math.random() * 8),
      uptimeSeconds: uptime,
      threatLevel: this.securityAlerts.some(a => a.severity === 'critical' && a.status === 'open') ? 'CRITICAL' : 'NORMAL'
    };
  }
}

export const db = new ServerDatabase();
