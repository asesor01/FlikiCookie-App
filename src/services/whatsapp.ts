// ============================================
// WHATSAPP SERVICE — Flikicookie Artisan Bakery
// Integración con WhatsApp Business API
// ============================================

export interface WhatsAppMessage {
  id: string;
  from: string;           // Phone number (international format)
  to: string;             // Business phone number
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'document' | 'interactive' | 'location';
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  context?: {
    from: string;
    id: string;            // ID of the message being replied to
  };
}

export interface WhatsAppConversation {
  id: string;
  phone: string;
  customerName?: string;
  clientId?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'new' | 'active' | 'pending' | 'closed';
  messages: WhatsAppMessage[];
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

// ============================================
// CONFIGURACIÓN
// ============================================
export const WHATSAPP_CONFIG = {
  phoneNumberId: '',
  accessToken: '',
  verifyToken: 'flikicookie_webhook_verify',
  apiVersion: 'v21.0',
  get baseUrl() {
    return `https://graph.facebook.com/${this.apiVersion}`;
  }
};

// ============================================
// PLANTILLAS DE AUTO-RESPUESTA
// ============================================
export const AUTO_RESPONSES = {
  greeting: `¡Hola! 👋 Bienvenido a *Flikicookie Artisan Bakery* 🍪

Somos una panadería artesanal en Cusco, especializada en galletas personalizadas y postres únicos.

¿Cómo podemos ayudarte hoy?`,

  menu: `📋 *Nuestro Menú*

🍪 *Galletas Clásicas*
• ChocoManjar — S/. 12
• MockaChino — S/. 14
• Confitti — S/. 11
• Bombón — S/. 13

🎂 *Tortas Personalizadas*
• Desde S/. 85 (1 nivel)
• Desde S/. 140 (2 niveles)
• Desde S/. 210 (3 niveles)

☕ *Bebidas*
• Café de Autor — S/. 8
• Chocolate Caliente — S/. 10

¿Te interesa algún producto en particular?`,

  orderStatus: `📦 *Consulta de Estado de Pedido*

Para verificar el estado de tu pedido, por favor compárdenos:
1️⃣ Tu nombre completo
2️⃣ Número de pedido (si lo tienes)
3️⃣ Fecha del pedido

Te responderemos a la brevedad.`,

  payment: `💳 *Métodos de Pago*

Aceptamos:
• Yape: 984 112 233
• Plin: 984 112 233
• Transferencia BCP: 191-1234567890-10-12
• Efectivo: En tienda

*Nota:* El pedido se confirma una vez recibido el pago.`,

  customCake: `🎂 *Pastel Personalizado*

¿Quieres diseñar tu pastel ideal? Cuéntanos:

1️⃣ ¿Cuántos pisos? (1, 2 o 3)
2️⃣ ¿Sabor del bizcocho? (Vainilla, Chocolate, Red Velvet, Zanahoria, Limón)
3️⃣ ¿Relleno? (Dulce de leche, Fresa, Crema de queso, Nutella, Ganache)
4️⃣ Color de cobertura
5️⃣ Decoración o dedicatoria especial

Te prepararemos una cotización personalizada ✨`,

  location: `📍 *Encuéntranos*

Flikicookie Artisan Bakery
Av. El Sol 124, Plaza Regocijo, Cusco

⏰ Horario: Lun-Sáb 9:00 AM - 8:00 PM
📞 Tel: +51 984 123 456

¡Te esperamos! 🍪`,

  unknown: `Gracias por tu mensaje 😊

Un nuestro equipo te responderá a la brevedad. Mientras tanto, ¿te gustaría:

1️⃣ Ver nuestro menú
2️⃣ Consultar el estado de un pedido
3️⃣ Diseñar un pastel personalizado
4️⃣ Conocer nuestros métodos de pago

Responde con el número de tu opción.`,

  // Palabras clave para detectar intención
  keywords: {
    menu: ['menú', 'menu', 'carta', 'productos', 'qué tienen', 'que tienen', 'qué venden', 'precios', 'costo', 'cuanto cuesta', 'cuánto cuesta'],
    order: ['pedido', 'orden', 'estado', 'dónde está', 'donde esta', 'cuando llega', 'cuándo llega', 'se despachó', 'despacho'],
    payment: ['pago', 'pagar', 'yape', 'plin', 'transferencia', 'bcp', 'efectivo', 'cuanto debo', 'cuánto debo'],
    cake: ['pastel', 'torta', 'personalizado', 'personalizada', 'cumpleaños', 'boda', 'evento', 'diseñar'],
    location: ['ubicación', 'ubicacion', 'dirección', 'direccion', 'dónde están', 'donde estan', 'local', 'tienda', 'mapa'],
    greeting: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hello', 'hi', 'hey']
  }
};

// ============================================
// FUNCIÓN PARA DETECTAR INTENCIÓN DEL MENSAJE
// ============================================
export type IntentType = 'menu' | 'order' | 'payment' | 'cake' | 'location' | 'greeting' | 'human' | 'unknown';

// Palabras clave que indican que el cliente quiere hablar con una persona
const HUMAN_ESCALATION_KEYWORDS = [
  'hablar con alguien', 'hablar con una persona', 'hablar con administración',
  'hablar con un agente', 'atención al cliente', 'servicio al cliente',
  'queja', 'reclamo', 'problema', 'urgente', 'no me gusta', 'estoy molesto',
  'habla conmigo', 'respóndeme', 'eres un bot', 'eres una máquina',
  'persona real', 'humano', 'agente humano', 'administrador', 'dueño',
  'quiero hablar', 'necesito ayuda real', 'soporte humano'
];

export function detectIntent(message: string): IntentType {
  const lower = message.toLowerCase().trim();
  
  // Primero verificar si quiere hablar con humano
  if (HUMAN_ESCALATION_KEYWORDS.some(keyword => lower.includes(keyword))) {
    return 'human';
  }
  
  for (const [intent, keywords] of Object.entries(AUTO_RESPONSES.keywords)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return intent as IntentType;
    }
  }
  
