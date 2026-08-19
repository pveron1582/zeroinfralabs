// ── components/admin/lesson-builder/generateLessonTs.ts ────────────
// Genera el archivo .ts listo para pegarlo en src/academy/

import type { LessonDraft } from '../LessonBuilder';
import type { LessonStep } from '../../../types';

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function stepToTs(step: LessonStep): string {
  switch (step.type) {
    case 'foxy-narrator':
      return `      {
        type: 'foxy-narrator',
        messages: [
${step.messages.map(m => `          { es: '${esc(m.es)}', en: '${esc(m.en)}' },`).join('\n')}
        ],
      },`;
    case 'content':
      return `      {
        type: 'content',
        title: '${esc(step.title)}',
        titleEs: '${esc(step.titleEs)}',
        body: '${esc(step.body)}',
        bodyEs: '${esc(step.bodyEs)}',
      },`;
    case 'terminal-demo':
      return `      {
        type: 'terminal-demo',
        command: '${esc(step.command)}',
        output: '${esc(step.output)}',
        explanation: '${esc(step.explanation)}',
        explanationEs: '${esc(step.explanationEs)}',
      },`;
    case 'video':
      return `      {
        type: 'video',
        src: '${esc(step.src)}',
        durationSec: ${step.durationSec},
        caption: '${esc(step.caption || '')}',
        captionEs: '${esc(step.captionEs || '')}',
      },`;
    case 'practical-exercise':
      return `      {
        type: 'practical-exercise',
        task: '${esc(step.task)}',
        taskEs: '${esc(step.taskEs)}',
        hint: '${esc(step.hint)}',
        hintEs: '${esc(step.hintEs)}',
        labId: '${esc(step.labId || '')}',
      },`;
    case 'quiz':
      return `      {
        type: 'quiz',
        question: '${esc(step.question)}',
        questionEs: '${esc(step.questionEs)}',
        options: [
${step.options.map(o => `          { es: '${esc(o.es)}', en: '${esc(o.en)}' },`).join('\n')}
        ],
        correctIndex: ${step.correctIndex},
      },`;
    case 'lab-challenge':
      return `      {
        type: 'lab-challenge',
        labId: '${esc(step.labId)}',
        missionObjective: '${esc(step.missionObjective)}',
        missionObjectiveEs: '${esc(step.missionObjectiveEs)}',
      },`;
    case 'interactive-demo':
      return `      {
        type: 'interactive-demo',
        demoKind: '${step.demoKind}',
        instructions: '${esc(step.instructions)}',
        instructionsEs: '${esc(step.instructionsEs)}',
      },`;
    case 'matching':
      return `      {
        type: 'matching',
        title: '${esc(step.title)}',
        titleEs: '${esc(step.titleEs)}',
        instructions: '${esc(step.instructions)}',
        instructionsEs: '${esc(step.instructionsEs)}',
        pairs: [
${step.pairs.map(p => `          { left: '${esc(p.left)}', leftEs: '${esc(p.leftEs)}', right: '${esc(p.right)}', rightEs: '${esc(p.rightEs)}' },`).join('\n')}
        ],
      },`;
    default: {
      const _exhaustive: never = step;
      throw new Error(`step type desconocido: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

export function generateLessonTs(draft: LessonDraft): string {
  return `// Auto-generado por el Lesson Builder
// Pegar en src/academy/ le corresponde la sección y exportarlo.

import type { Lesson } from '../types';

export const LESSON_${draft.id.toUpperCase().replace(/-/g, '_')}: Lesson = {
  id: '${draft.id}',
  pathId: '${draft.pathId}',
  order: ${draft.order},
  title: '${esc(draft.title)}',
  titleEs: '${esc(draft.titleEs)}',
  readingMinutes: ${draft.readingMinutes},${draft.labRef ? `\n  labRef: '${draft.labRef}',` : ''}
  steps: [
${draft.steps.map(stepToTs).join('\n')}
  ],
};
`;
}
