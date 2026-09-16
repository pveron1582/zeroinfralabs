// ── frameworks/python/parser.ts ─────────────────────────────────────
// Parser de statements sobre el token stream del lexer. Maneja bloques
// por indentación (INDENT/DEDENT), suites de una línea (`if x: y`) y
// statements simples separados por ';'.

import type { Stmt } from './ast';
import { isNameToken } from './lexer';
import { syntaxError } from './errors';
import { ExprParser } from './exprParser';

const AUG_OPS = ['+=', '-=', '*=', '/=', '//=', '%='];

export class StatementParser extends ExprParser {
  parseProgram(): Stmt[] {
    const body: Stmt[] = [];
    while (!this.atEnd()) {
      if (this.peek().type === 'NEWLINE') { this.pos++; continue; }
      body.push(this.parseStatement());
    }
    return body;
  }

  parseStatement(): Stmt {
    const t = this.peek();
    if (t.type === 'NAME') {
      switch (t.value) {
        case 'if': return this.parseIf();
        case 'while': return this.parseWhile();
        case 'for': return this.parseFor();
        case 'def': return this.parseDef();
        case 'try': return this.parseTry();
        case 'return': {
          this.pos++;
          const value = this.atStatementEnd() ? null : this.parseExpression();
          this.endLine();
          return { t: 'return', value, line: t.line };
        }
        case 'break': this.pos++; this.endLine(); return { t: 'break', line: t.line };
        case 'continue': this.pos++; this.endLine(); return { t: 'continue', line: t.line };
        case 'pass': this.pos++; this.endLine(); return { t: 'pass', line: t.line };
        case 'import': return this.parseImport();
        case 'from': return this.parseFromImport();
      }
    }
    return this.parseSimpleStatement();
  }

  // Asignación, aug-assign o expresión suelta (con soporte ';').
  private parseSimpleStatement(): Stmt {
    const first = this.parseSimpleStmt();
    if (this.atOp(';')) {
      // Compatibilidad one-liner: `a = 1; print(a)` — se reescribe como
      // bloque anidado usando un try con un solo statement? No: Python
      // lo permite en la misma línea. El parser de bloques consume la
      // lista completa; acá envolvemos en un statement compuesto sintético.
      const rest: Stmt[] = [first];
      while (this.atOp(';')) {
        this.pos++;
        if (this.atStatementEnd()) break;
        rest.push(this.parseSimpleStmt());
      }
      this.endLine();
      return { t: 'multi', body: rest, line: first.line } as unknown as Stmt;
    }
    this.endLine();
    return first;
  }

  private parseSimpleStmt(): Stmt {
    const t = this.peek();
    if (t.type === 'NAME' && isNameToken(t)) {
      const n1 = this.peek(1);
      if (n1.type === 'OP' && n1.value === '=') {
        this.pos += 2;
        const value = this.parseExpression();
        return { t: 'assign', name: t.value, value, line: t.line };
      }
      if (n1.type === 'OP' && AUG_OPS.includes(n1.value)) {
        this.pos += 2;
        const op = n1.value === '%=' ? '%' : n1.value.replace('=', '');
        const value = this.parseExpression();
        return { t: 'augassign', name: t.value, op, value, line: t.line };
      }
      if (n1.type === 'OP' && n1.value === '[' && this.subscriptAssignment()) {
        throw syntaxError('asignación a subíndice no soportada en el simulador', t.line);
      }
    }
    const expr = this.parseExpression();
    return { t: 'expr', expr, line: t.line };
  }

  // Detecta `nombre[...] = ...` (mirando al final del subíndice un '=').
  private subscriptAssignment(): boolean {
    let i = this.pos + 2; // saltea NAME y '['
    let depth = 1;
    while (i < this.tokens.length && depth > 0) {
      const v = this.tokens[i].value;
      if (['[', '(', '{'].includes(v)) depth++;
      if ([')', ']', '}'].includes(v)) depth--;
      i++;
    }
    const t = this.tokens[i];
    return t?.type === 'OP' && t.value === '=';
  }

  private parseIf(): Stmt {
    const line = this.next().line; // 'if'
    const test = this.parseExpression();
    this.expectOp(':');
    const body = this.parseBlock();
    let orelse: Stmt[] = [];
    if (this.atKw('elif')) {
      const elifStmt = this.parseElif();
      orelse = [elifStmt];
    } else if (this.atKw('else')) {
      this.pos++;
      this.expectOp(':');
      orelse = this.parseBlock();
    }
    return { t: 'if', test, body, orelse, line };
  }

