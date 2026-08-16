import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone, Mail } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQPageProps {
  faqItems: FAQItem[];
  isEditing?: boolean;
  onUpdate?: (items: FAQItem[]) => void;
}

export default function FAQPage({ faqItems, isEditing = false, onUpdate }: FAQPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("todas");

  const categories = ["todas", ...new Set(faqItems.map(item => item.category))];
  const filteredItems = activeCategory === "todas" 
    ? faqItems 
    : faqItems.filter(item => item.category === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSaveEdit = (item: FAQItem) => {
    if (onUpdate) {
      onUpdate(faqItems.map(i => i.id === item.id ? item : i));
    }
    setEditingItem(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3.5xl font-serif font-bold text-art-text">
          Preguntas Frecuentes
        </h1>
        <p className="text-[16px] text-art-muted font-medium max-w-xl mx-auto">
          Encuentra respuestas a las consultas más comunes sobre nuestros productos, pedidos y servicios.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-[14px] font-bold transition-all cursor-pointer capitalize ${
              activeCategory === cat
                ? "bg-art-accent text-white shadow-md"
                : "bg-white text-art-text border border-art-border hover:bg-art-panel"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className="bg-white border border-art-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Question Header */}
            <button
              onClick={() => toggleExpand(item.id)}
              className="w-full px-5 py-4.5 flex items-center justify-between text-left hover:bg-art-panel transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-art-accent shrink-0" />
                <span className="font-bold text-base text-art-text">{item.question}</span>
              </div>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingItem(item);
                    }}
                    className="text-art-accent hover:text-art-accent-hover text-[13px] underline font-bold"
                  >
                    Editar
                  </button>
                )}
                {expandedId === item.id ? (
                  <ChevronUp className="w-5 h-5 text-art-accent" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-art-muted" />
                )}
              </div>
            </button>

            {/* Answer */}
            {expandedId === item.id && (
              <div className="px-5 pb-5 border-t border-art-border">
                <p className="text-[15px] text-art-muted font-medium leading-relaxed mt-3.5 whitespace-pre-line">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-art-accent to-art-border rounded-2xl p-8 text-white space-y-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <h3 className="font-serif font-bold text-xl">¿No encontraste tu respuesta?</h3>
        <p className="text-white text-sm font-medium">Nuestro equipo está listo para ayudarte en tiempo real.</p>
        <div className="flex flex-wrap gap-4 pt-1">
            <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-xs px-4.5 py-2.5 rounded-xl border border-white/20">
            <Phone className="w-4.5 h-4.5" />
            <span className="text-sm font-bold">+51 984 123 456</span>
          </div>
          <a
            href="https://wa.me/51970442173"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-art-accent hover:bg-art-accent-hover px-5 py-2.5 rounded-full shadow-md font-bold transition-all hover:scale-105 text-art-bg"
          >
            <MessageCircle className="w-4.5 h-4.5 text-art-bg" />
            <span className="text-sm">WhatsApp</span>
          </a>
          <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-xs px-4.5 py-2.5 rounded-xl border border-white/20">
            <Mail className="w-4.5 h-4.5" />
            <span className="text-sm font-bold">hola@flikicookie.com</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-lg text-art-text">Editar Pregunta</h3>
            <div className="space-y-3">
              <div>
                  <label className="text-[10px] uppercase font-bold text-art-muted">Pregunta</label>
                <input
                  type="text"
                  value={editingItem.question}
                  onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                  className="w-full border border-art-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-art-accent"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-art-muted">Respuesta</label>
                <textarea
                  rows={4}
                  value={editingItem.answer}
                  onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                  className="w-full border border-art-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-art-accent resize-y"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-art-muted">Categoría</label>
                <input
                  type="text"
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full border border-art-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-art-accent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-sm text-art-muted hover:bg-art-panel rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveEdit(editingItem)}
                className="px-4 py-2 text-sm bg-art-accent text-white rounded-lg hover:bg-art-accent-hover"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
