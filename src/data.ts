import { MenuItem, CustomCakeSpec, Order } from "./types";

export const INITIAL_MENU: MenuItem[] = [
  {
    id: "m1",
    name: "ChocoManjar",
    description: "Galleta de Chocolate Rellena de Manjar y Grageas de Colores / QFS",
    price: 10.00,
    category: "rellenas",
    image: "/src/assets/images/cookies/chocomanjar.jpg",
    prepTime: "20 min",
    allergens: ["Gluten", "Lácteos", "Huevo"],
    wholesalePrice: 8.50,
    wholesaleMinQty: 12
  },
  {
    id: "m2",
    name: "MockaChino (Especial Día del Padre)",
    description: "Galleta de Café Rellena de Ganache de Chocolate Semi Amargo y Glaseado de Capuccino",
    price: 12.00,
    category: "especiales",
    image: "/src/assets/images/cookies/mockachino.jpg",
    prepTime: "25 min",
    allergens: ["Gluten", "Lácteos", "Café"],
    seasonalTag: "Día del Padre",
    promoPrice: 10.00,
    wholesalePrice: 9.00,
    wholesaleMinQty: 6
  },
  {
    id: "m3",
    name: "S´more",
    description: "Galleta de Vainilla y Chispas de Chocolate Rellena de Trozos de Galleta Graham, Mashmellow Fundido y Ganache de Chocolate",
    price: 12.00,
    category: "especiales",
    image: "/src/assets/images/cookies/smore.jpg",
    prepTime: "25 min",
    allergens: ["Gluten", "Lácteos"]
  },
  {
    id: "m4",
    name: "Bombón",
    description: "Galleta de Vainilla Chocolate con Chispas de Chocolate y Relleno de Fudge de Chocolate Semi Amargo",
    price: 11.00,
    category: "rellenas",
    image: "/src/assets/images/cookies/bombon.jpg",
    prepTime: "20 min",
    allergens: ["Gluten", "Lácteos"]
  },
  {
    id: "m5",
    name: "Confetti",
    description: "Galleta de Vainilla con Chispas de Chocolate de Leche, Rellena de Dulce de Leche y cubierta con Grageas de Colores",
    price: 10.00,
    category: "rellenas",
    image: "/src/assets/images/cookies/confetti.jpg",
    prepTime: "20 min",
    allergens: ["Gluten", "Lácteos"]
  },
  {
    id: "m6",
    name: "Cookie Monster",
    description: "Galleta Blue Velvet Rellena de Crema de Choco Avellana",
    price: 12.00,
    category: "rellenas",
    image: "/src/assets/images/cookies/cookie_monster.jpg",
    prepTime: "20 min",
    allergens: ["Gluten", "Lácteos", "Frutos secos"]
  },
  {
    id: "m7",
    name: "Helado de Fresa",
    description: "Galleta de Vainilla rellena de Crema de Fresa y glaseado helado de fresa",
    price: 11.00,
    category: "rellenas",
    image: "/src/assets/images/cookies/helado_fresa.jpg",
    prepTime: "20 min",
    allergens: ["Gluten", "Lácteos"]
  },
  {
    id: "m8",
    name: "Churro de Banana",
    description: "Galleta de Banana con Trozos de Nuez y Glaseado de Chocolate y Azúcar",
    price: 12.00,
    category: "especiales",
    image: "/src/assets/images/cookies/churro_banana.jpg",
    prepTime: "25 min",
    allergens: ["Gluten", "Frutos secos"]
  },
  {
    id: "m9",
    name: "Pay de Manzana",
    description: "Galleta de Canela Rellena de Manzana Caramelizada y cubierta con crocante de Azúcar, Canela y Nuez",
    price: 12.00,
    category: "especiales",
    image: "/src/assets/images/cookies/pay_manzana.jpg",
    prepTime: "30 min",
    allergens: ["Gluten", "Frutos secos"]
  },
  {
    id: "m10",
    name: "Mantequilla de Maní",
    description: "Masa de Mani Rellena de dulce de Mantequilla de Maní y Glaseado Chocolate con trozos de Maní",
    price: 11.00,
    category: "rellenas",
    image: "/src/assets/images/cookies/mantequilla_mani.jpg",
    prepTime: "25 min",
    allergens: ["Gluten", "Maní", "Lácteos"]
  },
  {
    id: "m11",
    name: "Cheesecake de Limón",
    description: "Galleta de Limón Rellenas de Cheesecake de Queso Crema",
    price: 11.00,
    category: "rellenas",
    image: "/src/assets/images/cookies/cheesecake_limon.jpg",
    prepTime: "25 min",
    allergens: ["Gluten", "Lácteos"]
  },
  {
    id: "m12",
    name: "ChocoChip",
    description: "Galleta de Almendras con Chispas de Chocolate, Rellena de Fudge de Chocolate Artesanal",
    price: 9.50,
    category: "clasicas",
    image: "/src/assets/images/cookies/chocochip.jpg",
    prepTime: "20 min",
    allergens: ["Gluten", "Frutos secos", "Lácteos"]
  },
  {
    id: "m13",
    name: "Red Velvet (Edición Navideña)",
    description: "Galleta Rellena de Queso Crema suave con chispas de chocolate blanco y destellos de azúcar navideña.",
    price: 9.50,
    category: "clasicas",
    image: "/src/assets/images/cookies/red_velvet.jpg",
    prepTime: "20 min",
    allergens: ["Gluten", "Lácteos"],
    seasonalTag: "Navidad",
    promoPrice: 8.00,
    wholesalePrice: 7.00,
    wholesaleMinQty: 12
  },
  {
    id: "m15",
    name: "Box Graduación Premium",
    description: "Caja de 12 galletas surtidas con decoración personalizada y mensaje de felicitación de graduado/a.",
    price: 85.00,
    category: "especiales",
    image: "/src/assets/images/cookies/cookies_cream.jpg",
    prepTime: "45 min",
    allergens: ["Gluten", "Lácteos", "Frutos secos"],
    seasonalTag: "Graduaciones",
    promoPrice: 72.00,
    wholesalePrice: 65.00,
    wholesaleMinQty: 5
  },
  {
    id: "m14",
    name: "Cookies&Cream",
    description: "Galleta de Vainilla Glaseada de Chocolate Blanco y Semi Amargo y Trozos de Oreo, Relleno de Ganache de chocolate Blanco y Trozos de Galleta Oreo",
    price: 11.50,
    category: "rellenas",
    image: "/src/assets/images/cookies/cookies_cream.jpg",
    prepTime: "25 min",
    allergens: ["Gluten", "Lácteos"]
  },
  {
    id: "m15",
    name: "Café Latte Especial",
    description: "Doble espresso premium con leche emulsionada y un toque aromático de jarabe de galleta horneada.",
    price: 7.50,
    category: "bebidas",
    image: "latte",
    prepTime: "5 min",
    allergens: ["Lácteos"]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "PED-1021",
    customerName: "Camila Soto",
    customerPhone: "+51 970 442 173",
    customerEmail: "camila.soto@email.com",
    orderType: "Entrega a Domicilio",
    deliveryDate: "2026-07-22",
    deliveryTime: "15:00",
    deliveryAddress: "Av. Sol 450, Cusco",
    items: [
      {
        id: "m1",
        name: "ChocoManjar",
        price: 10.00,
        quantity: 3,
        isCustom: false
      },
      {
        id: "m14",
        name: "Cookies&Cream",
        price: 11.50,
        quantity: 2,
        isCustom: false
      }
    ],
    totalAmount: 53.00,
    status: "Listo",
    createdAt: "2026-07-21T08:30:00Z",
    paymentMethod: "Tarjeta"
  },
  {
    id: "PED-1022",
    customerName: "Sebastián Reyes",
    customerPhone: "+51 912 345 678",
    customerEmail: "sreyes@email.com",
    orderType: "Retiro en Tienda",
    deliveryDate: "2026-07-22",
    deliveryTime: "10:30",
    items: [
      {
        id: "cust-1",
        name: "Giga-Galleta de Cumpleaños - Personalizada",
        price: 45.00,
        quantity: 1,
        isCustom: true,
        customSpec: {
          tiers: 1,
          flavor: "Red Velvet",
          filling: "Crema de Queso",
          frostingColor: "#FFF8DC",
          frostingName: "Champaña Cremoso",
          toppings: ["Flores de azúcar", "Macarons"],
          inscription: "Felipe & Sol - Cusco"
        }
      }
    ],
    totalAmount: 45.00,
    status: "En Preparación",
    createdAt: "2026-07-20T17:15:00Z",
    paymentMethod: "Transferencia"
  },
  {
    id: "PED-1023",
    customerName: "María José Prieto",
    customerPhone: "+51 955 544 333",
    customerEmail: "mariajose@email.com",
    orderType: "Entrega a Domicilio",
    deliveryDate: "2026-07-23",
    deliveryTime: "18:00",
    deliveryAddress: "Urb. Larapa G-12, Cusco",
    items: [
      {
        id: "m6",
        name: "Cookie Monster",
        price: 12.00,
        quantity: 6,
        isCustom: false
      }
    ],
    totalAmount: 72.00,
    status: "Pendiente",
    createdAt: "2026-07-21T09:45:00Z",
    paymentMethod: "Tarjeta"
  }
];

