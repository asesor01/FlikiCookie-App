export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string; // Tailwind styled/visual icon name or simulated image URL
  prepTime: string;
  allergens?: string[];
  wholesalePrice?: number;         // Precio por mayor
  wholesaleMinQty?: number;        // Cantidad mÃ­nima para precio por mayor
  seasonalTag?: string;            // Etiqueta de temporada (Navidad, DÃ­a del Padre, GraduaciÃ³n, etc.)
  promoPrice?: number;             // Precio de oferta de temporada
  stock?: number;                  // Stock disponible de producto terminado (e.g. galletas listas)
  criticalStock?: number;          // Umbral de stock crÃ­tico
videoUrl?: string;
imgPosition?: string;    // Encuadre de la foto: center/top/bottom/left/right         // URL de video del producto (public/videos/...)
longDescription?: string;  // Descripcion ampliada para la ficha
}

export interface CustomCakeSpec {
  tiers: 1 | 2 | 3;
  flavor: "Vainilla" | "Chocolate" | "Red Velvet" | "Zanahoria" | "LimÃ³n";
  filling: "Dulce de Leche" | "Mermelada de Fresa" | "Crema de Queso" | "Nutella" | "Ganache de Chocolate";
  frostingColor: string; // Hex color or descriptive color (e.g., "#FFB6C1" for Rose, "#FFF" for White, etc.)
  frostingName: string; // Spanish name for display (Rosado Pastel, Blanco Cremoso, etc.)
  toppings: string[]; // ['Chispas de colores', 'Fresas frescas', 'Macarons', 'Flores de azÃºcar', 'Virutas de chocolate']
  inscription: string; // Text to write on the cake
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isCustom: boolean;
  customSpec?: CustomCakeSpec;
}

export type OrderStatus =
  | "Pendiente"
  | "En PreparaciÃ³n"
  | "En Horno"
  | "Decorando"
  | "Listo"
  | "Entregado";

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: "Entrega a Domicilio" | "Retiro en Tienda";
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: "Efectivo" | "Tarjeta" | "Transferencia" | "Binance";
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  totalSpent: number;
  ordersCount: number;
}

export interface Provider {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string;
  suppliedItems: string[];
}

export interface KitchenAnalysis {
  schedule: string[];
  shoppingList: string[];
  decoratingAdvice: string[];
  warnings: string[];
}

export interface CompanyConfig {
  companyName: string;
  phone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  paymentMethods: string;
  termsOfService: string;
  disclaimer: string;
}

export interface PurchaseOrderItem {
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  providerId: string;
  providerName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: "Borrador" | "Enviado a Proveedor" | "En TrÃ¡nsito" | "Recibido / AlmacÃ©n" | "Cancelado";
  paymentStatus: "Pendiente" | "Pagado Parcial" | "Pagado Total";
  createdAt: string;
  expectedDeliveryDate?: string;
  notes?: string;
}

export interface ClientNote {
  id: string;
  clientId?: string;
  orderId?: string;
  customerName: string;
  customerPhone?: string;
  note: string;
  channel: "WhatsApp" | "Llamada" | "Presencial" | "Instagram / FB" | "Otro";
  createdAt: string;
  createdBy: string;
}

// ============================================
// FLUJO DE CAJA
// ============================================
export type CashFlowType = "ingreso" | "egreso";

export type IncomeCategory = 
  | "Ventas Directas" 
  | "Pedidos Online" 
  | "Delivery" 
  | "Otros Ingresos";

export type ExpenseCategory = 
  | "Materia Prima" 
  | "Mano de Obra Fija" 
  | "Mano de Obra Temporal" 
  | "Servicios (Luz, Agua, Internet)" 
  | "Alquiler" 
  | "Equipos" 
  | "Delivery" 
  | "Marketing" 
  | "Impuestos" 
  | "Empaques" 
  | "Transporte" 
  | "Otros Egresos";

export interface CashFlowTransaction {
  id: string;
  date: string;
  type: CashFlowType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  description: string;
  reference?: string;
  paymentMethod?: "Efectivo" | "Yape" | "Transferencia" | "Otro";
}

// ============================================
// INVENTARIOS
// ============================================
export interface InventoryItem {
  id: string;
  name: string;
  category: "Materia Prima" | "Empaque" | "Equipo" | "Herramienta" | "Suministro";
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unitCost: number;
  supplier?: string;
  lastPurchaseDate?: string;
  location?: string;
}

// ============================================
// EQUIPOS Y DEPRECIACIÃ“N
// ============================================
export interface Equipment {
  id: string;
  name: string;
  category: "Horno" | "Batidora" | "RefrigeraciÃ³n" | "Envasadora" | "Utensilio" | "Otro";
  purchaseDate: string;
  purchasePrice: number;
  usefulLifeYears: number;
  residualValue: number;
  condition: "Nuevo" | "Bueno" | "Regular" | "Malo" | "Fuera de Servicio";
  location: string;
  nextMaintenanceDate?: string;
  notes?: string;
}

// ============================================
// FACTURACIÃ“N E IMPUESTOS
// ============================================
export type InvoiceType = "Boleta" | "Factura" | "Nota de Venta";

export type TaxType = 
  | "Exonerado" 
  | "Inafecto" 
  | "Gravado - Tasa General" 
  | "Gravado - Tasa Reducida" 
  | "Gravado - Tasa Cero";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  date: string;
  clientName: string;
  clientDocument?: string;
  clientDocumentType?: "DNI" | "RUC" | "CE" | "Pasaporte";
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  status: "Pendiente" | "Pagada" | "Anulada";
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxType: TaxType;
  amount: number;
}

// ============================================
// MANO DE OBRA
// ============================================
export interface LaborRecord {
  id: string;
  employeeName: string;
  type: "Fijo" | "Temporal";
  position: string;
  hourlyRate: number;
  hoursWorked: number;
  date: string;
  overtime?: number;
  bonus?: number;
  deductions?: number;
  netPay: number;
}

