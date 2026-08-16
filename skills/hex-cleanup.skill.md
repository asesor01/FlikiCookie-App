# Skill: Hex Cleanup & Brand Tokenization (FlikiCookie)

## Propósito
Proveer a un agente (o a futuras ejecuciones automáticas) un conjunto reproducible de pasos, reglas y comandos para completar la "limpieza automática" de códigos hex en `src/**`, reemplazándolos por las variables/utility classes de marca ya definidas en `src/index.css` y completando tareas relacionadas (SVG stops, importación de emblema, generación de `cambios.yaml`, pruebas y despliegue local).

## Precauciones / Restricciones
- No introducir nuevos colores fuera de la paleta del logo: rosado fluorescente, caramelo/dorado y azul cielo. Usar exclusivamente los tokens existentes en `src/index.css`.
- No modificar el texto del hero ni la capitalización de la marca: "FlikiCookie".
- Evitar cambios en lógica de negocio. Solo tocar estilos (clases, variables, imports de imágenes) y strings de rutas.
- Hacer commits pequeños y atomizados; crear backup branch antes de correr.

## Requisitos previos
- Tener el repositorio clonado y dependencias instaladas (`npm install`).
- Node + npm/`npx` disponibles.
- `src/index.css` debe contener los tokens base: `--color-art-bg`, `--color-art-text`, `--color-art-accent`, `--color-art-border`, `--color-art-panel`, `--color-art-muted`.

## Resultado esperado
- Todos (o la mayoría) de los hex literales en `src/**` reemplazados por `var(--color-art-*)` o por utilidades (`bg-art-panel`, `text-art-text`, `border-art-border`, `bg-art-accent`, etc.).
- `cambios.yaml` actualizado con archivos modificados, resumen y counts.
- Emblema referenciado mediante imports ES en lugar de cadenas codificadas.
- Dev server arranca y la app carga sin errores de parsing JSX o dependencias faltantes.

## Mapeo de reglas (ejemplos)
- Fondos claros / paneles: `#FDF8F3`, `#FAF2EB` → `var(--color-art-panel)` / `bg-art-panel`
- Texto principal: oscuridad legible → `var(--color-art-text)` / `text-art-text`
- Acentos (botones, CTA): `rosado fluorescente` → `var(--color-art-accent)` / `bg-art-accent`
- Bordes / dorado-caramelo: `#E5A84B`, `#A67C52` → `var(--color-art-border)` / `border-art-border`
- Muted text: `#2D1F15` → `var(--color-art-muted)` / `text-art-muted`
- Azul bandeja repostera: mapear a `--color-art-accent` solo cuando se indique explícitamente; evitar usar azul para texto oscuro sobre fondo oscuro.

## Pasos del Skill (secuenciales)
1. Crear branch de trabajo: `git checkout -b feat/hex-cleanup-automated`.
2. Ejecutar búsqueda inicial para reportar cantidad de hexes:

```bash
npx -y --no-install grep "#[0-9A-Fa-f]{6}" -R src || true
# ó usar: rg "#[0-9A-Fa-f]{6}" src -n
```

3. Generar un listado (CSV/JSON) con matches y contexto (archivo, línea, match) para revisión rápida.

4. Aplicar reemplazos automáticos (por prioridad):
   - Reemplazos seguros en CSS, JSX, template literals: buscar patrones específicos y reemplazar por `var(...)` o clase. Ejemplo (pseudo):

```
replace /#FDF8F3/g => var(--color-art-panel)
replace /#E91E8C/g => var(--color-art-accent)
replace /#E5A84B/g => var(--color-art-border)
replace /#2D1F15/g => var(--color-art-muted)
```

Usar una herramienta de reemplazo que preserve contexto (eg. node script o `perl -0777 -pe`), y limitar a `src/**`.

5. Tratar SVGs con cuidado: buscar `stopColor="#..."` y `fill="#..."` dentro de `.svg` o componentes React. Reemplazar por `stopColor="var(--color-art-...)"` o por `fill="currentColor"` y aplicar `style={{ color: 'var(--color-art-...)' }}` en el componente padre.

6. Reemplazar rutas al emblema: buscar cadenas que contienen `Emblema%20Flikicookie.png` o similares y sustituir por un import ES.

Ejemplo patch:

```ts
import Emblema from '../assets/images/Emblema Flikicookie.png';
<img src={Emblema} alt="Emblema FlikiCookie" />
```

7. Ejecutar linter/TypeScript checker: `npm run lint` y corregir errores generados por cambios en archivos `.tsx` (por ejemplo, imports de imágenes: añadir `declare module '*.png'` si necesario).

8. Levantar servidor dev y comprobar carga: `npm run dev`.

9. Si aparecen errores de parsing JSX (adjacent JSX), abrir los archivos indicados y simplificar temporalmente JSX complejo o envolver elementos en fragments `<>...</>`.

10. Generar/actualizar `cambios.yaml` con archivos modificados, resumen y counts.

11. Ejecutar grep final para validar disminución de hex matches.

12. Hacer commit atómico y abrir PR o dejar en branch para revisión:

```bash
git add -A
git commit -m "chore: automated hex cleanup and tokenization"
git push --set-upstream origin feat/hex-cleanup-automated
```

## Comprobaciones automáticas y métricas
- Antes y después: contar matches `rg "#[0-9A-Fa-f]{6}" src | wc -l`.
- Asegurar que `npm run dev` no muestre overlay de Vite por errores de parse.

## Reglas de seguridad (rollback)
- Si más del 10% de archivos modificados rompen el build, revertir y aplicar cambios por lote manual.
- Mantener `cambios.yaml` actualizado para facilitar reversión por archivo.

## Sugerencias de implementación técnica (scripts)
- Crear `scripts/hex-cleanup.js` que:
  - Cargue `mapping.json` (pares hex→replacement)
  - Recorra `src/**` y aplique reemplazos con respaldo `.bak` para cada archivo
  - Genere reporte `reports/hex-cleanup-YYYYMMDD.json`

Comando de ejemplo para un run no destructivo (simulación):

```bash
node scripts/hex-cleanup.js --simulate --report reports/dryrun.json
```

Comando para ejecución real:

```bash
node scripts/hex-cleanup.js --apply --report reports/run-$(date +%F).json
```

## Artefactos finales
- `cambios.yaml` actualizado
- Branch `feat/hex-cleanup-automated` con commits atómicos
- `reports/hex-cleanup-*.json` con antes/después

## Contacto / Notas
- Mantener al tanto al revisor sobre decisiones de mapeo no triviales (ej. colores para gráficos o mapas de calor).

---
Este archivo está ubicado en `skills/hex-cleanup.skill.md` y puede ser ejecutado por otro agente o por mí cuando dispongas de más tiempo.
