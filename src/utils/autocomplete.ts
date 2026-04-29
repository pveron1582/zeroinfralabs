// ── utils/autocomplete.ts ─────────────────────────────────────────
// Sistema de autocompletado para la terminal
// Soporta autocompletado de comandos y archivos/directorios
// Similar al comportamiento de bash/zsh en Linux

import type { Machine } from '../types';
import { MSF_MODULES } from '../commands/tools/msfModules';

// Comandos de Metasploit para autocompletar
const MSF_COMMANDS = [
  'use', 'show', 'set', 'back', 'run', 'exploit', 'check', 'exit', 'help', 'search', 'options', 'info'
];
// Se usa para autocompletar cuando el usuario escribe el primer argumento
const AVAILABLE_COMMANDS = [
  'help',
  'clear',
  'whoami',
  'ifconfig',
  'ls',
  'cat',
  'cd',
  'mkdir',
  'rmdir',
  'sudo',
  'exit',
  'end',
  'hashcat',
  'arp-scan',
  'netdiscover',
  'nmap',
  'gobuster',
  'hydra',
  'ssh',
  'nc',
  'ftp',
  'msfconsole',
  'ping',
  'traceroute',
  'ps',
  'top',
  'htop',
  'which',
];

/**
 * Obtiene los archivos y directorios en un directorio específico
 * 
 * Esta función es la base del sistema de autocompletado de archivos.
 * Analiza los archivos de la máquina virtual y extrae los nombres
 * de archivos y directorios que existen en el directorio objetivo.
 * 
 * @param machine - Máquina virtual con el sistema de archivos
 * @param targetDir - Directorio donde buscar (ej: '/etc/' o '/var/log/')
 * @returns Array de nombres de archivos/directorios encontrados, ordenados alfabéticamente
 * 
 * Ejemplo:
 * - Si targetDir='/etc/' y hay archivos '/etc/passwd' y '/etc/shadow'
 * - Retorna: ['passwd', 'shadow']
 * 
 * Nota: Los directorios se marcan con '/' al final para diferenciarlos de archivos
 */
function getItemsInDirectory(machine: Machine, targetDir: string): string[] {
  if (!machine.files) return [];
  
  const items = new Set<string>();
  const normalizedDir = targetDir.endsWith('/') ? targetDir : targetDir + '/';
  
  machine.files.forEach(file => {
    const filePath = file.path;
    
    if (filePath.startsWith(normalizedDir)) {
      const relativePath = filePath.slice(normalizedDir.length);
      
      if (relativePath.includes('/')) {
        // Es un subdirectorio
        const dir = relativePath.split('/')[0];
        // Ignorar marcadores de directorio internos
        if (dir && dir !== '.dir') {
          items.add(dir + '/');
        }
      } else if (relativePath && relativePath !== '.dir' && !relativePath.endsWith('.dir')) {
        // Es un archivo directo, ignorar marcadores .dir
        items.add(relativePath);
      }
    }
  });
  
  return Array.from(items).sort();
}

/**
 * Autocompleta comandos basándose en el prefijo
 * 
 * Filtra la lista de comandos disponibles y retorna solo aquellos
 * que comienzan con el prefijo proporcionado. La búsqueda es
 * case-insensitive (no distingue mayúsculas/minúsculas).
 * 
 * @param partial - Prefijo del comando a autocompletar (ej: 'na' o 'NA')
 * @returns Array de comandos que coinciden con el prefijo
 * 
 * Ejemplos:
 * - autocompleteCommand('na') → ['nmap']
 * - autocompleteCommand('s') → ['sudo', 'ssh']
 * - autocompleteCommand('') → todos los comandos disponibles
 * - autocompleteCommand('xyz') → [] (sin coincidencias)
 */
