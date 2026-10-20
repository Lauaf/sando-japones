// 道場 Dojo de japonés: batallas de kana, vocabulario (SRS), lectura y conversación con IA.
import { el, sfx, mezclar, distractores, elegir, hablar, esperar, toast } from './util.js';
import { P, ganarXP, evento, srsResponder, srsCola, srsResumen, srsDato, guardar } from './progreso.js';
import { HIRAGANA, KATAKANA, todosKana, claveKana, MNEMO } from './datos/kana.js';
import { VOCAB, NOMBRES_LECCIONES, claveVoc } from './datos/vocab.js';
import { VECINOS, ESCENARIOS } from './datos/frases.js';
import { VOCAB_AVANZADO, LECCIONES_AVANZADAS, GRAMATICA, CHARLAS_N3 } from './datos/n4n3.js';
import { parsear, renderTokens, aRomaji, aKana, normalizar, lecturaPlana, tieneKanji } from './jp/texto.js';
import { abrir } from './actividad.js';
import { decir, cerrar as cerrarDialogo } from './dialogo.js';
import { preguntar, IA } from './ia.js';

const NIVEL_TXT = { cero: 'desde cero', kana: 'sé kana', n5: 'N5', n4: 'N4', n3: 'N3' };
const avanzado = () => ['n4', 'n3'].includes(P.jp.nivel);
const TODO_VOCAB = [...VOCAB_AVANZADO, ...VOCAB];
const poolVocab = () => avanzado() ? VOCAB_AVANZADO.filter(v => P.jp.nivel === 'n3' || v.nivel === 'n4') : VOCAB;
/** Descripción del nivel para los prompts de la IA. */
function nivelIA(corto = false) {
  return {
    cero: 'principiante absoluto (todavía aprende kana): frases de 3-6 palabras, casi todo hiragana',
    kana: 'lee kana, N5 inicial: frases cortas, kanji N5 básicos',
    n5: 'N5: frases simples con kanji comunes',
    n4: corto ? 'N4' : 'N4 (camino a N3): japonés natural de todos los días, forma て, potencial, pasiva/causativa, ～そう/～よう, kanji N4 sin miedo',
    n3: corto ? 'N3' : 'N3: japonés natural como entre adultos, gramática N3 (はず, わけ, ばかり, にとって, ～ば～ほど), algo de keigo, kanji N3',
  }[P.jp.nivel] || 'N5';
}
const nombreJugador = () => P.nombre || 'ラウタロ';

// ---------- Hub del dojo ----------
export function abrirDojo() {
  abrir('jp', '道場 Dojo de Haru-sensei', hubDojo, { sub: `japonés · ${NIVEL_TXT[P.jp.nivel] || ''}` });
}

function filasDesbloqueadas(tipo) {
  const filas = tipo === 'k' ? KATAKANA : HIRAGANA;
  if (P.jp.nivel !== 'cero') return filas.length;
  let n = 2;
  for (let i = 0; i < filas.length; i++) {
    const cajas = filas[i].kana.map(k => srsDato(claveKana(k))?.c || 0);
    const media = cajas.reduce((a, b) => a + b, 0) / cajas.length;
    if (i < n && media >= 1.6) n = i + 2;
  }
  return Math.min(filas.length, n);
}

function hubDojo(c, ctx) {
  const resH = srsResumen(todosKana('h'), claveKana);
  const resK = srsResumen(todosKana('k'), claveKana);
  const resV = srsResumen(VOCAB, claveVoc);
  const kataBloq = P.jp.nivel === 'cero' && resH.dominados < 30;
  const tarjeta = (ico, tit, desc, tag, onclick, bloq) =>
    el('button.tarjeta' + (bloq ? '.bloq' : ''), { onclick: bloq ? () => toast(bloq) : onclick },
      el('div.t-ico', ico), el('div.t-tit', tit), el('div.t-desc', desc), tag ? el('div.t-tag', tag) : null);
  const resA = srsResumen(poolVocab(), claveVoc);
  const resKanji = srsResumen(poolVocab().filter(v => tieneKanji(v.p)), v => 'kanji:' + v.p);
  const extra = avanzado() ? [
    tarjeta('📝', '文法 Gramática', `Completá el hueco: ${P.jp.nivel === 'n3' ? 'N4 y N3' : 'N4'} (ように, ことになる, はず, わけ, おかげで…).`,
      `${P.stats.gramatica_ok || 0} aciertos`, () => ctx.ir('文法 Gramática', gramatica)),
    tarjeta('漢', '漢字 Lecturas', 'Ves la palabra en kanji y elegís o escribís cómo se lee.',
      `${resKanji.dominados}/${resKanji.total} dominadas`, () => ctx.ir('漢字 Lecturas', (cc, cx) => sesionVocab(cc, cx, poolVocab().filter(v => tieneKanji(v.p)), ['lectura', 'escribir-lectura']))),
  ] : [];
    c.append(
    el('div.fila', el('div.suave', 'Clic en cualquier palabra japonesa para ver su significado y escucharla. Usá auriculares para la pronunciación.')),
    el('div.rejilla',
      ...extra,
      tarjeta('👻', 'ひらがな Batalla', 'Derrotá yokai leyendo hiragana. Las filas nuevas se desbloquean al dominar las anteriores.',
        `${resH.dominados}/${resH.total} dominados · ${filasDesbloqueadas('h')}/${HIRAGANA.length} filas`, () => ctx.ir('ひらがな Batalla', (cc, cx) => batallaKana(cc, cx, 'h'))),
      tarjeta('👹', 'カタカナ Batalla', 'Lo mismo con katakana (palabras extranjeras: コーヒー, ピアノ…).',
        `${resK.dominados}/${resK.total} dominados`, () => ctx.ir('カタカナ Batalla', (cc, cx) => batallaKana(cc, cx, 'k')),
        kataBloq ? 'Dominá 30 hiragana primero (o cambiá tu nivel en Ajustes).' : null),
      tarjeta('📚', '単語 Vocabulario', avanzado() ? 'Vocabulario N4/N3 (y de café y piano) con repaso espaciado.' : 'Palabras útiles con repaso espaciado: escuchar, leer y escribir.',
        avanzado() ? `${resA.vencidos} para repasar · ${resA.nuevos} nuevas` : `${resV.vencidos} para repasar · ${resV.nuevos} nuevas`, () => ctx.ir('単語 Vocabulario', menuVocab)),
      tarjeta('📖', '読む Lectura', 'Historias cortas a tu nivel, tocando palabras para entenderlas.',
        IA.disponible ? 'con IA' : '2 historias offline', () => ctx.ir('読む Lectura', lectura)),
      tarjeta('💬', '会話 Conversación', 'Charlá en japonés con la IA en situaciones reales. Te corrige con onda.',
        IA.disponible ? 'IA conectada' : 'necesita IA local', () => ctx.ir('会話 Conversación', menuConversacion)),
      tarjeta('⚙️', '設定 Ajustes', 'Furigana, romaji y tu nivel.', `furigana ${P.jp.furigana ? 'sí' : 'no'} · romaji ${P.jp.romaji ? 'sí' : 'no'}`,
        () => ctx.ir('設定 Ajustes', ajustesJp)),
    ));
}

