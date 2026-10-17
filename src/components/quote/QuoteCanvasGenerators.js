// ========================================================
// LUXURY MULTI-TEMPLATE QUOTATION CANVAS EXPORTERS
// High-DPI Retina (2x) PNG Canvas Rendering Engine
// ========================================================

const SANS_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Plus Jakarta Sans", sans-serif';
const MONO_FONT = 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace';

// Helper: Asynchronously load image from dataUrl or URL
export const loadLogoImage = (url) => {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// Helper: Rounded Rectangle Path
export const drawRoundedRect = (ctx, x, y, w, h, r) => {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
};

// Helper: Draw Serrated Zigzag Teeth for Boutique Receipt Slips
export const drawZigzag = (ctx, startX, y, width, toothW, toothH, pointsUp = false) => {
  const count = Math.ceil(width / toothW);
  ctx.beginPath();
  ctx.moveTo(startX, y);
  for (let i = 0; i < count; i++) {
    const midX = startX + i * toothW + toothW / 2;
    const endX = startX + (i + 1) * toothW;
    const peakY = pointsUp ? y - toothH : y + toothH;
    ctx.lineTo(midX, peakY);
    ctx.lineTo(endX, y);
  }
};

// Helper: Text truncation if too long
export const truncate = (str, max = 50) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
};

// Helper: Fit or truncate text to exact pixel width
export const fitText = (ctx, text, maxW) => {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxW) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxW) {
    truncated = truncated.slice(0, -1);
  }
  return truncated ? truncated + '...' : '';
};

// Helper: Wrap text into lines that fit strictly within maxW
export const wrapText = (ctx, text, maxW) => {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxW) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = ctx.measureText(word).width <= maxW ? word : fitText(ctx, word, maxW);
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
};

