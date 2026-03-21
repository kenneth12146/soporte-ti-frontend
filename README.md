
### README.md para el backend:

```markdown
# Marlon Audio - Backend API

API REST para la tienda de equipos de sonido profesional **Marlon Audio**. Desarrollada con Node.js, Express y PostgreSQL.

## 🚀 Características

- Autenticación JWT
- CRUD de productos (con especificaciones técnicas: potencia RMS, impedancia, sensibilidad)
- CRUD de categorías
- Gestión de imágenes de productos
- Gestión de pedidos
- Configuración de tienda (logo, WhatsApp, redes sociales)
- Endpoints públicos y protegidos

## 🛠️ Tecnologías

- Node.js
- Express
- PostgreSQL
- JWT (autenticación)
- bcryptjs (hash de contraseñas)
- CORS

## 📦 Instalación

```bash
git clone https://github.com/kenneth12146/marlon-audio-api.git
cd marlon-audio-api
npm install
cp .env.example .env
npm run dev
