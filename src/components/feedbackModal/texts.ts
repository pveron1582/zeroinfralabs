// ── components/feedbackModal/texts.ts ───────────────────────────
// Textos del modal de feedback (ES/EN)

export type FeedbackLanguage = 'en' | 'es';

export const FEEDBACK_TEXTS = {
  en: {
    title: 'Feedback',
    name: 'Name',
    namePlaceholder: 'Your name',
    emailOptional: 'Email (optional)',
    emailNote: 'If you want a response',
    comment: 'Comment',
    commentPlaceholder: 'Tell us what you think...',
    captchaTitle: 'What do you see in the image?',
    captchaPassed: 'Captcha verified!',
    wrongAnswer: 'Incorrect! Try again.',
    submit: 'Submit',
    success: 'Thank you for your feedback!',
  },
  es: {
    title: 'Comentarios',
    name: 'Nombre',
    namePlaceholder: 'Tu nombre',
    emailOptional: 'Email (opcional)',
    emailNote: 'Si querés que te respondamos',
    comment: 'Comentario',
    commentPlaceholder: 'Contanos qué pensás...',
    captchaTitle: '¿Qué ves en la imagen?',
    captchaPassed: '¡Captcha verificado!',
    wrongAnswer: '¡Incorrecto! Intentá de nuevo.',
    submit: 'Enviar',
    success: '¡Gracias por tu comentario!',
  },
};
