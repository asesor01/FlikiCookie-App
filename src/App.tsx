import React, { useState, useEffect } from "react";
import { MenuItem, CustomCakeSpec, Order, OrderItem, OrderStatus, Client, Provider, CompanyConfig } from "./types";
import { INITIAL_ORDERS, CAKE_FLAVORS, CAKE_FILLINGS, FROSTING_COLORS, CAKE_TOPPINGS, INITIAL_MENU, INITIAL_CLIENTS, INITIAL_PROVIDERS } from "./data";
import CakeVisualizer from "./components/CakeVisualizer";
import AIKitchenChat from "./components/AIKitchenChat";
import Catalog from "./components/Catalog";
import AdminDashboard from "./components/AdminDashboard";
import OrderTracking from "./components/OrderTracking";
import FAQPage from "./components/FAQPage";
const FAQ_SEED = [{id:"f1",category:"Pedidos",question:"¿Cómo hago un pedido?",answer:"Elige tus delicias en el catálogo, agrégalas a la caja y envía tu ticket por WhatsApp."},{id:"f2",category:"Pedidos",question:"¿Con cuánta anticipación debo pedir?",answer:"Pedidos regulares con 24 h; campañas y pedidos mayores con 48 h."},{id:"f3",category:"Pagos",question:"¿Qué métodos de pago aceptan?",answer:"Yape, Plin, transferencia y efectivo contra entrega en Cusco."},{id:"f4",category:"Pagos",question:"¿Emiten boleta?",answer:"Sí, boleta o recibo electrónico por cada pedido."},{id:"f5",category:"Entrega",question:"¿Hacen entregas a domicilio?",answer:"Sí en Cusco ciudad (costo por zona); recojo en taller gratis."},{id:"f6",category:"Entrega",question:"¿Horario de entrega?",answer:"Lunes a sábado de 9:00 a 19:00 h."},{id:"f7",category:"Personalización",question:"¿Puedo personalizar mi torta o caja?",answer:"Sí: dedicatoria a mano gratis y diseños de autor en el Atelier."},{id:"f8",category:"Alérgenos",question:"¿Tienen opciones sin gluten?",answer:"Preparamos recetas sin gluten bajo pedido; consulta el día."}];
function faqSeed() { try { const r = JSON.parse(localStorage.getItem("flikicookie_faq") || "[]"); return (Array.isArray(r) && r.length) ? r : FAQ_SEED; } catch { return FAQ_SEED; } }
import ReviewMachine from "./components/ReviewMachine";
import LandingPage from "./components/LandingPage";
import { ShoppingCart, ShoppingBag, MapPin, Sparkles, Wand2, Calendar, Clock, Phone, Mail, User, CreditCard, ChevronRight, CheckCircle, Info, Heart, HelpCircle, Star, Home } from "lucide-react";

