// ============================================
// ASESOR DE NEGOCIOS IA — Flikicookie Artisan Bakery
// Skill de comportamiento de Analista Senior
// ============================================

export interface BusinessData {
  orders: Array<{
    id: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    orderType: string;
  }>;
  cashFlow: Array<{
    id: string;
    date: string;
    type: 'ingreso' | 'egreso';
    amount: number;
    category: string;
    description: string;
  }>;
  rawMaterials: Array<{
    id: string;
    name: string;
    unit: string;
    stock: number;
    criticalLimit: number;
    category: string;
  }>;
  clients: Array<{
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  providers: Array<{
    id: string;
    name: string;
    suppliedItems: string[];
  }>;
  menuItems: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
  }>;
  reviews: Array<{
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    product?: string;
    verified: boolean;
  }>;
  communications: Array<{
    id: string;
    channel: string;
    from: string;
    to: string;
    content: string;
    timestamp: string;
    status: string;
    type: 'inbound' | 'outbound';
  }>;
  faqItems: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
  }>;
}

export interface ReportSection {
  title: string;
  icon: string;
  content: string;
  metrics?: { label: string; value: string; trend?: 'up' | 'down' | 'neutral' }[];
  recommendations?: string[];
}

export interface BusinessReport {
  id: string;
  generatedAt: string;
  period: string;
  executive_summary: string;
  sections: ReportSection[];
  risk_alerts: string[];
  opportunities: string[];
  action_plan: string[];
}

// ============================================
// FORMATO DE PRESENTACIÓN DEL INFORME
// ============================================
export const REPORT_FORMAT = {
  title: "INFORME ESTRATÉGICO DE NEGOCIO",
  subtitle: "Flikicookie Artisan Bakery — Análisis Integral",
  sections: [
    "1. Resumen Ejecutivo",
    "2. Análisis Financiero (Flujo de Caja)",
    "3. Estado de Inventario y Cadena de Suministro",
    "4. Análisis de Clientes y Ventas",
    "5. Rendimiento del Catálogo de Productos",
    "6. Alertas y Riesgos Identificados",
    "7. Oportunidades de Crecimiento",
    "8. Plan de Acción Recomendado"
  ]
};

// ============================================
// COMPORTAMIENTO DEL ANALISTA
// ============================================
export const ANALYST_BEHAVIOR = {
  tone: "Profesional, directo, basado en datos. Usa terminología empresarial accesible.",
  approach: "Análisis cuantitativo + cualitativo. Siempre respalda recomendaciones con números.",
  priorities: [
    "Proteger el flujo de caja y la liquidez",
    "Maximizar la rentabilidad por producto",
    "Optimizar el inventario (reducir mermas)",
    "Fortalecer la relación con clientes clave",
    "Diversificar proveedores para reducir riesgo"
  ],
 禁忌: [
    "No dar recomendaciones sin respaldo de datos",
    "No ser genérico — todo debe ser específico para Flikicookie",
    "No ignorar alertas de inventario crítico",
    "No subestimar costos operativos"
  ]
};

