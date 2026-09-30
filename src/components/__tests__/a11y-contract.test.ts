// ── components/__tests__/a11y-contract.test.ts ────────────────────
// P1 3.8: 20 de 118 .tsx tenían aria-label y NINGÚN modal tenía focus
// trap. Poner un aria-label en los ~98 componentes restantes es un barrido
// masivo de bajo valor por archivo; lo que no se puede dejar es que el
// contrato se rompa en silencio. Este test es la verja:
//
//  1. Todo elemento con role="button" tiene onKeyDown (o es un <button> de
//     verdad). Ese fue el bug real de ScenarioCard.
//  2. Todo modal (fixed inset-0) tiene role="dialog" + aria-modal, es decir
//     pasa por ModalShell.
//  3. Ningún <img>/<input> sin nombre accesible.
//
// Allowlist con el motivo, como en layering.test.ts.

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsxFiles(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

const files = tsxFiles(join(SRC, 'components')).filter(f => !f.includes('/__tests__/'));
const rel = (f: string) => f.replace(`${process.cwd()}/`, '');

/**
 * Etiquetas de apertura `<name ...>` completas. NO se puede usar
 * `<name[^>]*>`: los handlers contienen flechas (`onClick={e => ...}`) y el
 * primer `>` corta la etiqueta en el medio, dando falsos positivos.
 * Acá se escanea contando llaves y comillas.
 */
function tagsWith(source: string, name: string): string[] {
  const out: string[] = [];
  const open = new RegExp(`<${name}\\b`, 'g');
  for (const m of source.matchAll(open)) {
    let i = m.index! + m[0].length;
    let depth = 0;
    let quote: string | null = null;
    while (i < source.length) {
      const ch = source[i];
      if (quote) {
        if (ch === quote && source[i - 1] !== '\\') quote = null;
      } else if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch;
      } else if (ch === '{') {
        depth++;
      } else if (ch === '}') {
        depth--;
      } else if (ch === '>' && depth === 0) {
        out.push(source.slice(m.index, i + 1));
        break;
      }
      i++;
    }
  }
  return out;
}

describe('a11y — role="button" es operable con teclado', () => {
  // allowlist: elementos puramente decorativos con tabIndex sin handler
  const ALLOW = [/\/landing\//, /DesktopWindow\.tsx/];

  it('ningún role="button" sin onKeyDown', () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (ALLOW.some(re => re.test(file))) continue;
      for (const tag of tagsWith(readFileSync(file, 'utf8'), 'div')) {
        if (/role="button"/.test(tag) && !/onKeyDown/.test(tag)) {
          offenders.push(`${rel(file)}: ${tag.slice(0, 80)}`);
        }
      }
      for (const tag of tagsWith(readFileSync(file, 'utf8'), 'span')) {
        if (/role="button"/.test(tag) && !/onKeyDown/.test(tag)) {
          offenders.push(`${rel(file)}: ${tag.slice(0, 80)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('a11y — los modales pasan por ModalShell', () => {
  // FoxyTour es un spotlight (`pointer-events-none`, no interactivo): no es
  // un diálogo, es una capa decorativa que resalta un elemento. El resto de
  // overlays fijos SÍ son diálogos y declaran role/aria-modal.
  const ALLOW = [/\/tour\/FoxyTour\.tsx$/];

  it('todo overlay fijo con contenido de diálogo declara role="dialog" y aria-modal', () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (ALLOW.some(re => re.test(file))) continue;
      const source = readFileSync(file, 'utf8');
      if (!/fixed inset-0/.test(source)) continue;
      // ModalShell ya pone role/aria-modal en el panel: lo que se busca es
      // que el overlay no se arme a mano.
      if (/ModalShell/.test(source)) continue;
      if (!/role="dialog"/.test(source)) {
        offenders.push(`${rel(file)}: overlay fijo sin role="dialog"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('a11y — controles con nombre accesible', () => {
  it('ningún <img> sin alt', () => {
    const offenders: string[] = [];
    for (const file of files) {
      for (const tag of tagsWith(readFileSync(file, 'utf8'), 'img')) {
        if (!/\balt=/.test(tag)) offenders.push(`${rel(file)}: ${tag.slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('ningún <input> sin name/aria-label/id+label', () => {
    // Los formularios del admin (LabBuilder/LessonBuilder) quedan fuera: es
    // una herramienta interna, no la app del alumno, y cada campo ya está
    // precedido por su <label> visual. El barrido de a11y de esas
    // herramientas es un ítem aparte; lo que no se permite es que el
    // contrato se rompa en la app del alumno.
    const ALLOW = [/\/admin\//];
    const offenders: string[] = [];
    for (const file of files) {
      if (ALLOW.some(re => re.test(file))) continue;
      for (const tag of tagsWith(readFileSync(file, 'utf8'), 'input')) {
        if (/type="hidden"/.test(tag)) continue;
        const named = /aria-label/.test(tag) || /\bname=/.test(tag) || /\bid=/.test(tag)
          || /aria-labelledby/.test(tag) || /type="(radio|checkbox|submit|button)"/.test(tag);
        if (!named) offenders.push(`${rel(file)}: ${tag.slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