// ========================================================
// 1. CORPORATE WAVE CANVAS GENERATOR
// ========================================================
export const generateCorporateCanvas = async ({
  profile,
  items,
  clientName,
  projectTitle,
  quoteNumber,
  issueDate,
  symbol,
  total,
  scale = 2,
  logicalW = 430
}) => {
  const cardX = 14;
  const cardY = 14;
  const cardW = logicalW - 28;
  const cardR = 18;
  const innerLeft = cardX + 20;
  const innerRight = cardX + cardW - 20;
  const innerW = innerRight - innerLeft;

  // Pre-calculate terms wrapped lines to allocate exact pixel height
  const mCanvas = document.createElement('canvas');
  const mCtx = mCanvas.getContext('2d');
  mCtx.font = `11px ${SANS_FONT}`;
  const termsRaw = profile.termsText ? `⚡ Terms & Turnaround: ${profile.termsText}` : '';
  const termsLines = termsRaw ? wrapText(mCtx, termsRaw, innerW - 24) : [];
  const termsBoxH = termsLines.length > 0 ? Math.max(30, 14 + termsLines.length * 15) : 0;

  // Calculate dynamic heights
  const headerH = 78;
  const clientH = 54;
  const tableHeadH = 26;
  const tableRowsH = items.reduce((acc, it) => acc + (it.description ? 40 : 26), 0);
  const totalH = 52;
  const bankH = 54;
  const termsH = termsBoxH;
  const footerH = 46;

  const contentH = cardY + headerH + 16 + clientH + 16 + tableHeadH + tableRowsH + 16 + totalH + 14 + bankH + (termsLines.length > 0 ? 12 + termsH : 0) + 16 + footerH + cardY + 8;
  
  const canvas = document.createElement('canvas');
  canvas.width = logicalW * scale;
  canvas.height = contentH * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, logicalW, contentH);

  // Outer Card
  const cardH = contentH - cardY * 2;
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Load Logo
  const logoImg = await loadLogoImage(profile.logoUrl);

  // Header Wave Background (Clipped inside top card radius)
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  // Top Dark Obsidian Banner
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(cardX, cardY, cardW, headerH);

  // Accent Curve Wave
  ctx.beginPath();
  ctx.moveTo(cardX, cardY + headerH - 14);
  ctx.bezierCurveTo(
    cardX + cardW * 0.4, cardY + headerH + 10,
    cardX + cardW * 0.7, cardY + headerH - 18,
    cardX + cardW, cardY + headerH - 4
  );
  ctx.lineTo(cardX + cardW, cardY + headerH + 4);
  ctx.lineTo(cardX, cardY + headerH + 4);
  ctx.closePath();
  ctx.fillStyle = profile.accentColor;
  ctx.fill();

  ctx.restore();

  // Content inside Header
  let currentY = cardY + 16;

  // Logo / Monogram
  if (logoImg) {
    ctx.save();
    drawRoundedRect(ctx, innerLeft, currentY, 44, 44, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.clip();
    ctx.drawImage(logoImg, innerLeft, currentY, 44, 44);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, innerLeft, currentY, 44, 44, 10);
    ctx.stroke();
  } else {
    ctx.save();
    drawRoundedRect(ctx, innerLeft, currentY, 44, 44, 10);
    ctx.fillStyle = profile.accentColor;
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold 16px ${SANS_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(profile.providerName ? profile.providerName.slice(0, 2).toUpperCase() : 'PS', innerLeft + 22, currentY + 22);
    ctx.restore();
  }

  // Top-Right Ref Badge - dynamically measured with safe inset
  const badgeText = `ESTIMATE #${quoteNumber}`;
  ctx.font = `bold 10px ${SANS_FONT}`;
  const badgeTextW = ctx.measureText(badgeText).width;
  const badgeW = Math.max(90, Math.ceil(badgeTextW + 16));
  const badgeH = 22;
  const badgeX = innerRight - badgeW;
  const badgeY = currentY + 2;

  ctx.save();
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 11);
  ctx.fillStyle = profile.accentColor;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 10px ${SANS_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + 15);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#34D399';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('● OFFICIAL QUOTE', innerRight, currentY + 40);

  // Studio Name & Phone/Email (Dynamically bounded before the badge)
  const titleStartX = innerLeft + 54;
  const maxTitleW = Math.max(80, badgeX - titleStartX - 12);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 15px ${SANS_FONT}`;
  ctx.fillText(fitText(ctx, profile.providerName || 'Freelance Studio', maxTitleW), titleStartX, currentY + 20);

  ctx.fillStyle = '#94A3B8';
  ctx.font = `11px ${SANS_FONT}`;
  const subContact = `${profile.providerPhone}  •  ${profile.providerEmail}`;
  ctx.fillText(fitText(ctx, subContact, maxTitleW + 30), titleStartX, currentY + 38);

  currentY = cardY + headerH + 16;

  // Client Details Card
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, innerW, clientH, 12);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('PREPARED FOR CLIENT', innerLeft + 14, currentY + 18);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 13px ${SANS_FONT}`;
  ctx.fillText(truncate(clientName || 'Valued Client', 32), innerLeft + 14, currentY + 33);

  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${SANS_FONT}`;
  ctx.fillText(truncate(projectTitle || 'Services Engagement', 38), innerLeft + 14, currentY + 46);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('ISSUE DATE', innerRight - 14, currentY + 18);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 12px ${MONO_FONT}`;
  ctx.fillText(issueDate, innerRight - 14, currentY + 33);

  ctx.fillStyle = '#10B981';
  ctx.font = `bold 10px ${SANS_FONT}`;
  ctx.fillText('Valid for 14 Days', innerRight - 14, currentY + 46);

  currentY += clientH + 16;

  // Deliverables Table Header (Solid Accent Bar)
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, innerW, tableHeadH, 6);
  ctx.fillStyle = profile.accentColor;
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 10px ${SANS_FONT}`;
  ctx.fillText('  #   ITEM / DELIVERABLE', innerLeft + 8, currentY + 17);

  ctx.textAlign = 'right';
  ctx.fillText('AMOUNT  ', innerRight - 8, currentY + 17);

  currentY += tableHeadH + 4;

  // Items
  items.forEach((item, idx) => {
    const isEven = idx % 2 === 1;
    const rowH = item.description ? 38 : 24;

    if (isEven) {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(innerLeft, currentY - 2, innerW, rowH);
    }

    const priceStr = `${symbol}${Number(item.price || 0).toLocaleString()}`;
    ctx.font = `bold 12px ${SANS_FONT}`;
    const priceW = ctx.measureText(priceStr).width;
    const maxItemTitleW = innerW - priceW - 36;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`${String(idx + 1).padStart(2, '0')}.  ${fitText(ctx, item.title || 'Service Item', maxItemTitleW)}`, innerLeft + 10, currentY + 14);

    ctx.textAlign = 'right';
    ctx.fillText(priceStr, innerRight - 10, currentY + 14);

    if (item.description) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = `italic 11px ${SANS_FONT}`;
      ctx.fillText(`     ↳ ${fitText(ctx, item.description, innerW - 32)}`, innerLeft + 12, currentY + 28);
    }

    currentY += rowH;
  });

  currentY += 12;

  // Total Investment Dark Card
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, innerW, totalH, 12);
  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 10px ${SANS_FONT}`;
  ctx.fillText('TOTAL INVESTMENT', innerLeft + 16, currentY + 22);

  ctx.fillStyle = '#34D399';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('● ALL SCOPE INCLUDED • FIXED ESTIMATE', innerLeft + 16, currentY + 38);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 22px ${SANS_FONT}`;
  ctx.fillText(`${symbol}${total.toLocaleString()}`, innerRight - 16, currentY + 35);

  currentY += totalH + 14;

  // Bank Instructions Box
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, innerW, bankH, 10);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('PAYMENT INSTRUCTIONS (DIRECT BANK TRANSFER)', innerLeft + 14, currentY + 16);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 12px ${SANS_FONT}`;
  ctx.fillText(`${profile.bankName}  •  Acct: `, innerLeft + 14, currentY + 33);

  const bankTextW = ctx.measureText(`${profile.bankName}  •  Acct: `).width;
  ctx.fillStyle = profile.accentColor;
  ctx.font = `bold 12px ${SANS_FONT}`;
  ctx.fillText(profile.accountNumber, innerLeft + 14 + bankTextW, currentY + 33);

  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${SANS_FONT}`;
  ctx.fillText(`Beneficiary: ${profile.accountName}`, innerLeft + 14, currentY + 46);

  currentY += bankH;

  // Terms Note inside clean capsule
  if (termsLines.length > 0) {
    currentY += 10;
    ctx.save();
    drawRoundedRect(ctx, innerLeft, currentY, innerW, termsBoxH, 10);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = `11px ${SANS_FONT}`;
    termsLines.forEach((tLine, lIdx) => {
      ctx.fillText(tLine, logicalW / 2, currentY + 16 + lIdx * 15);
    });
    currentY += termsBoxH;
  }

  currentY += 14;

  // Authorized Signature & Footer
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();

  currentY += 18;

  // Left: Verification Seal
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 11px ${SANS_FONT}`;
  ctx.fillText('🛡️ Verified Freelance Quotation', innerLeft, currentY);

  ctx.fillStyle = '#94A3B8';
  ctx.font = `10px ${SANS_FONT}`;
  ctx.fillText('Electronically issued via Ophancer Studio', innerLeft, currentY + 14);

  // Right: Signature line
  ctx.textAlign = 'right';
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerRight - 110, currentY + 2);
  ctx.lineTo(innerRight, currentY + 2);
  ctx.stroke();

  ctx.fillStyle = '#64748B';
  ctx.font = `10px ${SANS_FONT}`;
  ctx.fillText('Authorized Signature', innerRight, currentY + 16);

  return canvas;
};