function ajustesJp(c, ctx) {
  const chips = (opts, actual, set) => el('div.chips', opts.map(([v, t]) =>
    el('button.chip' + (actual === v ? '.sel' : ''), { onclick: () => { set(v); guardar(); ctx.rehacer(); } }, t)));
  c.append(
    el('div', 'Tu nivel'), chips([['cero', 'Desde cero'], ['kana', 'Ya leo kana'], ['n5', 'N5'], ['n4', 'N4'], ['n3', 'N3']], P.jp.nivel, v => {
      P.jp.nivel = v; P.jp.romaji = v === 'cero';
    }),
    el('div', 'Furigana (lectura arriba de los kanji)'), chips([[true, 'Sí'], [false, 'No']], P.jp.furigana, v => { P.jp.furigana = v; }),
    el('div', 'Romaji debajo de las frases'), chips([[true, 'Sí'], [false, 'No']], P.jp.romaji, v => { P.jp.romaji = v; }),
    el('div', 'Tu nombre en katakana'),
    el('div.fila', el('input.entrada', { value: P.nombreRomaji || '', placeholder: 'ej: rautaro', oninput: e => {
      P.nombreRomaji = e.target.value;
      P.nombre = aKana(e.target.value.replace(/l/gi, 'r'), true);
      e.target.nextSibling.textContent = P.nombre;
      guardar();
    } }), el('span.mediano', P.nombre || '')),
  );
}

// ---------- Yokai pixel ----------
const YOKAI = [
  { n: 'おばけ', col: '#e9e4ff', col2: '#b7aee6' }, { n: 'かっぱ', col: '#6cc08b', col2: '#3e8a5c' },
  { n: 'ちょうちん', col: '#f08a4b', col2: '#c0392b' }, { n: 'たぬき', col: '#a77b55', col2: '#6b4a35' },
  { n: 'きつね', col: '#f2a65a', col2: '#fff4e6' }, { n: 'おに', col: '#e8546b', col2: '#8e2a20' },
  { n: 'ゆきおんな', col: '#cfe8ff', col2: '#7fb6ee' }, { n: 'からかさ', col: '#9b6bd3', col2: '#5a3a8e' },
];
function dibujarYokai(cv, y) {
  const g = cv.getContext('2d');
  cv.width = 32; cv.height = 32;
  g.clearRect(0, 0, 32, 32);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(16, 30, 10, 2, 0, 0, 7); g.fill();
  g.fillStyle = y.col2; g.beginPath(); g.arc(16, 14, 11, Math.PI, 0); g.lineTo(27, 26);
  for (let i = 27; i >= 5; i -= 4) g.lineTo(i - 2, i % 8 === 3 ? 28 : 25);
  g.closePath(); g.fill();
  g.fillStyle = y.col; g.beginPath(); g.arc(16, 13, 10, Math.PI, 0); g.lineTo(26, 24); g.lineTo(6, 24); g.closePath(); g.fill();
  g.fillStyle = '#241a2e'; g.fillRect(11, 11, 3, 4); g.fillRect(18, 11, 3, 4);
  g.fillStyle = '#fff'; g.fillRect(11, 11, 1, 1); g.fillRect(18, 11, 1, 1);
  g.fillStyle = '#e8546b'; g.fillRect(14, 18, 4, 2);
  if (y.n === 'おに') { g.fillStyle = '#f2c14e'; g.fillRect(9, 2, 2, 4); g.fillRect(21, 2, 2, 4); }
  if (y.n === 'きつね' || y.n === 'たぬき') { g.fillStyle = y.col2; g.fillRect(7, 3, 4, 4); g.fillRect(21, 3, 4, 4); }
  if (y.n === 'かっぱ') { g.fillStyle = '#e9e4c4'; g.beginPath(); g.ellipse(16, 4, 6, 2, 0, 0, 7); g.fill(); }
}
function flotar(texto, contenedor, color) {
  const r = contenedor.getBoundingClientRect();
  const p = document.getElementById('pantalla').getBoundingClientRect();
  const f = el('div.flotante', { style: { left: r.left - p.left + r.width / 2 - 20 + 'px', top: r.top - p.top + 'px', color } }, texto);
  document.getElementById('pantalla').append(f);
  setTimeout(() => f.remove(), 1000);
}

