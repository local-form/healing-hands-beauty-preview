(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- the salon's own menu (Square booking page, checked 2026-11-09) ----------
     title = plain name we show, menu = the name on their booking page */
  const S = {
    blowout: { title: 'Dominican blowout', menu: 'Royal Dominican Blowout', time: '1 hr 15+', price: 'Call', mins: 75, finish: true,
      why: 'The house specialty. Clarifying wash, conditioning, then a careful blow-dry for body and shine. Made for natural and curly hair.',
      bring: ['Your hair as it is. The wash is part of it.', 'Want it bone-straight? Ask for the flat iron. It’s not included.'] },
    crownset: { title: 'Roller set', menu: 'The Dominican Crown Set', time: '1 hr+', price: 'Call', mins: 60, finish: true,
      why: 'Wash, rollers, the hooded dryer, then a blow-dry finish. For relaxed or processed hair that doesn’t need more heat.',
      bring: ['Your hair as it is. The wash is included.', 'No flat iron, on purpose: less heat on your hair.'] },
    curlrepair: { title: 'Curl repair', menu: 'The Crown Curl Repair', time: 'Ask', price: '$95', priceNote: 'intro price', mins: 120,
      why: 'Deep treatment, scalp massage and curl styling for curls that feel dry, dull or fragile.',
      bring: ['Tell her how long and thick your hair is. Extra-long or dense hair can cost more.'] },
    silk: { title: 'Cirugía capilar', menu: 'Royal Silk Transformation', time: '2 hr 30', price: '$120', mins: 150, finish: true,
      why: 'A smoothing treatment that repairs the hair fiber and leaves it smooth, shiny and soft.',
      bring: ['What’s been on your hair lately (color, relaxer, keratin) and when.', 'A free morning or afternoon.'] },
    botox: { title: 'Hair botox', menu: 'Golden Satin Infusion', time: '3 hr', price: '$150', mins: 180,
      why: 'No chemicals. Protein and moisture for less frizz and softer hair, and your curl pattern mostly stays.',
      bring: ['About three hours. Bring a charger.', 'Tell her how much curl you want to keep.'] },
    keratin: { title: 'Keratin', menu: 'Velvet Crown Straightening', time: '2 hr 30', price: '$180', mins: 150, finish: true,
      why: 'Long-lasting straight, less frizz, more shine, and faster mornings.',
      bring: ['Tell her about any color or relaxer on your hair.'] },
    ext: { title: 'Full-head extensions', menu: 'The Crown Healer Extension Experience', time: '3 hr 20', price: '$250', mins: 200,
      why: 'Scalp prep, strengthening and a full-head install, done to protect your own hair while adding length and thickness.',
      bring: ['Your own hair. It’s not included.'] },
    length: { title: 'Length extensions', menu: 'Royal Length Extensions', time: '2 hr 30', price: '$200', mins: 150,
      why: 'A custom install for real length, matched to your texture and color (leave-out).',
      bring: ['Your own hair. It’s not included.'] },
    talk: { title: 'Call first', menu: '', time: '5 min', price: 'Free', mins: 0, talk: true,
      why: 'Edges need a look before a plan. Call or WhatsApp the salon and ask if their full-head extension service, made to protect natural hair, is right for you.',
      bring: ['A photo of your edges, if you’re sending a WhatsApp.'] }
  };

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
  const TYPE = { curly: 'Curly or coily', wavy: 'Wavy', relaxed: 'Relaxed', straight: 'Straight' };
  const CONCERN = { lasting: 'a blowout that lasts', breakage: 'breakage', heat: 'heat damage', colour: 'color damage', frizz: 'frizz', scalp: 'dry scalp', edges: 'thinning edges', length: 'length or fullness' };
  const NOTE = {
    scalp: 'Tell her about the dry scalp when you sit down.',
    colour: 'Once your hair is healthy again: root touch-up is $100.',
    heat: 'Go easy on hot tools between visits.'
  };

  /* ---------- consult ---------- */
  const st = { step: 1, type: null, concern: null, svc: null, trim: false, chair: null, day: null, date: null, tod: null, name: '' };
  const cx = $('#cx'), panes = $$('.cx-pane', cx), back = $('#cx-back'), skip = $('#cx-skip');
  const tiles = $('#tiles'), pickFig = $('#pick'), pickImg = $('#pick-img'), pickCap = $('#pick-cap'), fin = $('#pick-finish');

  function stage(n) {
    tiles.hidden = n !== 1;
    const showFinish = n >= 3 && S[st.svc] && S[st.svc].finish;
    fin.hidden = !showFinish;
    pickFig.hidden = n === 1 || showFinish;
  }

  function go(n, focus = true) {
    st.step = n; cx.classList.add('live');
    panes.forEach(p => { p.hidden = +p.dataset.step !== n; });
    $('#cx-step').textContent = `${n} of 4`;
    back.hidden = n === 1; skip.hidden = n !== 1;
    stage(n);
    if (focus) {
      const target = innerWidth >= 1000 ? cx : $('#stage');
      const r = target.getBoundingClientRect();
      if (r.top < 60 || r.top > innerHeight * .6) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      $('.cx-q', panes[n - 1]).focus({ preventScroll: true });
    }
  }
  const press = (group, btn) => $$('[aria-pressed]', group).forEach(b => b.setAttribute('aria-pressed', b === btn));
  $$('.opt', cx).forEach(b => b.setAttribute('aria-pressed', 'false'));

  tiles.addEventListener('click', e => {
    const b = e.target.closest('.tile'); if (!b) return;
    press(tiles, b); st.type = b.dataset.type;
    const src = $('img', b);
    pickImg.src = src.currentSrc || src.src; pickImg.alt = `Hair at Healing Hands: ${TYPE[st.type].toLowerCase()}`;
    pickCap.textContent = TYPE[st.type];
    setTimeout(() => go(2), reduce ? 0 : 140);
  });
  $('.c-concern').addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b) return;
    press(e.currentTarget, b); st.concern = b.dataset.c;
    const [k, trim] = pick(st.type, st.concern);
    st.svc = k; st.trim = trim;
    renderMatch();
    setTimeout(() => go(3), reduce ? 0 : 140);
  });
  back.addEventListener('click', () => go(st.step - 1));

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function renderMatch() {
    const s = S[st.svc];
    const bring = [...s.bring]; if (NOTE[st.concern] && !s.talk) bring.push(NOTE[st.concern]);
    $('#match').innerHTML = `
      <div class="m-top">
        <p class="m-k">${s.talk ? 'For thinning edges' : `For ${esc(TYPE[st.type].toLowerCase())} hair and ${esc(CONCERN[st.concern])}`}</p>
        <h3 class="m-name">${esc(s.title)}</h3>
        ${s.menu ? `<p class="m-menu">On their menu as “${esc(s.menu)}”</p>` : ''}
      </div>
      <div class="m-body">
        <ul class="m-meta"><li><b>${esc(s.price)}</b><small>${s.priceNote ? esc(s.priceNote) : s.price === 'Call' ? 'price varies' : 'price'}</small></li><li><b>${esc(s.time)}</b><small>${s.time === 'Ask' ? 'time: ask the salon' : 'in the chair'}</small></li></ul>
        <p class="m-why">${esc(s.why)}</p>
        <div class="m-bring"><b>Come in with</b><ul>${bring.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        ${s.talk ? `<div class="m-talk"><a class="btn btn-primary" href="tel:+19734290159">Call</a><a class="btn btn-ghost" href="https://wa.me/19734290159">WhatsApp</a></div>` : `<button type="button" class="m-add" id="m-trim" aria-pressed="${st.trim}"><span class="tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></span><span><b>Add a trim</b> · $10, 30 min${st.trim ? '<br><small>Recommended for this</small>' : ''}</span></button>`}
        <p class="m-src">Prices and times from the salon’s booking page. They confirm when you book.</p>
      </div>`;
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
  days.innerHTML = out.map(x => `<button type="button" class="chip" aria-pressed="false" data-date="${iso(x)}" data-day="${DN[x.getDay()]}">${DN[x.getDay()].slice(0, 3)}<small>${x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></button>`).join('');
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
    return s.talk ? 'A quick call about my edges' : s.title + (st.trim ? ' + trim' : '');
  }
  function line() {
    if (!st.svc) return;
    const when = st.day ? `${st.day} ${st.tod || ''}`.trim() : st.tod ? `${st.tod}, any day` : 'pick a day';
    $('#cx-line').textContent = `${svcLabel()}, ${when}, for ${st.name || 'you'}${st.chair ? ` (${st.chair})` : ''}`;
    const fit = $('#cx-fit'), long = S[st.svc].mins >= 150;
    fit.hidden = !(long && st.tod === 'evening');
    fit.textContent = 'This one takes a while, so an earlier start works better. The salon will suggest a time.';
  }

  /* hand the consult to the request form */
  $('#cx-go').addEventListener('click', () => {
    const f = $('#rq'); if (!f) return;
    if (st.name) f.name.value = st.name;
    if (st.svc) { const want = S[st.svc].talk ? 'Not sure, call me' : S[st.svc].title; [...f.service.options].forEach(o => { if (o.value === want) f.service.value = want; }); }
    if (st.date) f.day.value = st.date;
    if (st.tod) { const r = f.querySelector(`input[name=time][value=${st.tod}]`); if (r) r.checked = true; }
    f.notes.value = [`Hair: ${TYPE[st.type]}. Problem: ${CONCERN[st.concern]}.`, st.trim && !S[st.svc].talk ? 'Add a trim.' : '', st.chair ? `Chair: ${st.chair}.` : ''].filter(Boolean).join(' ');
    setTimeout(() => f.phone.focus({ preventScroll: true }), reduce ? 0 : 700);
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
