// ── blog/articles.ts ─────────────────────────────────────────────────
// Blog articles for ZI Labs

export interface BlogArticle {
  slug: string;
  slugEs?: string;
  title: string;
  titleEs?: string;
  date: string;
  author: string;
  excerpt: string;
  excerptEs?: string;
  tags: string[];
  content: string;
  contentEs?: string;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'learn-hacking-without-installing-tools',
    slugEs: 'como-aprender-hacking-sin-instalar-herramientas',
    title: 'How to learn hacking without installing tools (practical guide for beginners)',
    titleEs: 'Cómo aprender hacking sin instalar herramientas (guía práctica para principiantes)',
    date: '2026-04-07',
    author: '@pabloveron',
    excerpt: 'Learn cybersecurity by practicing directly from your browser, no virtual machines or complex setups required.',
    excerptEs: 'Aprende ciberseguridad practicando directamente desde tu navegador, sin máquinas virtuales ni configuraciones complejas.',
    tags: ['hacking', 'ciberseguridad', 'principiantes', 'pentesting'],
    content: `## The problem when starting in cybersecurity

If you've ever tried to learn hacking, you've probably encountered this:

- Having to install Kali Linux
- Configuring virtual machines
- Compatibility problems
- Not knowing if you did something wrong or the environment failed

This generates frustration and makes many people quit before they even really start.

## The best way to learn: by practicing

Cybersecurity isn't learned just by reading or watching videos.

You learn by:

- Trying things out
- Making mistakes
- Exploiting real vulnerabilities
- Understanding how systems work

But for that, you need an environment where you can practice.

## Alternative: practice without installing anything

Today there are options that let you learn directly from the browser.

This completely eliminates the initial friction:

- No need to install tools
- No configuration required
- Start practicing in minutes

And that completely changes the experience.

![Hacking simulator with Linux terminal in the browser](/cap1.png)

## What you should practice as a beginner

If you're just starting, these are the key concepts:

- Network scanning
- Service enumeration
- Vulnerability exploitation
- System access
- Privilege escalation

The key isn't just understanding them, but seeing them in action.

## Practice in simulated environments

A very effective way to learn is to use simulated labs that replicate real scenarios.

For example:

- Vulnerable servers
- Web applications with flaws
- Systems with insecure configurations

This allows you to experiment without risk and learn by doing.

## A practical option to get started

If you want to try this approach, you can use my simulator:

**ZILabs** - https://zilabs.vercel.app/

It's a platform where you can practice hacking techniques directly in the browser, with:

- Interactive terminal
- Guided labs
- Scenarios with real vulnerabilities
- Support in Spanish and English

The idea is simple: start practicing without wasting time on configurations.

## Conclusion

Learning cybersecurity shouldn't be complicated from the start.

The easier it is to get started, the more likely you are to progress.

If you eliminate technical friction and focus on practicing, learning becomes much faster and more effective.`,
    contentEs: `## El problema al empezar en ciberseguridad

Si alguna vez intentaste aprender hacking, probablemente te encontraste con esto:

- Tener que instalar Kali Linux
- Configurar máquinas virtuales
- Problemas de compatibilidad
- No saber si hiciste algo mal o el entorno falló

Esto genera frustración y hace que muchos abandonen antes de empezar en serio.

## La mejor forma de aprender: practicando

La ciberseguridad no se aprende solo leyendo o viendo videos.

Se aprende:

- Probando
- Equivocándose
- Explotando vulnerabilidades reales
- Entendiendo cómo funcionan los sistemas

Pero para eso necesitás un entorno donde practicar.

## Alternativa: practicar sin instalar nada

Hoy existen opciones que permiten aprender directamente desde el navegador.

Esto elimina completamente la fricción inicial:

- No necesitás instalar herramientas
- No configurás nada
- Empezás a practicar en minutos

Y eso cambia completamente la experiencia.

![Simulador de hacking con terminal Linux en el navegador](/cap1.png)

## Qué deberías practicar como principiante

Si estás empezando, estos son los conceptos clave:

- Escaneo de redes
- Enumeración de servicios
- Explotación de vulnerabilidades
- Acceso a sistemas
- Escalada de privilegios

La clave no es solo entenderlos, sino verlos en acción.

## Practicar en entornos simulados

Una forma muy efectiva de aprender es usar laboratorios simulados que replican escenarios reales.

Por ejemplo:

- Servidores vulnerables
- Aplicaciones web con fallas
- Sistemas con configuraciones inseguras

Esto te permite experimentar sin riesgo y aprender haciendo.

## Una opción práctica para empezar

Si querés probar este enfoque, podés usar mi simulador:

**ZILabs** - https://zilabs.vercel.app/

Es una plataforma donde podés practicar técnicas de hacking directamente en el navegador, con:

- Terminal interactiva
- Laboratorios guiados
- Escenarios con vulnerabilidades reales
- Soporte en español e inglés

La idea es simple: empezar a practicar sin perder tiempo en configuraciones.

## Conclusión

Aprender ciberseguridad no debería ser complicado desde el inicio.

Cuanto más fácil sea empezar, más probable es que avances.

Si eliminás la fricción técnica y te enfocás en practicar, el aprendizaje se vuelve mucho más rápido y efectivo.`,
  },
];
