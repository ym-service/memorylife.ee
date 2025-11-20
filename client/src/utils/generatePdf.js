import { jsPDF } from 'jspdf';

const sectionTitle = (doc, title, x, y) => {
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x, y);
  return y + 6;
};

const sectionBody = (doc, text, x, y, maxWidth) => {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = Array.isArray(text) ? text : [text];
  let cursor = y;
  lines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, maxWidth);
    doc.text(wrapped, x, cursor);
    cursor += wrapped.length * 5;
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
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const padding = 14;
  let cursorY = padding;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Memorylife Order Summary', padding, cursorY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
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
