import React, { useState } from "react";
import { Star, MessageSquare, ThumbsUp, TrendingUp, Award, Send } from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  product?: string;
  verified: boolean;
}

interface ReviewMachineProps {
  reviews: Review[];
  onAddReview?: (review: Omit<Review, 'id' | 'date' | 'verified'>) => void;
  onLikeReview?: (reviewId: string) => void;
}

export default function ReviewMachine({ reviews, onAddReview }: ReviewMachineProps) {
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ customerName: "", rating: 5, comment: "", product: "" });
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const filteredReviews = filterRating ? reviews.filter(r => r.rating === filterRating) : reviews;

  const handleSubmit = () => {
    if (!newReview.customerName || !newReview.comment) return;
    onAddReview?.(newReview);
    setNewReview({ customerName: "", rating: 5, comment: "", product: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-art-muted flex items-center justify-center gap-2">
          <Award className="w-6 h-6 text-art-border" /> Opiniones de Clientes
        </h2>
        <p className="text-sm text-art-muted">Lo que dicen nuestros clientes sobre nosotros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-art-accent text-white rounded-xl p-5 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-90" />
          <div className="text-3xl font-bold">{avgRating}</div>
          <div className="text-xs opacity-90">Calificación Promedio</div>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(parseFloat(avgRating)) ? 'fill-art-accent text-art-accent' : 'text-white/30'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white border border-art-border rounded-xl p-5 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-art-border" />
          <div className="text-3xl font-bold text-art-accent">{reviews.length}</div>
          <div className="text-xs text-art-muted">Total de Reseñas</div>
        </div>

        <div className="bg-white border border-art-border rounded-xl p-5 text-center">
          <ThumbsUp className="w-8 h-8 mx-auto mb-2 text-art-border" />
          <div className="text-3xl font-bold text-art-accent">
            {reviews.filter(r => r.rating >= 4).length}
          </div>
          <div className="text-xs text-art-muted">Reseñas Positivas</div>
        </div>
      </div>

      <div className="bg-white border border-art-border rounded-xl p-5 space-y-3">
        <h3 className="font-bold text-sm text-art-muted">Distribución de Calificaciones</h3>
        {ratingDistribution.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3">
            <button
              onClick={() => setFilterRating(filterRating === rating ? null : rating)}
              className={`flex items-center gap-1 text-xs font-bold min-w-[60px] ${filterRating === rating ? 'text-art-accent underline' : 'text-art-muted'}`}
            >
              {rating} <Star className="w-3 h-3 fill-current" />
            </button>
            <div className="flex-1 h-2 bg-art-panel rounded-full overflow-hidden">
              <div className="h-full bg-art-accent rounded-full transition-all" style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-xs text-art-muted min-w-[30px] text-right">{count}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full bg-art-accent text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <Send className="w-4 h-4" />
        Dejar mi Opinión
      </button>

      {showForm && (
        <div className="bg-white border border-art-border rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-art-muted">Comparte tu Experiencia</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-art-muted">Tu Nombre</label>
              <input
                type="text"
                value={newReview.customerName}
                onChange={(e) => setNewReview({ ...newReview, customerName: e.target.value })}
                placeholder="Ej: María García"
                className="w-full border border-art-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-art-accent"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-art-muted">Producto</label>
              <input
                type="text"
                value={newReview.product}
                onChange={(e) => setNewReview({ ...newReview, product: e.target.value })}
                placeholder="Ej: ChocoManjar"
                className="w-full border border-art-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-art-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-art-muted">Calificación</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} onClick={() => setNewReview({ ...newReview, rating: r })} className="cursor-pointer">
                  <Star className={`w-8 h-8 transition-colors ${r <= newReview.rating ? 'fill-art-accent text-art-accent' : 'text-art-border hover:text-art-accent'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-art-muted">Tu Opinión</label>
            <textarea
              rows={3}
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Cuéntanos sobre tu experiencia..."
              className="w-full border border-art-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-art-accent resize-y"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-art-muted hover:bg-art-panel rounded-lg">Cancelar</button>
            <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-art-accent text-white rounded-lg hover:bg-art-accent-hover">Enviar Opinión</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <p className="text-center text-art-muted py-8">No hay reseñas{filterRating ? ` con ${filterRating} estrellas` : ''}.</p>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className="bg-white border border-art-border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-art-accent flex items-center justify-center text-white font-bold text-sm">{review.customerName.charAt(0).toUpperCase()}</div>
                  <div>
                    <span className="font-bold text-sm text-art-muted">{review.customerName}</span>
                    {review.product && <span className="text-[10px] text-art-muted ml-2">• {review.product}</span>}
                    <div className="flex items-center gap-1 mt-0.5">{[1,2,3,4,5].map(s => (<Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-art-accent text-art-accent' : 'text-art-border'}`} />))}</div>
                  </div>
                </div>
                <span className="text-[10px] text-art-muted">{review.date}</span>
              </div>
              <p className="text-sm text-art-muted leading-relaxed">{review.comment}</p>
              {review.verified && <span className="text-[9px] text-art-accent font-bold">✓ Compra Verificada</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