// ---------- Batalla de kana ----------
function batallaKana(c, ctx, tipo) {
  const filas = (tipo === 'k' ? KATAKANA : HIRAGANA).slice(0, tipo === 'k' ? Math.max(2, filasDesbloqueadas('k')) : filasDesbloqueadas('h'));
  const pool = filas.flatMap(f => f.kana);
  const cola = srsCola(pool, claveKana, 14, 6);
  const yokai = elegir(YOKAI);
  let hpE = 10, hpJ = 5, combo = 0, i = 0, terminado = false, aciertos = 0;
  const cvE = el('canvas'), cvJ = el('img.arky', { src: 'assets/arky/limpio/right_idle.png', alt: 'Arky' });
  dibujarYokai(cvE, yokai);
  const barraE = el('i', { style: { width: '100%' } }), barraJ = el('i', { style: { width: '100%' } });
  const zonaPregunta = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' } });
  const info = el('div.suave', { style: { minHeight: '1.4em', textAlign: 'center' } });
  const nombreE = renderTokens([{ t: yokai.n, r: yokai.n, s: `yokai: ${aRomaji(yokai.n)}` }]).nodo;
  c.classList.add('centro');
  c.append(
    el('div.batalla',
      el('div.luchador', el('div', 'アーキー Arky'), cvJ, el('div.hp', barraJ)),
      el('div.mediano', 'VS'),
      el('div.luchador', el('div', nombreE), cvE, el('div.hp.enemigo', barraE))),
    zonaPregunta, info);

  const actualizarHP = () => { barraE.style.width = hpE * 10 + '%'; barraJ.style.width = hpJ * 20 + '%'; };

  function siguiente() {
    if (terminado) return;
    if (i >= cola.length) { i = 0; cola.push(...mezclar(cola)); }
    const k = cola[i++];
    const d = srsDato(claveKana(k));
    const tipear = (d?.c || 0) >= 2;
    zonaPregunta.replaceChildren(el('div.grande', k.k));
    if (tipear) {
      const inp = el('input.entrada', { placeholder: 'escribí en romaji y Enter', autocomplete: 'off', style: { textAlign: 'center', width: '12em' } });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter' && inp.value.trim()) responder(k, inp.value.trim().toLowerCase());
        e.stopPropagation();
      });
      zonaPregunta.append(inp, el('div.suave', '¿Cómo se lee?'));
      setTimeout(() => inp.focus(), 30);
    } else {
      const ops = mezclar([k, ...distractores(pool, 3, x => x.r === k.r)]);
      const grid = el('div.opciones4', ops.map((o, n) => el('button.btn', { onclick: e => responder(k, o.r, e.currentTarget) }, `${n + 1}. ${o.r}`)));
      zonaPregunta.append(grid);
      teclaNum = e => { const n = +e.key; if (n >= 1 && n <= 4) grid.children[n - 1].click(); };
    }
  }
  let teclaNum = null;
  const onKey = e => { if (teclaNum && !/INPUT/.test(document.activeElement?.tagName)) teclaNum(e); };
  addEventListener('keydown', onKey);

  let respondiendo = false;
  async function responder(k, resp, boton) {
    if (respondiendo) return;
    respondiendo = true;
    teclaNum = null;
    zonaPregunta.querySelector('input')?.setAttribute('disabled', '');
    const ok = resp === k.r || (k.r === 'wo' && resp === 'o') || (k.r === 'ji' && resp === 'zi') || (k.r === 'zu' && resp === 'du');
    srsResponder(claveKana(k), ok);
    hablar(k.k);
    [...zonaPregunta.querySelectorAll('button')].forEach(b => {
      b.disabled = true;
      if (b.textContent.endsWith(' ' + k.r)) b.classList.add('correcta');
    });
    if (ok) {
      aciertos++;
      combo++;
      const dmg = combo >= 3 ? 2 : 1;
      hpE = Math.max(0, hpE - dmg);
      sfx.bien(); sfx.golpe();
      cvE.classList.remove('sacudir'); void cvE.offsetWidth; cvE.classList.add('sacudir');
      flotar(dmg > 1 ? `¡COMBO -${dmg}!` : `-${dmg}`, cvE, '#ffd27a');
      info.replaceChildren(el('span.ok', `✓ ${k.k} = ${k.r}`), combo >= 3 ? el('span', `  🔥 combo x${combo}`) : '');
    } else {
      combo = 0;
      hpJ = Math.max(0, hpJ - 1);
      sfx.mal();
      boton?.classList.add('incorrecta');
      cvJ.classList.remove('sacudir'); void cvJ.offsetWidth; cvJ.classList.add('sacudir');
      flotar('-1 ♥', cvJ, '#ff8f8f');
      info.replaceChildren(el('span.no', `✗ ${k.k} se lee "${k.r}"`), MNEMO[k.k] ? el('div', `💡 ${MNEMO[k.k]}`) : null);
    }
    actualizarHP();
    guardar();
    await esperar(ok ? 650 : 1900);
    respondiendo = false;
    if (hpE <= 0) return fin(true);
    if (hpJ <= 0) return fin(false);
    siguiente();
  }

  function fin(gano) {
    terminado = true;
    const xp = gano ? 20 + aciertos : 5 + Math.floor(aciertos / 2);
    if (gano) { sfx.subir(); evento('kana_ganada'); }
    ganarXP('jp', xp, gano ? 'yokai derrotado' : 'buen intento');
    zonaPregunta.replaceChildren(
      el('div.mediano', gano ? `¡Derrotaste a ${yokai.n}!` : `${yokai.n} ganó esta vez…`),
      el('div', `${aciertos} aciertos · +${xp} XP`),
      el('div.fila.centro',
        el('button.btn.prim', { onclick: () => ctx.rehacer() }, '⚔ Otra batalla'),
        el('button.btn', { onclick: () => ctx.volver() }, 'Volver al dojo')));
    info.textContent = '';
  }

  actualizarHP();
  siguiente();
  return () => removeEventListener('keydown', onKey);
}