// Helper info for the Cake Customizer
export const CAKE_FLAVORS = [
  { value: "Vainilla", label: "Vainilla Francesa", desc: "Suave sabor con extracto de vaina de vainilla natural de Madagascar.", color: "#FDF5E6", priceModifier: 0 },
  { value: "Chocolate", label: "Chocolate Belga 55%", desc: "Cacao intenso con un toque de café espresso para realzar el dulzor.", color: "#4A2711", priceModifier: 2.00 },
  { value: "Red Velvet", label: "Red Velvet Sublime", desc: "Textura aterciopelada y húmeda, con un sutil trasfondo de cacao fino.", color: "#8B0000", priceModifier: 3.00 },
  { value: "Zanahoria", label: "Zanahoria & Nueces", desc: "Masa súper húmeda con zanahoria, canela de Ceilán, nueces crujientes y coco.", color: "#D2691E", priceModifier: 3.50 },
  { value: "Limón", label: "Limoncello Amapolas", desc: "Bizcocho cítrico de limón fresco con toques de semillas de amapola tostadas.", color: "#FFFACD", priceModifier: 1.50 }
];

export const CAKE_FILLINGS = [
  { value: "Dulce de Leche", label: "Manjar / Dulce de Leche Casero", desc: "Caramelo de leche cocinado lentamente por horas al estilo tradicional.", priceModifier: 0 },
  { value: "Mermelada de Fresa", label: "Coulis Artesanal de Fresa", desc: "Fresas seleccionadas reducidas con azúcar orgánica y jugo de limón.", priceModifier: 1.00 },
  { value: "Crema de Queso", label: "Cream Cheese Dulce", desc: "Queso crema batido con azúcar impalpable y un toque aromático cítrico.", priceModifier: 1.50 },
  { value: "Nutella", label: "Nutella Crema", desc: "Suave crema de avellanas y cacao, perfecta para los amantes del chocolate.", priceModifier: 2.50 },
  { value: "Ganache de Chocolate", label: "Ganache Negro Sedoso 70%", desc: "Emulsión brillante de chocolate negro premium con crema de leche.", priceModifier: 2.00 }
];

