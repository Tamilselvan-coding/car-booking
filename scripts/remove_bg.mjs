import sharp from 'sharp';

async function run() {
  const { data, info } = await sharp('public/chettinad-logo.jpg')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rgba = Buffer.alloc(width * height * 4);

  // Background threshold:
  // The emblem is a bright gold/teal shield.
  // The background around the shield is very dark (< 45).
  // We flood fill from edges to only remove the exterior background.
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBg(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    
    // Gold crest pixels:
    if (r > 80 && g > 65 && r > b * 1.15) return false;
    // Bright teal highlights:
    if (g > 80 && b > 80) return false;

    // Dark exterior:
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 45 || (r < 40 && g < 45 && b < 50);
  }

  for (let x = 0; x < width; x++) {
    queue.push([x, 0], [x, height - 1]);
    visited[x] = 1;
    visited[(height - 1) * width + x] = 1;
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y], [width - 1, y]);
    visited[y * width] = 1;
    visited[y * width + (width - 1)] = 1;
  }

  let head = 0;
  while (head < queue.length) {
    const [x, y] = queue[head++];
    const idx = y * width + x;
    if (isBg(x, y)) {
      visited[idx] = 2; // confirmed background
      const neighbors = [
        [x + 1, y], [x - 1, y],
        [x, y + 1], [x, y - 1]
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

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * channels;
      const di = (y * width + x) * 4;
      rgba[di] = data[si];
      rgba[di + 1] = data[si + 1];
      rgba[di + 2] = data[si + 2];
      rgba[di + 3] = visited[y * width + x] === 2 ? 0 : 255;
    }
  }

  await sharp(rgba, {
    raw: { width, height, channels: 4 }
  })
    .trim()
    .png()
    .toFile('public/chettinad-logo.png');

  console.log('SUCCESS_CREATED_CHETTINAD_LOGO_PNG');
}

run().catch(console.error);
