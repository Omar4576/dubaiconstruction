// ── BNAIQ App JS ──
// NOTE: In production, replace localStorage with real backend API calls.
// Passwords here are hashed client-side for demo. Real auth = server-side bcrypt.

// ── Simple hash for demo (in production use bcrypt on server) ──
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'bnaiq_salt_2025');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Mock Company Data ──
const COMPANIES = [
  {
    id: 'c1',
    name: 'Al Fardan Construction LLC',
    category: 'commercial',
    emoji: '🏢',
    location: 'Dubai Marina',
    projects: 47,
    rating: 4.9,
    reviewCount: 124,
    founded: 2008,
    verified: true,
    specialties: ['High-Rise', 'Commercial', 'Mixed-Use'],
    description: 'Premium commercial construction with 15+ years across Dubai and Abu Dhabi.',
    license: 'DM-CON-2008-447'
  },
  {
    id: 'c2',
    name: 'GoldenBuild Renovations',
    category: 'renovation',
    emoji: '🔨',
    location: 'Business Bay',
    projects: 312,
    rating: 4.8,
    reviewCount: 88,
    founded: 2014,
    verified: true,
    specialties: ['Renovation', 'Fit-Out', 'Interior'],
    description: 'End-to-end renovation specialists for residential and commercial spaces.',
    license: 'DM-REN-2014-891'
  },
  {
    id: 'c3',
    name: 'Nakheel Infrastructure Partners',
    category: 'infrastructure',
    emoji: '🌉',
    location: 'Deira',
    projects: 28,
    rating: 5.0,
    reviewCount: 41,
    founded: 2006,
    verified: true,
    specialties: ['Infrastructure', 'Roads', 'Civil'],
    description: 'Large-scale civil and infrastructure works across Dubai emirate.',
    license: 'DM-INF-2006-112'
  },
  {
    id: 'c4',
    name: 'Skyline Villas & Homes',
    category: 'residential',
    emoji: '🏠',
    location: 'Palm Jumeirah',
    projects: 89,
    rating: 4.7,
    reviewCount: 203,
    founded: 2011,
    verified: true,
    specialties: ['Villas', 'Townhouses', 'Residential'],
    description: 'Luxury residential construction specializing in bespoke villas and townhouses.',
    license: 'DM-RES-2011-334'
  },
  {
    id: 'c5',
    name: 'Element Interiors Dubai',
    category: 'interior',
    emoji: '🛋️',
    location: 'DIFC',
    projects: 156,
    rating: 4.6,
    reviewCount: 317,
    founded: 2016,
    verified: true,
    specialties: ['Interior Design', 'Fit-Out', 'FF&E'],
    description: 'Award-winning interior fit-out and FF&E procurement for premium projects.',
    license: 'DM-INT-2016-779'
  },
  {
    id: 'c6',
    name: 'Axis MEP Engineering',
    category: 'commercial',
    emoji: '⚙️',
    location: 'JLT',
    projects: 71,
    rating: 4.8,
    reviewCount: 96,
    founded: 2010,
    verified: true,
    specialties: ['MEP', 'HVAC', 'Electrical'],
    description: 'Mechanical, electrical, and plumbing specialists for commercial and industrial.',
    license: 'DM-MEP-2010-556'
  }
];

let activeFilter = 'all';

// ── Render Company Cards ──
function renderCompanies(companies) {
  const grid = document.getElementById('companiesGrid');
  if (!grid) return;

  grid.innerHTML = companies.map(c => `
    <a class="company-card" href="company-profile.html?id=${c.id}" onclick="saveCompany('${c.id}')">
      <div class="company-card-thumb">
        <span style="font-size:56px;">${c.emoji}</span>
        ${c.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
        <span class="proj-count">${c.projects} projects</span>
      </div>
      <div class="company-card-body">
        <div class="company-name">${c.name}</div>
        <div class="company-meta">
          <span class="company-tag">📍 ${c.location}</span>
          <span class="company-tag">📅 Est. ${c.founded}</span>
          <span class="company-tag">🪪 ${c.license}</span>
        </div>
        <div class="specialties" style="margin-top:12px;">
          ${c.specialties.map(s => `<span class="spec-pill">${s}</span>`).join('')}
        </div>
      </div>
      <div class="company-card-footer">
        <div class="rating">
          <span class="star">★</span> ${c.rating} <span style="color:var(--text-muted); font-weight:400;">(${c.reviewCount})</span>
        </div>
        <span style="font-size:13px; color:var(--gold); font-weight:600;">View Profile →</span>
      </div>
    </a>
  `).join('');
}

