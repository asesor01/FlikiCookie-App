import React, { useState, useRef, useEffect } from "react";
import { Order, OrderStatus, KitchenAnalysis, MenuItem, Client, Provider, CompanyConfig, PurchaseOrder, ClientNote } from "../types";
import { INITIAL_PURCHASE_ORDERS, INITIAL_CLIENT_NOTES } from "../data";
import { 
  Sparkles, Calendar, TrendingUp, ShoppingBag, PieChart, CheckCircle2, 
  ChevronRight, MessageSquare, AlertTriangle, Coffee, RefreshCw, Layers, 
  Lock, Users, Truck, Plus, Trash2, Edit, Upload, Check, X, ShieldAlert, Printer, Settings, Bell, BellOff,
  BarChart3, FileText, Receipt, Award, DollarSign, ArrowUpRight, ClipboardList, BookOpen, BrainCircuit, Send,
  Headphones
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart as RechartsPieChart, Pie, Cell 
} from "recharts";
import { generateBusinessReport, BusinessData, BusinessReport, CONSULTOR_RESPONSES } from "../skills/ai-business-advisor";
import WhatsAppPanel from "./WhatsAppPanel";
import { WhatsAppConversation, generateAutoResponse } from "../services/whatsapp";
import CommunicationAgent from "./CommunicationAgent";

interface AdminDashboardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
  companyConfig: CompanyConfig;
  setCompanyConfig: React.Dispatch<React.SetStateAction<CompanyConfig>>;
}

type AdminTab = "orders" | "metrics" | "clients" | "suppliers" | "purchase_orders" | "catalog" | "reports" | "company" | "inventory" | "cashflow" | "advisor" | "whatsapp" | "communications";