export const FROSTING_COLORS = [
  { name: "Blanco Cremoso", color: "#FDFDFD", label: "Clásico Vainilla" },
  { name: "Rosado Pastel", color: "#FFD1DC", label: "Dulce de Fresa" },
  { name: "Verde Menta", color: "#C1E7C4", label: "Cítrico Limón" },
  { name: "Azul Bebé", color: "#AEC6CF", label: "Sueño de Arándanos" },
  { name: "Chocolate Fudge", color: "#5C3E35", label: "Cacao Intenso" },
  { name: "Champaña Dorado", color: "#F0E68C", label: "Toque Elegante de Bodas" },
  { name: "Rojo Velvet", color: "#A52A2A", label: "Pasión de Frutos Rojos" }
];

export const CAKE_TOPPINGS = [
  { name: "Chispas de colores", icon: "✨", desc: "Chispas de arcoíris dulces y crujientes." },
  { name: "Fresas frescas", icon: "🍓", desc: "Láminas de fresas frescas seleccionadas a mano." },
  { name: "Macarons", icon: "🧁", desc: "Mini macarons franceses de colores surtidos." },
  { name: "Flores de azúcar", icon: "🌸", desc: "Elegantes flores artesanales comestibles." },
  { name: "Virutas de chocolate", icon: "🍫", desc: "Virutas finas de chocolate de leche belga." }
];