  return 'unknown';
}

// ============================================
// FUNCIÓN PARA GENERAR AUTO-RESPUESTA
// ============================================
export function generateAutoResponse(userMessage: string, customResponses?: Record<string, string>): string {
  const intent = detectIntent(userMessage);
  
  // Si el cliente quiere hablar con humano, escalar
  if (intent === 'human') {
    return `Entiendo que prefieres hablar con una persona. 😊

Un miembro de nuestro equipo te atenderá pronto. Mientras tanto, ¿podrías indicarnos brevemente tu consulta?

⏱️ Horario de atención: Lun-Sáb 9:00 AM - 6:00 PM
📍 Av. El Sol 124, Plaza Regocijo, Cusco

Gracias por tu paciencia.`;
  }
  
  // Usar respuestas personalizadas si existen
  if (customResponses && customResponses[intent]) {
    return customResponses[intent];
  }
  
  switch (intent) {
    case 'menu': return AUTO_RESPONSES.menu;
    case 'order': return AUTO_RESPONSES.orderStatus;
    case 'payment': return AUTO_RESPONSES.payment;
    case 'cake': return AUTO_RESPONSES.customCake;
    case 'location': return AUTO_RESPONSES.location;
    case 'greeting': return AUTO_RESPONSES.greeting;
    default: return AUTO_RESPONSES.unknown;
  }
}

// ============================================
// FUNCIONES DE ENVÍO DE MENSAJES (API)
// ============================================
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!WHATSAPP_CONFIG.accessToken || !WHATSAPP_CONFIG.phoneNumberId) {
    console.warn('⚠️ WhatsApp API credentials not configured');
    return false;
  }

  try {
    const response = await fetch(
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

export async function sendWhatsAppTemplate(
  to: string, 
  templateName: string, 
  languageCode: string = 'es',
  components?: any[]
): Promise<boolean> {
  if (!WHATSAPP_CONFIG.accessToken || !WHATSAPP_CONFIG.phoneNumberId) {
    console.warn('⚠️ WhatsApp API credentials not configured');
    return false;
  }

  try {
    const response = await fetch(
      `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components || []
          }
        })
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Failed to send WhatsApp template:', error);
    return false;
  }
}

// ============================================
// PLANTILLA DE NOTIFICACIÓN DE PEDIDO
// ============================================
export function generateOrderNotification(
  orderId: string,
  customerName: string,
  status: string,
  items: string,
  total: number
): string {
  const statusEmojis: Record<string, string> = {
    'Pendiente': '⏳',
    'En Preparación': '👨‍🍳',
    'En Horno': '🔥',
    'Decorando': '🎨',
    'Listo': '✅',
    'Entregado': '🎉',
    'En Camino': '🏍️'
  };

  return `${statusEmojis[status] || '📦'} *Actualización de Pedido #${orderId}*

Hola ${customerName},

Tu pedido ha cambiado de estado a: *${status}*

📋 *Detalle:*
${items}

💰 *Total: S/. ${total.toFixed(2)}*

¡Gracias por confiar en Flikicookie! 🍪`;
}

// ============================================
// PROCESAMIENTO DE WEBHOOK
// ============================================
export function processWebhookPayload(payload: WhatsAppWebhookPayload): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = [];

  if (payload.object !== 'whatsapp_business_account') {
    return messages;
  }

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue;

      const value = change.value;

      // Procesar mensajes entrantes
      if (value.messages) {
        messages.push(...value.messages);
      }

      // Procesar estados de entrega (opcional, para analytics)
      if (value.statuses) {
        // TODO: Actualizar estado de mensajes enviados
        console.log('Delivery statuses:', value.statuses);
      }
    }
  }

  return messages;
}

// ============================================
// UTILIDADES
// ============================================
export function formatPhoneForWhatsApp(phone: string): string {
  // Eliminar espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Asegurar formato internacional (sin el +)
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // Si empieza con 0, asumir que es Perú
  if (cleaned.startsWith('0')) {
    cleaned = '51' + cleaned.substring(1);
  }
  
  return cleaned;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000 || timestamp);
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}
