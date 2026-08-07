// ── components/__tests__/SurveyModal.test.tsx ──────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SurveyModal } from '../SurveyModal';
import type { Scenario } from '../../types';
import { trackEvent } from '../../utils/analytics';

vi.mock('../../utils/analytics', () => ({
  trackEvent: vi.fn(),
}));

const mockScenario: Scenario = {
  id: 'lab-01',
  name: 'Lab 1',
  description: 'Test lab',
  difficulty: 'easy',
  category: 'network',
  network_range: '192.168.1.0/24',
  initialMachineId: 'kali',
  machines: [],
  missions: [],
};

describe('SurveyModal', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar el título y el nombre del escenario', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Rate this Lab')).toBeInTheDocument();
    expect(screen.getByText('Lab 1')).toBeInTheDocument();
  });

  it('debe renderizar los 10 botones de rating', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    for (let i = 1; i <= 10; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument();
    }
  });

  it('debe seleccionar una puntuación al hacer click', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    const btn5 = screen.getByRole('button', { name: '5' });
    fireEvent.click(btn5);
    expect(btn5.className).toContain('bg-emerald-500');
  });

  it('debe seleccionar dificultad al hacer click', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    const hardBtn = screen.getByRole('button', { name: 'Hard' });
    fireEvent.click(hardBtn);
    expect(hardBtn.className).toContain('bg-cyan-500');
  });

  it('debe seleccionar recomendación al hacer click', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    const yesBtn = screen.getByRole('button', { name: 'Yes' });
    fireEvent.click(yesBtn);
    expect(yesBtn.className).toContain('bg-violet-500');
  });

  it('debe escribir comentarios en el textarea', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText('Write anything you want to share (optional)...');
    fireEvent.change(textarea, { target: { value: 'Muy buen lab' } });
    expect(textarea).toHaveValue('Muy buen lab');
  });

  it('debe llamar a onSubmit al hacer click en Skip', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('debe llamar a trackEvent y mostrar gracias al enviar', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: '7' }));
    fireEvent.click(screen.getByRole('button', { name: 'Medium' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(trackEvent).toHaveBeenCalledWith({
      eventType: 'survey_submitted',
      scenarioId: 'lab-01',
      scenarioName: 'Lab 1',
      details: { overall: 7, difficulty: 'medium', recommend: true, comments: '' },
    });
    expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
  });

  it('debe llamar a onSubmit después de 1500ms tras enviar', () => {
    render(<SurveyModal scenario={mockScenario} onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    vi.advanceTimersByTime(1500);
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
});