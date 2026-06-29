// /api/save-content.js
// Recibe el nuevo contenido desde /admin y hace un commit directo al archivo
// content.json en GitHub, usando la API de Contenidos de GitHub.
// Ese commit dispara automáticamente un nuevo deploy en Vercel (integración
// nativa GitHub <-> Vercel), por lo que el sitio público se actualiza solo.
//
// Variables de entorno necesarias (Vercel > Settings > Environment Variables):
//   ADMIN_TOKEN     -> el mismo valor secreto que devuelve /api/login, se usa
//                      acá como verificación de sesión simple.
//   GITHUB_TOKEN    -> Personal Access Token de GitHub (permiso "repo" / contents:write)
//   GITHUB_OWNER    -> tu usuario u organización de GitHub (ej: "nahuellell")
//   GITHUB_REPO     -> nombre del repositorio (ej: "habilidades-futuro")
//   GITHUB_BRANCH   -> rama a usar (opcional, por defecto "main")

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' });
  }

  const authHeader = req.headers.authorization || '';
  const tokenFromClient = authHeader.replace('Bearer ', '').trim();

  const {
    ADMIN_TOKEN,
    GITHUB_TOKEN,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH
  } = process.env;

  if (!ADMIN_TOKEN || tokenFromClient !== ADMIN_TOKEN) {
    return res.status(401).json({ ok: false, error: 'No autorizado. Iniciá sesión de nuevo.' });
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({
      ok: false,
      error: 'Faltan variables de entorno GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO en Vercel.'
    });
  }

  const branch = GITHUB_BRANCH || 'main';
  const path = 'content.json';
  const { eyebrow, titulo, subtitulo } = req.body || {};

  if (!titulo || !subtitulo) {
    return res.status(400).json({ ok: false, error: 'Faltan campos: título y subtítulo son obligatorios.' });
  }

  const newContent = {
    sobreMateria: {
      eyebrow: eyebrow || 'Sobre la materia',
      titulo,
      subtitulo
    }
  };

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const ghHeaders = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'habilidades-futuro-admin'
  };

  try {
    // 1. Hay que obtener el SHA actual del archivo para poder sobrescribirlo
    let sha;
    const getRes = await fetch(`${apiUrl}?ref=${branch}`, { headers: ghHeaders });
    if (getRes.ok) {
      const getData = await getRes.json();
      sha = getData.sha;
    } else if (getRes.status !== 404) {
      const errData = await getRes.json().catch(() => ({}));
      return res.status(getRes.status).json({
        ok: false,
        error: `No se pudo leer el archivo actual en GitHub: ${errData.message || getRes.statusText}`
      });
    }

    // 2. Codificar el nuevo contenido en base64 (requisito de la API de GitHub)
    const contentString = JSON.stringify(newContent, null, 2);
    const contentBase64 = Buffer.from(contentString, 'utf-8').toString('base64');

    // 3. Hacer el commit (crear o actualizar el archivo)
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Actualizar contenido de "Sobre la materia" desde /admin',
        content: contentBase64,
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      return res.status(putRes.status).json({
        ok: false,
        error: `GitHub rechazó el commit: ${errData.message || putRes.statusText}`
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Cambios guardados. El sitio se va a actualizar en unos 20-40 segundos.'
    });

  } catch (err) {
    return res.status(500).json({ ok: false, error: `Error inesperado: ${err.message}` });
  }
}
