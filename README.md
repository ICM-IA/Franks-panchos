# Frank's — Copa Mar del Plata 2026

Sitio de Frank's (pancho marplatense) + campaña **Copa Mar del Plata 2026**, con base de datos real en Supabase.

## Páginas
- `/` → institucional (index.html) — con CTA a **franquicias** (franquiciasfranks.com) y a la Copa.
- `/copa` → campaña Copa MDP 2026 — inscripción real + ranking en vivo.
- `/admin` → panel de carga de puntos (requiere login).

## Cómo se construye
Las páginas se escriben en `*.src.html` con tokens `%%...%%`. El script `build.js`
inyecta los assets (base64) y genera la carpeta `site/` lista para publicar.

```bash
node build.js
```

## Puesta en marcha (una sola vez)

### 1) Base de datos (Supabase)
1. En tu proyecto de Supabase → **SQL Editor** → New query.
2. Pegá TODO el contenido de `supabase-schema.sql` y dale **Run**.
3. Creá el usuario admin: **Authentication → Users → Add user** (email + contraseña
   que va a usar el equipo para entrar a `/admin`).

### 2) Conectar el sitio con Supabase
En `config.js` completá los 2 valores (los sacás de **Settings → API**):
```js
SUPABASE_URL: "https://xxxx.supabase.co",
SUPABASE_ANON_KEY: "eyJhbGciOi..."
```
Son valores públicos (van en el navegador), no hay problema en versionarlos.

### 3) Deploy en Vercel (con GitHub)
1. Subí este repo a GitHub.
2. En Vercel → **Add New Project** → importá el repo.
3. Vercel toma la config de `vercel.json` (build `node build.js`, output `site/`).
4. Deploy. Cada `git push` vuelve a publicar solo.

### 4) Dominio (al final, antes de largar)
En Vercel → Project → **Domains**: agregás `franks.com.ar` y el subdominio
`copa.franks.com.ar`, y cargás los registros DNS que te indica Vercel.

## Sistema de puntos (referencia)
- Pancho simple **10** · Promo **15** · Pancho Party **50**
- Ticket del profe **+30** · Hinchada **+10** · Foto grupal **+30** · El Clásico **+50**
- Happy Hour: multiplica el consumo/bonus x2 o x3.