export default function AdminDashboard({ 
  orders, 
  onUpdateStatus,
  menuItems,
  setMenuItems,
  clients,
  setClients,
  providers,
  setProviders,
  companyConfig,
  setCompanyConfig
}: AdminDashboardProps) {
  // Password Lock state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // Password Change state
  const [currentPassInput, setCurrentPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmPassInput, setConfirmPassInput] = useState("");
  const [passChangeSuccess, setPassChangeSuccess] = useState("");
  const [passChangeError, setPassChangeError] = useState("");

  // Sub tab state
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [recipeStandardsText, setRecipeStandardsText] = useState(() => {
    const saved = localStorage.getItem("flikicookie_recipe_standards");
    return saved || "Cada galleta estándar de Flikicookie consume aproximadamente 150g de Harina, 100g de Mantequilla, 80g de Azúcar y 1 huevo fresco. Las galletas personalizadas de múltiples niveles consumen un factor proporcional (tier 1: 3x, tier 2: 6x, tier 3: 9x) del insumo base. El sistema monitoriza automáticamente estas proporciones.";
  });

  // Real-time notifications for incoming orders
  interface OrderToast {
    id: string;
    order: Order;
    message: string;
    time: string;
  }
  const [toasts, setToasts] = useState<OrderToast[]>([]);
  const isMounted = useRef(false);
  const prevOrdersRef = useRef<Order[]>([]);

  // Raw Materials state for baking inventory monitoring
  interface RawMaterial {
    id: string;
    name: string;
    unit: string;
    stock: number;         // stock in grams or units
    criticalLimit: number; // threshold
    category: string;
  }

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem("flikicookie_raw_materials");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse raw materials", e);
      }
    }
    return [
      { id: "rw-1", name: "Harina de Repostería", unit: "g", stock: 35000, criticalLimit: 10000, category: "Secos" },
      { id: "rw-2", name: "Mantequilla sin Sal", unit: "g", stock: 20000, criticalLimit: 5000, category: "Grasas & Lácteos" },
      { id: "rw-3", name: "Azúcar Rubia", unit: "g", stock: 18000, criticalLimit: 4000, category: "Secos" },
      { id: "rw-4", name: "Chispas de Chocolate Bitter", unit: "g", stock: 12000, criticalLimit: 3000, category: "Aromas & Especiales" },
      { id: "rw-5", name: "Huevos Frescos de Granja", unit: "u", stock: 150, criticalLimit: 30, category: "Grasas & Lácteos" },
      { id: "rw-6", name: "Café de Autor Orgánico", unit: "g", stock: 4000, criticalLimit: 1000, category: "Aromas & Especiales" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("flikicookie_raw_materials", JSON.stringify(rawMaterials));
  }, [rawMaterials]);

  useEffect(() => {
    localStorage.setItem("flikicookie_recipe_standards", recipeStandardsText);
  }, [recipeStandardsText]);

  // ============================================
  // AI BUSINESS ADVISOR STATE
  // ============================================
  const [advisorReport, setAdvisorReport] = useState<BusinessReport | null>(null);
  const [advisorChatMessages, setAdvisorChatMessages] = useState<Array<{ role: 'user' | 'advisor'; text: string }>>([]);
  const [advisorChatInput, setAdvisorChatInput] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // ============================================
  // WHATSAPP STATE
  // ============================================
  const [whatsappConversations, setWhatsappConversations] = useState<WhatsAppConversation[]>(() => {
    const saved = localStorage.getItem("flikicookie_whatsapp_conversations");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse WhatsApp conversations", e); }
    }
    return [
      {
        id: "wa-demo-1",
        phone: "51984112233",
        customerName: "Valeria Mendoza",
        lastMessage: "Hola, me gustaría hacer un pedido de 24 galletas MockaChino para este viernes",
        lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
        unreadCount: 2,
        status: "new",
        messages: [
          { id: "m1", from: "51984112233", to: "51984123456", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "text", text: { body: "Hola, me gustaría hacer un pedido de 24 galletas MockaChino para este viernes" } }
        ]
      },
      {
        id: "wa-demo-2",
        phone: "51951234567",
        customerName: "Carlos Quispe",
        lastMessage: "¿Cuánto cuesta una torta de 2 pisos de chocolate?",
        lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
        unreadCount: 1,
        status: "active",
        messages: [
          { id: "m2", from: "51951234567", to: "51984123456", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "text", text: { body: "¿Cuánto cuesta una torta de 2 pisos de chocolate?" } }
        ]
      }
    ];
  });

  // ============================================
  // COMMUNICATIONS STATE
  // ============================================
  const [communications, setCommunications] = useState<Array<{
    id: string;
    channel: string;
    from: string;
    to: string;
    content: string;
    timestamp: string;
    status: string;
    type: 'inbound' | 'outbound';
  }>>(() => {
    const saved = localStorage.getItem("flikicookie_communications");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse communications", e); }
    }
    return [
      { id: "comm-1", channel: "email", from: "maria.garcia@email.com", to: "admin@flikicookie.com", content: "Consulta sobre disponibilidad de torta personalizada para 15 de agosto", timestamp: new Date(Date.now() - 86400000).toISOString(), status: "pending", type: "inbound" },
      { id: "comm-2", channel: "phone", from: "+51984123456", to: "+51984987654", content: "Llamada confirmación de pedido #ORD-0012 - Entrega 3pm", timestamp: new Date(Date.now() - 43200000).toISOString(), status: "resolved", type: "outbound" },
      { id: "comm-3", channel: "instagram", from: "@flikicookie.cusco", to: "@pedro_lu", content: "Respuesta a comentario: ¡Gracias por tu preferencia! 🎂", timestamp: new Date(Date.now() - 18000000).toISOString(), status: "resolved", type: "outbound" },
      { id: "comm-4", channel: "whatsapp", from: "51951234567", to: "51984123456", content: "Solicitud de cambio de fecha de entrega del pedido #ORD-0008", timestamp: new Date(Date.now() - 7200000).toISOString(), status: "pending", type: "inbound" }
    ];
  });

  // ============================================
  // AUTO-RESPONSES STATE
  // ============================================
  const [autoResponses, setAutoResponses] = useState<Array<{
    id: string;
    trigger: string;
    response: string;
    channel: string;
    active: boolean;
  }>>(() => {
    const saved = localStorage.getItem("flikicookie_auto_responses");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse auto-responses", e); }
    }
    return [
      { id: "ar-1", trigger: "horario", response: "Nuestro horario de atención es de lunes a sábado de 9am a 7pm.", channel: "whatsapp", active: true },
      { id: "ar-2", trigger: "pedido", response: "Para realizar un pedido, puedes usar nuestro catálogo online o visitarnos en tienda.", channel: "whatsapp", active: true },
      { id: "ar-3", trigger: "pago", response: "Aceptamos tarjeta, Yape, Plin y transferencia bancaria.", channel: "whatsapp", active: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem("flikicookie_whatsapp_conversations", JSON.stringify(whatsappConversations));
  }, [whatsappConversations]);

  useEffect(() => {
    localStorage.setItem("flikicookie_communications", JSON.stringify(communications));
  }, [communications]);

  useEffect(() => {
    localStorage.setItem("flikicookie_auto_responses", JSON.stringify(autoResponses));
  }, [autoResponses]);

  const handleSendWhatsAppMessage = (phone: string, message: string) => {
    const conv = whatsappConversations.find(c => c.phone === phone);
    if (!conv) return;

    const newMessage = {
      id: `m-${Date.now()}`,
      from: "51984123456",
      to: phone,
      timestamp: new Date().toISOString(),
      type: "text" as const,
      text: { body: message }
    };

    setWhatsappConversations(prev => prev.map(c => 
      c.phone === phone ? {
        ...c,
        messages: [...c.messages, newMessage],
        lastMessage: message,
        lastMessageAt: new Date().toISOString()
      } : c
    ));

    // Auto-response after 1 second (simulating bot)
    setTimeout(() => {
      const autoResponse = generateAutoResponse(message);
      const botMessage = {
        id: `m-${Date.now()}-bot`,
        from: phone,
        to: "51984123456",
        timestamp: new Date().toISOString(),
        type: "text" as const,
        text: { body: autoResponse }
      };

      setWhatsappConversations(prev => prev.map(c => 
        c.phone === phone ? {
          ...c,
          messages: [...c.messages, botMessage],
          lastMessage: autoResponse.substring(0, 50) + "...",
          lastMessageAt: new Date().toISOString()
        } : c
      ));
    }, 1200);
  };

  const handleMarkWhatsAppAsRead = (conversationId: string) => {
    setWhatsappConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleUpdateWhatsAppStatus = (conversationId: string, status: WhatsAppConversation['status']) => {
    setWhatsappConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, status } : c
    ));
  };

  // ============================================
  // QUICK RESPONSES CONFIGURABLE
  // ============================================
  const [quickResponses, setQuickResponses] = useState<Array<{ id: string; label: string; text: string; category: string }>>(() => {
    const saved = localStorage.getItem("flikicookie_quick_responses");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse quick responses", e); }
    }
    return [
      { id: "qr-1", label: "Menú", text: "📋 *Nuestro Menú*\n\n🍪 Galletas Clásicas:\n• ChocoManjar — S/. 12\n• MockaChino — S/. 14\n• Confitti — S/. 11\n• Bombón — S/. 13\n\n🎂 Tortas Personalizadas desde S/. 85\n\n¿Te interesa algún producto?", category: "general" },
      { id: "qr-2", label: "Estado de Pedido", text: "📦 *Consulta de Estado*\n\nPara verificar tu pedido, por favor indícanos:\n1️⃣ Tu nombre completo\n2️⃣ Número de pedido\n3️⃣ Fecha del pedido\n\nTe responderemos a la brevedad.", category: "general" },
      { id: "qr-3", label: "Métodos de Pago", text: "💳 *Métodos de Pago*\n\n• Yape: 984 112 233\n• Plin: 984 112 233\n• Transferencia BCP: 191-1234567890-10-12\n• Efectivo: En tienda\n\nEl pedido se confirma una vez recibido el pago.", category: "general" },
      { id: "qr-4", label: "Pastel Personalizado", text: "🎂 *Pastel Personalizado*\n\n¿Quieres diseñar tu pastel? Cuéntanos:\n1️⃣ ¿Cuántos pisos?\n2️⃣ ¿Sabor del bizcocho?\n3️⃣ ¿Relleno?\n4️⃣ Color de cobertura\n5️⃣ Decoración o dedicatoria\n\nTe prepararemos una cotización ✨", category: "general" },
      { id: "qr-5", label: "Ubicación", text: "📍 *Flikicookie Artisan Bakery*\n\nAv. El Sol 124, Plaza Regocijo, Cusco\n⏰ Lun-Sáb 9:00 AM - 8:00 PM\n📞 Tel: +51 984 123 456\n\n¡Te esperamos! 🍪", category: "general" },
      { id: "qr-6", label: "Gracias", text: "¡Gracias por contactarnos! 😊 Si necesitas algo más, estamos aquí para ayudarte. ¡Que tengas un excelente día! 🍪", category: "general" },
      { id: "qr-7", label: "Horario", text: "⏰ *Horario de Atención*\n\nLunes a Sábado: 9:00 AM - 8:00 PM\nDomingos: Cerrado\n\n¿En qué podemos ayudarte?", category: "general" },
      { id: "qr-8", label: "Seguimiento", text: "📱 *Seguimiento de Pedido*\n\nTu pedido está siendo preparado con mucho cariño. Te notificaremos cuando esté listo para entrega.\n\n¿Tienes alguna consulta adicional?", category: "pedido" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("flikicookie_quick_responses", JSON.stringify(quickResponses));
  }, [quickResponses]);

  const [newQuickResponse, setNewQuickResponse] = useState({ label: "", text: "", category: "general" });
  const [showQuickResponseForm, setShowQuickResponseForm] = useState(false);

  const handleAddQuickResponse = () => {
    if (!newQuickResponse.label || !newQuickResponse.text) return;
    setQuickResponses(prev => [...prev, {
      id: `qr-${Date.now()}`,
      label: newQuickResponse.label,
      text: newQuickResponse.text,
      category: newQuickResponse.category
    }]);
    setNewQuickResponse({ label: "", text: "", category: "general" });
    setShowQuickResponseForm(false);
  };

  const handleDeleteQuickResponse = (id: string) => {
    setQuickResponses(prev => prev.filter(qr => qr.id !== id));
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    // Simular tiempo de procesamiento
    setTimeout(() => {
      const data: BusinessData = {
        orders: orders.map(o => ({
          id: o.id,
          customerName: o.customerName,
          totalAmount: o.totalAmount,
          status: o.status,
          createdAt: o.createdAt,
          orderType: o.orderType
        })),
        cashFlow: cashFlowTransactions.map(t => ({
          id: t.id,
          date: t.date,
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description
        })),
        rawMaterials: rawMaterials.map(m => ({
          id: m.id,
          name: m.name,
          unit: m.unit,
          stock: m.stock,
          criticalLimit: m.criticalLimit,
          category: m.category
        })),
        clients: clients.map(c => ({
          id: c.id,
          name: c.name,
          totalOrders: c.ordersCount || 0,
          totalSpent: c.totalSpent || 0
        })),
        providers: providers.map(p => ({
          id: p.id,
          name: p.name,
          suppliedItems: p.suppliedItems
        })),
        menuItems: menuItems.map(m => ({
          id: m.id,
          name: m.name,
          price: m.price,
          category: m.category
        })),
        reviews: JSON.parse(localStorage.getItem("flikicookie_reviews") || "[]"),
        communications: communications,
        faqItems: JSON.parse(localStorage.getItem("flikicookie_faq") || "[]")
      };
      const report = generateBusinessReport(data);
      setAdvisorReport(report);
      setIsGeneratingReport(false);
      setAdvisorChatMessages([{
        role: 'advisor',
        text: `📊 **Informe generado exitosamente** — ${new Date(report.generatedAt).toLocaleString('es-PE')}\n\n${report.executive_summary}\n\n¿Deseas que profundice en algún aspecto específico del informe?`
      }]);
    }, 2000);
  };

  const handleSendAdvisorMessage = () => {
    if (!advisorChatInput.trim()) return;
    
    const userMessage = advisorChatInput.trim().toLowerCase();
    setAdvisorChatMessages(prev => [...prev, { role: 'user', text: advisorChatInput }]);
    setAdvisorChatInput("");
    
    // Buscar respuesta basada en palabras clave
    let response = CONSULTOR_RESPONSES.default;
    
    if (userMessage.includes("flujo") || userMessage.includes("caja") || userMessage.includes("dinero") || userMessage.includes("ingreso") || userMessage.includes("egreso")) {
      response = CONSULTOR_RESPONSES["flujo de caja"];
      if (advisorReport) {
        const totalIncome = advisorReport.sections.find(s => s.title.includes("Flujo"))?.metrics?.find(m => m.label.includes("Ingresos"))?.value || "N/A";
        response += `\n\n📊 Datos actuales: Tus ingresos totales son ${totalIncome}.`;
      }
    } else if (userMessage.includes("inventario") || userMessage.includes("stock") || userMessage.includes("materia") || userMessage.includes("materia prima")) {
      response = CONSULTOR_RESPONSES["inventario"];
      const critical = rawMaterials.filter(m => m.stock <= m.criticalLimit);
      if (critical.length > 0) {
        response += `\n\n⚠️ Estado actual: Tienes ${critical.length} materiales en nivel crítico: ${critical.map(m => m.name).join(", ")}.`;
      }
    } else if (userMessage.includes("cliente") || userMessage.includes("ventas")) {
      response = CONSULTOR_RESPONSES["clientes"];
      response += `\n\n👥 Tu base actual: ${clients.length} clientes registrados.`;
    } else if (userMessage.includes("proveedor")) {
      response = CONSULTOR_RESPONSES["proveedores"];
      response += `\n\n📦 Proveedores activos: ${providers.length}.`;
    } else if (userMessage.includes("precio") || userMessage.includes("costo")) {
      response = CONSULTOR_RESPONSES["precios"];
    } else if (userMessage.includes("opiniones") || userMessage.includes("reseñas") || userMessage.includes("reviews") || userMessage.includes("calificación")) {
      const reviews = JSON.parse(localStorage.getItem("flikicookie_reviews") || "[]");
      const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
      response = `⭐ **Análisis de Opiniones y Reputación**\n\nTu negocio tiene ${reviews.length} opiniones registradas con una calificación promedio de ${avgRating}/5 estrellas.\n\n💡 **Recomendaciones:**\n- Mantener la calidad constante para preservar la calificación\n- Responder a todas las reseñas negativas mostrando disposición a resolver\n- Promover que más clientes dejen opiniones después de su compra`;
    } else if (userMessage.includes("comunicación") || userMessage.includes("comunicaciones") || userMessage.includes("email") || userMessage.includes("llamada")) {
      const inbound = communications.filter(c => c.type === 'inbound').length;
      const outbound = communications.filter(c => c.type === 'outbound').length;
      response = `💬 **Análisis de Comunicaciones**\n\nHas registrado ${communications.length} comunicaciones: ${inbound} entrantes y ${outbound} salientes.\n\n💡 **Recomendaciones:**\n- Establecer tiempos de respuesta estándar por canal\n- Usar auto-respuestas para consultas frecuentes\n- Documentar interacciones importantes en el sistema`;
    } else if (userMessage.includes("hola") || userMessage.includes("buenas")) {
      response = "¡Hola! Soy tu asesor de negocios de Flikicookie. Puedo ayudarte a analizar el flujo de caja, inventario, clientes, proveedores, precios, o cualquier aspecto estratégico de tu negocio. ¿Qué te gustaría saber?";
    } else if (userMessage.includes("gracias")) {
      response = "¡De nada! Estoy aquí para ayudarte a tomar las mejores decisiones para Flikicookie. No dudes en preguntar cualquier cosa.";
    }
    
    setTimeout(() => {
      setAdvisorChatMessages(prev => [...prev, { role: 'advisor', text: response }]);
    }, 800);
  };

  // Purchase Orders state (Órdenes de Compra a Proveedores)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem("flikicookie_purchase_orders");
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem("flikicookie_purchase_orders", JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  // Client Notes state (Notas & Conversaciones CRM)
  const [clientNotes, setClientNotes] = useState<ClientNote[]>(() => {
    const saved = localStorage.getItem("flikicookie_client_notes");
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_NOTES;
  });

  useEffect(() => {
    localStorage.setItem("flikicookie_client_notes", JSON.stringify(clientNotes));
  }, [clientNotes]);

  // ============================================
  // FLUJO DE CAJA STATE
  // ============================================
  interface CashFlowTransaction {
    id: string;
    date: string;
    type: 'ingreso' | 'egreso';
    amount: number;
    category: string;
    description: string;
    reference?: string;
    paymentMethod?: string;
  }

  const [cashFlowTransactions, setCashFlowTransactions] = useState<CashFlowTransaction[]>(() => {
    const saved = localStorage.getItem("flikicookie_cashflow");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse cashflow", e);
      }
    }
    return [
      { id: "cf-1", date: "2026-08-01", type: "ingreso", amount: 450, category: "Ventas Directas", description: "Venta de 12 cajas de galletas" },
      { id: "cf-2", date: "2026-08-02", type: "egreso", amount: 180, category: "Materia Prima", description: "Compra de harina y mantequilla" },
      { id: "cf-3", date: "2026-08-03", type: "ingreso", amount: 320, category: "Delivery", description: "Pedido de Panadería El Sol" },
      { id: "cf-4", date: "2026-08-04", type: "egreso", amount: 75, category: "Servicios (Luz, Agua, Internet)", description: "Pago de luz agosto" },
      { id: "cf-5", date: "2026-08-05", type: "egreso", amount: 200, category: "Mano de Obra Temporal", description: "Ayudante para evento" },
    ];
  });

  useEffect(() => {
    localStorage.setItem("flikicookie_cashflow", JSON.stringify(cashFlowTransactions));
  }, [cashFlowTransactions]);

  // Cash Flow Form State
  const [showCashFlowForm, setShowCashFlowForm] = useState(false);
  const [cashFlowForm, setCashFlowForm] = useState({
    type: "ingreso" as "ingreso" | "egreso",
    date: new Date().toISOString().split('T')[0],
    amount: "",
    category: "",
    description: "",
    reference: "",
    paymentMethod: "Efectivo"
  });

  const handleAddCashFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashFlowForm.amount || !cashFlowForm.category || !cashFlowForm.description) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    const newTransaction: CashFlowTransaction = {
      id: `cf-${Date.now()}`,
      date: cashFlowForm.date,
      type: cashFlowForm.type,
      amount: parseFloat(cashFlowForm.amount),
      category: cashFlowForm.category,
      description: cashFlowForm.description,
      reference: cashFlowForm.reference,
      paymentMethod: cashFlowForm.paymentMethod
    };

    setCashFlowTransactions(prev => [newTransaction, ...prev]);
    setShowCashFlowForm(false);
    setCashFlowForm({
      type: "ingreso",
      date: new Date().toISOString().split('T')[0],
      amount: "",
      category: "",
      description: "",
      reference: "",
      paymentMethod: "Efectivo"
    });
  };

  const handleDeleteCashFlow = (id: string) => {
    if (window.confirm("¿Eliminar esta transacción?")) {
      setCashFlowTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const getCashFlowSummary = () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Calculate Monday of current week (weekStart = today - dayOfWeek, where Monday=0, Sunday=6)
    const dayOfWeek = (now.getDay() + 6) % 7; // Convert: Mon=0, Tue=1, ..., Sun=6
    const weekStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    const weekStart = `${weekStartDate.getFullYear()}-${String(weekStartDate.getMonth() + 1).padStart(2, '0')}-${String(weekStartDate.getDate()).padStart(2, '0')}`;

    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const todayIncome = cashFlowTransactions.filter(t => t.type === 'ingreso' && t.date === today).reduce((sum, t) => sum + t.amount, 0);
    const todayExpense = cashFlowTransactions.filter(t => t.type === 'egreso' && t.date === today).reduce((sum, t) => sum + t.amount, 0);
    
    const weekIncome = cashFlowTransactions.filter(t => t.type === 'ingreso' && t.date >= weekStart).reduce((sum, t) => sum + t.amount, 0);
    const weekExpense = cashFlowTransactions.filter(t => t.type === 'egreso' && t.date >= weekStart).reduce((sum, t) => sum + t.amount, 0);
    
    const monthIncome = cashFlowTransactions.filter(t => t.type === 'ingreso' && t.date >= monthStart).reduce((sum, t) => sum + t.amount, 0);
    const monthExpense = cashFlowTransactions.filter(t => t.type === 'egreso' && t.date >= monthStart).reduce((sum, t) => sum + t.amount, 0);

    return {
      today: { income: todayIncome, expense: todayExpense, balance: todayIncome - todayExpense },
      week: { income: weekIncome, expense: weekExpense, balance: weekIncome - weekExpense },
      month: { income: monthIncome, expense: monthExpense, balance: monthIncome - monthExpense }
    };
  };

  // Purchase Order Form state
  const [showPOForm, setShowPOForm] = useState(false);
  const [poForm, setPoForm] = useState({
    providerId: "",
    materialName: "",
    quantity: "1",
    unit: "Kg",
    unitPrice: "",
    expectedDeliveryDate: "",
    notes: ""
  });

  // Expanded Client History State
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Client Note Form state
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({
    customerName: "",
    customerPhone: "",
    note: "",
    channel: "WhatsApp" as "WhatsApp" | "Llamada" | "Presencial" | "Instagram / FB" | "Otro"
  });

  const handleSavePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.providerId || !poForm.materialName) {
      alert("Por favor selecciona un proveedor e ingresa el material.");
      return;
    }

    const providerObj = providers.find(p => p.id === poForm.providerId);
    const qty = parseFloat(poForm.quantity) || 1;
    const price = parseFloat(poForm.unitPrice) || 0;
    const total = qty * price;

    const newPO: PurchaseOrder = {
      id: `OC-${Math.floor(1000 + Math.random() * 9000)}`,
      providerId: poForm.providerId,
      providerName: providerObj ? providerObj.name : "Proveedor Taller",
      items: [
        {
          materialName: poForm.materialName,
          quantity: qty,
          unit: poForm.unit,
          unitPrice: price
        }
      ],
      totalAmount: total,
      status: "Enviado a Proveedor",
      paymentStatus: "Pendiente",
      createdAt: new Date().toISOString(),
      expectedDeliveryDate: poForm.expectedDeliveryDate || new Date().toISOString().slice(0, 10),
      notes: poForm.notes
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    setShowPOForm(false);
    setPoForm({
      providerId: "",
      materialName: "",
      quantity: "1",
      unit: "Kg",
      unitPrice: "",
      expectedDeliveryDate: "",
      notes: ""
    });
  };

  const handleDeletePurchaseOrder = (id: string) => {
    if (confirm("¿Eliminar esta orden de compra del historial?")) {
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
    }
  };

  const handleSaveClientNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.customerName || !noteForm.note) {
      alert("Por favor ingresa el nombre del cliente y el contenido de la nota.");
      return;
    }

    const newNote: ClientNote = {
      id: `NOTE-${Date.now().toString().slice(-4)}`,
      customerName: noteForm.customerName,
      customerPhone: noteForm.customerPhone,
      note: noteForm.note,
      channel: noteForm.channel,
      createdAt: new Date().toISOString(),
      createdBy: "Atención Flikicookie"
    };

    setClientNotes(prev => [newNote, ...prev]);
    setShowNoteForm(false);
    setNoteForm({
      customerName: "",
      customerPhone: "",
      note: "",
      channel: "WhatsApp"
    });
  };

  const handleDeleteClientNote = (id: string) => {
    if (confirm("¿Eliminar esta nota de conversación?")) {
      setClientNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const handlePrintPurchaseOrder = (po: PurchaseOrder) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orden de Compra ${po.id} - Flikicookie</title>
          <style>
            body { font-family: sans-serif; padding: 25px; max-width: 650px; margin: 0 auto; color: var(--color-art-text); }
            .header { text-align: center; border-bottom: 2px solid var(--color-art-border); padding-bottom: 10px; }
            .box { border: 1px solid var(--color-art-line); padding: 12px; margin: 15px 0; background: var(--color-art-card); font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background: var(--color-art-border); color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 15px; color: var(--color-art-border); }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🍪 Flikicookie Artisan Bakery</h2>
            <p><strong>ÓRDEN DE COMPRA A PROVEEDOR N° ${po.id}</strong></p>
          </div>
          <div class="box">
            <p><strong>PROVEEDOR:</strong> ${po.providerName}</p>
            <p><strong>FECHA EMISIÓN:</strong> ${new Date(po.createdAt).toLocaleDateString()}</p>
            <p><strong>FECHA ESTIMADA ENTREGA:</strong> ${po.expectedDeliveryDate || 'A convenir'}</p>
            <p><strong>ESTADO OPERATIVO:</strong> ${po.status}</p>
            <p><strong>ESTADO DE PAGO:</strong> ${po.paymentStatus}</p>
            ${po.notes ? `<p><strong>NOTAS DE PEDIDO:</strong> ${po.notes}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Insumo / Material</th>
                <th>Cant.</th>
                <th>Unidad</th>
                <th style="text-align: right;">P. Unit</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${po.items.map(item => `
                <tr>
                  <td>${item.materialName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td style="text-align: right;">S/. ${item.unitPrice.toFixed(2)}</td>
                  <td style="text-align: right;">S/. ${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">TOTAL ORDEN DE COMPRA: S/. ${po.totalAmount.toFixed(2)}</div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Synchronize/initialize stock properties for catalog items (MenuItems)
  useEffect(() => {
    let changed = false;
    const updated = menuItems.map(item => {
      let uItem = { ...item };
      if (uItem.stock === undefined) {
        uItem.stock = Math.floor(Math.random() * 30) + 12; // default stock
        changed = true;
      }
      if (uItem.criticalStock === undefined) {
        uItem.criticalStock = 5;
        changed = true;
      }
      return uItem;
    });
    if (changed) {
      setMenuItems(updated);
    }
  }, [menuItems, setMenuItems]);

  // Browser Notifications Permission State & Helpers
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  // Metrics Dashboard Time Range filter
  const [metricsTimeRange, setMetricsTimeRange] = useState<"today" | "week" | "month" | "all">("month");

  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("Su navegador no soporta notificaciones de escritorio.");
      return;
    }

    if (Notification.permission === "denied") {
      alert("Las notificaciones están bloqueadas por su navegador.\n\nPara activarlas:\n1. Haga clic en el icono 🔒 o ⚠️ junto a la barra de direcciones\n2. Seleccione 'Permitir notificaciones'\n3. Recargue la página");
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          new Notification("🔔 Notificaciones Activadas", {
            body: "Flikicookie Artisan Bakery te notificará sobre nuevos pedidos y cambios de estado.",
            icon: "/src/assets/images/Emblema%20Flikicookie.png"
          });
        }
      });
    }
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/src/assets/images/Emblema%20Flikicookie.png"
        });
      } catch (e) {
        console.error("Error dispatching browser notification", e);
      }
    }
  };

  // Local Web Audio API Synthesizer chime player (double tone bell sound)
  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Note 1 (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.5);
      
      // Note 2 (F#5) slightly offset
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(739.99, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
      gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.65);
    } catch (error) {
      console.warn("Audio Context playback failed or blocked by autoplay policy.", error);
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      prevOrdersRef.current = orders;
      return;
    }
    
    // Find genuinely new orders that were not present in previous render
    const newOrders = orders.filter(o => !prevOrdersRef.current.some(prev => prev.id === o.id));

    // Find status changes
    const statusChanges = orders.filter(o => {
      const prevOrder = prevOrdersRef.current.find(prev => prev.id === o.id);
      return prevOrder && prevOrder.status !== o.status;
    });
    
    if (newOrders.length > 0) {
      newOrders.forEach(newOrder => {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: OrderToast = {
          id,
          order: newOrder,
          message: `¡Nuevo pedido de ${newOrder.customerName}!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setToasts(prev => [toast, ...prev]);
        playChime();
        sendBrowserNotification(
          `🔔 Nuevo Pedido Recibido`,
          `${newOrder.customerName} ha realizado un pedido por un monto de S/. ${newOrder.totalAmount.toFixed(2)}`
        );
        
        // Auto remove in 8 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 8000);
      });
    }

    if (statusChanges.length > 0) {
      statusChanges.forEach(changedOrder => {
        const id = "status-" + Math.random().toString(36).substring(2, 9);
        const toast: OrderToast = {
          id,
          order: changedOrder,
          message: `⚙️ Pedido de ${changedOrder.customerName} cambió a: ${changedOrder.status}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setToasts(prev => [toast, ...prev]);
        playChime();
        sendBrowserNotification(
          `📦 Pedido Actualizado - ${changedOrder.customerName}`,
          `El estado del pedido cambió a: ${changedOrder.status}`
        );
        
        // Auto remove in 8 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 8000);
      });
    }
    
    prevOrdersRef.current = orders;
  }, [orders]);

  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<KitchenAnalysis | null>(null);
  const [showWhatsAppTemplate, setShowWhatsAppTemplate] = useState<string | null>(null);

  // Search states
  const [searchOrderQuery, setSearchOrderQuery] = useState("");
  const [searchClientQuery, setSearchClientQuery] = useState("");
  const [searchProviderQuery, setSearchProviderQuery] = useState("");
  const [searchMenuQuery, setSearchMenuQuery] = useState("");

  const handleExportOrdersCSV = () => {
    const headers = ["ID Pedido", "Cliente", "Teléfono", "Email", "Tipo", "Fecha Entrega", "Hora", "Dirección", "Total (PEN)", "Estado", "Método Pago", "Fecha Creación"];
    const rows = orders.map(o => [
      o.id,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail}"`,
      `"${o.orderType}"`,
      o.deliveryDate,
      o.deliveryTime,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      o.totalAmount.toFixed(2),
      o.status,
      `"${o.paymentMethod.replace(/"/g, '""')}"`,
      new Date(o.createdAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pedidos_flikicookie_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Forms states
  const [showClientForm, setShowClientForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  const [showProviderForm, setShowProviderForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [providerForm, setProviderForm] = useState({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    suppliedItems: ""
  });

  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "especiales", // default to specialties (Especialidades de Autor)
    prepTime: "25 min",
    allergens: "",
    image: "",
    wholesalePrice: "",
    wholesaleMinQty: "",
    seasonalTag: "",
    promoPrice: ""
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter columns for Orders pipeline
  const statuses: OrderStatus[] = [
    "Pendiente",
    "En Preparación",
    "En Horno",
    "Decorando",
    "Listo",
    "Entregado"
  ];

  // Helper calculation for Monthly sales (including simulated baseline months)
  const getMonthlySales = () => {
    const monthsData: { [key: string]: number } = {
      "Mayo": 1840.00,
      "Junio": 2450.00
    };
    orders.forEach(o => {
      const date = new Date(o.createdAt);
      let monthName = "Julio";
      if (!isNaN(date.getTime())) {
        monthName = date.toLocaleString("es-PE", { month: "long" });
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      }
      monthsData[monthName] = (monthsData[monthName] || 0) + o.totalAmount;
    });
    return monthsData;
  };

  const getFlavorCounts = () => {
    const counts: { [key: string]: number } = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        if (i.isCustom && i.customSpec) {
          const flv = i.customSpec.flavor;
          counts[flv] = (counts[flv] || 0) + i.quantity;
        } else {
          counts[i.name] = (counts[i.name] || 0) + i.quantity;
        }
      });
    });
    return counts;
  };

  const getMonthlyRevenueData = () => {
    const monthsData = getMonthlySales();
    return Object.entries(monthsData).map(([month, total]) => ({
      month,
      Ingresos: parseFloat(total.toFixed(2))
    }));
  };

  const getSalesByCategory = () => {
    const categorySales: { [key: string]: number } = {
      "Clásicas": 120.00, // baseline simulated start
      "Rellenas": 280.00,
      "Especiales": 410.00,
      "Bebidas": 65.00,
      "Personalizadas": 950.00
    };

    orders.forEach(o => {
      o.items.forEach(i => {
        if (i.isCustom) {
          categorySales["Personalizadas"] = (categorySales["Personalizadas"] || 0) + (i.price * i.quantity);
        } else {
          const menuItem = menuItems.find(m => m.name.toLowerCase() === i.name.toLowerCase() || m.id === i.id);
          const cat = menuItem?.category;
          if (cat === "clasicas") {
            categorySales["Clásicas"] = (categorySales["Clásicas"] || 0) + (i.price * i.quantity);
          } else if (cat === "rellenas") {
            categorySales["Rellenas"] = (categorySales["Rellenas"] || 0) + (i.price * i.quantity);
          } else if (cat === "especiales") {
            categorySales["Especiales"] = (categorySales["Especiales"] || 0) + (i.price * i.quantity);
          } else if (cat === "bebidas") {
            categorySales["Bebidas"] = (categorySales["Bebidas"] || 0) + (i.price * i.quantity);
          } else {
            categorySales["Rellenas"] = (categorySales["Rellenas"] || 0) + (i.price * i.quantity);
          }
        }
      });
    });

    return Object.entries(categorySales).map(([category, value]) => ({
      category,
      Ventas: parseFloat(value.toFixed(2))
    }));
  };

  // Raw Materials calculations
  const calculatePendingIngredients = () => {
    const activeOrders = orders.filter(o => o.status !== "Entregado");
    let totalFlour = 0;
    let totalButter = 0;
    let totalSugar = 0;
    let totalChips = 0;
    let customFlavors: { [key: string]: number } = {};
    let customFillings: { [key: string]: number } = {};
    
    activeOrders.forEach(o => {
      o.items.forEach(i => {
        const q = i.quantity;
        if (i.isCustom && i.customSpec) {
          const t = i.customSpec.tiers;
          let baseFlour = 500;
          let baseButter = 350;
          let baseSugar = 300;
          let baseChips = 150;
          if (t === 2) {
            baseFlour = 900; baseButter = 600; baseSugar = 500; baseChips = 250;
          } else if (t === 3) {
            baseFlour = 1400; baseButter = 950; baseSugar = 800; baseChips = 400;
          }
          totalFlour += baseFlour * q;
          totalButter += baseButter * q;
          totalSugar += baseSugar * q;
          totalChips += baseChips * q;
          
          const flv = i.customSpec.flavor;
          customFlavors[flv] = (customFlavors[flv] || 0) + (100 * q);
          
          const fill = i.customSpec.filling;
          customFillings[fill] = (customFillings[fill] || 0) + (200 * q);
        } else {
          totalFlour += 150 * q;
          totalButter += 100 * q;
          totalSugar += 80 * q;
          totalChips += 40 * q;
        }
      });
    });

    return { totalFlour, totalButter, totalSugar, totalChips, customFlavors, customFillings };
  };

  const getInventoryAlerts = () => {
    const alerts: { type: "item" | "material"; name: string; current: number; threshold: number; unit?: string }[] = [];
    
    // Check MenuItems stock
    menuItems.forEach(item => {
      const stock = item.stock ?? 0;
      const crit = item.criticalStock ?? 5;
      if (stock <= crit) {
        alerts.push({
          type: "item",
          name: item.name,
          current: stock,
          threshold: crit
        });
      }
    });

    // Check RawMaterials stock (subtracting pending active order requirements)
    const { totalFlour, totalButter, totalSugar, totalChips } = calculatePendingIngredients();
    
    let totalEggs = 0;
    let totalCoffee = 0;
    orders.filter(o => o.status !== "Entregado").forEach(o => {
      o.items.forEach(i => {
        const q = i.quantity;
        if (!i.isCustom) {
          const mItem = menuItems.find(mi => mi.name === i.name);
          if (mItem) {
            if (mItem.category === "bebidas") {
              // Standard drink sugar is about 15g
              if (mItem.name.toLowerCase().includes("café") || mItem.name.toLowerCase().includes("espresso") || mItem.name.toLowerCase().includes("capuccino") || mItem.name.toLowerCase().includes("mockachino")) {
                totalCoffee += 25 * q;
              }
            } else {
              totalEggs += 1 * q;
              if (mItem.name.toLowerCase().includes("café") || mItem.id === "m2") {
                totalCoffee += 15 * q;
              }
            }
          } else {
            totalEggs += 1 * q;
          }
        } else {
          totalEggs += 2 * q; // Custom cakes use 2 eggs
        }
      });
    });

    rawMaterials.forEach(rm => {
      let pendingUsage = 0;
      if (rm.id === "rw-1") pendingUsage = totalFlour;
      else if (rm.id === "rw-2") pendingUsage = totalButter;
      else if (rm.id === "rw-3") pendingUsage = totalSugar;
      else if (rm.id === "rw-4") pendingUsage = totalChips;
      else if (rm.id === "rw-5") pendingUsage = totalEggs;
      else if (rm.id === "rw-6") pendingUsage = totalCoffee;

      const realAvailable = rm.stock - pendingUsage;
      if (realAvailable <= rm.criticalLimit) {
        alerts.push({
          type: "material",
          name: rm.name,
          current: realAvailable,
          threshold: rm.criticalLimit,
          unit: rm.unit
        });
      }
    });

    return alerts;
  };

  const handlePrintSection = (title: string, htmlContent: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor habilita las ventanas emergentes (popups) para poder imprimir.");
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Flikicookie - ${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: var(--color-art-deep);
              padding: 40px;
              background-color: #fff;
              margin: 0;
            }
            h1, h2, h3 {
              font-family: 'Playfair Display', serif;
              color: var(--color-art-deep);
            }
            .header {
              border-bottom: 2px solid var(--color-art-deep);
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              font-style: italic;
            }
            .timestamp {
              font-size: 11px;
              color: var(--color-art-soft);
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              margin-bottom: 30px;
            }
            th {
              background-color: var(--color-art-card);
              border-bottom: 2px solid var(--color-art-linesoft);
              color: var(--color-art-deep);
              font-weight: bold;
              text-align: left;
              padding: 12px;
              font-size: 11px;
              text-transform: uppercase;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid var(--color-art-card);
              font-size: 11px;
            }
            tr:nth-child(even) {
              background-color: var(--color-art-card);
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .total-row {
              font-weight: bold;
              font-size: 13px;
              background-color: var(--color-art-card) !important;
            }
            .card {
              border: 1px solid var(--color-art-linesoft);
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              background-color: var(--color-art-card);
            }
            .footer {
              margin-top: 50px;
              border-top: 1px solid var(--color-art-linesoft);
              padding-top: 20px;
              text-align: center;
              font-size: 10px;
              color: var(--color-art-soft);
            }
            @media print {
              .no-print { display: none; }
              body { padding: 0; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Flikicookie Artisan Bakery</div>
              <div style="font-size: 12px; color: var(--color-art-soft);">Cusco, Perú</div>
            </div>
            <div class="timestamp">
              Generado: ${new Date().toLocaleString("es-CL")}
            </div>
          </div>
          
          <h2>${title}</h2>
          ${htmlContent}
          
          <div class="footer">
            Documento administrativo de Flikicookie. Todos los derechos reservados.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Official Commercial Invoice Generator & Printer
  const handlePrintInvoice = (order: Order) => {
    const subtotal = order.totalAmount / 1.18;
    const igv = order.totalAmount - subtotal;
    const issueDate = new Date(order.createdAt || Date.now()).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const invoiceNum = `F001-${(order.id.replace(/\D/g, '') || Math.floor(100000 + Math.random() * 900000).toString()).padStart(6, '0')}`;

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura Electrónica - ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; margin: 0; padding: 30px; color: var(--color-art-text); background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--color-art-border); padding-bottom: 20px; margin-bottom: 24px; }
            .brand-col { max-width: 60%; }
            .logo { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: bold; color: var(--color-art-border); margin: 0 0 4px 0; }
            .tagline { font-size: 11px; color: var(--color-art-muted); margin: 0 0 8px 0; }
            .company-meta { font-size: 11px; color: var(--color-art-border); line-height: 1.5; }
            .invoice-box { border: 2px solid var(--color-art-border); padding: 14px 20px; text-align: center; border-radius: 8px; background: var(--color-art-panel); min-width: 220px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .invoice-box h3 { margin: 0; font-size: 13px; color: var(--color-art-border); text-transform: uppercase; letter-spacing: 1px; }
            .invoice-box p { margin: 4px 0 0 0; font-size: 13px; font-weight: bold; font-family: monospace; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; font-size: 12px; }
            .section-title { font-size: 11px; font-weight: bold; color: var(--color-art-muted); text-transform: uppercase; border-bottom: 1px solid var(--color-art-panel); padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
            th { background: var(--color-art-border); color: #ffffff; text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 10px 12px; border-bottom: 1px solid var(--color-art-panel); vertical-align: top; }
            .totals-container { display: flex; justify-content: flex-end; margin-bottom: 24px; }
            .totals { width: 280px; font-size: 12px; }
            .totals table { margin-bottom: 0; }
            .totals td { border: none; padding: 5px 8px; }
            .totals .grand-total { font-weight: bold; font-size: 15px; color: var(--color-art-border); border-top: 2px solid var(--color-art-border); padding-top: 8px; }
            .footer { margin-top: 40px; border-top: 1px solid var(--color-art-panel); padding-top: 18px; font-size: 10px; color: var(--color-art-muted); text-align: center; line-height: 1.6; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; background: rgba(233,30,140,0.08); color: var(--color-art-accent); text-transform: uppercase; }
            .custom-box { font-size: 10.5px; color: var(--color-art-border); background: var(--color-art-panel); border: 1px solid var(--color-art-panel); padding: 6px 10px; border-radius: 6px; margin-top: 4px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-col">
              <h1 class="logo">🍪 ${companyConfig.companyName || 'Flikicookie Artisan Bakery'}</h1>
              <p class="tagline">Repostería Fina & Galletas de Autor - Cusco</p>
              <div class="company-meta">
                <strong>Teléfono:</strong> ${companyConfig.phone || '+51 984 123 456'}<br/>
                <strong>Dirección:</strong> ${companyConfig.address || 'Av. El Sol 124, Cusco, Perú'}
              </div>
            </div>
            <div class="invoice-box">
              <h3>BOLETA / FACTURA ELECTRÓNICA</h3>
              <p style="color: var(--color-art-brown); margin-top: 6px;">R.U.C. N° 20601234567</p>
              <p style="color: var(--color-art-caramel); font-size: 15px; margin-top: 4px;">${invoiceNum}</p>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="section-title">DATOS DEL CLIENTE</div>
              <p style="margin: 3px 0;"><strong>Cliente:</strong> ${order.customerName}</p>
              <p style="margin: 3px 0;"><strong>Teléfono / WhatsApp:</strong> ${order.customerPhone || 'N/A'}</p>
              <p style="margin: 3px 0;"><strong>Correo Electrónico:</strong> ${order.customerEmail || 'N/A'}</p>
              <p style="margin: 3px 0;"><strong>Dirección de Entrega:</strong> ${order.deliveryAddress || 'Recojo en tienda'}</p>
            </div>
            <div>
              <div class="section-title">DETALLES DE LA OPERACIÓN</div>
              <p style="margin: 3px 0;"><strong>Fecha de Emisión:</strong> ${issueDate}</p>
              <p style="margin: 3px 0;"><strong>Fecha Programada:</strong> ${order.deliveryDate} (${order.deliveryTime} hrs)</p>
              <p style="margin: 3px 0;"><strong>Método de Pago:</strong> ${order.paymentMethod} <span class="badge">CANCELADO</span></p>
              <p style="margin: 3px 0;"><strong>Estado en Taller:</strong> ${order.status}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 8%;">Cant.</th>
                <th style="width: 52%;">Descripción del Producto / Especificación</th>
                <th style="width: 20%; text-align:right;">Precio Unitario</th>
                <th style="width: 20%; text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="font-family: monospace; font-weight: bold; text-align: center;">${item.quantity}</td>
                  <td>
                    <strong>${item.name}</strong>
                    ${item.isCustom && item.customSpec ? `
                      <div class="custom-box">
                        🍰 <strong>Torta Personalizada:</strong> ${item.customSpec.tiers} piso(s) | Bizcocho: ${item.customSpec.flavor} | Relleno: ${item.customSpec.filling} | Cobertura: ${item.customSpec.frostingName}<br/>
                        ✍️ <strong>Dedicatoria Especial:</strong> "${item.customSpec.inscription || 'Sin dedicatoria'}"
                      </div>
                    ` : ''}
                  </td>
                  <td style="text-align:right; font-family: monospace;">S/. ${(item.price).toFixed(2)}</td>
                  <td style="text-align:right; font-family: monospace; font-weight: bold;">S/. ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-container">
            <div class="totals">
              <table>
                <tr>
                  <td>Subtotal (Op. Gravada):</td>
                  <td style="text-align:right; font-family: monospace;">S/. ${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>I.G.V. (18%):</td>
                  <td style="text-align:right; font-family: monospace;">S/. ${igv.toFixed(2)}</td>
                </tr>
                <tr class="grand-total">
                  <td>TOTAL COMPROBANTE:</td>
                  <td style="text-align:right; font-family: monospace;">S/. ${order.totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>

          <div class="footer">
            <p>¡Gracias por su preferencia! 🍪 <strong>${companyConfig.companyName || 'Flikicookie Artisan Bakery'}</strong></p>
            <p>Representación impresa de la Boleta/Factura Electrónica emitida según normativa SUNAT Perú.<br/>
            Conserve este comprobante para cualquier cambio o garantía de producto.</p>
          </div>
        </body>
      </html>
    `;

    handlePrintSection(`Factura_${order.id}`, invoiceHtml);
  };

  // Metrics Dashboard helper calculations
  const getFilteredOrdersForMetrics = () => {
    const now = new Date();
    return orders.filter(o => {
      const created = new Date(o.createdAt || Date.now());
      if (metricsTimeRange === "today") {
        return created.toDateString() === now.toDateString();
      } else if (metricsTimeRange === "week") {
        const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      } else if (metricsTimeRange === "month") {
        const diffDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  };

  const getTopSellingProductForMetrics = () => {
    const list = getFilteredOrdersForMetrics();
    const productQuantities: Record<string, number> = {};
    list.forEach(o => {
      o.items.forEach(i => {
        productQuantities[i.name] = (productQuantities[i.name] || 0) + i.quantity;
      });
    });
    const sorted = Object.entries(productQuantities).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      return { name: sorted[0][0], qty: sorted[0][1] };
    }
    return { name: "N/A", qty: 0 };
  };

  const getMetricsTrendData = () => {
    const list = getFilteredOrdersForMetrics();
    const groups: Record<string, { date: string; ventas: number; pedidos: number }> = {};
    
    list.forEach(o => {
      const d = new Date(o.createdAt || Date.now());
      const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!groups[dateKey]) {
        groups[dateKey] = { date: dateKey, ventas: 0, pedidos: 0 };
      }
      groups[dateKey].ventas += o.totalAmount;
      groups[dateKey].pedidos += 1;
    });

    const result = Object.values(groups);
    if (result.length === 0) {
      return [{ date: "Hoy", ventas: 0, pedidos: 0 }];
    }
    return result;
  };

  const getMetricsStatusData = () => {
    const list = getFilteredOrdersForMetrics();
    const counts: Record<string, number> = {
      "Pendiente": 0,
      "En Preparación": 0,
      "En Horno": 0,
      "Decorando": 0,
      "Listo": 0,
      "Entregado": 0
    };
    list.forEach(o => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });

    const colorsMap: Record<string, string> = {
      "Pendiente": "#F43F5E",
      "En Preparación": "#A855F7",
      "En Horno": "#F59E0B",
      "Decorando": "#EC4899",
      "Listo": "#3B82F6",
      "Entregado": "#10B981"
    };

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([status, value]) => ({
        name: status,
        value,
        color: colorsMap[status] || "#64748B"
      }));
  };

  const getTopProductsChartData = () => {
    const map: Record<string, { name: string; cantidad: number; ingresos: number }> = {};
    getFilteredOrdersForMetrics().forEach(o => {
      o.items.forEach(i => {
        if (!map[i.name]) {
          map[i.name] = { name: i.name, cantidad: 0, ingresos: 0 };
        }
        map[i.name].cantidad += i.quantity;
        map[i.name].ingresos += i.price * i.quantity;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  };

  const getPaymentMethodsChartData = () => {
    const map: Record<string, number> = {};
    getFilteredOrdersForMetrics().forEach(o => {
      const pm = o.paymentMethod || "Otros";
      map[pm] = (map[pm] || 0) + o.totalAmount;
    });
    return Object.entries(map).map(([method, total]) => ({
      name: method,
      total
    }));
  };

  const handlePrintReports = (type: "all" | "orders" | "compras" | "entregas" | "stats" | "providers") => {
    let title = "";
    let htmlContent = "";

    const activeOrders = orders.filter(o => o.status !== "Entregado");
    const totalActiveAmount = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    if (type === "orders" || type === "all") {
      title += title ? " & " : "";
      title += "Reporte de Pedidos Activos";
      htmlContent += `
        <h3>Resumen de Pedidos Activos (${activeOrders.length} pedidos)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: var(--color-art-card);">
              <th style="padding: 10px; border-bottom: 2px solid var(--color-art-linesoft); text-align: left; font-size:11px;">ID</th>
              <th style="padding: 10px; border-bottom: 2px solid var(--color-art-linesoft); text-align: left; font-size:11px;">Cliente</th>
              <th style="padding: 10px; border-bottom: 2px solid var(--color-art-linesoft); text-align: left; font-size:11px;">Fecha/Hora</th>
              <th style="padding: 10px; border-bottom: 2px solid var(--color-art-linesoft); text-align: left; font-size:11px;">Despacho</th>
              <th style="padding: 10px; border-bottom: 2px solid var(--color-art-linesoft); text-align: left; font-size:11px;">Productos</th>
              <th style="padding: 10px; border-bottom: 2px solid var(--color-art-linesoft); text-align: left; font-size:11px;">Método Pago</th>
              <th style="padding: 10px; border-bottom: 2px solid var(--color-art-linesoft); text-align: left; font-size:11px;">Estado</th>
              <th style="padding: 10px; border-bottom: 2px solid var(--color-art-linesoft); text-align: right; font-size:11px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${activeOrders.map(o => `
              <tr style="border-bottom: 1px solid var(--color-art-card);">
                <td style="padding: 8px; font-family: monospace; font-size:11px; font-weight: bold;">${o.id}</td>
                <td style="padding: 8px; font-size:11px;"><strong>${o.customerName}</strong><br><span style="font-size:10px; color:#666;">${o.customerPhone}</span></td>
                <td style="padding: 8px; font-size:11px;">${o.deliveryDate}<br>${o.deliveryTime} hrs</td>
                <td style="padding: 8px; font-size:11px;">${o.orderType}</td>
                <td style="padding: 8px; font-size:10px; line-height:1.3;">
                  ${o.items.map(i => {
                    if (i.isCustom && i.customSpec) {
                      return `• <strong>Galleta Gigante Personalizada</strong> (${i.customSpec.tiers} Pisos, Masa: ${i.customSpec.flavor}, Relleno: ${i.customSpec.filling}) x${i.quantity}`;
                    } else {
                      return `• ${i.name} x${i.quantity}`;
                    }
                  }).join('<br>')}
                </td>
                <td style="padding: 8px; font-size:11px;">${o.paymentMethod}</td>
                <td style="padding: 8px; font-size:10px;"><span style="background: #F3EAF7; color: #6B21A8; padding: 2px 6px; border-radius: 4px; font-weight:bold;">${o.status}</span></td>
                <td style="padding: 8px; font-size:11px; font-weight: bold; text-align: right;">S/. ${o.totalAmount.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr style="background-color: var(--color-art-card); font-weight: bold;">
              <td colspan="7" style="padding: 10px; text-align: right; font-size:12px;">TOTAL FACTURADO PENDIENTE:</td>
              <td style="padding: 10px; text-align: right; font-size:12px; color: var(--color-art-deep);">S/. ${totalActiveAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    if (type === "compras" || type === "all") {
      const { totalFlour, totalButter, totalSugar, totalChips, customFlavors, customFillings } = calculatePendingIngredients();
      title += title ? " & " : "";
      title += "Insumos y Compras";
      htmlContent += `
        <div style="page-break-before: ${type === 'all' ? 'always' : 'avoid'};">
          <h3>Lista de Insumos Consolidados y Compras de Emergencia</h3>
          <p style="font-size: 11px; color: #555; margin-bottom:15px;">Materia prima requerida para fabricar los ${activeOrders.length} pedidos activos en taller.</p>
          
          <div style="display: flex; gap: 20px; margin-bottom: 25px;">
            <div style="flex: 1; border: 1px solid var(--color-art-linesoft); padding: 15px; border-radius: 6px; background-color: var(--color-art-card);">
              <h4 style="margin-top:0; color: var(--color-art-deep); border-bottom: 1px solid var(--color-art-linesoft); padding-bottom:5px; font-size:13px;">🌾 Insumos Secos e Ingredientes Base</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--color-art-linesoft);">
                    <th style="padding: 6px; text-align:left;">Ingrediente</th>
                    <th style="padding: 6px; text-align:right;">Cantidad Requerida</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 6px;">Harina Pastelera Selecta</td>
                    <td style="padding: 6px; text-align:right; font-weight:bold;">${(totalFlour / 1000).toFixed(2)} kg</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px;">Mantequilla del Valle Cusco</td>
                    <td style="padding: 6px; text-align:right; font-weight:bold;">${(totalButter / 1000).toFixed(2)} kg</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px;">Azúcar Rubia Extra</td>
                    <td style="padding: 6px; text-align:right; font-weight:bold;">${(totalSugar / 1000).toFixed(2)} kg</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px;">Chispas de Cacao Cusco 60%</td>
                    <td style="padding: 6px; text-align:right; font-weight:bold;">${(totalChips / 1000).toFixed(2)} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="flex: 1; border: 1px solid var(--color-art-linesoft); padding: 15px; border-radius: 6px; background-color: var(--color-art-card);">
              <h4 style="margin-top:0; color: var(--color-art-deep); border-bottom: 1px solid var(--color-art-linesoft); padding-bottom:5px; font-size:13px;">🎨 Masas Premium y Rellenos</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--color-art-linesoft);">
                    <th style="padding: 6px; text-align:left;">Sabor o Relleno</th>
                    <th style="padding: 6px; text-align:right;">Consumo Estimado</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.keys(customFlavors).length > 0 ? Object.keys(customFlavors).map(k => `
                    <tr>
                      <td style="padding: 6px;">Saborizante Masa: <strong>${k}</strong></td>
                      <td style="padding: 6px; text-align:right; font-weight:bold;">${customFlavors[k]} g</td>
                    </tr>
                  `).join('') : `<tr><td colspan="2" style="padding: 6px; text-align:center; color:#888;">Ningún sabor especial</td></tr>`}
                  ${Object.keys(customFillings).length > 0 ? Object.keys(customFillings).map(k => `
                    <tr>
                      <td style="padding: 6px;">Relleno Tradicional: <strong>${k}</strong></td>
                      <td style="padding: 6px; text-align:right; font-weight:bold;">${customFillings[k]} g</td>
                    </tr>
                  `).join('') : `<tr><td colspan="2" style="padding: 6px; text-align:center; color:#888;">Ningún relleno especial</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    if (type === "entregas" || type === "all") {
      title += title ? " & " : "";
      title += "Lista de Despachos";
      htmlContent += `
        <div style="page-break-before: ${type === 'all' ? 'always' : 'avoid'};">
          <h3>Listado Oficial de Entregas & Despachos de Hoy</h3>
          <p style="font-size: 11px; color: #555; margin-bottom: 15px;">Guía de despacho física para el repartidor y el centro de control de Flikicookie.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: var(--color-art-card);">
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Pedido ID</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Cliente / Cel</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Forma Entrega</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Dirección de Envío</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Hora Pactada</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Método Pago</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:right;">Cobro</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:center; width:120px;">Firma de Recibido</th>
              </tr>
            </thead>
            <tbody>
              ${activeOrders.map(o => `
                <tr style="border-bottom: 1px solid var(--color-art-card); height: 35px;">
                  <td style="padding: 6px; font-family: monospace; font-weight:bold;">${o.id}</td>
                  <td style="padding: 6px;"><strong>${o.customerName}</strong><br>${o.customerPhone}</td>
                  <td style="padding: 6px;">${o.orderType}</td>
                  <td style="padding: 6px; color: #555;">${o.deliveryAddress || '<span style="color:#aaa; font-style:italic;">Retiro en Tienda</span>'}</td>
                  <td style="padding: 6px;"><strong>${o.deliveryDate}</strong><br>${o.deliveryTime} hrs</td>
                  <td style="padding: 6px;">${o.paymentMethod}</td>
                  <td style="padding: 6px; font-weight:bold; text-align:right;">S/. ${o.totalAmount.toFixed(2)}</td>
                  <td style="border: 1px solid #ccc; background-color:#fff;"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (type === "stats" || type === "all") {
      const monthlySales = getMonthlySales();
      const maxSale = Math.max(...Object.values(monthlySales), 1);
      const flavorCounts = getFlavorCounts();
      const topFlavors = Object.entries(flavorCounts).sort((a, b) => b[1] - a[1]);

      title += title ? " & " : "";
      title += "Reporte Estadístico Mensual";
      htmlContent += `
        <div style="page-break-before: ${type === 'all' ? 'always' : 'avoid'};">
          <h3>Historial Gráfico de Preferencias & Ventas Mensuales</h3>
          <p style="font-size: 11px; color: #555; margin-bottom: 15px;">Estadísticas consolidadas de demanda por mes y desglose de preferencias de sabores.</p>
          
          <div style="border: 1px solid var(--color-art-linesoft); border-radius: 6px; padding: 20px; background-color:var(--color-art-card); margin-bottom: 25px;">
            <h4 style="margin-top:0; color:var(--color-art-deep); font-size:13px; margin-bottom:15px;">📊 Comparativa de Ventas Mensuales (Gráfico de Barras)</h4>
            <div style="display: flex; align-items: flex-end; height: 160px; gap: 25px; border-left: 2px solid var(--color-art-linesoft); border-bottom: 2px solid var(--color-art-linesoft); padding: 10px 15px; margin-top: 10px;">
              ${Object.keys(monthlySales).map(m => {
                const val = monthlySales[m];
                const heightPct = (val / maxSale) * 100;
                return `
                  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
                    <span style="font-size: 9px; font-weight: bold; margin-bottom: 3px;">S/. ${val.toFixed(0)}</span>
                    <div style="width: 100%; max-width: 45px; height: ${heightPct}%; background-color: var(--color-art-deep); border-radius: 4px 4px 0 0;"></div>
                    <span style="font-size: 10px; margin-top: 6px; font-weight: bold; color: var(--color-art-soft);">${m}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="border: 1px solid var(--color-art-linesoft); border-radius: 6px; padding: 15px; background-color:var(--color-art-card);">
            <h4 style="margin-top:0; color:var(--color-art-deep); font-size:13px; margin-bottom:10px;">🍪 Ranking de Especialidades & Sabores Preferidos</h4>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-art-linesoft);">
                  <th style="padding: 6px; text-align:left;">Posición</th>
                  <th style="padding: 6px; text-align:left;">Especialidad / Sabor</th>
                  <th style="padding: 6px; text-align:right;">Cantidad Demandada (Unidades)</th>
                </tr>
              </thead>
              <tbody>
                ${topFlavors.map((flv, idx) => `
                  <tr style="border-bottom: 1px solid var(--color-art-card);">
                    <td style="padding: 6px;"><strong>#${idx + 1}</strong></td>
                    <td style="padding: 6px;"><strong>${flv[0]}</strong></td>
                    <td style="padding: 6px; text-align:right; font-weight:bold;">${flv[1]} unidades</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (type === "providers" || type === "all") {
      title += title ? " & " : "";
      title += "Directorio de Proveedores";
      htmlContent += `
        <div style="page-break-before: ${type === 'all' ? 'always' : 'avoid'};">
          <h3>Directorio de Contactos de Proveedores de Insumos</h3>
          <p style="font-size: 11px; color: #555; margin-bottom:15px;">Ficha de contacto y aprovisionamiento de insumos críticos de repostería para Flikicookie.</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background-color: var(--color-art-card);">
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">ID</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Nombre Comercial</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Contacto Principal</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Celular / WhatsApp</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Correo Electrónico</th>
                <th style="padding: 8px; border-bottom: 2px solid var(--color-art-linesoft); text-align:left;">Insumos Suministrados</th>
              </tr>
            </thead>
            <tbody>
              ${providers.map(p => `
                <tr style="border-bottom: 1px solid var(--color-art-card);">
                  <td style="padding: 6px; font-family: monospace; font-size:10px; color:#666;">${p.id}</td>
                  <td style="padding: 6px;"><strong>${p.name}</strong><br><span style="font-size:9px; color:#888;">${p.address || ''}</span></td>
                  <td style="padding: 6px;">${p.contactName || '<span style="color:#aaa;">-</span>'}</td>
                  <td style="padding: 6px; font-family:monospace;">${p.phone}</td>
                  <td style="padding: 6px;">${p.email}</td>
                  <td style="padding: 6px; font-weight:bold; color: var(--color-art-soft);">${p.suppliedItems.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    handlePrintSection(title || "Reporte Completo", htmlContent);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem("flikicookie_admin_password") || "admin123";
    if (passwordInput === storedPass) {
      setIsAuthorized(true);
      setLoginError("");
    } else {
      setLoginError("Contraseña incorrecta.");
    }
  };

  // Password change handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeSuccess("");
    setPassChangeError("");

    const storedPass = localStorage.getItem("flikicookie_admin_password") || "admin123";
    if (currentPassInput !== storedPass) {
      setPassChangeError("La contraseña actual es incorrecta.");
      return;
    }

    if (!newPassInput || newPassInput.length < 4) {
      setPassChangeError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    if (newPassInput !== confirmPassInput) {
      setPassChangeError("Las contraseñas no coinciden.");
      return;
    }

    localStorage.setItem("flikicookie_admin_password", newPassInput);
    setPassChangeSuccess("¡Contraseña cambiada exitosamente!");
    setCurrentPassInput("");
    setNewPassInput("");
    setConfirmPassInput("");
  };

  // Group orders by status
  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(o => o.status === status);
  };

  // KPIs
  const totalSales = orders.reduce((sum, o) => o.status !== "Pendiente" ? sum + o.totalAmount : sum, 0);
  const activeOrdersCount = orders.filter(o => o.status !== "Entregado").length;
  const completedOrdersCount = orders.filter(o => o.status === "Entregado").length;

  const getPopularFlavor = () => {
    const counts: { [key: string]: number } = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        if (i.isCustom && i.customSpec) {
          const flv = i.customSpec.flavor;
          counts[flv] = (counts[flv] || 0) + 1;
        }
      });
    });
    let bestFlavor = "Vainilla";
    let max = 0;
    Object.keys(counts).forEach(f => {
      if (counts[f] > max) {
        max = counts[f];
        bestFlavor = f;
      }
    });
    return bestFlavor;
  };

  // Run server side Gemini analysis
  const handleAIProductionAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/chef-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders })
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysisResult(data);
      } else {
        throw new Error(data.error || "Ocurrió un error en el análisis.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error al obtener recomendaciones de IA: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = statuses.indexOf(current);
    if (idx === -1 || idx === statuses.length - 1) return null;
    return statuses[idx + 1];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(price);
  };

  // Drag and Drop file parsing for menu items
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, sube solo archivos de imagen.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMenuForm(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Client CRUD
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone || !clientForm.email) {
      alert("Por favor completa los campos requeridos (Nombre, Teléfono y Email).");
      return;
    }

    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { 
        ...c, 
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email,
        address: clientForm.address
      } : c));
      setEditingClient(null);
    } else {
      const newClient: Client = {
        id: `CLI-${Math.floor(100 + Math.random() * 900)}`,
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email,
        address: clientForm.address,
        totalSpent: 0,
        ordersCount: 0
      };
      setClients(prev => [newClient, ...prev]);
    }

    setClientForm({ name: "", phone: "", email: "", address: "" });
    setShowClientForm(false);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address || ""
    });
    setShowClientForm(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  // Provider CRUD
  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerForm.name || !providerForm.phone || !providerForm.email) {
      alert("Por favor completa los campos requeridos (Nombre, Teléfono y Email).");
      return;
    }

    const itemsArr = providerForm.suppliedItems ? providerForm.suppliedItems.split(",").map(i => i.trim()).filter(Boolean) : [];

    if (editingProvider) {
      setProviders(prev => prev.map(p => p.id === editingProvider.id ? {
        ...p,
        name: providerForm.name,
        contactName: providerForm.contactName,
        phone: providerForm.phone,
        email: providerForm.email,
        address: providerForm.address,
        suppliedItems: itemsArr
      } : p));
      setEditingProvider(null);
    } else {
      const newProvider: Provider = {
        id: `PROV-${Math.floor(100 + Math.random() * 900)}`,
        name: providerForm.name,
        contactName: providerForm.contactName,
        phone: providerForm.phone,
        email: providerForm.email,
        address: providerForm.address,
        suppliedItems: itemsArr
      };
      setProviders(prev => [newProvider, ...prev]);
    }

    setProviderForm({ name: "", contactName: "", phone: "", email: "", address: "", suppliedItems: "" });
    setShowProviderForm(false);
  };

  const handleEditProvider = (prov: Provider) => {
    setEditingProvider(prov);
    setProviderForm({
      name: prov.name,
      contactName: prov.contactName,
      phone: prov.phone,
      email: prov.email,
      address: prov.address || "",
      suppliedItems: prov.suppliedItems.join(", ")
    });
    setShowProviderForm(true);
  };

  const handleDeleteProvider = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este proveedor?")) {
      setProviders(prev => prev.filter(p => p.id !== id));
    }
  };

  // Menu CRUD
  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.description || !menuForm.price) {
      alert("Por favor ingresa Nombre, Descripción y Precio de la creación.");
      return;
    }

    const priceNum = parseFloat(menuForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Por favor ingresa un precio numérico válido.");
      return;
    }

    const allergensArr = menuForm.allergens ? menuForm.allergens.split(",").map(a => a.trim()).filter(Boolean) : [];

    // Fallback image if none was uploaded
    const imgUrl = menuForm.image || "/src/assets/images/Emblema%20Flikicookie.png";

    const wholesalePriceNum = menuForm.wholesalePrice ? parseFloat(menuForm.wholesalePrice) : undefined;
    const wholesaleMinQtyNum = menuForm.wholesaleMinQty ? parseInt(menuForm.wholesaleMinQty, 10) : undefined;
    const promoPriceNum = menuForm.promoPrice ? parseFloat(menuForm.promoPrice) : undefined;
    const seasonalTagVal = menuForm.seasonalTag ? menuForm.seasonalTag.trim() : undefined;

    if (editingMenu) {
      setMenuItems(prev => prev.map(m => m.id === editingMenu.id ? {
        ...m,
        name: menuForm.name,
        description: menuForm.description,
        price: priceNum,
        category: menuForm.category, imgPosition: (menuForm as any).imgPosition || undefined, videoUrl: (menuForm as any).videoUrl || undefined, longDescription: (menuForm as any).longDescription || undefined,
        prepTime: menuForm.prepTime,
        allergens: allergensArr,
        image: imgUrl,
        wholesalePrice: isNaN(wholesalePriceNum as number) ? undefined : wholesalePriceNum,
        wholesaleMinQty: isNaN(wholesaleMinQtyNum as number) ? undefined : wholesaleMinQtyNum,
        promoPrice: isNaN(promoPriceNum as number) ? undefined : promoPriceNum,
        seasonalTag: seasonalTagVal || undefined
      } : m));
      setEditingMenu(null);
    } else {
      const newMenuItem: MenuItem = {
        id: `cookie-new-${Date.now()}`,
        name: menuForm.name,
        description: menuForm.description,
        price: priceNum,
        category: menuForm.category, imgPosition: (menuForm as any).imgPosition || undefined, videoUrl: (menuForm as any).videoUrl || undefined, longDescription: (menuForm as any).longDescription || undefined,
        prepTime: menuForm.prepTime,
        allergens: allergensArr,
        image: imgUrl,
        wholesalePrice: isNaN(wholesalePriceNum as number) ? undefined : wholesalePriceNum,
        wholesaleMinQty: isNaN(wholesaleMinQtyNum as number) ? undefined : wholesaleMinQtyNum,
        promoPrice: isNaN(promoPriceNum as number) ? undefined : promoPriceNum,
        seasonalTag: seasonalTagVal || undefined
      };
      setMenuItems(prev => [newMenuItem, ...prev]);
    }

    setMenuForm({ name: "", description: "", price: "", category: "especiales", prepTime: "25 min", allergens: "", image: "", wholesalePrice: "", wholesaleMinQty: "", seasonalTag: "", promoPrice: "", videoUrl: "", longDescription: "", imgPosition: "center" } as any);
    setShowMenuForm(false);
  };

  const handleEditMenu = (item: MenuItem) => {
    setEditingMenu(item);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      prepTime: item.prepTime,
      allergens: item.allergens ? item.allergens.join(", ") : "",
      image: item.image,
      wholesalePrice: item.wholesalePrice ? item.wholesalePrice.toString() : "",
      wholesaleMinQty: item.wholesaleMinQty ? item.wholesaleMinQty.toString() : "",
      seasonalTag: item.seasonalTag || "",
      promoPrice: item.promoPrice ? item.promoPrice.toString() : ""
    , videoUrl: (item as any).videoUrl || "", longDescription: (item as any).longDescription || "", imgPosition: (item as any).imgPosition || "center" } as any);
    setShowMenuForm(true);
  };

  const handleDeleteMenu = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto del catálogo?")) {
      setMenuItems(prev => prev.filter(m => m.id !== id));
    }
  };

  // Generate simulated WhatsApp Alert content based on order details and status
  const getWhatsAppTemplateText = (order: Order) => {
    const customer = order.customerName;
    const orderId = order.id;
    const details = order.items.map(i => `${i.name} (x${i.quantity})`).join(", ");
    
    switch (order.status) {
      case "Pendiente":
        return `🍪 *Flikicookie* | *Confirmación*\n\n¡Hola ${customer}! Hemos recibido con mucho gusto tu pedido *${orderId}*.\n📍 Tipo: ${order.orderType}\n📋 Detalles: ${details}\n\nNuestros maestros galleteros están por validar los detalles técnicos. ¡Te avisaremos cuando entremos a la cocina!`;
      case "En Preparación":
        return `🍪 *Flikicookie* | *En Preparación*\n\n¡Hola ${customer}! 🧑‍🍳 Excelentes noticias: Tu pedido *${orderId}* ya está en preparación en nuestra cocina artesanal. Estamos pesando y batiendo los mejores ingredientes para que quede perfecto.`;
      case "En Horno":
        return `🔥 *Flikicookie* | *En el Horno*\n\n¡Hola ${customer}! 🔥 ¡Ya huele increíble a galletas recién horneadas! Tu pedido *${orderId}* se encuentra actualmente en el horno. Cociéndose lentamente a la temperatura ideal para una textura crujiente por fuera y suave y rellena por dentro.`;
      case "Decorando":
        return `🎨 *Flikicookie* | *Decoración*\n\n¡Hola ${customer}! ✨ Tu pedido *${orderId}* ya salió del horno y está en manos de nuestro Chef Repostero para los acabados de glaseado, toppings y la dedicatoria que solicitaste. ¡Está quedando espectacular!`;
      case "Listo":
        return `📦 *Flikicookie* | *¡LISTO!*\n\n¡Hola ${customer}! 🎉 ¡Tus deliciosas galletas artesanales están listas! Tu pedido *${orderId}* se encuentra en nuestra vitrina de entrega.\n\n📍 Entrega: ${order.orderType === "Retiro en Tienda" ? "Puedes pasar a retirarlo hoy a la hora agendada." : "Nuestros repartidores van en camino a tu domicilio."} ¡Gracias por confiar en nosotros!`;
      case "Entregado":
        return `💝 *Flikicookie* | *Entregado*\n\n¡Hola ${customer}! Esperamos que disfrutes cada bocado de tu pedido *${orderId}*. Esperamos volver a endulzar tus momentos pronto con las mejores galletas de Cusco. ¡Que tengas un excelente día!`;
      default:
        return "";
    }
  };

  // 1. Password Lock View
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-16 px-4 animate-fade-in" id="admin_lock_screen">
        <div className="bg-white border-2 border-art-border p-8 rounded-xl max-w-md w-full shadow-lg space-y-6 text-center">
          <div className="w-16 h-16 bg-art-accent text-white rounded-full flex items-center justify-center mx-auto shadow-md animate-pulse">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-2xl text-art-text">Acceso de Maestros</h3>
            <p className="text-sm text-art-muted leading-relaxed font-medium">
              Ingresa la contraseña para acceder a la gestión administrativa, clientes, proveedores y recetas de autor de Flikicookie.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[12px] font-bold uppercase tracking-wider text-art-text block">Contraseña de Seguridad</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-art-border text-art-text text-sm rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-art-accent placeholder-art-brown font-bold"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 justify-center">
                <ShieldAlert className="w-4 h-4 shrink-0" /> {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-art-accent text-white hover:bg-art-accent-hover font-bold py-3.5 px-4 rounded-xl text-sm tracking-wider uppercase transition-all shadow-md cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="bg-art-panel border border-art-border/40 p-4 rounded-xl text-left">
            <p className="text-[12px] text-art-muted font-semibold leading-relaxed">
              🔑 <strong>Clave por defecto:</strong> <code className="bg-white px-2 py-0.5 rounded border border-art-border font-bold font-mono text-[13px]">{`admin123`}</code> <span className="text-art-brown font-normal">(Puedes modificarla en la pestaña ⚙️ Configuración).</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter clients/suppliers/menu items
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchClientQuery.toLowerCase()) ||
    c.phone.includes(searchClientQuery) ||
    c.email.toLowerCase().includes(searchClientQuery.toLowerCase())
  );

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchProviderQuery.toLowerCase()) ||
    p.contactName.toLowerCase().includes(searchProviderQuery.toLowerCase()) ||
    p.suppliedItems.some(i => i.toLowerCase().includes(searchProviderQuery.toLowerCase()))
  );

  const filteredMenuItems = menuItems.filter(m => 
    m.name.toLowerCase().includes(searchMenuQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchMenuQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchMenuQuery.toLowerCase())
  );

  // 2. Full Admin Dashboard Workspace (Authorized)
  return (
    <div className="space-y-8 animate-fade-in" id="admin_dashboard_root">
      
      {/* FLOATING TOAST NOTIFICATIONS FOR NEW ORDERS */}
      <div className="fixed top-5 right-5 z-50 pointer-events-none flex flex-col gap-3 max-w-sm w-full p-4">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className="pointer-events-auto bg-white/95 backdrop-blur-md border border-emerald-200 shadow-xl rounded-xl p-4 flex items-start gap-3.5 animate-slide-in-right relative overflow-hidden group"
            style={{
              boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.15), 0 8px 10px -6px rgba(16, 185, 129, 0.15)"
            }}
          >
            {/* Accent border bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>

            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0 space-y-1 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">¡Nuevo Pedido Recibido!</span>
                <span className="text-[9px] font-mono text-slate-400">{toast.time}</span>
              </div>
              <h5 className="font-serif font-bold text-xs text-slate-800 truncate">
                {toast.order.customerName}
              </h5>
              <p className="text-[10px] text-slate-500 truncate">
                {toast.order.items.length === 1 
                  ? toast.order.items[0].name 
                  : `${toast.order.items.length} productos deliciosos`}
              </p>
              <p className="font-mono text-[10px] font-extrabold text-emerald-600">
                Monto: S/. {toast.order.totalAmount.toFixed(2)}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    setActiveTab("orders");
                    setSelectedOrder(toast.order);
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs uppercase tracking-wide flex items-center gap-1"
                >
                  Ver Detalles
                </button>
                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 text-[9px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wide"
                >
                  Ignorar
                </button>
              </div>
            </div>

            {/* Manual close button */}
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Sub tabs header selection with Monitoring Status Indicator */}
      <div className="flex flex-col border-b border-art-border gap-2 pb-2">
        <div className="flex overflow-x-auto gap-2" style={{ scrollbarWidth: 'thin' }}>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "orders" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> 📋 Flujo de Pedidos
          </button>

          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "metrics" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 📊 Dashboard de Métricas
          </button>

          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "clients" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <Users className="w-4 h-4" /> 👥 Clientes ({clients.length})
          </button>

          <button
            onClick={() => setActiveTab("suppliers")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "suppliers" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <Truck className="w-4 h-4" /> 📦 Proveedores ({providers.length})
          </button>

          <button
            onClick={() => setActiveTab("purchase_orders")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "purchase_orders" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <ClipboardList className="w-4 h-4" /> 📄 Órdenes de Compra ({purchaseOrders.length})
          </button>

          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "catalog" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <Coffee className="w-4 h-4" /> 🍪 Especialidades & Menú ({menuItems.length})
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "inventory" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <Layers className="w-4 h-4" /> 🌾 Inventario & Alertas 
            {getInventoryAlerts().length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-sans font-extrabold bg-rose-500 text-white rounded-full animate-bounce">
                {getInventoryAlerts().length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("cashflow")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "cashflow" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <DollarSign className="w-4 h-4" /> 💰 Flujo de Caja
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "reports" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <Printer className="w-4 h-4" /> 📊 Reportes e Impresión
          </button>

          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "company" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <Settings className="w-4 h-4" /> ⚙️ Datos & Políticas de Empresa
          </button>

          <button
            onClick={() => setActiveTab("advisor")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "advisor" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <BrainCircuit className="w-4 h-4" /> 🧠 Asesor de Negocios IA
          </button>

          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "whatsapp" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <MessageSquare className="w-4 h-4" /> 💬 WhatsApp
            {whatsappConversations.filter(c => c.unreadCount > 0).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[9px] font-sans font-extrabold bg-wa text-white rounded-full">
                {whatsappConversations.filter(c => c.unreadCount > 0).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("communications")}
            className={`flex items-center gap-2 py-3 px-5 text-xs font-serif font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "communications" 
                ? "border-art-accent text-art-accent" 
                : "border-transparent text-art-muted hover:text-art-text"
            }`}
          >
            <Headphones className="w-4 h-4" /> 📞 Comunicaciones
          </button>
        </div>

        {/* Real-time System Status Indicator */}
        <div className="flex items-center gap-2.5 px-4 pb-2 lg:pb-0 shrink-0 self-start lg:self-center">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 relative">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">Monitoreo Activo</span>
          </div>

          {/* Browser Notifications Permission Toggle */}
          <button
            onClick={requestNotificationPermission}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
              notificationPermission === "granted"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : notificationPermission === "denied"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-art-accent-5 border-art-border text-art-border"
            }`}
            title={
              notificationPermission === "granted"
                ? "Notificaciones de navegador permitidas y activas"
                : notificationPermission === "denied"
                ? "Haga clic para ver cómo habilitar notificaciones en su navegador"
                : "Haga clic para activar las notificaciones del navegador"
            }
          >
            {notificationPermission === "granted" ? (
              <>
                <Bell className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="uppercase tracking-wide">Notificaciones: Sí</span>
              </>
            ) : notificationPermission === "denied" ? (
              <>
                <BellOff className="w-3.5 h-3.5 text-rose-600" />
                <span className="uppercase tracking-wide">Notificaciones: Ajustar</span>
              </>
                ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-art-accent" />
                <span className="uppercase tracking-wide">Activar Notificaciones</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              // Trigger a test notification
              const testOrder: Order = {
                id: "test-" + Math.random().toString(36).substring(2, 5),
                customerName: "Valeria Mendoza (Simulador)",
                customerPhone: "+51 984 112 233",
                customerEmail: "valeria@gmail.com",
                deliveryDate: "2026-07-28",
                deliveryTime: "16:30",
                orderType: "Entrega a Domicilio",
                deliveryAddress: "Av. Sol 425, Cusco",
                items: [{
                  id: "test-cookie",
                  name: "MockaChino (Especial Día del Padre)",
                  price: 12.00,
                  quantity: 3,
                  isCustom: false
                }],
                totalAmount: 36.00,
                status: "Pendiente",
                createdAt: new Date().toISOString(),
                paymentMethod: "Transferencia"
              };
              
              const id = "test-" + Math.random().toString(36).substring(2, 9);
              const toast = {
                id,
                order: testOrder,
                message: `¡Nuevo pedido de Valeria Mendoza!`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              
              setToasts(prev => [toast, ...prev]);
              playChime();
              sendBrowserNotification(
                "🔔 Nuevo Pedido (Simulación)",
                "Valeria Mendoza ha realizado un pedido por S/. 36.00"
              );
              
              setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
              }, 8000);
            }}
            className="bg-art-panel hover:opacity-90 border border-art-border text-art-border text-[10px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Simular un nuevo pedido entrante para probar el sonido y toast"
          >
            <Sparkles className="w-3.5 h-3.5 text-art-accent" /> Probar Alerta
          </button>
        </div>
      </div>

      {/* GLOBAL INVENTORY ALERTS BANNER */}
      {getInventoryAlerts().length > 0 && activeTab !== "inventory" && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xs animate-fade-in my-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="font-serif font-bold text-xs">⚠️ Alertas de Inventario Crítico Detectadas</h4>
              <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                Hay <strong>{getInventoryAlerts().filter(a => a.type === "item").length} productos</strong> sin stock suficiente en vitrina y <strong>{getInventoryAlerts().filter(a => a.type === "material").length} insumos de recetas</strong> por debajo del umbral mínimo de preparación.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("inventory")}
            className="self-start md:self-center bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg transition-colors uppercase tracking-wide cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
          >
            Ver Inventario <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* RENDER ACTIVE TAB VIEW */}

      {/* TAB A: ORDERS FLOW (The original kanban orders status CRM) */}
      {activeTab === "orders" && (
        <div className="space-y-8 animate-fade-in" id="admin_tab_orders">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white border border-art-border rounded-lg p-4 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-art-muted">Ventas Facturadas</p>
                <h4 className="text-base font-serif font-bold text-art-text tracking-tight">
                  {formatPrice(totalSales)}
                </h4>
              </div>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 bg-art-accent/10 text-art-accent rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-art-muted">Pedidos Activos</p>
                <h4 className="text-base font-serif font-bold text-art-text tracking-tight">
                  {activeOrdersCount} órdenes
                </h4>
              </div>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-art-muted">Entregados</p>
                <h4 className="text-base font-serif font-bold text-art-text tracking-tight">
                  {completedOrdersCount} completados
                </h4>
              </div>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 bg-art-panel text-art-text border border-art-border rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-art-muted">Sabor Favorito</p>
                <h4 className="text-base font-serif font-bold text-art-text tracking-tight capitalize">
                  {getPopularFlavor()}
                </h4>
              </div>
            </div>
          </div>

          {/* AI Kitchen Co-Pilot & Production advice */}
          <div className="bg-art-border text-art-text rounded-lg p-6 shadow-md border border-art-border">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg tracking-tight flex items-center gap-2 text-art-text">
                  <Sparkles className="w-5 h-5 animate-pulse fill-art-text" /> Co-Piloto de Repostería de IA
                </h3>
                <p className="text-xs text-art-muted max-w-xl leading-relaxed">
                  Analiza en tiempo real los pedidos activos de galletas personalizadas y estándar. Gemini organizará el orden óptimo de horneado, consolidará los ingredientes y te dará recomendaciones técnicas de cocina.
                </p>
              </div>

              <button
                onClick={handleAIProductionAnalysis}
                disabled={isAnalyzing || orders.length === 0}
                className="bg-art-accent hover:bg-art-accent/90 disabled:bg-art-text/20 disabled:text-art-text text-white font-bold text-xs px-5 py-3 rounded-lg transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
                id="btn_ai_analysis"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analizando taller...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" /> Optimizar Producción con IA
                  </>
                )}
              </button>
            </div>

            {/* AI Analysis Display */}
            {isAnalyzing && (
              <div className="mt-6 border-t border-art-text/20 pt-6 flex flex-col items-center justify-center py-8 text-center space-y-3">
                <Coffee className="w-8 h-8 text-art-accent animate-bounce" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-art-text">Consolidando masa, mermeladas y decoraciones...</p>
                  <p className="text-[10px] text-art-muted">El Chef de IA está evaluando los tiempos de horneado y alérgenos de seguridad.</p>
                </div>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="mt-6 border-t border-art-text/20 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-art-text animate-fade-in" id="ai_analysis_result">
                {/* Left */}
                <div className="space-y-5">
                  <div className="bg-white border border-art-border rounded-lg p-4 space-y-3">
                    <h4 className="text-xs font-bold text-art-accent uppercase tracking-wider flex items-center gap-1.5">
                      📅 Agenda de Taller Soportada por IA
                    </h4>
                    <ol className="space-y-2 text-xs">
                      {analysisResult.schedule.map((task, i) => (
                        <li key={i} className="flex gap-2 text-art-muted">
                          <span className="font-bold text-art-accent">{i + 1}.</span>
                          <p>{task}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-white border border-art-border rounded-lg p-4 space-y-3">
                    <h4 className="text-xs font-bold text-art-accent uppercase tracking-wider flex items-center gap-1.5">
                      🛒 Lista de Compras para Emergencia
                    </h4>
                    <ul className="space-y-1.5 text-xs text-art-muted list-disc list-inside">
                      {analysisResult.shoppingList.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-5">
                  <div className="bg-white border border-art-border rounded-lg p-4 space-y-3">
                    <h4 className="text-xs font-bold text-art-accent uppercase tracking-wider flex items-center gap-1.5">
                      🎨 Consejos de Acabado y Estabilidad
                    </h4>
                    <ul className="space-y-1.5 text-xs text-art-muted list-disc list-inside">
                      {analysisResult.decoratingAdvice.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-art-border rounded-lg p-4 space-y-3">
                    <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                      🚨 Alertas Críticas de Taller
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.warnings.map((warn, i) => (
                        <div key={i} className="flex gap-2 text-xs text-art-muted bg-red-950/20 border border-red-900/40 p-2.5 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                          <p>{warn}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main CRM Order Pipeline */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-art-border shadow-2xs">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm text-art-text uppercase tracking-wider">
                  Flujo de Trabajo del Taller (Kanban)
                </h3>
                <span className="text-[10px] bg-art-panel text-art-border font-bold px-2 py-0.5 rounded-md border border-art-border">
                  {orders.length} pedidos totales
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Order Bar */}
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={searchOrderQuery}
                    onChange={(e) => setSearchOrderQuery(e.target.value)}
                    placeholder="Buscar por cliente o ID..."
                    className="w-full bg-art-panel border border-art-border text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-art-accent text-art-border"
                    id="input_search_orders"
                  />
                  {searchOrderQuery && (
                    <button 
                      onClick={() => setSearchOrderQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* CSV Export Button */}
                <button
                  onClick={handleExportOrdersCSV}
                  className="bg-art-panel hover:opacity-90 border border-art-border text-art-border font-serif font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  id="btn_export_orders_csv"
                >
                  <FileText className="w-3.5 h-3.5 text-art-accent" /> Exportar a Excel (CSV)
                </button>
              </div>
            </div>

            {/* Pipeline columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
              {statuses.map((colStatus) => {
                const rawColOrders = getOrdersByStatus(colStatus);
                const colOrders = rawColOrders.filter(o => 
                  !searchOrderQuery || 
                  o.customerName.toLowerCase().includes(searchOrderQuery.toLowerCase()) || 
                  o.id.toLowerCase().includes(searchOrderQuery.toLowerCase())
                );

                return (
                  <div
                    key={colStatus}
                    className="bg-art-panel border border-art-border rounded-lg p-3 min-w-[200px] flex flex-col space-y-3 h-[520px]"
                    id={`pipeline_col_${colStatus}`}
                  >
                    <div className="flex items-center justify-between border-b border-art-border pb-2">
                      <span className="text-xs font-bold text-art-text flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getStatusColorIndicator(colStatus)}`}></span>
                        {colStatus}
                      </span>
                      <span className="bg-white text-art-text border border-art-border font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {colOrders.length}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                      {colOrders.length > 0 ? (
                        colOrders.map((order) => (
                          <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className={`bg-white border border-art-border p-3 rounded-lg shadow-xs hover:shadow-sm hover:border-art-accent transition-all cursor-pointer relative ${
                              selectedOrder?.id === order.id ? "ring-1 ring-art-accent" : ""
                            }`}
                          >
                            {order.items.some(i => i.isCustom) && (
                              <span className="absolute top-2.5 right-2.5 text-[9px] bg-red-50 text-red-600 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                ✨ Custom
                              </span>
                            )}

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono font-bold text-art-muted">{order.id}</span>
                              <h5 className="font-bold text-art-text text-xs truncate max-w-[130px]">
                                {order.customerName}
                              </h5>
                              
                              <div className="flex flex-col text-[10px] text-art-muted space-y-0.5">
                                <span>📅 {order.deliveryDate}</span>
                                <span>⏰ {order.deliveryTime} hrs</span>
                              </div>

                              <div className="pt-2 border-t border-art-border flex items-center justify-between">
                                <span className="font-serif font-bold text-art-text text-xs">
                                  {formatPrice(order.totalAmount)}
                                </span>
                                
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrintInvoice(order);
                                    }}
                                    className="px-1.5 py-1 bg-art-accent-5 hover:bg-art-accent text-art-border border border-art-border rounded text-[9px] font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                                    title="Imprimir Factura / Comprobante"
                                  >
                                    <Printer className="w-3 h-3 text-art-border" /> Factura
                                  </button>

                                  {getNextStatus(order.status) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const next = getNextStatus(order.status);
                                        if (next) onUpdateStatus(order.id, next);
                                      }}
                                      className="p-1 bg-art-accent/10 hover:bg-art-accent hover:text-white rounded text-art-accent transition-colors cursor-pointer"
                                      title={`Avanzar a ${getNextStatus(order.status)}`}
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-art-muted text-xs p-4 py-8 text-center">
                          <span>Vacío</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: METRICS DASHBOARD & ANALYTICS */}
      {activeTab === "metrics" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_metrics">
          {/* Header Action Bar */}
          <div className="bg-white border border-art-border p-6 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-art-text flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-art-accent" /> Dashboard de Métricas & Rendimiento Comercial
              </h3>
              <p className="text-xs text-art-muted leading-relaxed">
                Análisis estadístico interactivo de ventas, ingresos acumulados, tasa de entrega, productos más vendidos y canales de pago.
              </p>
            </div>

            {/* Time Filter Controls */}
            <div className="flex items-center gap-1.5 bg-art-panel p-1.5 border border-art-border rounded-lg shrink-0">
              <button
                onClick={() => setMetricsTimeRange("today")}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  metricsTimeRange === "today" 
                    ? "bg-art-accent text-white shadow-2xs" 
                    : "text-art-muted hover:text-art-text"
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setMetricsTimeRange("week")}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  metricsTimeRange === "week" 
                    ? "bg-art-accent text-white shadow-2xs" 
                    : "text-art-muted hover:text-art-text"
                }`}
              >
                Últimos 7 Días
              </button>
              <button
                onClick={() => setMetricsTimeRange("month")}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  metricsTimeRange === "month" 
                    ? "bg-art-accent text-white shadow-2xs" 
                    : "text-art-muted hover:text-art-text"
                }`}
              >
                Este Mes
              </button>
              <button
                onClick={() => setMetricsTimeRange("all")}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  metricsTimeRange === "all" 
                    ? "bg-art-accent text-white shadow-2xs" 
                    : "text-art-muted hover:text-art-text"
                }`}
              >
                Histórico
              </button>
            </div>
          </div>

          {/* KPI CARDS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-art-border rounded-lg p-4 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-art-muted">
                <span className="text-[10px] uppercase font-bold tracking-wider">Ingresos Facturados</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-art-text">
                S/. {getFilteredOrdersForMetrics().reduce((acc, o) => acc + o.totalAmount, 0).toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {getFilteredOrdersForMetrics().length} pedidos registrados
              </span>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-art-muted">
                <span className="text-[10px] uppercase font-bold tracking-wider">Ticket Promedio</span>
                <Receipt className="w-4 h-4 text-art-accent" />
              </div>
              <div className="text-2xl font-serif font-bold text-art-text">
                S/. {getFilteredOrdersForMetrics().length > 0 
                  ? (getFilteredOrdersForMetrics().reduce((acc, o) => acc + o.totalAmount, 0) / getFilteredOrdersForMetrics().length).toFixed(2)
                  : "0.00"
                }
              </div>
              <span className="text-[10px] text-art-muted block">Gasto promedio por cliente</span>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center text-art-muted">
                <span className="text-[10px] uppercase font-bold tracking-wider">Tasa de Entregas</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-art-text">
                {getFilteredOrdersForMetrics().length > 0 
                  ? `${Math.round((getFilteredOrdersForMetrics().filter(o => o.status === "Entregado").length / getFilteredOrdersForMetrics().length) * 100)}%`
                  : "100%"
                }
              </div>
              <span className="text-[10px] text-blue-600 font-semibold block">
                {getFilteredOrdersForMetrics().filter(o => o.status === "Entregado").length} de {getFilteredOrdersForMetrics().length} completados
              </span>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center text-art-muted">
                <span className="text-[10px] uppercase font-bold tracking-wider">Producto Bestseller</span>
                <Award className="w-4 h-4 text-art-accent" />
              </div>
              <div className="text-sm font-serif font-bold text-art-accent truncate block">
                {getTopSellingProductForMetrics().name}
              </div>
              <span className="text-[10px] text-art-border font-semibold block">
                {getTopSellingProductForMetrics().qty} unidades vendidas
              </span>
            </div>
          </div>

          {/* CHARTS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Daily Revenue Trend (Area Chart) */}
            <div className="bg-white border border-art-border p-5 rounded-lg shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Tendencia Temporal</span>
                <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                  📈 Evolución Diaria de Ventas (S/.)
                </h4>
              </div>
              <div className="h-64 w-full text-xs" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getMetricsTrendData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="metricsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-art-caramel)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-art-caramel)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-art-linesoft)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-art-soft)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-art-soft)' }} />
                    <Tooltip 
                      formatter={(val: any) => [`S/. ${Number(val).toFixed(2)}`, "Ingresos"]}
                      contentStyle={{ backgroundColor: 'var(--color-art-card)', borderColor: 'var(--color-art-line)', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="ventas" stroke="var(--color-art-caramel)" strokeWidth={2.5} fillOpacity={1} fill="url(#metricsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Order Status Distribution (Pie / Donut) */}
            <div className="bg-white border border-art-border p-5 rounded-lg shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Estado de Flujo</span>
                <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                  🥧 Distribución por Estado de Pedido
                </h4>
              </div>
              <div className="h-64 w-full text-xs flex items-center justify-center" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={getMetricsStatusData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {getMetricsStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${val} pedidos`, "Cantidad"]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Top Products Bar Chart */}
            <div className="bg-white border border-art-border p-5 rounded-lg shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Productos Preferidos</span>
                <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                  🍪 Top 5 Productos por Unidades Vendidas
                </h4>
              </div>
              <div className="h-64 w-full text-xs" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopProductsChartData()} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-art-linesoft)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-art-soft)' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'var(--color-art-brown)' }} width={120} />
                    <Tooltip formatter={(val: any) => [`${val} unidades`, "Vendidos"]} />
                    <Bar dataKey="cantidad" fill="var(--color-art-brown)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Payment Methods Distribution */}
            <div className="bg-white border border-art-border p-5 rounded-lg shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Canales Digitales</span>
                <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                  💳 Recaudación por Método de Pago
                </h4>
              </div>
              <div className="h-64 w-full text-xs" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getPaymentMethodsChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-art-linesoft)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-art-soft)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--color-art-soft)' }} />
                    <Tooltip formatter={(val: any) => [`S/. ${Number(val).toFixed(2)}`, "Total"]} />
                    <Bar dataKey="total" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* ARQUEO DE CAJA Y CUADRE DIARIO */}
          <div className="bg-art-panel border border-art-border rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-art-line pb-3">
              <div>
                <h4 className="font-serif font-bold text-base text-art-brown flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-art-accent" /> Arqueo de Caja & Cuadre de Turno
                </h4>
                <p className="text-xs text-art-soft">
                  Desglose consolidado por canal de recaudación (Efectivo, Yape/Plin, Tarjetas y Cripto).
                </p>
              </div>

              <button
                onClick={() => {
                  const filtered = getFilteredOrdersForMetrics();
                  const cash = filtered.filter(o => o.paymentMethod.includes("Efectivo")).reduce((sum, o) => sum + o.totalAmount, 0);
                  const transfer = filtered.filter(o => o.paymentMethod.includes("Transferencia") || o.paymentMethod.includes("Yape") || o.paymentMethod.includes("Plin")).reduce((sum, o) => sum + o.totalAmount, 0);
                  const card = filtered.filter(o => o.paymentMethod.includes("Tarjeta")).reduce((sum, o) => sum + o.totalAmount, 0);
                  const crypto = filtered.filter(o => o.paymentMethod.includes("Binance")).reduce((sum, o) => sum + o.totalAmount, 0);
                  const grandTotal = filtered.reduce((sum, o) => sum + o.totalAmount, 0);

                  const html = `
                    <div style="font-size: 12px; line-height: 1.6;">
                      <p><strong>Filtro Seleccionado:</strong> ${metricsTimeRange.toUpperCase()}</p>
                      <p><strong>Total de Transacciones:</strong> ${filtered.length} pedidos</p>
                      <hr style="border: 0; border-top: 1px solid var(--color-art-line); margin: 15px 0;" />
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: var(--color-art-panel);"><th style="padding: 8px; text-align: left;">Medio de Pago</th><th style="padding: 8px; text-align: right;">Total S/.</th></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">💵 Efectivo en Bóveda/Caja</td><td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">S/. ${cash.toFixed(2)}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">📱 Yape / Plin / Transferencia BCP</td><td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">S/. ${transfer.toFixed(2)}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">💳 Pasarela Tarjeta de Crédito/Débito</td><td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">S/. ${card.toFixed(2)}</td></tr>
                        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;">🪙 Binance Pay (Crypto)</td><td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">S/. ${crypto.toFixed(2)}</td></tr>
                        <tr style="background: var(--color-art-border); color: white;"><td style="padding: 10px; font-weight: bold;">TOTAL ARQUEO CONSOLIDADO</td><td style="padding: 10px; text-align: right; font-weight: bold;">S/. ${grandTotal.toFixed(2)}</td></tr>
                      </table>
                    </div>
                  `;
                  handlePrintSection("Arqueo y Cuadre de Caja Taller", html);
                }}
                className="bg-art-accent hover:bg-art-accent-hover text-white font-serif font-bold text-xs px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4 text-art-accent" /> Imprimir Arqueo Fisico
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-3.5 rounded-lg border border-art-line space-y-1">
                <span className="text-[10px] font-bold text-art-soft uppercase">💵 Efectivo Físico</span>
                <p className="text-sm font-mono font-bold text-art-brown">
                  {formatPrice(getFilteredOrdersForMetrics().filter(o => o.paymentMethod.includes("Efectivo")).reduce((s, o) => s + o.totalAmount, 0))}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-art-line space-y-1">
                <span className="text-[10px] font-bold text-art-soft uppercase">📱 Yape / Plin / BCP</span>
                <p className="text-sm font-mono font-bold text-art-brown">
                  {formatPrice(getFilteredOrdersForMetrics().filter(o => o.paymentMethod.includes("Transferencia") || o.paymentMethod.includes("Yape") || o.paymentMethod.includes("Plin")).reduce((s, o) => s + o.totalAmount, 0))}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-art-line space-y-1">
                <span className="text-[10px] font-bold text-art-soft uppercase">💳 POS / Tarjetas</span>
                <p className="text-sm font-mono font-bold text-art-brown">
                  {formatPrice(getFilteredOrdersForMetrics().filter(o => o.paymentMethod.includes("Tarjeta")).reduce((s, o) => s + o.totalAmount, 0))}
                </p>
              </div>

              <div className="bg-art-accent-5 p-3.5 rounded-lg border border-art-border space-y-1">
                <span className="text-[10px] font-bold text-art-border uppercase">🏆 Arqueo Total</span>
                <p className="text-base font-mono font-extrabold text-art-brown">
                  {formatPrice(getFilteredOrdersForMetrics().reduce((s, o) => s + o.totalAmount, 0))}
                </p>
              </div>
            </div>
          </div>

          {/* TABLE: RECENT BILLING TRANSACTIONS WITH PRINT INVOICE BUTTON */}
          <div className="bg-white border border-art-border rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-art-border pb-3">
              <div>
                <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-2">
                  🧾 Comprobantes de Venta & Emisión de Facturas
                </h4>
                <p className="text-xs text-art-muted">Lista general de pedidos procesados con opción de impresión directa de comprobante oficial SUNAT.</p>
              </div>
              <span className="text-xs font-mono font-bold bg-art-panel px-2.5 py-1 rounded text-art-text">
                {getFilteredOrdersForMetrics().length} Comprobantes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-art-panel/60 border-b border-art-border text-[10px] uppercase text-art-muted tracking-wider font-bold">
                    <th className="p-3">Código / Factura</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Fecha Entrega</th>
                    <th className="p-3">Método Pago</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3 text-right">Monto Total</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-border">
                  {getFilteredOrdersForMetrics().map((order) => (
                    <tr key={order.id} className="hover:bg-art-panel/20 transition-colors">
                      <td className="p-3 font-mono font-bold text-art-accent">
                        {order.id}
                      </td>
                      <td className="p-3 font-bold text-art-text">
                        {order.customerName}
                      </td>
                      <td className="p-3 text-art-muted">
                        {order.deliveryDate} ({order.deliveryTime} hrs)
                      </td>
                      <td className="p-3 font-semibold text-art-text">
                        {order.paymentMethod}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          order.status === "Entregado" ? "bg-emerald-100 text-emerald-800" :
                          order.status === "Listo" ? "bg-blue-100 text-blue-800" :
                          "bg-art-accent-5 text-art-border"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-art-text">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="bg-art-panel hover:opacity-90 border border-art-border text-art-text font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-art-accent" /> Imprimir Factura
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB C: CLIENTS MANAGEMENT */}
      {activeTab === "clients" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_clients">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Buscar cliente por nombre o cel..."
                value={searchClientQuery}
                onChange={(e) => setSearchClientQuery(e.target.value)}
                className="w-full text-xs bg-white border border-art-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-art-accent"
              />
            </div>

            <button
              onClick={() => {
                setEditingClient(null);
                setClientForm({ name: "", phone: "", email: "", address: "" });
                setShowClientForm(!showClientForm);
              }}
              className="w-full md:w-auto bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {showClientForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showClientForm ? "Cerrar Formulario" : "Agregar Cliente"}
            </button>
          </div>

          {/* New / Edit Client Form */}
          {showClientForm && (
            <form onSubmit={handleSaveClient} className="bg-white border border-art-border p-5 rounded-lg max-w-xl space-y-4 shadow-sm animate-fade-in">
              <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-1.5 border-b border-art-border pb-2">
                <Users className="w-4 h-4 text-art-accent" />
                {editingClient ? "Editar Información de Cliente" : "Registrar Nuevo Cliente"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Nombre Completo *</label>
                  <input
                    type="text"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="Ej. +51 984 123 456"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Dirección de Despacho (Opcional)</label>
                  <input
                    type="text"
                    value={clientForm.address}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    placeholder="Urb. Larapa, Cusco"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClientForm(false)}
                  className="bg-art-panel hover:bg-art-border text-art-text text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-art-accent hover:bg-art-accent/90 text-white text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Guardar Cliente
                </button>
              </div>
            </form>
          )}

          {/* Client Table List */}
          <div className="bg-white border border-art-border rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-art-panel border-b border-art-border text-art-muted uppercase text-[10px] tracking-wider font-bold">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Dirección</th>
                    <th className="p-4">Estadísticas</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-border text-art-text">
                  {filteredClients.length > 0 ? (
                    filteredClients.flatMap((client) => [
                      <tr key={client.id} className="hover:bg-art-panel/30 transition-colors">
                        <td className="p-4 font-bold flex flex-col">
                          <span>{client.name}</span>
                          <span className="text-[9px] font-mono font-normal text-art-muted">{client.id}</span>
                        </td>
                        <td className="p-4 font-mono">{client.phone}</td>
                        <td className="p-4">{client.email}</td>
                        <td className="p-4 text-art-muted">{client.address || "No registrada"}</td>
                        <td className="p-4 font-mono">
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-100">
                            {formatPrice(client.totalSpent)}
                          </span>
                          <span className="text-art-muted text-[10px] ml-2">({client.ordersCount} ped)</span>
                        </td>
                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedClientId(expandedClientId === client.id ? null : client.id)}
                            className="px-2.5 py-1 bg-art-panel hover:opacity-90 text-art-text border border-art-border rounded text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                            title="Desplegar Histórico & Notas CRM"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-art-accent" />
                            {expandedClientId === client.id ? "▲ Ocultar" : "▼ Desplegar Histórico & Notas"}
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-1.5 bg-art-panel hover:bg-art-accent/10 hover:text-art-accent rounded transition-all cursor-pointer inline-flex items-center"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-1.5 bg-art-panel hover:bg-rose-50 hover:text-rose-600 rounded transition-all cursor-pointer inline-flex items-center"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>,
                      /* EXPANDABLE DROPDOWN ROW FOR CLIENT DETAILS & HISTORY */
                      expandedClientId === client.id ? (
                        <tr key={`expanded-${client.id}`} className="bg-art-panel opacity-80">
                            <td colSpan={6} className="p-4 border-b border-art-border">
                              <div className="bg-white border border-art-border rounded-xl p-5 space-y-4 shadow-xs animate-fade-in">
                                <div className="flex items-center justify-between border-b border-art-border pb-3">
                                <div>
                                  <h5 className="font-serif font-bold text-sm text-art-text flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-art-accent" />
                                    Desplegable de Historial & Notas CRM — {client.name}
                                  </h5>
                                  <p className="text-[11px] text-art-muted">
                                    Teléfono: <span className="font-mono font-bold text-art-text">{client.phone}</span> • Email: <span className="font-mono">{client.email}</span>
                                  </p>
                                </div>
                                <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold px-2.5 py-1 rounded-full">
                                  Gasto Acumulado: {formatPrice(client.totalSpent)} ({client.ordersCount} pedidos)
                                </span>
                              </div>

                              {/* 1. ORDERS HISTORY LIST */}
                              <div className="space-y-2">
                                <h6 className="font-bold text-xs text-art-brown uppercase tracking-wider flex items-center gap-1.5">
                                  <ShoppingBag className="w-3.5 h-3.5 text-art-accent" /> Histórico de Pedidos Realizados
                                </h6>
                                {(() => {
                                  const clientOrders = orders.filter(o => 
                                    o.customerName.toLowerCase() === client.name.toLowerCase() ||
                                    o.customerPhone.replaceAll(" ", "") === client.phone.replaceAll(" ", "") ||
                                    o.customerEmail.toLowerCase() === client.email.toLowerCase()
                                  );

                                  if (clientOrders.length === 0) {
                                    return <p className="text-xs text-art-soft italic py-2">No hay pedidos registrados con el nombre o teléfono exacto de este cliente.</p>;
                                  }

                                  return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                      {clientOrders.map(ord => (
                                        <div key={ord.id} className="bg-art-card border border-art-line p-3 rounded-lg space-y-1.5 relative">
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="font-mono font-bold text-art-accent">{ord.id}</span>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                              ord.status === "Entregado" ? "bg-emerald-100 text-emerald-800" :
                                              ord.status === "Listo" ? "bg-blue-100 text-blue-800" : "bg-art-accent-5 text-art-border"
                                            }`}>
                                              {ord.status}
                                            </span>
                                          </div>
                                          <div className="text-[11px] text-art-text font-medium">
                                            📅 {ord.deliveryDate} ({ord.deliveryTime} hrs) • {ord.paymentMethod}
                                          </div>
                                          <div className="text-[11px] text-art-muted">
                                            Insumos: {ord.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                                          </div>
                                          {ord.notes && (
                                            <div className="text-[10px] bg-art-accent-5 text-art-border p-1.5 rounded border border-art-border mt-1 italic">
                                              "Nota en pedido: {ord.notes}"
                                            </div>
                                          )}
                                          <div className="flex items-center justify-between pt-1 border-t border-art-border/60 text-xs">
                                            <span className="font-serif font-bold text-art-text">
                                              {formatPrice(ord.totalAmount)}
                                            </span>
                                            <button
                                              onClick={() => handlePrintInvoice(ord)}
                                              className="text-[10px] bg-white border border-art-border hover:bg-art-accent hover:text-white px-2 py-0.5 rounded text-art-text font-bold transition-colors cursor-pointer flex items-center gap-1"
                                            >
                                              <Printer className="w-3 h-3" /> Imprimir Comprobante
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* 2. CLIENT CRM CONVERSATION NOTES */}
                              <div className="space-y-2 pt-2 border-t border-art-linesoft">
                                <h6 className="font-bold text-xs text-art-brown uppercase tracking-wider flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-art-accent" /> Bitácora de Notas CRM & Preferencias Especiales
                                </h6>

                                {(() => {
                                  const matchingNotes = clientNotes.filter(n =>
                                    n.customerName.toLowerCase().includes(client.name.toLowerCase()) ||
                                    (n.customerPhone && n.customerPhone.replaceAll(" ", "") === client.phone.replaceAll(" ", ""))
                                  );

                                  return (
                                    <div className="space-y-2">
                                      {matchingNotes.length > 0 ? (
                                        matchingNotes.map(nt => (
                                          <div key={nt.id} className="bg-art-accent-5 border border-art-border p-3 rounded-lg text-xs space-y-1">
                                            <div className="flex items-center justify-between text-[10px] text-art-border">
                                              <span className="font-bold">📱 Canal: {nt.channel}</span>
                                              <span className="font-mono">{new Date(nt.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-art-brown font-medium leading-relaxed">
                                              "{nt.note}"
                                            </p>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-xs text-art-soft italic">No hay notas registradas aún para este cliente.</p>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* 3. QUICK ADD NOTE FOR THIS CLIENT */}
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const form = e.currentTarget;
                                  const input = form.elements.namedItem("quickNote") as HTMLInputElement;
                                  const channelSelect = form.elements.namedItem("quickChannel") as HTMLSelectElement;
                                  if (!input || !input.value.trim()) return;

                                  const newNote: ClientNote = {
                                    id: `NOTE-${Date.now().toString().slice(-4)}`,
                                    clientId: client.id,
                                    customerName: client.name,
                                    customerPhone: client.phone,
                                    note: input.value.trim(),
                                    channel: (channelSelect?.value as any) || "WhatsApp",
                                    createdAt: new Date().toISOString(),
                                    createdBy: "Atención Flikicookie"
                                  };

                                  setClientNotes(prev => [newNote, ...prev]);
                                  input.value = "";
                                }}
                                className="pt-2 border-t border-art-linesoft flex flex-col sm:flex-row gap-2 items-center"
                              >
                                <select 
                                  name="quickChannel"
                                  className="bg-art-card border border-art-line text-xs px-2.5 py-1.5 rounded-lg text-art-brown shrink-0"
                                >
                                  <option value="WhatsApp">📱 WhatsApp</option>
                                  <option value="Llamada">📞 Llamada</option>
                                  <option value="Presencial">🏪 Presencial</option>
                                  <option value="Instagram / FB">📸 Redes Sociales</option>
                                </select>
                                <input
                                  type="text"
                                  name="quickNote"
                                  placeholder={`Agregar nota o acuerdo rápido para ${client.name}...`}
                                  className="w-full bg-art-card border border-art-line text-xs px-3 py-1.5 rounded-lg text-art-brown"
                                  required
                                />
                                <button
                                  type="submit"
                                  className="bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shrink-0 cursor-pointer flex items-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Agregar
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ) : null
                    ].filter(Boolean) as any)
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-art-muted text-xs">
                        No se encontraron clientes registrados con esa búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* CLIENT CONVERSATION NOTES & CRM LOG */}
          <div className="bg-art-card border border-art-line rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-art-line pb-3">
              <div>
                <h4 className="font-serif font-bold text-base text-art-brown flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-art-accent" /> Bitácora de Conversaciones & Notas CRM con Clientes
                </h4>
                <p className="text-xs text-art-soft">
                  Registro detallado de llamadas, acuerdos, preferencias especiales y feedback directo por WhatsApp u otro medio.
                </p>
              </div>

              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="bg-art-accent hover:bg-art-accent-hover text-white font-serif font-bold text-xs px-4 py-2 rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                {showNoteForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showNoteForm ? "Ocultar Formulario" : "Nueva Nota de Cliente"}
              </button>
            </div>

            {/* Note Creation Form */}
            {showNoteForm && (
              <form onSubmit={handleSaveClientNote} className="bg-white border border-art-line p-4 rounded-lg space-y-3 shadow-xs animate-fade-in">
                <h5 className="font-bold text-xs text-art-brown uppercase tracking-wider">Registrar Interacción con Cliente</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-art-soft uppercase">Nombre del Cliente *</label>
                    <input
                      type="text"
                      placeholder="Ej. Camila Soto"
                      value={noteForm.customerName}
                      onChange={(e) => setNoteForm({ ...noteForm, customerName: e.target.value })}
                      className="w-full bg-art-card border border-art-line text-xs px-3 py-1.5 rounded-lg text-art-brown"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-art-soft uppercase">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="Ej. +51 970 442 173"
                      value={noteForm.customerPhone}
                      onChange={(e) => setNoteForm({ ...noteForm, customerPhone: e.target.value })}
                      className="w-full bg-art-card border border-art-line text-xs px-3 py-1.5 rounded-lg text-art-brown"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-art-soft uppercase">Vía de Contacto</label>
                    <select
                      value={noteForm.channel}
                      onChange={(e) => setNoteForm({ ...noteForm, channel: e.target.value as any })}
                      className="w-full bg-art-card border border-art-line text-xs px-3 py-1.5 rounded-lg text-art-brown"
                    >
                      <option value="WhatsApp">📱 WhatsApp</option>
                      <option value="Llamada">📞 Llamada Telefónica</option>
                      <option value="Presencial">🏪 Atención Presencial</option>
                      <option value="Instagram / FB">📸 Instagram / Facebook</option>
                      <option value="Otro">🌐 Otro Canal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-art-soft uppercase">Resumen / Nota de Conversación *</label>
                  <textarea
                    rows={2}
                    placeholder="Escribe acuerdos de entrega, alergias reportadas o aclaraciones sobre el pedido..."
                    value={noteForm.note}
                    onChange={(e) => setNoteForm({ ...noteForm, note: e.target.value })}
                    className="w-full bg-art-card border border-art-line text-xs p-2 rounded-lg text-art-brown"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Guardar Nota
                  </button>
                </div>
              </form>
            )}

            {/* Note Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientNotes.length > 0 ? (
                clientNotes.map((note) => (
                  <div key={note.id} className="bg-white border border-art-line rounded-lg p-3.5 space-y-2 shadow-2xs relative">
                    <div className="flex items-start justify-between gap-2 border-b border-art-linesoft pb-2">
                      <div>
                        <h6 className="font-bold text-xs text-art-brown flex items-center gap-1.5">
                          <span>{note.customerName}</span>
                          <span className="text-[9px] bg-art-accent-5 text-art-border border border-art-border px-1.5 py-0.2 rounded font-mono">
                            {note.channel}
                          </span>
                        </h6>
                        {note.customerPhone && (
                          <span className="text-[10px] text-art-soft font-mono">{note.customerPhone}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteClientNote(note.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                        title="Eliminar Nota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-art-brown leading-relaxed bg-art-card p-2.5 rounded border border-art-line/60">
                      "{note.note}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-art-soft">
                      <span>✍️ Por: {note.createdBy}</span>
                      <span className="font-mono">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-xs text-art-soft py-6">
                  No hay notas registradas. Registra acuerdos e interacciones con tus clientes aquí.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB C: SUPPLIERS MANAGEMENT */}
      {activeTab === "suppliers" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_suppliers">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Buscar por insumo o nombre..."
                value={searchProviderQuery}
                onChange={(e) => setSearchProviderQuery(e.target.value)}
                className="w-full text-xs bg-white border border-art-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-art-accent"
              />
            </div>

            <button
              onClick={() => {
                setEditingProvider(null);
                setProviderForm({ name: "", contactName: "", phone: "", email: "", address: "", suppliedItems: "" });
                setShowProviderForm(!showProviderForm);
              }}
              className="w-full md:w-auto bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {showProviderForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showProviderForm ? "Cerrar Formulario" : "Agregar Proveedor"}
            </button>
          </div>

          {/* New / Edit Supplier Form */}
          {showProviderForm && (
            <form onSubmit={handleSaveProvider} className="bg-white border border-art-border p-5 rounded-lg max-w-xl space-y-4 shadow-sm animate-fade-in">
              <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-1.5 border-b border-art-border pb-2">
                <Truck className="w-4 h-4 text-art-accent" />
                {editingProvider ? "Editar Proveedor" : "Registrar Nuevo Proveedor"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Nombre del Proveedor *</label>
                  <input
                    type="text"
                    value={providerForm.name}
                    onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                    placeholder="Ej. Distribuidora Inka Sac"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Contacto Principal</label>
                  <input
                    type="text"
                    value={providerForm.contactName}
                    onChange={(e) => setProviderForm({ ...providerForm, contactName: e.target.value })}
                    placeholder="Ej. Lucía Alarcón"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Teléfono de Enlace *</label>
                  <input
                    type="text"
                    value={providerForm.phone}
                    onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                    placeholder="Ej. +51 912 987 654"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Correo Electrónico *</label>
                  <input
                    type="email"
                    value={providerForm.email}
                    onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                    placeholder="comercial@proveedor.pe"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Insumos Provistos (Separados por comas)</label>
                  <input
                    type="text"
                    value={providerForm.suppliedItems}
                    onChange={(e) => setProviderForm({ ...providerForm, suppliedItems: e.target.value })}
                    placeholder="Mantequilla, Cacao Cusco, Chispas, Harina Pastelera"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Dirección o Planta</label>
                  <input
                    type="text"
                    value={providerForm.address}
                    onChange={(e) => setProviderForm({ ...providerForm, address: e.target.value })}
                    placeholder="Parque Industrial G-14, Cusco"
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProviderForm(false)}
                  className="bg-art-panel hover:bg-art-border text-art-text text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-art-accent hover:bg-art-accent/90 text-white text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Guardar Proveedor
                </button>
              </div>
            </form>
          )}

          {/* Suppliers Table List */}
          <div className="bg-white border border-art-border rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-art-panel border-b border-art-border text-art-muted uppercase text-[10px] tracking-wider font-bold">
                    <th className="p-4">Razón Social</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Teléfono</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Insumos Abastecidos</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-border text-art-text">
                  {filteredProviders.length > 0 ? (
                    filteredProviders.map((prov) => (
                      <tr key={prov.id} className="hover:bg-art-panel/30 transition-colors">
                        <td className="p-4 font-bold flex flex-col">
                          <span>{prov.name}</span>
                          <span className="text-[9px] font-mono font-normal text-art-muted">{prov.id}</span>
                        </td>
                        <td className="p-4">{prov.contactName || "No registrado"}</td>
                        <td className="p-4 font-mono">{prov.phone}</td>
                        <td className="p-4">{prov.email}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {prov.suppliedItems.map((item, idx) => (
                              <span key={idx} className="bg-art-card text-art-text border border-art-border text-[9px] px-2 py-0.5 rounded-full font-medium">
                                {item}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleEditProvider(prov)}
                            className="p-1.5 bg-art-panel hover:bg-art-accent/10 hover:text-art-accent rounded transition-all cursor-pointer inline-flex items-center"
                            title="Editar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(prov.id)}
                            className="p-1.5 bg-art-panel hover:bg-rose-50 hover:text-rose-600 rounded transition-all cursor-pointer inline-flex items-center"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-art-muted text-xs">
                        No se encontraron proveedores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB C2: PURCHASE ORDERS HISTORY (ÓRDENES DE COMPRA A PROVEEDORES) */}
      {activeTab === "purchase_orders" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_purchase_orders">
          <div className="bg-white border border-art-border p-6 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-art-text flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-art-accent" /> Histórico de Órdenes de Compra a Proveedores
              </h3>
              <p className="text-xs text-art-muted leading-relaxed">
                Emisión, control e impresión de abastecimiento de materia prima (harinas, azúcares, chocolates, empaques) con proveedores locales.
              </p>
            </div>

            <button
              onClick={() => setShowPOForm(!showPOForm)}
              className="bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {showPOForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showPOForm ? "Cerrar Formulario" : "Nueva Orden de Compra"}
            </button>
          </div>

          {/* New Purchase Order Form */}
          {showPOForm && (
            <form onSubmit={handleSavePurchaseOrder} className="bg-white border border-art-border p-5 rounded-lg max-w-2xl space-y-4 shadow-sm animate-fade-in">
              <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-1.5 border-b border-art-border pb-2">
                <Truck className="w-4 h-4 text-art-accent" />
                Emite Nueva Orden de Compra (OC)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Proveedor *</label>
                  <select
                    value={poForm.providerId}
                    onChange={(e) => setPoForm({ ...poForm, providerId: e.target.value })}
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  >
                    <option value="">-- Seleccionar Proveedor --</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.contactName || 'General'})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Nombre del Insumo / Material *</label>
                  <input
                    type="text"
                    placeholder="Ej. Harina Orgánica 50kg, Chispas 70% Cacao..."
                    value={poForm.materialName}
                    onChange={(e) => setPoForm({ ...poForm, materialName: e.target.value })}
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Cantidad *</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={poForm.quantity}
                    onChange={(e) => setPoForm({ ...poForm, quantity: e.target.value })}
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Unidad de Medida</label>
                  <input
                    type="text"
                    placeholder="Sacos, Kg, Baldes, Unidades..."
                    value={poForm.unit}
                    onChange={(e) => setPoForm({ ...poForm, unit: e.target.value })}
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Precio Unitario (PEN S/.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={poForm.unitPrice}
                    onChange={(e) => setPoForm({ ...poForm, unitPrice: e.target.value })}
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Fecha Estimada de Entrega</label>
                  <input
                    type="date"
                    value={poForm.expectedDeliveryDate}
                    onChange={(e) => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                    className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Observaciones o Notas de Pedido</label>
                  <textarea
                    rows={2}
                    placeholder="Especifique especificaciones técnicas de molienda o entrega en taller..."
                    value={poForm.notes}
                    onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                    className="w-full bg-art-panel border border-art-border rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPOForm(false)}
                  className="bg-art-panel hover:bg-art-border text-art-text text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-art-accent hover:bg-art-accent/90 text-white text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Generar Orden de Compra
                </button>
              </div>
            </form>
          )}

          {/* Purchase Orders Table */}
          <div className="bg-white border border-art-border rounded-lg overflow-hidden shadow-xs">
            <div className="p-4 border-b border-art-border bg-art-panel/40 flex items-center justify-between">
              <span className="text-xs font-bold text-art-text">Registros de Abastecimiento ({purchaseOrders.length})</span>
              <span className="text-xs font-mono font-bold text-art-accent">
                Inversión Consolidada: {formatPrice(purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0))}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-art-panel border-b border-art-border text-art-muted uppercase text-[10px] tracking-wider font-bold">
                    <th className="p-4">N° Orden</th>
                    <th className="p-4">Proveedor</th>
                    <th className="p-4">Insumos Solicitados</th>
                    <th className="p-4">Monto Total</th>
                    <th className="p-4">Estado Operativo</th>
                    <th className="p-4">Pago</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-art-border text-art-text">
                  {purchaseOrders.length > 0 ? (
                    purchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-art-panel/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-art-accent">
                          {po.id}
                          <div className="text-[9px] text-art-muted font-normal">{new Date(po.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4 font-bold">
                          {po.providerName}
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            {po.items.map((it, idx) => (
                              <div key={idx} className="text-xs font-medium text-art-text">
                                • {it.materialName} ({it.quantity} {it.unit})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-art-text">
                          {formatPrice(po.totalAmount)}
                        </td>
                        <td className="p-4">
                          <select
                            value={po.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as any;
                              setPurchaseOrders(prev => prev.map(item => item.id === po.id ? { ...item, status: newStatus } : item));
                            }}
                            className="bg-art-panel border border-art-border rounded px-2 py-1 text-[10px] font-bold text-art-text"
                          >
                            <option value="Borrador">Borrador</option>
                            <option value="Enviado a Proveedor">Enviado a Proveedor</option>
                            <option value="En Tránsito">En Tránsito</option>
                            <option value="Recibido / Almacén">Recibido / Almacén</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            po.paymentStatus === "Pagado Total" ? "bg-emerald-100 text-emerald-800" : "bg-art-accent-5 text-art-border"
                          }`}>
                            {po.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handlePrintPurchaseOrder(po)}
                            className="p-1.5 bg-art-panel hover:bg-art-accent-5 text-art-border border border-art-border rounded transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                            title="Imprimir Orden de Compra"
                          >
                            <Printer className="w-3.5 h-3.5" /> Imprimir
                          </button>
                          <button
                            onClick={() => handleDeletePurchaseOrder(po.id)}
                            className="p-1.5 bg-art-panel hover:bg-rose-50 hover:text-rose-600 rounded transition-all cursor-pointer inline-flex items-center"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-art-muted text-xs">
                        No hay órdenes de compra registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB G: INVENTORY & RECIPES MONITORING */}
      {activeTab === "inventory" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_inventory">
          {/* Header Action Bar */}
          <div className="bg-white border border-art-border p-6 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-art-text flex items-center gap-2">
                <Layers className="w-5 h-5 text-art-accent" /> Monitoreo de Inventario Crítico & Recetas
              </h3>
              <p className="text-xs text-art-muted leading-relaxed">
                Analiza el catálogo de productos terminados en tiempo real y calcula la reserva de materias primas descontando el consumo de tus pedidos activos en taller.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  // Replenish all raw materials by +10kg / +50 units
                  setRawMaterials(prev => prev.map(rm => {
                    const add = rm.unit === "g" ? 10000 : 50;
                    return { ...rm, stock: rm.stock + add };
                  }));
                  sendBrowserNotification(
                    "🛒 Inventario Reabastecido",
                    "Se ha cargado un lote de emergencia de +10kg a los insumos básicos de repostería."
                  );
                }}
                className="bg-art-card hover:bg-art-card/80 border border-art-line text-art-brown text-xs font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-art-accent" /> Carga Masiva Insumos (+10kg)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: INGREDIENTS & RAW MATERIALS (Materia Prima) */}
            <div className="lg:col-span-7 bg-white border border-art-border rounded-lg p-6 space-y-6 shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-art-border">
                <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-2">
                  🌾 Control de Materias Primas e Insumos de Repostería
                </h4>
                <span className="text-[10px] bg-art-accent/10 text-art-accent px-2 py-0.5 rounded-full font-bold uppercase">
                  Consumo Neto de Taller
                </span>
              </div>

              {/* Insumos List */}
              <div className="space-y-4">
                {rawMaterials.map((rm) => {
                  // Compute active demand
                  const { totalFlour, totalButter, totalSugar, totalChips } = calculatePendingIngredients();
                  let totalEggs = 0;
                  let totalCoffee = 0;
                  orders.filter(o => o.status !== "Entregado").forEach(o => {
                    o.items.forEach(i => {
                      const q = i.quantity;
                      if (!i.isCustom) {
                        const mItem = menuItems.find(mi => mi.name === i.name);
                        if (mItem) {
                          if (mItem.category === "bebidas") {
                            if (mItem.name.toLowerCase().includes("café") || mItem.name.toLowerCase().includes("espresso") || mItem.name.toLowerCase().includes("capuccino") || mItem.name.toLowerCase().includes("mockachino")) {
                              totalCoffee += 25 * q;
                            }
                          } else {
                            totalEggs += 1 * q;
                            if (mItem.name.toLowerCase().includes("café") || mItem.id === "m2") {
                              totalCoffee += 15 * q;
                            }
                          }
                        } else {
                          totalEggs += 1 * q;
                        }
                      } else {
                        totalEggs += 2 * q;
                      }
                    });
                  });

                  let pendingUsage = 0;
                  if (rm.id === "rw-1") pendingUsage = totalFlour;
                  else if (rm.id === "rw-2") pendingUsage = totalButter;
                  else if (rm.id === "rw-3") pendingUsage = totalSugar;
                  else if (rm.id === "rw-4") pendingUsage = totalChips;
                  else if (rm.id === "rw-5") pendingUsage = totalEggs;
                  else if (rm.id === "rw-6") pendingUsage = totalCoffee;

                  const netAvailable = rm.stock - pendingUsage;
                  const isCritical = netAvailable <= rm.criticalLimit;

                  // Find matching provider
                  const matchedProvider = providers.find(p => 
                    p.suppliedItems.some(si => 
                      si.toLowerCase().includes(rm.name.split(" ")[0].toLowerCase()) ||
                      rm.name.toLowerCase().includes(si.toLowerCase())
                    )
                  ) || providers[0];

                  return (
                    <div 
                      key={rm.id} 
                      className={`p-4 border rounded-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isCritical 
                          ? "bg-rose-50/70 border-rose-200 shadow-3xs" 
                          : "bg-art-panel/10 border-art-border"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-xs text-art-text">{rm.name}</span>
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {rm.category}
                          </span>
                          {isCritical && (
                            <span className="px-2 py-0.5 text-[8px] font-bold bg-rose-600 text-white rounded-full animate-pulse uppercase tracking-wide">
                              ⚠️ REABASTECER CRÍTICO
                            </span>
                          )}
                        </div>

                        {/* Inventory Stats */}
                        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-art-text">
                          <div>
                            <span className="text-[9px] font-bold text-art-muted block uppercase">Stock Físico:</span>
                            <span className="font-mono">
                              {rm.unit === "g" ? `${(rm.stock / 1000).toFixed(2)} kg` : `${rm.stock} u`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-art-muted block uppercase">Comprometido:</span>
                            <span className="font-mono text-art-accent-dark">
                              {rm.unit === "g" ? `${(pendingUsage / 1000).toFixed(2)} kg` : `${pendingUsage} u`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-art-muted block uppercase">Disponible Real:</span>
                            <strong className={`font-mono ${isCritical ? "text-rose-600 font-extrabold" : "text-emerald-700"}`}>
                              {rm.unit === "g" ? `${(netAvailable / 1000).toFixed(2)} kg` : `${netAvailable} u`}
                            </strong>
                          </div>
                        </div>

                        {/* Interactive Threshold inputs */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-art-muted uppercase">Stock Manual:</span>
                            <input
                              type="number"
                              value={rm.stock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setRawMaterials(prev => prev.map(m => m.id === rm.id ? { ...m, stock: val } : m));
                              }}
                              className="w-18 bg-white border border-art-border rounded px-1.5 py-0.5 text-[10px] font-mono focus:outline-none"
                            />
                            <span className="text-[9px] font-bold text-art-muted">{rm.unit}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-bold text-art-muted uppercase">Límite Crítico:</span>
                            <input
                              type="number"
                              value={rm.criticalLimit}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setRawMaterials(prev => prev.map(m => m.id === rm.id ? { ...m, criticalLimit: val } : m));
                              }}
                              className="w-16 bg-white border border-art-border rounded px-1.5 py-0.5 text-[10px] font-mono focus:outline-none"
                            />
                            <span className="text-[9px] font-bold text-art-muted">{rm.unit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex flex-col gap-2 justify-center shrink-0">
                        <button
                          onClick={() => {
                            // Quick replenish button (+5kg or +50 units)
                            const replenishQty = rm.unit === "g" ? 5000 : 50;
                            setRawMaterials(prev => prev.map(m => m.id === rm.id ? { ...m, stock: m.stock + replenishQty } : m));
                            sendBrowserNotification(
                              "📦 Insumo Suministrado",
                              `Se sumaron ${replenishQty}${rm.unit} de ${rm.name} al stock físico.`
                            );
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wide text-center"
                        >
                          + Abastecer
                        </button>
                        
                        {matchedProvider && (
                          <button
                            onClick={() => {
                              // Generate email/WhatsApp emergency text to supplier
                              const reorderQty = rm.unit === "g" ? "15 kg" : "100 unidades";
                              const text = `*🚨 SOLICITUD DE COMPRA DE EMERGENCIA*\n\nEstimado proveedor *${matchedProvider.name}* (Atención: ${matchedProvider.contactName}),\n\nRequerimos el despacho prioritario de emergencia del siguiente insumo debido a stock crítico en nuestro taller:\n\n- *Insumo:* ${rm.name}\n- *Cantidad:* ${reorderQty}\n- *Destino:* Cusco, Av. El Sol 124\n\nPor favor confirmar la disponibilidad inmediata y costo total de despacho.`;
                              
                              const phoneClean = matchedProvider.phone.replace(/\s+/g, '').replace('+', '');
                              window.open(`https://api.whatsapp.com/send?phone=${phoneClean}&text=${encodeURIComponent(text)}`, "_blank");
                            }}
                            className="bg-art-card hover:bg-art-card/80 border border-art-line text-art-brown font-bold text-[9px] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer uppercase tracking-wide text-center flex items-center justify-center gap-1"
                            title={`Contactar a ${matchedProvider.name}`}
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" /> Compra SOS
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUMN 2: FINISHED GOODS CATALOG STOCK (Productos en Vitrina) */}
            <div className="lg:col-span-5 bg-white border border-art-border rounded-lg p-6 space-y-6 shadow-xs">
              <div className="pb-2 border-b border-art-border">
                <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-2">
                  🧁 Stock de Productos Terminados en Vitrina
                </h4>
                <p className="text-xs text-art-muted mt-0.5">Control de unidades disponibles en tienda física para despacho rápido.</p>
              </div>

              {/* Finished items list */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {menuItems.map((item) => {
                  const stock = item.stock ?? 0;
                  const crit = item.criticalStock ?? 5;
                  const isLow = stock > 0 && stock <= crit;
                  const isOut = stock === 0;

                  return (
                    <div 
                      key={item.id} 
                      className={`p-3 border rounded-lg flex items-center justify-between gap-3 ${
                        isOut 
                          ? "bg-rose-50 border-rose-200" 
                          : isLow 
                          ? "bg-art-accent-5 border-art-border" 
                          : "bg-white border-art-border hover:border-art-accent/40"
                      } transition-colors`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-xs font-serif text-art-text truncate block">{item.name}</strong>
                          {isOut ? (
                            <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-rose-600 text-white rounded-full uppercase tracking-wide">
                              Agotado
                            </span>
                          ) : isLow ? (
                            <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-art-accent text-white rounded-full uppercase tracking-wide animate-pulse">
                              Bajo
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-emerald-600 text-white rounded-full uppercase tracking-wide">
                              Óptimo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-art-muted capitalize">Categoría: {item.category}</p>
                        
                        {/* Inline stocks */}
                        <div className="flex items-center gap-3 pt-1 text-[11px]">
                          <span className="text-art-muted font-bold">Disp: <span className="font-mono text-art-text font-extrabold">{stock} u</span></span>
                          <span className="text-art-muted font-bold">Mín: <span className="font-mono text-art-text">{crit} u</span></span>
                        </div>
                      </div>

                      {/* Stepper stock updater */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            if (stock > 0) {
                              const updated = menuItems.map(m => m.id === item.id ? { ...m, stock: stock - 1 } : m);
                              setMenuItems(updated);
                            }
                          }}
                          className="w-7 h-7 bg-art-panel text-art-text border border-art-border hover:bg-art-border rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                          title="Restar 1 unidad"
                        >
                          -
                        </button>
                        
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => {
                            const val = Math.max(0, parseInt(e.target.value) || 0);
                            const updated = menuItems.map(m => m.id === item.id ? { ...m, stock: val } : m);
                            setMenuItems(updated);
                          }}
                          className="w-10 text-center bg-art-panel/50 border border-art-border rounded font-mono text-xs py-1"
                        />

                        <button
                          onClick={() => {
                            const updated = menuItems.map(m => m.id === item.id ? { ...m, stock: stock + 1 } : m);
                            setMenuItems(updated);
                          }}
                          className="w-7 h-7 bg-art-panel text-art-text border border-art-border hover:bg-art-border rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                          title="Sumar 1 unidad"
                        >
                          +
                        </button>

                        <button
                          onClick={() => {
                            const updated = menuItems.map(m => m.id === item.id ? { ...m, stock: stock + 12 } : m);
                            setMenuItems(updated);
                            sendBrowserNotification(
                              "🧁 Vitrina Abastecida",
                              `Se sumó +12 unidades al stock de ${item.name}.`
                            );
                          }}
                          className="bg-art-accent hover:bg-art-accent/90 text-white font-bold text-[9px] px-2 py-1.5 rounded-lg transition-colors cursor-pointer uppercase tracking-wide"
                          title="Abastecer lote de +12 unidades rápido"
                        >
                          +12 Lote
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recipe standards help card */}
              <div className="bg-art-card border border-art-line p-4 rounded-lg space-y-2">
                <h5 className="font-serif font-bold text-xs text-art-brown flex items-center gap-1.5">
                  🧑‍🍳 Rendimiento de Taller & Recetas Estándar
                </h5>
                <textarea
                  value={recipeStandardsText}
                  onChange={(e) => setRecipeStandardsText(e.target.value)}
                  rows={4}
                  className="w-full text-[10px] text-art-brown leading-relaxed bg-white border border-art-line rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-art-caramel resize-y"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: FLUJO DE CAJA */}
      {activeTab === "cashflow" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_cashflow">
          {/* Header */}
          <div className="bg-white border border-art-border p-6 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-art-text flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-art-accent" /> Flujo de Caja
              </h3>
              <p className="text-xs text-art-muted leading-relaxed">
                Registra ingresos y egresos para controlar el flujo de dinero de tu negocio.
              </p>
            </div>
            <button
              onClick={() => setShowCashFlowForm(!showCashFlowForm)}
              className="bg-art-accent hover:bg-art-accent-hover text-white text-xs font-bold px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md select-none shrink-0"
            >
              {showCashFlowForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCashFlowForm ? "Cancelar" : "+ Nueva Transacción"}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-art-border rounded-lg p-5 space-y-2">
              <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Hoy</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-serif font-bold ${getCashFlowSummary().today.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  S/. {getCashFlowSummary().today.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-4 text-[10px]">
                <span className="text-emerald-600">↑ S/. {getCashFlowSummary().today.income.toFixed(2)}</span>
                <span className="text-rose-600">↓ S/. {getCashFlowSummary().today.expense.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-5 space-y-2">
              <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Esta Semana</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-serif font-bold ${getCashFlowSummary().week.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  S/. {getCashFlowSummary().week.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-4 text-[10px]">
                <span className="text-emerald-600">↑ S/. {getCashFlowSummary().week.income.toFixed(2)}</span>
                <span className="text-rose-600">↓ S/. {getCashFlowSummary().week.expense.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-5 space-y-2">
              <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Este Mes</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-serif font-bold ${getCashFlowSummary().month.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  S/. {getCashFlowSummary().month.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex gap-4 text-[10px]">
                <span className="text-emerald-600">↑ S/. {getCashFlowSummary().month.income.toFixed(2)}</span>
                <span className="text-rose-600">↓ S/. {getCashFlowSummary().month.expense.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          {showCashFlowForm && (
            <div className="bg-white border border-art-border rounded-lg p-6 shadow-xs">
              <h4 className="font-serif font-bold text-sm text-art-text mb-4">Nueva Transacción</h4>
              <form onSubmit={handleAddCashFlow} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Tipo *</label>
                    <select
                      value={cashFlowForm.type}
                      onChange={(e) => setCashFlowForm(prev => ({ ...prev, type: e.target.value as "ingreso" | "egreso" }))}
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                    >
                      <option value="ingreso">💰 Ingreso</option>
                      <option value="egreso">💸 Egreso</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Fecha *</label>
                    <input
                      type="date"
                      value={cashFlowForm.date}
                      onChange={(e) => setCashFlowForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Monto (S/.) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashFlowForm.amount}
                      onChange={(e) => setCashFlowForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Categoría *</label>
                    <select
                      value={cashFlowForm.category}
                      onChange={(e) => setCashFlowForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {cashFlowForm.type === "ingreso" ? (
                        <>
                          <option value="Ventas Directas">Ventas Directas</option>
                          <option value="Pedidos Online">Pedidos Online</option>
                          <option value="Delivery">Delivery</option>
                          <option value="Otros Ingresos">Otros Ingresos</option>
                        </>
                      ) : (
                        <>
                          <option value="Materia Prima">Materia Prima</option>
                          <option value="Mano de Obra Fija">Mano de Obra Fija</option>
                          <option value="Mano de Obra Temporal">Mano de Obra Temporal</option>
                          <option value="Servicios (Luz, Agua, Internet)">Servicios (Luz, Agua, Internet)</option>
                          <option value="Alquiler">Alquiler</option>
                          <option value="Equipos">Equipos</option>
                          <option value="Delivery">Delivery</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Impuestos">Impuestos</option>
                          <option value="Empaques">Empaques</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Otros Egresos">Otros Egresos</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Descripción *</label>
                    <input
                      type="text"
                      value={cashFlowForm.description}
                      onChange={(e) => setCashFlowForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ej: Compra de harina"
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Referencia / Factura</label>
                    <input
                      type="text"
                      value={cashFlowForm.reference}
                      onChange={(e) => setCashFlowForm(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="N° factura o comprobante"
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Método de Pago</label>
                  <select
                    value={cashFlowForm.paymentMethod}
                    onChange={(e) => setCashFlowForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Yape">Yape/Plin</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-art-accent hover:bg-art-accent/90 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  💾 Guardar Transacción
                </button>
              </form>
            </div>
          )}

          {/* Transactions Table */}
          <div className="bg-white border border-art-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-art-border">
              <h4 className="font-serif font-bold text-sm text-art-text">Historial de Transacciones</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="bg-art-panel text-art-muted uppercase text-[9px] font-bold border-b border-art-border">
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Descripción</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Balance</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlowTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-art-muted">
                        No hay transacciones registradas
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const sorted = [...cashFlowTransactions].sort((a, b) => a.date.localeCompare(b.date));
                      let runningBalance = 0;
                      return sorted.map(transaction => {
                        runningBalance += transaction.type === 'ingreso' ? transaction.amount : -transaction.amount;
                        return (
                          <tr key={transaction.id} className="border-b border-art-border bg-white hover:bg-art-panel/20">
                            <td className="p-3 font-mono">{transaction.date}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                transaction.type === 'ingreso' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : 'bg-rose-100 text-rose-700'
                              }`}>
                                {transaction.type === 'ingreso' ? '💰 Ingreso' : '💸 Egreso'}
                              </span>
                            </td>
                            <td className="p-3 font-medium">{transaction.category}</td>
                            <td className="p-3 text-art-muted max-w-[200px] truncate">{transaction.description}</td>
                            <td className={`p-3 font-bold ${
                              transaction.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {transaction.type === 'ingreso' ? '+' : '-'} S/. {transaction.amount.toFixed(2)}
                            </td>
                            <td className={`p-3 font-bold ${runningBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              S/. {runningBalance.toFixed(2)}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleDeleteCashFlow(transaction.id)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB D: MENU & SPECIALTIES CREATOR (with drag-and-drop file support) */}
      {activeTab === "catalog" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_menu">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-72">
              <input
                type="text"
                placeholder="Buscar creación por nombre..."
                value={searchMenuQuery}
                onChange={(e) => setSearchMenuQuery(e.target.value)}
                className="w-full text-xs bg-white border border-art-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-art-accent"
              />
            </div>

            <button
              onClick={() => {
                setEditingMenu(null);
                setMenuForm({ name: "", description: "", price: "", category: "especiales", prepTime: "25 min", allergens: "", image: "", videoUrl: "", longDescription: "", imgPosition: "center" } as any);
                setShowMenuForm(!showMenuForm);
              }}
              className="w-full md:w-auto bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {showMenuForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showMenuForm ? "Cerrar Panel" : "Añadir Creación / Especialidad"}
            </button>
          </div>

          {/* New / Edit Recipe Form */}
          {showMenuForm && (
            <form onSubmit={handleSaveMenu} className="bg-white border border-art-border p-6 rounded-lg max-w-2xl space-y-5 shadow-sm animate-fade-in">
              <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-1.5 border-b border-art-border pb-2">
                <Coffee className="w-4 h-4 text-art-accent" />
                {editingMenu ? "Editar Creación en Vitrina" : "Nueva Especialidad / Creación de Autor"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Nombre de la Creación *</label>
                    <input
                      type="text"
                      value={menuForm.name}
                      onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                      placeholder="Ej. Galleta Rellena de Macadamia Caramelizada"
                      className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex gap-1.5 mb-1.5"><input id="input_new_category" type="text" placeholder="➕ Nueva categoría (ej. Tortas de Temporada)" className="flex-1 bg-white border border-art-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent" /><button type="button" onClick={() => { const inp = document.getElementById("input_new_category") as HTMLInputElement; const val = (inp?.value || "").trim(); if (!val) return; const cur: string[] = JSON.parse(localStorage.getItem("flikicookie_categories") || "[]"); if (!cur.includes(val)) { cur.push(val); localStorage.setItem("flikicookie_categories", JSON.stringify(cur)); } if (inp) inp.value = ""; setMenuForm({ ...menuForm, category: val }); }} className="bg-art-accent hover:bg-art-accent-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer">＋ Agregar</button></div><div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">🎬 Video del producto (opcional)</label>
                    <input type="text" id="input_new_video" value={(menuForm as any).videoUrl || ""} onChange={(e) => setMenuForm({ ...menuForm, videoUrl: e.target.value } as any)} placeholder="public/videos/mi-galleta.mp4 o https://..." className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">📖 Descripción ampliada (ficha)</label>
                    <textarea id="input_new_longdesc" rows={3} value={(menuForm as any).longDescription || ""} onChange={(e) => setMenuForm({ ...menuForm, longDescription: e.target.value } as any)} placeholder="Texturas, cortes, historia del producto..." className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent resize-y" />
                  </div>
<div className="space-y-1">
                    <p className="text-[9px] leading-relaxed text-art-muted bg-art-panel border border-art-border/40 rounded-md px-2 py-1">📐 <b>Regla de fotos:</b> sube imágenes <b>horizontales 4:3</b> (mín. 800×600 px) para que se enmarquen solas. Las verticales se recortan; elige abajo la zona visible.</p>
                    <p className="text-[9px] leading-relaxed text-art-muted bg-art-panel border border-art-border/40 rounded-md px-2 py-1">📐 <b>Regla de fotos:</b> sube imágenes <b>horizontales 4:3</b> (mín. 800×600 px) para que se enmarquen solas. Las verticales se recortan; elige abajo la zona visible.</p>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">🖼️ Encuadre de la foto en el cuadro</label>
                    <select value={(menuForm as any).imgPosition || "center"} onChange={(e) => setMenuForm({ ...menuForm, imgPosition: e.target.value } as any)} className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent">
                      <option value="center">Centro</option><option value="top">Arriba</option><option value="bottom">Abajo</option><option value="left">Izquierda</option><option value="right">Derecha</option>
                    </select>
                  </div>
<label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Categoría del Menú *</label>
                    <select
                      value={menuForm.category}
                      onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                      className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                      required
                    >
                      <option value="rellenas">🍪 Galletas Rellenas</option>
                      <option value="especiales">✨ Especialidades de Autor</option>
                      <option value="clasicas">⭐ Galletas Clásicas</option>
                      <option value="bebidas">☕ Bebidas & Cafetería</option>{(JSON.parse(localStorage.getItem("flikicookie_categories") || "[]") as string[]).map((cc) => (<option key={cc} value={cc}>🏷️ {cc}</option>))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Precio Unitario (S/.) *</label>
                      <input
                        type="text"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                        placeholder="Ej. 14.50"
                        className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Tiempo de Preparación</label>
                      <input
                        type="text"
                        value={menuForm.prepTime}
                        onChange={(e) => setMenuForm({ ...menuForm, prepTime: e.target.value })}
                        placeholder="Ej. 15 min"
                        className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Alérgenos (Separados por comas)</label>
                    <input
                      type="text"
                      value={menuForm.allergens}
                      onChange={(e) => setMenuForm({ ...menuForm, allergens: e.target.value })}
                      placeholder="Lácteos, Gluten, Nueces de Árbol"
                      className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    />
                  </div>

                  {/* Mayorista & Temporada Fields */}
                  <div className="bg-art-panel/40 border border-art-border p-3 rounded-lg space-y-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-art-accent block">💰 Precios Especiales, Mayorista & Campañas</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-wider text-art-muted">Precio x Mayor (S/.)</label>
                        <input
                          type="text"
                          value={menuForm.wholesalePrice}
                          onChange={(e) => setMenuForm({ ...menuForm, wholesalePrice: e.target.value })}
                          placeholder="Ej. 8.50"
                          className="w-full bg-white border border-art-border rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-art-accent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-wider text-art-muted">Cant. Mínima x Mayor</label>
                        <input
                          type="text"
                          value={menuForm.wholesaleMinQty}
                          onChange={(e) => setMenuForm({ ...menuForm, wholesaleMinQty: e.target.value })}
                          placeholder="Ej. 12"
                          className="w-full bg-white border border-art-border rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-art-accent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-wider text-art-muted">Campaña / Temporada</label>
                        <input
                          type="text"
                          value={menuForm.seasonalTag}
                          onChange={(e) => setMenuForm({ ...menuForm, seasonalTag: e.target.value })}
                          placeholder="Ej. Navidad, Día del Padre"
                          className="w-full bg-white border border-art-border rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-art-accent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-wider text-art-muted">Precio Oferta (S/.)</label>
                        <input
                          type="text"
                          value={menuForm.promoPrice}
                          onChange={(e) => setMenuForm({ ...menuForm, promoPrice: e.target.value })}
                          placeholder="Ej. 10.00"
                          className="w-full bg-white border border-art-border rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-art-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Drag and Drop Image Box */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted block">Fotografía del Producto</label>
                    
                    {/* Drag and Drop Container */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px] relative ${
                        isDragging 
                          ? "border-art-accent bg-art-accent/5" 
                          : "border-art-border bg-art-panel hover:bg-art-panel/70"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                      />

                      {menuForm.image ? (
                        <div className="relative group w-full h-full flex flex-col items-center justify-center">
                          <img
                            src={menuForm.image}
                            alt="Preview"
                            className="w-full h-44 object-cover rounded-lg border border-art-border" style={{ objectPosition: (menuForm as any).imgPosition || "center" }}
                          />
                          <p className="text-[9px] text-art-muted mt-2 font-medium">Click para reemplazar imagen</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuForm(prev => ({ ...prev, image: "" }));
                            }}
                            className="absolute -top-1 -right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-xs"
                            title="Quitar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-white text-art-muted flex items-center justify-center shadow-xs">
                            <Upload className="w-5 h-5 text-art-muted" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-art-text">Arrastra la foto de tu cookie aquí</p>
                            <p className="text-[9px] text-art-muted">o haz clic para explorar tus archivos</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted">Descripción Comercial *</label>
                    <textarea
                      value={menuForm.description}
                      onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                      placeholder="Describe los ingredientes, texturas, si es crocante por fuera y suave por dentro..."
                      rows={3}
                      className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-art-border">
                <button
                  type="button"
                  onClick={() => setShowMenuForm(false)}
                  className="bg-art-panel hover:bg-art-border text-art-text text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-art-accent hover:bg-art-accent/90 text-white text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Registrar en Vitrina
                </button>
              </div>
            </form>
          )}

          {/* Catalog grid inside Admin view */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMenuItems.map((item) => (
              <div key={item.id} className="bg-white border border-art-border rounded-lg overflow-hidden flex flex-col justify-between shadow-xs">
                <div>
                  <div className="h-44 bg-art-panel border-b border-art-border relative flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif font-bold text-art-text text-sm leading-tight">{item.name}</h4>
                      <span className="font-mono font-bold text-art-text text-sm bg-art-panel border border-art-border px-1.5 py-0.2 rounded shrink-0">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <p className="text-xs text-art-muted leading-relaxed line-clamp-3">{item.description}</p>
                    
                    {item.allergens && item.allergens.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1 text-[9px]">
                        <span className="text-art-muted font-bold uppercase">Alérgenos:</span>
                        {item.allergens.map((alg, i) => (
                          <span key={i} className="text-red-700 bg-red-50 border border-red-100 px-1.5 py-0.2 rounded">
                            {alg}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Seasonal and Wholesale specs brief */}
                    {(item.seasonalTag || item.wholesalePrice !== undefined) && (
                      <div className="pt-2.5 border-t border-slate-100 mt-2 space-y-1.5">
                        {item.seasonalTag && (
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100">
                            <span>{item.seasonalTag === "Navidad" ? "🎄" : 
                                   item.seasonalTag === "Día del Padre" ? "👔" : 
                                   item.seasonalTag === "Graduaciones" ? "🎓" : "✨"} Campaña: {item.seasonalTag}</span>
                            {item.promoPrice !== undefined && (
                              <span className="ml-auto font-mono text-rose-800 font-bold bg-white px-1.5 rounded border border-rose-200">Oferta: {formatPrice(item.promoPrice)}</span>
                            )}
                          </div>
                        )}
                        {item.wholesalePrice !== undefined && (
                          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                            <span>🏷️ Por Mayor: {formatPrice(item.wholesalePrice)} <span className="text-slate-400 font-normal">(mín. {item.wholesaleMinQty || 6} u.)</span></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-art-border bg-art-panel/20 flex justify-end gap-1.5">
                  <button
                    onClick={() => handleEditMenu(item)}
                    className="px-3 py-1.5 bg-white hover:bg-art-accent hover:text-white border border-art-border text-art-text rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteMenu(item.id)}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 hover:text-rose-600 border border-art-border text-art-text rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
 
      {/* TAB E: REPORTS & PRINTING WORKSPACE */}
      {activeTab === "reports" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_reports">
          {/* Header Action Bar */}
          <div className="bg-white border border-art-border p-6 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-art-text flex items-center gap-2">
                <Printer className="w-5 h-5 text-art-accent" /> Centro de Reportes & Documentación de Taller
              </h3>
              <p className="text-xs text-art-muted leading-relaxed">
                Genera listados consolidados, compras de materia prima, listas de entregas físicas para reparto e historial de ventas mensuales formateados especialmente para su impresión física.
              </p>
            </div>
            <button
              onClick={() => handlePrintReports("all")}
              className="bg-art-accent hover:bg-art-accent-hover text-white text-xs font-bold px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md select-none shrink-0"
            >
              <Printer className="w-4 h-4 text-art-accent-10 animate-pulse" /> Imprimir Reporte Consolidado Completo
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-art-border rounded-lg p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Bolsa de Pedidos Activos</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-serif font-bold text-art-text">S/. {orders.filter(o => o.status !== "Entregado").reduce((acc, curr) => acc + curr.totalAmount, 0).toFixed(2)}</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block">★ {orders.filter(o => o.status !== "Entregado").length} pedidos en flujo</span>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Harina Requerida (Taller)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-serif font-bold text-art-text">{(calculatePendingIngredients().totalFlour / 1000).toFixed(2)} kg</span>
              </div>
              <span className="text-[10px] text-art-muted block">Para hornear pedidos actuales</span>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Mantequilla Requerida</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-serif font-bold text-art-text">{(calculatePendingIngredients().totalButter / 1000).toFixed(2)} kg</span>
              </div>
              <span className="text-[10px] text-art-muted block">Mantequilla pura del Valle Cusco</span>
            </div>

            <div className="bg-white border border-art-border rounded-lg p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Top Sabor del Mes</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-serif font-bold text-art-accent truncate block">
                  {Object.entries(getFlavorCounts()).sort((a, b) => b[1] - a[1])[0]?.[0] || "Ninguno"}
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block">Preferido de la temporada</span>
            </div>
          </div>

          {/* SEC: RECHARTS INTERACTIVE ANALYTICS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="reports_recharts_analytics">
            {/* Chart 1: Revenue comparisons (Line/Area Chart) */}
            <div className="bg-white border border-art-border p-5 rounded-lg shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Desempeño Financiero</span>
                <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                  📈 Comparativa Mensual de Ingresos
                </h4>
                <p className="text-xs text-art-muted">Evolución de ventas y depósitos acumulados por mes (Mayo - Julio 2026).</p>
              </div>

              <div className="h-64 w-full text-xs" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={getMonthlyRevenueData()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-art-border)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-art-border)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-art-linesoft)" />
                    <XAxis dataKey="month" stroke="var(--color-art-soft)" fontSize={11} />
                    <YAxis stroke="var(--color-art-soft)" fontSize={11} tickFormatter={(v) => `S/. ${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-art-panel)', borderColor: 'var(--color-art-border)', borderRadius: '6px', color: 'var(--color-art-text)' }}
                      formatter={(value) => [`S/. ${value}`, 'Ingresos']}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="Ingresos" 
                      stroke="var(--color-art-deep)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorIngresos)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Product category preferences (Bar Chart) */}
            <div className="bg-white border border-art-border p-5 rounded-lg shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Preferencia de Consumo</span>
                <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                  📊 Ventas por Tipo de Producto
                </h4>
                <p className="text-xs text-art-muted">Preferencia de clientes según la categoría y creaciones personalizadas.</p>
              </div>

              <div className="h-64 w-full text-xs" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getSalesByCategory()}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-art-linesoft)" />
                    <XAxis dataKey="category" stroke="var(--color-art-soft)" fontSize={11} />
                    <YAxis stroke="var(--color-art-soft)" fontSize={11} tickFormatter={(v) => `S/. ${v}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-art-card)', borderColor: 'var(--color-art-line)', borderRadius: '6px', color: 'var(--color-art-deep)' }}
                      formatter={(value) => [`S/. ${value}`, 'Vendido']}
                    />
                    <Legend />
                    <Bar dataKey="Ventas" fill="var(--color-art-border)" radius={[4, 4, 0, 0]}>
                      {getSalesByCategory().map((entry, index) => {
                        const colors = ['var(--color-art-soft)', 'var(--color-art-border)', 'var(--color-art-muted)', 'var(--color-art-line)', '#C27D78'];
                        const fill = colors[index % colors.length];
                        return <Cell key={`cell-${index}`} fill={fill as any} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Grid of Report modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Active orders report */}
            <div className="bg-white border border-art-border rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                      📋 Reporte de Pedidos Activos
                    </h4>
                    <p className="text-xs text-art-muted">Ventas en preparación, montos, métodos de pago y estado actual.</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-art-accent-dark bg-art-accent-5 border border-art-border px-2 py-0.5 rounded">
                    Filtro: No Entregados
                  </span>
                </div>

                <div className="border border-art-border rounded-lg overflow-hidden bg-art-panel/30">
                  <table className="w-full text-[11px] text-left">
                    <thead>
                      <tr className="bg-art-panel text-art-muted uppercase text-[9px] font-bold border-b border-art-border">
                        <th className="p-2">ID</th>
                        <th className="p-2">Cliente</th>
                        <th className="p-2">Fecha</th>
                        <th className="p-2 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter(o => o.status !== "Entregado").slice(0, 3).map(o => (
                        <tr key={o.id} className="border-b border-art-border bg-white">
                          <td className="p-2 font-mono font-bold text-art-accent">{o.id}</td>
                          <td className="p-2 font-medium truncate max-w-[100px]">{o.customerName}</td>
                          <td className="p-2 text-art-muted">{o.deliveryDate}</td>
                          <td className="p-2 text-right font-bold text-art-text">S/. {o.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                      {orders.filter(o => o.status !== "Entregado").length > 3 && (
                        <tr>
                          <td colSpan={4} className="p-1.5 text-center text-[10px] text-art-muted italic">
                            + {orders.filter(o => o.status !== "Entregado").length - 3} pedidos adicionales en lista...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={() => handlePrintReports("orders")}
                className="w-full bg-art-accent hover:bg-art-accent-hover text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer animate-fade-in"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Hoja de Pedidos Activos
              </button>
            </div>

            {/* Card 2: Ingredients procurement list */}
            <div className="bg-white border border-art-border rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                      🌾 Compras Pendientes e Insumos de Repostería
                    </h4>
                    <p className="text-xs text-art-muted">Cálculo de ingredientes consolidando la cocina.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-art-panel/20 p-3 border border-art-border rounded-lg">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-art-muted uppercase block">🌾 Secos & Grasas:</span>
                    <ul className="space-y-0.5 text-[11px] text-art-text list-disc list-inside">
                      <li>Harina: <strong className="text-art-accent">{(calculatePendingIngredients().totalFlour / 1000).toFixed(2)} kg</strong></li>
                      <li>Mantequilla: <strong className="text-art-accent">{(calculatePendingIngredients().totalButter / 1000).toFixed(2)} kg</strong></li>
                      <li>Azúcar: <strong>{(calculatePendingIngredients().totalSugar / 1000).toFixed(2)} kg</strong></li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-art-muted uppercase block">🎨 Sabores Especiales:</span>
                    <ul className="space-y-0.5 text-[11px] text-art-text list-disc list-inside truncate">
                      {Object.keys(calculatePendingIngredients().customFlavors).slice(0, 3).map(k => (
                        <li key={k} className="truncate">Masa {k}: <strong>{calculatePendingIngredients().customFlavors[k]}g</strong></li>
                      ))}
                      {Object.keys(calculatePendingIngredients().customFlavors).length === 0 && (
                        <li className="text-art-muted italic text-[10px]">Sin masas especiales hoy</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePrintReports("compras")}
                className="w-full bg-art-accent hover:bg-art-accent-hover text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Hoja de Insumos & Compras
              </button>
            </div>

            {/* Card 3: Deliveries and dispatch driver checklists */}
            <div className="bg-white border border-art-border rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                      🚚 Guía de Entregas & Logística de Envíos
                    </h4>
                    <p className="text-xs text-art-muted">Lista de despacho física de entregas con firma del cliente.</p>
                  </div>
                </div>

                <div className="border border-art-border rounded-lg p-3 space-y-2 bg-art-panel/10">
                  <div className="flex justify-between text-xs font-semibold text-art-text">
                    <span>🏍️ Envíos a Domicilio:</span>
                    <span className="text-art-accent">{orders.filter(o => o.status !== "Entregado" && o.orderType === "Entrega a Domicilio").length}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-art-text border-t border-art-border/60 pt-1.5">
                    <span>🏢 Retiros Locales:</span>
                    <span className="text-emerald-700">{orders.filter(o => o.status !== "Entregado" && o.orderType === "Retiro en Tienda").length}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePrintReports("entregas")}
                className="w-full bg-art-accent hover:bg-art-accent-hover text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Hoja de Entregas
              </button>
            </div>

            {/* Card 4: Preferences graph & month stats */}
            <div className="bg-white border border-art-border rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                      📊 Historial de Preferencias & Gráfico de Ventas
                    </h4>
                    <p className="text-xs text-art-muted">Gráfico de barras mensuales y ranking de sabores de autor preferidos.</p>
                  </div>
                </div>

                {/* Micro Bar Chart */}
                <div className="border border-art-border rounded-lg p-3 bg-art-panel/10">
                  <div className="flex items-end justify-between h-20 px-2 gap-4 border-b border-art-border pb-1">
                    {Object.entries(getMonthlySales()).map(([month, val]) => {
                      const maxVal = Math.max(...Object.values(getMonthlySales()), 1);
                      const heightPct = (val / maxVal) * 100;
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className="text-[8px] font-bold text-art-text mb-0.5">S/. {val.toFixed(0)}</span>
                          <div 
                            style={{ height: `${heightPct}%` }} 
                            className="w-full max-w-[20px] bg-art-accent rounded-t-xs"
                          />
                          <span className="text-[8px] font-bold text-art-muted mt-1">{month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePrintReports("stats")}
                className="w-full bg-art-accent hover:bg-art-accent-hover text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Hoja de Estadísticas
              </button>
            </div>

            {/* Card 5: Suppliers Directory (Others) */}
            <div className="bg-white border border-art-border rounded-lg p-5 flex flex-col justify-between space-y-4 md:col-span-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-art-text text-sm flex items-center gap-1.5">
                    📞 Directorio Oficial de Proveedores de Emergencia
                  </h4>
                  <p className="text-xs text-art-muted">Ficha administrativa conteniendo nombres de contactos, teléfonos y rubros de aprovisionamiento.</p>
                </div>
                <button
                  onClick={() => handlePrintReports("providers")}
                  className="bg-white hover:bg-art-panel border border-art-border text-art-text text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap self-start md:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir Directorio de Proveedores
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB F: COMPANY CONFIGURATION & POLICIES */}
      {activeTab === "company" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_company">
          {/* Header Action Bar */}
          <div className="bg-white border border-art-border p-6 rounded-lg shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-art-text flex items-center gap-2">
                <Settings className="w-5 h-5 text-art-accent" /> Configuración de Datos, Redes & Notas Legales
              </h3>
              <p className="text-xs text-art-muted leading-relaxed">
                Establece la identidad de tu repostería, números de contacto para pedidos, enlaces oficiales de redes, detalles de cuentas bancarias de depósito, avisos de alérgenos (Disclaimer) y condiciones contractuales de entrega.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm("¿Está seguro de que desea restaurar los datos iniciales predeterminados de la empresa?")) {
                  setCompanyConfig({
                    companyName: "Flikicookie Artisan Bakery",
                    phone: "+51 984 123 456",
                    address: "Av. El Sol 124, Plaza Regocijo, Cusco",
                    facebookUrl: "https://facebook.com/flikicookie.cusco",
                    instagramUrl: "https://instagram.com/flikicookie.cusco",
                    paymentMethods: "Aceptamos los siguientes métodos de pago:\n- Tarjeta de Crédito/Débito vía pasarela segura.\n- Transferencia directa al BCP (Cta: 305-9988223-0-12, CCI: 002-30500998822301211).\n- Pago móvil vía Yape o Plin al número de taller +51 984 123 456.\n- Binance Pay ID: 88223344 (enviar comprobante de USDT).\n- Efectivo o Tarjeta en físico al retirar en tienda.",
                    termsOfService: "Condiciones de Servicio de Taller:\n1. Plazo de Entrega: Todo pedido personalizado debe solicitarse con mínimo 24 horas de anticipación.\n2. Reservas: Pedidos mayores a S/. 200.00 requieren el pago adelantado del 50% para iniciar la preparación.\n3. Cancelaciones: Modificaciones o cancelaciones serán aceptadas únicamente hasta con 12 horas de anticipación, de lo contrario se cobrará el costo de los insumos preparados.\n4. Logística de Envíos: Los despachos a domicilio se realizan mediante nuestro transportista oficial de confianza en Cusco, sujeto a tarifas zonales y accesibilidad.",
                    disclaimer: "Aviso de Alérgenos & Deslinde de Responsabilidad:\nTodos nuestros productos se elaboran de manera artesanal en un taller que manipula gluten, lácteos, huevos, soya, maní y frutos secos. Si usted padece de alguna alergia alimentaria severa, es obligatorio que lo informe explícitamente en las notas del pedido o contactándonos al teléfono de taller. Los acabados, colores e iluminación 3D del configurador visual son simulaciones digitales artísticas aproximadas; el horneado real y decorado de glaseados presentan sutiles variaciones artesanales naturales."
                  });
                }
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Restaurar Predeterminados
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1: FORM EDITORS (7/12) */}
            <div className="lg:col-span-7 bg-white border border-art-border rounded-lg p-6 space-y-5">
              <h4 className="font-serif font-bold text-sm text-art-text pb-2 border-b border-art-border flex items-center gap-2">
                ✍️ Editor de Datos Generales
              </h4>

              <div className="space-y-4">
                {/* Company Name */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Nombre Oficial de Empresa</label>
                  <input
                    type="text"
                    value={companyConfig.companyName}
                    onChange={(e) => setCompanyConfig(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent font-medium"
                    placeholder="Ej. Flikicookie Cusco"
                  />
                </div>

                {/* Contact Phone & Address in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Teléfono de Taller / Pedidos</label>
                    <input
                      type="text"
                      value={companyConfig.phone}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent font-medium"
                      placeholder="Ej. +51 984..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">Dirección de Tienda Física</label>
                    <input
                      type="text"
                      value={companyConfig.address}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent font-medium"
                      placeholder="Ej. Calle del Medio..."
                    />
                  </div>
                </div>

                {/* Social Networks Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block flex items-center gap-1 text-social-fb">
                      📘 URL de Facebook
                    </label>
                    <input
                      type="text"
                      value={companyConfig.facebookUrl}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, facebookUrl: e.target.value }))}
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                      placeholder="https://facebook.com/pagina"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block flex items-center gap-1 text-social-ig">
                      📸 URL de Instagram
                    </label>
                    <input
                      type="text"
                      value={companyConfig.instagramUrl}
                      onChange={(e) => setCompanyConfig(prev => ({ ...prev, instagramUrl: e.target.value }))}
                      className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent"
                      placeholder="https://instagram.com/usuario"
                    />
                  </div>
                </div>

                {/* Payment Methods instructions */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">💳 Cuentas & Métodos de Pago (Sección Checkout)</label>
                    <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Mostrador Digital</span>
                  </div>
                  <textarea
                    rows={4}
                    value={companyConfig.paymentMethods}
                    onChange={(e) => setCompanyConfig(prev => ({ ...prev, paymentMethods: e.target.value }))}
                    className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent font-mono leading-relaxed"
                    placeholder="Instrucciones de depósito..."
                  />
                </div>

                {/* Disclaimer & Allergens info */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">⚠️ Advertencia de Alérgenos & Deslinde de Responsabilidad</label>
                    <span className="text-[9px] font-mono text-art-accent bg-art-accent-5 px-1.5 py-0.5 rounded border border-art-border">Legal</span>
                  </div>
                  <textarea
                    rows={4}
                    value={companyConfig.disclaimer}
                    onChange={(e) => setCompanyConfig(prev => ({ ...prev, disclaimer: e.target.value }))}
                    className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent leading-relaxed italic"
                    placeholder="Deslinde legal..."
                  />
                </div>

                {/* Terms of service */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-art-muted tracking-wider block">📋 Términos & Condiciones de Pedido (Horarios, Cancelaciones, Adelantos)</label>
                    <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">Políticas</span>
                  </div>
                  <textarea
                    rows={4}
                    value={companyConfig.termsOfService}
                    onChange={(e) => setCompanyConfig(prev => ({ ...prev, termsOfService: e.target.value }))}
                    className="w-full bg-art-panel/20 border border-art-border text-xs text-art-text p-2.5 rounded-lg focus:outline-none focus:border-art-accent leading-relaxed"
                    placeholder="Condiciones contractuales..."
                  />
                </div>

              </div>
            </div>

            {/* COLUMN 2: LIVE STORE INTERFACE SIMULATION PREVIEW (5/12) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Checkout Block simulator */}
              <div className="bg-white border border-art-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-art-border pb-2.5">
                  <h5 className="font-serif font-bold text-xs text-art-text uppercase tracking-wide flex items-center gap-1.5">
                    📱 Simulación: Módulo de Pago de Checkout
                  </h5>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Cliente Final</span>
                </div>
                
                <p className="text-[11px] text-art-muted italic">Así verá el cliente las instrucciones de pago al momento de confirmar su orden:</p>

                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3 shadow-xs">
                  <div className="space-y-1 text-left">
                    <label className="font-bold text-slate-500 uppercase text-[9px] block">💳 Método de Pago Elegido</label>
                      <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>🏦 Transferencia Bancaria Directa</span>
                      <span className="text-art-accent">▼</span>
                    </div>
                  </div>

                  {/* Payments preview */}
                  <div className="bg-art-accent-10 border border-art-accent-5 p-3 rounded-xl space-y-1 text-left">
                    <span className="text-[9px] font-bold text-art-accent-dark uppercase tracking-wide block">🏦 Instrucciones de Depósito / Pago:</span>
                    <p className="text-[9px] text-slate-600 whitespace-pre-line leading-relaxed font-mono">
                      {companyConfig.paymentMethods || "(Por favor, ingrese detalles de pago...)"}
                    </p>
                  </div>

                  {/* Disclaimers preview */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-left">
                    <div className="bg-slate-100/50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">⚠️ Nota Legal y Alérgenos:</span>
                      <p className="text-[8px] text-slate-500 leading-relaxed italic line-clamp-3">
                        {companyConfig.disclaimer || "(Sin nota legal ingresada...)"}
                      </p>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        disabled
                        className="mt-0.5 rounded text-art-accent h-3 w-3" 
                      />
                      <span className="text-[9px] text-slate-600 font-medium leading-tight">
                        Acepto las <strong className="text-art-accent underline">Condiciones de Servicio</strong> de {companyConfig.companyName}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer Block simulator */}
              <div className="bg-white border border-art-border rounded-lg p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-art-border pb-2.5">
                  <h5 className="font-serif font-bold text-xs text-art-text uppercase tracking-wide flex items-center gap-1.5">
                    🌐 Simulación: Pie de Página (Footer)
                  </h5>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Cliente Final</span>
                </div>
                
                <p className="text-[11px] text-art-muted italic">Así se renderiza el footer interactivo en la tienda con los datos y redes:</p>

                <div className="bg-art-card border border-art-line/60 p-4 rounded-xl text-center text-[9px] text-art-soft space-y-3 shadow-xs">
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-bold text-art-brown">
                    <span>📍 {companyConfig.address || "(Falta dirección)"}</span>
                    <span>📞 Telf: {companyConfig.phone || "(Falta teléfono)"}</span>
                    {companyConfig.facebookUrl && <span className="text-social-fb underline">📘 Facebook</span>}
                    {companyConfig.instagramUrl && <span className="text-social-ig underline">📸 Instagram</span>}
                  </div>

                  <div className="text-[8px] text-art-soft/90 space-y-1.5 border-t border-art-line/30 pt-2 max-w-xs mx-auto text-left leading-relaxed">
                    <span className="font-bold text-art-brown uppercase tracking-wide block text-center">Términos contractuales y deslinde:</span>
                    <p className="italic bg-white/40 p-1.5 rounded text-[8px]">{companyConfig.disclaimer || "(Sin aviso de deslinde...)"}</p>
                    <p className="whitespace-pre-line bg-white/60 p-1.5 rounded text-[8px]">{companyConfig.termsOfService || "(Sin términos cargados...)"}</p>
                  </div>

                  <div className="border-t border-art-line/10 pt-2 text-[8px] text-slate-400">
                    <p>© 2026 {companyConfig.companyName || "Pastelería"}. Todos los derechos reservados.</p>
                  </div>
                </div>
              </div>

              {/* ADMIN PASSWORD CHANGE CARD */}
              <div className="bg-white border border-art-border rounded-lg p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-art-border pb-2.5">
                  <h5 className="font-serif font-bold text-xs text-art-text uppercase tracking-wide flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-art-accent" /> Cambiar Clave de Acceso Administrador
                  </h5>
                  <span className="bg-art-accent-5 text-art-accent-dark text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Seguridad</span>
                </div>

                <p className="text-[11px] text-art-muted leading-relaxed">
                  Modifica la contraseña de acceso al Panel de Maestros (por defecto: <code className="bg-art-panel px-1 py-0.5 rounded font-bold font-mono">admin123</code>).
                </p>

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted block">Contraseña Actual *</label>
                    <input
                      type="password"
                      value={currentPassInput}
                      onChange={(e) => setCurrentPassInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted block">Nueva Contraseña *</label>
                    <input
                      type="password"
                      value={newPassInput}
                      onChange={(e) => setNewPassInput(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-art-muted block">Confirmar Nueva Contraseña *</label>
                    <input
                      type="password"
                      value={confirmPassInput}
                      onChange={(e) => setConfirmPassInput(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="w-full bg-art-panel border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                      required
                    />
                  </div>

                  {passChangeError && (
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {passChangeError}
                    </p>
                  )}

                  {passChangeSuccess && (
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 p-2 rounded border border-emerald-200">
                      <Check className="w-3.5 h-3.5 shrink-0" /> {passChangeSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-art-accent hover:bg-art-accent-hover text-white font-bold text-xs py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" /> Guardar Nueva Contraseña
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* DETAIL MODAL (Retained from base orders pipeline) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in" id="order_detail_modal">
          <div className="bg-white border border-art-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-xl relative">
            
            <div className="flex justify-between items-start border-b border-art-border pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-art-accent bg-art-accent/10 px-2.5 py-1 rounded">
                  {selectedOrder.id}
                </span>
                <h4 className="font-serif font-bold text-art-text text-lg mt-2">
                  Detalles de Pedido: {selectedOrder.customerName}
                </h4>
                <p className="text-xs text-art-muted">Ingresado el {new Date(selectedOrder.createdAt).toLocaleString("es-CL")}</p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-art-text hover:bg-art-panel text-xs font-bold uppercase cursor-pointer px-3 py-1.5 border border-art-border rounded-lg transition-colors"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Client & Logistics */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-art-muted uppercase tracking-wider">Contacto del Cliente</h5>
                  <div className="bg-art-panel border border-art-border p-3 rounded-lg text-xs space-y-1 text-art-text">
                    <p>📞 <strong>Teléfono:</strong> {selectedOrder.customerPhone}</p>
                    <p>✉️ <strong>Email:</strong> {selectedOrder.customerEmail}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-art-muted uppercase tracking-wider">Logística de Entrega</h5>
                  <div className="bg-art-panel border border-art-border p-3 rounded-lg text-xs space-y-1.5 text-art-text">
                    <p>📍 <strong>Modalidad:</strong> {selectedOrder.orderType}</p>
                    <p>📅 <strong>Fecha:</strong> {selectedOrder.deliveryDate}</p>
                    <p>⏰ <strong>Hora Pactada:</strong> {selectedOrder.deliveryTime} hrs</p>
                    {selectedOrder.deliveryAddress && (
                      <p>🏠 <strong>Dirección:</strong> {selectedOrder.deliveryAddress}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-art-muted uppercase tracking-wider">Pago</h5>
                  <div className="bg-art-panel border border-art-border p-3 rounded-lg text-xs space-y-1 text-art-text">
                    <p>💰 <strong>Método:</strong> {selectedOrder.paymentMethod}</p>
                    <p>📊 <strong>Total del Pedido:</strong> {formatPrice(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Ordered Items Details */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-art-muted uppercase tracking-wider">Productos Comprados</h5>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="border border-art-border p-3 rounded-lg bg-art-panel/40 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-serif font-bold text-art-text">{item.name}</span>
                        <span className="font-mono bg-art-panel border border-art-border text-art-text px-1.5 py-0.2 rounded font-bold">
                          x{item.quantity}
                        </span>
                      </div>

                      {item.isCustom && item.customSpec && (
                        <div className="bg-white border border-art-border p-2.5 rounded-lg space-y-1 text-[11px] text-art-muted">
                          <p>🍰 <strong>Pisos:</strong> {item.customSpec.tiers} piso(s)</p>
                          <p>🍞 <strong>Bizcocho:</strong> {item.customSpec.flavor}</p>
                          <p>🍯 <strong>Relleno:</strong> {item.customSpec.filling}</p>
                          <p>🎨 <strong>Cobertura:</strong> {item.customSpec.frostingName}</p>
                          <p>🍇 <strong>Toppings:</strong> {item.customSpec.toppings.join(", ")}</p>
                          <p className="italic text-red-600 font-bold mt-1">
                            ✍️ Dedicatoria: "{item.customSpec.inscription || "Sin dedicatoria"}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-art-border pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-art-muted font-bold uppercase mr-1">Ajustar Estado:</span>
                <div className="flex flex-wrap gap-1">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(selectedOrder.id, st)}
                      className={`text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer font-bold border transition-all ${
                        selectedOrder.status === st
                          ? "bg-art-accent border-art-accent text-white shadow-xs"
                          : "bg-art-panel hover:bg-white text-art-text border-art-border"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="bg-art-card hover:bg-art-card/80 border border-art-line text-art-brown font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-xs flex items-center gap-1.5 w-full md:w-auto justify-center cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-art-accent" /> Imprimir Factura
                </button>
                <button
                  onClick={() => setShowWhatsAppTemplate(selectedOrder.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-xs flex items-center gap-1.5 w-full md:w-auto justify-center cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Alerta WhatsApp
                </button>
              </div>
            </div>

            {showWhatsAppTemplate === selectedOrder.id && (
              <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-lg space-y-2 animate-fade-in text-xs text-emerald-900">
                <h5 className="font-bold text-emerald-800 flex items-center gap-1">
                  📱 Plantilla de Alerta Automática WhatsApp (Simulación)
                </h5>
                <pre className="bg-white border border-emerald-100 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed select-text text-slate-800 text-[11px]">
                  {getWhatsAppTemplateText(selectedOrder)}
                </pre>
                <div className="flex justify-between items-center pt-1 text-[10px] text-emerald-700 font-medium">
                  <span>Sincronizado vía webhook de estado</span>
                  <button
                    onClick={() => setShowWhatsAppTemplate(null)}
                    className="text-red-600 hover:underline font-bold"
                  >
                    Ocultar vista
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ASESOR DE NEGOCIOS IA */}
      {activeTab === "advisor" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_advisor">
          {/* Header */}
          <div className="gradient-art border-art-border p-6 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-art-accent-10" /> Asesor de Negocios IA
              </h3>
              <p className="text-xs text-art-accent-10 leading-relaxed">
                Analista inteligente que revisa métricas, inventario, flujo de caja y clientes para generar informes estratégicos con recomendaciones accionables.
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className={`text-xs font-bold px-5 py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md select-none shrink-0 ${
                isGeneratingReport
                  ? "bg-art-accent-10 text-art-accent-dark cursor-wait"
                  : "bg-art-accent-10 hover:bg-art-accent-5 text-art-deep"
              }`}
            >
              {isGeneratingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analizando datos...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generar Informe Estratégico
                </>
              )}
            </button>
          </div>

          {/* Report Display */}
          {advisorReport && (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-white border border-art-border rounded-lg p-6 shadow-xs">
                <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-2 border-b border-art-border pb-3 mb-4">
                  <FileText className="w-4 h-4 text-art-accent" /> Resumen Ejecutivo
                </h4>
                <p className="text-xs text-art-text leading-relaxed whitespace-pre-line">{advisorReport.executive_summary}</p>
                <div className="mt-3 text-[9px] text-art-muted">
                  Generado: {new Date(advisorReport.generatedAt).toLocaleString('es-PE')} | Periodo: {advisorReport.period}
                </div>
              </div>

              {/* Analysis Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advisorReport.sections.map((section, idx) => (
                  <div key={idx} className="bg-white border border-art-border rounded-lg p-5 shadow-xs space-y-3">
                    <h5 className="font-serif font-bold text-xs text-art-text flex items-center gap-2 border-b border-art-border pb-2">
                      <span className="text-base">{section.icon}</span> {section.title}
                    </h5>
                    <p className="text-[11px] text-art-muted leading-relaxed">{section.content}</p>
                    
                    {section.metrics && (
                      <div className="grid grid-cols-2 gap-2">
                        {section.metrics.map((metric, mIdx) => (
                          <div key={mIdx} className="bg-art-panel/30 rounded-lg p-2.5 space-y-0.5">
                            <span className="text-[9px] text-art-muted uppercase tracking-wider block">{metric.label}</span>
                            <span className={`text-sm font-bold ${
                              metric.trend === 'up' ? 'text-emerald-600' : 
                              metric.trend === 'down' ? 'text-rose-600' : 'text-art-text'
                            }`}>{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.recommendations && section.recommendations.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-art-border/50">
                        {section.recommendations.map((rec, rIdx) => (
                          <p key={rIdx} className="text-[10px] text-art-text leading-relaxed">{rec}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Risk Alerts */}
              {advisorReport.risk_alerts.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 space-y-2">
                  <h5 className="font-serif font-bold text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Alertas y Riesgos
                  </h5>
                  {advisorReport.risk_alerts.map((alert, idx) => (
                    <p key={idx} className="text-[11px] text-rose-700 leading-relaxed">{alert}</p>
                  ))}
                </div>
              )}

              {/* Opportunities */}
              {advisorReport.opportunities.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 space-y-2">
                  <h5 className="font-serif font-bold text-xs text-emerald-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Oportunidades Identificadas
                  </h5>
                  {advisorReport.opportunities.map((opp, idx) => (
                    <p key={idx} className="text-[11px] text-emerald-700 leading-relaxed">{opp}</p>
                  ))}
                </div>
              )}

              {/* Action Plan */}
              <div className="bg-art-accent-5 border border-art-border rounded-lg p-5 space-y-2">
                <h5 className="font-serif font-bold text-xs text-art-accent-dark flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-art-accent" /> Plan de Acción Recomendado
                </h5>
                {advisorReport.action_plan.map((action, idx) => (
                  <p key={idx} className="text-[11px] text-art-accent-dark leading-relaxed">{action}</p>
                ))}
              </div>
            </div>
          )}

          {/* Chat Consultant */}
          <div className="bg-white border border-art-border rounded-lg shadow-xs overflow-hidden">
            <div className="bg-art-panel border-b border-art-border p-4">
              <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-art-accent" /> Consultor IA — Haz tu pregunta
              </h4>
              <p className="text-[10px] text-art-muted mt-1">Pregunta sobre flujo de caja, inventario, clientes, proveedores, precios o estrategia.</p>
            </div>
            
            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-art-card/30">
              {advisorChatMessages.length === 0 && (
                <div className="text-center py-8">
                  <BrainCircuit className="w-10 h-10 text-art-accent/30 mx-auto mb-3" />
                  <p className="text-xs text-art-muted">Genera un informe o escribe una pregunta para comenzar la consultoría.</p>
                </div>
              )}
              {advisorChatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-[11px] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-art-accent text-white' 
                      : 'bg-white border border-art-border text-art-text shadow-xs'
                  }`}>
                    {msg.role === 'advisor' && <span className="text-[9px] text-art-accent font-bold block mb-1">ASESOR IA</span>}
                    <span className="whitespace-pre-line">{msg.text}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-art-border p-3 bg-white flex gap-2">
              <input
                type="text"
                value={advisorChatInput}
                onChange={(e) => setAdvisorChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisorMessage()}
                placeholder="Ej: ¿Cómo está mi flujo de caja este mes?"
                className="flex-1 bg-art-panel/30 border border-art-border rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
              />
              <button
                onClick={handleSendAdvisorMessage}
                className="bg-art-accent hover:bg-art-accent-hover text-white p-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: WHATSAPP BUSINESS */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6 animate-fade-in" id="admin_tab_whatsapp">
          {/* Header */}
          <div className="bg-gradient-to-r from-wa-darkest to-wa-deep border border-wa p-6 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-wa" /> WhatsApp Business
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Gestiona conversaciones con clientes, envía respuestas rápidas y notificaciones de pedidos.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-xs">
                <span className="font-bold">{whatsappConversations.length}</span> conversaciones
              </div>
              <div className="bg-wa rounded-lg px-4 py-2 text-white text-xs font-bold">
                {whatsappConversations.filter(c => c.unreadCount > 0).length} sin leer
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-art-accent-5 border border-art-border rounded-lg p-5 space-y-3">
              <h5 className="font-serif font-bold text-xs text-art-accent-dark flex items-center gap-2">
                ⚠️ Configuración Requerida
              </h5>
              <p className="text-[11px] text-art-accent-dark leading-relaxed">
                Para conectar WhatsApp Business API, necesitas configurar las siguientes variables en tu archivo <code className="bg-art-accent-10 px-1 rounded">.env</code>:
              </p>
              <div className="bg-art-accent-10/100 rounded-lg p-3 font-mono text-[10px] text-art-accent-dark space-y-1">
                <p>WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id</p>
                <p>WHATSAPP_ACCESS_TOKEN=tu_access_token</p>
                <p>WHATSAPP_VERIFY_TOKEN=tu_token_de_verificacion</p>
              </div>
              <p className="text-[10px] text-art-accent">
                Sigue la guía de <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" className="underline">Meta for Developers</a> para obtener estas credenciales.
              </p>
            </div>

          {/* Quick Responses Configuration */}
          <div className="bg-white border border-art-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-art-border pb-3">
              <h5 className="font-serif font-bold text-xs text-art-text flex items-center gap-2">
                ⚡ Respuestas Rápidas Configurables
              </h5>
              <button
                onClick={() => setShowQuickResponseForm(!showQuickResponseForm)}
                className="bg-art-accent hover:bg-art-accent-hover text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                {showQuickResponseForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {showQuickResponseForm ? "Cancelar" : "Nueva"}
              </button>
            </div>

            {showQuickResponseForm && (
              <div className="bg-art-panel/30 border border-art-border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-art-muted">Etiqueta (botón)</label>
                    <input
                      type="text"
                      value={newQuickResponse.label}
                      onChange={(e) => setNewQuickResponse({ ...newQuickResponse, label: e.target.value })}
                      placeholder="Ej: Menú, Pago..."
                      className="w-full bg-white border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-art-muted">Categoría</label>
                    <select
                      value={newQuickResponse.category}
                      onChange={(e) => setNewQuickResponse({ ...newQuickResponse, category: e.target.value })}
                      className="w-full bg-white border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent"
                    >
                      <option value="general">General</option>
                      <option value="pedido">Pedido</option>
                      <option value="pago">Pago</option>
                      <option value="producto">Producto</option>
                      <option value="soporte">Soporte</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <label className="text-[9px] uppercase font-bold text-art-muted">Acción</label>
                    <button
                      onClick={handleAddQuickResponse}
                      className="w-full bg-wa hover:bg-wa-deep text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-art-muted">Mensaje de respuesta</label>
                  <textarea
                    rows={3}
                    value={newQuickResponse.text}
                    onChange={(e) => setNewQuickResponse({ ...newQuickResponse, text: e.target.value })}
                    placeholder="Escribe la respuesta que se enviará al cliente..."
                    className="w-full bg-white border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-art-accent resize-y"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {quickResponses.map(qr => (
                <div key={qr.id} className="bg-art-panel/20 border border-art-border rounded-lg p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[11px] text-art-text">{qr.label}</span>
                      <span className="text-[8px] bg-art-border/50 text-art-muted px-1.5 py-0.5 rounded-full">{qr.category}</span>
                    </div>
                    <p className="text-[9px] text-art-muted mt-1 line-clamp-2">{qr.text.substring(0, 80)}...</p>
                  </div>
                  <button
                    onClick={() => handleDeleteQuickResponse(qr.id)}
                    className="text-rose-400 hover:text-rose-600 shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Panel */}
          <WhatsAppPanel
            conversations={whatsappConversations}
            onSendMessage={handleSendWhatsAppMessage}
            onMarkAsRead={handleMarkWhatsAppAsRead}
            onUpdateConversationStatus={handleUpdateWhatsAppStatus}
            clients={clients.map(c => ({ id: c.id, name: c.name, phone: c.phone }))}
          />
        </div>
      )}

      {/* Communications Agent Tab */}
      {activeTab === "communications" && (
        <div className="space-y-6 animate-fade-in">
          <div className="gradient-art panel-soft border-art-border p-6 rounded-lg shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                <Headphones className="w-5 h-5 text-art-text" /> Agente de Comunicaciones
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                Gestiona todas las interacciones con clientes: emails, llamadas, redes sociales y chat en un solo lugar.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-xs">
                <span className="font-bold">{communications.length}</span> mensajes
              </div>
            </div>
          </div>

          <CommunicationAgent
            messages={communications.map(c => ({
              id: c.id,
              channel: c.channel as "whatsapp" | "email" | "sms" | "instagram",
              from: c.from,
              to: c.to,
              content: c.content,
              timestamp: c.timestamp,
              status: c.status as "sent" | "delivered" | "read" | "failed",
              type: c.type
            }))}
            autoResponses={autoResponses}
            onAddAutoResponse={(response) => {
              const newResponse = { ...response, id: `ar-${Date.now()}` };
              setAutoResponses([...autoResponses, newResponse]);
            }}
            onToggleAutoResponse={(id) => {
              setAutoResponses(autoResponses.map(ar => 
                ar.id === id ? { ...ar, active: !ar.active } : ar
              ));
            }}
            onDeleteAutoResponse={(id) => {
              setAutoResponses(autoResponses.filter(ar => ar.id !== id));
            }}
            onSendMessage={(to, content, channel) => {
              const newComm = {
                id: `comm-${Date.now()}`,
                channel,
                from: "admin@flikicookie.com",
                to,
                content,
                timestamp: new Date().toISOString(),
                status: "sent",
                type: "outbound" as const
              };
              setCommunications([...communications, newComm]);
            }}
          />
        </div>
      )}

      {/* WhatsApp Floating Widget - Solo en Admin */}
      <a
        href="https://wa.me/51970442173?text=Hola!%20Vengo%20del%20panel%20de%20administración"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-wa hover:bg-wa-dark text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50"
        title="Abrir WhatsApp Business"
      >
        <MessageSquare className="w-8 h-8" />
      </a>
    </div>
  );
}

function getStatusColorIndicator(status: OrderStatus) {
  switch (status) {
    case "Pendiente": return "bg-rose-500";
    case "En Preparación": return "bg-purple-500";
    case "En Horno": return "bg-art-accent animate-pulse";
    case "Decorando": return "bg-pink-500 animate-pulse";
    case "Listo": return "bg-blue-500";
    case "Entregado": return "bg-emerald-500";
    default: return "bg-slate-400";
  }
}
