import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Target,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
  User,
  Send,
  HelpCircle,
  X,
  AlertCircle
} from 'lucide-react';
import CustomSelect from '../components/common/CustomSelect';

const EXACT_YEAR_OPTIONS = [
  '0 Years (Fresher)',
  '1 Year',
  '2 Years',
  '3 Years',
  '4 Years',
  '5 Years',
  '7+ Years',
  '10+ Years'
];

const POPULAR_ROLES = [
  'Virtual Assistant',
  'Customer Support Specialist',
  'Registered Nurse / Healthcare',
  'Administrative Officer',
  'Project Manager',
  'Accountant / Finance',
  'Digital Marketer / SEO',
  'Sales Representative',
  'Data Analyst',
  'Operations Supervisor'
];

const POPULAR_SKILLS = [
  'Microsoft Excel & Office',
  'Customer Service',
  'Team Leadership',
  'Time Management',
  'Data Entry & Reporting',
  'Problem Solving',
  'Canva / Presentation Design',
  'Project Coordination',
  'Sales & Negotiation',
  'Conflict Resolution',
  'Social Media Management',
  'Email Correspondence'
];

const POPULAR_DEGREES = [
  'B.Sc (Bachelor of Science)',
  'HND (Higher National Diploma)',
  'OND (Ordinary National Diploma)',
  'B.A (Bachelor of Arts)',
  'M.Sc / MBA (Master)',
  'SSCE / High School Diploma',
  'Professional Certification / Diploma'
];

