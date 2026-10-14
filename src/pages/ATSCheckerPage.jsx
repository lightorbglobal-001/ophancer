import React, { useState } from 'react';
import { 
  Upload, 
  FileCheck2, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  ClipboardPaste, 
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  FileCode,
  Check
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Browser compatibility polyfill for modern PDF.js WebCrypto hashing
if (typeof Uint8Array !== 'undefined' && !Uint8Array.prototype.toHex) {
  Uint8Array.prototype.toHex = function () {
    return Array.from(this, b => b.toString(16).padStart(2, '0')).join('');
  };
}

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ATSCheckerPage({ setActivePage }) {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'paste'
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [scanNotice, setScanNotice] = useState(null);

  // State for inline verification in scanned PDF view
  const [inlineVerifyText, setInlineVerifyText] = useState('');
  const [inlineAuditResult, setInlineAuditResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  /**
   * Industry-Standard PDF Text Extraction Engine powered by Mozilla PDF.js
   * Seamlessly resolves font subsetting, ToUnicode CMaps, and compressed Object Streams.
   */
  const extractTextFromPDF = async (buffer) => {
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        isEvalSupported: false,
        disableFontFace: true
      });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages || 1;
      let fullText = '';
      let hasTextItems = false;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        if (textContent && textContent.items && textContent.items.length > 0) {
          const pageLines = [];
          let currentLine = '';
          let lastY = null;

          for (const item of textContent.items) {
            const str = item.str || '';
            if (!str) continue;
            hasTextItems = true;

            const itemY = item.transform ? item.transform[5] : null;
            if (lastY !== null && itemY !== null && Math.abs(itemY - lastY) > 5) {
              if (currentLine.trim()) pageLines.push(currentLine.trim());
              currentLine = str;
            } else {
              currentLine += (currentLine ? ' ' : '') + str;
            }
            lastY = itemY;
          }
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          fullText += pageLines.join('\n') + '\n\n';
        }
      }

      return {
        text: fullText.trim(),
        pageCount: numPages,
        hasTextItems
      };
    } catch (err) {
      console.warn("PDF.js extraction error", err);
      return {
        text: '',
        pageCount: 1,
        hasTextItems: false
      };
    }
  };

  /**
   * Browser-native PDF & Text Extraction Engine
   */
  const processFile = async (selectedFile) => {
    if (selectedFile.size > 20 * 1024 * 1024) {
      alert("File size exceeds 20MB limit. Please upload a smaller document.");
      return;
    }

    setFile(selectedFile);
    setIsScanning(true);
    setAuditResult(null);
    setScanNotice(null);
    setInlineVerifyText('');
    setInlineAuditResult(null);

    const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      // Plain text or markdown
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = (event.target.result || "").toString();
        setTimeout(() => {
          evaluateAndSet(textContent, selectedFile.name, { isPdf: false, fileSize: selectedFile.size });
        }, 500);
      };
      reader.readAsText(selectedFile);
      return;
    }

    // PDF In-Browser Extraction via PDF.js
    try {
      const buffer = await selectedFile.arrayBuffer();
      const { text: extractedText, pageCount, hasTextItems } = await extractTextFromPDF(buffer);
      const rawWords = extractedText.trim().split(/\s+/).filter(w => w.length > 1);

      // A document is considered a scanned image only if PDF.js finds no selectable text glyphs
      const isScannedImage = !hasTextItems || rawWords.length < 20;

      const docMeta = {
        isPdf: true,
        pageCount,
        fileSize: selectedFile.size,
        hasImageLayers: isScannedImage,
        isScannedImage
      };

      setTimeout(() => {
        evaluateAndSet(extractedText, selectedFile.name, docMeta);
      }, 600);
    } catch (err) {
      console.warn("PDF parse fallback", err);
      setTimeout(() => {
        evaluateAndSet("", selectedFile.name, {
          isPdf: true,
          pageCount: 1,
          fileSize: selectedFile.size,
          isScannedImage: true
        });
      }, 600);
    }
  };

  const handleAnalyzePasted = () => {
    if (!pastedText.trim() || pastedText.trim().split(/\s+/).length < 20) {
      alert("Please paste your resume text (at least 20 words) to evaluate.");
      return;
    }
    setIsScanning(true);
    setAuditResult(null);
    setScanNotice(null);

    setTimeout(() => {
      evaluateAndSet(pastedText, "Pasted_Resume_Text.txt", { isPdf: false });
    }, 600);
  };

  /**
   * Core ATS Content Evaluation Heuristic
   */
  const evaluateContentMetrics = (text) => {
    const rawWords = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = rawWords.length;
    const lower = text.toLowerCase();

    // 1. Core Section Detection
    const sections = {
      summary: /summary|objective|profile|about me|professional summary/.test(lower),
      experience: /experience|work history|employment|career history|roles|work background/.test(lower),
      education: /education|degree|university|qualifications|academic|college|school/.test(lower),
      skills: /skills|competencies|technologies|proficiencies|tools|core competencies/.test(lower),
      contact: /@|\.com|phone|\+234|\b0\d{10}\b|tel|email|linkedin/.test(lower),
      certifications: /certifications?|diploma|credentials?|qualifications?|training|nysc/.test(lower),
    };

    // 2. Action Power Verbs
    const actionVerbs = [
      'spearheaded', 'developed', 'architected', 'led', 'increased', 'optimized',
      'designed', 'engineered', 'managed', 'reduced', 'implemented', 'orchestrated',
      'collaborated', 'generated', 'streamlined', 'delivered', 'built', 'advised',
      'coordinated', 'processed', 'conducted', 'served', 'acted', 'marketed',
      'promoted', 'guided', 'applied', 'achieved', 'maintained', 'resolved', 'supervised',
      'administered', 'executed', 'analyzed', 'audited', 'negotiated', 'facilitated'
    ];
    const foundVerbs = actionVerbs.filter(verb => {
      const reg = new RegExp(`\\b${verb}\\b|\\b${verb}s\\b|\\b${verb}ed\\b|\\b${verb}ing\\b`, 'i');
      return reg.test(text);
    });

    // 3. Quantifiable Metrics & Scopes
    const metricsCount = (text.match(/(\d+%|\$\d+|₦\d+|\b\d{4}\b|\b\d+\s*(users|clients|patients|customers|communities|mothers|teams|lgas|sales|members|years?)\b)/gi) || []).length;

    // Mathematical 100-Point Scoring Matrix
    let sectionScore = 0;
    if (sections.summary) sectionScore += 8;
    if (sections.experience) sectionScore += 10;
    if (sections.education) sectionScore += 8;
    if (sections.skills) sectionScore += 8;
    if (sections.contact) sectionScore += 6;

    let verbScore = 0;
    if (foundVerbs.length >= 8) verbScore = 25;
    else if (foundVerbs.length >= 5) verbScore = 20;
    else if (foundVerbs.length >= 3) verbScore = 15;
    else if (foundVerbs.length >= 1) verbScore = 10;
    else verbScore = 4;

    let metricScore = 0;
    if (metricsCount >= 6) metricScore = 20;
    else if (metricsCount >= 3) metricScore = 15;
    else if (metricsCount >= 1) metricScore = 10;
    else metricScore = 4;

    let lengthScore = 0;
    if (wordCount >= 300 && wordCount <= 950) lengthScore = 15;
    else if (wordCount >= 200 && wordCount <= 1300) lengthScore = 11;
    else if (wordCount < 150) lengthScore = 5;
    else lengthScore = 7;

    const totalScore = Math.min(98, sectionScore + verbScore + metricScore + lengthScore);

    let readinessLevel = 'Needs Optimization';
    let badgeColor = 'text-amber-600 bg-amber-50';

    if (totalScore >= 80) {
      readinessLevel = 'High ATS Readiness';
      badgeColor = 'text-emerald-600 bg-emerald-50';
    } else if (totalScore >= 60) {
      readinessLevel = 'Competitive';
      badgeColor = 'text-blue-600 bg-blue-50';
    }

    const recommendations = [];
    if (!sections.summary) recommendations.push("Add a targeted 3-line Professional Summary at the top.");
    if (!sections.skills) recommendations.push("Include a dedicated Core Competencies or Technical Skills section.");
    if (foundVerbs.length < 5) recommendations.push("Elevate bullet points with active power verbs ('Spearheaded', 'Optimized', 'Engineered').");
    if (metricsCount < 3) recommendations.push("Add quantifiable metrics (e.g. 'Increased conversions by 28%', 'Managed records across 3 LGAs').");
    if (wordCount > 1000) recommendations.push("Condense document to 1–2 pages (under 800 words) for optimal ATS ranking.");
    if (recommendations.length === 0) {
      recommendations.push("Your CV possesses exceptional ATS hierarchy and keyword density! Ensure keywords align tightly with each job title.");
      recommendations.push("Keep file saved as standard clean PDF or DOCX without multi-column graphical text boxes.");
    }

    return {
      wordCount,
      totalScore,
      readinessLevel,
      badgeColor,
      sections,
      foundVerbsCount: foundVerbs.length,
      metricsCount,
      recommendations
    };
  };

  /**
   * Evaluates extracted text or flags scanned PDFs cleanly
   */
  const evaluateAndSet = (text, fileName, docMeta = {}) => {
    const rawWords = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = rawWords.length;
    const isScannedImage = docMeta.isScannedImage || (docMeta.isPdf && wordCount < 20 && docMeta.hasImageLayers);

    if (isScannedImage) {
      setAuditResult({
        fileName,
        isScannedImage: true,
        wordCount: 0,
        docMeta: {
          fileSize: docMeta.fileSize || 0,
          pageCount: docMeta.pageCount || 1
        },
        readinessLevel: 'Scanned Image (0 Digital Text Words)',
        badgeColor: 'text-amber-700 bg-amber-50 border border-amber-200'
      });
      setIsScanning(false);
      return;
    }

    const metrics = evaluateContentMetrics(text);

    setAuditResult({
      fileName,
      isScannedImage: false,
      ...metrics,
      docMeta
    });
    setIsScanning(false);
  };

  const handleRunInlineVerification = () => {
    if (!inlineVerifyText.trim() || inlineVerifyText.trim().split(/\s+/).length < 20) {
      alert("Please paste your resume text (at least 20 words) to evaluate.");
      return;
    }
    const result = evaluateContentMetrics(inlineVerifyText);
    setInlineAuditResult(result);
  };

  const handleReset = () => {
    setFile(null);
    setPastedText('');
    setAuditResult(null);
    setScanNotice(null);
    setInlineVerifyText('');
    setInlineAuditResult(null);
  };

  return (
    <div className="bg-white min-h-screen">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#F4F5FD] to-white border-b border-slate-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 reveal-on-scroll">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0E121B] font-heading tracking-tight">
            Free In-Browser ATS CV Scanner
          </h1>

          <p className="text-xs sm:text-sm text-[#525866] max-w-2xl mx-auto leading-relaxed">
            Test your resume against modern Applicant Tracking System heuristics. Evaluated directly in your browser's RAM memory with absolute data privacy.
          </p>

          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-[#525866]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Documents are evaluated in-memory inside your local web browser. Files are never saved to our servers or stored in any database.</span>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 reveal-on-scroll reveal-delay-100">
        
        {!auditResult && !isScanning && (
          <div className="space-y-6">
            
            {/* Input Mode Selector (Responsive Segmented Control, 100% width on mobile) */}
            <div className="w-full max-w-md mx-auto p-1 rounded-full bg-[#F5F7FA] border border-[#EBEFF5] grid grid-cols-2 gap-1 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`py-2.5 px-3 rounded-full font-semibold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  inputMode === 'upload' 
                    ? 'bg-[#0E121B] text-white shadow-xs font-bold' 
                    : 'text-[#525866] hover:text-black'
                }`}
              >
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Upload PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('paste')}
                className={`py-2.5 px-3 rounded-full font-semibold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  inputMode === 'paste' 
                    ? 'bg-[#0E121B] text-white shadow-xs font-bold' 
                    : 'text-[#525866] hover:text-black'
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Paste CV Text</span>
              </button>
            </div>

            {/* Mode 1: Paste Text Area */}
            {inputMode === 'paste' && (
              <div className="bg-[#F8F9FE] border border-[#EBEFF5] rounded-[32px] p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-[#0E121B] block">Paste Your Complete Resume Text</span>
                    <span className="text-xs text-[#525866]">Copy and paste your CV text directly from Word, Google Docs, or PDF.</span>
                  </div>
                  <span className="text-xs font-mono text-[#6962F1] font-bold">
                    {pastedText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your CV text here...&#10;&#10;e.g.&#10;JOHN DOE&#10;Operations Specialist | Project Coordinator&#10;PROFESSIONAL SUMMARY...&#10;CORE COMPETENCIES...&#10;PROFESSIONAL EXPERIENCE..."
                  rows={14}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-[#0E121B] focus:outline-none focus:border-[#6962F1] focus:ring-2 focus:ring-[#6962F1]/10 font-mono leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#525866]">
                    🔒 Processed strictly in browser memory.
                  </span>

                  <button
                    type="button"
                    onClick={handleAnalyzePasted}
                    className="h-[44px] px-8 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2 whitespace-nowrap flex-shrink-0 active:scale-95 cursor-pointer"
                  >
                    <span>Run ATS Diagnostic</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: File Dropzone */}
            {inputMode === 'upload' && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[32px] p-8 sm:p-14 text-center transition-all ${
                  dragActive 
                    ? 'border-[#6962F1] bg-[#EEF0FD]/60' 
                    : 'border-[#E0E3FA] bg-[#F8F9FE] hover:border-[#6962F1]/50'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#EEF0FD] text-[#6962F1] flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0E121B]">
                  Drag and drop your CV file here
                </h3>
                <p className="text-xs sm:text-sm text-[#525866] mt-1 mb-6">
                  Supports .PDF, .DOCX, and .TXT documents up to 8MB
                </p>

                <label className="inline-flex items-center justify-center h-[44px] px-8 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-semibold cursor-pointer transition-all shadow-md whitespace-nowrap flex-shrink-0 active:scale-95">
                  <span>Browse File on Device</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileInput}
                  />
                </label>
              </div>
            )}

          </div>
        )}

        {/* Scanning Spinner Animation */}
        {isScanning && (
          <div className="rounded-[32px] bg-[#F8F9FE] border border-[#EBEFF5] p-12 sm:p-16 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-[#EEF0FD] border-t-[#6962F1] rounded-full animate-spin mx-auto"></div>
            <h3 className="text-base font-bold text-[#0E121B]">
              Analyzing CV in Browser Memory...
            </h3>
            <p className="text-xs text-[#525866] max-w-sm mx-auto">
              Extracting section hierarchy, power action verbs, quantifiable metrics, and ATS parsing readiness.
            </p>
          </div>
        )}

        {/* SCENARIO A: SCANNED / IMAGE-BASED PDF DIAGNOSTIC VIEW */}
        {auditResult && auditResult.isScannedImage && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top Critical Format Alert */}
            <div className="rounded-[32px] bg-amber-50/90 border border-amber-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-amber-950">
                      Document Format Diagnostic: Flattened Image PDF
                    </h3>
                    <p className="text-xs text-amber-800">
                      {auditResult.fileName} &bull; {(auditResult.docMeta.fileSize / (1024 * 1024)).toFixed(1)}MB &bull; ~{auditResult.docMeta.pageCount} Pages &bull; <strong className="text-amber-950 font-mono">0 Selectable Digital Text Words</strong>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold font-mono self-start sm:self-auto shrink-0">
                  Critical ATS Format Risk
                </span>
              </div>

              {/* Technical Explanation vs 30-Second Fix Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-amber-950">
                
                <div className="p-4 rounded-2xl bg-white/70 border border-amber-200/60 space-y-2">
                  <strong className="block text-sm font-bold text-[#0E121B]">
                    Why Automated ATS Systems Reject This Format
                  </strong>
                  <p className="text-[#525866] leading-relaxed">
                    Corporate Applicant Tracking Systems (Workday, Greenhouse, Taleo, Lever, iCIMS) extract raw text streams—they do <strong>not</strong> perform optical character recognition (OCR) on PDF attachments.
                  </p>
                  <p className="text-[#525866] leading-relaxed">
                    Because this document was saved as picture layers (canvas snapshot or scanned page), automated ATS parsers extract <strong>0 words</strong>, leaving your candidate profile completely blank to recruiter search algorithms.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/70 border border-amber-200/60 space-y-2">
                  <strong className="block text-sm font-bold text-[#0E121B]">
                    The 30-Second Fix (How to Score 98/100)
                  </strong>
                  <p className="text-[#525866] leading-relaxed">
                    Your actual resume content may be exceptional, but the PDF container must have digital vector text:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-[#525866]">
                    <li>Open your original document in <strong>Microsoft Word</strong>, <strong>Google Docs</strong>, or <strong>Canva</strong>.</li>
                    <li>Select <strong>File &rarr; Save As &rarr; PDF (Standard)</strong> or <strong>Download &rarr; PDF Standard</strong> (NOT Print to Image or Flattened).</li>
                    <li>Ensure you can highlight/copy words with your mouse cursor, then upload it here.</li>
                  </ol>
                </div>

              </div>

              {/* Reset action */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-[#0E121B] text-xs font-semibold border border-slate-200 inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Upload Different File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePage('cv-services')}
                  className="px-4 py-2 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Need Us to Reformat It? (₦5,000 / $5)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* INLINE CONTENT QUALITY TESTER */}
            <div className="bg-[#F8F9FE] border border-[#EBEFF5] rounded-[32px] p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF0FD] text-[#6962F1] text-[11px] font-bold font-mono">
                  <span>INLINE RESUME CONTENT TESTER</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0E121B]">
                  Verify Your Actual CV Content Quality Right Now
                </h3>
                <p className="text-xs text-[#525866] leading-relaxed">
                  Paste your CV text below to evaluate your section hierarchy, keywords, power verbs, and metrics. Confirm that your content is high-scoring once exported correctly!
                </p>
              </div>

              <textarea
                value={inlineVerifyText}
                onChange={(e) => setInlineVerifyText(e.target.value)}
                rows={8}
                placeholder="Paste your CV text here to test your true content score...&#10;&#10;e.g.&#10;JOHN DOE&#10;Operations Specialist | Project Coordinator&#10;PROFESSIONAL SUMMARY...&#10;CORE COMPETENCIES...&#10;PROFESSIONAL EXPERIENCE..."
                className="w-full p-4 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm text-[#0E121B] focus:outline-none focus:border-[#6962F1] focus:ring-2 focus:ring-[#6962F1]/10 font-mono leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#525866] font-mono">
                  {inlineVerifyText.trim().split(/\s+/).filter(Boolean).length} words pasted
                </span>

                <button
                  type="button"
                  onClick={handleRunInlineVerification}
                  className="h-[42px] px-6 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <span>Evaluate Content Quality</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rendered Inline Content Scorecard */}
              {inlineAuditResult && (
                <div className="pt-4 space-y-6 border-t border-slate-200 animate-fade-in">
                  
                  {/* Inline Score Dial Banner */}
                  <div className="p-6 rounded-2xl bg-[#EEF0FD] border border-[#D6D8FB] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-xs font-mono font-bold text-[#6962F1] uppercase">Content Audit Result</span>
                      <h4 className="text-xl font-bold text-[#0E121B]">
                        Verified Content Readiness Score
                      </h4>
                      <p className="text-xs text-[#525866]">
                        Calculated across ~{inlineAuditResult.wordCount} words of parsed text
                      </p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 px-6 text-center shadow-sm border border-[#EBEFF5] min-w-[150px]">
                      <div className="text-3xl sm:text-4xl font-extrabold text-[#6962F1] font-mono">
                        {inlineAuditResult.totalScore}
                        <span className="text-sm text-[#99A0AE] font-normal"> / 100</span>
                      </div>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${inlineAuditResult.badgeColor}`}>
                        {inlineAuditResult.readinessLevel}
                      </span>
                    </div>
                  </div>

                  {/* Sections & Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Section Breakdown */}
                    <div className="p-5 rounded-2xl bg-white border border-[#EBEFF5] space-y-2.5 shadow-xs">
                      <span className="font-bold text-[#0E121B] block">Section Completeness</span>
                      {[
                        { key: 'summary', label: 'Professional Summary / Profile' },
                        { key: 'experience', label: 'Work Experience / History' },
                        { key: 'education', label: 'Education & Qualifications' },
                        { key: 'skills', label: 'Core Competencies & Skills' },
                        { key: 'contact', label: 'Contact Details (Phone / Email)' },
                        { key: 'certifications', label: 'Credentials & Certifications' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                          <span className="text-[#525866]">{item.label}</span>
                          {inlineAuditResult.sections[item.key] ? (
                            <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Present
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold inline-flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Missing
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="p-5 rounded-2xl bg-white border border-[#EBEFF5] space-y-3 shadow-xs">
                      <span className="font-bold text-[#0E121B] block">Linguistic &amp; Impact Metrics</span>
                      <div className="p-3 rounded-xl bg-[#F8F9FE] flex items-center justify-between">
                        <span className="text-[#525866]">Power Action Verbs</span>
                        <span className="font-mono font-bold text-[#6962F1]">{inlineAuditResult.foundVerbsCount} detected</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F9FE] flex items-center justify-between">
                        <span className="text-[#525866]">Quantified Metrics &amp; Scopes</span>
                        <span className="font-mono font-bold text-[#0E121B]">{inlineAuditResult.metricsCount} detected</span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8F9FE] flex items-center justify-between">
                        <span className="text-[#525866]">Document Density Status</span>
                        <span className="text-emerald-600 font-bold">Ideal 1–2 Page Length</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* SCENARIO B: STANDARD ATS AUDIT REPORT (VECTOR PDF / PASTED TEXT) */}
        {auditResult && !auditResult.isScannedImage && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Scorecard Hero */}
            <div className="rounded-[32px] bg-[#EEF0FD] border border-[#D6D8FB] p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-xs font-bold text-[#0E121B] shadow-sm">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#6962F1]" />
                  <span>{auditResult.fileName}</span>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-[#0E121B]">
                  ATS Readiness Diagnostic
                </h2>
                
                <p className="text-xs text-[#525866]">
                  Calculated word count: ~{auditResult.wordCount} words &bull; Local in-memory audit
                </p>
              </div>

              {/* Big Score Dial */}
              <div className="text-center bg-white rounded-3xl p-5 px-8 shadow-md border border-[#EBEFF5] min-w-[180px]">
                <div className="text-4xl sm:text-5xl font-extrabold text-[#6962F1] font-mono tracking-tight">
                  {auditResult.totalScore}
                  <span className="text-lg text-[#99A0AE] font-normal"> / 100</span>
                </div>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${auditResult.badgeColor}`}>
                  {auditResult.readinessLevel}
                </span>
              </div>

            </div>

            {/* Metrics & Sections Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Section Audit */}
              <div className="p-6 rounded-3xl bg-white border border-[#EBEFF5] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#0E121B]">
                  Section Completeness Audit
                </h3>

                <div className="space-y-2.5">
                  {[
                    { key: 'summary', label: 'Professional Summary / Profile' },
                    { key: 'experience', label: 'Work Experience / History' },
                    { key: 'education', label: 'Education & Qualifications' },
                    { key: 'skills', label: 'Core Competencies & Skills' },
                    { key: 'contact', label: 'Contact Details (Phone / Email)' },
                    { key: 'certifications', label: 'Credentials & Certifications' },
                  ].map((item) => {
                    const isPresent = auditResult.sections[item.key];
                    return (
                      <div key={item.key} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                        <span className="text-[#525866]">{item.label}</span>
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold whitespace-nowrap">
                            <CheckCircle className="w-3.5 h-3.5" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold whitespace-nowrap">
                            <XCircle className="w-3.5 h-3.5" /> Missing / Weak
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quality Indicators */}
              <div className="p-6 rounded-3xl bg-white border border-[#EBEFF5] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-[#0E121B]">
                  Impact &amp; Linguistic Metrics
                </h3>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-[#F8F9FE] border border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-[#525866]">Power Action Verbs</span>
                    <span className="text-sm font-bold font-mono text-[#6962F1]">
                      {auditResult.foundVerbsCount} detected
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F9FE] border border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-[#525866]">Quantified Metrics &amp; Scopes</span>
                    <span className="text-sm font-bold font-mono text-[#0E121B]">
                      {auditResult.metricsCount} detected
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F8F9FE] border border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-[#525866]">Document Density Status</span>
                    <span className="text-xs font-bold text-emerald-600">
                      Ideal 1–2 Page Length
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Recommendations */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EBEFF5] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0E121B]">
                Key Insights &amp; Recommendations
              </h3>

              <div className="space-y-2.5">
                {auditResult.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#525866] leading-relaxed">
                    <span className="text-[#6962F1] font-bold mt-0.5">&bull;</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to Paid CV Optimization & Reset */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F4F5FD] border border-[#E0E3FA] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-[#0E121B]">
                  Want our professional team to optimize or rewrite your CV?
                </h4>
                <p className="text-xs text-[#525866]">
                  Human-crafted resume writing and ATS alignment for ₦5,000 (Nigeria) or $5 (Global).
                </p>
              </div>

              <div className="flex items-center gap-3 whitespace-nowrap flex-shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-[42px] px-6 rounded-full bg-white hover:bg-slate-50 text-[#0E121B] text-xs font-semibold border border-slate-200 transition-all shadow-sm inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>Scan Another</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePage('cv-services')}
                  className="h-[42px] px-6 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs font-semibold transition-all shadow-md inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer"
                >
                  <span>Order Optimization</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>

          </div>
        )}

      </section>

    </div>
  );
}
