# Habilidades para el Futuro — Crespo, ER

Página de la materia, con un panel de administración en `/admin` para editar
el título y el pie de título de la sección "Sobre la materia" sin tocar código.

No usa base de datos. El contenido vive en el archivo `content.json` del
propio repositorio, y el panel lo actualiza haciendo un commit automático en
GitHub, lo que dispara un nuevo deploy en Vercel.

---

## 1. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "Primera versión del sitio"
```

Creá un repositorio nuevo en GitHub (botón "New repository"), copiá la URL y:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

## 2. Crear un Personal Access Token en GitHub

Este token es lo que le permite a la función `/api/save-content` escribir en
tu repositorio en tu nombre.

1. Entrá a GitHub → tu foto de perfil (arriba a la derecha) → **Settings**.
2. En el menú de la izquierda, abajo de todo: **Developer settings**.
3. **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
4. Ponele un nombre (ej: "habilidades-futuro-admin").
5. En **Repository access**, elegí "Only select repositories" y seleccioná tu repo.
6. En **Permissions** → **Repository permissions** → buscá **Contents** y
   poné el permiso en **Read and write**.
7. Generá el token y **copialo ya** (GitHub solo lo muestra una vez).

Guardalo en un lugar seguro, lo vas a necesitar en el paso 4.

## 3. Importar el proyecto en Vercel

1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con tu cuenta de GitHub.
2. **Add New...** → **Project**.
3. Elegí el repositorio que subiste.
4. Vercel detecta que es un proyecto estático con funciones serverless en
   `/api` automáticamente. No hace falta tocar nada en "Build settings".
5. Antes de hacer click en **Deploy**, abrí la sección **Environment Variables**
   (ver paso siguiente) — o si ya hiciste deploy, las agregás después en
   **Settings → Environment Variables** y volvés a desplegar.

## 4. Configurar las variables de entorno en Vercel

En tu proyecto dentro de Vercel: **Settings → Environment Variables**.
Agregá estas, una por una (entorno: **Production**, **Preview** y **Development**, las tres):

| Nombre            | Valor                                                              |
|-------------------|---------------------------------------------------------------------|
| `ADMIN_USER`      | `admin`                                                            |
| `ADMIN_PASSWORD`  | `admin`                                                            |
| `ADMIN_TOKEN`     | una cadena larga al azar, por ejemplo generala en [random.org](https://www.random.org/strings/) o escribí algo como `hpf-2026-x7Qa9Lm3Zk` |
| `GITHUB_TOKEN`    | el token que copiaste en el paso 2                                  |
| `GITHUB_OWNER`    | tu usuario de GitHub (ej: `nahuellell`)                            |
| `GITHUB_REPO`     | el nombre del repositorio (ej: `habilidades-futuro`)               |
| `GITHUB_BRANCH`   | `main` (opcional — si no la agregás, usa `main` por defecto)       |

> ⚠️ Importante: `admin` / `admin` es una contraseña muy débil. Sirve para que
> no cualquiera edite el sitio por casualidad, pero no asumas que es
> seguridad real. Si en algún momento querés algo más fuerte, solo hay que
> cambiar los valores de `ADMIN_USER` y `ADMIN_PASSWORD` en Vercel — no hace
> falta tocar código.

Después de agregar las variables, hacé un **Redeploy** (Vercel → pestaña
Deployments → los tres puntos del último deploy → Redeploy) para que la
función las empiece a usar.

## 5. Usar el panel

1. Entrá a `https://tu-sitio.vercel.app/admin`.
2. Ingresá con usuario `admin` y contraseña `admin`.
3. Editá el título y el pie de título.
4. Tocá **Publicar cambios**.
5. Esperá unos 20-40 segundos y refrescá el sitio público — el commit que
   hizo el panel dispara un nuevo deploy automático en Vercel.

## Estructura del proyecto

```
/
├── index.html        → la landing page pública
├── content.json      → contenido editable (lo modifica /admin)
├── admin/
│   └── index.html    → panel de administración (usuario y contraseña)
├── api/
│   ├── login.js       → valida usuario y contraseña
│   └── save-content.js → guarda content.json haciendo commit en GitHub
├── vercel.json        → configuración de rutas
└── package.json
```

## Notas

- El panel no guarda nada en una base de datos: usa el propio repo de GitHub
  como "base de datos" de texto plano.
- Cada vez que guardás desde `/admin`, se genera un commit nuevo visible en
  el historial de GitHub con el mensaje *"Actualizar contenido de Sobre la
  materia desde /admin"*.
- Si alguna vez perdés el `content.json` o querés volver atrás, podés
  revertir el commit directamente desde GitHub.
