import jsPDFLib from 'jspdf';

const resolveJsPdf = () => {
  if (typeof jsPDFLib === 'function') {
    return jsPDFLib;
  }
  if (typeof jsPDFLib?.jsPDF === 'function') {
    return jsPDFLib.jsPDF;
  }
  if (typeof jsPDFLib?.default === 'function') {
    return jsPDFLib.default;
  }
  throw new Error('jsPDF constructor is unavailable.');
};

const sectionTitle = (doc, title, x, y) => {
  if (typeof doc.setFontSize === 'function') {
    doc.setFontSize(13);
  }
  if (typeof doc.setFont === 'function') {
    doc.setFont('helvetica', 'bold');
  }
  doc.text(title, x, y);
  return y + 6;
};

const wrapLine = (doc, text, maxWidth) => {
  if (typeof text !== 'string' || !text.length) {
    return [''];
  }
  if (typeof doc.splitTextToSize === 'function') {
    const wrapped = doc.splitTextToSize(text, maxWidth);
    return Array.isArray(wrapped) ? wrapped : [wrapped];
  }
  const approximateChars = Math.max(20, Math.min(120, Math.floor(maxWidth * 2)));
  const result = [];
  for (let i = 0; i < text.length; i += approximateChars) {
    result.push(text.slice(i, i + approximateChars));
  }
  return result.length ? result : [text];
};

const sectionBody = (doc, text, x, y, maxWidth) => {
  if (typeof doc.setFontSize === 'function') {
    doc.setFontSize(10);
  }
  if (typeof doc.setFont === 'function') {
    doc.setFont('helvetica', 'normal');
  }
  const lines = Array.isArray(text) ? text : [text];
  let cursor = y;
  lines.forEach((line) => {
    const wrapped = wrapLine(doc, line, maxWidth);
    wrapped.forEach((segment) => {
      doc.text(segment, x, cursor);
      cursor += 5;
    });
  });
  return cursor + 2;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = src;
  });

const mapPlateDetails = (options) => [
  `Material: ${options.material}`,
  `Dimensions: ${options.widthCm}cm x ${options.heightCm}cm`,
  `Thickness: ${options.thicknessMm}mm`,
  `Shape: ${options.shape}`,
  `Corner radius: ${options.cornerRadiusMm}mm`,
  `Engraved border: ${options.border ? 'Yes' : 'No'}`,
];

export const generateOrderPdf = async ({
  slug,
  legacyUrl,
  orderForm,
  plateOptions = {},
  engravingText = 'Memorylife',
  previewImage = '',
}) => {
  const JsPdfConstructor = resolveJsPdf();
  const doc = new JsPdfConstructor({ unit: 'mm', format: 'a4' });
  const padding = 14;
  let cursorY = padding;

  if (typeof doc.setFont === 'function') {
    doc.setFont('helvetica', 'bold');
  }
  if (typeof doc.setFontSize === 'function') {
    doc.setFontSize(18);
  }
  doc.text('Memorylife Order Summary', padding, cursorY);
  if (typeof doc.setFontSize === 'function') {
    doc.setFontSize(11);
  }
  if (typeof doc.setFont === 'function') {
    doc.setFont('helvetica', 'normal');
  }
  const subheading = `Slug: ${slug || 'n/a'} • Legacy: ${legacyUrl || '-'}`;
  cursorY += 6;
  doc.text(subheading, padding, cursorY);
  cursorY += 8;

  cursorY = sectionTitle(doc, 'Engraving Text', padding, cursorY);
  cursorY = sectionBody(doc, engravingText || 'Memorylife', padding, cursorY, 182);

  cursorY = sectionTitle(doc, 'Plate Configuration', padding, cursorY);
  cursorY = sectionBody(doc, mapPlateDetails(plateOptions), padding, cursorY, 182);

  cursorY = sectionTitle(doc, 'Order Contact', padding, cursorY);
  cursorY = sectionBody(
    [
      `Name: ${orderForm.name || '-'}`,
      `Email: ${orderForm.email || '-'}`,
      `Phone: ${orderForm.phone || '-'}`,
    ],
    padding,
    cursorY,
    182
  );

  cursorY = sectionTitle(doc, 'Message', padding, cursorY);
  cursorY = sectionBody(orderForm.message || '-', padding, cursorY, 182);

  cursorY = sectionTitle(doc, 'Notes', padding, cursorY);
  cursorY = sectionBody(
    [
      'Generated on client side along with DXF.',
      'Preview image (right) represents the requested plaque.',
    ],
    padding,
    cursorY,
    120
  );

  try {
    const img = await loadImage(previewImage);
    if (img) {
      const maxWidth = 80;
      const maxHeight = 60;
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      const renderWidth = img.width * ratio;
      const renderHeight = img.height * ratio;
      const x = doc.internal.pageSize.getWidth() - renderWidth - padding;
      const y = doc.internal.pageSize.getHeight() - renderHeight - padding;
      doc.roundedRect(x - 2, y - 2, renderWidth + 4, renderHeight + 4, 2, 2, 'S');
      doc.addImage(previewImage, 'PNG', x, y, renderWidth, renderHeight);
    }
  } catch (error) {
    console.error('Preview image failed to load for PDF', error);
  }

  const filename = `memorylife-${slug || 'order'}-${Date.now()}-summary.pdf`;
  return {
    content: doc.output('arraybuffer'),
    filename,
  };
};

export default generateOrderPdf;
