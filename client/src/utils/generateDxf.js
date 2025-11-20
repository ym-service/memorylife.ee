import QRCode from 'qrcode';

const formatNumber = (value) => Number.parseFloat(value || 0).toFixed(3);

const addLine = (x1, y1, x2, y2, layer = 'CUT') =>
  `0\nLINE\n8\n${layer}\n10\n${formatNumber(x1)}\n20\n${formatNumber(y1)}\n30\n0.0\n11\n${formatNumber(
    x2
  )}\n21\n${formatNumber(y2)}\n31\n0.0\n`;

const addArc = (cx, cy, r, startAngle, endAngle, layer = 'CUT') =>
  `0\nARC\n8\n${layer}\n10\n${formatNumber(cx)}\n20\n${formatNumber(
    cy
  )}\n30\n0.0\n40\n${formatNumber(r)}\n50\n${startAngle}\n51\n${endAngle}\n`;

const addText = (txt, x, y, h, layer = 'ENGRAVE') =>
  `0\nTEXT\n8\n${layer}\n10\n${formatNumber(x)}\n20\n${formatNumber(
    y
  )}\n30\n0.0\n40\n${formatNumber(h)}\n1\n${txt}\n72\n4\n11\n${formatNumber(x)}\n21\n${formatNumber(
    y
  )}\n31\n0.0\n`;

const addSolid = (x1, y1, size, layer = 'QR_CODE') => {
  const x2 = x1 + size;
  const y2 = y1 + size;
  return (
    `0\nSOLID\n8\n${layer}\n` +
    `10\n${formatNumber(x1)}\n20\n${formatNumber(y1)}\n30\n0.0\n` +
    `11\n${formatNumber(x2)}\n21\n${formatNumber(y1)}\n31\n0.0\n` +
    `12\n${formatNumber(x1)}\n22\n${formatNumber(y2)}\n32\n0.0\n` +
    `13\n${formatNumber(x2)}\n23\n${formatNumber(y2)}\n33\n0.0\n`
  );
};

