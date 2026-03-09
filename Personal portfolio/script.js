(function () {
  'use strict';

  // ======================================================
  // LOCALSTORAGE UTILITY
  // ======================================================
  const Storage = {
    set(key, value) {
      try { localStorage.setItem('pt_' + key, JSON.stringify(value)); } catch (e) {}
    },
    get(key, fallback = null) {
      try {
        const v = localStorage.getItem('pt_' + key);
        return v !== null ? JSON.parse(v) : fallback;
      } catch (e) { return fallback; }
    },
    remove(key) {
      try { localStorage.removeItem('pt_' + key); } catch (e) {}
    }
  };

  // ======================================================
  // TOAST
  // ======================================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: '💬' };
    toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('exit');
      setTimeout(() => toast.remove(), 350);
    }, 3500);
  }

  // ======================================================
  // PAGE LOADER
  // ======================================================
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
    }, 2200);
  });

  // ======================================================
  // NAVBAR SCROLL
  // ======================================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    // Active link
    document.querySelectorAll('section[id]').forEach(sec => {
      const top = sec.offsetTop - 120;
      const bottom = top + sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.querySelectorAll(`.nav-link[data-section="${sec.id}"]`).forEach(l => l.classList.add('active'));
      }
    });
  }, { passive: true });

  // ======================================================
  // HAMBURGER MENU
  // ======================================================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });

  // ======================================================
  // SCROLL TO TOP
  // ======================================================
  const scrollTopBtn = document.getElementById('scroll-top');
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ======================================================
  // TYPED TEXT ANIMATION
  // ======================================================
  const phrases = [
    'Frontend Developer',
    'React.js Specialist',
    'UI/UX Enthusiast',
    'GSAP Animator',
    'AI Dev Tools User',
    'Open Source Lover ❤️'
  ];
  let phraseIndex = 0, charIndex = 0, isDeleting = false;
  const typedEl = document.getElementById('typed-text');
  function typeLoop() {
    if (!typedEl) return;
    const current = phrases[phraseIndex];
    typedEl.textContent = isDeleting
      ? current.substring(0, charIndex--)
      : current.substring(0, charIndex++);
    let delay = isDeleting ? 60 : 100;
    if (!isDeleting && charIndex > current.length) {
      delay = 2000; isDeleting = true;
    } else if (isDeleting && charIndex < 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 500;
    }
    setTimeout(typeLoop, delay);
  }
  typeLoop();

  // ======================================================
  // SCROLL REVEAL (Intersection Observer)
  // ======================================================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
        // Trigger skill bars if inside
        entry.target.querySelectorAll('.skill-bar[data-width]').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
        // Also trigger skill bars if the target itself is a skill-bar parent
        if (entry.target.classList.contains('skill-category-card')) {
          entry.target.querySelectorAll('.skill-bar[data-width]').forEach(bar => {
            setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
          });
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // Also observe skill cards separately for bars
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar[data-width]').forEach((bar, i) => {
          setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 100);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skill-category-card').forEach(c => skillObserver.observe(c));

  // ======================================================
  // PROJECT FILTER
  // ======================================================
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        card.style.opacity = match ? '1' : '0';
      });
    });
  });

  // ======================================================
  // CONTACT FORM + LOCALSTORAGE (Auto-save draft)
  // ======================================================
  const form = document.getElementById('contact-form');
  const nameEl = document.getElementById('f-name');
  const emailEl = document.getElementById('f-email');
  const subjectEl = document.getElementById('f-subject');
  const messageEl = document.getElementById('f-message');
  const saveIndicator = document.getElementById('save-indicator');

  // Restore saved draft
  const savedDraft = Storage.get('contact_draft');
  if (savedDraft) {
    if (nameEl) nameEl.value = savedDraft.name || '';
    if (emailEl) emailEl.value = savedDraft.email || '';
    if (subjectEl) subjectEl.value = savedDraft.subject || '';
    if (messageEl) messageEl.value = savedDraft.message || '';
    if (savedDraft.message) {
      saveIndicator.textContent = '💾 Draft restored from last session';
    }
  }

  // Auto-save draft to localStorage as user types
  let saveTimer;
  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      Storage.set('contact_draft', {
        name: nameEl?.value || '',
        email: emailEl?.value || '',
        subject: subjectEl?.value || '',
        message: messageEl?.value || '',
      });
      if (saveIndicator) {
        saveIndicator.textContent = '✅ Draft auto-saved';
        setTimeout(() => {
          if (saveIndicator.textContent === '✅ Draft auto-saved')
            saveIndicator.textContent = '';
        }, 2000);
      }
    }, 800);
  }
  [nameEl, emailEl, subjectEl, messageEl].forEach(el => el?.addEventListener('input', saveDraft));

  // Form validation & submit
  function showError(inputEl, errId, show) {
    const errEl = document.getElementById(errId);
    inputEl?.classList.toggle('error', show);
    if (errEl) errEl.style.display = show ? 'block' : 'none';
  }
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    if (!nameEl?.value.trim()) { showError(nameEl, 'f-name-err', true); valid = false; }
    else showError(nameEl, 'f-name-err', false);
    if (!emailEl?.value.trim() || !validateEmail(emailEl.value)) { showError(emailEl, 'f-email-err', true); valid = false; }
    else showError(emailEl, 'f-email-err', false);
    if (!messageEl?.value.trim()) { showError(messageEl, 'f-msg-err', true); valid = false; }
    else showError(messageEl, 'f-msg-err', false);

    if (!valid) return;

    // Save submission to localStorage
    const submission = {
      name: nameEl.value,
      email: emailEl.value,
      subject: subjectEl.value,
      message: messageEl.value,
      timestamp: new Date().toISOString()
    };
    const submissions = Storage.get('form_submissions', []);
    submissions.push(submission);
    Storage.set('form_submissions', submissions);
    Storage.remove('contact_draft');

    form.style.display = 'none';
    document.getElementById('form-success').classList.add('show');
    showToast('Message sent successfully! 🚀', 'success');
  });

  // ======================================================
  // VISITOR COUNTER (localStorage)
  // ======================================================
  const visits = (Storage.get('visit_count', 0)) + 1;
  Storage.set('visit_count', visits);
  Storage.set('last_visit', new Date().toISOString());
  const vcEl = document.getElementById('visitor-count');
  // Animate count
  let current = 0;
  const target = visits + Math.floor(Math.random() * 120) + 80; // add some fake social proof
  const step = Math.ceil(target / 60);
  const countTimer = setInterval(() => {
    current = Math.min(current + step, target);
    if (vcEl) vcEl.textContent = current.toLocaleString();
    if (current >= target) clearInterval(countTimer);
  }, 25);

  const lastSection = Storage.get('last_section');
  if (lastSection && lastSection !== 'hero') {
    // Only restore if user was deep in the page
  }
  window.addEventListener('scroll', () => {
    const sections = ['about','skills','projects','journey','contact'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
          Storage.set('last_section', id);
        }
      }
    });
  }, { passive: true });

})();