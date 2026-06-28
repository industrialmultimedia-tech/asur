// ── FIREBASE INIT ──
const firebaseConfig = {
  apiKey: "AIzaSyA6-SWXI2CcXAM296NsXK4zU2NieMUCzs4",
  authDomain: "multimediaindustrial-31322.firebaseapp.com",
  databaseURL: "https://multimediaindustrial-31322-default-rtdb.firebaseio.com",
  projectId: "multimediaindustrial-31322",
  storageBucket: "multimediaindustrial-31322.firebasestorage.app",
  messagingSenderId: "1066132385021",
  appId: "1:1066132385021:web:52b73339874079d4d82294"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ── NAV SCROLL ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => observer.observe(el));

// ── NEWSLETTER ──
async function handleNewsletter() {
  const emailInput = document.getElementById('nl-email');
  const nombreInput = document.getElementById('nl-nombre');
  const btn = document.getElementById('nl-submit');

  const email = emailInput.value.trim();
  const nombre = nombreInput.value.trim();

  // Validación
  emailInput.style.borderColor = '';
  if (!email || !email.includes('@')) {
    emailInput.style.borderColor = 'rgba(237, 111, 241, 0.6)';
    emailInput.focus();
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Guardando...';

  try {
    await db.ref('suscriptores').push({
      nombre: nombre || '—',
      email: email,
      fecha: new Date().toISOString(),
      origen: 'landing'
    });

    // Mostrar estado de éxito
    document.getElementById('newsletter-form').style.display = 'none';
    document.getElementById('form-success').style.display = 'block';
  } catch (err) {
    console.error('Firebase error:', err);
    btn.disabled = false;
    btn.textContent = 'Suscribirme a la newsletter';
    emailInput.style.borderColor = 'rgba(237, 111, 241, 0.6)';
    
    // Mostrar error inline sin romper UI
    const note = document.querySelector('.form-note');
    note.textContent = 'Hubo un error. Por favor intentá de nuevo.';
    note.style.color = 'rgba(237, 111, 241, 0.8)';
  }
}

// ── DONACIONES ──
let selectedAmount = null;

document.querySelectorAll('.amount-pill').forEach(pill => {
  pill.addEventListener('click', function () {
    document.querySelectorAll('.amount-pill').forEach(p => {
      p.style.color = '';
      p.style.background = '';
      p.style.borderColor = '';
    });
    this.style.color = 'rgba(236, 233, 228, 0.9)';
    this.style.background = 'rgba(236, 233, 228, 0.18)';
    this.style.borderColor = 'rgba(236, 233, 228, 0.28)';
    selectedAmount = this.dataset.amount;
    document.getElementById('donate-feedback').textContent = '';
  });
});

async function handleDonar() {
  const btn = document.getElementById('btn-donar');
  const feedback = document.getElementById('donate-feedback');

  if (!selectedAmount) {
    feedback.textContent = 'Seleccioná un monto primero.';
    feedback.style.color = 'rgba(237, 111, 241, 0.75)';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Procesando...';
  feedback.textContent = '';

  try {
    await db.ref('donaciones').push({
      monto: selectedAmount === 'otro' ? 'personalizado' : `$${selectedAmount}`,
      montoValor: selectedAmount,
      fecha: new Date().toISOString(),
      estado: 'intento',
      origen: 'landing'
    });

    btn.textContent = '✦ ¡Gracias!';
    feedback.textContent = 'Tu intención de donación fue registrada. Pronto te contactaremos.';
    feedback.style.color = 'rgba(236, 233, 228, 0.65)';

    // Reset después de 4 segundos
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '✦ &nbsp;Donar de nuevo';
      feedback.textContent = '';
      selectedAmount = null;
      document.querySelectorAll('.amount-pill').forEach(p => {
        p.style.color = '';
        p.style.background = '';
        p.style.borderColor = '';
      });
    }, 4000);

  } catch (err) {
    console.error('Firebase error:', err);
    btn.disabled = false;
    btn.innerHTML = '✦ &nbsp;Donar ahora';
    feedback.textContent = 'Hubo un error. Por favor intentá de nuevo.';
    feedback.style.color = 'rgba(237, 111, 241, 0.75)';
  }
}