// ---------- Vocabulario ----------
function menuVocab(c, ctx) {
  const base = poolVocab();
  const res = srsResumen(base, claveVoc);
  const lecciones = avanzado() ? [...LECCIONES_AVANZADAS.filter(n => P.jp.nivel === 'n3' || n.startsWith('N4') || n.startsWith('Café')), ...NOMBRES_LECCIONES] : NOMBRES_LECCIONES;
  c.append(
    el('div.fila',
      el('button.btn.prim', { onclick: () => ctx.ir('Repaso del día', (cc, cx) => sesionVocab(cc, cx, base)) },
        `▶ Repaso del día (${res.vencidos} pendientes + nuevas)`),
      el('span.suave', `${res.dominados}/${res.total} palabras dominadas`)),
    el('div.suave', 'O elegí una lección:'),
    el('div.rejilla', lecciones.map(n => {
      const items = TODO_VOCAB.filter(v => v.leccion === n);
      const r = srsResumen(items, claveVoc);
      return el('button.tarjeta', { onclick: () => ctx.ir(n, (cc, cx) => sesionVocab(cc, cx, items)) },
        el('div.t-tit', n),
        el('div.t-desc', items.slice(0, 4).map(v => v.p).join('・') + '…'),
        el('div.t-tag', `${r.dominados}/${r.total}`));
    })));
}

