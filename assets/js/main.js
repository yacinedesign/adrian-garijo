(() => {
  const WA = '34618849484';
  // Horario: L–V 9:00–14:00 y 15:00–21:00
  const T = [[540, 840], [900, 1260]];
  const H = { 1: T, 2: T, 3: T, 4: T, 5: T, 6: [], 0: [] };
  const fmt = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const DIAS = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'];

  const ahoraES = () => {
    const p = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const dias = { dom: 0, lun: 1, mar: 2, mié: 3, jue: 4, vie: 5, sáb: 6 };
    return { d: dias[g('weekday').replace('.', '')] ?? new Date().getDay(), m: +g('hour') * 60 + +g('minute') };
  };

  const pinta = () => {
    const { d, m } = ahoraES();
    const abierto = H[d].find(([a, b]) => m >= a && m < b);
    let corto, largo;
    if (abierto) { corto = `Abierto ahora · hasta las ${fmt(abierto[1])}`; largo = corto; }
    else {
      const luego = H[d].find(([a]) => a > m);
      if (luego) corto = `Cerrado · abre a las ${fmt(luego[0])}`;
      else for (let i = 1; i <= 7; i++) { const dd = (d + i) % 7; if (H[dd].length) { corto = `Cerrado · abre ${i === 1 ? 'mañana' : DIAS[dd]} a las ${fmt(H[dd][0][0])}`; break; } }
      largo = corto + '. Escríbeme y te contesto en cuanto pueda.';
    }
    document.querySelectorAll('[data-dot]').forEach(el => el.classList.toggle('is-open', !!abierto));
    const e1 = document.querySelector('[data-estado]'); if (e1) e1.textContent = corto;
    const e2 = document.querySelector('[data-estado2]'); if (e2) e2.textContent = largo;
    document.querySelectorAll('[data-dias] li').forEach(li => li.classList.toggle('is-today', +li.dataset.d === d));
  };
  pinta(); setInterval(pinta, 60000);

  // Cabecera + columna de progreso
  const top = document.querySelector('.top');
  const fill = document.querySelector('.columna__fill');
  const onScroll = () => {
    top.classList.toggle('is-scrolled', scrollY > 10);
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.setProperty('--p', (max > 0 ? Math.min(100, scrollY / max * 100) : 0) + '%');
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Revelado
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Tarjetas de motivo -> preseleccionan el motivo en el formulario
  const f = document.getElementById('form-reserva');
  document.querySelectorAll('[data-motivo]').forEach(a => a.addEventListener('click', () => {
    f.motivo.value = a.dataset.motivo;
    setTimeout(() => { f.classList.remove('flash'); void f.offsetWidth; f.classList.add('flash'); }, 500);
  }));

  // Formulario -> WhatsApp
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const err = f.querySelector('.form__err');
    if (!d.nombre.trim()) { err.hidden = false; f.nombre.focus(); return; }
    err.hidden = true;
    let msg = `Hola Adrián, soy ${d.nombre.trim()}. Me gustaría reservar una cita.\n\nMotivo: ${d.motivo}\nDesde hace: ${d.desde}\nPrefiero venir ${d.cuando}`;
    if (d.nota.trim()) msg += `\n\n${d.nota.trim()}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  // Flechas de opiniones
  const ops = document.querySelector('.ops');
  document.querySelectorAll('.flechas button').forEach(b => b.addEventListener('click', () => {
    const w = ops.querySelector('.op').getBoundingClientRect().width + 20;
    ops.scrollBy({ left: w * +b.dataset.dir, behavior: 'smooth' });
  }));

  // Selector de color
  const html = document.documentElement;
  const col = { turquesa: '#0B3F3D', oceano: '#0B1F45', terracota: '#3A1A10', grafito: '#121619' };
  const pon = t => {
    html.dataset.tema = t;
    document.querySelectorAll('.temas button').forEach(b => b.setAttribute('aria-pressed', b.dataset.set === t));
    document.querySelector('meta[name=theme-color]').content = col[t];
    try { localStorage.setItem('ag-tema', t); } catch (_) {}
  };
  try { const t = localStorage.getItem('ag-tema'); if (t && col[t]) pon(t); } catch (_) {}
  document.querySelectorAll('.temas button').forEach(b => b.addEventListener('click', () => pon(b.dataset.set)));

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