// ========================================================
// 2. MINIMALIST PRO-FORMA CANVAS GENERATOR
// ========================================================
export const generateMinimalistCanvas = async ({
  profile,
  items,
  clientName,
  projectTitle,
  quoteNumber,
  issueDate,
  symbol,
  total,
  scale = 2,
  logicalW = 430
}) => {
  const cardX = 14;
  const cardY = 14;
  const cardW = logicalW - 28;
  const cardR = 16;
  const innerLeft = cardX + 24;
  const innerRight = cardX + cardW - 24;
  const innerW = innerRight - innerLeft;

  // Pre-calculate terms wrapped lines
  const mCanvas = document.createElement('canvas');
  const mCtx = mCanvas.getContext('2d');
  mCtx.font = `italic 11px ${SANS_FONT}`;
  const termsRaw = profile.termsText ? `Terms & Turnaround: ${profile.termsText}` : '';
  const termsLines = termsRaw ? wrapText(mCtx, termsRaw, innerW - 16) : [];
  const termsBoxH = termsLines.length > 0 ? Math.max(22, 8 + termsLines.length * 14) : 0;

  const headerH = 72;
  const metaH = 46;
  const tableHeadH = 22;
  const tableRowsH = items.reduce((acc, it) => acc + (it.description ? 38 : 24), 0);
  const totalH = 44;
  const bankH = 50;
  const termsH = termsBoxH;
  const bottomWaveH = 38;

  const contentH = cardY + headerH + 14 + metaH + 16 + tableHeadH + tableRowsH + 16 + totalH + 12 + bankH + (termsLines.length > 0 ? 10 + termsH : 0) + 16 + bottomWaveH + cardY;

  const canvas = document.createElement('canvas');
  canvas.width = logicalW * scale;
  canvas.height = contentH * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, logicalW, contentH);

  // Outer Card
  const cardH = contentH - cardY * 2;
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Top Thin Accent Line
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();
  ctx.fillStyle = profile.accentColor;
  ctx.fillRect(cardX, cardY, cardW, 4);
  ctx.restore();

  let currentY = cardY + 26;

  // Centered Minimalist Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 18px ${SANS_FONT}`;
  ctx.fillText(fitText(ctx, profile.providerName || 'Freelance Studio', innerW - 10), logicalW / 2, currentY);

  currentY += 17;
  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${SANS_FONT}`;
  const miniSub = `${profile.providerPhone}  •  ${profile.providerEmail}`;
  ctx.fillText(fitText(ctx, miniSub, innerW - 10), logicalW / 2, currentY);

  currentY += 18;
  ctx.fillStyle = '#64748B';
  ctx.font = `bold 10px ${MONO_FONT}`;
  ctx.fillText('P R O - F O R M A   Q U O T A T I O N', logicalW / 2, currentY);

  currentY += 12;

  // Metadata Grid (Hairline borders)
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();

  currentY += 14;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('BILLED TO:', innerLeft, currentY);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 12px ${SANS_FONT}`;
  ctx.fillText(truncate(clientName || 'Valued Client', 28), innerLeft, currentY + 14);

  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${SANS_FONT}`;
  ctx.fillText(truncate(projectTitle || 'Services Engagement', 32), innerLeft, currentY + 27);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('REFERENCE & DATE:', innerRight, currentY);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 12px ${MONO_FONT}`;
  ctx.fillText(quoteNumber, innerRight, currentY + 14);

  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${SANS_FONT}`;
  ctx.fillText(issueDate, innerRight, currentY + 27);

  currentY += 34;
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();

  currentY += 14;

  // Deliverables Table
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 10px ${SANS_FONT}`;
  ctx.fillText('SCOPE / DELIVERABLE', innerLeft, currentY);

  ctx.textAlign = 'right';
  ctx.fillText('PRICE', innerRight, currentY);

  currentY += 8;
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();

  currentY += 14;

  items.forEach((item, idx) => {
    const priceStr = `${symbol}${Number(item.price || 0).toLocaleString()}`;
    ctx.font = `bold 12px ${SANS_FONT}`;
    const priceW = ctx.measureText(priceStr).width;
    const maxItemTitleW = innerW - priceW - 30;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(`${idx + 1}.  ${fitText(ctx, item.title || 'Service Item', maxItemTitleW)}`, innerLeft, currentY);

    ctx.textAlign = 'right';
    ctx.fillText(priceStr, innerRight, currentY);

    if (item.description) {
      currentY += 14;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = `italic 11px ${SANS_FONT}`;
      ctx.fillText(`    ↳ ${fitText(ctx, item.description, innerW - 20)}`, innerLeft, currentY);
    }

    currentY += 14;
    ctx.strokeStyle = '#F1F5F9';
    ctx.beginPath();
    ctx.moveTo(innerLeft, currentY);
    ctx.lineTo(innerRight, currentY);
    ctx.stroke();
    currentY += 8;
  });

  currentY += 4;

  // Grand Total Line
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();

  currentY += 18;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#475569';
  ctx.font = `bold 11px ${SANS_FONT}`;
  ctx.fillText('TOTAL INVESTMENT DUE', innerLeft, currentY);

  ctx.textAlign = 'right';
  ctx.fillStyle = profile.accentColor;
  ctx.font = `bold 22px ${SANS_FONT}`;
  ctx.fillText(`${symbol}${total.toLocaleString()}`, innerRight, currentY);

  currentY += 18;

  // Bank & Settlement Box
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, innerW, bankH, 10);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('DIRECT PAYMENT TRANSFER', innerLeft + 14, currentY + 16);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 12px ${SANS_FONT}`;
  ctx.fillText(`${profile.bankName}  •  Acct: `, innerLeft + 14, currentY + 33);

  const acctW = ctx.measureText(`${profile.bankName}  •  Acct: `).width;
  ctx.fillStyle = profile.accentColor;
  ctx.font = `bold 12px ${SANS_FONT}`;
  ctx.fillText(profile.accountNumber, innerLeft + 14 + acctW, currentY + 33);

  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${SANS_FONT}`;
  ctx.fillText(`Beneficiary: ${profile.accountName}`, innerLeft + 14, currentY + 45);

  currentY += bankH;

  // Terms
  if (termsLines.length > 0) {
    currentY += 8;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = `italic 11px ${SANS_FONT}`;
    termsLines.forEach((tLine, lIdx) => {
      ctx.fillText(tLine, logicalW / 2, currentY + 12 + lIdx * 14);
    });
    currentY += termsBoxH;
  }

  // Bottom Wave Accent Banner
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  const waveY = cardY + cardH - bottomWaveH;
  ctx.fillStyle = profile.accentColor;
  ctx.fillRect(cardX, waveY, cardW, bottomWaveH);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 10px ${SANS_FONT}`;
  ctx.fillText('THANK YOU FOR YOUR BUSINESS • OPHANCER VERIFIED', logicalW / 2, waveY + 23);

  ctx.restore();

  return canvas;
};

// ========================================================
// 3. CREATIVE BENTO CANVAS GENERATOR
// ========================================================
export const generateBentoCanvas = async ({
  profile,
  items,
  clientName,
  projectTitle,
  quoteNumber,
  issueDate,
  symbol,
  total,
  scale = 2,
  logicalW = 430
}) => {
  const cardX = 14;
  const cardY = 14;
  const cardW = logicalW - 28;
  const cardR = 20;
  const innerLeft = cardX + 18;
  const innerRight = cardX + cardW - 18;
  const innerW = innerRight - innerLeft;

  // Pre-calculate terms wrapped lines
  const mCanvas = document.createElement('canvas');
  const mCtx = mCanvas.getContext('2d');
  mCtx.font = `11px ${SANS_FONT}`;
  const termsRaw = profile.termsText ? `⚡ Turnaround: ${profile.termsText}` : '';
  const termsLines = termsRaw ? wrapText(mCtx, termsRaw, innerW - 24) : [];
  const termsBoxH = termsLines.length > 0 ? Math.max(32, 14 + termsLines.length * 15) : 0;

  const bento1H = 58;
  const bento2H = 52;
  const tableHeadH = 24;
  const tableRowsH = items.reduce((acc, it) => acc + (it.description ? 38 : 24), 0);
  const bento3H = 16 + tableHeadH + tableRowsH + 12;
  const bento4H = 62;
  const termsH = termsBoxH;
  const footerH = 28;

  const contentH = cardY + bento1H + 12 + bento2H + 12 + bento3H + 12 + bento4H + (termsLines.length > 0 ? 10 + termsH : 0) + 12 + footerH + cardY;

  const canvas = document.createElement('canvas');
  canvas.width = logicalW * scale;
  canvas.height = contentH * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, logicalW, contentH);

  // Outer Card
  const cardH = contentH - cardY * 2;
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  const logoImg = await loadLogoImage(profile.logoUrl);
  let currentY = cardY + 18;

  // Bento 1: Studio & Logo Card
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, innerW, bento1H, 14);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  if (logoImg) {
    ctx.save();
    drawRoundedRect(ctx, innerLeft + 10, currentY + 9, 40, 40, 10);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.clip();
    ctx.drawImage(logoImg, innerLeft + 10, currentY + 9, 40, 40);
    ctx.restore();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, innerLeft + 10, currentY + 9, 40, 40, 10);
    ctx.stroke();
  } else {
    ctx.save();
    drawRoundedRect(ctx, innerLeft + 10, currentY + 9, 40, 40, 10);
    ctx.fillStyle = profile.accentColor;
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold 15px ${SANS_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(profile.providerName ? profile.providerName.slice(0, 2).toUpperCase() : 'PS', innerLeft + 30, currentY + 29);
    ctx.restore();
  }

  // Quote Pill Badge - dynamically measured with comfortable padding
  const pillText = `QUOTE #${quoteNumber}`;
  ctx.font = `bold 10px ${SANS_FONT}`;
  const pillTextW = ctx.measureText(pillText).width;
  const bPillW = Math.max(88, Math.ceil(pillTextW + 16));
  const bPillH = 22;
  const bPillX = innerRight - bPillW - 8;
  const bPillY = currentY + Math.round((bento1H - bPillH) / 2);

  ctx.save();
  drawRoundedRect(ctx, bPillX, bPillY, bPillW, bPillH, 11);
  ctx.fillStyle = profile.accentColor;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 10px ${SANS_FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(pillText, bPillX + bPillW / 2, bPillY + 15);

  // Studio Name & Phone (Safely bounded before the pill)
  const bentoTitleX = innerLeft + 56;
  const maxBentoW = Math.max(80, bPillX - bentoTitleX - 10);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 14px ${SANS_FONT}`;
  ctx.fillText(fitText(ctx, profile.providerName || 'Freelance Studio', maxBentoW), bentoTitleX, currentY + 24);

  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${SANS_FONT}`;
  ctx.fillText(fitText(ctx, profile.providerPhone, maxBentoW), bentoTitleX, currentY + 41);

  currentY += bento1H + 12;

  // Bento 2: Client & Meta Bento Split (2 capsules)
  const splitW = (innerW - 10) / 2;
  
  // Left: Client capsule
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, splitW, bento2H, 14);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('CLIENT / PROJECT', innerLeft + 12, currentY + 16);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 12px ${SANS_FONT}`;
  ctx.fillText(truncate(clientName || 'Valued Client', 20), innerLeft + 12, currentY + 31);

  ctx.fillStyle = '#64748B';
  ctx.font = `10px ${SANS_FONT}`;
  ctx.fillText(truncate(projectTitle || 'Services Engagement', 24), innerLeft + 12, currentY + 44);

  // Right: Date capsule
  const rightSplitX = innerLeft + splitW + 10;
  ctx.save();
  drawRoundedRect(ctx, rightSplitX, currentY, splitW, bento2H, 14);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'right';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('DATE & STATUS', rightSplitX + splitW - 12, currentY + 16);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 12px ${MONO_FONT}`;
  ctx.fillText(issueDate, rightSplitX + splitW - 12, currentY + 31);

  ctx.fillStyle = '#10B981';
  ctx.font = `bold 10px ${SANS_FONT}`;
  ctx.fillText('● 14-Day Guarantee', rightSplitX + splitW - 12, currentY + 44);

  currentY += bento2H + 12;

  // Bento 3: Scope of Work Capsule
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, innerW, bento3H, 14);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  let b3Y = currentY + 16;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('TASK DELIVERABLE', innerLeft + 12, b3Y);

  ctx.textAlign = 'right';
  ctx.fillText('INVESTMENT', innerRight - 12, b3Y);

  b3Y += 8;
  ctx.strokeStyle = '#F1F5F9';
  ctx.beginPath();
  ctx.moveTo(innerLeft + 12, b3Y);
  ctx.lineTo(innerRight - 12, b3Y);
  ctx.stroke();
  b3Y += 12;

  items.forEach((item, idx) => {
    // Deliverable pill
    ctx.save();
    drawRoundedRect(ctx, innerLeft + 12, b3Y - 11, 24, 15, 4);
    ctx.fillStyle = `${profile.accentColor}18`;
    ctx.fill();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = profile.accentColor;
    ctx.font = `bold 9px ${MONO_FONT}`;
    ctx.fillText(`#${idx + 1}`, innerLeft + 24, b3Y);

    const priceStr = `${symbol}${Number(item.price || 0).toLocaleString()}`;
    ctx.font = `bold 12px ${SANS_FONT}`;
    const priceW = ctx.measureText(priceStr).width;
    const maxBentoItemTitleW = innerW - priceW - 60;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.fillText(fitText(ctx, item.title || 'Service Item', maxBentoItemTitleW), innerLeft + 42, b3Y);

    ctx.textAlign = 'right';
    ctx.fillText(priceStr, innerRight - 12, b3Y);

    if (item.description) {
      b3Y += 14;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = `italic 11px ${SANS_FONT}`;
      ctx.fillText(`↳ ${fitText(ctx, item.description, innerW - 56)}`, innerLeft + 42, b3Y);
    }

    b3Y += 14;
    ctx.strokeStyle = '#F8FAFC';
    ctx.beginPath();
    ctx.moveTo(innerLeft + 12, b3Y);
    ctx.lineTo(innerRight - 12, b3Y);
    ctx.stroke();
    b3Y += 8;
  });

  currentY += bento3H + 12;

  // Bento 4: Total & Bank Split Bento
  // Left: Total Due Capsule
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, splitW, bento4H, 14);
  ctx.fillStyle = profile.accentColor;
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('TOTAL DUE', innerLeft + 14, currentY + 18);

  ctx.font = `bold 20px ${SANS_FONT}`;
  ctx.fillText(`${symbol}${total.toLocaleString()}`, innerLeft + 14, currentY + 39);

  ctx.font = `9px ${SANS_FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('All deliverables included', innerLeft + 14, currentY + 52);

  // Right: Bank Capsule
  ctx.save();
  drawRoundedRect(ctx, rightSplitX, currentY, splitW, bento4H, 14);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${SANS_FONT}`;
  ctx.fillText('BANK SETTLEMENT', rightSplitX + 12, currentY + 16);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 11px ${SANS_FONT}`;
  ctx.fillText(truncate(profile.bankName, 22), rightSplitX + 12, currentY + 30);

  ctx.fillStyle = profile.accentColor;
  ctx.font = `bold 12px ${MONO_FONT}`;
  ctx.fillText(profile.accountNumber, rightSplitX + 12, currentY + 44);

  ctx.fillStyle = '#64748B';
  ctx.font = `10px ${SANS_FONT}`;
  ctx.fillText(truncate(profile.accountName, 22), rightSplitX + 12, currentY + 56);

  currentY += bento4H;

  // Terms
  if (termsLines.length > 0) {
    currentY += 10;
    ctx.save();
    drawRoundedRect(ctx, innerLeft, currentY, innerW, termsBoxH, 10);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = `11px ${SANS_FONT}`;
    termsLines.forEach((tLine, lIdx) => {
      ctx.fillText(tLine, logicalW / 2, currentY + 16 + lIdx * 15);
    });
    currentY += termsBoxH;
  }

  currentY += 14;

  // Trust footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `10px ${SANS_FONT}`;
  ctx.fillText('🛡️ Verified Freelance Quotation • Ophancer Studio', logicalW / 2, currentY + 10);

  return canvas;
};

// ========================================================
// 4. BOUTIQUE SLIP CANVAS GENERATOR
// ========================================================
export const generateClassicSlipCanvas = async ({
  profile,
  items,
  clientName,
  projectTitle,
  quoteNumber,
  issueDate,
  symbol,
  total,
  scale = 2,
  logicalW = 430
}) => {
  const cardX = 14;
  const cardY = 14;
  const cardW = logicalW - 28;
  const innerLeft = cardX + 22;
  const innerRight = cardX + cardW - 22;
  const innerW = innerRight - innerLeft;

  // Pre-calculate terms wrapped lines
  const mCanvas = document.createElement('canvas');
  const mCtx = mCanvas.getContext('2d');
  mCtx.font = `italic 10px ${SANS_FONT}`;
  const termsRaw = profile.termsText ? `Note: ${profile.termsText}` : '';
  const termsLines = termsRaw ? wrapText(mCtx, termsRaw, innerW - 16) : [];
  const termsBoxH = termsLines.length > 0 ? Math.max(22, 8 + termsLines.length * 13) : 0;

  const toothW = 12;
  const toothH = 7;
  const headerH = 68;
  const clientH = 40;
  const tableHeadH = 20;
  const tableRowsH = items.reduce((acc, it) => acc + (it.description ? 36 : 22), 0);
  const totalH = 50;
  const bankH = 48;
  const termsH = termsBoxH;
  const footerH = 34;

  const contentH = cardY + toothH + headerH + 12 + clientH + 12 + tableHeadH + tableRowsH + 12 + totalH + 12 + bankH + (termsLines.length > 0 ? 10 + termsH : 0) + 12 + footerH + toothH + cardY;

  const canvas = document.createElement('canvas');
  canvas.width = logicalW * scale;
  canvas.height = contentH * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(0, 0, logicalW, contentH);

  // Receipt Body Container with Serrated Teeth
  const slipTop = cardY + toothH;
  const slipBottom = contentH - cardY - toothH;
  const slipH = slipBottom - slipTop;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cardX, slipTop, cardW, slipH);

  // Top Serrated Teeth
  ctx.fillStyle = '#FFFFFF';
  drawZigzag(ctx, cardX, slipTop, cardW, toothW, toothH, true);
  ctx.fill();

  // Bottom Serrated Teeth
  drawZigzag(ctx, cardX, slipBottom, cardW, toothW, toothH, false);
  ctx.fill();
  let currentY = slipTop + 14;

  // Header: Centered Boutique Layout
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 16px ${SANS_FONT}`;
  ctx.fillText(fitText(ctx, (profile.providerName || 'FREELANCE STUDIO').toUpperCase(), innerW - 10), logicalW / 2, currentY);

  currentY += 16;
  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${SANS_FONT}`;
  const slipSub = `${profile.providerPhone}  •  ${profile.providerEmail}`;
  ctx.fillText(fitText(ctx, slipSub, innerW - 10), logicalW / 2, currentY);

  currentY += 16;
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 10px ${MONO_FONT}`;
  ctx.fillText(`RECEIPT #${quoteNumber}  •  ${issueDate}`, logicalW / 2, currentY);

  currentY += 12;

  // Dashed Perforation Line
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  currentY += 14;

  // Client row
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${MONO_FONT}`;
  ctx.fillText('CUSTOMER:', innerLeft, currentY);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 12px ${SANS_FONT}`;
  ctx.fillText(truncate(clientName || 'Valued Client', 26), innerLeft + 65, currentY);

  currentY += 15;
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${MONO_FONT}`;
  ctx.fillText('PROJECT:', innerLeft, currentY);

  ctx.fillStyle = '#475569';
  ctx.font = `11px ${SANS_FONT}`;
  ctx.fillText(truncate(projectTitle || 'Services Engagement', 32), innerLeft + 65, currentY);

  currentY += 12;

  // Dashed Perforation Line
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  currentY += 14;

  // Deliverables Table
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${MONO_FONT}`;
  ctx.fillText('ITEM • DESCRIPTION', innerLeft, currentY);

  ctx.textAlign = 'right';
  ctx.fillText('AMT', innerRight, currentY);

  currentY += 8;
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();

  currentY += 14;

  items.forEach((item, idx) => {
    const priceStr = `${symbol}${Number(item.price || 0).toLocaleString()}`;
    ctx.font = `bold 12px ${MONO_FONT}`;
    const priceW = ctx.measureText(priceStr).width;
    const maxSlipItemTitleW = innerW - priceW - 32;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = `bold 12px ${SANS_FONT}`;
    ctx.fillText(`${String(idx + 1).padStart(2, '0')}  ${fitText(ctx, item.title || 'Service Item', maxSlipItemTitleW)}`, innerLeft, currentY);

    ctx.textAlign = 'right';
    ctx.font = `bold 12px ${MONO_FONT}`;
    ctx.fillText(priceStr, innerRight, currentY);

    if (item.description) {
      currentY += 14;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = `italic 11px ${SANS_FONT}`;
      ctx.fillText(`    ↳ ${fitText(ctx, item.description, innerW - 20)}`, innerLeft, currentY);
    }

    currentY += 16;
  });

  // Dashed Perforation Line
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  currentY += 14;

  // Subtotal & Total
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = `11px ${MONO_FONT}`;
  ctx.fillText('SUBTOTAL:', innerLeft, currentY);

  ctx.textAlign = 'right';
  ctx.fillText(`${symbol}${total.toLocaleString()}`, innerRight, currentY);

  currentY += 14;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `10px ${MONO_FONT}`;
  ctx.fillText('TAX / VAT (0.0%):', innerLeft, currentY);

  ctx.textAlign = 'right';
  ctx.fillText(`${symbol}0.00`, innerRight, currentY);

  currentY += 10;

  // Double Line before TOTAL
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();

  currentY += 18;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 14px ${MONO_FONT}`;
  ctx.fillText('TOTAL DUE:', innerLeft, currentY);

  ctx.textAlign = 'right';
  ctx.fillStyle = profile.accentColor;
  ctx.font = `bold 22px ${SANS_FONT}`;
  ctx.fillText(`${symbol}${total.toLocaleString()}`, innerRight, currentY);

  currentY += 8;
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();

  currentY += 14;

  // Bank Box
  ctx.save();
  drawRoundedRect(ctx, innerLeft, currentY, innerRight - innerLeft, bankH, 8);
  ctx.fillStyle = '#F8FAFC';
  ctx.fill();
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94A3B8';
  ctx.font = `bold 9px ${MONO_FONT}`;
  ctx.fillText('TRANSFER SETTLEMENT:', innerLeft + 10, currentY + 15);

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 11px ${SANS_FONT}`;
  ctx.fillText(`${profile.bankName}  •  Acct: `, innerLeft + 10, currentY + 30);

  const bkW = ctx.measureText(`${profile.bankName}  •  Acct: `).width;
  ctx.fillStyle = profile.accentColor;
  ctx.font = `bold 11px ${MONO_FONT}`;
  ctx.fillText(profile.accountNumber, innerLeft + 10 + bkW, currentY + 30);

  ctx.fillStyle = '#64748B';
  ctx.font = `10px ${SANS_FONT}`;
  ctx.fillText(`Name: ${profile.accountName}`, innerLeft + 10, currentY + 42);

  currentY += bankH;

  // Terms
  if (termsLines.length > 0) {
    currentY += 8;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748B';
    ctx.font = `italic 10px ${SANS_FONT}`;
    termsLines.forEach((tLine, lIdx) => {
      ctx.fillText(tLine, logicalW / 2, currentY + 11 + lIdx * 13);
    });
    currentY += termsBoxH;
  }

  currentY += 8;
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.moveTo(innerLeft, currentY);
  ctx.lineTo(innerRight, currentY);
  ctx.stroke();
  ctx.setLineDash([]);

  currentY += 16;

  // Bottom Message
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 11px ${MONO_FONT}`;
  ctx.fillText('★ THANK YOU FOR YOUR PATRONAGE ★', logicalW / 2, currentY);

  currentY += 13;
  ctx.fillStyle = '#94A3B8';
  ctx.font = `9px ${MONO_FONT}`;
  ctx.fillText('OFFICIAL RECEIPT SLIP • OPHANCER', logicalW / 2, currentY);

  return canvas;
};

// ========================================================
// DISPATCHER FUNCTION
// ========================================================
export const generateQuotationCanvas = async (templateId, payload) => {
  switch (templateId) {
    case 'corporate':
      return generateCorporateCanvas(payload);
    case 'minimalist':
      return generateMinimalistCanvas(payload);
    case 'bento':
      return generateBentoCanvas(payload);
    case 'classic-slip':
    default:
      return generateClassicSlipCanvas(payload);
  }
};
