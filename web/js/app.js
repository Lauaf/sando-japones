// 道場 Dojo de japonés: Japonés desde cero hasta N3: batallas de kana, vocabulario con repaso espaciado, lectura, gramática y charla con IA.
// App independiente de una de las sendas de Sandō, sin el pueblo: abre directo en su pantalla principal.
import { $, audio } from './util.js';
import { cargar, P, pintarHUD, sincronizar } from './progreso.js';
import { actividad, ir, tituloActual } from './actividad.js';
import { dialogo } from './dialogo.js';
import { revisarIA } from './ia.js';
import { aplicarOpciones, pantallaOpciones } from './opciones.js';
import { montarMando } from './mando.js';
import { pantallaPerfil, pantallaMisiones } from './perfil.js';
import { abrirDojo as abrirPrincipal } from './japones.js';
import { decir, cerrar as cerrarDialogo } from './dialogo.js';
import { guardar } from './progreso.js';

const GBA = { w: 240, h: 160 };

/** Escala la pantalla (proporción GBA, como en Sandō) al espacio libre. */
function ajustarTamano() {
  const alto = sel => { const n = $(sel); return n && getComputedStyle(n).display !== 'none' ? n.offsetHeight : 0; };
  const disponibleAlto = innerHeight - alto('#hud') - alto('#ayuda') - 34;
  const disponibleAncho = innerWidth - (innerWidth < 500 ? 16 : 40);
  let escala = Math.min(disponibleAncho / GBA.w, disponibleAlto / GBA.h);
  if (P.opciones?.escalaEntera && escala >= 2) escala = Math.floor(escala);
  else if (Math.floor(escala) >= 3 && Math.floor(escala) / escala > 0.86) escala = Math.floor(escala);
  escala = Math.max(1.4, escala);
  const r = document.documentElement.style;
  r.setProperty('--ancho', `${Math.round(GBA.w * escala)}px`);
  r.setProperty('--alto', `${Math.round(GBA.h * escala)}px`);
  r.setProperty('--px', `${escala}px`);
  requestAnimationFrame(() => {
    const p = $('#pantalla').getBoundingClientRect();
    r.setProperty('--pant-top', `${Math.max(8, p.top + 8)}px`);
    r.setProperty('--pant-right', `${Math.max(8, innerWidth - p.right + 8)}px`);
  });
}

/** Abre una pantalla de la barra de arriba encima de lo que estés haciendo (si no está abierta ya). */
function abrirEncima(titulo, render) {
  if (!actividad.abierta || dialogo.activo || tituloActual() === titulo) return;
  ir(titulo, render);
}

async function primeraVez() {
  // como en el pueblo: la primera vez Haru-sensei pregunta desde dónde arrancás
  if (P.jp.nivel) return;
  const nv = await decir({ nombre: 'ハル先生 Haru-sensei', texto: '¡Bienvenido al dojo! ¿Cuánto japonés sabés?', opciones: [
    { txt: 'Nada, arranco de cero', valor: 'cero' }, { txt: 'Leo hiragana y katakana', valor: 'kana' },
    { txt: 'N5', valor: 'n5' }, { txt: 'N4', valor: 'n4' }, { txt: 'N3', valor: 'n3' }] });
  P.jp.nivel = nv;
  P.jp.romaji = nv === 'cero';
  guardar();
  cerrarDialogo();
}

async function iniciar() {
  await cargar();
  aplicarOpciones();
  montarMando();
  ajustarTamano();
  addEventListener('resize', ajustarTamano);
  addEventListener('sando:opciones', ajustarTamano);
  pintarHUD();

  addEventListener('keydown', () => audio()); // el navegador exige un gesto para habilitar el audio
  addEventListener('pointerdown', () => audio(), { once: true });
  $('#hud-perfil').addEventListener('click', () => abrirEncima('Mi progreso', pantallaPerfil));
  $('#hud-misiones').addEventListener('click', () => abrirEncima('✅ Misiones de hoy', pantallaMisiones));
  $('#btn-menu').addEventListener('click', () => abrirEncima('⚙️ Opciones', pantallaOpciones));

  // otra ventana pudo haber guardado mientras esta estaba en segundo plano
  const alVolver = () => { if (!document.hidden && !dialogo.activo) sincronizar(); };
  document.addEventListener('visibilitychange', alVolver);
  addEventListener('focus', alVolver);

  revisarIA();
  setInterval(revisarIA, 30000);
  setInterval(pintarHUD, 60000);

  await primeraVez();
  actividad.fija = true; // la pantalla principal no se cierra: es la app
  abrirPrincipal();
}

iniciar();
