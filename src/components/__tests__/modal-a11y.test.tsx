// ── components/__tests__/modal-a11y.test.tsx ──────────────────────
// P1 3.8: los modales ahora usan ModalShell (role="dialog", aria-modal,
// foco atrapado y Escape). Estos tests fijan el contrato en los diálogos
// donde el teclado importa de verdad: la confirmación de salida
// (destructiva), la encuesta de fin de lab, el detalle del LabGrid y el
// editor nano — los dos últimos se quedaron sin trampa en la primera tanda.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ExitConfirm } from '../ExitConfirm';
import { SurveyModal } from '../SurveyModal';
import { LabGrid } from '../LabGrid';
import { EditorModal } from '../EditorModal';
import { SCENARIOS } from '../../laboratorios/laboratorios';
import { makeTestScenario } from '../../test/fixtures';

// Mismo selector que usa useFocusTrap: si cambia allá, cambia acá.
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

describe('ExitConfirm', () => {
  it('no renderiza nada cuando está cerrado', () => {
    const { container } = render(<ExitConfirm open={false} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('es un diálogo con nombre accesible', () => {
    render(<ExitConfirm open onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: /confirmar salida|confirm exit/i })).toBeInTheDocument();
  });

  it('el foco arranca en Cancelar (no en la acción destructiva)', () => {
    render(<ExitConfirm open onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(document.activeElement).toBe(screen.getByText(/^Cancelar$|^Cancel$/));
  });

  it('Escape cancela (no confirma: un Enter a ciegas no puede perder el progreso)', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<ExitConfirm open onCancel={onCancel} onConfirm={onConfirm} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('clickear el fondo cancela y los botones hacen lo suyo', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const { unmount } = render(<ExitConfirm open onCancel={onCancel} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText(/Sí, salir|Yes, exit/));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    unmount();

    const onCancel2 = vi.fn();
    render(<ExitConfirm open onCancel={onCancel2} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onCancel2).toHaveBeenCalled();
  });
});

describe('SurveyModal', () => {
  const scenario = makeTestScenario();

  it('es un diálogo con nombre accesible y no se cierra clickeando el fondo', () => {
    const onSubmit = vi.fn();
    render(<SurveyModal scenario={scenario} onSubmit={onSubmit} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    fireEvent.click(dialog.parentElement!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('Enviar marca enviada y muestra el agradecimiento (sin Escape: es el cierre)', () => {
    const onSubmit = vi.fn();
    vi.useFakeTimers();
    render(<SurveyModal scenario={scenario} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText(/^Enviar$|^Submit$/));
    expect(screen.getByText(/¡Gracias por tu feedback|Thanks for your feedback/)).toBeInTheDocument();
    vi.advanceTimersByTime(1500);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('Omitir envía directo', () => {
    const onSubmit = vi.fn();
    render(<SurveyModal scenario={scenario} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText(/^Omitir$|^Skip$/));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

// Los dos diálogos que se quedaron sin trampa cuando se hizo la tanda de
// modales (P1 3.8): el detalle de lab y el editor nano.

describe('LabGrid — detalle del lab', () => {
  const openDialog = () => {
    render(
      <MemoryRouter initialEntries={['/en/labs']}>
        <Routes>
          <Route path="/:lang/labs" element={<LabGrid />} />
          <Route path="/:lang/scenario/:id" element={<div>scenario</div>} />
        </Routes>
      </MemoryRouter>,
    );
    const card = screen.getByText(SCENARIOS[0].name).closest('[role="button"]')!;
    fireEvent.click(card);
    return screen.getByRole('dialog');
  };

  it('el foco entra al detalle y Shift+Tab desde el primero cae en el último', () => {
    const dialog = openDialog();
    expect(dialog.contains(document.activeElement)).toBe(true);

    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
    expect(focusables.length).toBeGreaterThan(1);
    focusables[0].focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(focusables[focusables.length - 1]);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('Escape desde adentro cierra el detalle (el trap es el que lo hace)', () => {
    vi.useFakeTimers();
    try {
      const dialog = openDialog();
      dialog.focus();
      fireEvent.keyDown(dialog, { key: 'Escape' });
      act(() => { vi.advanceTimersByTime(300); });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
      document.body.style.overflow = '';
    }
  });
});

describe('EditorModal (nano)', () => {
  const openEditor = () => render(
    <EditorModal
      isOpen
      filePath="/home/user/notas.txt"
      initialContent="hola"
      onSave={vi.fn()}
      onClose={vi.fn()}
    />,
  );

  it('el foco entra al editor al abrirlo', () => {
    openEditor();
    expect(document.activeElement).toBe(screen.getByDisplayValue('hola'));
  });

  it('con la barra de Save As abierta, Tab vuelve al textarea en vez de salir', () => {
    const { container } = openEditor();
    const editor = container.firstElementChild as HTMLElement;
    const textarea = screen.getByDisplayValue('hola');

    fireEvent.keyDown(textarea, { key: 'o', ctrlKey: true });
    const bar = screen.getByLabelText('Entrada de nano');
    bar.focus();

    fireEvent.keyDown(bar, { key: 'Tab' });
    expect(document.activeElement).toBe(textarea);
    expect(editor.contains(document.activeElement)).toBe(true);
  });

  // Escape dentro de la barra (cancela el prompt) ya está cubierto en
  // `EditorModal.test.tsx` —ese fue el test que se quebró cuando el trap se
  // comió el evento— y a nivel unidad en `useFocusTrap.test.tsx`.
});
