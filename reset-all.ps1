# ============ 1) WhatsAppPanel.tsx LIMPIO ============
@'
import React from "react";
import { MessageSquare, Send } from "lucide-react";

interface WhatsAppPanelProps { conversations?: any[]; }

export default function WhatsAppPanel({ conversations = [] }: WhatsAppPanelProps) {
  return (
    <div className="flex h-[600px] bg-white border border-art-border rounded-lg overflow-hidden shadow-xs">
      <div className="w-full md:w-80 border-r border-art-border flex flex-col justify-center p-4 space-y-2">
        <h4 className="font-bold text-sm text-art-text">WhatsApp Business</h4>
        <p className="text-xs text-art-muted">Panel temporal para permitir la compilación del proyecto.</p>
        <p className="text-[10px] text-art-muted">Conversaciones: {conversations.length}</p>
      </div>
      <div className="flex-1 flex items-center justify-center bg-wa-bg/30">
        <div className="text-center p-6">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-wa/30" />
          <h4 className="font-bold text-art-text mb-1">WhatsApp Business</h4>
          <p className="text-xs text-art-muted max-w-xs mx-auto">
            Selecciona una conversación para comenzar a responder o inicia una nueva.
          </p>
          <button className="mt-4 inline-flex items-center gap-2 bg-wa hover:bg-wa-dark text-white text-xs font-bold px-4 py-2 rounded-full transition-colors cursor-pointer">
            <Send className="w-4 h-4" /> Nueva conversación
          </button>
        </div>
      </div>
    </div>
  );
}
'@ | Set-Content -Path src\components\WhatsAppPanel.tsx -Encoding UTF8

# ============ 2) LandingPage.tsx NUEVA (tarjetas clicables + marca cursiva + logo grande) ============
@'
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
'@ | Set-Content -Path src\components\LandingPage.tsx -Encoding UTF8

# ============ 3) App.tsx: cableado + scroll arriba al cambiar de pestaña ============
$f = "src\App.tsx"; $c = Get-Content -Raw $f -Encoding UTF8
if ($c -notmatch 'catalogInitialCategory') {
  $c = $c.Replace('// Company Configurations (editable via admin panel)','const [catalogInitialCategory, setCatalogInitialCategory] = useState<string>("todos"); // Company Configurations (editable via admin panel)')
  $c = $c.Replace('<LandingPage />','<LandingPage onNavigate={(tab, cat) => { setCatalogInitialCategory(cat || "todos"); setActiveTab(tab); }} />')
  $c = $c.Replace('<Catalog onAddToCart={handleAddCatalogItem} menuItems={menuItems} />','<Catalog onAddToCart={handleAddCatalogItem} menuItems={menuItems} initialCategory={catalogInitialCategory} />')
  $c = $c.Replace('// WhatsApp demo conversations for floating widget',"useEffect(() => { window.scrollTo({ top: 0 }); }, [activeTab]);`n// WhatsApp demo conversations for floating widget")
  Set-Content -Path $f -Value $c -Encoding UTF8 -NoNewline
}

# ============ 4) Catalog.tsx: categoria inicial + categorias dinamicas desde localStorage ============
$f = "src\components\Catalog.tsx"; $c = Get-Content -Raw $f -Encoding UTF8
if ($c -notmatch 'customCats') {
  $c = $c.Replace('import React, { useState } from "react";','import React, { useState, useEffect } from "react";')
  $c = $c.Replace('menuItems: MenuItem[];','menuItems: MenuItem[]; initialCategory?: string;')
  $c = $c.Replace('Catalog({ onAddToCart, menuItems }: CatalogProps)','Catalog({ onAddToCart, menuItems, initialCategory }: CatalogProps)')
  $c = $c.Replace('const [activeCategory, setActiveCategory] = useState<string>("todos");','const [activeCategory, setActiveCategory] = useState<string>("todos"); const [customCats] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("flikicookie_categories") || "[]"); } catch { return []; } });')
  $c = $c.Replace('const filteredItems = menuItems.filter(item => {','useEffect(() => { if (initialCategory) { const all = [...categories, ...customCats.map((x) => ({ id: x, label: "🏷️ " + x }))]; const found = all.find((x) => x.id.trim() === initialCategory.trim()); setActiveCategory(found ? found.id : initialCategory); } }, [initialCategory]); const filteredItems = menuItems.filter(item => {')
  $c = $c.Replace('matchesCategory = item.category === activeCategory;','matchesCategory = (item.category || "").trim() === activeCategory.trim();')
  $c = $c.Replace('{categories.map((cat) => (','{[...categories, ...customCats.map((x) => ({ id: x, label: "🏷️ " + x }))].map((cat) => (')
  Set-Content -Path $f -Value $c -Encoding UTF8 -NoNewline
}

