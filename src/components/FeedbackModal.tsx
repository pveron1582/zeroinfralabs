// ── components/FeedbackModal.tsx ─────────────────────────────────────
// Modal para enviar feedback general del sitio

import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../i18n/translations';
import { trackEvent } from '../utils/analytics';
import { generateCaptchaQuestion, type CaptchaQuestion } from './feedbackModal/captcha';
import { FEEDBACK_TEXTS } from './feedbackModal/texts';
import { SubmittedView, CooldownView } from './feedbackModal/StatusViews';
import { FeedbackForm } from './feedbackModal/FeedbackForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: Props) {
  const language = useLanguage();
  const isSpanish = language === 'es';
  const COOLDOWN_MS = 5 * 60 * 1000;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState<CaptchaQuestion>(() => generateCaptchaQuestion(isSpanish));
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Check cooldown on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      const lastSubmit = localStorage.getItem('feedback_last_submit');
      if (lastSubmit) {
        const elapsed = Date.now() - parseInt(lastSubmit, 10);
        const remaining = COOLDOWN_MS - elapsed;
        if (remaining > 0) {
          setCooldownRemaining(remaining);
        } else {
          setCooldownRemaining(0);
        }
      }
    }
  }, [isOpen]);

  // Update countdown timer
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining > 0]);

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

  const texts = FEEDBACK_TEXTS[language];

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

      localStorage.setItem('feedback_last_submit', Date.now().toString());
      setCooldownRemaining(COOLDOWN_MS);

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
            <SubmittedView text={texts.success} />
          ) : cooldownRemaining > 0 ? (
            <CooldownView language={language} remaining={cooldownRemaining} />
          ) : (
            <FeedbackForm
              language={language}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              comment={comment}
              setComment={setComment}
              captchaQuestion={captchaQuestion}
              captchaPassed={captchaPassed}
              wrongAnswer={wrongAnswer}
              formError={formError}
              isSubmitting={isSubmitting}
              texts={texts}
              onSubmit={handleSubmit}
              onAnswer={handleAnswer}
              onResetCaptcha={handleResetCaptcha}
            />
          )}
        </div>
      </div>
    </div>
  );
}
