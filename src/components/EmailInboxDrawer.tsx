import React from 'react';
import { EmailNotification } from '../types';
import { X, Mail, ShieldAlert, CheckCircle2, Lock, Truck, ShoppingBag, Eye } from 'lucide-react';

interface EmailInboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  emails: EmailNotification[];
  onMarkRead: (id: string) => void;
}

export const EmailInboxDrawer: React.FC<EmailInboxDrawerProps> = ({
  isOpen,
  onClose,
  emails,
  onMarkRead
}) => {
  if (!isOpen) return null;

  const getTemplateIcon = (type: EmailNotification['templateType']) => {
    switch (type) {
      case 'security_alert':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'mfa_code':
        return <Lock className="w-4 h-4 text-indigo-500" />;
      case 'shipping_update':
        return <Truck className="w-4 h-4 text-cyan-500" />;
      case 'order_confirmation':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      default:
        return <Mail className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between text-xs">

          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Email & Alert Dispatch Center</h2>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {emails.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Mail className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <span>No emails in system outbox.</span>
              </div>
            ) : (
              emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => onMarkRead(email.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    !email.read
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                      {getTemplateIcon(email.templateType)}
                      <span className="line-clamp-1">{email.subject}</span>
                    </div>
                    {!email.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                    {email.body}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between text-[10px] text-slate-400">
                    <span>To: {email.to}</span>
                    <span>{new Date(email.sentAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center text-[11px] text-slate-400">
            <span>Automated Email Dispatcher Engine • Status: Active</span>
          </div>

        </div>
      </div>
    </div>
  );
};