// ============================================
// FUNCIÓN PARA GENERAR ANÁLISIS DE FLUJO DE CAJA
// ============================================
export function analyzeCashFlow(transactions: BusinessData['cashFlow']): ReportSection {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  
  const monthTransactions = transactions.filter(t => t.date >= monthStart);
  const income = monthTransactions.filter(t => t.type === 'ingreso');
  const expenses = monthTransactions.filter(t => t.type === 'egreso');
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? ((netFlow / totalIncome) * 100).toFixed(1) : '0';
  
  // Gastos por categoría
  const expenseByCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topExpense = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
  
  const recommendations: string[] = [];
  if (parseFloat(margin) < 20) {
    recommendations.push("⚠️ Margen neto bajo (" + margin + "%). Revisar precios de venta o reducir costos de materia prima.");
  }
  if (totalExpenses > totalIncome * 0.8) {
    recommendations.push("🔴 Los gastos superan el 80% de los ingresos. Considerar reducción de costos operativos.");
  }
  if (topExpense && topExpense[1] > totalExpenses * 0.4) {
    recommendations.push("📊 La categoría '" + topExpense[0] + "' concentra el " + ((topExpense[1] / totalExpenses) * 100).toFixed(0) + "% de los gastos. Evaluar alternativas.");
  }
  if (netFlow > 0) {
    recommendations.push("✅ Flujo de caja positivo. Considerar reinvertir en expansión o reservas de liquidez.");
  }
  
  return {
    title: "Análisis Financiero — Flujo de Caja",
    icon: "💰",
    content: `En el mes actual se registraron S/. ${totalIncome.toFixed(2)} en ingresos y S/. ${totalExpenses.toFixed(2)} en gastos, resultando en un flujo neto de S/. ${netFlow.toFixed(2)} con un margen del ${margin}%.`,
    metrics: [
      { label: "Ingresos del Mes", value: `S/. ${totalIncome.toFixed(2)}`, trend: 'up' },
      { label: "Gastos del Mes", value: `S/. ${totalExpenses.toFixed(2)}`, trend: 'down' },
      { label: "Flujo Neto", value: `S/. ${netFlow.toFixed(2)}`, trend: netFlow >= 0 ? 'up' : 'down' },
      { label: "Margen Neto", value: `${margin}%`, trend: parseFloat(margin) >= 20 ? 'up' : 'down' }
    ],
    recommendations
  };
}

// ============================================
// FUNCIÓN PARA ANALIZAR INVENTARIO
// ============================================
export function analyzeInventory(materials: BusinessData['rawMaterials']): ReportSection {
  const critical = materials.filter(m => m.stock <= m.criticalLimit);
  const warning = materials.filter(m => m.stock > m.criticalLimit && m.stock <= m.criticalLimit * 1.5);
  const healthy = materials.filter(m => m.stock > m.criticalLimit * 1.5);
  
  const recommendations: string[] = [];
  if (critical.length > 0) {
    recommendations.push("🔴 CRÍTICO: " + critical.map(m => m.name).join(", ") + " — Requieren reposición URGENTE.");
  }
  if (warning.length > 0) {
    recommendations.push("🟡 ALERTA: " + warning.map(m => m.name).join(", ") + " — Stock próximo al límite crítico.");
  }
  if (critical.length === 0 && warning.length === 0) {
    recommendations.push("✅ Todos los materiales están en niveles saludables.");
  }
  
  return {
    title: "Estado de Inventario y Cadena de Suministro",
    icon: "📦",
    content: `Se monitorean ${materials.length} materias primas. ${critical.length} en estado crítico, ${warning.length} en alerta, ${healthy.length} saludables.`,
    metrics: [
      { label: "Materiales Totales", value: `${materials.length}`, trend: 'neutral' },
      { label: "Críticos", value: `${critical.length}`, trend: critical.length > 0 ? 'down' : 'up' },
      { label: "En Alerta", value: `${warning.length}`, trend: warning.length > 0 ? 'down' : 'up' },
      { label: "Saludables", value: `${healthy.length}`, trend: 'up' }
    ],
    recommendations
  };
}

// ============================================
// FUNCIÓN PARA ANALIZAR CLIENTES
// ============================================
export function analyzeClients(clients: BusinessData['clients']): ReportSection {
  const totalClients = clients.length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0;
  
  // Top 3 clientes
  const topClients = [...clients].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)).slice(0, 3);
  const top3Revenue = topClients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const concentration = totalRevenue > 0 ? ((top3Revenue / totalRevenue) * 100).toFixed(1) : '0';
  
  const recommendations: string[] = [];
  if (parseFloat(concentration) > 60) {
    recommendations.push("⚠️ Alta concentración de ingresos: el " + concentration + "% proviene de 3 clientes. Riesgo de dependencia.");
  }
  if (totalClients < 10) {
    recommendations.push("📈 Base de clientes pequeña (" + totalClients + "). Implementar estrategia de captación.");
  }
  if (avgRevenuePerClient < 100) {
    recommendations.push("💡 Ingreso promedio por cliente bajo (S/. " + avgRevenuePerClient.toFixed(2) + "). Considerar upselling o bundles.");
  }
  
  return {
    title: "Análisis de Clientes y Ventas",
    icon: "👥",
    content: `Base de ${totalClients} clientes con un ingreso promedio de S/. ${avgRevenuePerClient.toFixed(2)} por cliente. Los 3 mejores clientes representan el ${concentration}% de los ingresos totales.`,
    metrics: [
      { label: "Total Clientes", value: `${totalClients}`, trend: 'up' },
      { label: "Ingreso Promedio/Cliente", value: `S/. ${avgRevenuePerClient.toFixed(2)}`, trend: 'neutral' },
      { label: "Concentración Top 3", value: `${concentration}%`, trend: parseFloat(concentration) > 60 ? 'down' : 'up' },
      { label: "Ingreso Total Clientes", value: `S/. ${totalRevenue.toFixed(2)}`, trend: 'up' }
    ],
    recommendations
  };
}

