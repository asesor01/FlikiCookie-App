import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, CustomCakeSpec } from "../types";
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, Wand2, RefreshCw } from "lucide-react";

interface AIKitchenChatProps {
  onApplyPreset: (spec: CustomCakeSpec) => void;
  currentSpec: CustomCakeSpec;
}

export default function AIKitchenChat({ onApplyPreset, currentSpec }: AIKitchenChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content: "¡Hola! Soy tu Chef Repostero de Inteligencia Artificial. 🧑‍🍳🍰 Estoy aquí para ayudarte a diseñar el pastel de tus sueños o recomendarte los postres perfectos para tu celebración. ¿Tienes en mente algún sabor, temática o cuántos invitados recibirás?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice & Speech State
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "es-ES";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setInputValue(text);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("La entrada por voz no está soportada en este navegador. Te recomendamos Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Text to Speech (Speech Synthesis)
  const speakText = (text: string) => {
    if (!isSpeechEnabled) return;
    try {
      window.speechSynthesis.cancel(); // Stop current speaking
      const cleanText = text.replace(/[*_#`~[\]]/g, ""); // strip markdown characters for reading
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "es-ES";
      
      // Try to find a friendly Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.startsWith("es"));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis error:", e);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue("");

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Send message to Express API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-10), // Send last 10 messages for context
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages(prev => [...prev, assistantMessage]);
        // Speak response if active
        if (isSpeechEnabled) {
          speakText(data.content);
        }
      } else {
        throw new Error(data.error || "Ocurrió un error");
      }
    } catch (error: any) {
      console.error("Error in sending AI message:", error);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Disculpa, he tenido un pequeño percance en mi cocina digital: ${error.message}. ¿Podrías volver a intentarlo?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chef Chef Recomended Combinations (Auto Apply presets)
  const CHEF_RECOMENDATIONS = [
    {
      title: "🍫 Royal Fudge Supremo",
      spec: {
        tiers: 2 as const,
        flavor: "Chocolate" as const,
        filling: "Ganache de Chocolate" as const,
        frostingColor: "#5C3E35",
        frostingName: "Chocolate Fudge",
        toppings: ["Virutas de chocolate", "Macarons"],
        inscription: "¡Feliz Cumple!"
      },
      badge: "Intenso"
    },
    {
      title: "🍓 Terciopelo Real",
      spec: {
        tiers: 1 as const,
        flavor: "Red Velvet" as const,
        filling: "Crema de Queso" as const,
        frostingColor: "#FFD1DC",
        frostingName: "Rosado Pastel",
        toppings: ["Fresas frescas", "Flores de azúcar"],
        inscription: "¡Felicidades!"
      },
      badge: "Clásico"
    },
    {
      title: "🥕 Zanahoria Rústica",
      spec: {
        tiers: 2 as const,
        flavor: "Zanahoria" as const,
        filling: "Crema de Queso" as const,
        frostingColor: "#FDFDFD",
        frostingName: "Blanco Cremoso",
        toppings: ["Flores de azúcar"],
        inscription: "Aniversario"
      },
      badge: "Artesanal"
    }
  ];

  const handleApplyPreset = (rec: typeof CHEF_RECOMENDATIONS[0]) => {
    onApplyPreset(rec.spec);
    // Add client confirmation chat message
    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: "user",
        content: `Quiero probar la recomendación del Chef: "${rec.title}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      {
        id: `sys-ai-${Date.now()}`,
        role: "assistant",
        content: `¡Excelente elección! He cargado el diseño de "${rec.title}" en el Diseñador Visual de Pasteles. ¡Míralo a tu izquierda! He configurado ${rec.spec.tiers} piso(s) con masa de ${rec.spec.flavor}, relleno de ${rec.spec.filling} y una elegante cobertura de ${rec.spec.frostingName}. ¿Te gustaría ajustar los toppings o agregar alguna dedicatoria especial?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    ]);
  };

  return (
    <div id="ai_kitchen_chat_card" className="flex flex-col bg-art-panel border border-art-border rounded-xl h-[520px] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-art-text text-art-bg">
        <div className="flex items-center gap-3">
            <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-art-border bg-white flex items-center justify-center">
              <img
                src="/src/assets/images/Emblema%20Flikicookie.png"
                alt="Flikicookie Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-art-text rounded-full"></div>
          </div>
          <div>
            <h3 className="font-serif italic text-base tracking-tight flex items-center gap-1.5 text-art-bg">
              Artisan Chef de IA <Sparkles className="w-3.5 h-3.5 fill-art-accent stroke-art-accent text-art-accent" />
            </h3>
            <p className="text-[10px] text-art-muted tracking-wider uppercase font-semibold">Consejero de Alta Repostería</p>
          </div>
        </div>
        
        {/* Actions header (voice synthesis, etc.) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const newSpeech = !isSpeechEnabled;
              setIsSpeechEnabled(newSpeech);
              if (newSpeech) {
                speakText("¡Voz activada! Escucharás mis recomendaciones.");
              } else {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              isSpeechEnabled ? "bg-art-accent text-art-bg scale-105" : "text-art-muted hover:bg-white/10"
            }`}
            title={isSpeechEnabled ? "Desactivar voz de Chef" : "Activar voz de Chef (Español)"}
            id="btn_voice_output"
          >
            {isSpeechEnabled ? <Volume2 className="w-4 h-4 text-art-bg" /> : <VolumeX className="w-4 h-4 text-art-muted" />}
          </button>
          
          <button
            onClick={() => {
              setMessages([
                {
                  id: "init-1",
                  role: "assistant",
                  content: "¡Hola de nuevo! Mis hornos de repostería están listos. ¿De qué sabor te gustaría diseñar tu próximo pastel o qué evento estás planeando hoy?",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ]);
            }}
            className="p-2 text-art-muted hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Reiniciar chat"
            id="btn_reset_chat"
          >
            <RefreshCw className="w-4 h-4 text-art-muted" />
          </button>
        </div>
      </div>

      {/* Preset recommendations bar */}
      <div className="bg-art-bg/80 border-b border-art-border px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[9px] uppercase font-bold text-art-muted flex items-center gap-1 shrink-0 tracking-wider">
          <Wand2 className="w-3 h-3 text-art-accent" /> Recetas:
        </span>
        <div className="flex items-center gap-1.5 text-xs">
          {CHEF_RECOMENDATIONS.map((rec, i) => (
            <button
              key={i}
              onClick={() => handleApplyPreset(rec)}
              className="bg-art-panel border border-art-border hover:border-art-accent hover:bg-art-panel/50 text-art-text px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>{rec.title}</span>
              <span className="text-[9px] bg-art-accent/15 text-art-accent px-1.5 py-0.2 rounded-full uppercase scale-90 font-bold">{rec.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-art-panel">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              {msg.role === "user" ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-xs shrink-0 select-none border bg-art-panel text-art-text border-art-border font-bold">
                  👤
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-art-text shadow-xs shrink-0 bg-white flex items-center justify-center">
                  <img
                    src="/src/assets/images/Emblema%20Flikicookie.png"
                    alt="Flikicookie Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Bubble */}
              <div className="flex flex-col space-y-1">
                <div className={`px-4 py-2.5 rounded-xl text-xs leading-relaxed shadow-xs ${
                  msg.role === "user"
                    ? "bg-art-accent text-white rounded-tr-none"
                    : "bg-white text-art-text rounded-tl-none border border-art-border"
                }`}>
                  <p className="whitespace-pre-line font-sans">{msg.content}</p>
                </div>
                <span className={`text-[9px] text-art-muted px-1 font-semibold ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-2.5 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-art-text text-art-bg border border-art-text text-sm shadow-xs shrink-0">
                👨‍🍳
              </div>
              <div className="flex flex-col space-y-1">
                <div className="bg-white text-art-text px-4 py-3 rounded-xl rounded-tl-none border border-art-border flex items-center gap-2 text-xs">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-art-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-art-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-art-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="italic text-art-muted">Chef está perfeccionando la receta...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-art-panel border-t border-art-border flex items-center gap-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-lg transition-all shrink-0 cursor-pointer ${
            isListening
              ? "bg-art-accent text-art-bg animate-pulse"
              : "bg-art-bg text-art-text hover:bg-art-border-10 border border-art-border"
          }`}
          title={isListening ? "Detener dictado por voz" : "Dictar mensaje con tu voz (Español)"}
          id="btn_mic"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-art-accent" />}
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isListening ? "Escuchando tu voz..." : "Pregúntale al Chef Repostero..."}
          className="flex-1 bg-white text-art-text text-xs px-3.5 py-2.5 rounded-lg border border-art-border focus:outline-none focus:ring-1 focus:ring-art-accent placeholder:text-art-muted"
          disabled={isListening}
          id="chat_text_input"
        />

        <button
          type="submit"
          className="p-2.5 bg-art-text hover:bg-art-accent text-art-bg rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 border border-art-text"
          disabled={!inputValue.trim() || isLoading}
          id="chat_send_button"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
