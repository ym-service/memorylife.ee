const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { Drawing } = require('dxf-writer');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 5000;
const FRONTEND_ROOT = (process.env.FRONTEND_ROOT || 'http://localhost:5173').replace(/\/$/, '');
const ORDER_EMAIL = process.env.ORDER_EMAIL || 'my.agent.use1@gmail.com';
const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const poolConfig = { connectionString };

if (connectionString && /^postgres(?:ql)?:\/\//i.test(connectionString)) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('PostgreSQL pool error', err);
});

const ensureSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS legacies (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      slug TEXT UNIQUE NOT NULL
    )
  `);
};

ensureSchema().catch((err) => {
  console.error('Failed to initialize PostgreSQL schema', err);
});

const run = (sql, params = []) => pool.query(sql, params);

const get = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
};

const slugSeedFromTitle = (title = '') => {
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/(^-|-$)/g, '');
  return normalized || 'legacy';
};

const generateUniqueSlug = async (seed) => {
  let attempt = 0;
  while (attempt < 10) {
    const suffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 1000)
      .toString(36)
      .padStart(2, '0')}`;
    const candidate = `${seed}-${suffix}`;
    const existing = await get('SELECT id FROM legacies WHERE slug = $1', [candidate]);
    if (!existing) {
      return candidate;
    }
    attempt += 1;
  }
  return `${seed}-${Date.now()}`;
};

const sanitizeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const sanitizePlateOptions = (options = {}) => ({
  material: options.material || 'steel',
  border: Boolean(options.border),
  widthCm: sanitizeNumber(options.widthCm, 10),
  heightCm: sanitizeNumber(options.heightCm, 10),
  thicknessMm: sanitizeNumber(options.thicknessMm, 2),
  cornerRadiusMm: sanitizeNumber(options.cornerRadiusMm, 2),
});

const dataUrlToBuffer = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.includes(',')) {
    return null;
  }
  const [, base64] = dataUrl.split(',');
  try {
    return Buffer.from(base64, 'base64');
  } catch (error) {
    console.error('Failed to parse preview image', error);
    return null;
  }
};

const createPdfSpec = ({ slug, legacyUrl, order, plate }) =>
  new Promise((resolve, reject) => {
    try {
      const dir = TMP_DIR;
      const filename = `memorylife-${slug}-${Date.now()}.pdf`;
      const filePath = path.join(dir, filename);
      const doc = new PDFDocument({ margin: 36 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(22).text('Memorylife Plaque Specification', { align: 'left' });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Slug: ${slug}`);
      doc.text(`Material: ${plate.material}`);
      doc.text(`Width: ${plate.widthCm} cm`);
      doc.text(`Height: ${plate.heightCm} cm`);
      doc.text(`Thickness: ${plate.thicknessMm} mm`);
      doc.text(`Corner radius: ${plate.cornerRadiusMm} mm`);
      doc.text(`Engraved border: ${plate.border ? 'Yes' : 'No'}`);
      doc.moveDown();
      doc.text(`Legacy URL: ${legacyUrl}`, { link: legacyUrl, underline: true });
      doc.moveDown();
      doc.text(`Ordered by: ${order.name} (${order.email})`);
      if (order.phone) {
        doc.text(`Phone: ${order.phone}`);
      }
      doc.moveDown();
      doc.text('Message:');
      doc.font('Helvetica-Oblique').text(order.message || '—', { lineGap: 4 });
      doc.font('Helvetica');
      doc.moveDown();

      const previewBuffer = dataUrlToBuffer(order.previewImage);
      if (previewBuffer) {
        doc.text('Preview:');
        doc.moveDown(0.5);
        doc.image(previewBuffer, {
          fit: [460, 280],
          align: 'center',
          valign: 'center',
        });
      }

      doc.end();
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });

const createDxfSpec = async ({ slug, legacyUrl, plate }) => {
  const drawing = new Drawing();
  drawing.setUnits('Millimeters');
  const widthMm = plate.widthCm * 10;
  const heightMm = plate.heightCm * 10;
  const cornerMm = plate.cornerRadiusMm;

  drawing.addLayer('DETAIL', Drawing.ACI.GREEN, 'CONTINUOUS');
  drawing.addLayer('QR', Drawing.ACI.BLUE, 'CONTINUOUS');
  drawing.addLayer('TEXT', Drawing.ACI.CYAN, 'CONTINUOUS');

  drawing.addLwPolyLine(
    [
      [0, 0],
      [widthMm, 0],
      [widthMm, heightMm],
      [0, heightMm],
      [0, 0],
    ],
    true,
    undefined,
    'DETAIL'
  );

  drawing.addText(`Slug: ${slug}`, 0, heightMm + 12, 5, 'TEXT');
  drawing.addText(`Material: ${plate.material}`, 0, heightMm + 20, 5, 'TEXT');

  const qr = QRCode.create(legacyUrl || `https://memorylife.local/legacy/${slug}`, {
    errorCorrectionLevel: 'M',
  });
  const size = qr.modules.size;
  const moduleSize = (Math.min(widthMm, heightMm) * 0.6) / size;
  const startX = (widthMm - moduleSize * size) / 2;
  const startY = (heightMm - moduleSize * size) / 2;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (qr.modules.get(col, row)) {
        const x = startX + col * moduleSize;
        const y = startY + (size - row - 1) * moduleSize;
        drawing.addLwPolyLine(
          [
            [x, y],
            [x + moduleSize, y],
            [x + moduleSize, y + moduleSize],
            [x, y + moduleSize],
            [x, y],
          ],
          true,
          undefined,
          'QR'
        );
      }
    }
  }

  const filename = `memorylife-${slug}-${Date.now()}.dxf`;
  const filePath = path.join(TMP_DIR, filename);
  fs.writeFileSync(filePath, drawing.toDxfString(), 'utf8');
  return filePath;
};

const createEmailTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 465,
      secure: SMTP_SECURE ? SMTP_SECURE === 'true' : true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  console.warn(
    'SMTP configuration is incomplete. Falling back to JSON transport (emails logged to console).'
  );
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const emailTransport = createEmailTransport();

app.post('/api/legacy', async (req, res) => {
  const { title, content, image_url } = req.body || {};

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const normalizedImage = (image_url || '').trim();

    const slug = await generateUniqueSlug(slugSeedFromTitle(trimmedTitle));

    await run(
      'INSERT INTO legacies (title, content, image_url, slug) VALUES ($1, $2, $3, $4)',
      [trimmedTitle, trimmedContent, normalizedImage, slug]
    );

    res.status(201).json({ slug });
  } catch (error) {
    console.error('Error creating legacy', error);
    res.status(500).json({ message: 'Failed to create legacy entry.' });
  }
});

app.get('/api/legacy/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const legacy = await get(
      'SELECT title, content, image_url, slug FROM legacies WHERE slug = $1',
      [slug]
    );
    if (!legacy) {
      return res.status(404).json({ message: 'Legacy not found.' });
    }
    res.json(legacy);
  } catch (error) {
    console.error('Error fetching legacy', error);
    res.status(500).json({ message: 'Something went wrong while fetching the legacy.' });
  }
});

app.post('/api/order', async (req, res) => {
  const { name, email, phone = '', message = '', slug, legacyUrl, plateOptions, previewImage } =
    req.body || {};

  if (!name || !email || !message || !slug) {
    return res
      .status(400)
      .json({ message: 'Name, email, message, and slug are required to submit an order.' });
  }

  if (!plateOptions) {
    return res.status(400).json({ message: 'Plate configuration is required.' });
  }

  const normalizedPlate = sanitizePlateOptions(plateOptions);
  const safeLegacyUrl = legacyUrl || `${FRONTEND_ROOT}/legacy/${slug}`;
  const subject = `Memorylife plaque order: ${slug}`;
  const detailsBlock = [
    `Material: ${normalizedPlate.material}`,
    `Dimensions: ${normalizedPlate.widthCm}cm x ${normalizedPlate.heightCm}cm`,
    `Thickness: ${normalizedPlate.thicknessMm}mm`,
    `Corner radius: ${normalizedPlate.cornerRadiusMm}mm`,
    `Engraved border: ${normalizedPlate.border ? 'Yes' : 'No'}`,
  ].join('\n');
  const plainText = [
    'New Memorylife plaque order:',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'not provided'}`,
    `Slug: ${slug}`,
    `Legacy URL: ${safeLegacyUrl}`,
    '',
    detailsBlock,
    '',
    'Message:',
    message,
  ].join('\n');

  const htmlBody = `
    <h2>New Memorylife plaque order</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || 'not provided'}</p>
    <p><strong>Slug:</strong> ${slug}</p>
    <p><strong>Legacy URL:</strong> <a href="${safeLegacyUrl}" target="_blank">${safeLegacyUrl}</a></p>
    <h3>Plaque details</h3>
    <ul>
      <li>Material: ${normalizedPlate.material}</li>
      <li>Dimensions: ${normalizedPlate.widthCm}cm × ${normalizedPlate.heightCm}cm</li>
      <li>Thickness: ${normalizedPlate.thicknessMm}mm</li>
      <li>Corner radius: ${normalizedPlate.cornerRadiusMm}mm</li>
      <li>Engraved border: ${normalizedPlate.border ? 'Yes' : 'No'}</li>
    </ul>
    <h3>Message</h3>
    <p>${message.replace(/\\n/g, '<br>')}</p>
  `;

  let pdfPath;
  let dxfPath;

  try {
    pdfPath = await createPdfSpec({
      slug,
      legacyUrl: safeLegacyUrl,
      order: { name, email, phone, message, previewImage },
      plate: normalizedPlate,
    });
  } catch (error) {
    console.error('Failed to create PDF spec', error);
  }

  try {
    dxfPath = await createDxfSpec({
      slug,
      legacyUrl: safeLegacyUrl,
      plate: normalizedPlate,
    });
  } catch (error) {
    console.error('Failed to create DXF spec', error);
  }

  const attachments = [];
  if (pdfPath) {
    attachments.push({ filename: path.basename(pdfPath), path: pdfPath });
  }
  if (dxfPath) {
    attachments.push({ filename: path.basename(dxfPath), path: dxfPath });
  }

  try {
    const info = await emailTransport.sendMail({
      to: ORDER_EMAIL,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@memorylife.local',
      replyTo: email,
      subject,
      text: plainText,
      html: htmlBody,
      attachments,
    });

    res.json({
      status: 'ok',
      messageId: info.messageId || null,
      envelope: info.envelope || null,
      files: {
        pdf: pdfPath ? path.basename(pdfPath) : null,
        dxf: dxfPath ? path.basename(dxfPath) : null,
      },
    });
  } catch (error) {
    console.error('Error sending order email', error);
    res.status(500).json({ message: 'Failed to send order request.' });
  }
});

app.get('/', (_req, res) => {
  res.json({ status: 'Memorylife API is running' });
});

app.listen(PORT, () => {
  console.log(`Memorylife API listening on http://localhost:${PORT}`);
});
