import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Star, ShieldCheck, Zap, Layers, RefreshCw, AlertTriangle, ArrowUpDown, Filter } from 'lucide-react';

interface StorefrontProps {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  inStockOnly: boolean;
  onToggleInStockOnly: () => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onQuickView,
  sortBy,
  onSortChange,
  inStockOnly,
  onToggleInStockOnly,
  priceRange,
  onPriceRangeChange
}) => {
  return (
    <div className="space-y-8 pb-16">

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Gen Enterprise E-Commerce Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-100 leading-tight">
            Seamless Shopping with <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Real-Time Stock & AES-256 Security
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Explore physical hardware, luxury products, and recurring SaaS subscriptions with instant inventory tracking, persistent guest cart synchronization, and encrypted card processing.
          </p>

          {/* Quick Stats Grid */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Real-Time Inventory</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Guest Cart Bridge</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>MFA Admin Control</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Controls & Categories Bar */}
      <section className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* In Stock Only Checkbox */}
            <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={onToggleInStockOnly}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>In Stock Only</span>
            </label>

            {/* Price Max Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Max Price:</span>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={priceRange[1]}
                onChange={(e) => onPriceRangeChange([priceRange[0], parseFloat(e.target.value)])}
                className="w-24 accent-indigo-600 cursor-pointer"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">${priceRange[1]}</span>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

        </div>
      </section>

      {/* Product Catalog Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No products found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
            const isOutOfStock = product.stock === 0;

            return (
              <div
                key={product.id}
                className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                {/* Product Image & Badges */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onQuickView(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badges Container */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    {product.isSubscription && (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-indigo-600 rounded-md shadow-sm">
                        Subscription
                      </span>
                    )}

                    {isLowStock && (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200 dark:bg-amber-900 dark:text-amber-100 rounded-md shadow-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Only {product.stock} Left!
                      </span>
                    )}

                    {isOutOfStock && (
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-900 bg-rose-200 dark:bg-rose-900 dark:text-rose-100 rounded-md shadow-sm">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-md border border-slate-200/50 dark:border-slate-700/50">
                    {product.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Rating & Review Count */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 mb-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{product.rating}</span>
                      <span className="text-slate-400 text-[11px]">({product.reviewCount} reviews)</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onQuickView(product)}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1 transition-colors"
                    >
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Footer: Price & Add to Cart */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs font-medium text-slate-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.isSubscription && (
                        <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          billed {product.subscriptionInterval}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onQuickView(product)}
                        className="p-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Quick View Details & Reviews"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                          isOutOfStock
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
