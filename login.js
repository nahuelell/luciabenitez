// /api/login.js
// Valida usuario y contraseña contra variables de entorno de Vercel.
// No usa base de datos: las credenciales se definen en Vercel > Settings > Environment Variables.
//
// Variables de entorno necesarias:
//   ADMIN_USER     -> usuario (ej: admin)
//   ADMIN_PASSWORD -> contraseña (ej: admin)
//   ADMIN_TOKEN    -> un valor secreto cualquiera (ej: una cadena larga al azar) que el
//                     panel usará como "sesión" simple en las próximas llamadas.

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  const { usuario, password } = req.body || {};

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (!ADMIN_USER || !ADMIN_PASSWORD || !ADMIN_TOKEN) {
    return res.status(500).json({
      ok: false,
      error: 'El servidor no tiene configuradas las variables de entorno ADMIN_USER / ADMIN_PASSWORD / ADMIN_TOKEN.'
    });
  }

  if (usuario === ADMIN_USER && password === ADMIN_PASSWORD) {
    return res.status(200).json({ ok: true, token: ADMIN_TOKEN });
  }

  return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos.' });
}
