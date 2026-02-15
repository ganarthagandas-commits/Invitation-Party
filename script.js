const envelope = document.getElementById("envelope");
const envelopeScreen = document.getElementById("envelope-screen");
const invitation = document.getElementById("invitation");

const canvas = document.getElementById("confetti");
const ctx = canvas ? canvas.getContext("2d") : null;

function resizeCanvas() { if (!canvas) return; canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let confetti = [];
let animationId;

function createConfetti() {
  if (!canvas) return;
  confetti = [];
  const originX = canvas.width / 2;
  const originY = canvas.height + 12; // slightly below screen
  const colors = ['#d4af37', '#fff7e6', '#b78f2a', '#222222'];
  const count = 260; // more particles for bigger explosion

  for (let i = 0; i < count; i++) {
    // wide upward spread: -PI..0 (upwards semicircle) with jitter
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
    const speed = 6 + Math.random() * 12; // faster initial speed
    const vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 2;
    const vy = Math.sin(angle) * speed + (Math.random() - 0.5) * 1.5;
    confetti.push({
      x: originX + (Math.random() - 0.5) * 160,
      y: originY + Math.random() * 30,
      vx: vx,
      vy: vy,
      gravity: 0.14 + Math.random() * 0.16,
      drag: 0.993,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      size: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      ttl: 110 + Math.floor(Math.random() * 140)
    });
  }
}

function drawConfetti() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let anyAlive = false;

  for (let i = 0; i < confetti.length; i++) {
    const c = confetti[i];

    // update physics
    c.vx *= c.drag || 0.995;
    c.vy += c.gravity;
    c.x += c.vx;
    c.y += c.vy;
    c.rot += c.rotSpeed || 0;
    c.life++;

    // alpha fades toward end of life
    const alpha = Math.max(0, 1 - c.life / c.ttl);

    // draw rotated rectangle
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(c.x, c.y);
    ctx.rotate((c.rot * Math.PI) / 180);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
    ctx.restore();

    if (c.life < c.ttl && c.y < canvas.height + 200) anyAlive = true;
  }

  if (anyAlive) {
    animationId = requestAnimationFrame(drawConfetti);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti = [];
    animationId = null;
  }
}

function startConfetti() { if (!canvas) return; if (animationId) cancelAnimationFrame(animationId); createConfetti(); drawConfetti(); }

function openInvitation() {
  if (invitation) {
    invitation.classList.remove('hidden');
    try { history.replaceState({}, '', '#invitation'); } catch (e) { location.hash = 'invitation'; }
    invitation.scrollIntoView({ behavior: 'auto', block: 'start' });
    if (envelopeScreen && envelopeScreen.parentNode) { envelopeScreen.parentNode.removeChild(envelopeScreen); }
    window.scrollTo(0, 0);
  }

  startConfetti();
}

if (envelope) { envelope.addEventListener('click', openInvitation); }

if (envelopeScreen) {
  envelopeScreen.addEventListener('click', (e) => {
    if (e.target.id === 'confetti') return;
    openInvitation();
  });
}
