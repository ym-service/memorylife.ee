import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const MM_TO_PT = 72 / 25.4;
const A4_WIDTH = 210 * MM_TO_PT;
const A4_HEIGHT = 297 * MM_TO_PT;
const MARGIN = 18 * MM_TO_PT;

const loadImageBytes = async (src) => {
  if (!src) {
    return null;
  }
  try {
    const response = await fetch(src);
    if (!response.ok) {
      return null;
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.error('Failed to load preview image', error);
    return null;
  }
};

const wrapText = (text, font, size, maxWidth) => {
  if (!text) {
    return [''];
  }
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  words.forEach((word) => {
    const tentative = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(tentative, size);
    if (width <= maxWidth || !current) {
      current = tentative;
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) {
    lines.push(current);
  }
  return lines.length ? lines : [''];
};

const drawSection = ({ page, font, boldFont, title, text, cursorY }) => {
  const titleSize = 13;
  const bodySize = 10;
  const maxWidth = A4_WIDTH - MARGIN * 2;
  page.drawText(title, {
    x: MARGIN,
    y: cursorY,
    size: titleSize,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  cursorY -= titleSize + 4;
  const lines = Array.isArray(text) ? text : [text];
  lines.forEach((line) => {
    const wrapped = wrapText(line, font, bodySize, maxWidth);
    wrapped.forEach((segment) => {
      page.drawText(segment, {
        x: MARGIN,
        y: cursorY,
        size: bodySize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      cursorY -= bodySize + 2;
    });
    cursorY -= 2;
  });
  cursorY -= 4;
  return cursorY;
};

export const generateOrderPdf = async ({
  slug,
  legacyUrl,
  orderForm,
  plateOptions = {},
  engravingText = 'Memorylife',
  previewImage = '',
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let cursorY = A4_HEIGHT - MARGIN;

  const heading = 'Memorylife Order Summary';
  const headingSize = 20;
  page.drawText(heading, {
    x: MARGIN,
    y: cursorY,
    size: headingSize,
    font: boldFont,
  });
  cursorY -= headingSize + 6;

  const subheading = `Slug: ${slug || 'n/a'} • Legacy: ${legacyUrl || '-'}`;
  const subSize = 11;
  page.drawText(subheading, {
    x: MARGIN,
    y: cursorY,
    size: subSize,
    font,
  });
  cursorY -= subSize + 12;

  cursorY = drawSection({
    page,
    font,
    boldFont,
    title: 'Engraving Text',
    text: engravingText || 'Memorylife',
    cursorY,
  });

  const plateDetails = [
    `Material: ${plateOptions.material}`,
    `Dimensions: ${plateOptions.widthCm}cm x ${plateOptions.heightCm}cm`,
    `Thickness: ${plateOptions.thicknessMm}mm`,
    `Shape: ${plateOptions.shape}`,
    `Corner radius: ${plateOptions.cornerRadiusMm}mm`,
    `Engraved border: ${plateOptions.border ? 'Yes' : 'No'}`,
  ];
  cursorY = drawSection({
    page,
    font,
    boldFont,
    title: 'Plate Configuration',
    text: plateDetails,
    cursorY,
  });

  cursorY = drawSection({
    page,
    font,
    boldFont,
    title: 'Order Contact',
    text: [
      `Name: ${orderForm.name || '-'}`,
      `Email: ${orderForm.email || '-'}`,
      `Phone: ${orderForm.phone || '-'}`,
    ],
    cursorY,
  });

  cursorY = drawSection({
    page,
    font,
    boldFont,
    title: 'Message',
    text: orderForm.message || '-',
    cursorY,
  });

  cursorY = drawSection({
    page,
    font,
    boldFont,
    title: 'Notes',
    text: [
      'Generated automatically on the client along with DXF.',
      'Preview image (right) represents the selected plate.',
    ],
    cursorY,
  });

  const imageBytes = await loadImageBytes(previewImage);
  if (imageBytes) {
    try {
      const image = await pdfDoc.embedPng(imageBytes);
      const maxWidth = 80 * MM_TO_PT;
      const maxHeight = 60 * MM_TO_PT;
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
      const imgWidth = image.width * scale;
      const imgHeight = image.height * scale;
      const x = A4_WIDTH - imgWidth - MARGIN;
      const y = MARGIN;
      page.drawRectangle({
        x: x - 4,
        y: y - 4,
        width: imgWidth + 8,
        height: imgHeight + 8,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
      page.drawImage(image, {
        x,
        y,
        width: imgWidth,
        height: imgHeight,
      });
    } catch (error) {
      console.error('Failed to embed preview image into PDF', error);
    }
  }

  const filename = `memorylife-${slug || 'order'}-${Date.now()}-summary.pdf`;
  const pdfBytes = await pdfDoc.save();
  return {
    content: pdfBytes,
    filename,
  };
};

export default generateOrderPdf;
