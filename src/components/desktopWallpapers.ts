import type React from 'react';

export interface Wallpaper {
  id: string;
  nameEs: string;
  nameEn: string;
  style: React.CSSProperties;
  previewGradient: string;
  gridColor: string;
  gridOpacity: number;
  image?: string;
}

function photoWallpaper(num: number, nameEs: string, nameEn: string): Wallpaper {
  return {
    id: `foto-${num}`,
    nameEs,
    nameEn,
    image: `/wallpapers/wallpaper-${num}.jpg`,
    style: {
      backgroundImage: `url('/wallpapers/wallpaper-${num}.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    previewGradient: 'from-slate-950 to-slate-800',
    gridColor: '#94a3b8',
    gridOpacity: 0,
  };
}

// Fondos de foto (imágenes en public/wallpapers/, uso libre).
// Cada uno carga `/wallpapers/wallpaper-N.jpg`; basta con colocar el archivo
// en public/wallpapers/ con ese nombre para que aparezca.
export const WALLPAPERS: Wallpaper[] = [
  photoWallpaper(1, 'Fondo Foto 1', 'Photo Wallpaper 1'),
  photoWallpaper(2, 'Fondo Foto 2', 'Photo Wallpaper 2'),
  photoWallpaper(3, 'Fondo Foto 3', 'Photo Wallpaper 3'),
  photoWallpaper(4, 'Fondo Foto 4', 'Photo Wallpaper 4'),
  photoWallpaper(5, 'Fondo Foto 5', 'Photo Wallpaper 5'),
  photoWallpaper(6, 'Fondo Foto 6', 'Photo Wallpaper 6'),
];

export const DEFAULT_WALLPAPER_ID = 'foto-1';

export const DEFAULT_WALLPAPER: Wallpaper =
  WALLPAPERS.find(w => w.id === DEFAULT_WALLPAPER_ID) ?? WALLPAPERS[0];
