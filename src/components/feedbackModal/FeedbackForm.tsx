// ── components/feedbackModal/FeedbackForm.tsx ───────────────────
// Formulario de feedback: nombre, email opcional, captcha y comentario

import type { CaptchaQuestion } from './captcha';
import { CaptchaSection } from './CaptchaSection';

interface Props {
  language: 'en' | 'es';
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  comment: string;
  setComment: (v: string) => void;
  captchaQuestion: CaptchaQuestion;
  captchaPassed: boolean;
  wrongAnswer: boolean;
  formError: string;
  isSubmitting: boolean;
  texts: {
    name: string;
    namePlaceholder: string;
    emailOptional: string;
    emailNote: string;
    comment: string;
    commentPlaceholder: string;
    captchaTitle: string;
    captchaPassed: string;
    wrongAnswer: string;
    submit: string;
  };
  onSubmit: (e: React.FormEvent) => void;
  onAnswer: (answer: string) => void;
  onResetCaptcha: () => void;
}

export function FeedbackForm({
  language,
  name,
  setName,
  email,
  setEmail,
  comment,
  setComment,
  captchaQuestion,
  captchaPassed,
  wrongAnswer,
  formError,
  isSubmitting,
  texts,
  onSubmit,
  onAnswer,
  onResetCaptcha,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <CaptchaSection
        language={language}
        captchaQuestion={captchaQuestion}
        captchaPassed={captchaPassed}
        wrongAnswer={wrongAnswer}
        captchaTitle={texts.captchaTitle}
        captchaPassedText={texts.captchaPassed}
        wrongAnswerText={texts.wrongAnswer}
        onAnswer={onAnswer}
        onReset={onResetCaptcha}
      />

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
  );
}
