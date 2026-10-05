/**
 * Compresses an image file to an optimized JPEG data URL or uploads to shareable link
 * for cross-device syncing via QR code.
 */
export async function createShareableArtUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        // Create an optimized canvas representation
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Also try to upload to freeimagehost or imgbb if possible, else return compressed dataUrl
        try {
          const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
          const formData = new FormData();
          formData.append('file', blob, 'art.jpg');

          // Try free anonymous CORS upload
          const response = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const json = await response.json();
            if (json?.data?.url) {
              // Convert https://tmpfiles.org/XXXX/art.jpg to direct raw link https://tmpfiles.org/dl/XXXX/art.jpg
              const directUrl = json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
              resolve({ localUrl: dataUrl, shareableUrl: directUrl });
              return;
            }
          }
        } catch (err) {
          console.warn('Anonymous cloud sync not available, using local dataUrl:', err);
        }

        // Fallback to optimized data URL
        resolve({ localUrl: dataUrl, shareableUrl: dataUrl });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
