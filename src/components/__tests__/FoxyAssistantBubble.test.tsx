import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FoxyAssistantBubble } from '../academy/FoxyAssistantBubble';

describe('FoxyAssistantBubble', () => {
  it('renderiza a Foxy cerrado inicialmente', () => {
    render(
      <FoxyAssistantBubble
        task="Do the task"
        taskEs="Haz la tarea"
        hint="try this command"
        hintEs="prueba este comando"
        isEs={true}
      />
    );
    // Solo la cara de Foxy visible (burbuja cerrada → opacity-0)
    expect(screen.getByRole('button', { name: /Abrir ayuda de Foxy/ })).toBeInTheDocument();
    const bubbleText = screen.queryByText('Haz la tarea')?.closest('div.mb-3');
    expect(bubbleText).toHaveClass('opacity-0');
  });

  it('al hacer click en Foxy se abre la burbuja con la consigna', () => {
    render(
      <FoxyAssistantBubble
        task="Do the task"
        taskEs="Haz la tarea"
        hint="try this"
        hintEs="prueba esto"
        isEs={true}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Abrir ayuda de Foxy/ }));
    expect(screen.getByText('Haz la tarea')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pedir pista a Foxy/ })).toBeInTheDocument();
  });

  it('pedir pista despliega el comando sugerido', () => {
    render(
      <FoxyAssistantBubble
        task="Do"
        taskEs="Haz"
        hint="arp-scan --localnet"
        hintEs="arp-scan --localnet"
        isEs={true}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Abrir ayuda de Foxy/ }));
    fireEvent.click(screen.getByRole('button', { name: /Pedir pista a Foxy/ }));
    expect(screen.getByText(/arp-scan --localnet/)).toBeInTheDocument();
  });

  it('la burbuja se cierra con la X', () => {
    render(
      <FoxyAssistantBubble
        task="Do"
        taskEs="Haz"
        hint="hint-en"
        hintEs="hint-es"
        isEs={true}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Abrir ayuda de Foxy/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    // Burbuja colapsada (queda en el DOM pero invisible para animación)
    const bubbleText = screen.queryByText('Haz')?.closest('div.mb-3');
    expect(bubbleText).toHaveClass('opacity-0');
  });
});
