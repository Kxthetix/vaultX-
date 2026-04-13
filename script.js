/* ===================================
   VAULTX – Main JavaScript
   =================================== */

'use strict';

// ─── NAVBAR SCROLL EFFECT ───────────────────────────────────────
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// ─── HAMBURGER MENU ─────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const isOpen = navLinks.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  // Animate hamburger → X
  const spans = hamburger.querySelectorAll('span');
  if (isOpen) {
    spans[0].style.cssText = 'transform: rotate(45deg) translate(5px, 5px)';
    spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
    spans[2].style.cssText = 'transform: rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => s.style.cssText = '');
  }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
  });
});

// ─── SMOOTH SCROLL (active link highlight) ──────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

function updateActiveNav() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navAnchors.forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === `#${current}`) {
      a.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });

// ─── SCROLL ANIMATIONS (AOS-lite) ───────────────────────────────
const animatedEls = document.querySelectorAll('[data-aos]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

animatedEls.forEach(el => observer.observe(el));

// ─── STAT NUMBER COUNTER ANIMATION ──────────────────────────────
const statNums = document.querySelectorAll('.stat-num');
let statsAnimated = false;

function animateStats() {
  if (statsAnimated) return;
  const heroBottom = document.querySelector('.hero').getBoundingClientRect().bottom;
  if (heroBottom < window.innerHeight + 100) {
    statsAnimated = true;
    statNums.forEach(el => {
      const text = el.textContent.trim();
      const numMatch = text.match(/[\d.]+/);
      if (!numMatch) return;
      const target = parseFloat(numMatch[0]);
      const suffix = text.replace(numMatch[0], '');
      const isDecimal = text.includes('.');
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const value = target * ease;
        el.textContent = (isDecimal ? value.toFixed(1) : Math.floor(value)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = text;
      }
      requestAnimationFrame(tick);
    });
  }
}
window.addEventListener('scroll', animateStats, { passive: true });

// ─── CLIENT STORAGE ─────────────────────────────────────────────
const STORAGE_KEY = 'vaultx_clients';

function getClients() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveClient(data) {
  const clients = getClients();
  clients.push({ ...data, id: Date.now(), submittedAt: new Date().toLocaleString('en-IN') });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

// ─── CONTACT FORM HANDLER ────────────────────────────────────────
const clientForm = document.getElementById('clientForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

function validateField(field) {
  const group = field.closest('.form-group');
  const existingErr = group.querySelector('.error-msg');
  if (existingErr) existingErr.remove();
  field.classList.remove('error');

  if (!field.value.trim()) {
    field.classList.add('error');
    const err = document.createElement('span');
    err.className = 'error-msg';
    err.textContent = 'This field is required.';
    group.appendChild(err);
    return false;
  }

  if (field.type === 'email') {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(field.value.trim())) {
      field.classList.add('error');
      const err = document.createElement('span');
      err.className = 'error-msg';
      err.textContent = 'Please enter a valid email.';
      group.appendChild(err);
      return false;
    }
  }

  if (field.type === 'tel') {
    const phoneRe = /^[\d\s\+\-\(\)]{7,15}$/;
    if (!phoneRe.test(field.value.trim())) {
      field.classList.add('error');
      const err = document.createElement('span');
      err.className = 'error-msg';
      err.textContent = 'Enter a valid phone number.';
      group.appendChild(err);
      return false;
    }
  }
  return true;
}

// Live validation
['fname', 'lname', 'email', 'phone', 'company'].forEach(id => {
  const field = document.getElementById(id);
  if (field) {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
    });
  }
});

clientForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Validate required fields
  const requiredFields = ['fname', 'lname', 'email', 'phone', 'company'];
  let valid = true;
  requiredFields.forEach(id => {
    const field = document.getElementById(id);
    if (!validateField(field)) valid = false;
  });
  if (!valid) return;

  // Gather data
  const services = [...document.querySelectorAll('input[name="services"]:checked')]
    .map(cb => cb.value).join(', ') || 'Not specified';

  const formData = {
    name: `${document.getElementById('fname').value.trim()} ${document.getElementById('lname').value.trim()}`,
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    company: document.getElementById('company').value.trim(),
    size: document.getElementById('size').value || 'Not specified',
    budget: document.getElementById('budget').value || 'Not specified',
    services,
    message: document.getElementById('message').value.trim() || 'None',
  };

  // Show loading
  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Submitting…';

  // Simulate async submission
  setTimeout(() => {
    saveClient(formData);
    clientForm.style.display = 'none';
    formSuccess.classList.add('visible');
  }, 1200);
});

// ─── ADMIN PANEL ─────────────────────────────────────────────────
const adminModal = document.getElementById('adminModal');
const modalClose = document.getElementById('modalClose');
const clientList = document.getElementById('clientList');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const adminTrigger = document.getElementById('adminTrigger');

let clickCount = 0;
let clickTimer = null;

// Triple-click on hidden bottom-right corner
adminTrigger.addEventListener('click', () => {
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => { clickCount = 0; }, 600);
  if (clickCount >= 3) {
    clickCount = 0;
    openAdminPanel();
  }
});

function renderClients() {
  const clients = getClients();
  if (!clients.length) {
    clientList.innerHTML = '<p class="no-clients">No client submissions yet.</p>';
    return;
  }
  clientList.innerHTML = clients.reverse().map(c => `
    <div class="client-entry">
      <div class="client-entry-name">👤 ${escapeHtml(c.name)} — ${escapeHtml(c.company)}</div>
      <div class="client-entry-detail">
        <span>📧 ${escapeHtml(c.email)}</span>
        <span>📞 ${escapeHtml(c.phone)}</span>
        <span>👥 ${escapeHtml(c.size)}</span>
        <span>💰 ${escapeHtml(c.budget)}</span>
        <span>🛡️ ${escapeHtml(c.services)}</span>
        <span>🕒 ${escapeHtml(c.submittedAt)}</span>
      </div>
      ${c.message !== 'None' ? `<div style="margin-top:0.5rem;font-size:0.82rem;color:var(--text-sub);background:var(--bg3);padding:0.5rem 0.75rem;border-radius:6px;border:1px solid var(--border);">💬 ${escapeHtml(c.message)}</div>` : ''}
    </div>
  `).join('');
}

function openAdminPanel() {
  renderClients();
  adminModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdminPanel() {
  adminModal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeAdminPanel);
adminModal.addEventListener('click', (e) => {
  if (e.target === adminModal) closeAdminPanel();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAdminPanel();
});

// Export CSV
exportBtn.addEventListener('click', () => {
  const clients = getClients();
  if (!clients.length) { alert('No clients to export.'); return; }

  const headers = ['Name', 'Email', 'Phone', 'Company', 'Size', 'Budget', 'Services', 'Message', 'Submitted At'];
  const rows = clients.map(c => [
    c.name, c.email, c.phone, c.company,
    c.size, c.budget, c.services, c.message, c.submittedAt
  ].map(v => `"${String(v).replace(/"/g, '""')}"`));

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vaultx_clients_${Date.now()}.csv`;
  link.click();
});

// Clear all
clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all client data? This cannot be undone.')) {
    localStorage.removeItem(STORAGE_KEY);
    renderClients();
  }
});

// ─── UTILITIES ───────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── ACTIVE NAV LINK STYLE ───────────────────────────────────────
const style = document.createElement('style');
style.textContent = `.nav-links a.active { color: var(--text); background: rgba(138,101,255,0.1); }`;
document.head.appendChild(style);

// ─── INIT ────────────────────────────────────────────────────────
console.log('%cVaultX Security System Active 🔒', 'color: #8a65ff; font-weight: bold; font-size: 14px;');
