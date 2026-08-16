# Skill: Bakery Project Bootstrap

## Objetivo
Permitir a un agente (o a un desarrollador) generar y configurar todo el proyecto de una pastelería a partir de una plantilla, de forma que al añadir el logo y ajustar un color token, el proyecto arranque sin fallas y siga la identidad de marca (FlikiCookie-style). El Skill es genérico y aplicable a cualquier pastelería.

## Resultados esperados
- Proyecto listo para `npm run dev` sin errores de parse o falta de dependencias.
- Archivos de marca actualizados: `src/index.css`, `src/assets/images/Emblema ...`, imports y hero text con nombre de marca proporcionado.
- Tokens de color sincronizados con el logo: `--color-art-*`.

## Requisitos
- Archivo `logo` (PNG/SVG) listo para colocar en `src/assets/images/`.
- Node + npm instalados.

## Pasos resumidos
1. Copiar logo a `src/assets/images/Emblema Flikicookie.png`.
2. Ejecutar script de extracción de muestras de color desde el logo (opcional) para sugerir tokens.
3. Actualizar `src/index.css` con tokens de marca (si no existen).
4. Reemplazar `siteTitle`, `brandName` y `heroText` en `src` (asegurar `FlikiCookie` con capital C si se requiere).
5. Reemplazar las referencias de imagen encoded por imports ES.
6. Ejecutar `npm install` y `npm run dev` y comprobar que la app carga.

## Automatización propuesta
- Script `scripts/generate-bakery.js` que:
  - Copia el logo al directorio correcto.
  - Valida formato y dimensiones.
  - Actualiza `src/index.css` con tokens básicos si faltan.
  - Ejecuta `node scripts/hex-cleanup.js --apply --report ...` para asegurar consistencia de colores.
  - Corre `npm run lint` y `npm run dev` (o reporta errores y sugerencias para corregirlos).

## Buenas prácticas y comprobaciones
- Mantener hero text exacto si el proyecto lo exige.
- Hacer commit de cambios en branch `feat/bootstrap-<brand>`.
- Ejecutar pruebas visuales (manual) en breakpoints: mobile, md, desktop.

## Uso del Skill
- El agente puede leer `skills/project-bootstrap.skill.md` y ejecutar los scripts mencionados en orden. Si se integra en un agente automatizado, debe solicitar al usuario: `brandName`, `logoPath`, y si quiere un run `--simulate` o `--apply`.

---
Archivo creado en `skills/project-bootstrap.skill.md`.
