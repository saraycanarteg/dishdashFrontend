# Solución para el problema de autenticación con Google

## Problema
El flujo de Google OAuth falla con un error 404 porque el backend no está redirigiendo correctamente al frontend después de la autenticación.

## Cambios realizados en el Frontend ✅

### 1. GoogleCallback.jsx
- ✅ Mejorado el manejo de errores
- ✅ Agregados logs para debugging
- ✅ Validación de datos del usuario
- ✅ Mensajes de error claros al usuario

### 2. Login.jsx y Register.jsx
- ✅ Agregado manejo de errores de Google OAuth via query params
- ✅ Mensajes de error descriptivos

### 3. Ruta configurada
- ✅ La ruta `/auth/callback` ya está configurada en App.jsx
- ✅ El archivo `_redirects` está correcto para Render/producción

## Cambios necesarios en el Backend ⚠️

El backend necesita modificarse para redirigir correctamente al frontend. Aquí están los cambios necesarios:

### 1. Configurar variables de entorno

Agrega estas variables al archivo `.env` del backend:

```env
# URLs del Frontend
FRONTEND_URL_DEV=http://localhost:5173
FRONTEND_URL_PROD=https://dishdashfrontend.onrender.com

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL_DEV=http://localhost:3007/dishdash/auth/google/callback
GOOGLE_CALLBACK_URL_PROD=https://recipemanagement-caj9.onrender.com/dishdash/auth/google/callback
```

### 2. Actualizar el endpoint de callback de Google

El endpoint que maneja el callback de Google debe verse así:

```javascript
// En tu archivo de rutas de autenticación del backend
router.get('/auth/google/callback', async (req, res) => {
  try {
    // ... tu lógica existente de autenticación con Google
    
    // Obtener el usuario y generar el token
    const token = generateToken(user);
    
    // Determinar la URL del frontend según el entorno
    const frontendURL = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL_PROD 
      : process.env.FRONTEND_URL_DEV;
    
    // Crear el objeto de usuario para enviar al frontend
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      googleId: user.googleId
    };
    
    // Codificar los datos del usuario
    const encodedUser = encodeURIComponent(JSON.stringify(userInfo));
    
    // Redirigir al frontend con el token y datos del usuario
    const redirectURL = `${frontendURL}/auth/callback?token=${token}&user=${encodedUser}`;
    
    console.log('Redirigiendo a:', redirectURL);
    
    res.redirect(redirectURL);
    
  } catch (error) {
    console.error('Error en Google callback:', error);
    
    const frontendURL = process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL_PROD 
      : process.env.FRONTEND_URL_DEV;
    
    // Redirigir al login con error
    res.redirect(`${frontendURL}/login?error=authentication_failed`);
  }
});
```

### 3. Actualizar la ruta inicial de Google

```javascript
// Ruta que inicia el flujo de Google OAuth
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
```

### 4. Asegurar que el usuario tenga todos los campos necesarios

Cuando crees/actualices un usuario desde Google, asegúrate de incluir todos los campos:

```javascript
// Estrategia de Passport para Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
      ? process.env.GOOGLE_CALLBACK_URL_PROD
      : process.env.GOOGLE_CALLBACK_URL_DEV
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar o crear usuario
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0]?.value,
          role: 'client', // Rol por defecto para usuarios de Google
          isActive: true,
          // NO establecer password para usuarios de Google
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));
```

### 5. Configurar Google Cloud Console

En [Google Cloud Console](https://console.cloud.google.com/):

1. Ve a **APIs & Services** → **Credentials**
2. Selecciona tu OAuth 2.0 Client ID
3. Agrega estas URLs:

**Authorized JavaScript origins:**
- `http://localhost:5173` (desarrollo)
- `https://dishdashfrontend.onrender.com` (producción)
- `http://localhost:3007` (backend desarrollo)
- `https://recipemanagement-caj9.onrender.com` (backend producción)

**Authorized redirect URIs:**
- `http://localhost:3007/dishdash/auth/google/callback` (desarrollo)
- `https://recipemanagement-caj9.onrender.com/dishdash/auth/google/callback` (producción)

### 6. Estructura del modelo de Usuario

Asegúrate de que tu modelo de User en MongoDB permita campos opcionales:

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // IMPORTANTE: No requerido para Google
  googleId: { type: String, unique: true, sparse: true },
  picture: { type: String },
  role: { type: String, enum: ['chef', 'client', 'admin'], default: 'client' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

## Testing

### Para probar localmente:

1. **Backend local:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend local:**
   ```bash
   cd dishdashFrontend
   npm run dev
   ```

3. Abre `http://localhost:5173/login` y prueba "Continuar con Google"

### Para verificar que funciona:

1. Abre las DevTools (F12) → Console
2. Haz clic en "Continuar con Google"
3. Deberías ver logs en la consola:
   - "Google Callback - Token: Recibido"
   - "Google Callback - User: Recibido"
   - "Usuario parseado: {...}"
   - "Autenticación exitosa, redirigiendo..."

### Si ves errores:

1. **Error 404 en `/auth/callback`**: El backend no está redirigiendo correctamente
2. **"No se recibieron las credenciales"**: El backend no está enviando token o user
3. **"Los datos del usuario están incompletos"**: Falta el campo `role` o `email` en el usuario

## Diferencias entre usuario Google y usuario manual

### Usuario Manual (Register):
```json
{
  "_id": "696751d1284bd1dc4a6a0a3cf",
  "name": "carlos",
  "email": "carlos@gmail.com",
  "password": "$2b$10$mDvzIbwzD1zeHtH6D20.ymALlJxu38yANwxrSR5e20u8gJJs.P2",
  "role": "client",
  "isActive": true,
  "lastLogin": "2026-01-14T08:28:53.596+00:00",
  "createdAt": "2026-01-14T08:28:53.791+00:00",
  "updatedAt": "2026-01-14T08:28:53.596+00:00",
  "__v": 0
}
```

### Usuario Google (OAuth):
```json
{
  "_id": "695751ab284bd1dc4a6a0a3c7",
  "googleId": "116539944928461012815",
  "email": "andrescedeno1214@gmail.com",
  "name": "Andres Cedeño",
  "picture": "https://lh3.googleusercontent.com/a/ACg8ocKRarC2k3mrkqjb0QAFEq8VT0tHm...",
  "role": "client",
  "isActive": true,
  "lastLogin": "2026-01-14T08:19:59.230+00:00",
  "createdAt": "2026-01-14T08:18:38.957+00:00",
  "updatedAt": "2026-01-14T08:19:59.231+00:00",
  "__v": 0
}
```

**Diferencias clave:**
- Usuario Google NO tiene campo `password` (usa `googleId` en su lugar)
- Usuario Google tiene campo `picture` adicional
- Ambos DEBEN tener `email`, `name`, `role`, `isActive`

## Resumen

### Frontend ✅ (Completado)
- Ruta `/auth/callback` configurada
- Manejo de errores implementado
- Validaciones agregadas
- Mensajes de error claros

### Backend ⚠️ (Requiere cambios)
- Actualizar endpoint `/auth/google/callback` para redirigir al frontend
- Configurar variables de entorno
- Asegurar que usuarios de Google tengan todos los campos necesarios
- Actualizar Google Cloud Console con las URLs correctas

Una vez realices los cambios en el backend y actualices la configuración de Google Cloud Console, el flujo de autenticación con Google funcionará correctamente tanto en desarrollo como en producción.
