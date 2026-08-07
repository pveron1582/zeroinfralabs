import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FoxyTour } from '../tour/FoxyTour';
import { getTourSteps } from '../tour/tourSteps';

describe('FoxyTour', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    document.body.innerHTML = '';
  });

  it('no renderiza nada cuando está cerrado', () => {
    const { container } = render(<FoxyTour open={false} isEs={true} onClose={onClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra la presentación de Foxy en el primer paso', () => {
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    expect(screen.getByText(/¡Hola! Soy Foxy/)).toBeInTheDocument();
    expect(screen.getByText(/te voy a ayudar a reconocer el laboratorio/i)).toBeInTheDocument();
  });

  it('muestra los textos en inglés según el idioma', () => {
    render(<FoxyTour open={true} isEs={false} onClose={onClose} />);
    expect(screen.getByText(/Hi! I'm Foxy/)).toBeInTheDocument();
    expect(screen.getByText(/get familiar with the lab/i)).toBeInTheDocument();
  });

  it('centra vertical y horizontalmente la burbuja en el paso inicial', () => {
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    const bubble = screen.getByTestId('foxy-bubble');
    const width = Math.min(400, window.innerWidth - 24);
    const h = 200;
    // Centrada en el escritorio (ya no queda desplazada hacia abajo)
    expect(parseInt(bubble.style.left, 10)).toBe((window.innerWidth - width) / 2);
    expect(parseInt(bubble.style.top, 10)).toBe((window.innerHeight - h) / 2);
  });

  it('ubica la burbuja a la derecha y centrada en altura en el paso de enumeración sin panel', () => {
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    const steps = getTourSteps();
    const enumIdx = steps.findIndex(s => s.id === 'network-map-enum');
    expect(enumIdx).toBeGreaterThan(-1);

    // Saltar directo al paso de enumeración usando el indicador de pasos
    fireEvent.click(screen.getByRole('button', { name: `Paso ${enumIdx + 1}` }));

    const bubble = screen.getByTestId('foxy-bubble');
    const width = Math.min(400, window.innerWidth - 24);
    const h = 200;
    // A la derecha con margen de 48px, verticalmente centrada
    expect(parseInt(bubble.style.left, 10)).toBe(window.innerWidth - width - 48);
    expect(parseInt(bubble.style.top, 10)).toBe((window.innerHeight - h) / 2);
  });

  it('avanza al siguiente paso con el botón Siguiente', () => {
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('Iconos del escritorio')).toBeInTheDocument();
  });

  it('vuelve atrás con el botón Atrás', () => {
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Atrás' }));
    expect(screen.getByText(/¡Hola! Soy Foxy/)).toBeInTheDocument();
  });

  it('en el último paso el botón cierra el tour', async () => {
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    const steps = getTourSteps();
    for (let i = 0; i < steps.length - 1; i++) {
      const cur = steps[i];
      // En el paso interactivo el botón Siguiente está bloqueado:
      // aparece el objetivo (ventana/panel) y el tour avanza automáticamente
      if (cur.interactive) {
        if (cur.waitFor) {
          const attr = cur.waitFor.replace(/^\[data-tour="|"\]$/g, '');
          const el = document.createElement('div');
          el.setAttribute('data-tour', attr);
          document.body.appendChild(el);
        } else if (cur.waitForHidden) {
          // Para pasos de cierre: eliminamos el elemento que debe desaparecer
          const attr = cur.waitForHidden.replace(/^\[data-tour="|"\]$/g, '');
          document.querySelectorAll(`[data-tour="${attr}"]`).forEach(n => n.remove());
        }
        // El tour avanza automáticamente; esperamos a que el botón
        // "Siguiente" vuelva a estar disponible
        await waitFor(() => expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled(), { timeout: 5000 });
        continue;
      }
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    }
    const finalBtn = screen.getByRole('button', { name: '¡A trabajar!' });
    expect(finalBtn).toBeInTheDocument();
    fireEvent.click(finalBtn);
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  }, 20000);

  it('enfoca el elemento objetivo con data-tour', () => {
    document.body.innerHTML = '<div data-tour="desktop-icons" style="width:200px;height:100px">icons</div>';
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    // El paso de iconos del escritorio debe encontrar el elemento en el DOM
    expect(document.querySelector('[data-tour="desktop-icons"]')).toBeInTheDocument();
  });

  it('el paso del icono de terminal pide hacer clic y avanza cuando abre la ventana', async () => {
    document.body.innerHTML = '<div data-tour="desktop-icons">icons</div><div data-tour="desktop-icon-terminal">t</div>';
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    // Ir al paso del icono de terminal
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); // desktop-icons
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); // desktop-icon-terminal
    expect(screen.getByText(/hacé clic en él para abrir tu consola/i)).toBeInTheDocument();
    // El botón Siguiente está bloqueado en pasos interactivos
    expect(screen.getByRole('button', { name: 'Hacé clic' })).toBeDisabled();

    // El usuario hace clic → aparece la ventana de terminal
    const win = document.createElement('div');
    win.setAttribute('data-tour', 'terminal-window');
    document.body.appendChild(win);

    await waitFor(() => {
      expect(screen.getByText('Ventana de terminal')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('cierra con el botón Saltar', async () => {
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('muestra el paso de Chrome solo si existe el icono del navegador', async () => {
    document.body.innerHTML =
      '<div data-tour="desktop-icons">icons</div>' +
      '<div data-tour="desktop-icon-terminal">t</div>' +
      '<div data-tour="desktop-icon-wallpaper">w</div>' +
      '<div data-tour="desktop-icon-browser">c</div>' +
      '<div data-tour="desktop-icon-guide">g</div>';
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    // Avanzar por los pasos interactivos previos (terminal y fondos)
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); // desktop-icons
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); // desktop-icon-terminal
    let win = document.createElement('div');
    win.setAttribute('data-tour', 'terminal-window');
    document.body.appendChild(win);
    await waitFor(() => expect(screen.getByText('Ventana de terminal')).toBeInTheDocument(), { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); // settings-btn
    const panel = document.createElement('div');
    panel.setAttribute('data-tour', 'settings-panel');
    document.body.appendChild(panel);
    await waitFor(() => expect(screen.getByText('Panel de ajustes')).toBeInTheDocument(), { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); // desktop-icon-wallpaper
    win = document.createElement('div');
    win.setAttribute('data-tour', 'wallpaper-window');
    document.body.appendChild(win);
    await waitFor(() => expect(screen.getByText('Selector de fondos')).toBeInTheDocument(), { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); // desktop-icon-browser

    expect(screen.getByText('Navegador Chrome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hacé clic' })).toBeDisabled();

    // El usuario hace clic → aparece la ventana del navegador
    win = document.createElement('div');
    win.setAttribute('data-tour', 'browser-window');
    document.body.appendChild(win);

    await waitFor(() => {
      expect(screen.getByText('Desde el navegador vas a acceder a la aplicación web de la máquina objetivo.')).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 20000);

  it('cierra con el botón ✕ dentro de la burbuja', async () => {
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Salir de la guía' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('empieza desde el principio al reabrir el tour', async () => {
    const { rerender } = render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    // Avanzar varios pasos
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText(/hacé clic en él para abrir tu consola/i)).toBeInTheDocument();
    // Cerrar y reabrir
    rerender(<FoxyTour open={false} isEs={true} onClose={onClose} />);
    rerender(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    expect(screen.getByText(/¡Hola! Soy Foxy/)).toBeInTheDocument();
  });

  it('el paso Ver red pide hacer clic, avanza al abrirse la topología y al cerrarla', async () => {
    document.body.innerHTML = '<div data-tour="network-map-btn">ver red</div>';
    render(<FoxyTour open={true} isEs={true} onClose={onClose} />);
    // Recorrer hasta el paso de Ver red (después de mission-panel)
    const steps = getTourSteps();
    const idx = steps.findIndex(s => s.id === 'network-map-btn');
    for (let i = 0; i < idx; i++) {
      const cur = steps[i];
      if (cur.interactive) {
        const selector = cur.waitFor || cur.waitForHidden;
        const attr = selector!.replace(/^\[data-tour="|"\]$/g, '');
        const el = document.createElement('div');
        el.setAttribute('data-tour', attr);
        document.body.appendChild(el);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled(), { timeout: 5000 });
        continue;
      }
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    }

    // Estamos en el paso Ver red: pide hacer clic en el botón
    expect(screen.getByText(/hacé clic en "Ver red"/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hacé clic' })).toBeDisabled();

    // El usuario hace clic → se abre la topología
    const map = document.createElement('div');
    map.setAttribute('data-tour', 'network-map');
    document.body.appendChild(map);
    await waitFor(() => expect(screen.getByText(/a medida que avanzás en el reconocimiento/i)).toBeInTheDocument(), { timeout: 5000 });

    // Explica la enumeración
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText(/cuando hay una novedad, el botón "Ver red" se ilumina/i)).toBeInTheDocument();

    // Paso de cierre: espera a que la topología desaparezca
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText(/cerrá la topología con la X/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hacé clic' })).toBeDisabled();
    map.remove();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled(), { timeout: 5000 });
  }, 20000);
});
