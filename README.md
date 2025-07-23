# Vorten Dashboard - Tradit API Integration

Este proyecto implementa Better Auth en Astro.js para manejar la autenticación del frontend, conectándose con la API de Tradit para el backend de autenticación.

## Arquitectura

```
Frontend (Astro + Better Auth) ←→ API Proxy ←→ API de Tradit
                ↓
        Passkeys + Sesiones Seguras
```

## Características

- ✅ **Better Auth** para manejo de sesiones seguras
- ✅ **Passkeys** para autenticación sin contraseña
- ✅ **API Proxy** para conectar con Tradit API
- ✅ **Autenticación por OTP** con Twilio
- ✅ **Códigos de invitación** para acceso controlado
- ✅ **Dashboard protegido** con información del usuario

## Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp env.example .env
   ```
   
   Edita el archivo `.env` con tus configuraciones:
   ```env
   # Better Auth Configuration
   AUTH_SECRET=tu-secreto-aqui
   AUTH_TRUST_HOST=true
   AUTH_RP_ID=localhost
   AUTH_ORIGIN=http://localhost:4321

   # Tradit API Configuration
   TRADIT_API_URL=https://tu-api-tradit.com
   TRADIT_API_KEY=tu-api-key-aqui
   ```

3. **Generar secreto de autenticación:**
   ```bash
   openssl rand -hex 32
   ```

## Desarrollo

```bash
npm run dev
```

Visita `http://localhost:4321/login` para probar la autenticación.

## Endpoints de la API

### Proxy Endpoints (Astro)
- `POST /api/v1/auth/verify-invitation` - Verifica código de invitación
- `POST /api/v1/auth/send-otp` - Envía OTP al teléfono
- `POST /api/auth/[...all]` - Endpoints de Better Auth

### Tradit API Endpoints
- `POST /api/v1/auth/create-invitation` - Crear invitación
- `POST /api/v1/auth/login` - Login con teléfono e invitación
- `POST /api/v1/auth/verify-otp` - Verificar OTP
- `POST /api/v1/auth/verify-invitation` - Verificar invitación
- `POST /api/v1/auth/check-phone` - Verificar teléfono
- `POST /api/v1/auth/send-otp` - Enviar OTP
- `GET /api/v1/auth/verify-session` - Verificar sesión
- `POST /api/v1/auth/logout` - Cerrar sesión

## Flujo de Autenticación

1. **Usuario ingresa número de teléfono y código de invitación**
2. **Sistema verifica la invitación con Tradit API**
3. **Se envía OTP al teléfono del usuario**
4. **Usuario ingresa el código OTP**
5. **Better Auth crea sesión segura**
6. **Usuario puede configurar passkey para futuros accesos**

## Passkeys

El sistema soporta passkeys para autenticación sin contraseña:

- **Configuración:** Los usuarios pueden agregar passkeys después del primer login
- **Acceso rápido:** Los usuarios pueden usar passkeys para acceder sin OTP
- **Seguridad:** Passkeys son más seguros que contraseñas tradicionales

## Despliegue

### Cloudflare Pages
```bash
npm run build
```

El proyecto está configurado para Cloudflare Pages con el adaptador `@astrojs/cloudflare`.

## Estructura del Proyecto

```
src/
├── components/
│   └── TraditAuth.astro      # Componente de autenticación
├── lib/
│   ├── auth.ts              # Configuración de Better Auth
│   └── auth-client.ts       # Cliente de autenticación
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all].ts  # Endpoints de Better Auth
│   │   └── v1/
│   │       └── auth/        # Proxy endpoints para Tradit API
│   ├── dashboard.astro      # Dashboard protegido
│   └── login.astro          # Página de login
├── middleware.ts            # Middleware de autenticación
└── env.d.ts                # Tipos de TypeScript
```

## Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `AUTH_SECRET` | Secreto para Better Auth | ✅ |
| `AUTH_TRUST_HOST` | Confiar en el host | ✅ |
| `AUTH_RP_ID` | ID del relying party | ✅ |
| `AUTH_ORIGIN` | Origen para passkeys | ✅ |
| `TRADIT_API_URL` | URL de la API de Tradit | ✅ |
| `TRADIT_API_KEY` | API key de Tradit | ✅ |

## Troubleshooting

### Error de passkeys
- Asegúrate de que `AUTH_RP_ID` esté configurado correctamente
- Para desarrollo local, usa `localhost`
- Para producción, usa tu dominio

### Error de conexión con Tradit API
- Verifica que `TRADIT_API_URL` sea correcta
- Asegúrate de que `TRADIT_API_KEY` sea válida
- Revisa los logs del servidor para más detalles

### Error de sesión
- Verifica que `AUTH_SECRET` esté configurado
- Asegúrate de que `AUTH_TRUST_HOST=true` en producción

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT
