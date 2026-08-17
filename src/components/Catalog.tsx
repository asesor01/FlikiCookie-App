import React, { useState, useEffect } from "react";
import { MenuItem } from "../types";
import { INITIAL_MENU } from "../data";
import { Search, ShoppingBag, Plus, Info, Clock, AlertTriangle, Sparkles, Gift, ArrowRight } from "lucide-react";
// @ts-ignore
import promoBannerImg from "../assets/images/flikicookie_promo_banner_1784665364256.jpg";

interface CatalogProps {
  onAddToCart: (item: MenuItem | { isCustom: boolean; name: string; price: number }) => void;
  menuItems: MenuItem[]; initialCategory?: string;
}

export default function Catalog({ onAddToCart, menuItems, initialCategory }: CatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("todos"); const [customCats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("flikicookie_categories") || "[]"); } catch { return []; } });
  const [searchQuery, setSearchQuery] = useState(""); const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const categories = [
    { id: "todos", label: "✨ Todo el Menú" },
    { id: "rellenas", label: "🍪 Galletas Rellenas" },
    { id: "especiales", label: "✨ Especialidades de Autor" },
    { id: "clasicas", label: "⭐ Galletas Clásicas" },
    { id: "bebidas", label: "☕ Bebidas & Cafetería" },
    { id: "temporada", label: "🎄 Especiales & Ofertas de Temporada" }
  ];

  useEffect(() => { if (initialCategory) { const all = [...categories, ...customCats.map((c) => ({ id: c, label: "🏷️ " + c }))]; const found = all.find((c) => c.id.trim() === initialCategory.trim()); setActiveCategory(found ? found.id : initialCategory); } }, [initialCategory]); const filteredItems = menuItems.filter(item => {
    let matchesCategory = false;
    if (activeCategory === "todos") {
      matchesCategory = true;
    } else if (activeCategory === "temporada") {
      matchesCategory = !!item.seasonalTag || !!item.promoPrice;
    } else {
      matchesCategory = (item.category || "").trim() === activeCategory.trim();
    }
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(price);
  };

  return (
    <div className="space-y-6">
      {selectedItem && (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedItem(null)}>
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-art-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="relative h-56 bg-art-panel">
            {(selectedItem.image.includes(".") || selectedItem.image.includes("/")) ? (
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">🍪</div>
            )}
            <button onClick={() => setSelectedItem(null)} className="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 font-bold cursor-pointer">✕</button>
          </div>
          <div className="p-6 space-y-3">
            <h3 className="font-serif font-bold text-xl text-art-text">{selectedItem.name}</h3>
            <p className="text-sm text-art-muted leading-relaxed">{(selectedItem as any).longDescription || selectedItem.description}</p>
            {selectedItem.allergens && selectedItem.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedItem.allergens.map((a, i) => (
                  <span key={i} className="bg-art-panel border border-art-border/30 text-art-text text-[11px] px-2 py-0.5 rounded font-bold">{a}</span>
                ))}
              </div>
            )}
            {(selectedItem as any).videoUrl && (
              <video controls playsInline className="w-full rounded-xl border border-art-border" src={(selectedItem as any).videoUrl} />
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="font-serif font-bold text-2xl text-art-accent">{formatPrice(selectedItem.promoPrice ?? selectedItem.price)}</span>
              <button onClick={(e) => { e.stopPropagation(); onAddToCart(selectedItem); setSelectedItem(null); }} className="bg-art-accent hover:bg-art-accent-hover text-white px-4 py-2 rounded-lg text-sm font-bold cursor-pointer">+ Agregar a la caja</button>
            </div>
          </div>
        </div>
      </div>
    )}
    {/* SEASONAL PROMOTIONAL BANNER */}
      <div 
          className="relative rounded-2xl overflow-hidden border border-art-border shadow-md bg-white text-art-text group"
        id="catalog_promo_banner"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          {/* Banner Text & Offer Callout */}
          <div className="p-6 md:p-8 md:col-span-7 space-y-3 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-art-accent text-art-bg text-[12px] font-serif font-bold rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-art-accent-10 animate-pulse" />
              <span>OFERTA EXCLUSIVA DE TEMPORADA</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-art-text leading-tight">
              Edición Limitada <span className="text-art-muted italic font-normal">Flikicookie</span>
            </h2>

            <p className="text-[14px] md:text-[15px] text-art-muted leading-relaxed max-w-xl">
                Llévate nuestras galletas rellenas de Nutella artesanal, Red Velvet y postres de autor con <strong className="text-art-text">20% OFF</strong> por tiempo limitado. horneadas diariamente con insumos 100% orgánicos de Cusco.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveCategory("temporada")}
                  className="bg-art-accent hover:bg-art-accent-hover active:scale-95 text-white font-serif font-bold text-[14px] px-5 py-2.5 rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
                id="btn_banner_explore_seasonal"
              >
                <Gift className="w-4 h-4" /> Ver Especiales de Temporada <ArrowRight className="w-4 h-4" />
              </button>

                <span className="text-[13px] font-mono text-art-text font-bold bg-art-border-10 px-3 py-1.5 rounded-md border border-art-border">
                 🏷️ Código: <strong>TEMPORADA20</strong>
              </span>
            </div>
          </div>

          {/* Banner Image Display */}
          <div className="md:col-span-5 h-48 md:h-full min-h-[200px] relative overflow-hidden">
            <img
              src={promoBannerImg}
              alt="Promoción Especial Flikicookie"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-art-card via-transparent to-transparent opacity-80 md:opacity-90"></div>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {[...categories, ...customCats.map((c) => ({ id: c, label: "🏷️ " + c }))].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-[14px] font-serif font-bold transition-all duration-200 shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-art-accent text-white font-bold shadow-sm"
                    : "bg-white text-art-text border border-art-border hover:bg-art-panel"
              }`}
              id={`cat_filter_${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-art-brown" />
            <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar delicias..."
            className="w-full bg-white border border-art-border text-art-text text-[15px] pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-art-accent placeholder:text-art-muted"
            id="catalog_search_input"
          />
        </div>
      </div>

      {/* Catalog Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)} className="group bg-white border border-art-border rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
              id={`catalog_card_${item.id}`}
            >
              {/* Product Visual Representative */}
              <div className="h-44 bg-art-panel relative flex items-center justify-center border-b border-art-border overflow-hidden">
                {/* Visual Icon Badge / Real Image */}
                {item.image.includes(".") || item.image.includes("/") ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-6xl transform group-hover:scale-105 group-hover:rotate-1 transition-transform duration-300 select-none">
                    {getCategoryEmoji(item.image)}
                  </div>
                )}

                {/* Preparation Time Badge */}
                

                {/* Seasonal Tag Badge */}
                {item.seasonalTag && (
                  <div className="absolute bottom-3 left-3 bg-art-border text-art-bg border border-art-border px-2.5 py-1 rounded text-[11px] font-extrabold flex items-center gap-1 shadow-xs z-10 uppercase tracking-wide">
                    {item.seasonalTag === "Navidad" ? "🎄" : 
                     item.seasonalTag === "Día del Padre" ? "👔" : 
                     item.seasonalTag === "Graduaciones" ? "🎓" : "✨"} {item.seasonalTag}
                  </div>
                )}

                {/* Category Badge */}
                <span className="absolute top-3 right-3 text-[11px] font-bold uppercase bg-art-border text-art-bg px-2 py-0.5 rounded tracking-wider z-10">
                  {item.category}
                </span>
            {item.videoUrl && (<span className="absolute top-3 left-3 text-[11px] font-bold uppercase bg-art-accent text-white px-2 py-0.5 rounded tracking-wider z-10">🎬 Video</span>)}
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-art-text text-[18px] tracking-tight group-hover:text-art-accent transition-colors flex items-center gap-1.5">
                    {item.name}
                  </h4>
                  <p className="text-art-muted text-[14px] leading-relaxed min-h-[40px] font-medium">
                    {item.description}
                  </p>
                </div>

                {/* Allergens & Pricing section */}
                <div className="mt-4 pt-3 border-t border-art-border flex flex-col gap-2.5">
                  {/* Wholesale Pricing Info */}
                  {item.wholesalePrice !== undefined && item.wholesaleMinQty !== undefined && (
                    <div className="text-[12px] bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 rounded-lg font-medium leading-normal flex items-start gap-1">
                      <span className="text-emerald-600 mt-0.5">🏷️</span>
                      <span>
                        <strong>Precio por Mayor:</strong> {formatPrice(item.wholesalePrice)} desde {item.wholesaleMinQty} unidades.
                      </span>
                    </div>
                  )}

                  {/* Allergens List */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[12px] font-bold text-red-800 flex items-center gap-0.5 mr-1 bg-red-50 px-1.5 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-red-700" /> Contiene:
                      </span>
                      {item.allergens.map((allergen, idx) => (
                        <span
                          key={idx}
                            className="bg-art-panel text-art-text text-[12px] px-2 py-0.5 rounded font-bold border border-art-border/20"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pricing and Action button */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-art-muted font-bold uppercase tracking-wider">
                        {item.promoPrice !== undefined ? "🔥 Oferta" : "Precio"}
                      </span>
                      {item.promoPrice !== undefined ? (
                        <div className="flex flex-col">
                          <span className="text-[13px] text-art-muted line-through leading-none font-semibold">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[20px] font-serif font-bold text-art-accent tracking-tight leading-tight">
                            {formatPrice(item.promoPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[20px] font-serif font-bold text-art-text tracking-tight">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                      className="bg-art-accent hover:bg-art-accent active:scale-95 text-white p-2 px-4 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 border border-art-text"
                      id={`btn_add_to_cart_${item.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-art-border rounded-lg p-12 text-center max-w-md mx-auto space-y-3">
          <div className="text-4xl animate-pulse">🥐🧁💔</div>
          <h4 className="font-serif font-bold text-art-text text-base">No encontramos delicias coincidentes</h4>
          <p className="text-art-muted text-xs leading-relaxed">
            Intenta cambiar el término de búsqueda o selecciona otra categoría en el menú de filtros superior.
          </p>
        </div>
      )}
    </div>
  );
}

// Map helper to output cute graphic emojis representing catalog baking items
function getCategoryEmoji(imgKey: string) {
  switch (imgKey) {
    case "chocolate_cake": return "🎂";
    case "red_velvet": return "🍰";
    case "croissant": return "🥐";
    case "macarons": return "🧁";
    case "apple_tart": return "🥧";
    case "cinnamon_roll": return "🥮";
    case "cookie": return "🍪";
    default: return "🍞";
  }
}
