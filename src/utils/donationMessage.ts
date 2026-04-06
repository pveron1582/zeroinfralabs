// ── utils/donationMessage.ts ────────────────────────────────────────
// Mensaje de donación reutilizable para mostrar tras completar exploits

export const MP_ALIAS = 'pablo.m.veron.mp';

export function getDonationMessage(language: string): string {
  const isSpanish = language === 'es';
  return isSpanish
    ? `\n☕ Si este laboratorio te fue útil, apoyanos con un aporte:\n   Mercado Pago → alias: ${MP_ALIAS}\n   ¡Cualquier ayuda suma!`
    : `\n☕ If this lab was useful, help us with a donation:\n   Mercado Pago → alias: ${MP_ALIAS}\n   Every bit helps!`;
}
