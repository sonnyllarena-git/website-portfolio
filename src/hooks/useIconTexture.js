import { useEffect, useState } from 'react';
import * as THREE from 'three';

// Rasterizes an icon URL onto a fixed-size canvas before handing it to three.js.
// Devicon SVGs have inconsistent intrinsic sizes, which caused corrupt/blank
// GPU texture uploads when passed straight through THREE.TextureLoader.
const textureCache = new Map();

export function useIconTexture(url) {
  const [texture, setTexture] = useState(() => textureCache.get(url) ?? null);

  useEffect(() => {
    const cached = textureCache.get(url);
    if (cached) {
      setTexture(cached);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      canvas.getContext('2d').drawImage(img, 0, 0, 128, 128);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(url, tex);
      setTexture(tex);
    };
    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}
