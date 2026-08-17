import React, { useState, useEffect } from "react";
import { Cake, Cookie, Coffee, Heart, Star, MapPin, Phone, Instagram, MessageCircle, ChevronRight, Menu, X, Clock, Award, Truck, Sparkles, ArrowRight } from "lucide-react";

const MENU_HIGHLIGHTS = [
  { name: "Tortas Personalizadas", description: "Diseños únicos para tus momentos especiales", icon: Cake, priceDesde: "S/. 85", target: "designer" },
  { name: "Galletas Artesanales", description: "Deliciosas galletas con sabores irresistibles", icon: Cookie, priceDesde: "S/. 3", target: "catalog:rellenas" },
  { name: "Pasteles Creativos", description: "Obras de arte comestibles que sorprenden", icon: Sparkles, priceDesde: "S/. 120", target: "catalog:especiales" },
  { name: "Café & Bebidas", description: "Acompaña tus dulces con nuestra selección", icon: Coffee, priceDesde: "S/. 8", target: "catalog:bebidas" },
];

type Tab = "landing" | "designer" | "catalog" | "track" | "admin" | "faq" | "reviews";

export default function LandingPage({ onNavigate }: { onNavigate?: (tab: Tab, category?: string) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const scrollToSection = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setIsMenuOpen(false); };
  const go = (tab: Tab, category?: string) => { if (onNavigate) onNavigate(tab, category); };

  return (
    <div className="min-h-screen bg-art-bg">
      <nav className={`relative z-30 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 md:hidden">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-art-border">
                <img src="/src/assets/images/Emblema%20Flikicookie.png" alt="Flikicookie" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-serif italic font-bold text-art-text">FlikiCookie</h1>
                <p className="text-[10px] text-art-muted tracking-wider">ARTISAN BAKERY</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {[{label:"Inicio",id:"hero"},{label:"Nosotros",id:"about"},{label:"Menú",id:"menu"},{label:"Opiniones",id:"testimonials"},{label:"Contacto",id:"contact"}].map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-[15px] font-semibold text-art-muted hover:text-art-accent transition-colors cursor-pointer">{item.label}</button>
              ))}
              <button onClick={() => go("catalog")} className="bg-art-accent hover:bg-art-accent-hover text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer">
                <Cookie className="w-4 h-4" /> Catálogo & Menú
              </button>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-art-border-10 transition-colors">
              {isMenuOpen ? <X className="w-6 h-6 text-art-muted" /> : <Menu className="w-6 h-6 text-art-muted" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-art-border shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {["Inicio","Nosotros","Menú","Opiniones","Contacto"].map((label) => (
                <button key={label} onClick={() => scrollToSection(label.toLowerCase()==="inicio"?"hero":label.toLowerCase()==="nosotros"?"about":label.toLowerCase()==="opiniones"?"testimonials":label.toLowerCase())} className="block w-full text-left px-4 py-3 rounded-lg text-art-muted hover:bg-art-border-10 transition-colors font-medium">{label}</button>
              ))}
              <button onClick={() => go("catalog")} className="block w-full bg-art-accent text-white text-center px-4 py-3 rounded-full font-bold cursor-pointer">Catálogo & Menú</button>
            </div>
          </div>
        )}
      </nav>

      <section id="hero" className="relative flex items-center overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-art-border-10 px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-art-border" /><span className="text-sm font-medium text-art-muted">Cusco, Perú</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-art-muted">Momentos</span><br />
                <span className="text-art-accent">Dulces</span><br />
                <span className="text-art-muted">Inolvidables</span>
              </h1>
              <p className="text-lg text-art-muted max-w-lg leading-relaxed">
                En FlikiCookie creamos tortas, galletas y pasteles artesanales que convierten cada celebración en un recuerdo especial.
                <span className="font-bold text-art-text"> Hechos con amor en Cusco.</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => go("designer")} className="bg-art-accent hover:bg-art-accent-hover text-white px-6 py-3.5 rounded-full font-bold text-base flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-art-accent/30 cursor-pointer">
                  <Cake className="w-5 h-5" /> Diseña tu Pastel
                </button>
                <button onClick={() => go("catalog")} className="border-2 border-art-border text-art-muted px-6 py-3.5 rounded-full font-bold text-base hover:bg-art-border hover:text-art-bg transition-all cursor-pointer">
                  Catálogo & Menú
                </button>
                <a href="https://wa.me/51970442173" target="_blank" rel="noopener noreferrer" className="bg-wa hover:bg-wa-dark text-white px-6 py-3.5 rounded-full font-bold text-base flex items-center gap-2 transition-all hover:scale-105">
                  <MessageCircle className="w-5 h-5" /> Pedir por WhatsApp
                </a>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -top-8 -left-8 w-72 h-72 bg-art-border-10 rounded-full blur-3xl" />
                <div className="relative bg-gradient-to-br from-art-bg to-art-panel p-8 rounded-[40px] shadow-2xl border-4 border-art-border/20">
                  <img src="/src/assets/images/Emblema%20Flikicookie.png" alt="Flikicookie" className="w-96 h-96 lg:w-[26rem] lg:h-[26rem] object-cover rounded-[30px]" />
                  <div className="absolute -top-4 -right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                    <Star className="w-4 h-4 text-art-border fill-art-border" /><span className="text-sm font-bold text-art-muted">4.9 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="py-24 bg-gradient-to-b from-art-bg to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-art-border-10 px-4 py-2 rounded-full mb-4">
              <Cookie className="w-4 h-4 text-art-border" /><span className="text-sm font-semibold text-art-muted">Nuestros Productos</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-art-muted">Delicias <span className="text-art-accent">Artesanales</span></h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MENU_HIGHLIGHTS.map((item, i) => (
              <div key={i} onClick={() => { const [t,c] = String(item.target||"catalog").split(":"); go(t as any, c); }} className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-art-border/10 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-art-accent to-art-accent-hover rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-art-muted mb-2">{item.name}</h3>
                <p className="text-art-brown text-[15px] mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-art-accent font-bold text-[16px]">Desde {item.priceDesde}</span>
                  <ChevronRight className="w-5 h-5 text-art-border group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
