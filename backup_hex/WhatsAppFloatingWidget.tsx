import React, { useState } from "react";
import { MessageSquare, X, Send, Bell } from "lucide-react";
import { WhatsAppConversation, generateAutoResponse } from "../services/whatsapp";

interface WhatsAppFloatingWidgetProps {
  conversations: WhatsAppConversation[];
  onSendMessage: (phone: string, message: string) => void;
  onOpenFullPanel: () => void;
}

export default function WhatsAppFloatingWidget({
  conversations,
  onSendMessage,
  onOpenFullPanel
}: WhatsAppFloatingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState<WhatsAppConversation | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const unreadCount = conversations.filter(c => c.unreadCount > 0).length;

  const handleSend = () => {
    if (!messageInput.trim() || !selectedConv) return;
    onSendMessage(selectedConv.phone, messageInput.trim());
    setMessageInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-art-accent hover:bg-art-accent-hover text-white p-3 rounded-full shadow-lg transition-all cursor-pointer group"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-art-accent text-art-bg text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Quick Panel */}
      {isOpen && (
        <div className="fixed top-16 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-art-border overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-art-border text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <div>
                <span className="font-bold text-sm block">WhatsApp Business</span>
                <span className="text-[10px] text-white/70">{unreadCount} mensajes sin leer</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenFullPanel}
                className="text-[9px] bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
              >
                Abrir completo
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation List or Chat */}
          {!selectedConv ? (
            <div className="max-h-80 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No hay conversaciones</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className="p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-art-accent flex items-center justify-center text-art-bg font-bold text-xs shrink-0">
                      {(conv.customerName || conv.phone).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 truncate">
                          {conv.customerName || conv.phone}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-art-accent text-art-bg text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col h-80">
              {/* Chat Header */}
              <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                <button onClick={() => setSelectedConv(null)} className="p-1 hover:bg-slate-200 rounded">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
                <div className="w-7 h-7 rounded-full bg-art-accent flex items-center justify-center text-art-bg font-bold text-[10px]">
                  {(selectedConv.customerName || selectedConv.phone).charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-xs text-slate-800">
                  {selectedConv.customerName || selectedConv.phone}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-art-panel/30">
                {selectedConv.messages.map((msg, idx) => {
                  const isFromBusiness = msg.to && !msg.from.startsWith('51');
                  return (
                    <div key={idx} className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[11px] ${
                        isFromBusiness ? 'bg-art-border-10' : 'bg-white border border-art-border'
                      }`}>
                        {msg.text?.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe..."
                  className="flex-1 bg-slate-50 border border-art-border rounded-full px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-art-accent"
                />
                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className={`p-2 rounded-full ${messageInput.trim() ? 'bg-art-accent text-art-bg' : 'bg-slate-200 text-slate-400'}`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
