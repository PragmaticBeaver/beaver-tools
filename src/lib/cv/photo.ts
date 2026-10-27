export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 760;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Das Bild konnte nicht gelesen werden.'));
    };
    image.src = url;
  });
}

export async function resizePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Bitte eine Bilddatei auswählen.');
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error(
      'Das Bild ist zu groß. Bitte eine Datei unter 8 MB wählen.',
    );
  }
  const image = await loadImage(file);
  const scale = Math.min(MAX_WIDTH / image.width, MAX_HEIGHT / image.height, 1);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Das Bild konnte nicht verarbeitet werden.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.85);
}