// ============================================
// FUNCIÓN PARA ANALIZAR CATÁLOGO
// ============================================
export function analyzeCatalog(menuItems: BusinessData['menuItems']): ReportSection {
  const totalProducts = menuItems.length;
  const categories = menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgPrice = totalProducts > 0 
    ? menuItems.reduce((sum, item) => sum + item.price, 0) / totalProducts 
    : 0;
  
  const recommendations: string[] = [];
  if (totalProducts < 8) {
    recommendations.push("📋 Catálogo limitado (" + totalProducts + " productos). Considerar nuevas variedades estacionales.");
  }
  if (Object.keys(categories).length < 3) {
    recommendations.push("🏷️ Pocas categorías. Diversificar para captar diferentes segmentos de clientes.");
  }
  if (avgPrice < 15) {
    recommendations.push("💰 Ticket promedio bajo (S/. " + avgPrice.toFixed(2) + "). Evaluar incluir productos premium.");
  }
  
  return {
    title: "Rendimiento del Catálogo de Productos",
    icon: "🍪",
    content: `El catálogo contiene ${totalProducts} productos distribuidos en ${Object.keys(categories).length} categorías, con un precio promedio de S/. ${avgPrice.toFixed(2)}.`,
    metrics: [
      { label: "Total Productos", value: `${totalProducts}`, trend: 'up' },
      { label: "Categorías", value: `${Object.keys(categories).length}`, trend: 'neutral' },
      { label: "Precio Promedio", value: `S/. ${avgPrice.toFixed(2)}`, trend: 'neutral' }
    ],
    recommendations
  };
}

