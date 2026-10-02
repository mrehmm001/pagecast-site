// Hero sequence, video behaviour, and the early-access form.
//
// To collect addresses, put a form endpoint (Formspree, Buttondown, your own
// handler) in the data-endpoint attribute of each <form class="signup">, and
// your contact address in data-contact. Until an endpoint is set the form says
// so plainly rather than pretending to have saved anything.

const calm = matchMedia('(prefers-reduced-motion: reduce)');
const sheet = document.getElementById('sheet');
const screen = document.getElementById('screen');
const hero = document.getElementById('heroVideo');
const soundBtn = document.getElementById('soundBtn');

// The one piece of motion on the page: the mock article loses its furniture,
// then the video it became fades up. Anyone who asked for less motion gets the
// finished state immediately.
function runHero() {
  if (!sheet || !screen) return;
  if (calm.matches) {
    sheet.classList.add('cut', 'done');
    screen.classList.add('in');
    return;
  }
  setTimeout(() => sheet.classList.add('cut'), 700);
  setTimeout(() => sheet.classList.add('done'), 1500);
  setTimeout(() => screen.classList.add('in'), 1650);
}

if (document.readyState === 'complete') runHero();
else addEventListener('load', runHero);

if (hero) {
  if (calm.matches) hero.controls = true;
  else hero.play().catch(() => { hero.controls = true; });

  soundBtn?.addEventListener('click', () => {
    const turningOn = hero.muted;
    hero.muted = !turningOn;
    soundBtn.setAttribute('aria-pressed', String(turningOn));
    soundBtn.textContent = turningOn ? 'Mute' : 'Sound on';
    if (turningOn) {
      hero.currentTime = 0;
      hero.loop = false;
      hero.controls = true;
      hero.play().catch(() => {});
    }
  });

  hero.addEventListener('ended', () => {
    hero.muted = true;
    hero.loop = true;
    soundBtn?.setAttribute('aria-pressed', 'false');
    if (soundBtn) soundBtn.textContent = 'Sound on';
  });
}

// Only one soundtrack at a time.
const videos = [...document.querySelectorAll('video')];
for (const v of videos) {
  v.addEventListener('play', () => {
    for (const other of videos) {
      if (other !== v && !other.paused && !other.muted) other.pause();
    }
    if (v !== hero && hero && !hero.muted) hero.pause();
  });
}

// Silent loops play only while they're on screen, so nothing burns battery below the fold.
if ('IntersectionObserver' in window && !calm.matches) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (!v.loop || !v.muted) continue;
      if (e.isIntersecting) v.play().catch(() => {});
      else if (!v.paused) v.pause();
    }
  }, { threshold: 0.2 });
  for (const v of videos) if (v.loop) io.observe(v);
}

// Voice samples: one plays at a time, and pressing it again stops it.
let voicePlaying = null;
function stopVoice() {
  if (!voicePlaying) return;
  voicePlaying.audio.pause();
  voicePlaying.button.setAttribute('aria-pressed', 'false');
  voicePlaying = null;
}
for (const button of document.querySelectorAll('.voice')) {
  button.addEventListener('click', () => {
    const again = voicePlaying?.button === button;
    stopVoice();
    if (again) return;
    for (const v of videos) if (!v.paused && !v.muted) v.pause();
    const audio = new Audio(button.dataset.src);
    voicePlaying = { audio, button };
    button.setAttribute('aria-pressed', 'true');
    audio.addEventListener('ended', stopVoice);
    audio.addEventListener('error', stopVoice);
    audio.play().catch(stopVoice);
  });
}
for (const v of videos) v.addEventListener('play', () => { if (!v.muted) stopVoice(); });

for (const form of document.querySelectorAll('.signup')) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = form.querySelector('.note');
    const input = form.querySelector('input');
    const endpoint = form.dataset.endpoint;
    const contact = form.dataset.contact;
    note.classList.remove('ok', 'error');

    if (!endpoint) {
      note.textContent = contact
        ? `The list isn’t connected yet — email ${contact} and we’ll add you by hand.`
        : 'The list isn’t connected yet. Nothing was saved.';
      note.classList.add('error');
      return;
    }
    const btn = form.querySelector('button');
    btn.disabled = true;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: input.value }),
      });
      if (!res.ok) throw new Error(res.status);
      note.textContent = 'You’re on the list. We’ll email once, when there’s something to install.';
      note.classList.add('ok');
      input.value = '';
    } catch {
      note.textContent = contact ? `That didn’t send. Try again, or email ${contact}.` : 'That didn’t send. Try again in a moment.';
      note.classList.add('error');
    } finally {
      btn.disabled = false;
    }
  });
}
