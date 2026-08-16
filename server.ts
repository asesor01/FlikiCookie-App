import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not set in the environment variables.");
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

// Chat with Chef Repostero (AI Assistant)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "El mensaje es requerido." });
    }

    if (!ai) {
      return res.status(503).json({
        error: "El servicio de Inteligencia Artificial no está configurado (Falta GEMINI_API_KEY).",
      });
    }

    // Format chat history for Gemini
    // Expects: { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const systemInstruction = `Eres un Chef Repostero experto, maestro pastelero y asesor de ventas de la renombrada "Pastelería Delicias".
Tu objetivo es deleitar a los clientes, ayudándoles a elegir o diseñar el pastel o postre perfecto para su evento.
Siempre respondes en un tono cálido, profesional, entusiasta y sumamente educado (en español).

Directrices:
1. Si el cliente quiere diseñar un pastel personalizado, pregúntale por los pisos (1, 2 o 3 pisos), el sabor de la masa (Vainilla, Chocolate, Red Velvet, Zanahoria o Limón), el relleno (Dulce de leche, Fresa, Crema de queso, Nutella o Ganache de chocolate), el color de la cobertura y la decoración o dedicatoria.
2. Explica de forma deliciosa y atractiva las texturas y sabores de los postres (ej. "nuestro bizcocho Red Velvet con una textura aterciopelada y un sutil toque de cacao, perfectamente equilibrado con un relleno de crema de queso dulce").
3. Si te preguntan sobre alérgenos, sé muy responsable e indícales claramente sobre gluten, lactosa, frutos secos u otros ingredientes.
4. Ofrece ideas de dedicatorias creativas (divertidas, sentimentales, elegantes) de acuerdo con la ocasión (cumpleaños, bodas, aniversarios, graduaciones).
5. Mantén tus respuestas conversacionales, relativamente breves y fluidas. No satures al usuario con listas excesivamente largas a menos que te lo pida.`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({
      message: message,
    });

    res.json({
      role: "assistant",
      content: response.text || "Lo siento, no pude procesar tu solicitud.",
    });
  } catch (error: any) {
    console.error("Error in AI Chat:", error);
    res.status(500).json({
      error: "Ocurrió un error al procesar tu conversación con el Chef de IA.",
      details: error.message,
    });
  }
});

// AI Kitchen Analysis Endpoint (for Bakery Staff)
app.post("/api/chef-advice", async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({ error: "Se requiere una lista válida de pedidos para el análisis." });
    }

    if (!ai) {
      return res.status(503).json({
        error: "El servicio de Inteligencia Artificial no está configurado (Falta GEMINI_API_KEY).",
      });
    }

    const ordersSummary = orders
      .map((o: any, idx: number) => {
        const itemsStr = o.items
          .map((i: any) => {
            if (i.isCustom && i.customSpec) {
              const spec = i.customSpec;
              return `- Pastel Personalizado (${spec.tiers} piso(s)): Masa de ${spec.flavor}, relleno de ${spec.filling}, cobertura ${spec.frostingColor}, toppings: ${spec.toppings.join(", ")}, dedicatoria: "${spec.inscription || "Ninguna"}"`;
            }
            return `- ${i.name} (x${i.quantity})`;
          })
          .join("\n");

        return `Pedido #${o.id} - Cliente: ${o.customerName} - Fecha/Hora Entrega: ${o.deliveryDate} ${o.deliveryTime} - Tipo: ${o.orderType}
Detalles:
${itemsStr}
Estado Actual: ${o.status}`;
      })
      .join("\n\n");

    const prompt = `Analiza la siguiente lista de pedidos pendientes para el taller de repostería y genera un reporte de optimización de producción estructurado en formato JSON.

Pedidos del Día:
${ordersSummary}

Por favor, genera un análisis inteligente con los siguientes campos:
1. "schedule": Una agenda paso a paso sugerida para el equipo de reposteros (ej. qué hornear primero, qué decorar después).
2. "shoppingList": Una lista consolidada de ingredientes críticos que se necesitan para estos pedidos específicos.
3. "decoratingAdvice": Recomendaciones de decoración creativas o de manejo técnico para los pasteles personalizados listados (ej. estabilidad de pisos, manejo de coberturas, etc.).
4. "warnings": Posibles cuellos de botella o alertas (ej. entregas a la misma hora, alérgenos declarados en el pedido, etc.).

Tu respuesta debe ser estrictamente en formato JSON válido, de acuerdo con este esquema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Secuencia de tareas optimizada para preparar, hornear y decorar.",
            },
            shoppingList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Ingredientes clave requeridos con estimados.",
            },
            decoratingAdvice: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Consejos técnicos de pastelería sobre glaseados, montaje y decoración.",
            },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Alertas sobre alérgenos, tiempos de enfriamiento de pisos o cuellos de botella de entrega.",
            },
          },
          required: ["schedule", "shoppingList", "decoratingAdvice", "warnings"],
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in AI Kitchen Analysis:", error);
    res.status(500).json({
      error: "Ocurrió un error al procesar la sugerencia de cocina.",
      details: error.message,
    });
  }
});

// -------------------------------------------------------------
// WHATSAPP WEBHOOK ENDPOINTS
// -------------------------------------------------------------

// Webhook verification (Meta sends GET request to verify the endpoint)
app.get("/api/webhook/whatsapp", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'flikicookie_webhook_verify';

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ WhatsApp webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    console.error("❌ WhatsApp webhook verification failed");
    res.sendStatus(403);
  }
});

// Webhook for incoming messages
app.post("/api/webhook/whatsapp", (req, res) => {
  try {
    const payload = req.body;

    // Acknowledge receipt immediately (Meta requires response within 5s)
    res.sendStatus(200);

    // Process asynchronously
    if (payload.object === "whatsapp_business_account") {
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "messages") {
            const value = change.value;

            // Process incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                const from = message.from;
                const text = message.text?.body || "";

                console.log(`📱 WhatsApp message from ${from}: ${text}`);

                // Here you would:
                // 1. Store the message in your database/localStorage
                // 2. Generate auto-response based on intent
                // 3. Send response via WhatsApp API
                // 4. Notify the admin dashboard (via WebSocket or polling)
              }
            }

            // Process message statuses (delivery/read receipts)
            if (value.statuses) {
              for (const status of value.statuses) {
                console.log(`📊 Message ${status.id}: ${status.status}`);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing WhatsApp webhook:", error);
    // Don't send error response - we already sent 200
  }
});

// API endpoint to send WhatsApp message manually from dashboard
app.post("/api/whatsapp/send", async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: "Phone number and message are required" });
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      return res.status(503).json({ 
        error: "WhatsApp API not configured",
        hint: "Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env"
      });
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
      return res.status(500).json({ error: "Failed to send message", details: error });
    }

    const result = await response.json();
    res.json({ success: true, messageId: result.messages?.[0]?.id });
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error);
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Server Start and Client-Side Static Asset Setup
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In development mode, mount Vite dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built static assets from 'dist'
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Pastelería Delicias Server running on http://localhost:${PORT}`);
  });
}

startServer();