export function autocompleteCommand(partial: string): string[] {
  if (!partial) return AVAILABLE_COMMANDS;
  
  const lowerPartial = partial.toLowerCase();
  return AVAILABLE_COMMANDS.filter(cmd => cmd.startsWith(lowerPartial));
}

/**
 * Autocompleta archivos y directorios basándose en el prefijo
 * 
 * Busca archivos y directorios en el sistema de archivos de la máquina
 * que coincidan con el prefijo proporcionado. Soporta tanto paths
 * absolutos (ej: '/etc/pa') como relativos (ej: 'pa' desde '/etc/').
 * 
 * @param partial - Prefijo del archivo/directorio a autocompletar
 * @param machine - Máquina virtual con el sistema de archivos
 * @param currentDir - Directorio actual del usuario
 * @returns Array de nombres de archivos/directorios que coinciden
 * 
 * Ejemplos:
 * - autocompleteFile('pa', machine, '/etc/') → ['passwd']
 * - autocompleteFile('/etc/pa', machine, '/') → ['passwd']
 * - autocompleteFile('', machine, '/etc/') → todos los items de /etc/
 */
/**
 * Autocompleta dentro de Metasploit
 */
export function autocompleteMsf(word: string, input: string, isFirstWord: boolean, msfState?: any): string[] {
  const lowerWord = word.toLowerCase();
  
  if (isFirstWord) {
    return MSF_COMMANDS.filter(c => c.startsWith(lowerWord));
  }
  
  const cmd = input.trim().split(/\s+/)[0].toLowerCase();
  
  if (cmd === 'use') {
    // Autocompleta módulos (auxiliary/, exploit/, etc)
    return MSF_MODULES.map(m => m.path).filter(p => p.startsWith(lowerWord));
  }
  
  if (cmd === 'set') {
    // Autocompleta opciones (RHOSTS, LHOST, etc)
    const options = msfState?.options ? Object.keys(msfState.options) : ['RHOSTS', 'LHOST', 'RPORT', 'LPORT', 'PAYLOAD', 'THREADS'];
    return options.map(o => o.toUpperCase()).filter(o => o.startsWith(word.toUpperCase()));
  }
  
  if (cmd === 'show') {
    const opts = ['options', 'info', 'payloads', 'targets', 'exploits', 'auxiliary'];
    return opts.filter(o => o.startsWith(lowerWord));
  }
  
  return [];
}

export function autocompleteFile(
  partial: string,
  machine: Machine,
  currentDir: string
): string[] {
  if (!partial) {
    // Si no hay prefijo, mostrar todos los items del directorio actual
    return getItemsInDirectory(machine, currentDir);
  }
  
  // Determinar si el path es absoluto o relativo
  let basePath: string;
  let prefix: string;
  
  if (partial.startsWith('/')) {
    // Path absoluto
    const lastSlash = partial.lastIndexOf('/');
    basePath = partial.slice(0, lastSlash + 1) || '/';
    prefix = partial.slice(lastSlash + 1);
  } else {
    // Path relativo
    basePath = currentDir.endsWith('/') ? currentDir : currentDir + '/';
    const lastSlash = partial.lastIndexOf('/');
    
    if (lastSlash >= 0) {
      // El prefijo contiene un directorio
      basePath = basePath + partial.slice(0, lastSlash + 1);
      prefix = partial.slice(lastSlash + 1);
    } else {
      // Solo nombre de archivo/directorio
      prefix = partial;
    }
  }
  
  // Obtener items en el directorio base
  const items = getItemsInDirectory(machine, basePath);
  
  // Filtrar por el prefijo y retornar paths completos para absolutos
  const filteredItems = items.filter(item => item.startsWith(prefix));
  
  // Si es un path absoluto, retornar el path completo
  if (partial.startsWith('/')) {
    return filteredItems.map(item => basePath + item);
  }
  
  return filteredItems;
}

