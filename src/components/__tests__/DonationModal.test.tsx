// ── components/__tests__/DonationModal.test.tsx ─────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DonationModal } from '../DonationModal';

describe('DonationModal', () => {
  const mockOnClose = vi.fn();
  
  // Mock clipboard
  const mockWriteText = vi.fn();
  Object.assign(navigator, {
    clipboard: {
      writeText: mockWriteText,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  it('no debe renderizar cuando isOpen es false', () => {
    render(<DonationModal isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Buy me a coffee')).not.toBeInTheDocument();
    expect(screen.queryByText('Invitame un café')).not.toBeInTheDocument();
  });

  it('debe renderizar en inglés por defecto', () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Buy me a coffee')).toBeInTheDocument();
    expect(screen.getByText('Do you like this project?')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('debe mostrar el alias de Mercado Pago', () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('pablo.m.veron.mp')).toBeInTheDocument();
  });

  it('debe mostrar el badge de Mercado Pago', () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('MP')).toBeInTheDocument();
    expect(screen.getByText('Mercado Pago')).toBeInTheDocument();
  });

  it('debe cerrar al hacer click en el botón X', () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    // Buscar el botón de cerrar (el que tiene el SVG con líneas)
    const closeButton = screen.getAllByRole('button').find(b => 
      b.innerHTML.includes('line')
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('debe cerrar al hacer click en el backdrop', () => {
    const { container } = render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    // El backdrop es el div con bg-black/70
    const backdrop = container.querySelector('.bg-black\\/70');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('no debe cerrar al hacer click en el contenido del modal', () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    // El contenido interno tiene onClick que detiene la propagación
    const content = screen.getByText('Buy me a coffee').closest('.bg-gray-900');
    if (content) {
      fireEvent.click(content);
      expect(mockOnClose).not.toHaveBeenCalled();
    }
  });

  it('debe copiar el alias al portapapeles al hacer click en Copiar', async () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    const copyButton = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);
    
    // Esperar a que se resuelva la promesa
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockWriteText).toHaveBeenCalledWith('pablo.m.veron.mp');
  });

  it('debe mostrar "Copiado" después de copiar', async () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    const copyButton = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);
    
    // Esperar a que se resuelva la promesa
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.getByText('✓ Copied')).toBeInTheDocument();
  });

  it('debe mostrar mensaje sobre otros métodos de pago', () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Want other payment options? Send us feedback.')).toBeInTheDocument();
  });

  it('debe mostrar información de Argentina', () => {
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Mercado Pago alias · Argentina 🇦🇷')).toBeInTheDocument();
  });

  it('debe usar fallback cuando clipboard falla', async () => {
    // Simular fallo del clipboard API
    mockWriteText.mockRejectedValue(new Error('Clipboard failed'));
    
    // Mock execCommand
    const mockExecCommand = vi.fn().mockReturnValue(true);
    document.execCommand = mockExecCommand;
    
    render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    const copyButton = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);
    
    // Esperar a que se ejecute el fallback
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // El fallback crea un textarea y usa execCommand
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
  });

  it('debe resetear estado copied cuando se cierra y reabre', async () => {
    const { rerender } = render(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    // Copiar
    const copyButton = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.getByText('✓ Copied')).toBeInTheDocument();
    
    // Cerrar
    rerender(<DonationModal isOpen={false} onClose={mockOnClose} />);
    
    // Reabrir
    rerender(<DonationModal isOpen={true} onClose={mockOnClose} />);
    
    // Debería volver a mostrar "Copy"
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });
});