export function sesionVocab(c, ctx, items, soloModos = null) {
  const clave = soloModos ? (v => 'kanji:' + v.p) : claveVoc;
  const cola = srsCola(items, clave, 12, avanzado() ? 8 : 5);
  let i = 0, ok = 0;
  c.classList.add('centro');
  const cont = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' } });
  const prog = el('div.suave');
  c.append(prog, cont);
  let teclaNum = null;
  const onKey = e => { if (teclaNum && !/INPUT/.test(document.activeElement?.tagName)) teclaNum(e); };
  addEventListener('keydown', onKey);

  const palabraNodo = v => {
    const toks = [{ t: v.p, r: v.r, s: v.s }];
    return renderTokens(toks, { furigana: P.jp.furigana || P.jp.nivel === 'cero' }).nodo;
  };

  function siguiente() {
    teclaNum = null;
    if (i >= cola.length) return fin();
    const v = cola[i++];
    delete cont.dataset.respondida;
    prog.textContent = `${i}/${cola.length}`;
    const caja = srsDato(clave(v))?.c || 0;
    let tipos = caja === 0 ? ['jp-es', 'escuchar'] : caja < 3 ? ['jp-es', 'es-jp', 'escuchar'] : ['es-jp', 'escribir', 'escuchar'];
    if (avanzado() && tieneKanji(v.p)) tipos = caja < 2 ? ['lectura', 'jp-es', 'escuchar'] : ['lectura', 'es-jp', 'escribir', 'escribir-lectura'];
    if (soloModos) tipos = caja < 2 ? [soloModos[0]] : soloModos;
    const modo = elegir(tipos);
    const fuente = items.length >= 8 ? items : TODO_VOCAB;
    const otros = distractores(fuente, 3, x => x.p === v.p || x.s === v.s || x.r === v.r);
    cont.replaceChildren();
    const opcionesBtn = (ops, etiqueta) => {
      const g = el('div.opciones4', ops.map((o, n) => el('button.btn', { onclick: e => responder(v, o === v, e.currentTarget) }, el('span.suave', `${n + 1} `), etiqueta(o))));
      teclaNum = e => { const n = +e.key; if (n >= 1 && n <= 4) g.children[n - 1].click(); };
      g.dataset.correcta = ops.indexOf(v);
      return g;
    };
    if (modo === 'lectura') {
      cont.append(el('div.suave', '¿Cómo se lee?'), el('div.grande', { style: { fontSize: 'calc(var(--px) * 16)' } }, v.p),
        opcionesBtn(mezclar([v, ...otros]), o => o.r));
    } else if (modo === 'escribir-lectura') {
      const inp = el('input.entrada', { placeholder: 'lectura en romaji o kana', autocomplete: 'off', style: { textAlign: 'center', width: '14em' } });
      const vista = el('div.mediano', { style: { minHeight: '1.2em', color: 'var(--sakura2)' } });
      inp.addEventListener('input', () => { vista.textContent = aKana(inp.value); });
      inp.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Enter' && inp.value.trim()) responder(v, aKana(inp.value.trim()) === v.r, inp);
      });
      cont.append(el('div.suave', 'Escribí la lectura'), el('div.grande', { style: { fontSize: 'calc(var(--px) * 16)' } }, v.p), inp, vista);
      setTimeout(() => inp.focus(), 30);
    } else if (modo === 'jp-es') {
      cont.append(el('div.suave', '¿Qué significa?'), el('div.grande', { style: { fontSize: 'calc(var(--px) * 16)' } }, palabraNodo(v)),
        P.jp.romaji ? el('div.suave', aRomaji(v.r)) : null,
        opcionesBtn(mezclar([v, ...otros]), o => o.s));
      hablar(v.r);
    } else if (modo === 'es-jp') {
      cont.append(el('div.suave', '¿Cómo se dice?'), el('div.mediano', v.s),
        opcionesBtn(mezclar([v, ...otros]), o => el('span', o.p, tieneKanji(o.p) && P.jp.furigana ? el('span.suave', ` (${o.r})`) : '')));
    } else if (modo === 'escuchar') {
      cont.append(el('div.suave', 'Escuchá y elegí'), el('button.btn.mediano', { onclick: () => hablar(v.r, 'ja', 0.8) }, '🔊'),
        opcionesBtn(mezclar([v, ...otros]), o => el('span', o.p, el('span.suave', ` · ${o.s}`))));
      setTimeout(() => hablar(v.r, 'ja', 0.8), 200);
    } else {
      const inp = el('input.entrada', { placeholder: 'escribí la lectura en romaji', autocomplete: 'off', style: { textAlign: 'center', width: '14em' } });
      const vista = el('div.mediano', { style: { minHeight: '1.2em', color: 'var(--sakura2)' } });
      inp.addEventListener('input', () => { vista.textContent = aKana(inp.value); });
      inp.addEventListener('keydown', e => {
        e.stopPropagation();
        if (e.key === 'Enter' && inp.value.trim()) {
          const kana = aKana(inp.value.trim());
          const bien = kana === v.r || aKana(inp.value.trim(), true) === v.r;
          responder(v, bien, inp);
        }
      });
      cont.append(el('div.suave', 'Escribí en japonés (romaji se convierte solo)'), el('div.mediano', v.s), inp, vista);
      setTimeout(() => inp.focus(), 30);
    }
  }

  async function responder(v, bien, nodo) {
    if (cont.dataset.respondida) return;
    cont.dataset.respondida = '1';
    teclaNum = null;
    if (nodo?.tagName === 'INPUT') nodo.disabled = true;
    srsResponder(clave(v), bien);
    const grid = cont.querySelector('.opciones4');
    if (grid) [...grid.children].forEach((b, n) => { b.disabled = true; if (n === +grid.dataset.correcta) b.classList.add('correcta'); });
    if (bien) { ok++; sfx.bien(); evento('vocab_ok'); } else { sfx.mal(); nodo?.classList?.add('incorrecta'); }
    hablar(v.r);
    cont.append(el('div', { style: { fontSize: '1.1em' } },
      el('span' + (bien ? '.ok' : '.no'), bien ? '✓ ' : '✗ '), `${v.p}`, v.p !== v.r ? `（${v.r}）` : '', ` · ${aRomaji(v.r)} · ${v.s}`),
      el('button.btn.prim', { onclick: siguiente }, 'Siguiente ▶ (Enter)'));
    const sig = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); removeEventListener('keydown', sig, true); siguiente(); } };
    setTimeout(() => addEventListener('keydown', sig, true), 150);
    cont.querySelector('.btn.prim').addEventListener('click', () => removeEventListener('keydown', sig, true));
    guardar();
  }

  function fin() {
    const xp = 6 + ok * 2;
    ganarXP('jp', xp, 'repaso de vocabulario');
    cont.replaceChildren(el('div.mediano', `${ok}/${cola.length} correctas`), el('div', `+${xp} XP`),
      el('div.fila.centro', el('button.btn.prim', { onclick: () => ctx.rehacer() }, 'Otra ronda'), el('button.btn', { onclick: () => ctx.volver() }, 'Volver')));
  }
  siguiente();
  return () => removeEventListener('keydown', onKey);
}

// ---------- Gramática N4–N3 ----------
function gramatica(c, ctx) {
  const pool = GRAMATICA.filter(g => P.jp.nivel === 'n3' || g.n === 'n4');
  const cola = srsCola(pool, g => 'gram:' + g.s, 10, 10);
  let i = 0, ok = 0;
  c.classList.add('centro');
  const zona = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' } });
  c.append(zona);
  let teclaNum = null;
  const onKey = e => { if (teclaNum) teclaNum(e); };
  addEventListener('keydown', onKey);
  function sig() {
    teclaNum = null;
    if (i >= cola.length) {
      ganarXP('jp', 5 + ok * 3, 'gramática');
      zona.replaceChildren(el('div.mediano', `${ok}/${cola.length}`), el('div.fila.centro', el('button.btn.prim', { onclick: () => ctx.rehacer() }, 'Otra ronda'), el('button.btn', { onclick: () => ctx.volver() }, 'Volver')));
      return;
    }
    const g = cola[i++];
    const ops = mezclar(g.o.map((o, n) => ({ o, bien: n === 0 })));
    const [antes, despues] = g.s.split('＿＿');
    const hueco = el('span', { style: { borderBottom: '3px solid var(--sakura)', padding: '0 .4em', color: 'var(--sakura2)' } }, '　？　');
    const trad = el('div.suave', { style: { cursor: 'pointer' } }, '👁 traducción');
    trad.onclick = () => { trad.textContent = g.es; };
    const grid = el('div.opciones4', ops.map((x, n) => el('button.btn', { onclick: async e => {
      if (grid.dataset.listo) return;
      grid.dataset.listo = '1';
      teclaNum = null;
      [...grid.children].forEach((b, m) => { b.disabled = true; if (ops[m].bien) b.classList.add('correcta'); });
      hueco.textContent = ops.find(z => z.bien).o;
      srsResponder('gram:' + g.s, x.bien);
      if (x.bien) { ok++; sfx.bien(); evento('gramatica_ok'); evento('vocab_ok'); } else { sfx.mal(); e.currentTarget.classList.add('incorrecta'); }
      hablar(antes + ops.find(z => z.bien).o + despues);
      trad.textContent = g.es;
      zona.append(el('div', `💡 ${g.e}`), el('button.btn.prim', { onclick: sig }, 'Siguiente ▶'));
      guardar();
    } }, el('span.suave', `${n + 1} `), x.o)));
    teclaNum = e => { const n = +e.key; if (n >= 1 && n <= 4) grid.children[n - 1].click(); };
    zona.replaceChildren(el('div.suave', `${i}/${cola.length} · ${g.n.toUpperCase()}`),
      el('div', { style: { fontSize: '1.35em', lineHeight: 1.6 } }, antes, hueco, despues), trad, grid);
  }
  sig();
  return () => removeEventListener('keydown', onKey);
}

