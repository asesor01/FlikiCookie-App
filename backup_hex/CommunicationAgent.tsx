import React, { useState } from "react";
import { 
  MessageSquare, Send, Bell, Users, TrendingUp, 
  Clock, CheckCircle, AlertCircle, Settings, Plus, Trash2 
} from "lucide-react";

interface CommunicationMessage {
  id: string;
  channel: "whatsapp" | "email" | "sms" | "instagram";
  from: string;
  to: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read" | "failed";
  type: "inbound" | "outbound";
}

interface AutoResponse {
  id: string;
  trigger: string;
  response: string;
  channel: string;
  active: boolean;
}

interface CommunicationAgentProps {
  messages: CommunicationMessage[];
  autoResponses: AutoResponse[];
  onAddAutoResponse: (response: Omit<AutoResponse, 'id'>) => void;
  onToggleAutoResponse: (id: string) => void;
  onDeleteAutoResponse: (id: string) => void;
  onSendMessage: (to: string, content: string, channel: string) => void;
}

export default function CommunicationAgent({
  messages,
  autoResponses,
  onAddAutoResponse,
  onToggleAutoResponse,
  onDeleteAutoResponse,
  onSendMessage
}: CommunicationAgentProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "messages" | "autoresponses">("dashboard");
  const [newAutoResponse, setNewAutoResponse] = useState({ trigger: "", response: "", channel: "whatsapp" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("all");

  // Stats
  const totalMessages = messages.length;
  const inboundMessages = messages.filter(m => m.type === "inbound").length;
  const outboundMessages = messages.filter(m => m.type === "outbound").length;
  const unreadMessages = messages.filter(m => m.status === "delivered").length;

  const channelStats = {
    whatsapp: messages.filter(m => m.channel === "whatsapp").length,
    email: messages.filter(m => m.channel === "email").length,
    sms: messages.filter(m => m.channel === "sms").length,
    instagram: messages.filter(m => m.channel === "instagram").length,
  };

  const filteredMessages = selectedChannel === "all" 
    ? messages 
    : messages.filter(m => m.channel === selectedChannel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gradient-art rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Communication Agent</h2>
              <p className="text-white/70 text-xs">Gestión unificada de canales de comunicación</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "dashboard" ? "bg-art-accent text-white" : "bg-art-accent-10 text-art-accent-dark hover:bg-art-accent-5"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "messages" ? "bg-art-accent text-white" : "bg-art-accent-10 text-art-accent-dark hover:bg-art-accent-5"
              }`}
            >
              Mensajes
            </button>
            <button
              onClick={() => setActiveTab("autoresponses")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === "autoresponses" ? "bg-art-accent text-white" : "bg-art-accent-10 text-art-accent-dark hover:bg-art-accent-5"
              }`}
            >
              Auto-Respuestas
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-art-border rounded-xl p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-art-border" />
            <div className="text-2xl font-bold text-art-accent">{totalMessages}</div>
            <div className="text-[10px] text-art-muted">Total Mensajes</div>
          </div>
          <div className="bg-white border border-art-border rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-art-border" />
            <div className="text-2xl font-bold text-art-accent">{inboundMessages}</div>
            <div className="text-[10px] text-art-muted">Recibidos</div>
          </div>
          <div className="bg-white border border-art-border rounded-xl p-4 text-center">
            <Send className="w-8 h-8 mx-auto mb-2 text-art-border" />
            <div className="text-2xl font-bold text-art-accent">{outboundMessages}</div>
            <div className="text-[10px] text-art-muted">Enviados</div>
          </div>
          <div className="bg-white border border-art-border rounded-xl p-4 text-center">
            <Bell className="w-8 h-8 mx-auto mb-2 text-art-border" />
            <div className="text-2xl font-bold text-art-accent">{autoResponses.filter(a => a.active).length}</div>
            <div className="text-[10px] text-art-muted">Auto-Respuestas Activas</div>
          </div>

          {/* Channel Stats */}
          <div className="md:col-span-4 bg-white border border-art-border rounded-xl p-5">
            <h3 className="font-bold text-sm text-art-text mb-4">Mensajes por Canal</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(channelStats).map(([channel, count]) => (
                <div key={channel} className="text-center">
                  <div className="text-lg font-bold text-art-text">{count}</div>
                      <div className="text-[10px] text-art-muted capitalize">{channel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-4">
            <div className="flex gap-2">
            {["all", "whatsapp", "email", "sms", "instagram"].map(ch => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  selectedChannel === ch 
                    ? "bg-art-accent text-white" 
                    : "bg-art-panel text-art-muted hover:bg-art-accent-5"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg border ${
                  msg.type === "inbound" 
                    ? "bg-art-panel border-art-border mr-8" 
                    : "bg-art-accent-10 border-art-accent-strong ml-8"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-art-muted">
                    {msg.type === "inbound" ? msg.from : `Para: ${msg.to}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-art-accent-10 text-art-accent px-2 py-0.5 rounded-full capitalize">
                      {msg.channel}
                    </span>
                    <span className="text-[9px] text-[#6B5344]">{msg.timestamp}</span>
                  </div>
                </div>
                <p className="text-xs text-art-muted">{msg.content}</p>
                <div className="flex items-center gap-1 mt-1">
                  {msg.status === "read" && <CheckCircle className="w-3 h-3 text-green-500" />}
                  {msg.status === "delivered" && <CheckCircle className="w-3 h-3 text-blue-500" />}
                  {msg.status === "failed" && <AlertCircle className="w-3 h-3 text-red-500" />}
                  <span className="text-[9px] text-art-muted capitalize">{msg.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Responses Tab */}
      {activeTab === "autoresponses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-art-text">Reglas de Auto-Respuesta</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-art-accent hover:bg-art-accent-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              {showAddForm ? "Cancelar" : <><Plus className="w-3 h-3" /> Nueva</>}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-art-panel border border-art-border rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-art-muted">Palabra/Trigger</label>
                  <input
                    type="text"
                    value={newAutoResponse.trigger}
                    onChange={(e) => setNewAutoResponse({ ...newAutoResponse, trigger: e.target.value })}
                    placeholder="Ej: menu, precio, horario"
                    className="w-full border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-art-accent bg-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-[#6B5344]">Canal</label>
                  <select
                    value={newAutoResponse.channel}
                    onChange={(e) => setNewAutoResponse({ ...newAutoResponse, channel: e.target.value })}
                    className="w-full border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-art-accent bg-white"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="instagram">Instagram</option>
                    <option value="all">Todos</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      onAddAutoResponse(newAutoResponse);
                      setNewAutoResponse({ trigger: "", response: "", channel: "whatsapp" });
                      setShowAddForm(false);
                    }}
                    className="w-full bg-art-accent text-white text-xs font-bold py-2 rounded-lg hover:bg-art-accent-hover"
                  >
                    Guardar
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-[#6B5344]">Respuesta Automática</label>
                <textarea
                  rows={2}
                  value={newAutoResponse.response}
                  onChange={(e) => setNewAutoResponse({ ...newAutoResponse, response: e.target.value })}
                  placeholder="Escribe la respuesta que se enviará automáticamente..."
                  className="w-full border border-art-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-art-accent bg-white resize-y"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {autoResponses.map(ar => (
              <div key={ar.id} className="bg-white border border-art-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#2C1810]">"{ar.trigger}"</span>
                    <span className="text-[9px] bg-art-accent-10 text-art-accent px-2 py-0.5 rounded-full">{ar.channel}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${ar.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ar.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B5344] mt-1 line-clamp-1">{ar.response}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onToggleAutoResponse(ar.id)}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${
                      ar.active ? 'bg-art-accent' : 'bg-art-border'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${
                      ar.active ? 'translate-x-5' : ''
                    }`} />
                  </button>
                  <button
                    onClick={() => onDeleteAutoResponse(ar.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
