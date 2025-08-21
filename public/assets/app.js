(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const totalQuestions = 6;
  let current = 1;
  let score = 0;
  const answers = {};
  let aiRecommendations = [];

  const progressBar = qs('#progressBar');
  const progressText = qs('#progressText');
  const prevBtn = qs('#prevBtn');
  const nextBtn = qs('#nextBtn');
  const resultsSection = qs('#resultsSection');
  const badge = qs('#qualificationBadge');
  const badgeText = qs('#qualificationText');
  const bookLink = qs('#bookLink');
  const submitBtn = qs('#submitBtn');
  const year = qs('#year');
  const langToggle = qs('#langToggle');

  const SAR = new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 });

  // AI-Powered Scoring Matrix for enhanced qualification
  const aiScoringMatrix = {
    role: {
      'rcm-director': 5, 'practice-admin': 5, 'finance-controller': 4,
      'billing-manager': 4, 'it-manager': 3, 'clinical-supervisor': 3,
      'quality-manager': 3, 'other-healthcare': 1
    },
    organizationSize: {
      'mega-system': 5, 'large': 4, 'medium': 4, 'small': 2, 'very-small': 1
    },
    challenge: {
      'nphies-compliance': 5, 'staffing-shortage': 4, 'manual-processes': 4,
      'denial-management': 4, 'system-integration': 3, 'cash-flow': 2
    },
    financialImpact: {
      'critical-impact': 5, 'high-impact': 4, 'medium-impact': 3, 'low-impact': 2, 'minimal': 1
    },
    aiReadiness: {
      'ai-pioneer': 5, 'very-open': 4, 'open-with-pilot': 4,
      'cautious-proven': 3, 'regulatory-concerns': 2, 'traditional-focus': 1
    }
  };

  // AI Decision Logic for personalized recommendations
  function generateAIRecommendations() {
    const recommendations = [];
    const challenge = answers.q3?.value;
    const role = answers.q1?.value;
    const financialImpact = answers.q4?.value;
    const aiReadiness = answers.q5?.value;

    // Role-based recommendations
    if (role === 'rcm-director' || role === 'practice-admin') {
      recommendations.push('Strategic RCM transformation with executive dashboard');
    } else if (role === 'billing-manager') {
      recommendations.push('Automated billing and denial management solutions');
    } else if (role === 'it-manager') {
      recommendations.push('System integration and API-based workflow automation');
    }

    // Challenge-specific recommendations
    if (challenge === 'nphies-compliance') {
      recommendations.push('NPHIES-compliant automated submission and tracking');
    } else if (challenge === 'staffing-shortage') {
      recommendations.push('AI-powered staff augmentation and training programs');
    } else if (challenge === 'manual-processes') {
      recommendations.push('End-to-end process automation with RPA');
    }

    // Financial impact recommendations
    if (financialImpact === 'critical-impact' || financialImpact === 'high-impact') {
      recommendations.push('Priority implementation with immediate ROI focus');
    }

    return recommendations;
  }

  function updateProgress() {
    const pct = (current / totalQuestions) * 100;
    progressBar.style.width = pct + '%';
    progressText.textContent = `Step ${current} of ${totalQuestions}`;
  }

  function showQuestion(n) {
    qsa('.question').forEach(q => q.classList.remove('active'));
    qs(`.question[data-question="${n}"]`)?.classList.add('active');
    prevBtn.disabled = n === 1;
    nextBtn.textContent = n === totalQuestions ? 'Complete Survey' : 'Next →';
    nextBtn.disabled = !answers[`q${n}`] && n !== totalQuestions;
    updateProgress();
  }

  function selectOption(btn) {
    const n = current;
    const parent = btn.parentElement;
    qsa('.option', parent).forEach(o => o.classList.remove('selected'));
    btn.classList.add('selected');

    const qualify = btn.dataset.qualify;
    const value = btn.dataset.value;
    const text = qs('.option-title', btn).textContent;
    const sar = btn.dataset.sar ? Number(btn.dataset.sar) : undefined;

    // Enhanced AI-based scoring
    let aiScore = 0;
    if (n === 1 && aiScoringMatrix.role[value]) {
      aiScore = aiScoringMatrix.role[value];
    } else if (n === 2 && aiScoringMatrix.organizationSize[value]) {
      aiScore = aiScoringMatrix.organizationSize[value];
    } else if (n === 3 && aiScoringMatrix.challenge[value]) {
      aiScore = aiScoringMatrix.challenge[value];
    } else if (n === 4 && aiScoringMatrix.financialImpact[value]) {
      aiScore = aiScoringMatrix.financialImpact[value];
    } else if (n === 5 && aiScoringMatrix.aiReadiness[value]) {
      aiScore = aiScoringMatrix.aiReadiness[value];
    } else {
      // Fallback to original scoring
      aiScore = qualify === 'high' ? 3 : qualify === 'medium' ? 2 : 1;
    }

    // Adjust score on change
    if (answers[`q${n}`]?.aiScore) score -= answers[`q${n}`].aiScore;
    score += aiScore;

    answers[`q${n}`] = { value, qualify, text, sar, aiScore };

    nextBtn.disabled = false;
  }

  function next() {
    if (current === totalQuestions) {
      // Validate contact
      const name = qs('#fullName').value.trim();
      const email = qs('#email').value.trim();
      const org = qs('#organization').value.trim();
      if (!name || !email || !org) {
        alert('يرجى ملء الاسم والبريد الإلكتروني والمنظمة | Please fill in Name, Work Email, and Organization.');
        return;
      }
      answers.contact = {
        name,
        email,
        organization: org,
        phone: qs('#phone').value.trim(),
        location: qs('#location').value.trim(),
        jobTitle: qs('#jobTitle').value.trim()
      };
      
      // Generate AI recommendations before showing results
      aiRecommendations = generateAIRecommendations();
      
      showResults();
      return;
    }
    current += 1;
    showQuestion(current);
  }

  function prev() {
    if (current === 1) return;
    current -= 1;
    showQuestion(current);
  }

  function showResults() {
    qs('#surveyForm').hidden = true;
    resultsSection.hidden = false;
    progressBar.style.width = '100%';
    progressText.textContent = `مكتمل | Completed`;

    // Enhanced AI-based qualification with new thresholds (max score is now 25)
    let text, cls, priority;
    if (score >= 20) {
      text = '🎯 مؤهل بدرجة عالية جداً | Exceptionally Qualified — Priority candidate for strategic partnership.';
      cls = 'ok';
      priority = 'critical';
    } else if (score >= 15) {
      text = '🎯 مؤهل بدرجة عالية | Highly Qualified — Perfect fit for our research and solutions.';
      cls = 'ok';
      priority = 'high';
    } else if (score >= 10) {
      text = '✅ مؤهل | Qualified — Great candidate for our study and potential collaboration.';
      cls = 'ok';
      priority = 'medium';
    } else if (score >= 6) {
      text = '📋 مؤهل جزئياً | Partially Qualified — We value your perspective.';
      cls = 'not';
      priority = 'low';
    } else {
      text = '📋 شكراً لاهتمامك | Thank you for your interest — We appreciate your input.';
      cls = 'not';
      priority = 'minimal';
    }
    badge.classList.remove('ok', 'not');
    badge.classList.add(cls);
    badge.textContent = text;

    const sarVal = answers.q4?.sar ? SAR.format(answers.q4.sar) : 'N/A';
    badgeText.textContent = `الخسائر الشهرية المقدرة: ${sarVal} | Estimated monthly loss: ${sarVal}.\n\nتوصيات مخصصة | Personalized Recommendations:\n• ${aiRecommendations.join("\n• ")}\n\nسنتواصل معك برؤى مخصصة | We'll reach out with tailored insights.`;

    // Calendly link placeholder
    bookLink.href = window.APP_CONFIG?.CALENDLY_URL || '#';

    submitBtn.addEventListener('click', submitSurvey);
  }

  function submitSurvey() {
    const name = answers.contact?.name || 'Anonymous';
    const timestamp = new Date().toLocaleString('en-SA');
    
    const body = [
      `🧠 BrainSAIT Healthcare AI Research - RCM Survey Response`,
      `Response from: ${name} (${answers.contact?.jobTitle || 'Healthcare Professional'})`,
      `Organization: ${answers.contact?.organization || ''}`,
      `Email: ${answers.contact?.email || ''}`,
      `Phone: ${answers.contact?.phone || 'Not provided'}`,
      `Location: ${answers.contact?.location || 'Not provided'}`,
      '',
      '📊 SURVEY RESPONSES:',
      `1. Role: ${answers.q1?.text || 'Not answered'} (Value: ${answers.q1?.value})`,
      `2. Organization Size: ${answers.q2?.text || 'Not answered'} (Value: ${answers.q2?.value})`,
      `3. Primary Challenge: ${answers.q3?.text || 'Not answered'} (Value: ${answers.q3?.value})`,
      `4. Financial Impact: ${answers.q4?.text || 'Not answered'} (${answers.q4?.sar ? SAR.format(answers.q4.sar) : 'N/A'})`,
      `5. AI Readiness: ${answers.q5?.text || 'Not answered'} (Value: ${answers.q5?.value})`,
      '',
      '🎯 QUALIFICATION ANALYSIS:',
      `AI Qualification Score: ${score}/25`,
      `Priority Level: ${score >= 20 ? 'Critical' : score >= 15 ? 'High' : score >= 10 ? 'Medium' : score >= 6 ? 'Low' : 'Minimal'}`,
      '',
      '🤖 AI RECOMMENDATIONS:',
      aiRecommendations.length > 0 ? aiRecommendations.map(r => `• ${r}`).join('\n') : 'No specific recommendations generated',
      '',
      `Generated on: ${timestamp}`,
      `System: BrainSAIT RCM Validation & Outreach System v2.0`
    ].join('\n');

    // Enhanced API payload for backend processing
    const apiPayload = {
      answers,
      score,
      aiRecommendations,
      qualificationLevel: score >= 20 ? 'critical' : score >= 15 ? 'high' : score >= 10 ? 'medium' : score >= 6 ? 'low' : 'minimal',
      timestamp,
      version: '2.0'
    };

    // Send to our API (will be Cloudflare Workers endpoint)
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload)
    }).catch(() => {/* non-blocking */});

    const mailto = `mailto:${(window.APP_CONFIG?.SUBMIT_EMAIL)||'dr.mf.12298@gmail.com'}?subject=🧠 BrainSAIT RCM Survey - ${encodeURIComponent(name)} (${score}/25 points)&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    qs('#submitNote').textContent = 'فتحنا عميل البريد الإلكتروني مع ردودك | We opened your email client with your responses. You can also just close it — we stored your answers.';
  }

  function wire() {
    qsa('.option').forEach(o => o.addEventListener('click', () => selectOption(o)));
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    // Enable Next for contact step once required fields filled
    qsa('#fullName, #email, #organization').forEach(i => {
      i.addEventListener('input', () => {
        if (current === totalQuestions) {
          const ok = qs('#fullName').value && qs('#email').value && qs('#organization').value;
          nextBtn.disabled = !ok;
        }
      });
    });

    // Next becomes enabled when an option is chosen
    qsa('.options-grid').forEach(grid => {
      grid.addEventListener('click', () => {
        if (current !== totalQuestions) nextBtn.disabled = false;
      });
    });

    // Direction toggle (LTR/RTL)
    langToggle.addEventListener('click', () => {
      const isLTR = document.documentElement.dir !== 'rtl';
      document.documentElement.dir = isLTR ? 'rtl' : 'ltr';
      document.body.style.direction = isLTR ? 'rtl' : 'ltr';
      langToggle.textContent = isLTR ? 'RTL' : 'LTR';
      langToggle.setAttribute('aria-pressed', String(isLTR));
    });

    year.textContent = new Date().getFullYear();
    updateProgress();
  }

  document.addEventListener('DOMContentLoaded', wire);
})();
