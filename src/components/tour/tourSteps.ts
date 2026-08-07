import type { Language as Lang } from '../../i18n/translations';

export interface TourStep {
  id: string;
  /** Selector CSS del elemento a enfocar. Si falta, se muestra centrado sin foco. */
  target?: string;
  /** Selector cuya aparición avanza automáticamente al siguiente paso. */
  waitFor?: string;
  /** Selector cuya desaparición avanza automáticamente al siguiente paso. */
  waitForHidden?: string;
  /** Si waitFor/waitForHidden está seteado, el usuario debe interactuar (click) para avanzar. */
  interactive?: boolean;
  /** Si el target no existe en el DOM (ej: icono solo en escenarios Web), saltear el paso. */
  skipIfMissing?: boolean;
  /** Ubica la burbuja a la derecha cuando no hay objetivo (target ausente o no encontrado). */
  align?: 'right';
  title: Record<Lang, string>;
  body: Record<Lang, string>;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    title: { es: '¡Hola! Soy Foxy', en: 'Hi! I\'m Foxy' },
    body: {
      es: 'Te voy a ayudar a reconocer el laboratorio para que puedas empezar a usarlo. Voy a ir señalando cada parte del escritorio paso a paso.',
      en: 'I\'ll help you get familiar with the lab so you can start using it. I\'ll point out each part of the desktop step by step.',
    },
  },
  {
    id: 'desktop-icons',
    target: '[data-tour="desktop-icons"]',
    title: { es: 'Iconos del escritorio', en: 'Desktop icons' },
    body: {
      es: 'Estos son los accesos del escritorio. Cada icono abre una aplicación del laboratorio. Vamos a abrirlos uno por uno.',
      en: 'These are the desktop shortcuts. Each icon opens a lab application. Let\'s open them one by one.',
    },
  },
  {
    id: 'desktop-icon-terminal',
    target: '[data-tour="desktop-icon-terminal"]',
    waitFor: '[data-tour="terminal-window"]',
    interactive: true,
    title: { es: 'Terminal', en: 'Terminal' },
    body: {
      es: 'Este es el icono de la terminal. Hacé clic en él para abrir tu consola de comandos.',
      en: 'This is the terminal icon. Click it to open your command console.',
    },
  },
  {
    id: 'terminal-window',
    target: '[data-tour="terminal-window"]',
    title: { es: 'Ventana de terminal', en: 'Terminal window' },
    body: {
      es: 'Esta es tu terminal. Acá vas a escribir los comandos para explorar las máquinas del laboratorio.',
      en: 'This is your terminal. You\'ll type commands here to explore the lab machines.',
    },
  },
  {
    id: 'settings-btn',
    target: '[data-tour="settings-btn"]',
    waitFor: '[data-tour="settings-panel"]',
    interactive: true,
    title: { es: 'Botón de ajustes', en: 'Settings button' },
    body: {
      es: 'Este es el botón de ajustes de la terminal. Hacé clic en él para ver las opciones.',
      en: 'This is the terminal settings button. Click it to see the options.',
    },
  },
  {
    id: 'settings-panel',
    target: '[data-tour="settings-panel"]',
    title: { es: 'Panel de ajustes', en: 'Settings panel' },
    body: {
      es: 'Desde acá podés cambiar el tamaño de la fuente, la opacidad y el color del texto de la terminal.',
      en: 'From here you can change the font size, opacity, and text color of the terminal.',
    },
  },
  {
    id: 'desktop-icon-wallpaper',
    target: '[data-tour="desktop-icon-wallpaper"]',
    waitFor: '[data-tour="wallpaper-window"]',
    interactive: true,
    title: { es: 'Fondos de pantalla', en: 'Wallpapers' },
    body: {
      es: 'Este icono te permite cambiar el fondo del escritorio. Hacé clic para verlo.',
      en: 'This icon lets you change the desktop wallpaper. Click to see it.',
    },
  },
  {
    id: 'wallpaper-window',
    target: '[data-tour="wallpaper-window"]',
    title: { es: 'Selector de fondos', en: 'Wallpaper picker' },
    body: {
      es: 'Desde acá podés elegir el fondo de pantalla que más te guste para el escritorio.',
      en: 'From here you can pick the wallpaper you like most for the desktop.',
    },
  },
  {
    id: 'desktop-icon-browser',
    target: '[data-tour="desktop-icon-browser"]',
    waitFor: '[data-tour="browser-window"]',
    interactive: true,
    /** Solo existe en escenarios Web: si no hay icono, el tour se lo saltea. */
    skipIfMissing: true,
    title: { es: 'Navegador Chrome', en: 'Chrome browser' },
    body: {
      es: 'Este icono abre el navegador Chrome. Hacé clic en él para abrirlo.',
      en: 'This icon opens the Chrome browser. Click it to open it.',
    },
  },
  {
    id: 'browser-window',
    target: '[data-tour="browser-window"]',
    title: { es: 'Navegador Chrome', en: 'Chrome browser' },
    body: {
      es: 'Desde el navegador vas a acceder a la aplicación web de la máquina objetivo.',
      en: 'From the browser you\'ll access the web application of the target machine.',
    },
  },
  {
    id: 'desktop-icon-guide',
    target: '[data-tour="desktop-icon-guide"]',
    waitFor: '[data-tour="guide-window"]',
    interactive: true,
    title: { es: 'Manual de uso', en: 'User manual' },
    body: {
      es: 'Este icono abre el manual de uso del simulador. Hacé clic para abrirlo.',
      en: 'This icon opens the simulator user manual. Click to open it.',
    },
  },
  {
    id: 'guide-window',
    target: '[data-tour="guide-window"]',
    title: { es: 'Manual de uso', en: 'User manual' },
    body: {
      es: 'Este es el manual del simulador. Podés consultarlo cuando tengas dudas sobre cómo funciona el entorno.',
      en: 'This is the simulator manual. Check it whenever you have questions about how the environment works.',
    },
  },
  {
    id: 'desktop-icon-foxy',
    target: '[data-tour="desktop-icon-foxy"]',
    title: { es: 'Icono de Foxy', en: 'Foxy icon' },
    body: {
      es: 'Este es el acceso directo a mí. Si querés repetir esta guía, hacé clic en este icono del escritorio.',
      en: 'This is my shortcut. If you want to repeat this guide, click this desktop icon.',
    },
  },
  {
    id: 'mission-panel',
    target: '[data-tour="mission-panel"]',
    title: { es: 'Panel de misiones', en: 'Missions panel' },
    body: {
      es: 'Este es el panel de misiones. Cada paso te indica qué acción completar para avanzar en el laboratorio.',
      en: 'This is the missions panel. Each step tells you what action to complete to advance in the lab.',
    },
  },
  {
    id: 'attacker-creds',
    target: '[data-tour="attacker-creds"]',
    title: { es: 'Credenciales del atacante', en: 'Attacker credentials' },
    body: {
      es: 'Estas son las credenciales de tu máquina atacante (Kali). El usuario "kali" es un usuario común y "root" es el superusuario. Ambos comparten la contraseña "zilabs". Podés usarlas con "su" dentro de tu terminal.',
      en: 'These are the credentials of your attacker machine (Kali). The user "kali" is a common user and "root" is the superuser. They both share the password "zilabs". You can use them with "su" inside your terminal.',
    },
  },
  {
    id: 'network-map-btn',
    target: '[data-tour="network-map-btn"]',
    waitFor: '[data-tour="network-map"]',
    interactive: true,
    title: { es: 'Ver red', en: 'View network' },
    body: {
      es: 'Este botón abre la topología de la red. Hacé clic en "Ver red" para ver las máquinas y su información.',
      en: 'This button opens the network topology. Click "View network" to see the machines and their info.',
    },
  },
  {
    id: 'network-map-topology',
    target: '[data-tour="network-map-topology"]',
    title: { es: 'Topología de red', en: 'Network topology' },
    body: {
      es: 'Estas son las máquinas del laboratorio. A medida que avanzás en el reconocimiento (arp-scan, nmap, gobuster...), cada PC va mostrando nueva información: IPs, sistemas operativos, puertos y servicios.',
      en: 'These are the lab machines. As you progress in the reconnaissance (arp-scan, nmap, gobuster...), each PC reveals new info: IPs, OS, ports and services.',
    },
  },
  {
    id: 'network-map-enum',
    target: '[data-tour="network-map-enum"]',
    // El panel de enumeración no existe al inicio del lab (máquinas sin descubrir):
    // la burbuja igual se ubica a la derecha, donde estaría el panel.
    align: 'right',
    title: { es: 'Enumeración automática', en: 'Automatic enumeration' },
    body: {
      es: 'Acá se van agregando automáticamente las credenciales, puertos y servicios que vas descubriendo. Cuando hay una novedad, el botón "Ver red" se ilumina para avisarte.',
      en: 'Credentials, ports and services you discover are added here automatically. When something new appears, the "View network" button lights up to alert you.',
    },
  },
  {
    id: 'network-map-close',
    target: '[data-tour="network-map-close"]',
    waitForHidden: '[data-tour="network-map"]',
    interactive: true,
    title: { es: 'Cerrar la topología', en: 'Close the topology' },
    body: {
      es: 'Cuando termines de explorarla, cerrá la topología con la X para volver al escritorio.',
      en: 'When you\'re done exploring, close the topology with the X to return to the desktop.',
    },
  },
  {
    id: 'apps-menu',
    target: '[data-tour="apps-btn"]',
    title: { es: 'Menú Aplicaciones', en: 'Applications menu' },
    body: {
      es: 'El menú Aplicaciones te permite abrir terminales, el navegador, el manual y cambiar el fondo de pantalla. También tiene mi opción "Guía con Foxy" para repetir este recorrido.',
      en: 'The Applications menu lets you open terminals, the browser, the manual, and change the wallpaper. It also has my "Guide with Foxy" option to repeat this tour.',
    },
  },
  {
    id: 'end',
    title: { es: '¡Eso es todo!', en: 'That\'s all!' },
    body: {
      es: 'Ya sabés orientarte en el laboratorio. Ahora a ponerte manos a la obra. Suerte, hacker. Si querés volver a verme, abrí mi icono del escritorio o la opción "Guía con Foxy" del menú Aplicaciones.',
      en: 'You now know your way around the lab. Time to get to work. Good luck, hacker. If you want to see me again, open my desktop icon or the "Guide with Foxy" option in the Applications menu.',
    },
  },
];

/** Pasos visibles según el DOM: los marcados con skipIfMissing se omiten si su target no existe. */
export function getTourSteps(): TourStep[] {
  if (typeof document === 'undefined') return TOUR_STEPS;
  const visible: TourStep[] = [];
  for (let i = 0; i < TOUR_STEPS.length; i++) {
    const s = TOUR_STEPS[i];
    if (s.skipIfMissing && s.target && !document.querySelector(s.target)) {
      // Se omite el paso y el siguiente (la ventana que abre, p. ej. browser-window)
      i += 1;
      continue;
    }
    visible.push(s);
  }
  return visible;
}