// ---------- Lectura ----------
const HISTORIAS = [
  { titulo: 'あさのコーヒー', es: 'El café de la mañana', oraciones: [
    { m: '[朝|あさ|mañana]、[私|わたし|yo][は|わ|(tema)][コーヒー|café][を|(objeto)][飲みます|のみます|tomo]。', es: 'A la mañana tomo café.' },
    { m: '[コーヒー|café][は|わ|(tema)][熱い|あつい|caliente][です|es]。', es: 'El café está caliente.' },
    { m: '[砂糖|さとう|azúcar][は|わ|(tema)][入れません|いれません|no pongo]。', es: 'No le pongo azúcar.' },
    { m: '[それから|después]、[ピアノ|piano][を|(objeto)][練習|れんしゅう|práctica][します|hago]。', es: 'Después practico piano.' },
    { m: '[毎日|まいにち|todos los días][楽しい|たのしい|divertido][です|es]！', es: '¡Todos los días son divertidos!' },
  ], pregunta: { es: '¿Qué NO le pone al café?', ops: ['azúcar', 'leche', 'agua', 'nada'], ok: 0 } },
  { titulo: 'さくらのまち', es: 'El pueblo de los cerezos', oraciones: [
    { m: '[春|はる|primavera][です|es]。[桜|さくら|cerezos][が|(sujeto)][きれい|lindos][です|son]。', es: 'Es primavera. Los cerezos están lindos.' },
    { m: '[おばあさん|la abuela][と|con][猫|ねこ|gato][が|(sujeto)][います|hay/están]。', es: 'Están la abuela y el gato.' },
    { m: '[川|かわ|río][で|en][魚|さかな|peces][を|(objeto)][見ます|みます|miro]。', es: 'Miro los peces en el río.' },
    { m: '[喫茶店|きっさてん|cafetería][に|a][行きます|いきます|voy]。', es: 'Voy a la cafetería.' },
  ], pregunta: { es: '¿Adónde va al final?', ops: ['al río', 'a la cafetería', 'a la escuela', 'a casa'], ok: 1 } },
];

async function lectura(c, ctx) {
  let h = null;
  if (IA.disponible) {
    c.append(el('div.suave.escribiendo-ia', 'Haru-sensei está escribiendo una historia para vos'));
    const nivel = nivelIA();
    const tema = elegir(['café', 'piano', 'un gato', 'el tren', 'un día de lluvia', 'un festival', 'la comida', 'un amigo', 'el templo', 'la música']);
    const r = await preguntar(
      'Sos un profesor de japonés para hispanohablantes rioplatenses. Respondés SOLO JSON válido.',
      [{ role: 'user', content: `Escribí una historia corta (${avanzado() ? '6-8' : '4-6'} oraciones) en japonés sobre ${tema}, nivel ${nivel}. Separá cada oración en tokens (palabras/partículas) con lectura en hiragana y significado corto en castellano. Para la partícula は usá r:"わ"; para へ usá r:"え". Agregá una pregunta de comprensión en castellano con 4 opciones.
Formato exacto:
{"titulo":"título en japonés","es":"título en castellano","oraciones":[{"toks":[{"t":"朝","r":"あさ","s":"mañana"},{"t":"、","r":"、","s":""}],"es":"traducción"}],"pregunta":{"es":"pregunta","ops":["a","b","c","d"],"ok":0}}` }],
      { json: true, temperatura: 0.8, max_tokens: 2500 });
    if (r?.oraciones?.length && r.pregunta?.ops?.length) h = { ...r, oraciones: r.oraciones.map(o => ({ toks: normalizar(o.toks), es: o.es })) };
    c.replaceChildren();
  }
  if (!h) {
    const base = elegir(HISTORIAS);
    h = { ...base, oraciones: base.oraciones.map(o => ({ toks: parsear(o.m), es: o.es })) };
  }
  ctx.titulo(`読む ${h.titulo}`);
  const lista = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '1.15em' } });
  h.oraciones.forEach((o, n) => {
    const r = renderTokens(o.toks, { furigana: P.jp.furigana, romaji: P.jp.romaji });
    const trad = el('div.suave', { style: { fontSize: '.7em', cursor: 'pointer' } }, '👁 traducción');
    trad.onclick = () => { trad.textContent = o.es; };
    lista.append(el('div.panel',
      el('div.fila', el('button.btn.chico', { onclick: () => hablar(lecturaPlana(o.toks), 'ja', 0.85) }, '🔊'), el('span.suave', `${n + 1}`)),
      r.nodo, r.romajiNodo, trad));
  });
  const preg = el('div.panel',
    el('div', `❓ ${h.pregunta.es}`),
    el('div.opciones4', { style: { marginTop: '10px' } }, h.pregunta.ops.map((o, n) => el('button.btn', {
      onclick: e => {
        const bien = n === +h.pregunta.ok;
        e.currentTarget.parentNode.querySelectorAll('button').forEach((b, m) => { b.disabled = true; if (m === +h.pregunta.ok) b.classList.add('correcta'); });
        if (bien) sfx.bien(); else { sfx.mal(); e.currentTarget.classList.add('incorrecta'); }
        ganarXP('jp', bien ? 18 : 8, 'lectura');
        preg.append(el('div.fila', { style: { marginTop: '10px' } }, el('button.btn.prim', { onclick: () => ctx.rehacer() }, 'Otra historia')));
      },
    }, o))));
  c.append(el('div.suave', `「${h.es}」 — tocá las palabras subrayadas.`), lista, preg);
}