/**
 * Función principal de autocompletado
 * 
 * Esta es la función que se llama desde el componente Terminal cuando
 * el usuario presiona Tab. Determina si se está autocompletando un
 * comando o un archivo/directorio y retorna las sugerencias apropiadas.
 * 
 * @param input - Texto completo que el usuario ha escrito
 * @param cursorPos - Posición del cursor en el texto (0-indexed)
 * @param machine - Máquina virtual con el sistema de archivos
 * @param currentDir - Directorio actual del usuario
 * @returns Objeto con:
 *   - suggestions: Array de sugerencias de autocompletado
 *   - completedText: Texto completado (si solo hay una sugerencia)
 *   - replaceStart: Posición donde empezar a reemplazar el texto
 *   - replaceEnd: Posición donde terminar de reemplazar el texto
 * 
 * Ejemplo:
 * - Input: 'cat /etc/pa', cursor en posición 11
 * - Retorna: { suggestions: ['passwd'], completedText: 'cat /etc/passwd', ... }
 */
export function getAutocompleteSuggestions(
  input: string,
  cursorPos: number,
  machine: Machine,
  currentDir: string,
  msfState?: any
): { suggestions: string[]; completedText: string; replaceStart: number; replaceEnd: number } {
  // Extraer la parte del input hasta el cursor
  const textBeforeCursor = input.slice(0, cursorPos);
  
  // Encontrar la posición del último espacio
  const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ');
  
  // Determinar si estamos autocompletando un comando o un argumento
  const isFirstWord = lastSpaceIndex === -1;
  const wordToComplete = isFirstWord 
    ? textBeforeCursor 
    : textBeforeCursor.slice(lastSpaceIndex + 1);
  
  const replaceStart = isFirstWord ? 0 : lastSpaceIndex + 1;
  const replaceEnd = cursorPos;
  
  let suggestions: string[];
  
  if (msfState) {
    // Autocompletar Metasploit
    suggestions = autocompleteMsf(wordToComplete, input, isFirstWord, msfState);
  } else if (isFirstWord) {
    // Autocompletar comando del sistema
    suggestions = autocompleteCommand(wordToComplete);
  } else {
    // Autocompletar archivo/directorio
    suggestions = autocompleteFile(wordToComplete, machine, currentDir);
  }
  
  // Si hay una sola sugerencia, completar automáticamente
  let completedText = input;
  if (suggestions.length === 1) {
    const completion = suggestions[0];
    completedText = input.slice(0, replaceStart) + completion + input.slice(replaceEnd);
    
    // Si es un directorio y no termina con /, agregarlo para permitir más navegación
    if (completion.endsWith('/') && !completedText.endsWith('/')) {
      completedText = input.slice(0, replaceStart) + completion + input.slice(replaceEnd);
    }
  }
  
  return {
    suggestions,
    completedText,
    replaceStart,
    replaceEnd,
  };
}

/**
 * Encuentra el prefijo común más largo entre las sugerencias
 * 
 * Esta función se usa cuando hay múltiples sugerencias de autocompletado.
 * Encuentra el prefijo más largo que todas las sugerencias comparten,
 * permitiendo completar hasta ese punto y luego mostrar las opciones restantes.
 * 
 * @param suggestions - Array de sugerencias de autocompletado
 * @returns El prefijo común más largo
 * 
 * Ejemplos:
 * - findCommonPrefix(['nano', 'name', 'narrow']) → 'na'
 * - findCommonPrefix(['cat', 'cd', 'clear']) → 'c'
 * - findCommonPrefix(['test', 'test', 'test']) → 'test'
 * - findCommonPrefix(['abc', 'xyz']) → ''
 */
export function findCommonPrefix(suggestions: string[]): string {
  if (suggestions.length === 0) return '';
  if (suggestions.length === 1) return suggestions[0];
  
  let prefix = suggestions[0];
  
  for (let i = 1; i < suggestions.length; i++) {
    while (!suggestions[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === '') return '';
    }
  }
  
  return prefix;
}