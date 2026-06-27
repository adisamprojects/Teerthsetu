import { useState, useEffect } from 'react';

export function useTransparentBlackImage(src) {
  const [transparentSrc, setTransparentSrc] = useState('');

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

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        let alpha = data[i+3];
        
        let rOrg = r, gOrg = g, bOrg = b;

        // Unmultiply Black Background
        const maxVal = Math.max(r, g, b);
        let unmultiplyAlpha = maxVal;
        
        // Only apply if the pixel is mostly opaque
        if (alpha > 200) {
          if (maxVal < 10) { // Pure black or very close
            data[i+3] = 0;
            continue;
          }
          let aFactor = unmultiplyAlpha / 255;
          if (aFactor < 0.05) aFactor = 0.05;
          
          rOrg = Math.min(255, Math.round(r / aFactor));
          gOrg = Math.min(255, Math.round(g / aFactor));
          bOrg = Math.min(255, Math.round(b / aFactor));
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
  }, [src]);

  return transparentSrc || src;
}
