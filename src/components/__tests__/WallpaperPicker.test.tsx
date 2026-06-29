import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WallpaperPicker } from '../WallpaperPicker';
import { WALLPAPERS } from '../desktopWallpapers';

describe('WallpaperPicker', () => {
  it('debe renderizar el titulo y los wallpapers en español', () => {
    render(
      <WallpaperPicker
        activeWallpaper="matrix"
        isEs={true}
        onSelectWallpaper={vi.fn()}
      />
    );

    expect(screen.getByText('Elige un estilo para el escritorio virtual:')).toBeInTheDocument();
    
    // Debería renderizar nombres en español
    WALLPAPERS.forEach(wp => {
      expect(screen.getByText(wp.nameEs)).toBeInTheDocument();
    });
  });

  it('debe renderizar el titulo y los wallpapers en inglés', () => {
    render(
      <WallpaperPicker
        activeWallpaper="matrix"
        isEs={false}
        onSelectWallpaper={vi.fn()}
      />
    );

    expect(screen.getByText('Choose a style for the virtual desktop:')).toBeInTheDocument();

    // Debería renderizar nombres en inglés
    WALLPAPERS.forEach(wp => {
      expect(screen.getByText(wp.nameEn)).toBeInTheDocument();
    });
  });

  it('debe marcar con un check el wallpaper activo', () => {
    render(
      <WallpaperPicker
        activeWallpaper="matrix"
        isEs={true}
        onSelectWallpaper={vi.fn()}
      />
    );

    // El check selector
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('debe llamar a onSelectWallpaper al hacer clic en un wallpaper', () => {
    const onSelectWallpaper = vi.fn();
    render(
      <WallpaperPicker
        activeWallpaper="matrix"
        isEs={true}
        onSelectWallpaper={onSelectWallpaper}
      />
    );

    // Clic en el primer wallpaper de la lista
    const targetWp = WALLPAPERS[0];
    const element = screen.getByText(targetWp.nameEs);
    fireEvent.click(element);

    expect(onSelectWallpaper).toHaveBeenCalledWith(targetWp.id);
  });
});
