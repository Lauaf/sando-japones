# 道場 Sandō · Japonés

El dojo de Haru-sensei: japonés desde cero hasta N3.

| | |
|---|---|
| **Batallas de kana** | Derrotá yokai leyendo hiragana y katakana. Las filas nuevas se desbloquean al dominar las anteriores. |
| **Vocabulario** | Palabras útiles con repaso espaciado (Leitner): escuchar, leer y escribir. |
| **Lectura** | Historias cortas a tu nivel; tocá cualquier palabra para ver su significado y escucharla. |
| **Gramática N4/N3** | Completá el hueco (ように, ことになる, はず, わけ, おかげで…). |
| **Conversación** | Charlá en japonés con la IA en situaciones reales; te corrige. |

La primera vez te pregunta desde dónde arrancás (cero, kana, N5, N4, N3). Las misiones del día y los logros (hiragana, katakana, rachas) son de esta senda.

## Cómo correrla

Necesitás Python 3 (solo la biblioteca estándar).

```bash
python server.py            # abre http://127.0.0.1:8771 en el navegador
python server.py --no-abrir --puerto 8771
```

En Windows, `iniciar.pyw` levanta el servidor (o lo reinicia si el código cambió) y abre la app en una ventana de Edge. Cada senda usa su propio puerto, así que podés tener varias abiertas a la vez.

### Controles

Todo se puede usar con mouse, con el teclado (flechas para moverse entre opciones, Enter para elegir, Esc o X para volver) o con un joystick (A elegir, B volver). Arriba: tu nivel y progreso (clic en el nombre), las misiones del día y las opciones.

## Partida y respaldo

El progreso (nivel, racha, misiones del día, logros) se guarda solo en `datos/partida.json` (con una copia por día) y en el navegador. Desde **Opciones** podés exportar un respaldo y restaurarlo.

Como usa el mismo formato que [Sandō](https://github.com/Lauaf/Sando), podés exportar tu partida desde Sandō y restaurarla acá para seguir con el mismo progreso.

## IA local (opcional)

Si hay un modelo local corriendo, la conversación y las historias se generan en el momento; sin IA funciona igual con el contenido incluido. Primero se prueba Qwen (EXL3, puerto 8888) y después Ollama (puerto 11434).

## Relación con Sandō

Esta app es una de las sendas de [Sandō](https://github.com/Lauaf/Sando), el pueblo pixel art donde se practica japonés, piano y café, separada para usarla sola. Es una copia independiente: conserva el historial de commits de sus archivos y desde acá evoluciona por su cuenta.

## Estructura

```
server.py              servidor local: archivos, partida y puente a la IA
iniciar.pyw            lanzador para Windows
web/
  index.html, estilo.css
  js/app.js            arranque de la app
  js/perfil.js         mi progreso: nivel, misiones, últimas dos semanas y logros
  js/progreso.js       XP, niveles, racha, misiones, logros, repaso espaciado y guardado
  js/actividad.js      pantallas (pila con Esc para volver, navegación con flechas)
  js/opciones.js       opciones y respaldo
  js/dialogo.js, js/jp/texto.js, js/ia.js, js/mando.js, js/util.js   piezas compartidas
  js/japones.js        el dojo
  js/datos/            kana, vocabulario, frases y gramática N4/N3
  assets/arky/         Arky, tu compañero en las batallas
```

No hay paso de build ni dependencias de npm: la app son módulos ES servidos tal cual.
