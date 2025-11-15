
export const DEFAULT_PORTRAIT_SVG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgODAwIiB3aWR0aD0iNjQwIiBoZWlnaHQ9IjgwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB4Mj0iMCIgeTE9IjAiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMmIxZjFhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzBmMGIwOSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjY0MCIgaGVpZ2h0PSI4MDAiIGZpbGw9InVybCgjZykiLz4KICA8ZyBmaWxsPSIjZDFhNzZhIj4KICAgIDxjaXJjbGUgY3g9IjMyMCIgY3k9IjMwMCIgcj0iMTIwIi8+CiAgICA8cGF0aCBkPSJNMTQwIDY0MHE0MC0xNDAgMTgwLTE0MHQxODAgMTQwdjYwSDE0MHoiLz4KICAgIDxyZWN0IHg9IjI5MCIgeT0iNDUwIiB3aWR0aD0iNjAiIGhlaWdodD0iMjAiIHJ4PSIxMCIvPgogIDwvZz4KICA8ZyBmaWxsPSIjYTY3YTQ0IiBvcGFjaXR5PSIwLjMiPgogICAgPGNpcmNsZSBjeD0iMzIwIiBjeT0iMzAwIiByPSIxNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2E2N2E0NCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPC9nPgo8L3N2Zz4=';

export function fileToOptimizedDataURL(file: File, maxDim = 1400, quality = 0.88): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const { width: w, height: h } = img;
          let tw = w, th = h;
          const m = Math.max(w, h);
          if (m > maxDim) {
            const k = maxDim / m;
            tw = Math.round(w * k);
            th = Math.round(h * k);
          }
          const canvas = document.createElement('canvas');
          canvas.width = tw;
          canvas.height = th;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error("Could not get canvas context"));
          }
          ctx.fillStyle = '#0e0a08';
          ctx.fillRect(0, 0, tw, th);
          ctx.drawImage(img, 0, 0, tw, th);
          const out = canvas.toDataURL('image/jpeg', quality);
          resolve(out);
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
}
