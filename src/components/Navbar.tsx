import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Sun, Moon, Shield, Bell, User as UserIcon, Lock, Sparkles, SlidersHorizontal } from 'lucide-react';
import { User, EmailNotification } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenEmailInbox: () => void;
  onOpenAdmin: () => void;
  currentUser: User | null;
  unreadEmailCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  categories: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenAuth,
  onOpenEmailInbox,
  onOpenAdmin,
  currentUser,
  unreadEmailCount,
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                NEXUS
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                Enterprise Store
              </span>
            </div>
          </div>

          {/* Search Bar & Category Select */}
          <div className="flex-1 max-w-xl mx-2 hidden md:flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products, SKUs, subscriptions..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-slate-100 transition-all placeholder:text-slate-400"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => onCategorySelect(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Email / Security Notifications Inbox */}
            <button
              onClick={onOpenEmailInbox}
              title="Email Notifications & Security Alerts"
              className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadEmailCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadEmailCount}
                </span>
              )}
            </button>

            {/* Cart Drawer Button */}
            <button
              onClick={onOpenCart}
              title="View Cart"
              className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-bold rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Dashboard Quick Access Button (If admin or manager) */}
            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Account / User Menu */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 text-xs font-bold">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[110px] truncate">
                  {currentUser ? currentUser.name : 'Sign In'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {currentUser ? currentUser.role : 'Guest User'}
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search store catalog..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-slate-100"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
