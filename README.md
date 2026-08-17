<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/db972eaf-45bb-4f37-bd51-96a8762cd16b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Configuración de Preguntas Frecuentes y Respuestas Rápidas
- **FAQ públicas (vista Support):** se leen de `localStorage flikicookie_faq` (formato `[{id, question, answer, category}]`) y se editan desde el admin con el modo edición (`isEditing`).
- **Respuestas Rápidas del sidebar:** se leen de `localStorage flikicookie_quick_responses` (formato `[{id, label, text}]`); ahora se despliegan en acordeón con botón interno "?? Copiar".
