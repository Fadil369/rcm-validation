(() => {
  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const totalQuestions = 6;
  let current = 1;
  let score = 0;
  const answers = {};

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

    const delta = qualify === 'high' ? 3 : qualify === 'medium' ? 2 : 1;
    // Adjust score on change
    if (answers[`q${n}`]?.delta) score -= answers[`q${n}`].delta;
    score += delta;

    answers[`q${n}`] = { value, qualify, text, sar, delta };

    nextBtn.disabled = false;
  }

  function next() {
    if (current === totalQuestions) {
      // Validate contact
      const name = qs('#fullName').value.trim();
      const email = qs('#email').value.trim();
      const org = qs('#organization').value.trim();
      if (!name || !email || !org) {
        alert('Please fill in Name, Work Email, and Organization.');
        return;
      }
      answers.contact = {
        name,
        email,
        organization: org,
        phone: qs('#phone').value.trim(),
        location: qs('#location').value.trim()
      };
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
    progressText.textContent = `Completed`;

    let text, cls;
    if (score >= 12) {
      text = '🎯 Highly Qualified — perfect fit for our research.';
      cls = 'ok';
    } else if (score >= 8) {
      text = '✅ Qualified — great candidate for our study.';
      cls = 'ok';
    } else {
      text = '📋 Thank you for your interest — we appreciate your input.';
      cls = 'not';
    }
    badge.classList.remove('ok', 'not');
    badge.classList.add(cls);
    badge.textContent = text;

    const sarVal = answers.q4?.sar ? SAR.format(answers.q4.sar) : 'N/A';
    badgeText.textContent = `Your indicated monthly loss: ${sarVal}. We’ll reach out with tailored insights.`;

    // Calendly link placeholder
    bookLink.href = window.APP_CONFIG?.CALENDLY_URL || '#';

    submitBtn.addEventListener('click', submitSurvey);
  }

  function submitSurvey() {
    const name = answers.contact?.name || 'Anonymous';
    const body = [
      `RCM Survey Response from ${name}`,
      `Organization: ${answers.contact?.organization || ''}`,
      `Email: ${answers.contact?.email || ''}`,
      `Phone: ${answers.contact?.phone || 'Not provided'}`,
      `Location: ${answers.contact?.location || 'Not provided'}`,
      '',
      'Responses:',
      `1. Role: ${answers.q1?.text || 'Not answered'}`,
      `2. Org Size: ${answers.q2?.text || 'Not answered'}`,
      `3. Biggest Challenge: ${answers.q3?.text || 'Not answered'}`,
      `4. Financial Impact: ${answers.q4?.text || 'Not answered'}`,
      `5. Technology Adoption: ${answers.q5?.text || 'Not answered'}`,
      `Qualification Score: ${score}/15`,
      `Generated on: ${new Date().toLocaleString('en-SA')}`
    ].join('\n');

    // Send to our API
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, score })
    }).catch(() => {/* non-blocking */});

    const mailto = `mailto:${(window.APP_CONFIG?.SUBMIT_EMAIL)||'dr.mf.12298@gmail.com'}?subject=RCM Survey Response - ${encodeURIComponent(name)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    qs('#submitNote').textContent = 'We opened your email client with your responses. You can also just close it — we stored your answers.';
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
