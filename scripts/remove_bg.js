const sharp = require('sharp');
const fs = require('fs');

async function removeBackground() {
  const { data, info } = await sharp('public/chettinad-logo.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 3 (RGB)

  // Create RGBA buffer
  const rgba = Buffer.alloc(width * height * 4);

  // Mark visited for flood fill
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Helper to get brightness / isDarkBackground
  function isBg(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Background is dark navy/black gradient:
    // Max channel is generally < 55, or total brightness < 120
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Gold borders have distinct golden hue: r > 120 and r > b * 1.5
    const isGold = (r > 100 && g > 75 && r > b * 1.3);
    if (isGold) return false;

    return brightness < 50 || (r < 40 && g < 55 && b < 60);
  }

  // Seed all edges
  for (let x = 0; x < width; x++) {
    queue.push([x, 0], [x, height - 1]);
    visited[0 * width + x] = 1;
    visited[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y], [width - 1, y]);
    visited[y * width + 0] = 1;
    visited[y * width + (width - 1)] = 1;
  }

  // BFS Flood Fill from edges
  let head = 0;
  const isOuterBg = new Uint8Array(width * height);

  while (head < queue.length) {
    const [x, y] = queue[head++];
    const idx = y * width + x;

    if (isBg(x, y)) {
      isOuterBg[idx] = 1;

      // 4-neighborhood
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx]) {
            visited[nidx] = 1;
            if (isBg(nx, ny)) {
              queue.push([nx, ny]);
            }
          }
        }
      }
    }
  }

  // Populate RGBA
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const dstIdx = (y * width + x) * 4;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      rgba[dstIdx] = r;
      rgba[dstIdx + 1] = g;
      rgba[dstIdx + 2] = b;

      if (isOuterBg[y * width + x]) {
        rgba[dstIdx + 3] = 0; // Fully transparent
      } else {
        // Soft edge anti-aliasing near boundary
        rgba[dstIdx + 3] = 255;
      }
    }
  }

  // Save transparent PNG
  await sharp(rgba, {
    raw: { width, height, channels: 4 }
  })
  .trim() // Trim any transparent outer bounding box
  .png()
  .toFile('public/chettinad-logo.png');

  console.log('Background removed successfully and saved to public/chettinad-logo.png');
}

removeBackground().catch(console.error);
