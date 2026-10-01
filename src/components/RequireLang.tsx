// ── components/RequireLang.tsx ───────────────────────────────────
// Gate de idioma de las rutas `/:lang/...` (mejoras-deep §2.3.2).
// Antes cualquier string valía: `/fr/labs` renderizaba la landing en vez
// de un 404, y como `vercel.json` reescribe esas URLs a index.html
// servían contenido duplicado en un idioma que no existe.

import { useParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { NotFound } from './NotFound';

export const VALID_LANGS = ['es', 'en'] as const;
export type Lang = (typeof VALID_LANGS)[number];

export function isValidLang(lang: string | undefined): lang is Lang {
  return VALID_LANGS.includes(lang as Lang);
}

/**
 * Layout de `/:lang`: deja pasar sólo `es`/`en` y cualquier otro valor
 * responde 404. Los links del 404 salen del idioma del store (no de la
 * URL), así que nunca apuntan a un `:lang` inválido.
 */
export function RequireLang({ children }: { children: ReactNode }) {
  const { lang } = useParams();
  return isValidLang(lang) ? <>{children}</> : <NotFound />;
}
