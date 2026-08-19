// ── components/feedbackModal/CaptchaSection.tsx ─────────────────
// Sección de verificación visual con una pregunta + opciones

import type { CaptchaQuestion } from './captcha';

interface Props {
  language: 'en' | 'es';
  captchaQuestion: CaptchaQuestion;
  captchaPassed: boolean;
  wrongAnswer: boolean;
  captchaTitle: string;
  captchaPassedText: string;
  wrongAnswerText: string;
  onAnswer: (answer: string) => void;
  onReset: () => void;
}

export function CaptchaSection({
  language,
  captchaQuestion,
  captchaPassed,
  wrongAnswer,
  captchaTitle,
  captchaPassedText,
  wrongAnswerText,
  onAnswer,
  onReset,
}: Props) {
  return (
    <div className="border-t border-gray-700 pt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{language === 'es' ? 'Verificación' : 'Verification'}</span>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          🔄 {language === 'es' ? 'Nueva pregunta' : 'New question'}
        </button>
      </div>

      {captchaPassed ? (
        <div className="flex items-center justify-center py-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <span className="text-emerald-400 font-medium">✓ {captchaPassedText}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 text-center">{captchaTitle}</p>

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
                  onClick={() => onAnswer(option)}
                  className="px-4 py-2 rounded-lg text-sm border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400 transition-all"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {wrongAnswer && (
            <div className="text-center text-red-400 text-sm animate-pulse">
              {wrongAnswerText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