export default function CVServicesPage({ settings }) {
  // Mode: 'have_cv' (Revamp) or 'no_cv' (From Scratch)
  const [activeTab, setActiveTab] = useState('have_cv');
  const [currency, setCurrency] = useState('NGN');
  const [packageTier, setPackageTier] = useState('single'); // 'single' or 'double'

  // Step wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Shared / Contact Details
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');

  // Path A: Have CV Specifics
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (2-5 yrs)');
  const [existingNotes, setExistingNotes] = useState('');

  // Path B: No CV Specifics
  const [degreeType, setDegreeType] = useState('B.Sc (Bachelor of Science)');
  const [courseOfStudy, setCourseOfStudy] = useState('');
  const [institution, setInstitution] = useState('');
  const [gradYear, setGradYear] = useState('2023');

  // Work History Array (Allows multiple roles)
  const [workEntries, setWorkEntries] = useState([
    {
      id: 1,
      company: '',
      role: '',
      duration: '',
      responsibilities: ''
    }
  ]);
  const [isEntryLevel, setIsEntryLevel] = useState(false);

  // Skills Array
  const [selectedSkills, setSelectedSkills] = useState([
    'Microsoft Excel & Office',
    'Customer Service',
    'Team Leadership'
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Certifications & Extra Notes
  const [certifications, setCertifications] = useState('');
  const [careerAmbition, setCareerAmbition] = useState('');

  const [copiedBank, setCopiedBank] = useState(false);

  // Total steps for each path
  const totalStepsHaveCv = 4;
  const totalStepsNoCv = 7;
  const currentTotalSteps = activeTab === 'have_cv' ? totalStepsHaveCv : totalStepsNoCv;

  const pricing = settings?.cv_pricing || {
    ngn_single: 5000,
    ngn_double: 8000,
    usd_single: 5,
    usd_double: 8
  };

  const currentPriceDisplay = currency === 'NGN' 
    ? (packageTier === 'single' ? `₦${pricing.ngn_single.toLocaleString()}` : `₦${pricing.ngn_double.toLocaleString()}`)
    : (packageTier === 'single' ? `$${pricing.usd_single}` : `$${pricing.usd_double}`);

  const copyBankDetails = () => {
    const details = `${settings?.bank_details?.bank_name || 'Kuda Bank / GTBank'}\nAccount: ${settings?.bank_details?.account_number || '0123456789'}\nName: ${settings?.bank_details?.account_name || 'Ophancer Services'}`;
    navigator.clipboard.writeText(details);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e?.preventDefault();
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleAddWorkEntry = () => {
    setWorkEntries([
      ...workEntries,
      {
        id: Date.now(),
        company: '',
        role: '',
        duration: '',
        responsibilities: ''
      }
    ]);
  };

  const handleRemoveWorkEntry = (id) => {
    if (workEntries.length <= 1) return;
    setWorkEntries(workEntries.filter(w => w.id !== id));
  };

  const handleUpdateWorkEntry = (id, field, value) => {
    setWorkEntries(workEntries.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  // Validation helper functions
  const isValidName = (name) => {
    const trimmed = name.trim();
    return trimmed.length >= 2 && /^[a-zA-Z\s'-]+$/.test(trimmed);
  };

  const isValidPhone = (p) => {
    const trimmed = p.trim();
    if (!trimmed) return false;
    if (!/^[\d\+\-\(\)\s]+$/.test(trimmed)) return false;
    const digits = trimmed.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  };

  const isValidEmail = (e) => {
    const trimmed = e.trim();
    if (!trimmed) return true; // Optional, but if provided must be a valid email
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
  };

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Parse multi-role comma inputs dynamically
  const parsedTargetRoles = useMemo(() => {
    return targetRole
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);
  }, [targetRole]);

  const handleToggleRoleChip = (roleToToggle) => {
    const exists = parsedTargetRoles.some(r => r.toLowerCase() === roleToToggle.toLowerCase());
    if (exists) {
      const updated = parsedTargetRoles.filter(r => r.toLowerCase() !== roleToToggle.toLowerCase());
      setTargetRole(updated.join(', '));
    } else {
      if (!targetRole.trim()) {
        setTargetRole(roleToToggle);
      } else {
        const cleanPrev = targetRole.trim().replace(/,\s*$/, '');
        setTargetRole(`${cleanPrev}, ${roleToToggle}`);
      }
    }
    if (errors.targetRole) {
      setErrors(prev => ({ ...prev, targetRole: '' }));
    }
  };

  const handleRemoveRoleChip = (roleToRemove) => {
    const updated = parsedTargetRoles.filter(r => r.toLowerCase() !== roleToRemove.toLowerCase());
    setTargetRole(updated.join(', '));
  };

  const validateCurrentStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!firstName.trim()) {
        errs.firstName = 'First name is required.';
      } else if (!isValidName(firstName)) {
        errs.firstName = 'Please enter a valid first name (at least 2 letters, no numbers).';
      }

      if (middleName.trim() && !isValidName(middleName)) {
        errs.middleName = 'Please enter a valid middle name (no numbers).';
      }

      if (!surname.trim()) {
        errs.surname = 'Surname (last name) is required.';
      } else if (!isValidName(surname)) {
        errs.surname = 'Please enter a valid surname (at least 2 letters, no numbers).';
      }

      if (!phone.trim()) {
        errs.phone = 'WhatsApp phone number is required.';
      } else if (!isValidPhone(phone)) {
        errs.phone = 'Please enter a valid phone number (at least 10 digits, e.g. +234 801 234 5678).';
      }

      if (email.trim() && !isValidEmail(email)) {
        errs.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
    } else if (step === 2) {
      if (!targetRole.trim() || parsedTargetRoles.length === 0) {
        errs.targetRole = 'Please specify at least one target job role or industry.';
      }
    }
    return errs;
  };

  const handleSwitchTab = (tab) => {
    setActiveTab(tab);
    setCurrentStep(1);
    setErrors({});
    setTouched({});
  };

  const handleNextStep = () => {
    const stepErrors = validateCurrentStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      if (currentStep === 1) {
        setTouched(prev => ({ ...prev, firstName: true, middleName: true, surname: true, phone: true, email: true }));
      } else if (currentStep === 2) {
        setTouched(prev => ({ ...prev, targetRole: true }));
      }
      return;
    }
    setErrors({});
    setCurrentStep(prev => Math.min(prev + 1, currentTotalSteps));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const fullName = [firstName.trim(), middleName.trim(), surname.trim()].filter(Boolean).join(' ');

  // Generate WhatsApp Message & Redirect
  const handleSendToWhatsApp = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !surname.trim()) {
      alert('Please fill in your Name before submitting.');
      setCurrentStep(1);
      return;
    }

    let message = '';
    const targetPhone = settings?.whatsapp_support?.phone_number || '2348012345678';

    if (activeTab === 'have_cv') {
      message = `Hello Ophancer Career Studio! 👋
I would like to order an *ATS CV Revamp & Polish*:

*CLIENT PROFILE:*
• *Full Name:* ${fullName}
• *Phone/WhatsApp:* ${phone.trim() || 'Provided in chat'}
• *Email:* ${email.trim() || 'Provided in chat'}
• *Location:* ${location}

*TARGET CAREER DIRECTION:*
• *Target Role(s):* ${parsedTargetRoles.length > 0 ? parsedTargetRoles.join(', ') : targetRole.trim()}
• *Experience Level:* ${experienceLevel}
${existingNotes.trim() ? `• *Special Goals / Notes:* ${existingNotes.trim()}\n` : ''}
*SELECTED PACKAGE:*
• *Plan:* ${packageTier === 'single' ? 'Single ATS CV (1 Copy)' : 'Dual ATS CV Bundle (2 Roles / Industries)'}
• *Investment:* ${currentPriceDisplay}

I am attaching my current CV document right below in this chat for your review!`;
    } else {
      // Build from scratch formatted brief
      message = `Hello Ophancer Career Studio! 👋
I need a *Brand-New Executive CV Written from Scratch*:

*1. PERSONAL & CONTACT DETAILS:*
• *Name:* ${fullName}
• *Phone:* ${phone.trim() || 'Provided in chat'}
• *Email:* ${email.trim() || 'Provided in chat'}
• *Location:* ${location}

*2. TARGET CAREER & OBJECTIVE:*
• *Target Role(s):* ${parsedTargetRoles.length > 0 ? parsedTargetRoles.join(', ') : targetRole.trim()}
${careerAmbition.trim() ? `• *Career Ambition:* ${careerAmbition.trim()}\n` : ''}
*3. ACADEMIC QUALIFICATIONS:*
• *Degree / Diploma:* ${degreeType}
• *Course of Study:* ${courseOfStudy.trim() || 'General Field'}
• *Institution / University:* ${institution.trim() || 'Not specified'}
• *Year:* ${gradYear}

*4. WORK EXPERIENCE / HISTORY:*
${isEntryLevel ? '• *Status:* Entry Level / Fresh Graduate (Highlight internships, projects & leadership)' : workEntries.map((w, idx) => `
Role #${idx + 1}:
• Company: ${w.company || 'Organization'}
• Title: ${w.role || 'Role'}
• Duration: ${w.duration || 'Not specified'}
• Duties: ${w.responsibilities || 'General duties'}`).join('\n')}

*5. KEY COMPETENCIES & TOOLS:*
• ${selectedSkills.join(', ')}

${certifications.trim() ? `*6. CERTIFICATIONS / AWARDS / DETAILS:*\n• ${certifications.trim()}\n` : ''}
*SELECTED PACKAGE:*
• *Plan:* ${packageTier === 'single' ? 'Single ATS CV' : 'Dual ATS CV Bundle'}
• *Investment:* ${currentPriceDisplay}

Please review my answers and let me know the turnaround time!`;
    }

    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-[#F8F9FE] min-h-screen py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Warm Conversational Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0E121B] font-heading tracking-tight">
            Let's Craft Your High-Impact CV
          </h1>
          <p className="text-xs sm:text-sm text-[#525866] leading-relaxed">
            Whether you need an existing CV overhauled or built completely from scratch, our step-by-step interview gathers exactly what recruiters and ATS filters look for.
          </p>
        </div>

        {/* 2 Main Persona Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSwitchTab('have_cv')}
            className={`p-5 sm:p-6 rounded-3xl border-2 text-left transition-all cursor-pointer relative ${
              activeTab === 'have_cv'
                ? 'bg-white border-[#6962F1] shadow-md ring-4 ring-[#6962F1]/10'
                : 'bg-white/70 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#6962F1] uppercase tracking-wider bg-[#EEF0FD] px-2.5 py-0.5 rounded-full">
                Option 1 &bull; 4 Quick Steps
              </span>
              {activeTab === 'have_cv' && (
                <div className="w-6 h-6 rounded-full bg-[#6962F1] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0E121B] mb-1">
              I Have an Existing CV
            </h3>
            <p className="text-xs text-[#525866] leading-relaxed">
              We revamp your wording, ATS layout, and power verbs to dramatically increase your interview callbacks.
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchTab('no_cv')}
            className={`p-5 sm:p-6 rounded-3xl border-2 text-left transition-all cursor-pointer relative ${
              activeTab === 'no_cv'
                ? 'bg-white border-[#6962F1] shadow-md ring-4 ring-[#6962F1]/10'
                : 'bg-white/70 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-[#6962F1] uppercase tracking-wider bg-[#EEF0FD] px-2.5 py-0.5 rounded-full">
                Option 2 &bull; Guided Intake
              </span>
              {activeTab === 'no_cv' && (
                <div className="w-6 h-6 rounded-full bg-[#6962F1] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0E121B] mb-1">
              I Don't Have a CV
            </h3>
            <p className="text-xs text-[#525866] leading-relaxed">
              No problem! Answer our friendly questions about your school, background, and strengths, and we build your professional CV from scratch.
            </p>
          </button>
        </div>

        {/* Dynamic Multi-Step Interactive Card */}
        <div className="bg-white rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border border-[#EBEFF5] shadow-[0_12px_40px_rgba(14,18,27,0.04)] space-y-6 sm:space-y-8">
          
          {/* Progress Header & Package Selector Bar */}
          <div className="space-y-3.5 pb-6 border-b border-slate-100">
            {/* Top Row: Step Title on Left, Currency Switcher on Right (SAME LINE, NO SCROLLING) */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs font-mono font-bold text-[#6962F1] uppercase tracking-wider block">
                  Step {currentStep} of {currentTotalSteps}
                </span>
                <span className="text-xs sm:text-sm text-[#0E121B] font-bold block truncate">
                  {activeTab === 'have_cv' 
                    ? (currentStep === 1 ? 'Your Contact Information' : currentStep === 2 ? 'Target Career & Level' : currentStep === 3 ? 'Revamp Focus & Goals' : 'Investment & Final Review')
                    : (currentStep === 1 ? 'Your Personal Profile' : currentStep === 2 ? 'Target Career Field' : currentStep === 3 ? 'Academic Credentials' : currentStep === 4 ? 'Work Experience & Roles' : currentStep === 5 ? 'Core Skills & Superpowers' : currentStep === 6 ? 'Certifications & Extras' : 'Investment & Summary Review')
                  }
                </span>
              </div>

              {/* Currency Toggle directly on the right of that same line */}
              <div className="flex items-center rounded-full bg-[#F5F7FA] border border-[#EBEFF5] p-1 text-xs shrink-0 shadow-xs">
                <button
                  type="button"
                  onClick={() => setCurrency('NGN')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    currency === 'NGN' ? 'bg-[#6962F1] text-white shadow-xs' : 'text-[#525866] hover:text-black'
                  }`}
                  title="Switch to Nigerian Naira (NGN)"
                >
                  <span className="sm:hidden">NGN</span>
                  <span className="hidden sm:inline">₦ NGN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    currency === 'USD' ? 'bg-[#6962F1] text-white shadow-xs' : 'text-[#525866] hover:text-black'
                  }`}
                  title="Switch to US Dollar (USD)"
                >
                  <span className="sm:hidden">USD</span>
                  <span className="hidden sm:inline">$ USD</span>
                </button>
              </div>
            </div>

            {/* Package Selector (1 CV vs 2 CVs): Full-width 50/50 segmented control, zero horizontal scrolling */}
            <div className="w-full">
              <div className="grid grid-cols-2 gap-1 rounded-2xl sm:rounded-full bg-[#F5F7FA] border border-[#EBEFF5] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPackageTier('single')}
                  className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-bold text-center transition-all cursor-pointer truncate ${
                    packageTier === 'single' ? 'bg-[#0E121B] text-white shadow-xs' : 'text-[#525866] hover:text-black'
                  }`}
                >
                  1 CV ({currency === 'NGN' ? `₦${pricing.ngn_single.toLocaleString()}` : `$${pricing.usd_single}`})
                </button>
                <button
                  type="button"
                  onClick={() => setPackageTier('double')}
                  className={`py-2 px-2 sm:px-4 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-bold text-center transition-all cursor-pointer truncate ${
                    packageTier === 'double' ? 'bg-[#0E121B] text-white shadow-xs' : 'text-[#525866] hover:text-black'
                  }`}
                >
                  2 CVs Bundle ({currency === 'NGN' ? `₦${pricing.ngn_double.toLocaleString()}` : `$${pricing.usd_double}`})
                </button>
              </div>
            </div>

            {/* Visual Animated Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6962F1] to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / currentTotalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* PATH A: I HAVE A CV - INTERACTIVE QUESTIONNAIRE          */}
          {/* ======================================================== */}
          {activeTab === 'have_cv' && (
            <div className="space-y-6 animate-fade-in">

              {/* Step 1: Personal Contact Info */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <User className="w-5 h-5 text-[#6962F1]" />
                      <span>First, let's get acquainted! What is your name?</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      We will format this at the very top of your official ATS CV header.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">First Name *</label>
                      <input
                        type="text"
                        autoFocus
                        value={firstName}
                        onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                        }}
                        placeholder="e.g. John"
                        className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none transition-all ${
                          touched.firstName && errors.firstName 
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                            : firstName.trim() && isValidName(firstName)
                              ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                              : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                        }`}
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.firstName}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">
                        Middle Name <span className="text-[#99A0AE] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={middleName}
                        onBlur={() => setTouched(prev => ({ ...prev, middleName: true }))}
                        onChange={(e) => {
                          setMiddleName(e.target.value);
                          if (errors.middleName) setErrors(prev => ({ ...prev, middleName: '' }));
                        }}
                        placeholder="e.g. Chukwuemeka"
                        className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none transition-all ${
                          touched.middleName && errors.middleName 
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                            : middleName.trim() && isValidName(middleName)
                              ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                              : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                        }`}
                      />
                      {touched.middleName && errors.middleName && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.middleName}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">Surname (Last Name) *</label>
                      <input
                        type="text"
                        value={surname}
                        onBlur={() => setTouched(prev => ({ ...prev, surname: true }))}
                        onChange={(e) => {
                          setSurname(e.target.value);
                          if (errors.surname) setErrors(prev => ({ ...prev, surname: '' }));
                        }}
                        placeholder="e.g. Doe"
                        className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none transition-all ${
                          touched.surname && errors.surname 
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                            : surname.trim() && isValidName(surname)
                              ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                              : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                        }`}
                      />
                      {touched.surname && errors.surname && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.surname}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">WhatsApp Phone Number *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={phone}
                          onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                          }}
                          placeholder="+234 801 234 5678"
                          className={`w-full bg-[#F8F9FE] border rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-[#0E121B] focus:outline-none transition-all ${
                            touched.phone && errors.phone 
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                              : phone.trim() && isValidPhone(phone)
                                ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                                : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                          }`}
                        />
                      </div>
                      {touched.phone && errors.phone && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                          }}
                          placeholder="e.g. johndoe@gmail.com"
                          className={`w-full bg-[#F8F9FE] border rounded-2xl pl-10 pr-4 py-3.5 text-xs sm:text-sm text-[#0E121B] focus:outline-none transition-all ${
                            touched.email && errors.email 
                              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                              : email.trim() && isValidEmail(email)
                                ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                                : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                          }`}
                        />
                      </div>
                      {touched.email && errors.email && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Target Career Direction & Level */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#6962F1]" />
                      <span>What job or career path are you targeting?</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      We tailor your CV keywords and skills specifically to match your targeted roles. You can enter multiple roles separated by commas.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0E121B] block">Target Role / Industry (Use commas for multiple) *</label>
                    <input
                      type="text"
                      autoFocus
                      value={targetRole}
                      onBlur={() => setTouched(prev => ({ ...prev, targetRole: true }))}
                      onChange={(e) => {
                        setTargetRole(e.target.value);
                        if (errors.targetRole) setErrors(prev => ({ ...prev, targetRole: '' }));
                      }}
                      placeholder="e.g. Customer Support Specialist, Virtual Assistant, Operations Supervisor"
                      className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none transition-all ${
                        touched.targetRole && errors.targetRole
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                          : parsedTargetRoles.length > 0
                            ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                            : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                      }`}
                    />

                    {touched.targetRole && errors.targetRole && (
                      <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.targetRole}</span>
                      </p>
                    )}

                    {/* Active Parsed Role Badges with Remove Button */}
                    {parsedTargetRoles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        <span className="text-[11px] font-bold text-[#6962F1] uppercase tracking-wider font-mono">
                          🎯 Active Roles ({parsedTargetRoles.length}):
                        </span>
                        {parsedTargetRoles.map((role, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF0FD] text-[#6962F1] border border-[#D6D8FB] animate-fade-in"
                          >
                            <span>{role}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRoleChip(role)}
                              className="hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove role"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Role Suggestions */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Or tap to toggle popular roles:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_ROLES.map(role => {
                          const isSelected = parsedTargetRoles.some(r => r.toLowerCase() === role.toLowerCase());
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleToggleRoleChip(role)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                                isSelected 
                                  ? 'bg-[#6962F1] text-white border-[#6962F1] shadow-xs' 
                                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected ? `✓ ${role}` : role}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Smart Pro-Tip for Multi-Role Target */}
                    {parsedTargetRoles.length >= 2 && packageTier === 'single' && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 animate-fade-in mt-3">
                        <div className="space-y-0.5">
                          <strong className="block font-bold text-amber-900">
                            Targeting {parsedTargetRoles.length} distinct career paths?
                          </strong>
                          <span className="text-[11px] text-amber-800 leading-relaxed block">
                            Recruiters reject generic combined CVs. We strongly recommend our <strong>2 CVs Bundle</strong> so each role receives an independently tailored ATS CV.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPackageTier('double')}
                          className="px-3.5 py-2 rounded-full bg-[#0E121B] hover:bg-black text-white font-bold text-[11px] whitespace-nowrap cursor-pointer transition-all shrink-0 self-start sm:self-auto shadow-xs"
                        >
                          Switch to 2 CVs ({currency === 'NGN' ? `₦${pricing.ngn_double.toLocaleString()}` : `$${pricing.usd_double}`})
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Exact Years Experience Input & Quick Duration Chips */}
                  <div className="space-y-2 pt-2">
                    <div className="space-y-0.5">
                      <label className="text-xs font-bold text-[#0E121B] block">Current Career Experience Level / Exact Duration</label>
                      <p className="text-[11px] text-slate-500">Enter your exact years (e.g. 1 Year, 2.5 Years, 4 Years) or tap an option below.</p>
                    </div>
                    <input
                      type="text"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      placeholder="e.g. 1 Year, 2.5 Years, 4 Years..."
                      className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                    />
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Quick duration:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {EXACT_YEAR_OPTIONS.map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setExperienceLevel(yr)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                              experienceLevel === yr
                                ? 'bg-[#0E121B] text-white border-[#0E121B] shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                            }`}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Revamp Focus & Notes */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <Target className="w-5 h-5 text-[#6962F1]" />
                      <span>Any special requests or goals for this revamp?</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      Are you switching industries? Explaining a career gap? Applying for a specific dream firm?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={existingNotes}
                      onChange={(e) => setExistingNotes(e.target.value)}
                      placeholder="e.g. I am transitioning from Customer Service into Project Management. Please highlight my leadership, Agile, and organization skills..."
                      className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-4 text-xs sm:text-sm text-[#0E121B] leading-relaxed focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                    />
                  </div>

                  {/* Informational Callout */}
                  <div className="p-4 rounded-2xl bg-[#EEF0FD]/60 border border-[#D6D8FB] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#6962F1] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-[#0E121B] block font-bold">Existing CV Attachment</strong>
                      <span>Once you click submit on the next step, WhatsApp will open automatically. Simply attach your current PDF or Word CV to the chat so our writer can review it immediately!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Final Summary & Payment */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Review Your Order &amp; Direct Bank Transfer</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      Double-check your information below before sending your brief to our team.
                    </p>
                  </div>

                  {/* Intake Summary Card */}
                  <div className="p-5 rounded-2xl bg-[#F8F9FE] border border-[#EBEFF5] space-y-2 text-xs">
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-400 font-bold uppercase font-mono text-[10px]">Client Name:</span>
                      <strong className="text-[#0E121B]">{fullName || 'Valued Client'}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-400 font-bold uppercase font-mono text-[10px]">Target Role(s):</span>
                      <strong className="text-[#0E121B]">{parsedTargetRoles.length > 0 ? parsedTargetRoles.join(', ') : (targetRole || 'Not specified')}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-200">
                      <span className="text-slate-400 font-bold uppercase font-mono text-[10px]">Experience Level:</span>
                      <span className="text-slate-700">{experienceLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold uppercase font-mono text-[10px]">Package &amp; Fee:</span>
                      <strong className="text-[#6962F1] font-mono font-extrabold text-sm">{currentPriceDisplay}</strong>
                    </div>
                  </div>

                  {/* Bank Transfer Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBEFF5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#99A0AE] font-mono uppercase font-bold">Direct Bank Transfer Details</span>
                      <div className="text-sm font-extrabold text-[#0E121B]">
                        {settings?.bank_details?.bank_name || 'Kuda Bank / GTBank'} &bull; <span className="text-[#6962F1]">{settings?.bank_details?.account_number || '0123456789'}</span>
                      </div>
                      <span className="text-[11px] text-[#525866]">
                        {settings?.bank_details?.account_name || 'Ophancer Career Services'} &bull; Amount: <strong className="text-[#0E121B]">{currentPriceDisplay}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={copyBankDetails}
                      className="px-4 py-2 rounded-full bg-[#F8F9FE] hover:bg-slate-100 text-xs font-bold text-[#0E121B] inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs border border-slate-200"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBank ? 'Copied' : 'Copy Account'}</span>
                    </button>
                  </div>

                  {/* Submit to WhatsApp Button */}
                  <button
                    type="button"
                    onClick={handleSendToWhatsApp}
                    className="w-full py-4 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4 fill-current shrink-0" />
                    <span>Send Order &amp; Chat on WhatsApp ({currentPriceDisplay})</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* PATH B: I DON'T HAVE A CV - GUIDED 7-STEP WIZARD         */}
          {/* ======================================================== */}
          {activeTab === 'no_cv' && (
            <div className="space-y-6 animate-fade-in">

              {/* Step 1: Personal Profile */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <User className="w-5 h-5 text-[#6962F1]" />
                      <span>Step 1: What is your full legal name?</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      This will be the header of your new executive CV.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">First Name *</label>
                      <input
                        type="text"
                        autoFocus
                        value={firstName}
                        onBlur={() => setTouched(prev => ({ ...prev, firstName: true }))}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                        }}
                        placeholder="e.g. John"
                        className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none transition-all ${
                          touched.firstName && errors.firstName 
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                            : firstName.trim() && isValidName(firstName)
                              ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                              : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                        }`}
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.firstName}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">
                        Middle Name <span className="text-[#99A0AE] font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={middleName}
                        onBlur={() => setTouched(prev => ({ ...prev, middleName: true }))}
                        onChange={(e) => {
                          setMiddleName(e.target.value);
                          if (errors.middleName) setErrors(prev => ({ ...prev, middleName: '' }));
                        }}
                        placeholder="e.g. Chukwuemeka"
                        className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none transition-all ${
                          touched.middleName && errors.middleName 
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                            : middleName.trim() && isValidName(middleName)
                              ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                              : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                        }`}
                      />
                      {touched.middleName && errors.middleName && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.middleName}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">Surname (Last Name) *</label>
                      <input
                        type="text"
                        value={surname}
                        onBlur={() => setTouched(prev => ({ ...prev, surname: true }))}
                        onChange={(e) => {
                          setSurname(e.target.value);
                          if (errors.surname) setErrors(prev => ({ ...prev, surname: '' }));
                        }}
                        placeholder="e.g. Doe"
                        className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none transition-all ${
                          touched.surname && errors.surname 
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                            : surname.trim() && isValidName(surname)
                              ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                              : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                        }`}
                      />
                      {touched.surname && errors.surname && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.surname}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">WhatsApp Phone *</label>
                      <input
                        type="tel"
                        value={phone}
                        onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                        }}
                        placeholder="+234 801 234 5678"
                        className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] focus:outline-none transition-all ${
                          touched.phone && errors.phone 
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                            : phone.trim() && isValidPhone(phone)
                              ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                              : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                        }`}
                      />
                      {touched.phone && errors.phone && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                        }}
                        placeholder="e.g. johndoe@gmail.com"
                        className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] focus:outline-none transition-all ${
                          touched.email && errors.email 
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                            : email.trim() && isValidEmail(email)
                              ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                              : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                        }`}
                      />
                      {touched.email && errors.email && (
                        <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">Location (City &amp; Country)</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Lagos, Nigeria"
                        className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Desired Career Path */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#6962F1]" />
                      <span>Step 2: What job title or industry do you want?</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      We write your professional summary and headline around this role. You can enter multiple roles separated by commas.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0E121B] block">Target Role / Industry (Use commas for multiple) *</label>
                    <input
                      type="text"
                      autoFocus
                      value={targetRole}
                      onBlur={() => setTouched(prev => ({ ...prev, targetRole: true }))}
                      onChange={(e) => {
                        setTargetRole(e.target.value);
                        if (errors.targetRole) setErrors(prev => ({ ...prev, targetRole: '' }));
                      }}
                      placeholder="e.g. Public Health Administrator, Remote Virtual Assistant, Store Supervisor..."
                      className={`w-full bg-[#F8F9FE] border rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none transition-all ${
                        touched.targetRole && errors.targetRole
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                          : parsedTargetRoles.length > 0
                            ? 'border-emerald-300 focus:border-emerald-500 focus:bg-white'
                            : 'border-[#EBEFF5] focus:border-[#6962F1] focus:bg-white'
                      }`}
                    />

                    {touched.targetRole && errors.targetRole && (
                      <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.targetRole}</span>
                      </p>
                    )}

                    {/* Active Parsed Role Badges with Remove Button */}
                    {parsedTargetRoles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        <span className="text-[11px] font-bold text-[#6962F1] uppercase tracking-wider font-mono">
                          🎯 Active Roles ({parsedTargetRoles.length}):
                        </span>
                        {parsedTargetRoles.map((role, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF0FD] text-[#6962F1] border border-[#D6D8FB] animate-fade-in"
                          >
                            <span>{role}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRoleChip(role)}
                              className="hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remove role"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Role Suggestions */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Or tap to toggle popular career fields:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_ROLES.map(role => {
                          const isSelected = parsedTargetRoles.some(r => r.toLowerCase() === role.toLowerCase());
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleToggleRoleChip(role)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                                isSelected 
                                  ? 'bg-[#6962F1] text-white border-[#6962F1] shadow-xs' 
                                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected ? `✓ ${role}` : role}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Smart Pro-Tip for Multi-Role Target */}
                    {parsedTargetRoles.length >= 2 && packageTier === 'single' && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 animate-fade-in mt-3">
                        <div className="space-y-0.5">
                          <strong className="block font-bold text-amber-900">
                            Targeting {parsedTargetRoles.length} distinct career paths?
                          </strong>
                          <span className="text-[11px] text-amber-800 leading-relaxed block">
                            Recruiters reject generic combined CVs. We recommend our <strong>2 CVs Bundle</strong> so each role receives an independently tailored ATS CV.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPackageTier('double')}
                          className="px-3.5 py-2 rounded-full bg-[#0E121B] hover:bg-black text-white font-bold text-[11px] whitespace-nowrap cursor-pointer transition-all shrink-0 self-start sm:self-auto shadow-xs"
                        >
                          Switch to 2 CVs ({currency === 'NGN' ? `₦${pricing.ngn_double.toLocaleString()}` : `$${pricing.usd_double}`})
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-[#0E121B] block">What is your core career ambition or strength?</label>
                    <textarea
                      rows={2}
                      value={careerAmbition}
                      onChange={(e) => setCareerAmbition(e.target.value)}
                      placeholder="e.g. Passionate about community health initiatives, organizing medical records, and managing clinic operations..."
                      className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] leading-relaxed focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Education & Academic History */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#6962F1]" />
                      <span>Step 3: Tell us about your education</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      Recruiters and ATS scanners look for degree type, course, and school.
                    </p>
                  </div>

                  {/* Degree Type Quick Chips */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0E121B] block">Highest Degree or Qualification</label>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_DEGREES.map(deg => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => setDegreeType(deg)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            degreeType === deg
                              ? 'bg-[#0E121B] text-white border-[#0E121B] shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {deg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">Course / Field of Study *</label>
                      <input
                        type="text"
                        autoFocus
                        value={courseOfStudy}
                        onChange={(e) => setCourseOfStudy(e.target.value)}
                        placeholder="e.g. Public Health, Computer Science, Economics"
                        className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0E121B] block">University / Polytechnic / Institution *</label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="e.g. University of Ibadan, Yaba College of Technology"
                        className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-semibold focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 space-y-1.5">
                    <label className="text-xs font-bold text-[#0E121B] block">Graduation Year (or in view)</label>
                    <input
                      type="text"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      placeholder="e.g. 2022 or 2025 (In View)"
                      className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-3.5 text-xs sm:text-sm text-[#0E121B] font-mono focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Past Work Experience or Roles */}
              {currentStep === 4 && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#6962F1]" />
                        <span>Step 4: Past work, internships, or business</span>
                      </h2>
                      <p className="text-xs text-[#525866]">
                        Even NYSC, volunteering, internships, or family business count as professional experience!
                      </p>
                    </div>

                    {/* Entry-level checkbox toggle */}
                    <label className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer text-xs font-bold text-slate-700 select-none self-start sm:self-auto transition-colors">
                      <input 
                        type="checkbox"
                        checked={isEntryLevel}
                        onChange={(e) => setIsEntryLevel(e.target.checked)}
                        className="rounded text-[#6962F1]"
                      />
                      <span>I am a fresh graduate (No formal work)</span>
                    </label>
                  </div>

                  {isEntryLevel ? (
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Entry Level Track Activated</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        We will craft an executive entry-level CV spotlighting your academic leadership, relevant coursework, and high-impact transferable skills.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {workEntries.map((work, idx) => (
                        <div 
                          key={work.id}
                          className="p-5 rounded-3xl bg-[#F8F9FE] border border-[#EBEFF5] space-y-3 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-[#6962F1] uppercase">
                              Role #{idx + 1}
                            </span>
                            {workEntries.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveWorkEntry(work.id)}
                                className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors cursor-pointer"
                                title="Remove role"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-[#0E121B] block">Company / Business Name *</label>
                              <input
                                type="text"
                                value={work.company}
                                onChange={(e) => handleUpdateWorkEntry(work.id, 'company', e.target.value)}
                                placeholder="e.g. Apex Health Center"
                                className="w-full bg-white border border-[#EBEFF5] rounded-xl px-3 py-2.5 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-[#0E121B] block">Your Job Title *</label>
                              <input
                                type="text"
                                value={work.role}
                                onChange={(e) => handleUpdateWorkEntry(work.id, 'role', e.target.value)}
                                placeholder="e.g. Administrative Officer"
                                className="w-full bg-white border border-[#EBEFF5] rounded-xl px-3 py-2.5 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-[#0E121B] block">Duration / Year</label>
                              <input
                                type="text"
                                value={work.duration}
                                onChange={(e) => handleUpdateWorkEntry(work.id, 'duration', e.target.value)}
                                placeholder="e.g. 2022 - 2024 (2 yrs)"
                                className="w-full bg-white border border-[#EBEFF5] rounded-xl px-3 py-2.5 text-xs text-[#0E121B] font-mono focus:outline-none focus:border-[#6962F1]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-[#0E121B] block">What duties or achievements did you handle?</label>
                            <textarea
                              rows={2}
                              value={work.responsibilities}
                              onChange={(e) => handleUpdateWorkEntry(work.id, 'responsibilities', e.target.value)}
                              placeholder="e.g. Managed patient records, scheduled appointments for 4 doctors, coordinated medical supplies..."
                              className="w-full bg-white border border-[#EBEFF5] rounded-xl p-3 text-xs text-[#0E121B] leading-relaxed focus:outline-none focus:border-[#6962F1]"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddWorkEntry}
                        className="w-full py-2.5 rounded-xl border border-dashed border-[#6962F1]/50 hover:border-[#6962F1] bg-[#EEF0FD]/40 hover:bg-[#EEF0FD] text-[#6962F1] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Another Past Role</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Core Skills & Tools */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-[#6962F1]" />
                      <span>Step 5: What are your key skills &amp; software tools?</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      Click to toggle relevant skills or type in your unique tools below.
                    </p>
                  </div>

                  {/* Clickable Skill Chips */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Tap to select your skills ({selectedSkills.length} selected):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SKILLS.map(skill => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleToggleSkill(skill)}
                            className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-[#0E121B] text-white border-[#0E121B] shadow-xs scale-102'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            <span>{skill}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Skill Input */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-[#0E121B] block">Add any other specific tools or skills:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill(e)}
                        placeholder="e.g. QuickBooks, Figma, Phlebotomy, Python, CRM..."
                        className="flex-1 bg-[#F8F9FE] border border-[#EBEFF5] rounded-xl px-3.5 py-2.5 text-xs text-[#0E121B] focus:outline-none focus:border-[#6962F1]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSkill}
                        className="px-4 py-2.5 rounded-xl bg-[#6962F1] hover:bg-[#5851E0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        + Add Skill
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Certifications & Extras */}
              {currentStep === 6 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#6962F1]" />
                      <span>Step 6: Certifications, Licences or Extra Details</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      List any professional licences, NYSC status, awards, or languages spoken.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={certifications}
                      onChange={(e) => setCertifications(e.target.value)}
                      placeholder="e.g.&#10;• Certified Project Management Associate (CAPM)&#10;• Google Data Analytics Professional Certificate&#10;• Fluent in English &amp; French"
                      className="w-full bg-[#F8F9FE] border border-[#EBEFF5] rounded-2xl p-4 text-xs sm:text-sm text-[#0E121B] leading-relaxed focus:outline-none focus:border-[#6962F1] focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Step 7: Final Summary Review & Payment */}
              {currentStep === 7 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0E121B] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span>Step 7: Review Your Compiled CV Brief</span>
                    </h2>
                    <p className="text-xs text-[#525866]">
                      Everything is organized! Review your answers below, then submit directly to our writer on WhatsApp.
                    </p>
                  </div>

                  {/* Compiled CV Profile Card */}
                  <div className="p-6 rounded-3xl bg-white border border-[#EBEFF5] shadow-xs space-y-4 text-xs">
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-base font-extrabold text-[#0E121B]">{fullName || 'Candidate Profile'}</h3>
                        <p className="text-[11px] text-slate-500">{phone} &bull; {email} &bull; {location}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#6962F1] bg-[#EEF0FD] px-3 py-1 rounded-full">
                        {parsedTargetRoles.length > 0 ? parsedTargetRoles.join(', ') : (targetRole || 'Professional Role')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Education</span>
                        <p className="font-semibold text-slate-800">{degreeType} in {courseOfStudy || 'Course'}</p>
                        <p className="text-[11px] text-slate-500">{institution || 'Institution'} ({gradYear})</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1">Work History</span>
                        <p className="font-semibold text-slate-800">
                          {isEntryLevel ? 'Entry Level Track' : `${workEntries.length} Role(s) Listed`}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isEntryLevel ? 'Highlighting leadership & skills' : workEntries.map(w => w.company).filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block mb-1.5">Core Competencies</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedSkills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Selected Writing Package:</span>
                      <strong className="text-base font-mono font-black text-[#0E121B]">{currentPriceDisplay}</strong>
                    </div>
                  </div>

                  {/* Bank Transfer Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBEFF5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#99A0AE] font-mono uppercase font-bold">Direct Bank Transfer Details</span>
                      <div className="text-sm font-extrabold text-[#0E121B]">
                        {settings?.bank_details?.bank_name || 'Kuda Bank / GTBank'} &bull; <span className="text-[#6962F1]">{settings?.bank_details?.account_number || '0123456789'}</span>
                      </div>
                      <span className="text-[11px] text-[#525866]">
                        {settings?.bank_details?.account_name || 'Ophancer Career Services'} &bull; Amount: <strong className="text-[#0E121B]">{currentPriceDisplay}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={copyBankDetails}
                      className="px-4 py-2 rounded-full bg-[#F8F9FE] hover:bg-slate-100 text-xs font-bold text-[#0E121B] inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs border border-slate-200"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedBank ? 'Copied' : 'Copy Account'}</span>
                    </button>
                  </div>

                  {/* Submit to WhatsApp Button */}
                  <button
                    type="button"
                    onClick={handleSendToWhatsApp}
                    className="w-full py-4 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4 fill-current shrink-0" />
                    <span>Send Complete CV Brief &amp; Chat on WhatsApp ({currentPriceDisplay})</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Wizard Navigation Footer (Back & Next Buttons) */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < currentTotalSteps && (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-7 py-3 rounded-full bg-[#0E121B] hover:bg-black text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Trust Badges Footer */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#525866] pt-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Human Career Specialist Writing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#6962F1]" />
            <span>ATS Keyword &amp; Layout Optimized</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Word (.docx) &amp; Print-Ready PDF</span>
          </div>
        </div>

      </div>
    </div>
  );
}
