import React from "react";

interface WhatsAppPanelProps {
  conversations?: any[];
}

export default function WhatsAppPanel({ conversations = [] }: WhatsAppPanelProps) {
  return (
    <div className="flex h-[600px] bg-white border border-art-border rounded-lg overflow-hidden shadow-xs">
      <div className="w-full md:w-80 border-r border-art-border flex items-center justify-center p-4">
        <div>
          <h4 className="font-bold text-sm mb-2">WhatsApp Business</h4>
          <p className="text-xs text-art-muted">Panel temporal para permitir la compilación del proyecto.</p>
          <p className="text-[10px] mt-2 text-art-muted">Conversaciones: {conversations.length}</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-art-muted">Selecciona una conversación para ver los mensajes.</p>
      </div>
    </div>
  );
}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#ECE5DD]/30">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[#25D366]/30" />
              <h4 className="font-bold text-art-text mb-1">WhatsApp Business</h4>
              <p className="text-xs text-art-muted max-w-xs">
                Selecciona una conversación para comenzar a responder o usa el botón para iniciar una nueva
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