// ---------- Conversación con IA ----------
function menuConversacion(c, ctx) {
  if (!IA.disponible) {
    c.append(el('div.panel', el('div', '💤 La IA local está apagada.'),
      el('div.suave', 'Prendé "Iniciar IA" en el escritorio (o salí del Modo Juego) y volvé. Mientras tanto, hablá con los vecinos del pueblo: ellos te hablan en japonés sin IA.')));
  }
  c.append(el('div.rejilla', ESCENARIOS.map(s => el('button.tarjeta' + (IA.disponible ? '' : '.bloq'), {
    onclick: () => IA.disponible ? ctx.ir(`${s.ico} ${s.tit}`, (cc, cx) => chat(cc, cx, s)) : toast('Necesita la IA local encendida'),
  }, el('div.t-ico', s.ico), el('div.t-tit', s.tit), el('div.t-desc', s.desc)))));
}

function sistemaChat(esc) {
  const nivel = nivelIA();
  return `Sos ${esc.rol}. Estás practicando japonés con un alumno hispanohablante (Argentina) de nivel ${nivel}. Se llama ${nombreJugador()}.
Reglas:
- Respondé en japonés natural pero a su nivel, 1 o 2 oraciones como máximo, y hacé una pregunta para que siga la charla.
- Si el alumno escribe en castellano o se traba, ayudalo: decile cómo se diría en japonés (en "correccion").
- Si su último mensaje en japonés tiene errores, explicá la corrección en castellano rioplatense en 1 línea; si está bien, felicitalo breve o dejalo vacío.
- Respondé SOLO un JSON válido con este formato exacto:
{"toks":[{"t":"palabra","r":"lectura en hiragana","s":"significado en castellano"}],"es":"traducción completa","correccion":"","sugerencias":["respuesta posible 1 en japonés","respuesta posible 2"]}
- En toks, separá palabras y partículas; para la partícula は poné r:"わ". Las sugerencias en kana simple.`;
}

