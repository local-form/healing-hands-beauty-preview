(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CROWN = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 18.5 4.6 8l4.6 4.4L12 5l2.8 7.4L19.4 8 21 18.5z"/></svg>';

  /* ---------- the salon's own menu (Square booking page, checked 2026-11-09) ---------- */
  const S = {
    blowout: { name: 'Royal Dominican Blowout', time: '1 hr 15 min+', price: 'Price varies, call', mins: 75,
      why: 'Their house specialty: clarifying wash, specialized conditioning and a meticulous blow-dry for body, movement and shine. Made for all hair types, especially natural and curly.',
      bring: ['Your hair as it is. It starts with a clarifying wash.', 'Want it bone-straight? Ask to add the flat iron: it isn’t included in the blowout.'] },
    crownset: { name: 'The Dominican Crown Set', time: '1 hr+', price: 'Price varies, call', mins: 60,
      why: 'The classic: wash, roller set and the hooded dryer, then a blow-dry finish. For relaxed, processed or soft-curl hair that doesn’t need extra heat.',
      bring: ['Your hair as it is. The wash is included.', 'No flat iron is included, which is the point: less heat on your hair.'] },
    curlrepair: { name: 'The Crown Curl Repair', time: 'Ask for time', price: '$95 introductory', mins: 120,
      why: 'Brings moisture, softness, strength and definition back to dry, stressed curls: deep treatment, scalp massage, curl styling and diffuser drying.',
      bring: ['Tell her how long and how dense your hair is. Extra-long or dense hair can cost more.', 'The treatment is picked for your hair on the day, so come as you are.'] },
    silk: { name: 'Royal Silk Transformation', sub: 'Cirugía Capilar', time: '2 hr 30 min', price: '$120', mins: 150,
      why: 'Their “hair surgery”: a smoothing treatment that deeply repairs the hair fiber and leaves it smooth, shiny and silky.',
      bring: ['A rough idea of what’s been on your hair lately: colour, relaxer or keratin, and when.', 'A free morning or afternoon: it takes about two and a half hours.'] },
    botox: { name: 'Golden Satin Infusion', sub: 'Hair Botox', time: '3 hr', price: '$150', mins: 180,
      why: 'Non-chemical smoothing: proteins and moisture for less frizz and more softness, without drastically changing your curl pattern.',
      bring: ['About three hours. Bring a charger or a book.', 'Tell her how much curl you want to keep.'] },
    keratin: { name: 'Velvet Crown Straightening', sub: 'Keratin', time: '2 hr 30 min', price: '$180', mins: 150,
      why: 'Keratin for long-lasting straightness, frizz control and shine, so styling takes less time every morning.',
      bring: ['About two and a half hours.', 'Tell her about any colour or relaxer on your hair.'] },
    ext: { name: 'The Crown Healer Extension Experience', time: '3 hr 20 min', price: '$250', mins: 200,
      why: 'Scalp prep, hair strengthening, a custom full-head install and finishing, built to protect your natural hair while adding length and thickness.',
      bring: ['Your own hair: it isn’t included.', 'About three and a half hours.'] },
    length: { name: 'Royal Length Extensions', time: '2 hr 30 min', price: '$200', mins: 150,
      why: 'A custom install that adds real length, matched to your own texture and colour (leave-out).',
      bring: ['Your own hair: it isn’t included.', 'About two and a half hours.'] },
    talk: { name: 'Talk first', time: 'A quick call', price: 'Free to ask', mins: 0, talk: true,
      why: 'Edges need a look before a plan. Call or message the salon first and ask whether The Crown Healer Extension Experience, built to protect natural hair while adding thickness, is right for you.',
      bring: ['A photo of your edges today, if you’re messaging.'] }
  };
  const TRIM = { name: 'Trim the ends', price: '$10', time: '30 min' };

  const pick = (t, c) => {
    const curly = t === 'curly';
    switch (c) {
      case 'lasting': return [t === 'relaxed' ? 'crownset' : 'blowout', true];
      case 'heat': return [curly ? 'curlrepair' : t === 'relaxed' ? 'crownset' : 'silk', true];
      case 'breakage': return [curly ? 'curlrepair' : 'silk', true];
      case 'colour': return [curly ? 'curlrepair' : 'silk', true];
      case 'scalp': return [curly ? 'curlrepair' : t === 'relaxed' ? 'crownset' : 'blowout', false];
      case 'frizz': return [curly || t === 'wavy' ? 'botox' : t === 'relaxed' ? 'silk' : 'keratin', false];
      case 'edges': return ['talk', false];
      case 'length': return [curly || t === 'wavy' ? 'ext' : 'length', false];
    }
  };
  const TYPE = { curly: 'Curly or coily', wavy: 'Wavy', relaxed: 'Relaxed or processed', straight: 'Straight' };
  const CONCERN = { lasting: 'a blowout that lasts', breakage: 'breakage', heat: 'heat damage', colour: 'colour damage', frizz: 'frizz', scalp: 'dry scalp', edges: 'thinning edges', length: 'more length or fullness' };
  const NOTE = {
    scalp: 'Tell her about the dryness when you sit down, so she can choose the wash and conditioning for it.',
    colour: 'When your hair is healthy again, their Color Refresh (root touch-up) is $100.',
    heat: 'Fewer hot tools between visits helps the result last.'
  };

  /* ---------- consult ---------- */
  const st = { step: 1, type: null, concern: null, svc: null, trim: false, chair: null, day: null, dayLabel: null, date: null, tod: null, name: '' };
  const cx = $('#cx'), panes = $$('.cx-pane', cx), bars = $$('.cx-bar i'), back = $('#cx-back');
  const mirror = $('#mirror'), glass = $('.glass', mirror), cap = $('#mirror-cap');
  const SHOTS = { 1: ['silk', 'Roots to silk'], 2: ['chair', 'In the chair, mid-blowout'], 3: ['finish', 'The finish, at Healing Hands'], 4: ['finish', 'The finish, at Healing Hands'] };

  function showShot(k, text) {
    const cur = $('img.on', glass);
    if (cur && cur.dataset.k === k) return;
    $$('img', glass).forEach(i => i.classList.toggle('on', i.dataset.k === k));
    cap.textContent = text;
    if (!reduce) { glass.classList.remove('sheen'); void glass.offsetWidth; glass.classList.add('sheen'); }
  }

  function go(n, focus = true) {
    st.step = n; cx.classList.add('live');
    panes.forEach(p => { p.hidden = +p.dataset.step !== n; });
    bars.forEach((b, i) => b.classList.toggle('on', i < n));
    $('#cx-step').textContent = `Step ${n} of 4`;
    back.hidden = n === 1; $('#cx-skip').hidden = n !== 1;
    showShot(...SHOTS[n]);
    if (focus) {
      const r = cx.getBoundingClientRect();
      if (r.top < 60 || r.top > innerHeight * .5) cx.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      $('.cx-q', panes[n - 1]).focus({ preventScroll: true });
    }
  }

  const press = (group, btn) => $$('[aria-pressed]', group).forEach(b => b.setAttribute('aria-pressed', b === btn));
  $$('.card', cx).forEach(b => b.setAttribute('aria-pressed', 'false'));

  $('.c-type').addEventListener('click', e => {
    const b = e.target.closest('.card'); if (!b) return;
    press(e.currentTarget, b); st.type = b.dataset.type;
    setTimeout(() => go(2), reduce ? 0 : 160);
  });
  $('.c-concern').addEventListener('click', e => {
    const b = e.target.closest('.card'); if (!b) return;
    press(e.currentTarget, b); st.concern = b.dataset.c;
    const [k, trim] = pick(st.type, st.concern);
    st.svc = k; st.trim = trim;
    renderMatch();
    setTimeout(() => go(3), reduce ? 0 : 160);
  });
  back.addEventListener('click', () => go(st.step - 1));

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function renderMatch() {
    const s = S[st.svc];
    const bring = [...s.bring]; if (NOTE[st.concern] && !s.talk) bring.push(NOTE[st.concern]);
    $('#match').innerHTML = `
      <p class="m-k">${CROWN}${s.talk ? 'Our honest answer' : 'Your match'}</p><p class="m-ctx">For ${esc(TYPE[st.type].toLowerCase())} hair and ${esc(CONCERN[st.concern])}</p>
      <h3 class="m-name">${esc(s.name)}${s.sub ? ` <small style="font-size:.6em;color:var(--ink2)">(${esc(s.sub)})</small>` : ''}</h3>
      <p class="m-why">${esc(s.why)}</p>
      <ul class="m-meta"><li>${esc(s.time)}</li><li>${esc(s.price)}</li></ul>
      <div class="m-bring"><b>Come in with</b><ul>${bring.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      ${s.talk ? `<div class="m-talk"><a class="btn" href="tel:+19734290159">Call (973) 429-0159</a><a class="btn" href="https://wa.me/19734290159">WhatsApp</a></div>` : `<button type="button" class="m-add" id="m-trim" aria-pressed="${st.trim}"><span class="tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span><span><b>Add Trim the ends</b> · $10, 30 min<br><small>${st.trim ? 'Recommended for this' : 'Optional'}</small></span></button>`}
      <p class="m-src">Times and prices from the salon’s booking page. The salon confirms.</p>`;
    const t = $('#m-trim');
    if (t) t.addEventListener('click', () => { st.trim = !st.trim; t.setAttribute('aria-pressed', st.trim); line(); });
  }

  $('.chair .chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    const on = b.getAttribute('aria-pressed') === 'true';
    press(e.currentTarget, on ? null : b); st.chair = on ? null : b.dataset.chair; line();
  });
  $('#to-4').addEventListener('click', () => { go(4); line(); });

  /* days: next open days from Google hours (Tue to Sat) */
  const DN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const days = $('#cx-days'), out = [];
  for (let d = new Date(), i = 1; out.length < 5 && i < 14; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (x.getDay() >= 2 && x.getDay() <= 6) out.push(x);
  }
  const iso = x => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  days.innerHTML = out.map(x => `<button type="button" class="chip" aria-pressed="false" data-date="${iso(x)}" data-day="${DN[x.getDay()]}"><b>${DN[x.getDay()].slice(0, 3)}</b><small>${x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></button>`).join('');
  days.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    press(days, b); st.day = b.dataset.day; st.date = b.dataset.date; line();
  });
  $('.tod').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    press(e.currentTarget, b); st.tod = b.dataset.tod; line();
  });
  $('#cx-name').addEventListener('input', e => { st.name = e.target.value.trim(); line(); });

  function svcLabel() {
    const s = S[st.svc]; if (!s) return '';
    return s.talk ? 'A quick talk about my edges' : s.name + (st.trim ? ' + Trim the ends' : '');
  }
  function line() {
    if (!st.svc) return;
    const when = st.day ? `${st.day} ${st.tod || ''}`.trim() : st.tod ? `${st.tod}, any day` : 'pick a day';
    $('#cx-line').textContent = `${svcLabel()}, ${when}, for ${st.name || 'you'}${st.chair ? ` (${st.chair})` : ''}`;
    const fit = $('#cx-fit'), long = S[st.svc].mins >= 150;
    fit.hidden = !(long && st.tod === 'evening');
    fit.textContent = 'This one takes a while, so an earlier start usually works better. The salon will suggest a time.';
  }

  /* hand the consult to the request form (if present) */
  $('#cx-go').addEventListener('click', () => {
    const f = $('#rq'); if (!f) return;
    if (st.name) f.name.value = st.name;
    const sel = f.service; if (sel && st.svc) {
      const want = S[st.svc].talk ? 'Not sure, talk first' : S[st.svc].name;
      [...sel.options].forEach(o => { if (o.value === want) sel.value = want; });
    }
    if (st.date && f.day) f.day.value = st.date;
    if (st.tod) { const r = f.querySelector(`input[name=time][value=${st.tod}]`); if (r) r.checked = true; }
    if (f.notes) f.notes.value = [`Hair: ${TYPE[st.type]}. Main concern: ${CONCERN[st.concern]}.`, st.trim && !S[st.svc].talk ? 'Add Trim the ends.' : '', st.chair ? `Chair: ${st.chair}.` : ''].filter(Boolean).join(' ');
    setTimeout(() => { const p = f.phone; if (p) p.focus({ preventScroll: true }); }, reduce ? 0 : 700);
  });

  /* ---------- request form (front end only) ---------- */
  const rq = $('#rq'), done = $('#rq-done'), err = $('#rq-err');
  if (rq) {
    const t = new Date();
    rq.day.min = iso(t);
    rq.addEventListener('submit', e => {
      e.preventDefault();
      const name = rq.name.value.trim(), phone = rq.phone.value.replace(/\D/g, '');
      const miss = [!name && 'your name', phone.length < 10 && 'a phone number'].filter(Boolean);
      if (miss.length) { err.textContent = `Please add ${miss.join(' and ')}.`; err.hidden = false; (!name ? rq.name : rq.phone).focus(); return; }
      err.hidden = true;
      const svc = rq.service.value || 'An appointment';
      let when = '';
      if (rq.day.value) { const [y, m, d] = rq.day.value.split('-').map(Number); when = DN[new Date(y, m - 1, d).getDay()]; }
      const tod = (rq.querySelector('input[name=time]:checked') || {}).value;
      when = [when, tod].filter(Boolean).join(' ') || 'day to be agreed';
      $('#rq-sum').textContent = `${svc}, ${when}, for ${name.split(' ')[0]}`;
      rq.hidden = true; done.hidden = false; done.focus();
    });
    $('#rq-again').addEventListener('click', () => { done.hidden = true; rq.hidden = false; rq.name.focus(); });
  }

  /* light only moves while the hero is on screen */
  const hero = $('.hero');
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => hero.classList.toggle('paused', !e.isIntersecting))).observe(hero);
  document.addEventListener('visibilitychange', () => hero.classList.toggle('paused', document.hidden));

  /* reveal (standard) */
  const els = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('is-visible'));
  else {
    const n = new Map();
    els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);
  }
})();
