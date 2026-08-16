================================================================================
                    FLIKICOOKIE, ARTISAN BAKERY PLATFORM
                Manual de Instalación, Configuración y Arquitectura
================================================================================

Bienvenido a Flikicookie Artisan Bakery, una solución full-stack interactiva de
alta repostería y panadería que fusiona una interfaz de usuario sofisticada, un
configurador visual de pasteles en tiempo real, un chat de asistencia culinaria 
con IA (Google Gemini), y un potente panel de administración y logística de taller.

Este archivo documenta la organización física, la estructura de directorios,
los requerimientos del sistema y los detalles de los componentes del software.

--------------------------------------------------------------------------------
1. ESTRUCTURA COMPLETA DEL DIRECTORIO
--------------------------------------------------------------------------------

A continuación se detalla el árbol de directorios del proyecto Flikicookie:

/ (Raíz del Proyecto)
├── .env.example                 # Plantilla para definición de variables de entorno (Gemini API Key)
├── .gitignore                   # Lista de exclusiones para el control de versiones
├── INFORME_TECNICO.md           # Informe técnico exhaustivo de procesos comerciales y administrativos
├── README.txt                   # Este manual técnico e instructivo de operación
├── bun.lock                     # Archivo de bloqueo de dependencias (para entornos que usen Bun)
├── firebase-blueprint.json      # Esquema documental oficial para bases de datos Firestore
├── index.html                   # Punto de entrada HTML principal del navegador web
├── metadata.json                # Metadatos del contenedor de la aplicación y permisos del iFrame
├── package.json                 # Definición de scripts del sistema y dependencias de NPM
├── server.ts                    # Servidor backend Express con middleware Vite y API Proxy
├── tsconfig.json                # Configuración global del compilador de TypeScript
├── vite.config.ts               # Configuración del empaquetador y compilador Vite
│
├── assets/                      # Carpeta para recursos estáticos del servidor o compilación
│
└── src/                         # Código fuente de la aplicación (Frontend React)
    ├── App.tsx                  # Componente raíz del cliente y gestor principal de estados
    ├── data.ts                  # Base de datos local y semilla inicial (10 productos + 10 pedidos)
    ├── index.css                # Estilo global con importación nativa de Tailwind CSS
    ├── main.tsx                 # Archivo de inicialización y montaje del DOM de React
    ├── types.ts                 # Modelos, contratos de datos e interfaces TypeScript compartidas
    │
    ├── assets/                  # Recursos gráficos y multimedia del frontend
    │   └── images/              # Imágenes en alta definición (banner promocional Flikicookie)
    │
    └── components/              # Componentes de interfaz de usuario de granularidad fina
        ├── AIKitchenChat.tsx    # Interfaz del chat interactivo con el Chef de IA (Gemini API)
        ├── AdminDashboard.tsx   # Panel administrativo completo con informes, KPI, Arqueo de Caja y Kanban
        ├── CakeVisualizer.tsx   # Diseñador y renderizador dinámico SVG de pasteles multicapa
        ├── Catalog.tsx          # Catálogo premium con banner promocional de temporada e insumos Cusco
        └── OrderTracking.tsx    # Pipeline visual de despacho y seguimiento para el cliente

--------------------------------------------------------------------------------
2. MEJORAS DE PROCESOS Y CARACTERÍSTICAS AÑADIDAS
--------------------------------------------------------------------------------

* PROCESO COMERCIAL (CLIENTE / VENTA):
  - Banner Promocional de Temporada: Banner con estética de tonos cremosos artesanal.
  - Motor de Cupones de Descuento: Aplicación en tiempo real del código 'TEMPORADA20' (-20% OFF).
  - Selección de Comprobantes SUNAT: Elección entre Boleta de Venta o Factura Electrónica (con RUC de 11 dígitos y Razón Social).
  - Vista de Factura Imprimible para el Comprador: Impresión inmediata de factura/comprobante oficial directamente desde el estado de seguimiento del cliente.
  - Listado de Histórico de Órdenes de Compra: Búsqueda flexible por código de orden, teléfono, correo o nombre para desplegar todo el historial del comprador.
  - Notificaciones de Status de Orden: Suscripción a notificaciones Push en el navegador y enlace directo con 1-clic para consultas/alertas por WhatsApp.
  - Registro de Referencia de Pago: Campo para N° de operación de Yape, Plin, Transferencia o Tarjeta.
  - Alérgenos y Horarios: Transparencia total de insumos y selección pactada de fecha y hora.

