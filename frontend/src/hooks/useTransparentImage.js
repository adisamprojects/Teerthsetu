import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function useTransparentImage(src, isTagline = false) {
  const [transparentSrc, setTransparentSrc] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Assume we need to unmultiply the white background if we're here
      const isDarkBg = false; // We know the lotus logo has a white background

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        let alpha = data[i+3];
        
        let rOrg = r, gOrg = g, bOrg = b;

        // Unmultiply White Background
        const minVal = Math.min(r, g, b);
        let unmultiplyAlpha = 255 - minVal;
        
        // Only apply if the pixel is mostly white/opaque
        if (alpha > 200) {
          if (minVal > 240) {
            data[i+3] = 0;
            continue;
          }
          let aFactor = unmultiplyAlpha / 255;
          if (aFactor < 0.05) aFactor = 0.05;
          rOrg = Math.max(0, Math.min(255, Math.round(255 - (255 - r) / aFactor)));
          gOrg = Math.max(0, Math.min(255, Math.round(255 - (255 - g) / aFactor)));
          bOrg = Math.max(0, Math.min(255, Math.round(255 - (255 - b) / aFactor)));
          alpha = unmultiplyAlpha;
        }

        if (alpha > 15) {
          data[i] = rOrg;
          data[i+1] = gOrg;
          data[i+2] = bOrg;
        }
        
        data[i+3] = alpha;
      }
      
      ctx.putImageData(imgData, 0, 0);
      setTransparentSrc(canvas.toDataURL());
    };
    img.onerror = () => {
      console.error("Failed to load image for transparency processing");
      setTransparentSrc(src);
    };
    img.src = src;
  }, [src, isDarkMode, isTagline]);

  return transparentSrc || src;
}
