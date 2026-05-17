import { providers } from '@/app/dashboard/link-shipping-company/constants/providers';

let preloaded = false;
const cachedImages: HTMLImageElement[] = [];

export function preloadShippingLogos() {
  if (preloaded || typeof window === 'undefined') return;
  preloaded = true;
  for (const provider of providers) {
    const img = new Image();
    img.src = provider.logo;
    cachedImages.push(img);
  }
}

export function waitForImagesInContainer(
  container: HTMLElement | null,
  timeoutMs = 3000,
): Promise<void> {
  if (!container || typeof window === 'undefined') return Promise.resolve();
  const images = Array.from(container.querySelectorAll('img'));
  if (images.length === 0) return Promise.resolve();

  const settle = (img: HTMLImageElement) =>
    new Promise<void>((resolve) => {
      if (img.complete && img.naturalHeight > 0) {
        resolve();
        return;
      }
      const done = () => {
        img.removeEventListener('load', done);
        img.removeEventListener('error', done);
        resolve();
      };
      img.addEventListener('load', done);
      img.addEventListener('error', done);
    });

  const allLoaded = Promise.all(images.map(settle)).then(() => undefined);
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([allLoaded, timeout]);
}