# ============ 5) AIKitchenChat.tsx: cabecera rosada + scroll interno ============
$f = "src\components\AIKitchenChat.tsx"; $c = Get-Content -Raw $f -Encoding UTF8
$c = $c.Replace('px-5 py-4 bg-art-text text-art-bg','px-5 py-4 bg-art-accent text-white')
$c = $c.Replace('text-art-muted tracking-wider uppercase','text-white/80 tracking-wider uppercase')
$c = $c.Replace('text-art-muted hover:bg-white/10','text-white hover:bg-white/10')
$c = $c.Replace('chatEndRef.current?.scrollIntoView({ behavior: "smooth" });','const box = chatEndRef.current?.closest(".overflow-y-auto"); if (box) { box.scrollTop = box.scrollHeight; }')
Set-Content -Path $f -Value $c -Encoding UTF8 -NoNewline

# ============ 6) AdminDashboard: botones negros -> rosado; banner IA -> caramelo; campo nueva categoria ============
$f = "src\components\AdminDashboard.tsx"; $c = Get-Content -Raw $f -Encoding UTF8
$c = $c.Replace('bg-art-text hover:bg-art-accent text-white','bg-art-accent hover:bg-art-accent-hover text-white')
$c = $c.Replace('bg-art-text text-white px-2.5 py-1 rounded-full','bg-art-accent text-white px-2.5 py-1 rounded-full')
$c = $c.Replace('bg-art-brown hover:bg-art-brown/90','bg-art-accent hover:bg-art-accent-hover')
$c = $c.Replace('bg-art-brown hover:bg-art-accent','bg-art-accent hover:bg-art-accent-hover')
$c = $c.Replace('bg-art-text text-white rounded-lg p-6 shadow-md border border-art-text','bg-art-border text-art-text rounded-lg p-6 shadow-md border border-art-border')
$c = $c.Replace('disabled:bg-art-dark-line disabled:text-art-soft','disabled:bg-art-text/20 disabled:text-art-text')
$c = $c.Replace('border-t border-art-dark-line','border-t border-art-text/20')
$c = $c.Replace('bg-art-dark border border-art-dark-line','bg-white border border-art-border')
$c = $c.Replace('text-art-cream-soft','text-art-muted')
$c = $c.Replace('text-art-cream-text','text-art-muted')
$c = $c.Replace('text-art-cream','text-art-text')
$c = $c.Replace('fill-art-cream','fill-art-text')
$c = $c.Replace('text-art-rose','text-art-accent')
# Campo nueva categoria sobre el select
$c = $c.Replace('<label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Categoría del Menú *</label>','<div className="flex gap-1.5 mb-1.5"><input id="input_new_category" type="text" placeholder="➕ Nueva categoría (ej. Tortas de Temporada)" className="flex-1 bg-white border border-art-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent" /><button type="button" onClick={() => { const inp = document.getElementById("input_new_category") as HTMLInputElement; const val = (inp?.value || "").trim(); if (!val) return; const cur: string[] = JSON.parse(localStorage.getItem("flikicookie_categories") || "[]"); if (!cur.includes(val)) { cur.push(val); localStorage.setItem("flikicookie_categories", JSON.stringify(cur)); } if (inp) inp.value = ""; setMenuForm({ ...menuForm, category: val }); }} className="bg-art-accent hover:bg-art-accent-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer">＋ Agregar</button></div><label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Categoría del Menú *</label>')
$c = $c.Replace('<option value="bebidas">☕ Bebidas & Cafetería</option>','<option value="bebidas">☕ Bebidas & Cafetería</option>{(JSON.parse(localStorage.getItem("flikicookie_categories") || "[]") as string[]).map((cc) => (<option key={cc} value={cc}>🏷️ {cc}</option>))}')
Set-Content -Path $f -Value $c -Encoding UTF8 -NoNewline

# ============ 7) Espejar assets en public para que funcionen en build/produccion ============
if (Test-Path src\assets) { xcopy /E /I /Y /Q src\assets public\src\assets | Out-Null }

# ============ 8) Gitignore si no existe ============
if (!(Test-Path .gitignore)) {
  Set-Content -Path .gitignore -Value "node_modules`ndist`nbackup_hex" -Encoding ASCII
}

Write-Host "=== RESET COMPLETO ==="
Write-Host "Ahora ejecuta:"
Write-Host "  npm run dev   (para verificar local)"
Write-Host "  git add -A ; git commit -m 'Mega-reset: landing clickeable, categorias editables, tokens, banner caramelo' ; git push"