// ── commands/builtin/hashcat.ts ───────────────────────────────────
// Simulador de crackeo de hashes
// NOTA: Estos son hashes FICTICIOS para propósitos educativos únicamente
// Los hashes MD5 mostrados son de contraseñas de ejemplo como "hello"
// NUNCA uses hashes reales en este simulador

import type { CommandResponse } from '../../types';

export const cmd_hashcat = {
  name: 'hashcat',
  execute: (args: string[]): CommandResponse => {
    const mIdx = args.indexOf('-m');
    if (mIdx === -1 || args.length < 4)
      return { output: 'Uso: hashcat -m 0 hash.txt rockyou.txt', isError: true };
    const mode = args[mIdx + 1];
    if (!mode || isNaN(Number(mode)))
      return { output: `Error: modo inválido "${mode}". Ejemplo: -m 0`, isError: true };
    const hf = args[args.length - 2];
    const wf = args[args.length - 1];
    if (!hf || !wf || hf.startsWith('-') || wf.startsWith('-'))
      return { output: 'Uso: hashcat -m 0 hash.txt rockyou.txt', isError: true };
    if (!wf.includes('rockyou'))
      return { output: `Error: wordlist "${wf}" no soportada. Usa rockyou.txt`, isError: true };

    // Hash ficticio para demo educativo - MD5 de "hello"
    const demoHash = '5d41402abc4b2a76b9719d911017c592';

    return {
      output: `hashcat (v6.2.5) starting...\n* Device #1: Intel Core i7 [12.5 MH/s]\n* Device #2: NVIDIA RTX 3080 [450 MH/s]\n\n[+] Hash.Target: ${hf}\n[+] Status: Cracked\n\n${demoHash}:hello\n\nSession: Cracked ✓\n\n⚠️  NOTA: Este es un simulador educativo. Los hashes mostrados son ficticios.`
    };
  }
};
