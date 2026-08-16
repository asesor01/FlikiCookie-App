import React from "react";
import { MessageSquare, Send } from "lucide-react";

interface WhatsAppPanelProps {
  conversations?: any[];
}

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
