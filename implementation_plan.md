# Plan de Mejora de Legibilidad y Branding para Flikicookie

Este plan tiene como objetivo optimizar la legibilidad y aplicar la paleta de colores del logo de Flikicookie/ChikiCookie (Rosa/Fucsia `#E91E8C` y Oro `#E5A84B`) en todas las secciones comerciales y administrativas del sitio web, siguiendo la estética premium de la página de inicio.

## Cambios Propuestos

### 1. Sistema de Estilos y Tipografía
#### [MODIFY] [`src/index.css`](file:///c:/Personal/02_Proyectos/FlikiCookie-App/src/index.css)
- **Variables de Tema:** Actualizar los tokens de color globales en `@theme` para usar los colores de marca:
  - Fucsia de la marca (`#E91E8C`) para acentos.
  - Oro de la marca (`#E5A84B`) para bordes y acentos secundarios.
  - Crema de fondo (`#FDF8F3` / `#FAF2EB`) para contenedores.
  - Texto ultra oscuro (`#1A0F0A`) y gris oscuro (`#2D1F15`) para contraste máximo.
- **Tamaño de Letra Base:** Elevar el tamaño de letra general del `body` a `16px` (desde `15px`) para mejorar el escaneo visual.
- **Utilidades de Lectura:** Agrandar y oscurecer las clases `.text-readable`, `.text-readable-sm`, `.text-readable-xs` y redefinir las anulaciones de Tailwind (`.text-art-muted`, `.text-art-accent`, `.border-art-border`).
- **Anulaciones de Grises:** Agregar reglas específicas para que los elementos dentro de las vistas (`#view_designer`, `#view_catalog`, `#view_track`, `#view_faq`, `#admin_dashboard_root`) sustituyan los grises apagados (`text-slate-500`, `text-slate-400`) por tonalidades legibles de marrón/negro.

---

### 2. Diseñador de Pasteles (Designer Page)
#### [MODIFY] [`src/App.tsx`](file:///c:/Personal/02_Proyectos/FlikiCookie-App/src/App.tsx)
- **Formulario de Selección:** Cambiar el estilo de los botones de selección de Pisos, Sabores, Rellenos y Toppings:
  - Reemplazar el color ámbar (`amber-500`, `amber-600`) por el fucsia de la marca (`#E91E8C`) para la selección activa.
  - Reemplazar los bordes grises (`border-slate-200`) por bordes dorados suaves (`#C4A882`) o fucsias activos.
- **Textos de Control:** Incrementar los tamaños de los labels y descripciones de ingredientes, asegurando que utilicen marrón oscuro en lugar de gris.
- **Resumen y Compra:** Agrandar los textos de resumen en la barra de compra inferior.

---

### 3. Catálogo de Delicias (Catalog Page)
#### [MODIFY] [`src/components/Catalog.tsx`](file:///c:/Personal/02_Proyectos/FlikiCookie-App/src/components/Catalog.tsx)
- **Filtros de Categoría:** Usar el color fucsia de la marca (`#E91E8C`) en el botón de categoría activa, y un borde y fondo dorado suave en los inactivos.
- **Tarjetas de Producto:** 
  - Aumentar el tamaño del nombre del producto a `text-[17px]` o `text-lg` y usar tipografía serif con hover en fucsia.
  - Incrementar el tamaño de la descripción del producto a `text-[14px]` en color marrón oscuro `#2D1F15`.
  - Incrementar las etiquetas de alérgenos y tiempos de preparación para que se lean con facilidad.
  - Usar fucsia destacado en los precios de promoción y precios regulares.

---

### 4. Seguimiento de Pedidos (OrderTracking Page)
#### [MODIFY] [`src/components/OrderTracking.tsx`](file:///c:/Personal/02_Proyectos/FlikiCookie-App/src/components/OrderTracking.tsx)
- **Formulario de Búsqueda:** Hacer el input de código de pedido más grande, con bordes dorados e indicaciones claras en tipografía más oscura.
- **Línea de Tiempo:** Mejorar la visibilidad de los pasos del horneado:
  - Círculos de estado activo/completado con el color de marca fucsia y textos en negro intenso.
  - Leyendas de pasos del timeline con mayor contraste y peso de fuente.
- **Detalle de Comprobante:** Ajustar el resumen del pedido en la tarjeta de resultados con letras más grandes e imprimir ticket con mejor legibilidad.

---

### 5. Preguntas Frecuentes (FAQ Page)
#### [MODIFY] [`src/components/FAQPage.tsx`](file:///c:/Personal/02_Proyectos/FlikiCookie-App/src/components/FAQPage.tsx)
- **Tipografía y Tamaño:**
  - Agrandar las preguntas a `text-[16px]` o `text-base` en negrita (`font-bold`) y color `#1A0F0A`.
  - Aumentar el tamaño de las respuestas a `text-[14px]` o `text-sm` y usar un color marrón oscuro `#2D1F15` en lugar del gris `#6B5344`.
- **Banner de Contacto:** Reemplazar el fondo marrón plano `#8B5E3C` por un degradado premium de fucsia a dorado, y añadir bordes redondeados y tipografía nítida para los datos de WhatsApp/Email.

---

### 6. Panel Administrativo (AdminDashboard)
#### [MODIFY] [`src/components/AdminDashboard.tsx`](file:///c:/Personal/02_Proyectos/FlikiCookie-App/src/components/AdminDashboard.tsx)
- **Pantalla de Bloqueo (Acceso):**
  - Cambiar el botón principal y el input para usar el fucsia de la marca y bordes dorados.
  - Incrementar el contraste de la aclaración de la clave por defecto.
- **Tablas de Pedidos, Inventario y Clientes:**
  - Incrementar el tamaño de texto de las celdas a `text-[13px]` o `text-sm`.
  - Asegurar bordes divisorios más notorios (`#C4A882`).
  - Colorear los estados de los pedidos ("Listo", "En Horno", "Pendiente") con fondos más nítidos y texto oscuro legible.
- **Navegación del Panel:** Resaltar la pestaña seleccionada usando bordes inferiores fucsias más gruesos y tipografía en negrita sobre fondo crema suave.

---

## Plan de Verificación

### Pruebas Manuales
- **Visualización General:** Alternar entre las pestañas "Diseña tu Pastel", "Catálogo", "Sigue tu Pedido", "FAQ" y "Gestión Taller" para verificar que los colores de marca se vean nítidos y coherentes.
- **Prueba de Contraste:** Validar que los textos secundarios ya no se muestren en gris claro y sean perfectamente legibles en pantallas móviles y de escritorio.
- **Prueba del Diseñador:** Confirmar que al seleccionar pisos o ingredientes el estado activo sea claramente visible en color fucsia de la marca.
- **Prueba del Admin:** Ingresar al dashboard con `admin123` y corroborar que las tablas de pedidos y botones tengan una legibilidad mejorada.
