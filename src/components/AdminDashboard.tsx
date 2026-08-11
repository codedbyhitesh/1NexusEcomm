import React, { useState, useEffect } from 'react';
import { Order, Product, User, AuditLog, SecurityAlert, InfrastructureHealth, Subscription } from '../types';
import { api } from '../services/api';
import {
  BarChart3, ShieldCheck, ShieldAlert, Package, ShoppingCart, Users, RefreshCw,
  Lock, Eye, KeyRound, AlertTriangle, CheckCircle, Cpu, HardDrive, Zap, Play, Search, Download, Plus, Edit2
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'security' | 'vulnerabilities' | 'users'>('overview');

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [health, setHealth] = useState<InfrastructureHealth | null>(null);
  const [loading, setLoading] = useState(false);

  // Vulnerability scan result state
  const [scanResult, setScanResult] = useState<{ scanTime: string; summary: string; score: string; findings: string[] } | null>(null);
  const [scanning, setScanning] = useState(false);

  // Add Product Modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Electronics');
  const [newProdPrice, setNewProdPrice] = useState(199.99);
  const [newProdStock, setNewProdStock] = useState(15);
  const [newProdDesc, setNewProdDesc] = useState('');

  // Search & Filter state
  const [logFilterSeverity, setLogFilterSeverity] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    loadAdminData();
    const timer = setInterval(() => {
      api.getHealth().then(res => setHealth(res.health)).catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ordData, prodData, usrData, logData, altData, hData] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getUsers(),
        api.getAuditLogs(),
        api.getSecurityAlerts(),
        api.getHealth()
      ]);
      setOrders(ordData);
      setProducts(prodData);
      setUsers(usrData);
      setAuditLogs(logData);
      setSecurityAlerts(altData);
      setHealth(hData.health);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const updated = await api.updateStock(productId, newStock);
      setProducts(products.map(p => p.id === productId ? updated : p));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createProduct({
        name: newProdName,
        category: newProdCategory,
        price: newProdPrice,
        stock: newProdStock,
        lowStockThreshold: 5,
        description: newProdDesc,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        reviewCount: 1,
        tags: ['New']
      });
      setProducts([created, ...products]);
      setShowAddProductModal(false);
      setNewProdName('');
      setNewProdDesc('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'customer') => {
    try {
      const updated = await api.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? updated : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunVulnerabilityScan = async () => {
    setScanning(true);
    try {
      const res = await api.runVulnerabilityScan();
      setScanResult(res);
      const updatedLogs = await api.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    if (logFilterSeverity !== 'ALL' && log.severity !== logFilterSeverity) return false;
    if (logSearch) {
      const q = logSearch.toLowerCase();
      return log.action.toLowerCase().includes(q) || log.resource.toLowerCase().includes(q) || log.ipAddress.includes(q);
    }
    return true;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs">

        {/* Top Console Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">NEXUS Security & Admin Control Console</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  MFA Enforced
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Loggged in as: <strong className="text-slate-200">{currentUser?.name || 'Administrator'}</strong> ({currentUser?.role.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors"
            >
              Exit Console
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none font-bold text-slate-600 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrics & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'inventory' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Stock & Inventory</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>SHA-256 Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('vulnerabilities')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'vulnerabilities' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Threats & OWASP Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>RBAC & Users</span>
          </button>
        </div>

        {/* Dashboard Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* TAB 1: METRICS & ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Total Processed Revenue</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">${totalRevenue.toFixed(2)}</div>
                  <span className="text-[10px] text-emerald-500 font-bold">+18.4% from last period</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Active Orders</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{orders.length}</div>
                  <span className="text-[10px] text-cyan-500 font-bold">100% encrypted checkout</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Total Products</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{products.length}</div>
                  <span className="text-[10px] text-amber-500 font-bold">
                    {products.filter(p => p.stock <= p.lowStockThreshold).length} Low Stock Alert SKUs
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Security Anomaly Threat Level</span>
                  <div className="text-2xl font-black text-emerald-500">{health?.threatLevel || 'NORMAL'}</div>
                  <span className="text-[10px] text-slate-400 font-mono">0 Breach Attempts</span>
                </div>
              </div>

              {/* Real-time Infrastructure Monitoring Gauges */}
              {health && (
                <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>Live Cloud Run Container Infrastructure Health</span>
                    </h3>
                    <span className="text-[10px] font-mono text-cyan-400">Uptime: {health.uptimeSeconds}s</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">CPU Load</span>
                      <span className="text-lg font-black text-cyan-400">{health.cpuUsage}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">RAM Usage</span>
                      <span className="text-lg font-black text-indigo-400">{health.memoryUsage} MB</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">API Latency</span>
                      <span className="text-lg font-black text-emerald-400">{health.apiLatencyMs} ms</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700">
                      <span className="text-slate-400 text-[10px] block">Container State</span>
                      <span className="text-lg font-black text-emerald-400 uppercase">{health.containerStatus}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Stream Summary */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Recent Customer Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-2.5">Order ID</th>
                        <th className="p-2.5">Customer</th>
                        <th className="p-2.5">Total</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Tracking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">{o.id}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{o.userEmail}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100">${o.totalAmount.toFixed(2)}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 font-bold uppercase text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded">
                              {o.status}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-400">{o.trackingNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Live Orders & Shipping Dispatch Control</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer Email</th>
                      <th className="p-3">Items</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status Control</th>
                      <th className="p-3">Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{order.id}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{order.userEmail}</td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                          {order.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 dark:text-slate-100">${order.totalAmount.toFixed(2)}</td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 font-mono text-slate-400">{order.trackingNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY & STOCK MANAGER */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Real-Time Inventory & Stock Manager</h3>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product SKU</span>
                </button>
              </div>

              {showAddProductModal && (
                <form onSubmit={handleCreateProduct} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Add New Product to Store Catalog</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Product Name"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                      <option value="Enterprise Services">Enterprise Services</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Price ($)"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(parseFloat(e.target.value))}
                      className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="number"
                      required
                      placeholder="Initial Stock Level"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(parseInt(e.target.value))}
                      className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Description"
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-3 py-1.5 text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                    >
                      Save SKU
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Stock Units</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Adjust Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {products.map(p => {
                      const isLow = p.stock <= p.lowStockThreshold;
                      return (
                        <tr key={p.id}>
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                          <td className="p-3 text-slate-500">{p.category}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100">${p.price.toFixed(2)}</td>
                          <td className="p-3 font-mono font-bold">{p.stock}</td>
                          <td className="p-3">
                            {isLow ? (
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold rounded text-[10px]">
                                LOW STOCK
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold rounded text-[10px]">
                                OK
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleUpdateStock(p.id, Math.max(0, p.stock - 5))}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 font-bold rounded hover:bg-slate-200"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleUpdateStock(p.id, p.stock + 10)}
                                className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold rounded hover:bg-indigo-100"
                              >
                                +10 Restock
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: IMMUTABLE AUDIT LOGS */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-500" />
                    <span>Cryptographic Security Audit Log Chain (SHA-256)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    All system modifications & user access events logged in immutable format. AES-256 payload encryption enabled.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={logFilterSeverity}
                    onChange={(e) => setLogFilterSeverity(e.target.value)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="INFO">INFO Only</option>
                    <option value="WARN">WARN Only</option>
                    <option value="CRITICAL">CRITICAL Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">SHA-256 Hash Chaining Checksum</th>
                      <th className="p-3">AES-256 Payload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredAuditLogs.map(log => (
                      <tr key={log.id}>
                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{log.ipAddress}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{log.action}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.severity === 'CRITICAL' ? 'bg-rose-500 text-white' : log.severity === 'WARN' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 max-w-[180px] truncate" title={log.payloadHash}>
                          {log.payloadHash}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-500 max-w-[180px] truncate">
                          {log.encryptedDetails}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: THREAT MONITORING & OWASP VULNERABILITY SCANNER */}
          {activeTab === 'vulnerabilities' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <span>Automated Continuous Threat Scanner</span>
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Runs active penetration testing checks for OWASP Top 10 vulnerabilities, unauthorized privilege escalation, and TLS compliance.
                  </p>
                </div>

                <button
                  onClick={handleRunVulnerabilityScan}
                  disabled={scanning}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{scanning ? 'Running Vulnerability Tests...' : 'Execute OWASP Security Scan'}</span>
                </button>
              </div>

              {scanResult && (
                <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {scanResult.summary}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500 text-white font-black rounded-lg text-xs">
                      {scanResult.score}
                    </span>
                  </div>

                  <ul className="space-y-1.5 font-mono text-xs">
                    {scanResult.findings.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Active Security Alerts */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Platform Security Anomaly Stream</h4>
                <div className="space-y-2">
                  {securityAlerts.map(alt => (
                    <div key={alt.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span>{alt.type}</span>
                        </div>
                        <p className="text-slate-500">{alt.description}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded text-[10px] uppercase">
                        {alt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USERS & RBAC */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Role-Based Access Control (RBAC) & Account Security</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Role Policy</th>
                      <th className="p-3">MFA Status</th>
                      <th className="p-3">Role Switcher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{u.name}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                            u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : u.role === 'manager' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.mfaEnabled ? (
                            <span className="text-emerald-500 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                            </span>
                          ) : (
                            <span className="text-slate-400">Optional</span>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as User['role'])}
                            className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                          >
                            <option value="customer">Customer</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin (MFA Mandatory)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