function chat(c, ctx, esc) {
  const hist = []; // mensajes para la IA
  const caja = el('div.chat');
  const suger = el('div.chips');
  const inp = el('input.entrada', { placeholder: 'Escribí en japonés, romaji (se convierte) o castellano…', style: { flex: 1 }, autocomplete: 'off' });
  const vista = el('div.suave', { style: { minHeight: '1.2em' } });
  const romajiAuto = el('input', { type: 'checkbox', checked: true });
  const enviarBtn = el('button.btn.prim', { onclick: () => enviar() }, 'Enviar');
  c.style.minHeight = 0;
  c.append(caja, suger, vista, el('div.fila', inp, enviarBtn), el('label.suave', romajiAuto, ' convertir romaji a kana'));

  const esRomaji = s => /^[a-z' .,!?-]+$/i.test(s) && !/\b(que|como|el|la|los|es|de|y|un|una|por|para|qué|cómo)\b/i.test(s);
  inp.addEventListener('input', () => { vista.textContent = romajiAuto.checked && esRomaji(inp.value) ? '→ ' + aKana(inp.value) : ''; });
  inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') enviar(); if (e.key === 'Escape') ctx.volver(); });

  function burbujaIA(r) {
    const toks = normalizar(r.toks);
    const rr = renderTokens(toks, { furigana: P.jp.furigana, romaji: P.jp.romaji });
    const trad = el('div.trad', { style: { cursor: 'pointer' } }, P.jp.nivel === 'cero' ? r.es : '👁 traducción');
    trad.onclick = () => { trad.textContent = r.es; };
    const b = el('div.burbuja.ellos', el('button.btn.chico', { style: { float: 'right', marginLeft: '8px' }, onclick: () => hablar(lecturaPlana(toks)) }, '🔊'), rr.nodo, rr.romajiNodo, trad,
      r.correccion ? el('div.corr', '✏️ ', r.correccion) : null);
    caja.append(b);
    caja.scrollTop = caja.scrollHeight;
    hablar(lecturaPlana(toks));
    suger.replaceChildren(...(r.sugerencias || []).slice(0, 3).map(s => el('button.chip', { onclick: () => { inp.value = s; enviar(); } }, s)));
  }

  async function pedir() {
    const pensando = el('div.burbuja.ellos.escribiendo-ia', '');
    caja.append(pensando);
    caja.scrollTop = caja.scrollHeight;
    enviarBtn.disabled = true;
    const r = await preguntar(sistemaChat(esc), hist.slice(-12), { json: true, temperatura: 0.75, max_tokens: 900 });
    pensando.remove();
    enviarBtn.disabled = false;
    if (!r || !r.toks) {
      caja.append(el('div.burbuja.ellos', 'ごめんなさい… (la IA no respondió bien, probá de nuevo)'));
      return;
    }
    hist.push({ role: 'assistant', content: JSON.stringify(r) });
    burbujaIA(r);
    inp.focus();
  }

  async function enviar() {
    let t = inp.value.trim();
    if (!t || enviarBtn.disabled) return;
    if (romajiAuto.checked && esRomaji(t)) t = aKana(t);
    inp.value = ''; vista.textContent = '';
    caja.append(el('div.burbuja.yo', t));
    hist.push({ role: 'user', content: t });
    evento('chat_jp');
    ganarXP('jp', /[぀-ヿ一-龯]/.test(t) ? 4 : 1);
    await pedir();
  }

  hist.push({ role: 'user', content: '(Empezá vos la conversación con un saludo y una pregunta simple.)' });
  pedir();
  setTimeout(() => inp.focus(), 50);
}

// ---------- Vecinos del pueblo (estilo Emulingo) ----------
function reemplazarNombre(m) {
  return m.replace('{nombre}', `[${nombreJugador()}|tu nombre]`).replace('{nombreEs}', P.nombreRomaji || 'yo');
}

async function charlaIA(v) {
  const nivel = nivelIA();
  const r = await preguntar('Generás diálogos para un juego de aprender japonés. Respondés SOLO JSON.',
    [{ role: 'user', content: `Personaje: ${v.es} (${v.nombre}) de un pueblito japonés. Nivel del alumno: ${nivel}. Inventá UNA frase que el personaje le dice al alumno (algo cotidiano y distinto cada vez) y 3 respuestas posibles en japonés: 1 adecuada y 2 que no tienen sentido en el contexto.
{"toks":[{"t":"palabra","r":"lectura hiragana","s":"significado"}],"es":"traducción","r":[{"toks":[...],"es":"traducción","ok":1},{"toks":[...],"es":"...","ok":0},{"toks":[...],"es":"...","ok":0}]}
Para は partícula usá r:"わ".` }], { json: true, temperatura: 0.95, max_tokens: 1500 });
  if (!r?.toks || !Array.isArray(r.r) || r.r.length < 2) return null;
  return { toks: normalizar(r.toks), es: r.es, r: r.r.map(x => ({ toks: normalizar(x.toks), es: x.es, ok: !!+x.ok })) };
}

export async function charlarVecino(id) {
  const v = VECINOS[id];
  P.jp.vistas ??= {};
  const idx = P.jp.vistas[id] || 0;
  let ch = null;
  // primero las charlas guionadas; cuando se agotan, la IA inventa nuevas (si está)
  const conv = base => ({ toks: parsear(reemplazarNombre(base.ja)), es: base.es, r: base.r.map(x => ({ toks: parsear(reemplazarNombre(x.ja)), es: reemplazarNombre(x.es), ok: !!x.ok })) });
  if (avanzado()) {
    // N4–N3: la IA inventa charlas nuevas; sin IA, el banco de charlas naturales
    if (IA.disponible) { decir({ nombre: v.nombre, texto: '…' }); ch = await charlaIA(v); }
    if (!ch) ch = conv(CHARLAS_N3[(P.jp.vistasN3 = ((P.jp.vistasN3 ?? -1) + 1)) % CHARLAS_N3.length]);
  } else if (idx < v.charlas.length || !IA.disponible) {
    const base = v.charlas[idx % v.charlas.length];
    ch = { toks: parsear(reemplazarNombre(base.ja)), es: base.es, r: base.r.map(x => ({ toks: parsear(reemplazarNombre(x.ja)), es: reemplazarNombre(x.es), ok: !!x.ok })) };
  } else {
    decir({ nombre: v.nombre, texto: '…' });
    ch = await charlaIA(v);
    if (!ch) {
      const base = elegir(v.charlas);
      ch = { toks: parsear(reemplazarNombre(base.ja)), es: base.es, r: base.r.map(x => ({ toks: parsear(reemplazarNombre(x.ja)), es: reemplazarNombre(x.es), ok: !!x.ok })) };
    }
  }
  P.jp.vistas[id] = idx + 1;
  hablar(lecturaPlana(ch.toks));
  const ayuda = P.jp.nivel === 'cero';
  const ops = mezclar(ch.r).map(x => ({ toks: x.toks, valor: x, romaji: ayuda ? aRomaji(lecturaPlana(x.toks)) : null }));
  const elegida = await decir({ nombre: v.nombre, toks: ch.toks, trad: ch.es, tradOculta: !ayuda, opciones: ops, cancelable: true });
  if (!elegida) return cerrarDialogo();
  hablar(lecturaPlana(elegida.toks));
  const cara = tipo => dispatchEvent(new CustomEvent('sando:expresion', { detail: tipo })); // la cara de Arky
  if (elegida.ok) {
    sfx.bien();
    cara('feliz');
    evento('vecino_jp');
    ganarXP('jp', 6, 'charla con vecino');
    await decir({ nombre: v.nombre, toks: parsear(elegir(['[うん|sí]、[そうそう|eso eso]！', '[ありがとう|gracias]！', '[いいね|qué bueno]！', '[へえ|ah, mirá]、[すごい|genial]！'])), trad: `✓ Bien. Elegiste: "${elegida.es}"` });
  } else {
    sfx.mal();
    cara('sorprendido');
    const buena = ch.r.find(x => x.ok);
    await decir({ nombre: v.nombre, toks: parsear('[え|eh]…？'), trad: `✗ "${elegida.es}" no encaja. Mejor: "${lecturaPlana(buena.toks)}" (${buena.es})` });
    ganarXP('jp', 1);
  }
  cerrarDialogo();
}
