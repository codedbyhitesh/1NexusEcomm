import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { api } from '../services/api';
import { X, Star, ThumbsUp, CheckCircle, ShoppingCart, ShieldCheck, AlertTriangle, MessageSquarePlus } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // New review form
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setLoadingReviews(true);
      api.getReviews(product.id)
        .then(setReviews)
        .finally(() => setLoadingReviews(false));
    }
  }, [product]);

  const handleHelpful = async (reviewId: string) => {
    try {
      const updated = await api.voteHelpful(reviewId);
      setReviews(reviews.map(r => r.id === reviewId ? updated : r));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const newReview = await api.createReview({
        productId: product.id,
        userId: 'usr-cust-new',
        userName: reviewerName.trim(),
        rating,
        comment: comment.trim(),
        verifiedPurchase: true
      });
      setReviews([newReview, ...reviews]);
      setComment('');
      setReviewerName('');
      setRating(5);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 dark:border-slate-800">
          
          {/* Image */}
          <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.isSubscription && (
              <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 rounded-md shadow-md">
                Recurring Service
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {product.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                {product.name}
              </h2>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating) ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{product.rating}</span>
                <span className="text-xs text-slate-400">({reviews.length} verified reviews)</span>
              </div>

              {/* Price & Stock */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Real-time Inventory Bar */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Live Inventory Level:</span>
                  <span className={isOutOfStock ? 'text-rose-500' : product.stock <= product.lowStockThreshold ? 'text-amber-500 font-bold' : 'text-emerald-500'}>
                    {isOutOfStock ? 'OUT OF STOCK' : `${product.stock} Units In Stock`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isOutOfStock ? 'bg-rose-500' : product.stock <= product.lowStockThreshold ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, (product.stock / 25) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quantity Picker & Add To Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-slate-900 dark:text-slate-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                disabled={isOutOfStock}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
                  isOutOfStock
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add {quantity} to Shopping Cart - ${(product.price * quantity).toFixed(2)}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Tabs & Content */}
        <div className="p-6">
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Description & Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <span>Customer Reviews</span>
              <span className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                {reviews.length}
              </span>
            </button>
          </div>

          <div className="pt-6">
            {activeTab === 'details' ? (
              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>{product.description}</p>
                {product.features && (
                  <div className="pt-2">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Key Features & Technical Specs:</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Submit Review Form */}
                <form onSubmit={handleAddReview} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <MessageSquarePlus className="w-4 h-4 text-indigo-500" />
                    <span>Write a Verified Customer Review</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="Your Name (e.g., Sarah J.)"
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Rating:</span>
                      <div className="flex text-amber-400 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            onClick={() => setRating(s)}
                            className={`w-5 h-5 ${s <= rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
                  >
                    {submittingReview ? 'Publishing...' : 'Post Verified Review'}
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No reviews submitted yet. Be the first!</p>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold rounded text-[10px] flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Verified Buyer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                            />
                          ))}
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>

                        <div className="pt-2 flex items-center justify-end">
                          <button
                            onClick={() => handleHelpful(rev.id)}
                            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({rev.helpfulCount})</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