const addPolyline = (points, layer = 'CUT') => {
  if (!points?.length) {
    return '';
  }
  let polyline = `0\nLWPOLYLINE\n8\n${layer}\n90\n${points.length}\n70\n1\n`;
  points.forEach(([x, y]) => {
    polyline += `10\n${formatNumber(x)}\n20\n${formatNumber(y)}\n`;
  });
  return polyline;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const buildEllipsePoints = (width, height, steps = 96) => {
  const points = [];
  for (let i = 0; i < steps; i += 1) {
    const theta = (i / steps) * Math.PI * 2;
    points.push([(width / 2) * Math.cos(theta), (height / 2) * Math.sin(theta)]);
  }
  return points;
};

const buildStarPoints = (points, width, height, innerScale = 0.45, rotation = Math.PI / 2) => {
  const result = [];
  const outerRadiusX = width / 2;
  const outerRadiusY = height / 2;
  const innerRadiusX = outerRadiusX * innerScale;
  const innerRadiusY = outerRadiusY * innerScale;
  const totalPoints = points * 2;
  const step = (Math.PI * 2) / totalPoints;
  for (let i = 0; i < totalPoints; i += 1) {
    const angle = i * step - rotation;
    const useOuter = i % 2 === 0;
    const radiusX = useOuter ? outerRadiusX : innerRadiusX;
    const radiusY = useOuter ? outerRadiusY : innerRadiusY;
    result.push([radiusX * Math.cos(angle), radiusY * Math.sin(angle)]);
  }
  return result;
};

const buildOutlinePoints = (shape, width, height) => {
  switch (shape) {
    case 'ellipse':
      return buildEllipsePoints(width, height);
    case 'star5':
      return buildStarPoints(5, width, height, 0.45, (3 * Math.PI) / 2);
    case 'star4':
      return buildStarPoints(4, width, height, 0.5);
    default:
      return [
        [-width / 2, -height / 2],
        [width / 2, -height / 2],
        [width / 2, height / 2],
        [-width / 2, height / 2],
      ];
  }
};

const sanitizeFilename = (value, fallback) => {
  if (!value || typeof value !== 'string') {
    return fallback;
  }
  return value.replace(/[^a-z0-9._-]+/gi, '_').replace(/_+/g, '_') || fallback;
};

export const generatePlateDxf = async ({
  widthMm,
  heightMm,
  cornerRadiusMm = 0,
  engravingText = 'Memorylife',
  slug = '',
  border = false,
  url = '',
  shape = 'rectangle',
}) => {
  const width = Math.max(10, Number(widthMm) || 0);
  const height = Math.max(10, Number(heightMm) || 0);
  const w2 = width / 2;
  const h2 = height / 2;
  const radius = shape === 'rectangle' ? clamp(Number(cornerRadiusMm) || 0, 0, Math.min(w2, h2)) : 0;
  const safeText = (engravingText || '').replace(/\s+/g, ' ').trim() || 'Memorylife';
  const slugLabel = slug ? slug : '';
  const targetUrl = (url || '').trim() || (slug ? `https://memorylife.ee/legacy/${slug}` : 'https://memorylife.ee');

  let dxf = '';
  dxf += '0\nSECTION\n2\nHEADER\n0\nENDSEC\n';
  dxf += '0\nSECTION\n2\nENTITIES\n';

  if (shape === 'rectangle') {
    if (radius > 0) {
      dxf += addLine(-w2 + radius, h2, w2 - radius, h2);
      dxf += addArc(w2 - radius, h2 - radius, radius, 0, 90);
      dxf += addLine(w2, h2 - radius, w2, -h2 + radius);
      dxf += addArc(w2 - radius, -h2 + radius, radius, 270, 360);
      dxf += addLine(w2 - radius, -h2, -w2 + radius, -h2);
      dxf += addArc(-w2 + radius, -h2 + radius, radius, 180, 270);
      dxf += addLine(-w2, -h2 + radius, -w2, h2 - radius);
      dxf += addArc(-w2 + radius, h2 - radius, radius, 90, 180);
    } else {
      dxf += addLine(-w2, h2, w2, h2);
      dxf += addLine(w2, h2, w2, -h2);
      dxf += addLine(w2, -h2, -w2, -h2);
      dxf += addLine(-w2, -h2, -w2, h2);
    }
  } else {
    dxf += addPolyline(buildOutlinePoints(shape, width, height));
  }

  if (border && shape === 'rectangle') {
    const pad = 3;
    if (width > pad * 2 && height > pad * 2) {
      const bw2 = w2 - pad;
      const bh2 = h2 - pad;
      const br = Math.max(0, radius - pad);
      dxf += addLine(-bw2 + br, bh2, bw2 - br, bh2, 'ENGRAVE');
      if (br > 0) dxf += addArc(bw2 - br, bh2 - br, br, 0, 90, 'ENGRAVE');
      dxf += addLine(bw2, bh2 - br, bw2, -bh2 + br, 'ENGRAVE');
      if (br > 0) dxf += addArc(bw2 - br, -bh2 + br, br, 270, 360, 'ENGRAVE');
      dxf += addLine(bw2 - br, -bh2, -bw2 + br, -bh2, 'ENGRAVE');
      if (br > 0) dxf += addArc(-bw2 + br, -bh2 + br, br, 180, 270, 'ENGRAVE');
      dxf += addLine(-bw2, -bh2 + br, -bw2, bh2 - br, 'ENGRAVE');
      if (br > 0) dxf += addArc(-bw2 + br, bh2 - br, br, 90, 180, 'ENGRAVE');
    }
  }

  const padding = Math.min(width, height) * 0.08;
  const safeWidth = width - padding * 2;
  const safeHeight = height - padding * 2;

  const headingHeight = Math.min(height * 0.12, 18);
  const headingY = h2 - padding - headingHeight / 2;

  const slugBaseHeight = Math.min(height * 0.08, 10);
  const slugHeight = slugLabel
    ? Math.min(slugBaseHeight, Math.max(4, (safeWidth / Math.max(slugLabel.length, 1)) * 0.7))
    : slugBaseHeight;
  const slugY = -h2 + padding + slugHeight / 2;

  dxf += addText(safeText, 0, headingY, headingHeight);
  if (slugLabel) {
    dxf += addText(slugLabel, 0, slugY, slugHeight);
  }

  const qr = QRCode.create(targetUrl, { errorCorrectionLevel: 'M' });
  const moduleCount = qr.modules.size;
  if (moduleCount > 0) {
    const qrAreaTop = headingY - headingHeight / 2 - padding;
    const qrAreaBottom = slugY + slugHeight / 2 + padding;
    const qrAreaHeight = Math.max(qrAreaTop - qrAreaBottom, safeHeight * 0.4);
    const qrSizeMm = Math.min(qrAreaHeight, safeWidth);
    const moduleSize = qrSizeMm / moduleCount;
    const qrBottom = qrAreaBottom + (qrAreaHeight - qrSizeMm) / 2;
    const qrTop = qrBottom + qrSizeMm;
    const qrStartX = -qrSizeMm / 2;
    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        if (qr.modules.get(col, row)) {
          const x = qrStartX + col * moduleSize;
          const y = qrTop - (row + 1) * moduleSize;
          dxf += addSolid(x, y, moduleSize);
        }
      }
    }
  }

  dxf += '0\nENDSEC\n0\nEOF';
  const filename = sanitizeFilename(
    `nameplate_${slugLabel || safeText.replace(/\s+/g, '_') || 'memorylife'}.dxf`,
    `nameplate_${Date.now()}.dxf`
  );
  return { content: dxf, filename };
};

export default generatePlateDxf;