// ============================================
// FUNCIÓN PARA ANALIZAR OPINIONES/REVIEWS
// ============================================
export function analyzeReviews(reviews: BusinessData['reviews']): ReportSection {
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) 
    : "0.0";
  const positiveReviews = reviews.filter(r => r.rating >= 4).length;
  const negativeReviews = reviews.filter(r => r.rating <= 2).length;
  const verifiedReviews = reviews.filter(r => r.verified).length;
  
  // Productos más reseñados
  const productReviews = reviews.reduce((acc, r) => {
    if (r.product) {
      acc[r.product] = (acc[r.product] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topProduct = Object.entries(productReviews).sort((a, b) => b[1] - a[1])[0];
  
  const recommendations: string[] = [];
  if (parseFloat(avgRating) < 4.0) {
    recommendations.push("⚠️ Calificación promedio baja (" + avgRating + "). Revisar calidad de productos y servicio.");
  }
  if (negativeReviews > totalReviews * 0.2) {
    recommendations.push("🔴 Alto porcentaje de reseñas negativas (" + ((negativeReviews / totalReviews) * 100).toFixed(0) + "%). Investigar causas específicas.");
  }
  if (verifiedReviews < totalReviews * 0.5) {
    recommendations.push("📋 Solo el " + ((verifiedReviews / totalReviews) * 100).toFixed(0) + "% de reseñas son verificadas. Implementar sistema de verificación de compra.");
  }
  if (parseFloat(avgRating) >= 4.5) {
    recommendations.push("✅ Excelente calificación promedio (" + avgRating + "). Mantener estándares de calidad.");
  }
  if (topProduct) {
    recommendations.push("🏆 Producto más reseñado: " + topProduct[0] + " (" + topProduct[1] + " opiniones). Potenciar marketing de este producto.");
  }
  
  return {
    title: "Análisis de Opiniones y Reputación",
    icon: "⭐",
    content: `Se analizaron ${totalReviews} opiniones con una calificación promedio de ${avgRating}/5. El ${((positiveReviews / totalReviews) * 100).toFixed(0)}% son positivas (4-5 estrellas).`,
    metrics: [
      { label: "Total Reseñas", value: `${totalReviews}`, trend: 'up' },
      { label: "Calificación Promedio", value: `${avgRating}/5`, trend: parseFloat(avgRating) >= 4 ? 'up' : 'down' },
      { label: "Reseñas Positivas", value: `${((positiveReviews / totalReviews) * 100).toFixed(0)}%`, trend: 'up' },
      { label: "Reseñas Verificadas", value: `${verifiedReviews}`, trend: 'neutral' }
    ],
    recommendations
  };
}

// ============================================
// FUNCIÓN PARA ANALIZAR COMUNICACIONES
// ============================================
export function analyzeCommunications(communications: BusinessData['communications']): ReportSection {
  const totalComm = communications.length;
  const inbound = communications.filter(c => c.type === 'inbound').length;
  const outbound = communications.filter(c => c.type === 'outbound').length;
  const responseRate = totalComm > 0 ? ((outbound / inbound) * 100).toFixed(0) : '0';
  
  // Canales más usados
  const channelUsage = communications.reduce((acc, c) => {
    acc[c.channel] = (acc[c.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topChannel = Object.entries(channelUsage).sort((a, b) => b[1] - a[1])[0];
  
  const recommendations: string[] = [];
  if (parseInt(responseRate) < 80) {
    recommendations.push("⚠️ Tasa de respuesta baja (" + responseRate + "%). Mejorar tiempo de respuesta al cliente.");
  }
  if (inbound > outbound * 1.5) {
    recommendations.push("📨 Alta demanda de mensajes entrantes (" + inbound + ") vs salientes (" + outbound + "). Considerar más auto-respuestas.");
  }
  if (topChannel) {
    recommendations.push("📱 Canal principal: " + topChannel[0] + " (" + topChannel[1] + " mensajes). Optimizar atención en ese canal.");
  }
  if (totalComm === 0) {
    recommendations.push("📊 Sin datos de comunicación. Implementar seguimiento de interacciones con clientes.");
  }
  
  return {
    title: "Análisis de Comunicaciones y Atención al Cliente",
    icon: "💬",
    content: `Se registraron ${totalComm} comunicaciones: ${inbound} entrantes y ${outbound} salientes. Tasa de respuesta: ${responseRate}%.`,
    metrics: [
      { label: "Total Comunicaciones", value: `${totalComm}`, trend: 'up' },
      { label: "Mensajes Entrantes", value: `${inbound}`, trend: 'neutral' },
      { label: "Mensajes Salientes", value: `${outbound}`, trend: 'neutral' },
      { label: "Tasa de Respuesta", value: `${responseRate}%`, trend: parseInt(responseRate) >= 80 ? 'up' : 'down' }
    ],
    recommendations
  };
}

// ============================================
// FUNCIÓN PARA GENERAR INFORME COMPLETO
// ============================================
export function generateBusinessReport(data: BusinessData): BusinessReport {
  const cashFlowSection = analyzeCashFlow(data.cashFlow);
  const inventorySection = analyzeInventory(data.rawMaterials);
  const clientsSection = analyzeClients(data.clients);
  const catalogSection = analyzeCatalog(data.menuItems);
  
  const allRecommendations = [
    ...cashFlowSection.recommendations || [],
    ...inventorySection.recommendations || [],
    ...clientsSection.recommendations || [],
    ...catalogSection.recommendations || []
  ];
  
  const riskAlerts = allRecommendations.filter(r => r.startsWith("🔴") || r.startsWith("⚠️"));
  const opportunities = allRecommendations.filter(r => r.startsWith("📈") || r.startsWith("💡") || r.startsWith("📋"));
  const positives = allRecommendations.filter(r => r.startsWith("✅"));
  
  const now = new Date();
  const period = `${now.toLocaleString('es-PE', { month: 'long', year: 'numeric' })}`;
  
  // Resumen ejecutivo
  const totalIncome = data.cashFlow.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = data.cashFlow.filter(t => t.type === 'egreso').reduce((sum, t) => sum + t.amount, 0);
  const criticalMaterials = data.rawMaterials.filter(m => m.stock <= m.criticalLimit);
  
  const executiveSummary = `
Flikicookie Artisan Bakery presenta un desempeño operativo para el periodo de ${period}:

• Flujo de caja: Ingresos de S/. ${totalIncome.toFixed(2)} vs Egresos de S/. ${totalExpenses.toFixed(2)} (Neto: S/. ${(totalIncome - totalExpenses).toFixed(2)})
• Inventario: ${criticalMaterials.length} materias primas en estado crítico requieren atención inmediata
• Base de clientes: ${data.clients.length} clientes activos
• Catálogo: ${data.menuItems.length} productos en ${[...new Set(data.menuItems.map(i => i.category))].length} categorías

${riskAlerts.length > 0 ? `Se identificaron ${riskAlerts.length} alertas de riesgo que requieren acción inmediata.` : 'No se identificaron riesgos críticos en el periodo analizado.'}
  `.trim();
  
  // Plan de acción
  const actionPlan: string[] = [];
  if (criticalMaterials.length > 0) {
    actionPlan.push("1. [URGENTE] Gestionar reposición de materiales críticos: " + criticalMaterials.map(m => m.name).join(", "));
  }
  if (riskAlerts.length > 0) {
    actionPlan.push(`${actionPlan.length + 1}. [ALTA] Revisar y mitigar alertas de riesgo identificadas`);
  }
  actionPlan.push(`${actionPlan.length + 1}. [MEDIA] Analizar tendencias de ventas para ajustar producción`);
  actionPlan.push(`${actionPlan.length + 1}. [MEDIA] Evaluar renegotiación con proveedores de mayor gasto`);
  actionPlan.push(`${actionPlan.length + 1}. [BAJA] Implementar programa de fidelización para clientes frecuentes`);
  
  return {
    id: `report-${Date.now()}`,
    generatedAt: now.toISOString(),
    period,
    executive_summary: executiveSummary,
    sections: [cashFlowSection, inventorySection, clientsSection, catalogSection],
    risk_alerts: riskAlerts,
    opportunities: [...opportunities, ...positives],
    action_plan: actionPlan
  };
}

// ============================================
// RESPUESTAS DEL CONSULTOR (para el chat)
// ============================================
export const CONSULTOR_RESPONSES: Record<string, string> = {
  "flujo de caja": "El flujo de caja es el indicador vital de tu negocio. Un margen neto saludable está por encima del 20%. Si tus gastos superan el 80% de tus ingresos, necesitas采取 medidas urgentes para reducir costos operativos.",
  "inventario": "Un inventario bien管理 es clave. Los materiales por debajo del límite crítico deben reposarse en máximo 48 horas. Las materias en 'alerta' deben monitorearse diariamente.",
  "clientes": "La concentración de ingresos en pocos clientes es un riesgo. Idealmente, ningún cliente debería representar más del 20% de tus ingresos totales.",
  "proveedores": "Diversificar proveedores reduce el riesgo de desabastecimiento. Negocia al menos 2 alternativas por cada materia prima crítica.",
  "precios": "Revisa tus precios cada trimestre. Los costos de materia prima fluctúan y los precios de venta deben ajustarse para mantener márgenes saludables.",
  "default": "Puedo ayudarte a analizar diferentes aspectos de tu negocio: flujo de caja, inventario, clientes, proveedores, precios, o estrategias de crecimiento. ¿Qué tema te interesa?"
};