const INITIAL_COMPANY_CONFIG: CompanyConfig = {
  companyName: "Flikicookie Artisan Bakery",
  phone: "+51 984 123 456",
  address: "Av. El Sol 124, Plaza Regocijo, Cusco",
  facebookUrl: "https://facebook.com/flikicookie.cusco",
  instagramUrl: "https://instagram.com/flikicookie.cusco",
  paymentMethods: "Aceptamos los siguientes métodos de pago:\n- Tarjeta de Crédito/Débito vía pasarela segura.\n- Transferencia directa al BCP (Cta: 305-9988223-0-12, CCI: 002-30500998822301211).\n- Pago móvil vía Yape o Plin al número de taller +51 984 123 456.\n- Binance Pay ID: 88223344 (enviar comprobante de USDT).\n- Efectivo o Tarjeta en físico al retirar en tienda.",
  termsOfService: "Condiciones de Servicio de Taller:\n1. Plazo de Entrega: Todo pedido personalizado debe solicitarse con mínimo 24 horas de anticipación.\n2. Reservas: Pedidos mayores a S/. 200.00 requieren el pago adelantado del 50% para iniciar la preparación.\n3. Cancelaciones: Modificaciones o cancelaciones serán aceptadas únicamente hasta con 12 horas de anticipación, de lo contrario se cobrará el costo de los insumos preparados.\n4. Logística de Envíos: Los despachos a domicilio se realizan mediante nuestro transportista oficial de confianza en Cusco, sujeto a tarifas zonales y accesibilidad.",
  disclaimer: "Aviso de Alérgenos & Deslinde de Responsabilidad:\nTodos nuestros productos se elaboran de manera artesanal en un taller que manipula gluten, lácteos, huevos, soya, maní y frutos secos. Si usted padece de alguna alergia alimentaria severa, es obligatorio que lo informe explícitamente en las notas del pedido o contactándonos al teléfono de taller. Los acabados, colores e iluminación 3D del configurador visual son simulaciones digitales artísticas aproximadas; el horneado real y decorado de glaseados presentan sutiles variaciones artesanales naturales."
};

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"landing" | "designer" | "catalog" | "track" | "admin" | "faq" | "reviews">("landing");

  const [catalogInitialCategory, setCatalogInitialCategory] = useState<string>("todos"); // Company Configurations (editable via admin panel)
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => {
    const saved = localStorage.getItem("flikicookie_company_config");
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_CONFIG;
  });

  // Cart State
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Orders State (loaded initially with sample data)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Menu items list state with localStorage synchronization
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem("flikicookie_menu");
    const raw: MenuItem[] = saved ? JSON.parse(saved) : INITIAL_MENU;
    const keys = raw.map(o => (o.name || "").trim().toLowerCase());
    const clean = raw.filter((_, i) => keys.lastIndexOf(keys[i]) === i);
    if (saved && clean.length !== raw.length) localStorage.setItem("flikicookie_menu", JSON.stringify(clean));
    return clean;
  });

  // Clients state with localStorage synchronization
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem("flikicookie_clients");
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  // Providers state with localStorage synchronization
  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem("flikicookie_providers");
    return saved ? JSON.parse(saved) : INITIAL_PROVIDERS;
  });

  // Reviews state with localStorage synchronization
  const [reviews, setReviews] = useState<Array<{
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    product?: string;
    verified: boolean;
  }>>(() => {
    const saved = localStorage.getItem("flikicookie_reviews");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("flikicookie_company_config", JSON.stringify(companyConfig));
  }, [companyConfig]);

  useEffect(() => {
    localStorage.setItem("flikicookie_menu", JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem("flikicookie_clients", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("flikicookie_providers", JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem("flikicookie_reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Custom Cake spec designer state
  const [customSpec, setCustomSpec] = useState<CustomCakeSpec>({
    tiers: 1,
    flavor: "Vainilla",
    filling: "Dulce de Leche",
    frostingColor: "#FDFDFD",
    frostingName: "Blanco Cremoso",
    toppings: ["Chispas de colores"],
    inscription: "Feliz Día"
  });

  // Client info & coupon state for checkout
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    email: "",
    orderType: "Retiro en Tienda" as "Entrega a Domicilio" | "Retiro en Tienda",
    deliveryDate: "",
    deliveryTime: "",
    deliveryAddress: "",
    paymentMethod: "Tarjeta" as "Efectivo" | "Tarjeta" | "Transferencia" | "Binance",
    documentType: "Boleta" as "Boleta" | "Factura",
    ruc: "",
    razonSocial: "",
    voucherRef: ""
  });

  const handleApplyCoupon = () => {
    const clean = couponInput.trim().toUpperCase();
    if (clean === "TEMPORADA20" || clean === "FLIKI20") {
      setAppliedCoupon({ code: clean, discountPercent: 20 });
    } else if (clean === "FLIKI10") {
      setAppliedCoupon({ code: clean, discountPercent: 10 });
    } else {
      alert("Código de cupón no válido o expirado.");
    }
  };

  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Calculate customized cake price dynamically
  const calculateCustomCakePrice = (spec: CustomCakeSpec) => {
    let base = 25.00; // Base price for 1 tier giant cookie
    if (spec.tiers === 2) base = 42.00;
    if (spec.tiers === 3) base = 65.00;

    // Add flavor modifier
    const flvInfo = CAKE_FLAVORS.find(f => f.value === spec.flavor);
    if (flvInfo) base += flvInfo.priceModifier;

    // Add filling modifier
    const fillInfo = CAKE_FILLINGS.find(f => f.value === spec.filling);
    if (fillInfo) base += fillInfo.priceModifier;

    // Add toppings modifier (2 PEN per topping)
    base += spec.toppings.length * 2.00;

    return base;
  };

  const customCakePrice = calculateCustomCakePrice(customSpec);

  // Apply a preset suggested by the AI Chef
  const handleApplyAIPreset = (presetSpec: CustomCakeSpec) => {
    setCustomSpec(presetSpec);
  };

  // Add Item to cart
  const handleAddCatalogItem = (item: any) => {
    setCart(prev => {
      // Check if item already exists
      const existing = prev.find(i => i.id === item.id && !i.isCustom);
      if (existing) {
        return prev.map(i => i.id === item.id && !i.isCustom ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        isCustom: false
      }];
    });
    setIsCartOpen(true);
  };

  // Add Custom cake to cart
  const handleAddCustomCakeToCart = () => {
    const cakeName = `Pastel de ${customSpec.tiers} Piso(s) - ${customSpec.flavor}`;
    const uniqueId = `custom-cake-${Date.now()}`;
    
    setCart(prev => [
      ...prev,
      {
        id: uniqueId,
        name: cakeName,
        price: customCakePrice,
        quantity: 1,
        isCustom: true,
        customSpec: { ...customSpec }
      }
    ]);
    setIsCartOpen(true);
  };

  // Remove item from cart
  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // Update item quantity
  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  // Dynamic pricing getter for cart items (supporting retail, wholesale and seasonal promotions)
  const getCartItemPriceAndType = (item: OrderItem) => {
    if (item.isCustom) return { price: item.price, type: "custom" };
    const catalogItem = menuItems.find(m => m.id === item.id);
    if (!catalogItem) return { price: item.price, type: "normal" };
    
    // Check for wholesale pricing trigger
    if (catalogItem.wholesalePrice !== undefined && catalogItem.wholesaleMinQty !== undefined && item.quantity >= catalogItem.wholesaleMinQty) {
      return { price: catalogItem.wholesalePrice, type: "wholesale" };
    }
    
    // Check for seasonal promotion price
    if (catalogItem.promoPrice !== undefined) {
      return { price: catalogItem.promoPrice, type: "promo" };
    }
    
    return { price: catalogItem.price, type: "normal" };
  };

  // Cart Total Amount & Discount
  const rawCartTotal = cart.reduce((sum, item) => {
    const { price } = getCartItemPriceAndType(item);
    return sum + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? (rawCartTotal * appliedCoupon.discountPercent) / 100 : 0;
  const cartTotal = rawCartTotal - discountAmount;

  // Handle checkout form submit and generate Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrderId = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const customerFullName = checkoutForm.documentType === "Factura" && checkoutForm.razonSocial
      ? `${checkoutForm.name} (${checkoutForm.razonSocial} - RUC: ${checkoutForm.ruc})`
      : checkoutForm.name;

    const newOrder: Order = {
      id: newOrderId,
      customerName: customerFullName,
      customerPhone: checkoutForm.phone,
      customerEmail: checkoutForm.email,
      orderType: checkoutForm.orderType,
      deliveryDate: checkoutForm.deliveryDate,
      deliveryTime: checkoutForm.deliveryTime,
      deliveryAddress: checkoutForm.orderType === "Entrega a Domicilio" ? checkoutForm.deliveryAddress : undefined,
      items: cart.map(i => {
        const { price } = getCartItemPriceAndType(i);
        return { ...i, price };
      }),
      totalAmount: cartTotal,
      status: "Pendiente",
      createdAt: new Date().toISOString(),
      paymentMethod: checkoutForm.voucherRef 
        ? `${checkoutForm.paymentMethod} (Op: ${checkoutForm.voucherRef})`
        : checkoutForm.paymentMethod
    };

    setOrders(prev => [newOrder, ...prev]);
    setPlacedOrder(newOrder);
    setCart([]);
    setAppliedCoupon(null);
    setCouponInput("");
    setIsCartOpen(false);
  };

  // Move order status
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(price);
  };

  // Setup default form date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    
    setCheckoutForm(prev => ({
      ...prev,
      deliveryDate: `${yyyy}-${mm}-${dd}`,
      deliveryTime: "16:00"
    }));
  }, []);

  // Scroll to top on tab change
useEffect(() => { window.scrollTo({ top: 0 }); }, [activeTab]);
// WhatsApp demo conversations for floating widget
  const [waConversations] = useState<Array<{id: string; phone: string; customerName?: string; lastMessage: string; lastMessageAt: string; unreadCount: number; status: string; messages: Array<{id: string; from: string; to: string; timestamp: string; type: string; text?: {body: string}}>}>>([
    {
      id: "wa-demo-1", phone: "51984112233", customerName: "Valeria Mendoza",
      lastMessage: "Hola, me gustaría hacer un pedido de 24 galletas MockaChino para este viernes",
      lastMessageAt: new Date(Date.now() - 3600000).toISOString(), unreadCount: 2, status: "new",
      messages: [{ id: "m1", from: "51984112233", to: "51984123456", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "text", text: { body: "Hola, me gustaría hacer un pedido de 24 galletas MockaChino para este viernes" } }]
    },
    {
      id: "wa-demo-2", phone: "51951234567", customerName: "Carlos Quispe",
      lastMessage: "¿Cuánto cuesta una torta de 2 pisos de chocolate?",
      lastMessageAt: new Date(Date.now() - 7200000).toISOString(), unreadCount: 1, status: "active",
      messages: [{ id: "m2", from: "51951234567", to: "51984123456", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "text", text: { body: "¿Cuánto cuesta una torta de 2 pisos de chocolate?" } }]
    }
  ]);

  const handleWaSendMessage = (phone: string, message: string) => {
    console.log("Send to", phone, message);
  };

  return (
    <div id="app_root" className="min-h-screen bg-art-panel text-art-muted font-sans flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="w-72 bg-art-bg border-r border-art-border p-10 hidden md:flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand / Title */}
            <div className="mb-12 cursor-pointer flex flex-col items-center text-center" onClick={() => setActiveTab("landing")}>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-art-border shadow-sm mb-4 bg-white flex items-center justify-center">
              <img
                src="/src/assets/images/Emblema%20Flikicookie.png"
                alt="Flikicookie Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3.5xl font-serif italic mb-1 tracking-tight text-art-text">
              FlikiCookie
            </h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-art-muted font-bold">Artisan Bakery</p>
          </div>

          <nav className="space-y-6">
            <div 
              onClick={() => setActiveTab("landing")}
              className={`group cursor-pointer transition-all rounded-xl px-2 py-1.5 border border-transparent hover:bg-white hover:border-art-border hover:shadow-[0_3px_0_#E5A84B] ${activeTab === "landing" ? "opacity-100" : "opacity-100"}`}
            >
              <p className="text-[11px] uppercase tracking-widest text-art-brown mb-2 font-extrabold">Home</p>
              <p className="inline-flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-art-accent-10 text-art-accent font-bold">🏠</span>
                <span className="text-[15px] font-serif text-art-accent-dark font-bold">Página Principal</span>
              </p>
            </div>

            <div 
              onClick={() => setActiveTab("designer")}
              className={`group cursor-pointer transition-all rounded-xl px-2 py-1.5 border border-transparent hover:bg-white hover:border-art-border hover:shadow-[0_3px_0_#E5A84B] ${activeTab === "designer" ? "opacity-100" : "opacity-100"}`}
            >
              <p className="text-[11px] uppercase tracking-widest text-art-brown mb-2 font-extrabold">Atelier View</p>
              <p className="inline-flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-art-accent-10 text-art-accent font-bold">🍰</span>
                <span className="text-[15px] font-serif text-art-accent-dark font-bold">Diseña tu Pastel</span>
              </p>
            </div>

            <div 
              onClick={() => setActiveTab("catalog")}
              className={`group cursor-pointer transition-all rounded-xl px-2 py-1.5 border border-transparent hover:bg-white hover:border-art-border hover:shadow-[0_3px_0_#E5A84B] ${activeTab === "catalog" ? "opacity-100" : "opacity-100"}`}
            >
              <p className="text-[11px] uppercase tracking-widest text-art-brown mb-2 font-extrabold">Pantry & Vitrine</p>
              <p className="inline-flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-art-accent-10 text-art-accent font-bold">🥐</span>
                <span className="text-[15px] font-serif text-art-accent-dark font-bold">Catálogo & Menú</span>
              </p>
            </div>

            <div 
              onClick={() => setActiveTab("track")}
              className={`group cursor-pointer transition-all rounded-xl px-2 py-1.5 border border-transparent hover:bg-white hover:border-art-border hover:shadow-[0_3px_0_#E5A84B] ${activeTab === "track" ? "opacity-100" : "opacity-100"}`}
            >
              <p className="text-[11px] uppercase tracking-widest text-art-brown mb-2 font-extrabold">Sales & Status</p>
              <p className="inline-flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-art-accent-10 text-art-accent font-bold">📦</span>
                <span className="text-[15px] font-serif text-art-accent-dark font-bold">Sigue tu Pedido</span>
              </p>
            </div>

            <div 
              onClick={() => setActiveTab("faq")}
              className={`group cursor-pointer transition-all rounded-xl px-2 py-1.5 border border-transparent hover:bg-white hover:border-art-border hover:shadow-[0_3px_0_#E5A84B] ${activeTab === "faq" ? "opacity-100" : "opacity-100"}`}
            >
              <p className="text-[11px] uppercase tracking-widest text-art-brown mb-2 font-extrabold">Support</p>
              <p className="inline-flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-art-accent-10 text-art-accent font-bold">❓</span>
                <span className="text-[15px] font-serif text-art-accent-dark font-bold">Preguntas Frecuentes</span>
              </p>
            </div>

            <div 
              onClick={() => setActiveTab("reviews")}
              className={`group cursor-pointer transition-all rounded-xl px-2 py-1.5 border border-transparent hover:bg-white hover:border-art-border hover:shadow-[0_3px_0_#E5A84B] ${activeTab === "reviews" ? "opacity-100" : "opacity-100"}`}
            >
              <p className="text-[11px] uppercase tracking-widest text-art-brown mb-2 font-extrabold">Feedback</p>
              <p className="inline-flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-art-accent-10 text-art-accent font-bold">⭐</span>
                <span className="text-[15px] font-serif text-art-accent-dark font-bold">Opiniones</span>
              </p>
            </div>

            <div 
              onClick={() => setActiveTab("admin")}
              className={`group cursor-pointer transition-all rounded-xl px-2 py-1.5 border border-transparent hover:bg-white hover:border-art-border hover:shadow-[0_3px_0_#E5A84B] ${activeTab === "admin" ? "opacity-100" : "opacity-100"}`}
            >
              <p className="text-[11px] uppercase tracking-widest text-art-brown mb-2 font-extrabold">Intelligence</p>
              <p className="inline-flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-art-accent-10 text-art-accent font-bold">📊</span>
                <span className="text-[15px] font-serif text-art-accent-dark font-bold font-bold">Gestión Taller</span>
              </p>
            </div>
          </nav>

          {/* Quick Response Shortcuts */}
          <div className="mt-6 pt-4 border-t border-art-border">
            <p className="text-[10px] uppercase tracking-widest text-art-muted mb-3 font-bold">⚡ Respuestas Rápidas</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(() => {
                try {
                  const saved = localStorage.getItem("flikicookie_quick_responses");
                  const responses = saved ? JSON.parse(saved) : [];
                  return responses.slice(0, 6).map((qr: {id: string; label: string; text: string}) => (
                    <details key={qr.id} className="group text-[10px] text-art-muted bg-white border border-art-border rounded-lg px-3 py-2 cursor-pointer hover:border-art-accent transition-all">
                      <summary className="list-none font-bold flex items-center justify-between gap-1">
                        {qr.label}
                        <span className="text-art-accent group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      <p className="mt-2 whitespace-pre-line leading-relaxed">{qr.text}</p>
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(qr.text); }} className="mt-2 bg-art-accent hover:bg-art-accent-hover text-white rounded-md px-2.5 py-1 font-bold cursor-pointer">📋 Copiar</button>
                    </details>
                  ));
                } catch { return null; }
              })()}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-art-border">
          <p className="text-[10px] uppercase tracking-widest text-art-muted mb-1 font-bold">Active Model</p>
          <p className="font-mono text-xs text-art-muted">gemini-2.5-flash</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Mobile Header (md:hidden) */}
        <header className="md:hidden bg-art-panel border-b border-art-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-art-border bg-white flex items-center justify-center">
              <img
                src="/src/assets/images/Emblema%20Flikicookie.png"
                alt="Flikicookie Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-serif italic text-art-text">FlikiCookie</h1>
              <p className="text-[9px] uppercase tracking-wider text-art-muted font-semibold">Artisan Bakery</p>
            </div>
          </div>

          {/* Mobile Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative w-10 h-10 rounded-full bg-art-accent text-white flex items-center justify-center cursor-pointer hover:bg-art-accent-hover transition-colors"
          >
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-art-border text-art-bg text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
            <ShoppingCart className="w-4.5 h-4.5 text-art-bg" />
          </button>
        </header>

        {/* Mobile Navigation bar */}
        <div className="md:hidden bg-art-bg border-b border-art-border grid grid-cols-7 p-1 text-[11px] font-bold sticky top-[71px] z-30">
          <button
            onClick={() => setActiveTab("landing")}
            className={`py-2.5 px-1 text-center cursor-pointer transition-all ${activeTab === "landing" ? "text-art-border border-b-2 border-art-border" : "text-art-muted"}`}
          >
            🏠 Inicio
          </button>
          <button
            onClick={() => setActiveTab("designer")}
            className={`py-2.5 px-1 text-center cursor-pointer transition-all ${activeTab === "designer" ? "text-art-border border-b-2 border-art-border" : "text-art-muted"}`}
          >
            🍰 Diseña
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`py-2.5 px-1 text-center cursor-pointer transition-all ${activeTab === "catalog" ? "text-art-border border-b-2 border-art-border" : "text-art-muted"}`}
          >
            🥐 Menú
          </button>
          <button
            onClick={() => setActiveTab("track")}
            className={`py-2.5 px-1 text-center cursor-pointer transition-all ${activeTab === "track" ? "text-art-border border-b-2 border-art-border" : "text-art-muted"}`}
          >
            📦 Sigue
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`py-2.5 px-1 text-center cursor-pointer transition-all ${activeTab === "faq" ? "text-art-border border-b-2 border-art-border" : "text-art-muted"}`}
          >
            ❓ FAQ
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-2.5 px-1 text-center cursor-pointer transition-all ${activeTab === "reviews" ? "text-art-border border-b-2 border-art-border" : "text-art-muted"}`}
          >
            ⭐ Opiniones
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`py-2.5 px-1 text-center cursor-pointer transition-all ${activeTab === "admin" ? "text-art-border border-b-2 border-art-border" : "text-art-muted"}`}
          >
            📊 Gestión
          </button>
        </div>

        {/* Desktop Header */}
        <header className="h-24 border-b border-art-border px-8 md:px-12 relative z-40 hidden md:flex items-center justify-between bg-white/50">
          <div>
            <h2 className="text-[13px] md:text-[14px] uppercase tracking-[0.2em] font-bold text-art-muted">
              {activeTab === "landing" && (<span className="normal-case tracking-normal font-serif italic text-2xl text-art-text leading-none">FlikiCookie<span className="block font-sans not-italic text-[10px] font-bold uppercase tracking-[0.2em] text-art-muted mt-1">Artisan Bakery</span></span>)}
              {activeTab === "designer" && "Bespoke Cake Atelier"}
              {activeTab === "catalog" && "Gourmet Pâtisserie Menu"}
              {activeTab === "track" && "Artisan Delivery Dispatch"}
              {activeTab === "faq" && "Preguntas Frecuentes"}
              {activeTab === "reviews" && "Opiniones de Clientes"}
              {activeTab === "admin" && "Production Workspace Intelligence"}
            </h2>
          </div>
          <div className="flex items-center space-x-8">
            <div className="text-right">
              <p className="text-[11px] uppercase text-art-muted tracking-wider font-bold">Carrito de Compras</p>
              <p className="font-serif text-xl text-art-text font-bold">{formatPrice(cartTotal)}</p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-12 h-12 rounded-full bg-art-accent hover:bg-art-accent-hover text-art-bg flex items-center justify-center transition-colors cursor-pointer duration-300"
            >
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-art-accent text-art-bg text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
              <ShoppingBag className="w-5 h-5 text-art-bg" />
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 p-6 md:p-12 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* VIEW 0: Landing Page */}
          {activeTab === "landing" && (
            <div className="animate-fade-in" id="view_landing">
              <LandingPage onNavigate={(tab, cat) => { setCatalogInitialCategory(cat || "todos"); setActiveTab(tab); }} />
            </div>
          )}

          {/* VIEW 1: Diseña tu Pastel (Customizer + SVG Canvas + AI Chatbot) */}
          {activeTab === "designer" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="view_designer">
            
            {/* LEFT: Cake Canvas Visualizer and AI Assistant (Col 5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 tracking-tight uppercase">
                  👁️ Configura tu Pastel
                </h2>
                <p className="text-xs text-slate-500">
                  Visualiza en tiempo real los pisos, coberturas y dedicatorias de tu diseño.
                </p>
              </div>

              {/* Cake graphics component */}
              <CakeVisualizer spec={customSpec} />

              {/* AI Kitchen Chat assistant component */}
              <AIKitchenChat onApplyPreset={handleApplyAIPreset} currentSpec={customSpec} />
            </div>

            {/* RIGHT: Cake Specification Customizer Form (Col 7) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs" id="customizer_form">
              <div className="flex justify-between items-start border-b border-slate-150 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    ✍️ Configura tu Receta Artesanal
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Define los ingredientes, tamaño y dedicatoria para el taller.</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimado</span>
                  <span className="text-lg font-extrabold text-art-accent tracking-tight">{formatPrice(customCakePrice)}</span>
                </div>
              </div>

              {/* Form sections */}
              <div className="space-y-5">
                {/* Size Tiers selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-art-text flex items-center gap-1.5 uppercase">
                    🍰 Pisos / Altura de Pastel
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        onClick={() => setCustomSpec(prev => ({ ...prev, tiers: num as 1 | 2 | 3 }))}
                        className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                          customSpec.tiers === num
                            ? "bg-art-accent-10 border-art-accent-strong text-art-accent font-extrabold"
                            : "bg-white hover:bg-art-panel border-art-border text-art-text text-xs font-semibold"
                        }`}
                        id={`btn_tier_${num}`}
                      >
                        <span className="block text-sm font-bold">{num} {num === 1 ? "Piso" : "Pisos"}</span>
                        <span className="text-[10px] text-art-muted font-semibold">
                          {num === 1 ? "15-20 Porciones" : num === 2 ? "30-40 Porciones" : "50-65 Porciones"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flavor of sponge cake selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-art-text flex items-center gap-1.5 uppercase">
                    🍞 Sabor de Bizcocho / Masa
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {CAKE_FLAVORS.map((flavor) => (
                      <button
                        key={flavor.value}
                        onClick={() => setCustomSpec(prev => ({ ...prev, flavor: flavor.value as any }))}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                          customSpec.flavor === flavor.value
                            ? "bg-art-accent-10 border-art-accent-strong text-art-accent font-extrabold"
                            : "bg-white hover:bg-art-panel border-art-border text-art-text text-xs font-semibold"
                        }`}
                        id={`btn_flavor_${flavor.value}`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 border border-slate-200" style={{ backgroundColor: flavor.color }}></span>
                        <div>
                          <div className="font-bold flex items-center gap-1 text-sm text-art-text">
                            {flavor.label}
                            {flavor.priceModifier > 0 && (
                              <span className="text-[10px] bg-art-accent-10 text-art-accent font-bold px-1.5 py-0.2 rounded">+{formatPrice(flavor.priceModifier)}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-art-muted font-semibold leading-relaxed mt-0.5">{flavor.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cake Filling Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-art-text flex items-center gap-1.5 uppercase">
                    🍯 Relleno Capas / Crema
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {CAKE_FILLINGS.map((filling) => (
                      <button
                        key={filling.value}
                        onClick={() => setCustomSpec(prev => ({ ...prev, filling: filling.value as any }))}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          customSpec.filling === filling.value
                            ? "bg-art-accent-10 border-art-accent-strong text-art-accent font-extrabold"
                            : "bg-white hover:bg-art-panel border-art-border text-art-text text-xs font-semibold"
                        }`}
                        id={`btn_filling_${filling.value}`}
                      >
                        <div className="font-bold flex items-center gap-1.5 text-sm text-art-text">
                          {filling.label}
                          {filling.priceModifier > 0 && (
                            <span className="text-[10px] bg-art-accent/15 text-art-accent font-bold px-1.5 py-0.2 rounded">+{formatPrice(filling.priceModifier)}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-art-brown font-semibold leading-relaxed mt-0.5">{filling.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frosting Swatch Color list */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-art-text flex items-center gap-1.5 uppercase">
                    🎨 Color de Cobertura / Glaseado
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {FROSTING_COLORS.map((fColor) => (
                      <button
                        key={fColor.name}
                        onClick={() => setCustomSpec(prev => ({ ...prev, frostingColor: fColor.color, frostingName: fColor.name }))}
                        className={`p-1 rounded-full transition-all border cursor-pointer ${
                          customSpec.frostingColor === fColor.color
                            ? "ring-2 ring-art-accent border-white scale-110"
                            : "border-art-border hover:scale-105"
                        }`}
                        title={`${fColor.name} (${fColor.label})`}
                        id={`btn_color_${fColor.name}`}
                      >
                        <span className="w-8 h-8 rounded-full block border border-slate-250" style={{ backgroundColor: fColor.color }}></span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toppings Multi selector checkbox */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-art-text flex items-center gap-1.5 uppercase">
                    🍓 Decoraciones & Toppings (+{formatPrice(2.0)} c/u)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {CAKE_TOPPINGS.map((topping) => {
                      const isSelected = customSpec.toppings.includes(topping.name);
                      return (
                        <button
                          key={topping.name}
                          onClick={() => {
                            setCustomSpec(prev => {
                              const alreadySelected = prev.toppings.includes(topping.name);
                              if (alreadySelected) {
                                return { ...prev, toppings: prev.toppings.filter(t => t !== topping.name) };
                              }
                              return { ...prev, toppings: [...prev.toppings, topping.name] };
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            isSelected
                              ? "bg-art-accent/15 border-art-accent text-art-accent font-bold"
                              : "bg-white hover:bg-art-panel border-art-border text-art-text text-xs font-semibold"
                          }`}
                          id={`btn_topping_${topping.name}`}
                        >
                          <span className="text-xl select-none">{topping.icon}</span>
                          <span className="text-[10px] font-bold tracking-tight">{topping.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cake Inscription / Dedicatoria text string */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-art-text flex items-center gap-1.5 uppercase">
                    ✍️ Dedicatoria / Letrero sobre Pastel (Gratis)
                  </label>
                  <input
                    type="text"
                    value={customSpec.inscription}
                    onChange={(e) => setCustomSpec(prev => ({ ...prev, inscription: e.target.value.slice(0, 30) }))}
                    placeholder="Escribe un mensaje corto, ej: Feliz Cumpleaños Sol..."
                    className="w-full bg-white border border-art-border text-art-text text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-art-accent placeholder-art-brown font-serif italic"
                    maxLength={30}
                    id="input_inscription"
                  />
                  <div className="flex justify-between items-center text-[10px] text-art-brown font-semibold px-1">
                    <span>* El chef lo escribirá a mano con glaseado real de chocolate.</span>
                    <span>{customSpec.inscription.length}/30 caracteres</span>
                  </div>
                </div>
              </div>

              {/* Add to cart submit */}
              <div className="pt-4 border-t border-slate-150 flex items-center justify-between">
                <div className="hidden md:block">
                  <p className="text-[10px] text-slate-400 font-bold">Resumen de Diseño</p>
                  <p className="text-xs font-semibold text-slate-600 capitalize">{customSpec.tiers} Piso(s), Masa {customSpec.flavor}</p>
                </div>

                <button
                  onClick={handleAddCustomCakeToCart}
                  className="w-full md:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md shadow-pink-500/10 cursor-pointer flex items-center justify-center gap-2"
                  id="btn_add_custom_cake_to_cart"
                >
                  <Wand2 className="w-4 h-4 fill-white" /> Agregar Diseño al Carrito ({formatPrice(customCakePrice)})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Catálogo y Menú */}
        {activeTab === "catalog" && (
          <div className="space-y-4 animate-fade-in" id="view_catalog">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                🥐 Menú de Delicias Horneas & Repostería
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona de nuestra vitrina de panadería fina, macarons franceses y tartas del día.
              </p>
            </div>
            <Catalog onAddToCart={handleAddCatalogItem} menuItems={menuItems} initialCategory={catalogInitialCategory} />
          </div>
        )}

        {/* VIEW 3: Sigue tu Pedido */}
        {activeTab === "track" && (
          <div className="space-y-4 animate-fade-in" id="view_track">
            <OrderTracking orders={orders} />
          </div>
        )}

        {/* VIEW 5: Preguntas Frecuentes */}
        {activeTab === "faq" && (
          <div className="space-y-4 animate-fade-in" id="view_faq">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-art-line pb-3">
              <div>
                <h2 className="text-base font-extrabold text-art-deep uppercase tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-art-brown" /> Preguntas Frecuentes
                </h2>
                <p className="text-xs text-art-soft">
                  Encuentra respuestas a las consultas más comunes sobre nuestros productos y servicios.
                </p>
              </div>
            </div>
            <FAQPage 
              faqItems={faqSeed()}
            />
          </div>
        )}

        {/* VIEW 6: Opiniones y Reseñas */}
        {activeTab === "reviews" && (
          <div className="space-y-4 animate-fade-in" id="view_reviews">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-art-line pb-3">
              <div>
                <h2 className="text-base font-extrabold text-art-deep uppercase tracking-tight flex items-center gap-2">
                  <Star className="w-5 h-5 text-art-brown" /> Opiniones de Clientes
                </h2>
                <p className="text-xs text-art-soft">
                  Consulta las opiniones de nuestros clientes y comparte tu experiencia.
                </p>
              </div>
            </div>
            <ReviewMachine 
              reviews={reviews}
              onAddReview={(review) => {
                const newReview = {
                  ...review,
                  id: `rev-${Date.now()}`,
                  date: new Date().toISOString(),
                  verified: false
                };
                setReviews([...reviews, newReview]);
              }}
            />
          </div>
        )}

        {/* VIEW 4: CRM Gestión Taller Admin */}
        {activeTab === "admin" && (
          <div className="space-y-4 animate-fade-in" id="view_admin">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                  📊 Panel de Control y Logística de Producción
                </h2>
                <p className="text-xs text-slate-500">
                  Gestión del flujo de horneado, alertas de WhatsApp y optimización de cocina asistida por Gemini AI.
                </p>
              </div>
            </div>

            <AdminDashboard 
              orders={orders} 
              onUpdateStatus={handleUpdateOrderStatus}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              clients={clients}
              setClients={setClients}
              providers={providers}
              setProviders={setProviders}
              companyConfig={companyConfig}
              setCompanyConfig={setCompanyConfig}
            />
          </div>
        )}
      </main>

      {/* Footer Branding line */}
      <footer className="bg-art-panel/60 border-t border-art-border px-6 py-8 text-center text-[10px] text-art-muted font-medium space-y-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-serif font-bold text-art-brown">
          <span>📍 {companyConfig.address}</span>
          <span>📞 Telf: {companyConfig.phone}</span>
          {companyConfig.facebookUrl && (
            <a href={companyConfig.facebookUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-social-fb">
              📘 Facebook
            </a>
          )}
          {companyConfig.instagramUrl && (
            <a href={companyConfig.instagramUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-social-ig">
              📸 Instagram
            </a>
          )}
        </div>
        
        <div className="max-w-xl mx-auto px-4 text-[9px] text-art-soft/90 leading-relaxed border-t border-art-line/40 pt-3 space-y-2">
          <p className="font-bold uppercase tracking-wider mb-0.5 text-art-brown">Aviso & Condiciones de Venta:</p>
          <p className="italic text-left bg-white/30 p-2.5 rounded border border-art-line/20 shadow-2xs whitespace-pre-line">{companyConfig.disclaimer}</p>
          <p className="whitespace-pre-line text-left bg-white/50 p-2.5 rounded border border-art-line/30 shadow-2xs">{companyConfig.termsOfService}</p>
        </div>

        <div className="border-t border-art-line/20 pt-3 space-y-1">
          <p>© 2026 {companyConfig.companyName}. Todos los derechos reservados. Alta Repostería de Autor.</p>
          <p className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500">
            Hecho con amor artesanal <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" /> y Google AI Studio.
          </p>
        </div>
      </footer>
    </div>

      {/* SLIDE OVER SHOPPING CART & CHECKOUT PANEL */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end animate-fade-in" id="cart_overlay_panel">
          <div className="bg-art-panel w-full max-w-md h-full flex flex-col justify-between shadow-2xl relative overflow-y-auto text-art-text panel-soft" style={{ backgroundColor: 'var(--color-art-panel)', color: 'var(--color-art-text)' }}>

            {/* Header */}
            <div className="p-5 border-b border-art-border flex justify-between items-center gradient-art text-art-bg">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-art-accent" />
                <h3 className="font-bold text-sm tracking-tight">Tu Carrito de Delicias</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-art-bg hover:text-art-accent font-bold text-xs uppercase cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Artículos en Cola</h4>
                  
                  {cart.map((item) => {
                    const pricing = getCartItemPriceAndType(item);
                    return (
                      <div key={item.id} className="border border-slate-150 p-3.5 rounded-xl bg-slate-50/50 space-y-2 text-xs flex justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                            {item.name}
                            {pricing.type === "wholesale" && (
                              <span className="bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                🏷️ Mayorista
                              </span>
                            )}
                            {pricing.type === "promo" && (
                              <span className="bg-art-accent text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                                🎄 Oferta
                              </span>
                            )}
                          </div>
                          
                          {/* Custom Spec brief display */}
                          {item.isCustom && item.customSpec && (
                            <div className="text-[10px] text-slate-500 bg-white border border-slate-150 p-2 rounded-lg leading-relaxed">
                              <p>🍰 Pisos: {item.customSpec.tiers} | Masa: {item.customSpec.flavor}</p>
                              <p>🍯 Relleno: {item.customSpec.filling}</p>
                              {item.customSpec.inscription && <p className="italic text-rose-500 mt-0.5">✍️ "{item.customSpec.inscription}"</p>}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-art-accent text-xs">
                              {formatPrice(pricing.price)}
                            </span>
                            {pricing.type !== "normal" && pricing.type !== "custom" && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatPrice(item.price)}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">
                              (Subtotal: {formatPrice(pricing.price * item.quantity)})
                            </span>
                          </div>
                        </div>

                      {/* Quantity adjusting */}
                      <div className="flex flex-col items-center justify-between h-20 shrink-0">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="text-rose-500 hover:text-rose-600 text-[10px] font-bold uppercase hover:underline cursor-pointer"
                        >
                          Quitar
                        </button>
                        
                        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-white">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-250 text-slate-600 rounded font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-bold w-4 text-center text-xs">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-250 text-slate-600 rounded font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                  {/* Coupon Code Input Box */}
                  <div className="bg-art-panel p-3 rounded-xl border border-art-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-serif font-bold text-art-brown flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-art-accent" /> ¿Tienes un Cupón de Descuento?
                      </span>
                      {appliedCoupon && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          -{appliedCoupon.discountPercent}% APLICADO
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Ej: TEMPORADA20"
                        className="flex-1 bg-white border border-art-line text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-art-accent uppercase font-mono"
                        id="input_coupon_code"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-art-accent hover:bg-art-accent-hover text-art-bg font-serif font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        id="btn_apply_coupon"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  {/* Cart Total Breakdown Display */}
                  <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal Productos:</span>
                      <span className="font-mono font-bold">{formatPrice(rawCartTotal)}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Descuento Promocional ({appliedCoupon.code}):</span>
                        <span className="font-mono font-bold">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center font-extrabold text-slate-800 text-sm pt-2 border-t border-slate-100">
                      <span>Total Final a Pagar:</span>
                      <span className="text-lg text-art-accent font-mono">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  {/* CHECKOUT FORM IN THE CAR PANEL */}
                  <form onSubmit={handlePlaceOrder} className="pt-4 border-t border-slate-200 space-y-4">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Información de Comprobante & Despacho</h4>

                    <div className="space-y-3.5 text-xs">
                      {/* Document Type (Boleta vs Factura) */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[10px]">Tipo de Comprobante SUNAT</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutForm(prev => ({ ...prev, documentType: "Boleta" }))}
                            className={`py-2 rounded-xl border font-semibold text-center cursor-pointer transition-colors ${
                              checkoutForm.documentType === "Boleta"
                                ? "bg-art-accent-10 border-art-accent text-art-accent-dark font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-500"
                            }`}
                          >
                            Boleta de Venta
                          </button>
                          <button
                            type="button"
                            onClick={() => setCheckoutForm(prev => ({ ...prev, documentType: "Factura" }))}
                            className={`py-2 rounded-xl border font-semibold text-center cursor-pointer transition-colors ${
                              checkoutForm.documentType === "Factura"
                                ? "bg-art-accent-10 border-art-accent text-art-accent-dark font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-500"
                            }`}
                          >
                            Factura Electrónica
                          </button>
                        </div>
                      </div>

                      {/* Conditional Factura Inputs */}
                      {checkoutForm.documentType === "Factura" && (
                        <div className="grid grid-cols-2 gap-2 p-3 bg-art-accent-10 border border-art-border rounded-xl animate-fade-in">
                          <div className="space-y-1">
                            <label className="font-bold text-art-accent-dark uppercase text-[9px]">RUC (11 Dígitos)</label>
                            <input
                              type="text"
                              required
                              maxLength={11}
                              value={checkoutForm.ruc}
                              onChange={(e) => setCheckoutForm(prev => ({ ...prev, ruc: e.target.value }))}
                              placeholder="20601234567"
                              className="w-full bg-white border border-art-border text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-art-accent font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-bold text-art-accent-dark uppercase text-[9px]">Razón Social</label>
                            <input
                              type="text"
                              required
                              value={checkoutForm.razonSocial}
                              onChange={(e) => setCheckoutForm(prev => ({ ...prev, razonSocial: e.target.value }))}
                              placeholder="Empresa SAC..."
                              className="w-full bg-white border border-art-border text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-art-accent"
                            />
                          </div>
                        </div>
                      )}

                      {/* Name input */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[10px]">Nombre Completo / Titular</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={checkoutForm.name}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Juan Pérez..."
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-art-accent placeholder-slate-400"
                            id="checkout_name"
                          />
                        </div>
                      </div>

                      {/* Phone WhatsApp input */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[10px]">WhatsApp / Teléfono</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            required
                            value={checkoutForm.phone}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="+56 9 1234 5678"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-art-accent placeholder-slate-400"
                            id="checkout_phone"
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[10px]">Correo Electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            required
                            value={checkoutForm.email}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="juan.perez@email.com"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-art-accent placeholder-slate-400"
                            id="checkout_email"
                          />
                        </div>
                      </div>

                      {/* Logistical modalities */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[10px]">Modalidad de Entrega</label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Retiro en Tienda", "Entrega a Domicilio"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setCheckoutForm(prev => ({ ...prev, orderType: opt as any }))}
                              className={`py-2 rounded-xl border font-semibold text-center cursor-pointer transition-colors ${
                                checkoutForm.orderType === opt
                                  ? "bg-art-accent-10 border-art-accent text-art-accent"
                                  : "bg-slate-50 border-slate-200 text-slate-500"
                              }`}
                              id={`checkout_type_${opt.replace(/\s/g, "")}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conditional address input */}
                      {checkoutForm.orderType === "Entrega a Domicilio" && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="font-bold text-slate-500 uppercase text-[10px]">Dirección de Despacho</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea
                              required
                              value={checkoutForm.deliveryAddress}
                              onChange={(e) => setCheckoutForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                              placeholder="Escribe calle, número, depto o instrucciones especiales..."
                              rows={2}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs pl-10 pr-4 py-2 focus:outline-none focus:ring-1.5 focus:ring-art-accent placeholder-slate-400"
                              id="checkout_address"
                            />
                          </div>
                        </div>
                      )}

                      {/* Date & Time delivery scheduling */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase text-[10px]">📅 Fecha</label>
                          <input
                            type="date"
                            required
                            value={checkoutForm.deliveryDate}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, deliveryDate: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-art-accent text-center"
                            id="checkout_date"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-500 uppercase text-[10px]">⏰ Hora Pactada</label>
                          <input
                            type="time"
                            required
                            value={checkoutForm.deliveryTime}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, deliveryTime: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-art-accent text-center"
                            id="checkout_time"
                          />
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[10px] block">💳 Método de Pago</label>
                        <div className="relative">
                          <select
                            value={checkoutForm.paymentMethod}
                            onChange={(e) => setCheckoutForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-art-accent appearance-none font-semibold"
                            id="checkout_payment_method_select"
                          >
                            <option value="Tarjeta">💳 Tarjeta (Crédito/Débito)</option>
                            <option value="Transferencia">🏦 Transferencia / Yape / Plin</option>
                            <option value="Binance">🪙 Binance Pay (Crypto)</option>
                            <option value="Efectivo">💵 Efectivo al recibir / retirar</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Optional Voucher Reference Number */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500 uppercase text-[10px]">N° Operación / Referencia de Pago (Opcional)</label>
                        <input
                          type="text"
                          value={checkoutForm.voucherRef}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, voucherRef: e.target.value }))}
                          placeholder="Ej: Operación 982314 o Ref Yape..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-art-accent font-mono"
                          id="checkout_voucher_ref"
                        />
                      </div>

                      {/* Dynamic Admin-Configured Instructions */}
                        <div className="bg-art-accent-5 border border-art-accent p-3 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-art-accent-dark uppercase tracking-wide block">🏦 Instrucciones de Depósito / Pago:</span>
                        <p className="text-[9.5px] text-slate-600 whitespace-pre-line leading-relaxed">
                          {companyConfig.paymentMethods}
                        </p>
                      </div>
                    </div>

                    {/* Terms, Conditions and Disclaimer Checkbox */}
                    <div className="space-y-2 border-t border-slate-100 pt-3 px-1 text-left">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                        <span className="text-[9px] font-bold text-art-muted uppercase tracking-wide block mb-0.5">⚠️ Nota Legal y Alérgenos:</span>
                        <p className="text-[8.5px] text-slate-500 leading-relaxed italic line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                          {companyConfig.disclaimer}
                        </p>
                      </div>

                      <label className="flex items-start gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          required 
                          className="mt-0.5 rounded text-art-accent focus:ring-art-accent cursor-pointer h-3.5 w-3.5" 
                        />
                        <span className="text-[9.5px] text-art-muted font-medium leading-tight">
                          Acepto las <strong className="text-art-accent underline">Condiciones de Servicio</strong> de {companyConfig.companyName}
                        </span>
                      </label>
                    </div>

                    {/* Finalize order placement button */}
                    <button
                      type="submit"
                      className="w-full bg-art-accent hover:bg-art-accent-hover active:scale-95 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                      id="btn_confirm_purchase"
                    >
                      <CheckCircle className="w-4 h-4" /> Confirmar Pedido de Delicias
                    </button>
                  </form>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 py-20 space-y-3">
                  <div className="text-5xl">🛒💔🥐</div>
                  <h4 className="font-bold text-slate-800 text-sm">Tu carrito está vacío</h4>
                  <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                    Comienza diseñando un pastel personalizado en 3D/2D o explora el catálogo de panadería fina para agregar delicias.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setActiveTab("designer");
                    }}
                    className="mt-2 bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Diseñar ahora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS ORDER PLACED MODAL */}
      {placedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" id="order_placed_modal">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center max-w-md w-full space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto border-2 border-emerald-500 animate-bounce">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 text-base tracking-tight">🎉 ¡Pedido Registrado con Éxito!</h3>
              <p className="text-xs text-slate-500">
                Tu solicitud ha ingresado de forma exitosa a nuestro taller de repostería artesanal.
              </p>
            </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40 font-mono text-xs space-y-1.5 text-slate-700">
              <p>📍 <strong>Código de Pedido:</strong> <span className="text-art-accent font-bold tracking-wider">{placedOrder.id}</span></p>
              <p>👤 <strong>Cliente:</strong> {placedOrder.customerName}</p>
              <p>📅 <strong>Fecha Entrega:</strong> {placedOrder.deliveryDate} a las {placedOrder.deliveryTime} hrs</p>
              <p>📊 <strong>Total del Pedido:</strong> {formatPrice(placedOrder.totalAmount)}</p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setPlacedOrder(null);
                  setActiveTab("track");
                }}
                className="flex-1 bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs py-3 rounded-xl transition-all shadow-xs cursor-pointer"
                id="btn_success_track"
              >
                Seguir mi pedido en tiempo real
              </button>
              
              <button
                onClick={() => setPlacedOrder(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp widget SOLO en admin, no en área comercial */}
    </div>
  );
}