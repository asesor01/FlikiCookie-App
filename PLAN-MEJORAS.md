# Plan de Mejoras - FlikiCookie Admin Dashboard

## 📋 Prioridad de Implementación

### Fase 1: Flujo de Caja (FAácil)
**Objetivo:** Registrar ingresos, egresos y ver balance

### Fase 2: Facturación con Impuestos (Media)
**Objetivo:** Clasificar facturas según plan de impuestos local

### Fase 3: Costo Real por Producto (Media-Alta)
**Objetivo:** Calcular costo real incluyendo mano de obra y delivery

### Fase 4: Depreciación de Equipos (Alta)
**Objetivo:** Estimar vida útil y costo por uso de equipos

### Fase 5: Reporte AI de Análisis (Alta)
**Objetivo:** Generar recomendaciones automáticas con Gemini AI

---

## 🎯 Fase 1: Flujo de Caja - Detalles

### Funcionalidades:
1. **Registrar Ingresos**
   - Ventas de productos
   - Otros ingresos
   - Fecha, monto, concepto, categoría

2. **Registrar Egresos**
   - Materia prima
   - Mano de obra
   - Servicios (luz, agua, etc.)
   - Equipos
   - Delivery
   - Otros

3. **Dashboard de Flujo**
   - Balance del día
   - Balance de la semana
   - Balance del mes
   - Gráficos de tendencia

4. **Exportar**
   - PDF para impresión
   - CSV para Excel

### Archivos a modificar:
- `src/types.ts` - Agregar tipos de transacciones
- `src/components/AdminDashboard.tsx` - Agregar pestaña "Flujo de Caja"

### Estructura de datos:
```typescript
interface CashFlowTransaction {
  id: string;
  date: string;
  type: 'ingreso' | 'egreso';
  amount: number;
  category: string;
  description: string;
  reference?: string; // Número de factura o comprobante
}
```

### Categorías de egresos:
- Materia Prima
- Mano de Obra Fija
- Mano de Obra Temporal
- Servicios (Luz, Agua, Internet)
- Alquiler
- Equipos
- Delivery
- Marketing
- Impuestos
- Otros

### Categorías de ingresos:
- Ventas Directas
- Pedidos Online
- Delivery
- Otros
