# ProfeListo

Aplicación web educativa y gamificada para docentes de Enseñanza Media (1° a 4° Medio). Analiza 3 documentos en PDF (*Prueba de Ejemplo*, *Temario Oficial* y *Marco para la Buena Enseñanza*) para generar un camino de niveles con puntos de control, pistas pedagógicas estratégicas, insignias docentes y guardado 100 % local en el navegador (`localStorage` + `IndexedDB`).

## Requisitos y arranque rápido

- **Node.js 22+** (o usar directamente `Abrir ProfeListo.bat` en Windows)

```bash
npm install
npm run dev
```

## Variables de entorno opcionales (IA externa)

Copia `.env.example` como `.env` si deseas conectar un proveedor de IA externo (nunca subas `.env` a GitHub):

- `VITE_AI_API_URL`
- `VITE_AI_API_KEY`
- `VITE_AI_MODEL`
