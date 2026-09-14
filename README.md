# ADMINISTRADOR · El Reto Empresarial V13

Simulador web de administración construido con React + TypeScript + Vite + Tailwind CSS y Supabase.

## Requisitos

- Node.js 20 LTS o superior recomendado.
- Un proyecto de Supabase para el ranking global.

## Ejecutar localmente

1. Copia `.env.example` a `.env.local`.
2. Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` con los valores de tu proyecto de Supabase.
3. Instala dependencias:

```bash
npm install
```

4. Comprueba el proyecto:

```bash
npm run typecheck
npm run lint
npm run build
```

5. Inicia el servidor:

```bash
npm run dev
```

## Supabase

Ejecuta las migraciones de `supabase/migrations/` en orden. La tercera migración (`20260914070000_harden_global_records.sql`) es importante: elimina la escritura anónima directa al ranking, crea unicidad por nombre normalizado, valida los datos y hace que el RPC devuelva la posición global exacta.

El navegador debe usar únicamente la clave pública publishable. **Nunca** pongas una `service_role`/secret key en `.env` del frontend.

## Seguridad del ranking

La versión corregida ya no permite que el navegador haga `INSERT`, `UPDATE` o `DELETE` directo sobre `global_records`. La única entrada de puntuaciones es `upsert_global_record()`.

Esto evita manipulación SQL directa y datos malformados, pero no convierte el ranking en un sistema anti-trampas perfecto: el cliente sigue enviando la puntuación final. Para un ranking competitivo contra desconocidos, el siguiente nivel sería mover el cálculo completo de la partida al servidor y enviar las decisiones, no el resultado final.

## Despliegue

La aplicación es una SPA estática. Puede desplegarse en Vercel, Netlify, Cloudflare Pages o cualquier hosting compatible con Vite.

En el hosting configura las mismas variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

No subas `.env.local` al repositorio.
