// ── components/SurveyModal.tsx ─────────────────────────────────────
// Post-lab survey modal — collects rating, difficulty, recommendation and comments

import React, { useState } from 'react';
import type { Scenario } from '../types';
import { useT } from '../i18n/translations';
import { trackEvent } from '../utils/analytics';

interface SurveyModalProps {
  scenario: Scenario;
  onSubmit: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'very-hard';

export const SurveyModal = ({ scenario, onSubmit }: SurveyModalProps) => {
  const t = useT();

  const [overall, setOverall] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    trackEvent({
      eventType: 'survey_submitted',
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      details: { overall, difficulty, recommend, comments },
    });
    setSubmitted(true);
    setTimeout(onSubmit, 1500);
  };

  const handleSkip = () => {
    onSubmit();
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-white mb-2">{t('surveyThanks')}</h2>
          <p className="text-gray-400 text-sm">{scenario.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t('surveyTitle')}</h2>
          <p className="text-gray-400 text-sm mt-1">{scenario.name}</p>
          <p className="text-gray-500 text-xs mt-1">{t('surveySubtitle')}</p>
        </div>

        {/* Overall Rating 1-10 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">{t('surveyOverall')}</label>
          <div className="flex justify-center gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setOverall(n)}
                className={`w-8 h-8 rounded-full text-sm font-bold transition-all
                  ${overall >= n
                    ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">{t('surveyDifficulty')}</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'easy', label: t('surveyEasy') },
              { value: 'medium', label: t('surveyMedium') },
              { value: 'hard', label: t('surveyHard') },
              { value: 'very-hard', label: t('surveyVeryHard') },
            ] as { value: Difficulty; label: string }[]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDifficulty(opt.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all
                  ${difficulty === opt.value
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommend */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">{t('surveyRecommend')}</label>
          <div className="flex justify-center gap-4">
            {([
              { value: true, label: t('surveyYes') },
              { value: false, label: t('surveyNo') },
            ] as { value: boolean; label: string }[]).map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setRecommend(opt.value)}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all
                  ${recommend === opt.value
                    ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2">{t('surveyComments')}</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={t('surveyCommentsPlaceholder')}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all"
          >
            {t('surveySkip')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            {t('surveySubmit')}
          </button>
        </div>
      </div>
    </div>
  );
};