export const INITIAL_CLIENTS = [
  {
    id: "CLI-001",
    name: "Camila Soto",
    phone: "+51 970 442 173",
    email: "camila.soto@email.com",
    address: "Av. Sol 450, Cusco",
    totalSpent: 53.00,
    ordersCount: 1
  },
  {
    id: "CLI-002",
    name: "Sebastián Reyes",
    phone: "+51 912 345 678",
    email: "sreyes@email.com",
    address: "Plaza de Armas 120, Cusco",
    totalSpent: 45.00,
    ordersCount: 1
  },
  {
    id: "CLI-003",
    name: "María José Prieto",
    phone: "+51 955 544 333",
    email: "mariajose@email.com",
    address: "Urb. Larapa G-12, Cusco",
    totalSpent: 72.00,
    ordersCount: 1
  }
];

export const INITIAL_PROVIDERS = [
  {
    id: "PROV-001",
    name: "Distribuidora Del Valle",
    contactName: "Juan Pérez",
    phone: "+51 984 123 456",
    email: "ventas@distdelvalle.pe",
    address: "Av. Industrial 105, Cusco",
    suppliedItems: ["Harina sin preparar", "Azúcar blanca", "Mantequilla sin sal"]
  },
  {
    id: "PROV-002",
    name: "Cacao Cusco Premium",
    contactName: "Lucía Mamani",
    phone: "+51 984 654 321",
    email: "lucia@cacaocusco.pe",
    address: "Calle Shapi 302, Cusco",
    suppliedItems: ["Chispas de chocolate 55%", "Fudge artesanal", "Ganache de chocolate"]
  },
  {
    id: "PROV-003",
    name: "Lácteos Urubamba",
    contactName: "Marcos Quispe",
    phone: "+51 950 789 012",
    email: "mquispe@lacteosurubamba.com",
    address: "Valle Sagrado de los Incas",
    suppliedItems: ["Manjar / Dulce de leche", "Queso Crema", "Crema de leche"]
  }
];

export const INITIAL_PURCHASE_ORDERS = [
  {
    id: "OC-1001",
    providerId: "PROV-001",
    providerName: "Distribuidora Del Valle",
    items: [
      { materialName: "Harina Pastelería Orgánica", quantity: 5, unit: "Sacos (50kg)", unitPrice: 120.00 },
      { materialName: "Mantequilla de Queso Artesanal", quantity: 20, unit: "Bloques (1kg)", unitPrice: 28.50 }
    ],
    totalAmount: 1170.00,
    status: "Recibido / Almacén",
    paymentStatus: "Pagado Total",
    createdAt: "2026-07-15T09:30:00.000Z",
    expectedDeliveryDate: "2026-07-17",
    notes: "Llegó completo en el turno mañana. Excelente humedad en mantequilla."
  },
  {
    id: "OC-1002",
    providerId: "PROV-002",
    providerName: "Cacao Cusco Premium",
    items: [
      { materialName: "Chispas Chocolate 70% Cacao", quantity: 15, unit: "Bolsas (2kg)", unitPrice: 45.00 },
      { materialName: "Fudge de Cacao Nativo", quantity: 10, unit: "Baldes (5kg)", unitPrice: 65.00 }
    ],
    totalAmount: 1325.00,
    status: "En Tránsito",
    paymentStatus: "Pendiente",
    createdAt: "2026-07-20T14:15:00.000Z",
    expectedDeliveryDate: "2026-07-22",
    notes: "Pedido especial para lote de galletas de temporada."
  }
];

export const INITIAL_CLIENT_NOTES = [
  {
    id: "NOTE-1",
    clientId: "CLI-001",
    customerName: "Camila Soto",
    customerPhone: "+51 970 442 173",
    note: "Cliente frecuente. Prefiere galletas bien horneadas con cobertura extra de Nutella. Solicitó entrega siempre antes de las 5pm.",
    channel: "WhatsApp",
    createdAt: "2026-07-18T10:20:00.000Z",
    createdBy: "Atención Flikicookie"
  },
  {
    id: "NOTE-2",
    orderId: "PED-1022",
    customerName: "Sebastián Reyes",
    customerPhone: "+51 912 345 678",
    note: "Consultó sobre opciones sin gluten para eventos corporativos. Se le envió catálogo al por mayor.",
    channel: "Llamada",
    createdAt: "2026-07-19T16:45:00.000Z",
    createdBy: "Repostería Taller"
  }
];

