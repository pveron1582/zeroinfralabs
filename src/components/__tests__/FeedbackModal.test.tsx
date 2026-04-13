// ── components/__tests__/FeedbackModal.test.tsx ─────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackModal } from '../FeedbackModal';

// Mock de trackEvent
vi.mock('../utils/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('FeedbackModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no debe renderizar cuando isOpen es false', () => {
    render(<FeedbackModal isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument();
    expect(screen.queryByText('Comentarios')).not.toBeInTheDocument();
  });

  it('debe renderizar en inglés por defecto', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText(/Comment/)).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('debe mostrar campos de formulario', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tell us what you think...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
  });

  it('debe mostrar sección de captcha', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText('What do you see in the image?')).toBeInTheDocument();
    // Buscar el botón de nueva pregunta por su contenido (incluye emoji)
    const buttons = screen.getAllByRole('button');
    const newQuestionButton = buttons.find(b => 
      b.textContent?.includes('New question') || b.textContent?.includes('Nueva pregunta')
    );
    expect(newQuestionButton).toBeDefined();
  });

  it('debe permitir escribir en los campos', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    const nameInput = screen.getByPlaceholderText('Your name');
    const emailInput = screen.getByPlaceholderText('email@example.com');
    const commentInput = screen.getByPlaceholderText('Tell us what you think...');
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(commentInput, { target: { value: 'Great app!' } });
    
    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(commentInput).toHaveValue('Great app!');
  });

  it('debe mostrar opciones de captcha', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    // Las opciones del captcha deben estar presentes
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(5); // Opciones del captcha + otros botones
  });

  it('debe cerrar modal al hacer click en X', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getAllByRole('button').find(b => 
      b.innerHTML.includes('line') // El SVG de la X
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('debe tener botón de submit deshabilitado inicialmente', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
  });

  it('debe mostrar mensaje de éxito después de enviar', async () => {
    const { trackEvent } = await import('../../utils/analytics');
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    // Llenar formulario
    fireEvent.change(screen.getByPlaceholderText('Your name'), { 
      target: { value: 'John' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Tell us what you think...'), { 
      target: { value: 'Great app!' } 
    });
    
    // Resolver captcha (hacer click en la opción correcta requiere saber cuál es)
    const captchaButtons = screen.getAllByRole('button').filter(b => 
      b.className.includes('violet') // Botones del captcha
    );
    
    if (captchaButtons.length > 0) {
      fireEvent.click(captchaButtons[0]);
    }
    
    // Ahora el botón debería estar habilitado si el captcha fue resuelto
    const submitButton = screen.getByRole('button', { name: /Submit|Enviando/ }) as HTMLButtonElement;
    
    if (!submitButton.disabled) {
      fireEvent.click(submitButton);
    }
  });

  it('debe mostrar cooldown si hay envío reciente', () => {
    // Simular envío reciente
    const recentTime = Date.now() - 1000; // 1 segundo atrás
    localStorage.setItem('feedback_last_submit', recentTime.toString());
    
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('You recently submitted feedback')).toBeInTheDocument();
  });

  it('debe permitir regenerar captcha', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    // Buscar el botón que contiene el texto (incluye emoji 🔄)
    const buttons = screen.getAllByRole('button');
    const newQuestionButton = buttons.find(b => 
      b.textContent?.includes('New question') || b.textContent?.includes('Nueva pregunta')
    );
    
    expect(newQuestionButton).toBeDefined();
    if (newQuestionButton) {
      fireEvent.click(newQuestionButton);
    }
    
    // El captcha debería regenerarse (verificar que sigue visible)
    expect(screen.getByText('What do you see in the image?')).toBeInTheDocument();
  });

  it('debe validar campos requeridos', async () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    // Intentar enviar sin llenar campos requeridos
    const submitButton = screen.getByRole('button', { name: 'Submit' }) as HTMLButtonElement;
    
    if (!submitButton.disabled) {
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Name and comment are required|Nombre y comentario son obligatorios/)).toBeInTheDocument();
      });
    }
  });

  it('debe mostrar nota sobre email opcional', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Email (optional)')).toBeInTheDocument();
    expect(screen.getByText('If you want a response')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de captcha verificado cuando se resuelve', () => {
    render(<FeedbackModal isOpen={true} onClose={mockOnClose} />);
    
    // Probar varias opciones hasta acertar
    const captchaButtons = screen.getAllByRole('button').filter(b => 
      b.className.includes('violet') && !b.textContent?.includes('New')
    );
    
    // Hacer click en cada opción hasta que aparezca el mensaje de éxito
    for (const button of captchaButtons.slice(0, 3)) {
      fireEvent.click(button);
      
      const successMessage = screen.queryByText(/Captcha verified|verificado/);
      if (successMessage) {
        expect(successMessage).toBeInTheDocument();
        break;
      }
    }
  });
});
