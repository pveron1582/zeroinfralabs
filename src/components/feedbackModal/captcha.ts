// ── components/feedbackModal/captcha.ts ─────────────────────────
// Captcha visual de retroalimentación: catálogo de imágenes y
// generador aleatorio de pregunta de opción múltiple.

export interface CaptchaImage {
  id: string;
  labelEn: string;
  labelEs: string;
}

export interface CaptchaQuestion {
  image: CaptchaImage;
  options: string[];
  correctAnswer: string;
}

const CAPTCHA_IMAGES: CaptchaImage[] = [
  { id: 'dog', labelEn: 'Dog', labelEs: 'Perro' },
  { id: 'cat', labelEn: 'Cat', labelEs: 'Gato' },
  { id: 'bird', labelEn: 'Bird', labelEs: 'Pájaro' },
  { id: 'fish', labelEn: 'Fish', labelEs: 'Pez' },
  { id: 'butterfly', labelEn: 'Tower', labelEs: 'Torre' },
  { id: 'car', labelEn: 'Car', labelEs: 'Auto' },
  { id: 'motorcycle', labelEn: 'Motorcycle', labelEs: 'Moto' },
  { id: 'bicycle', labelEn: 'Bicycle', labelEs: 'Bicicleta' },
  { id: 'airplane', labelEn: 'Airplane', labelEs: 'Avión' },
  { id: 'boat', labelEn: 'Girl', labelEs: 'Mujer' },
  { id: 'chair', labelEn: 'Chair', labelEs: 'Silla' },
  { id: 'table', labelEn: 'Table', labelEs: 'Mesa' },
  { id: 'bed', labelEn: 'Bed', labelEs: 'Cama' },
  { id: 'sofa', labelEn: 'Sofa', labelEs: 'Sofá' },
  { id: 'shelf', labelEn: 'Shelf', labelEs: 'Estante' },
  { id: 'glass', labelEn: 'Glasses', labelEs: 'Lentes' },
  { id: 'book', labelEn: 'Book', labelEs: 'Libro' },
  { id: 'watch', labelEn: 'Watch', labelEs: 'Reloj' },
  { id: 'camera', labelEn: 'Camera', labelEs: 'Cámara' },
  { id: 'keyboard', labelEn: 'Keyboard', labelEs: 'Teclado' },
  { id: 'tree', labelEn: 'Tree', labelEs: 'Árbol' },
  { id: 'flower', labelEn: 'Flower', labelEs: 'Flor' },
  { id: 'mountain', labelEn: 'Mountain', labelEs: 'Montaña' },
  { id: 'ocean', labelEn: 'Ocean', labelEs: 'Mar' },
  { id: 'river', labelEn: 'Beach', labelEs: 'Playa' },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateCaptchaQuestion(isSpanish: boolean): CaptchaQuestion {
  const shuffled = shuffle(CAPTCHA_IMAGES);
  const correct = shuffled[0];
  const others = CAPTCHA_IMAGES.filter(img => img.id !== correct.id);
  const distractors = shuffle(others).slice(0, 4);

  const getLabel = (img: CaptchaImage) => isSpanish ? img.labelEs : img.labelEn;

  const options = shuffle([
    getLabel(correct),
    ...distractors.map(d => getLabel(d))
  ]);

  return {
    image: correct,
    options,
    correctAnswer: getLabel(correct),
  };
}