function filterCompanies() {
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let filtered = COMPANIES;

  if (activeFilter !== 'all') {
    filtered = filtered.filter(c => c.category === activeFilter);
  }

  if (query) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.specialties.some(s => s.toLowerCase().includes(query)) ||
      c.location.toLowerCase().includes(query) ||
      c.category.includes(query)
    );
  }

  renderCompanies(filtered);
}

function setFilter(filter, el) {
  activeFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  filterCompanies();
}

function saveCompany(id) {
  sessionStorage.setItem('viewingCompany', id);
}

// ── Tab Switching ──
function switchTab(tab, el) {
  document.querySelectorAll('.hiw-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.hiw-steps').forEach(s => s.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
}

// ── Auth Modal ──
function openModal(mode) {
  const overlay = document.getElementById('authModal');
  overlay.classList.add('open');
  if (mode === 'login') switchAuthTab('login');
  else switchAuthTab('signup');
}

function closeModal() {
  document.getElementById('authModal').classList.remove('open');
}

document.getElementById('authModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

function switchAuthTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  if (tab === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
}

// ── Validation Helpers ──
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}

// ── Password Strength ──
function checkPasswordStrength(pass) {
  const bar = document.getElementById('strengthBar');
  if (!bar) return;
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  const widths = ['0%', '25%', '50%', '75%', '100%'];
  const colors = ['transparent', '#E05252', '#E8C97A', '#C9A84C', '#52C07A'];
  bar.style.width = widths[score];
  bar.style.background = colors[score];
}

// ── Login ──
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) return showError('loginError', 'Please fill in all fields.');
  if (!validateEmail(email)) return showError('loginError', 'Invalid email address.');

  // Get stored users
  const users = JSON.parse(localStorage.getItem('bnaiq_users') || '[]');
  const hashed = await hashPassword(password);
  const user = users.find(u => u.email === email && u.passwordHash === hashed);

  if (!user) return showError('loginError', 'Invalid email or password.');

  // Create session
  const session = { userId: user.id, email: user.email, name: user.firstName, type: user.type, loginAt: Date.now() };
  sessionStorage.setItem('bnaiq_session', JSON.stringify(session));

  // Redirect to dashboard
  closeModal();
  window.location.href = 'dashboard.html';
}

// ── Signup ──
async function handleSignup() {
  const type = document.getElementById('accountType').value;
  const first = document.getElementById('signupFirst').value.trim();
  const last = document.getElementById('signupLast').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPass').value;
  const passConfirm = document.getElementById('signupPassConfirm').value;

  if (!first || !last || !email || !pass || !passConfirm) return showError('signupError', 'Please fill in all fields.');
  if (!validateEmail(email)) return showError('signupError', 'Invalid email address.');
  if (pass.length < 8) return showError('signupError', 'Password must be at least 8 characters.');
  if (pass !== passConfirm) return showError('signupError', 'Passwords do not match.');

  const users = JSON.parse(localStorage.getItem('bnaiq_users') || '[]');
  if (users.find(u => u.email === email)) return showError('signupError', 'An account with this email already exists.');

  const hashed = await hashPassword(pass);
  const newUser = {
    id: 'u_' + Date.now(),
    type,
    firstName: first,
    lastName: last,
    email,
    passwordHash: hashed,
    createdAt: new Date().toISOString(),
    verified: false
  };

  users.push(newUser);
  localStorage.setItem('bnaiq_users', JSON.stringify(users));

  // Auto-login
  const session = { userId: newUser.id, email, name: first, type, loginAt: Date.now() };
  sessionStorage.setItem('bnaiq_session', JSON.stringify(session));

  showSuccess('signupSuccess', '✓ Account created! Redirecting to your dashboard...');

  setTimeout(() => {
    closeModal();
    window.location.href = 'dashboard.html';
  }, 1500);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  renderCompanies(COMPANIES);

  // Check session — update nav if logged in
  const session = sessionStorage.getItem('bnaiq_session');
  if (session) {
    const s = JSON.parse(session);
    const cta = document.querySelector('.nav-cta');
    if (cta) {
      cta.innerHTML = `
        <span style="font-size:13px; color:var(--text-muted);">Hi, ${s.name}</span>
        <a href="dashboard.html" class="btn btn-gold">Dashboard</a>
      `;
    }
  }
});