  private parseElif(): Stmt {
    const line = this.next().line; // 'elif'
    const test = this.parseExpression();
    this.expectOp(':');
    const body = this.parseBlock();
    let orelse: Stmt[] = [];
    if (this.atKw('elif')) {
      orelse = [this.parseElif()];
    } else if (this.atKw('else')) {
      this.pos++;
      this.expectOp(':');
      orelse = this.parseBlock();
    }
    return { t: 'if', test, body, orelse, line };
  }

  private parseWhile(): Stmt {
    const line = this.next().line;
    const test = this.parseExpression();
    this.expectOp(':');
    return { t: 'while', test, body: this.parseBlock(), line };
  }

  private parseFor(): Stmt {
    const line = this.next().line;
    const target = this.expectName('el nombre del bucle');
    if (!this.atKw('in')) throw syntaxError("se esperaba 'in'", this.peek().line);
    this.pos++;
    const iter = this.parseExpression();
    this.expectOp(':');
    return { t: 'for', target, iter, body: this.parseBlock(), line };
  }

  private parseDef(): Stmt {
    const line = this.next().line;
    const name = this.expectName('el nombre de la función');
    this.expectOp('(');
    const params: string[] = [];
    if (!this.atOp(')')) {
      do {
        params.push(this.expectName('un parámetro'));
      } while (this.atOp(',') && (this.pos++, true));
    }
    this.expectOp(')');
    this.expectOp(':');
    return { t: 'def', name, params, body: this.parseBlock(), line };
  }

  private parseTry(): Stmt {
    const line = this.next().line; // 'try'
    this.expectOp(':');
    const body = this.parseBlock();
    let exceptName: string | null = null;
    let exceptVar: string | null = null;
    let exceptBody: Stmt[] = [];
    if (this.atKw('except')) {
      this.pos++;
      const t = this.peek();
      if (isNameToken(t)) {
        exceptName = this.next().value;
        if (this.atKw('as')) { this.pos++; exceptVar = this.expectName('el alias de la excepción'); }
      }
      this.expectOp(':');
      exceptBody = this.parseBlock();
    }
    let finallyBody: Stmt[] = [];
    if (this.atKw('finally')) {
      this.pos++;
      this.expectOp(':');
      finallyBody = this.parseBlock();
    }
    if (exceptName === null && exceptBody.length === 0 && finallyBody.length === 0) {
      throw syntaxError("se esperaba 'except' o 'finally'", this.peek().line);
    }
    return { t: 'try', body, exceptName, exceptVar, exceptBody, finallyBody, line };
  }

  private parseImport(): Stmt {
    const line = this.next().line;
    const modules: Array<{ name: string; as?: string }> = [];
    do {
      const name = this.expectName('un módulo');
      let as: string | undefined;
      if (this.atKw('as')) { this.pos++; as = this.expectName('el alias'); }
      modules.push({ name, as });
    } while (this.atOp(',') && (this.pos++, true));
    this.endLine();
    return { t: 'import', modules, line };
  }

  private parseFromImport(): Stmt {
    const line = this.next().line;
    const module = this.expectName('un módulo');
    if (!this.atKw('import')) throw syntaxError("se esperaba 'import'", this.peek().line);
    this.pos++;
    const names: string[] = [];
    do {
      names.push(this.expectName('un nombre'));
    } while (this.atOp(',') && (this.pos++, true));
    this.endLine();
    return { t: 'fromimport', module, names, line };
  }

  // Suite: bloque indentado o statements en la misma línea.
  private parseBlock(): Stmt[] {
    if (this.peek().type === 'NEWLINE') {
      this.pos++;
      const ind = this.peek();
      if (ind.type !== 'INDENT') throw syntaxError('se esperaba un bloque indentado', ind.line);
      this.pos++;
      const body: Stmt[] = [];
      while (this.peek().type !== 'DEDENT' && !this.atEnd()) {
        if (this.peek().type === 'NEWLINE') { this.pos++; continue; }
        body.push(this.parseStatement());
      }
      if (this.peek().type === 'DEDENT') this.pos++;
      return body;
    }
    // Suite de una línea: `if x: print(y)` o `if x: a = 1; b = 2`
    return [this.parseSimpleStatement()];
  }

  private atStatementEnd(): boolean {
    const t = this.peek();
    return t.type === 'NEWLINE' || t.type === 'EOF' || (t.type === 'OP' && t.value === ';');
  }

  private endLine(): void {
    const t = this.peek();
    if (t.type === 'NEWLINE' || t.type === 'EOF') {
      if (t.type === 'NEWLINE') this.pos++;
      return;
    }
    throw syntaxError('sintaxis inválida', t.line);
  }
}