* PROCESO ADMINISTRATIVO Y OPERATIVO (ADMIN / TALLER):
  - Desplegable de Histórico & Notas CRM en Tabla de Clientes: Botón '▼ Desplegar Histórico & Notas' en el listado de clientes que expande al instante todos sus pedidos históricos realizados, notas de atención, comprobantes e ingreso de notas rápidas.
  - Cambio de Clave de Administrador: Módulo de seguridad en ⚙️ Configuración para actualizar la contraseña de acceso al panel (por defecto 'admin123') con almacenamiento seguro en `localStorage`.
  - Histórico de Órdenes de Compra a Proveedores (Pestaña Dedicada): Emisión, seguimiento operativo (Borrador, Enviado, En Tránsito, Recibido), control de pago e impresión de órdenes de insumos (harinas, chocolates, empaques).
  - Bitácora de Conversaciones & CRM con Clientes: Registro cronológico de notas de atención (WhatsApp, llamadas, presencial) para gestionar alergias, preferencias y acuerdos de entrega.
  - Notificación de Estado por WhatsApp (1-Clic): Generador automático de mensajes personalizados de actualización de estado para enviar directamente al cliente.
  - Arqueo de Caja y Cuadre Diario: Desglose automatizado en vivo por canal de cobro (Efectivo, Yape/Plin/Transferencias, Tarjetas POS, Crypto) e impresión física de cuadre de turno.
  - Buscador de Pedidos & Filtro Kanban: Localización instantánea de cualquier cliente o ID en la mesa de trabajo.
  - Exportación de Datos a Excel (CSV): Generación de reportes tabulares descargables con BOM/UTF-8 para contabilidad.
  - Co-piloto de Taller con IA Gemini: Optimización del orden de horneado, insumos necesarios y avisos de alérgenos.
  - Alertas Sonoras y Push de Navegador: Sintetizador Web Audio API que emite un timbre armónico y notificaciones push al ingresar pedidos.

--------------------------------------------------------------------------------
3. PREGUNTA TÉCNICA: ¿FUNCIONA EN OTRA PC DESDE OTRA CIUDAD SI LA DB ESTÁ EN MI PC?
--------------------------------------------------------------------------------

RESPUESTA TÉCNICA Y ARQUITECTÓNICA:
Actualmente, los datos de pedidos, clientes e inventario se almacenan en el
almacenamiento local del navegador (`localStorage`) o la memoria local del servidor.

Si ejecuta la aplicación en otra computadora desde otra ciudad:
1. SI SOLO ABRE EL PROGRAMA EN OTRA PC: Se abrirá con los datos iniciales por defecto, 
   ya que el almacenamiento `localStorage` es independiente en cada navegador/computadora.
2. PARA QUE FUNCIONE SINCRONIZADO DESDE CUALQUIER PC Y CIUDAD:
   El proyecto incluye un esquema listo `firebase-blueprint.json` para conectar una
   base de datos remota en la nube (Google Firebase Firestore). Al activar Firebase,
   todos los datos (pedidos, clientes, notas y órdenes de compra) se sincronizan en 
   tiempo real en la nube, permitiendo que usted opere desde Cusco, Lima o cualquier
   parte del mundo en tiempo real con datos 100% actualizados.


--------------------------------------------------------------------------------
3. INSTRUCCIONES DE EJECUCIÓN E INSTALACIÓN
--------------------------------------------------------------------------------

1. Instalar dependencias requeridas:
   ```bash
   npm install
   ```

2. Configurar la clave secreta de Gemini:
   Cree un archivo `.env` copiando el ejemplo e ingrese su clave:
   ```env
   GEMINI_API_KEY=tu_clave_de_google_ai_studio_aqui
   ```

3. Iniciar el entorno en desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en http://localhost:3000

================================================================================
                    Flikicookie Artisan Bakery © 2026
================================================================================
