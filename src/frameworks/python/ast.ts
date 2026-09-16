// ── frameworks/python/ast.ts ────────────────────────────────────────
// Nodos del AST del subconjunto de Python soportado por el intérprete.

export type Expr =
  | { t: 'num'; value: number; line: number }
  | { t: 'str'; value: string; line: number }
  | { t: 'fstring'; parts: Array<string | Expr>; line: number }
  | { t: 'bool'; value: boolean; line: number }
  | { t: 'none'; line: number }
  | { t: 'name'; name: string; line: number }
  | { t: 'list'; items: Expr[]; line: number }
  | { t: 'tuple'; items: Expr[]; line: number }
  | { t: 'dict'; keys: Expr[]; values: Expr[]; line: number }
  | { t: 'binop'; op: string; left: Expr; right: Expr; line: number }
  | { t: 'boolop'; op: 'and' | 'or'; values: Expr[]; line: number }
  | { t: 'unary'; op: '-' | 'not'; operand: Expr; line: number }
  | { t: 'compare'; left: Expr; ops: string[]; comparators: Expr[]; line: number }
  | { t: 'ifexp'; body: Expr; test: Expr; orelse: Expr; line: number }
  | { t: 'call'; func: Expr; args: Expr[]; line: number }
  | { t: 'attr'; obj: Expr; name: string; line: number }
  | { t: 'subscript'; obj: Expr; index: Expr; line: number };

export type Stmt =
  | { t: 'assign'; name: string; value: Expr; line: number }
  | { t: 'augassign'; name: string; op: string; value: Expr; line: number }
  | { t: 'expr'; expr: Expr; line: number }
  | { t: 'if'; test: Expr; body: Stmt[]; orelse: Stmt[]; line: number }
  | { t: 'while'; test: Expr; body: Stmt[]; line: number }
  | { t: 'for'; target: string; iter: Expr; body: Stmt[]; line: number }
  | { t: 'def'; name: string; params: string[]; body: Stmt[]; line: number }
  | { t: 'return'; value: Expr | null; line: number }
  | { t: 'import'; modules: Array<{ name: string; as?: string }>; line: number }
  | { t: 'fromimport'; module: string; names: string[]; line: number }
  | { t: 'try'; body: Stmt[]; exceptName: string | null; exceptVar: string | null; exceptBody: Stmt[]; finallyBody: Stmt[]; line: number }
  // Statements de una misma línea separados por ';' (one-liners con -c).
  | { t: 'multi'; body: Stmt[]; line: number }
  | { t: 'break'; line: number }
  | { t: 'continue'; line: number }
  | { t: 'pass'; line: number };
