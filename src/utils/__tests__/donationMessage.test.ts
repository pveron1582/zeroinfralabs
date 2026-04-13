// ── utils/__tests__/donationMessage.test.ts ─────────────────────────
import { describe, it, expect } from 'vitest';
import { getDonationMessage, MP_ALIAS } from '../donationMessage';

describe('donationMessage', () => {
  describe('MP_ALIAS', () => {
    it('debe exportar el alias correcto', () => {
      expect(MP_ALIAS).toBe('pablo.m.veron.mp');
      expect(typeof MP_ALIAS).toBe('string');
    });
  });

  describe('getDonationMessage', () => {
    it('debe retornar mensaje en español cuando language es "es"', () => {
      const message = getDonationMessage('es');
      
      expect(message).toContain('☕');
      expect(message).toContain('Si este laboratorio te fue útil');
      expect(message).toContain('Mercado Pago');
      expect(message).toContain('alias:');
      expect(message).toContain(MP_ALIAS);
      expect(message).toContain('Cualquier ayuda suma');
    });

    it('debe retornar mensaje en inglés cuando language no es "es"', () => {
      const message = getDonationMessage('en');
      
      expect(message).toContain('☕');
      expect(message).toContain('If this lab was useful');
      expect(message).toContain('Mercado Pago');
      expect(message).toContain('alias:');
      expect(message).toContain(MP_ALIAS);
      expect(message).toContain('Every bit helps');
    });

    it('debe retornar mensaje en inglés por defecto', () => {
      const messageDefault = getDonationMessage('en');
      const messageFr = getDonationMessage('fr');
      const messageDe = getDonationMessage('de');
      
      // Todos deberían ser en inglés
      expect(messageFr).toBe(messageDefault);
      expect(messageDe).toBe(messageDefault);
    });

    it('debe incluir el alias en el mensaje', () => {
      const esMessage = getDonationMessage('es');
      const enMessage = getDonationMessage('en');
      
      expect(esMessage).toContain(MP_ALIAS);
      expect(enMessage).toContain(MP_ALIAS);
    });

    it('debe tener formato consistente con saltos de línea', () => {
      const message = getDonationMessage('en');
      
      expect(message.startsWith('\n')).toBe(true);
      expect(message).toContain('\n   '); // Indentación
    });

    it('mensaje en español debe ser diferente al de inglés', () => {
      const esMessage = getDonationMessage('es');
      const enMessage = getDonationMessage('en');
      
      expect(esMessage).not.toBe(enMessage);
    });
  });
});
