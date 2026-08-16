import React, { useState } from "react";
import { Order, OrderStatus } from "../types";
import { Search, MapPin, Package, Calendar, Clock, Smile, Sparkles, CheckCircle, Printer, Bell, MessageSquare } from "lucide-react";

interface OrderTrackingProps {
  orders: Order[];
}

export default function OrderTracking({ orders }: OrderTrackingProps) {
  const [searchId, setSearchId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const query = searchId.trim().toUpperCase();

    if (!query) return;

    // Search by exact ID
    const foundById = orders.find(o => o.id.toUpperCase() === query);
    
    // Search by phone or email or customer name
    const matches = orders.filter(o => 
      o.id.toUpperCase() === query ||
      o.customerPhone.replaceAll(" ", "").includes(query.replaceAll(" ", "")) ||
      o.customerEmail.toUpperCase().includes(query) ||
      o.customerName.toUpperCase().includes(query)
    );

    if (foundById) {
      setTrackedOrder(foundById);
      setHistoryOrders([]);
    } else if (matches.length > 0) {
      setTrackedOrder(null);
      setHistoryOrders(matches);
    } else {
      setTrackedOrder(null);
      setHistoryOrders([]);
    }
  };


  const handleEnableNotifications = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          setNotificationsEnabled(true);
          new Notification("Flikicookie Alertas", {
            body: `¡Notificaciones activadas para tu pedido ${trackedOrder?.id}! Te avisaremos cuando cambie de estado.`,
            icon: "/favicon.ico"
          });
        } else {
          alert("Por favor permite las notificaciones en tu navegador.");
        }
      });
    } else {
      alert("Tu navegador no soporta notificaciones push. Te enviaremos actualizaciones por WhatsApp.");
    }
  };

  const handlePrintBuyerInvoice = () => {
    if (!trackedOrder) return;
    
    const subtotal = trackedOrder.totalAmount / 1.18;
    const igv = trackedOrder.totalAmount - subtotal;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante ${trackedOrder.id} - Flikicookie</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; max-width: 650px; margin: 0 auto; color: var(--color-art-text); background: #fff; }
            .header { text-align: center; border-bottom: 2px solid var(--color-art-border); padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 26px; font-weight: bold; font-family: Georgia, serif; color: var(--color-art-border); }
            .subtext { font-size: 11px; color: var(--color-art-muted); margin-top: 4px; }
            .box { border: 1px solid var(--color-art-border); padding: 15px; border-radius: 8px; background: var(--color-art-panel); margin-bottom: 20px; }
            .grid { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background: var(--color-art-border); color: #fff; text-align: left; padding: 8px; font-weight: bold; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
            .totals { margin-top: 20px; text-align: right; font-size: 13px; line-height: 1.8; }
            .grand-total { font-size: 18px; font-weight: bold; color: var(--color-art-border); border-top: 2px solid var(--color-art-border); padding-top: 5px; margin-top: 5px; }
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: var(--color-art-muted); border-top: 1px dashed #ccc; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🍪 Flikicookie Artisan Bakery</div>
            <div class="subtext">RUC: 20609876541 | Repostería Fina & Galletas de Autor</div>
            <div class="subtext">Calle Triunfo 392, Centro Histórico - Cusco, Perú</div>
          </div>

          <div class="box">
            <div class="grid"><strong>COMPROBANTE DE COMPRA:</strong> <span>${trackedOrder.id}</span></div>
            <div class="grid"><strong>CLIENTE / TITULAR:</strong> <span>${trackedOrder.customerName}</span></div>
            <div class="grid"><strong>TELÉFONO / WHATSAPP:</strong> <span>${trackedOrder.customerPhone}</span></div>
            <div class="grid"><strong>MODALIDAD & FECHA:</strong> <span>${trackedOrder.orderType} — ${trackedOrder.deliveryDate} (${trackedOrder.deliveryTime} hrs)</span></div>
            <div class="grid"><strong>FORMA DE PAGO:</strong> <span>${trackedOrder.paymentMethod}</span></div>
            <div class="grid"><strong>ESTADO ACTUAL:</strong> <span style="font-weight: bold; color: #D97706;">${trackedOrder.status.toUpperCase()}</span></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto / Detalle</th>
                <th style="text-align: center;">Cant.</th>
                <th style="text-align: right;">P. Unit</th>
                <th style="text-align: right;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${trackedOrder.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">S/. ${item.price.toFixed(2)}</td>
                  <td style="text-align: right;">S/. ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>Op. Gravada (Subtotal): <strong>S/. ${subtotal.toFixed(2)}</strong></div>
            <div>I.G.V. (18%): <strong>S/. ${igv.toFixed(2)}</strong></div>
            <div class="grand-total">TOTAL PAGADO: S/. ${trackedOrder.totalAmount.toFixed(2)}</div>
          </div>

          <div class="footer">
            <p>¡Gracias por tu preferencia! Conserva este comprobante para el recojo o recepción de tus productos.</p>
            <p>Flikicookie Cusco — Calidad Artesanal 100% Orgánica</p>
          </div>

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const statuses: OrderStatus[] = [
    "Pendiente",
    "En Preparación",
    "En Horno",
    "Decorando",
    "Listo",
    "Entregado"
  ];

  const getStatusIndex = (current: OrderStatus) => {
    return statuses.indexOf(current);
  };

  const getStatusMessage = (status: OrderStatus) => {
    switch (status) {
      case "Pendiente":
        return "Tu pedido fue registrado con éxito. Nuestro maestro galletero está por validar la receta y relleno.";
      case "En Preparación":
        return "¡Comenzó la magia! Estamos pesando la masa y preparando los rellenos seleccionados.";
      case "En Horno":
        return "Las galletas ya están en el horno. Cociéndose con cuidado a temperatura constante. ¡Huele de maravilla!";
      case "Decorando":
        return "¡Etapa de detalles! El chef repostero está aplicando la cobertura, los toppings y tu dedicatoria especial.";
      case "Listo":
        return "¡Perfección lograda! Tu pedido está en vitrina listo para ser retirado o entregado.";
      case "Entregado":
        return "¡Gracias por preferir Flikicookie! Esperamos que disfrutes las mejores galletas de Cusco.";
      default:
        return "";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(price);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tracking Search Card */}
      <div className="bg-white border-2 border-art-accent p-8 rounded-xl shadow-md text-center space-y-5">
        <div className="text-4xl animate-bounce">📦🔍</div>
        <div className="space-y-2">
          <h3 className="font-serif font-bold text-art-text text-xl tracking-tight">Seguimiento en Tiempo Real</h3>
          <p className="text-art-muted text-sm font-medium">
            Ingresa tu código de pedido (ej: <strong>PED-1022</strong>) para ver en qué etapa de horneado y decoración está.
          </p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2.5 max-w-md mx-auto">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Escribe tu código PED-XXXX..."
            className="flex-1 bg-white border border-art-accent text-art-text text-sm px-4.5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-art-accent placeholder-art-muted font-mono tracking-wider text-center uppercase font-bold"
            id="tracking_input_id"
          />
          <button
            type="submit"
            className="bg-art-accent hover:bg-art-accent-hover active:scale-95 text-art-bg p-3 px-5 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 shrink-0 border border-art-accent shadow-sm"
            id="btn_track_submit"
          >
            <Search className="w-4 h-4" /> Consultar
          </button>
        </form>
      </div>

      {/* Tracking Result Screen */}
      {hasSearched && trackedOrder ? (
        <div className="bg-white border border-art-border rounded-lg p-6 shadow-xs space-y-6 animate-fade-in" id="tracking_result_card">
          
          {/* Status Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-art-accent pb-4 gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-art-muted uppercase tracking-wider">CÓDIGO DE ORDEN:</span>
              <h4 className="text-lg font-bold text-art-text mt-0.5 font-mono tracking-wide">
                {trackedOrder.id}
              </h4>
            </div>
            <div className="bg-art-accent/15 border border-art-accent/30 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-art-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-art-accent"></span>
              </span>
              <span className="text-sm font-bold text-art-accent uppercase tracking-wider">
                {trackedOrder.status}
              </span>
            </div>
          </div>

          {/* Sweet visual message block */}
          <div className="bg-art-panel-light border border-art-accent p-5 rounded-xl space-y-2 text-center">
            <span className="text-3xl">✨🎂🧑‍🍳</span>
            <p className="text-art-text text-sm font-bold leading-relaxed">
              {getStatusMessage(trackedOrder.status)}
            </p>
          </div>

          {/* Progress Timeline Pipeline */}
          <div className="space-y-4">
            <h5 className="text-[12px] uppercase font-bold text-[#5D4E37] tracking-wider">Línea del Tiempo de Cocina</h5>
            <div className="relative">
              {/* Main Line connecting pipeline */}
                <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-art-accent md:left-4 md:right-4 md:top-[15px] md:bottom-auto md:w-auto md:h-1"></div>

              {/* Steps container */}
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-2">
                {statuses.map((step, idx) => {
                  const currentIdx = getStatusIndex(trackedOrder.status);
                  const isCompleted = idx < currentIdx;
                  const isActive = idx === currentIdx;

                  return (
                    <div key={idx} className="flex md:flex-col items-center gap-4 md:gap-2 w-full md:w-1/6 text-left md:text-center">
                      {/* Circle dot indicator */}
                      <div
                        className={`w-8 h-8 rounded-full border-4 flex items-center justify-center font-bold text-xs shrink-0 transition-all duration-300 ${
                          isCompleted
                            ? "bg-[#E91E8C] border-[#E91E8C] text-white shadow-xs"
                            : isActive
                            ? "bg-white border-[#E91E8C] text-[#E91E8C] scale-110 shadow-xs animate-pulse"
                            : "bg-white border-[#E5A84B] text-[#5D4E37]"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                      </div>

                      {/* Step Labels */}
                      <div className="flex flex-col space-y-0.5">
                        <span className={`text-[12px] font-bold tracking-tight ${
                          isActive
                            ? "text-[#E91E8C] font-extrabold text-sm"
                            : isCompleted
                            ? "text-[#1A0F0A] font-bold"
                            : "text-[#5D4E37]"
                        }`}>
                          {step}
                        </span>
                        
                        <span className="text-[10px] text-[#5D4E37] font-semibold md:hidden block">
                          {isCompleted ? "Completado" : isActive ? "En este momento" : "Próximo paso"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Brief Summary summary */}
          <div className="border-t border-[#E5A84B] pt-5 space-y-4">
            <h5 className="text-[12px] uppercase font-bold text-[#5D4E37] tracking-wider">Resumen del Pedido</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-[#FAF2EB] p-4 rounded-xl space-y-2 text-[#1A0F0A] border border-[#E5A84B]/20">
                <p>📍 <strong>Modalidad:</strong> {trackedOrder.orderType}</p>
                <p>📅 <strong>Fecha Entrega:</strong> {trackedOrder.deliveryDate}</p>
                <p>⏰ <strong>Hora Pactada:</strong> {trackedOrder.deliveryTime} hrs</p>
                {trackedOrder.deliveryAddress && (
                  <p>🏠 <strong>Domicilio:</strong> {trackedOrder.deliveryAddress}</p>
                )}
              </div>

              <div className="border border-[#E5A84B] p-4 rounded-xl bg-white space-y-2.5">
                <p className="font-serif font-bold text-[#1A0F0A] border-b border-[#FAF2EB] pb-1.5">Productos:</p>
                <div className="space-y-1.5">
                  {trackedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-[#2D1F15] text-[12px] font-medium">
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="font-bold text-[#1A0F0A]">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[#FAF2EB] flex justify-between font-bold text-[#1A0F0A] text-[14px]">
                  <span>Total pagado:</span>
                  <span className="text-[#E91E8C] font-extrabold">{formatPrice(trackedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Action Buttons (Print Invoice & Enable Notifications) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF2EB] p-4 rounded-xl border border-[#E5A84B]">
            <button
              onClick={handlePrintBuyerInvoice}
              className="bg-[#1A0F0A] hover:bg-[#5D4E37] text-white font-serif font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer border border-[#1A0F0A]"
              id="btn_buyer_print_invoice"
            >
              <Printer className="w-4 h-4 text-[#E5A84B]" /> Imprimir Mi Comprobante / Factura
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleEnableNotifications}
                className={`font-serif font-bold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                  notificationsEnabled
                    ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                    : "bg-white border-[#E5A84B] text-[#1A0F0A] hover:bg-[#FAF2EB]"
                }`}
                id="btn_buyer_enable_notifications"
              >
                <Bell className={`w-4 h-4 ${notificationsEnabled ? "text-emerald-600 animate-bounce" : "text-art-accent"}`} />
                {notificationsEnabled ? "Alertas Activadas 🔔" : "Recibir Notificación de Estado"}
              </button>

              <a
                href={`https://wa.me/51984123456?text=${encodeURIComponent(`Hola Flikicookie, deseo consultar el estado de mi pedido ${trackedOrder.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20BA5C] text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>

          {/* Quick contact support */}
          <div className="text-center text-[10px] text-art-muted font-medium">
            ¿Necesitas realizar cambios en la entrega? Llámanos o envíanos un WhatsApp indicando tu código de orden.
          </div>
        </div>
      ) : hasSearched && historyOrders.length > 0 ? (
        <div className="bg-white border border-art-border rounded-lg p-6 shadow-xs space-y-4 animate-fade-in" id="buyer_history_list">
          <div className="flex items-center justify-between border-b border-art-border pb-3">
            <h4 className="font-serif font-bold text-sm text-art-text flex items-center gap-2">
              📜 Histórico de Órdenes de Compra ({historyOrders.length})
            </h4>
            <span className="text-[10px] bg-art-accent-5 text-art-border border border-art-border px-2 py-0.5 rounded font-bold">
              Cliente: {historyOrders[0]?.customerName}
            </span>
          </div>

          <div className="space-y-3">
            {historyOrders.map((histOrder) => (
              <div 
                key={histOrder.id}
                onClick={() => {
                  setTrackedOrder(histOrder);
                  setHistoryOrders([]);
                }}
                className="bg-[#FAF7F2] border border-[#D9C5B2] p-4 rounded-lg hover:border-art-accent hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-art-accent">{histOrder.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      histOrder.status === "Entregado" ? "bg-emerald-100 text-emerald-800" :
                      histOrder.status === "Listo" ? "bg-blue-100 text-blue-800" :
                      "bg-art-accent-5 text-art-accent-dark"
                    }`}>
                      {histOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-art-text font-medium">
                    📅 Fecha: {histOrder.deliveryDate} ({histOrder.deliveryTime} hrs) • {histOrder.orderType}
                  </p>
                  <p className="text-[11px] text-art-muted">
                    Insumos: {histOrder.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-serif font-bold text-sm text-art-text block">
                    {formatPrice(histOrder.totalAmount)}
                  </span>
                  <span className="text-[10px] text-art-accent font-bold hover:underline">
                    Ver Detalles & Imprimir Factura →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="bg-white border border-art-border rounded-lg p-8 text-center max-w-md mx-auto space-y-3 animate-fade-in" id="tracking_error_card">
          <div className="text-3xl animate-pulse">🕵️‍♀️🧁❌</div>
          <h4 className="font-serif font-bold text-art-text text-base">Código de pedido no encontrado</h4>
          <p className="text-art-muted text-xs leading-relaxed">
            Asegúrate de buscar por código de orden (ej. <strong>PED-1022</strong>), o por tu número de teléfono / correo registrado.
          </p>
        </div>
      ) : null}

    </div>
  );
}
