// ── components/FeedbackModal.tsx ─────────────────────────────────────
// Modal para enviar feedback general del sitio

import React, { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../i18n/translations';
import { trackEvent } from '../utils/analytics';

const CAPTCHA_IMAGES = [
  { id: 'dog', labelEn: 'Dog', labelEs: 'Perro' },
  { id: 'cat', labelEn: 'Cat', labelEs: 'Gato' },
  { id: 'bird', labelEn: 'Bird', labelEs: 'Pájaro' },
  { id: 'fish', labelEn: 'Fish', labelEs: 'Pez' },
  { id: 'butterfly', labelEn: 'Tower', labelEs: 'Torre' },
  { id: 'car', labelEn: 'Car', labelEs: 'Auto' },
  { id: 'motorcycle', labelEn: 'Motorcycle', labelEs: 'Moto' },
  { id: 'bicycle', labelEn: 'Bicycle', labelEs: 'Bicicleta' },
  { id: 'airplane', labelEn: 'Airplane', labelEs: 'Avión' },
  { id: 'boat', labelEn: 'Girl', labelEs: 'Mujer' },
  { id: 'chair', labelEn: 'Chair', labelEs: 'Silla' },
  { id: 'table', labelEn: 'Table', labelEs: 'Mesa' },
  { id: 'bed', labelEn: 'Bed', labelEs: 'Cama' },
  { id: 'sofa', labelEn: 'Sofa', labelEs: 'Sofá' },
  { id: 'shelf', labelEn: 'Shelf', labelEs: 'Estante' },
  { id: 'glass', labelEn: 'Glasses', labelEs: 'Lentes' },
  { id: 'book', labelEn: 'Book', labelEs: 'Libro' },
  { id: 'watch', labelEn: 'Watch', labelEs: 'Reloj' },
  { id: 'camera', labelEn: 'Camera', labelEs: 'Cámara' },
  { id: 'keyboard', labelEn: 'Keyboard', labelEs: 'Teclado' },
  { id: 'tree', labelEn: 'Tree', labelEs: 'Árbol' },
  { id: 'flower', labelEn: 'Flower', labelEs: 'Flor' },
  { id: 'mountain', labelEn: 'Mountain', labelEs: 'Montaña' },
  { id: 'ocean', labelEn: 'Ocean', labelEs: 'Mar' },
  { id: 'river', labelEn: 'Beach', labelEs: 'Playa' },
];

interface CaptchaImage {
  id: string;
  labelEn: string;
  labelEs: string;
}

interface CaptchaQuestion {
  image: CaptchaImage;
  options: string[];
  correctAnswer: string;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateCaptchaQuestion(isSpanish: boolean): CaptchaQuestion {
  const shuffled = shuffle(CAPTCHA_IMAGES);
  const correct = shuffled[0];
  const others = CAPTCHA_IMAGES.filter(img => img.id !== correct.id);
  const distractors = shuffle(others).slice(0, 4);
  
  const getLabel = (img: CaptchaImage) => isSpanish ? img.labelEs : img.labelEn;
  
  const options = shuffle([
    getLabel(correct),
    ...distractors.map(d => getLabel(d))
  ]);
  
  return {
    image: correct,
    options,
    correctAnswer: getLabel(correct),
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: Props) {
  const language = useLanguage();
  const isSpanish = language === 'es';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState<CaptchaQuestion>(() => generateCaptchaQuestion(isSpanish));
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setEmail('');
      setComment('');
      setCaptchaPassed(false);
      setFormError('');
      setSubmitted(false);
      setWrongAnswer(false);
      setCaptchaQuestion(generateCaptchaQuestion(isSpanish));
    }
  }, [isOpen, isSpanish]);
  
  const t = {
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
  
  const texts = t[language];
  
  const handleAnswer = useCallback((answer: string) => {
    if (answer === captchaQuestion.correctAnswer) {
      setWrongAnswer(false);
      setCaptchaPassed(true);
    } else {
      setWrongAnswer(true);
      setCaptchaQuestion(generateCaptchaQuestion(isSpanish));
      setTimeout(() => setWrongAnswer(false), 1500);
    }
  }, [captchaQuestion]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !comment.trim()) {
      setFormError(language === 'es' ? 'Nombre y comentario son obligatorios' : 'Name and comment are required');
      return;
    }
    
    if (!captchaPassed) {
      setFormError(language === 'es' ? 'Completá el captcha primero' : 'Complete the captcha first');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        name: name.trim(),
        email: email.trim() || null,
        comment: comment.trim(),
      };
      
      trackEvent({
        eventType: 'feedback_submitted',
        details: feedbackData,
      });
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setName('');
        setEmail('');
        setComment('');
        setCaptchaQuestion(generateCaptchaQuestion(isSpanish));
        setCaptchaPassed(false);
      }, 2000);
    } catch {
      setFormError(language === 'es' ? 'Error al enviar. Intentá de nuevo.' : 'Error submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, comment, captchaPassed, language, onClose]);
  
  const handleResetCaptcha = useCallback(() => {
    setCaptchaQuestion(generateCaptchaQuestion(isSpanish));
    setCaptchaPassed(false);
    setWrongAnswer(false);
  }, [isSpanish]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-violet-400">{texts.title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-lg text-emerald-400">{texts.success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">{texts.name} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={texts.namePlaceholder}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                  required
                />
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">{texts.emailOptional}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">{texts.emailNote}</p>
              </div>
              
              {/* Captcha - Single Question */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">{language === 'es' ? 'Verificación' : 'Verification'}</span>
                  <button
                    type="button"
                    onClick={handleResetCaptcha}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    🔄 {language === 'es' ? 'Nueva pregunta' : 'New question'}
                  </button>
                </div>
                
                {captchaPassed ? (
                  <div className="flex items-center justify-center py-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <span className="text-emerald-400 font-medium">✓ {texts.captchaPassed}</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400 text-center">{texts.captchaTitle}</p>
                    
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={`/captcha/${captchaQuestion.image.id}.jpg`}
                        alt="captcha"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-violet-500/50 shadow-lg shadow-violet-500/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      
                      <div className="flex flex-wrap justify-center gap-2">
                        {captchaQuestion.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => handleAnswer(option)}
                            className="px-4 py-2 rounded-lg text-sm border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400 transition-all"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {wrongAnswer && (
                      <div className="text-center text-red-400 text-sm animate-pulse">
                        {texts.wrongAnswer}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Comment */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">{texts.comment} *</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={texts.commentPlaceholder}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  required
                />
              </div>
              
              {/* Error */}
              {formError && (
                <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {formError}
                </div>
              )}
              
              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !captchaPassed}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isSubmitting ? (language === 'es' ? 'Enviando...' : 'Sending...') : texts.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
