// Vecinos del pueblo que te hablan en japonés (el corazón "Emulingo" del juego).
// Cada intercambio: lo que dice el vecino + respuestas posibles (una o más correctas).
// Markup: [superficie|lectura|significado] o [superficie|significado]

export const VECINOS = {
  mio: {
    nombre: 'みお',
    es: 'Mio (la acomodadora del cine)',
    charlas: [
      { ja: '[映画|えいが|película][が|(sujeto)][好き|すき|que gusta][ですか|¿es?]？', es: '¿Te gustan las películas?',
        r: [{ ja: '[はい|sí]、[大好き|だいすき|me encanta][です|es]！', es: '¡Sí, me encantan!', ok: 1 }, { ja: '[水|みず|agua][を|(objeto)][ください|por favor]。', es: 'Agua, por favor.' }, { ja: '[おやすみ|que descanses]。', es: 'Que descanses.' }] },
      { ja: '[字幕|じまく|subtítulos][の|de][言葉|ことば|palabras][を|(objeto)][触って|さわって|tocá][みて|probá]！', es: '¡Probá tocar las palabras de los subtítulos!',
        r: [{ ja: '[はい|sí]、[やってみます|voy a probar]！', es: '¡Sí, voy a probar!', ok: 1 }, { ja: '[百|ひゃく|cien][円|えん|yenes][です|es]。', es: 'Son cien yenes.' }, { ja: '[ごちそうさま|gracias por la comida]。', es: 'Gracias por la comida.' }] },
      { ja: '[今日|きょう|hoy][は|わ|(tema)][何|なに|qué][を|(objeto)][見ます|みます|vas a ver]か？', es: '¿Qué vas a ver hoy?',
        r: [{ ja: '[アニメ|animé][を|(objeto)][見ます|みます|voy a ver]！', es: '¡Voy a ver animé!', ok: 1 }, { ja: '[ドラマ|serie][です|es]。', es: 'Una serie.', ok: 1 }, { ja: '[雨|あめ|lluvia][です|es]。', es: 'Es lluvia.' }] },
    ],
  },
  obaasan: {
    nombre: 'おばあさん',
    es: 'Obaa-san (la abuela)',
    charlas: [
      { ja: '[こんにちは|hola]！[いい|bueno][天気|てんき|clima][ですね|es, ¿no?]。', es: '¡Hola! Lindo día, ¿no?',
        r: [{ ja: '[そうですね|así es]！', es: '¡Así es!', ok: 1 }, { ja: '[おやすみ|que descanses]。', es: 'Que descanses.' }, { ja: '[いただきます|¡a comer!]。', es: '¡A comer!' }] },
      { ja: '[桜|さくら|cerezo][が|(sujeto)][きれい|lindo][ですね|es, ¿no?]。', es: 'Los cerezos están lindos, ¿no?',
        r: [{ ja: '[はい|sí]、[きれい|lindo][です|es]ね。', es: 'Sí, son lindos.', ok: 1 }, { ja: '[いいえ|no]、[コーヒー|café][です|es]。', es: 'No, es café.' }, { ja: '[三|さん|tres][です|es]。', es: 'Son tres.' }] },
      { ja: '[お名前|おなまえ|nombre (cortés)][は|わ|(tema)]？', es: '¿Y tu nombre?',
        r: [{ ja: '[私|わたし|yo][は|わ|(tema)]{nombre}[です|soy]。', es: 'Yo soy {nombreEs}.', ok: 1 }, { ja: '[日本|にほん|Japón][です|es]。', es: 'Es Japón.' }, { ja: '[ありがとう|gracias]。', es: 'Gracias.' }] },
      { ja: '[猫|ねこ|gato][が|(sujeto)][好き|すき|que gusta][ですか|¿es?]？', es: '¿Te gustan los gatos?',
        r: [{ ja: '[はい|sí]、[大好き|だいすき|me encanta][です|es]！', es: '¡Sí, me encantan!', ok: 1 }, { ja: '[いいえ|no]、[苦手|にがて|no me llevo bien][です|es]。', es: 'No, no me llevo bien con ellos.', ok: 1 }, { ja: '[駅|えき|estación][です|es]。', es: 'Es la estación.' }] },
    ],
  },
  kenta: {
    nombre: 'けんた',
    es: 'Kenta (nene)',
    charlas: [
      { ja: '[一緒|いっしょ|juntos][に|(modo)][遊ぼう|あそぼう|juguemos]！', es: '¡Juguemos juntos!',
        r: [{ ja: '[うん|sí (informal)]、[いいよ|dale]！', es: '¡Sí, dale!', ok: 1 }, { ja: '[こんばんは|buenas noches]。', es: 'Buenas noches.' }, { ja: '[百|ひゃく|cien][円|えん|yenes][です|es]。', es: 'Son cien yenes.' }] },
      { ja: '[ねえ|che]、[何歳|なんさい|cuántos años]？', es: 'Che, ¿cuántos años tenés?',
        r: [{ ja: '[秘密|ひみつ|secreto]！', es: '¡Es secreto!', ok: 1 }, { ja: '[二十|にじゅう|veinte][歳|さい|años]…[くらい|más o menos]。', es: 'Veinte… más o menos.', ok: 1 }, { ja: '[水|みず|agua][を|(objeto)][ください|por favor]。', es: 'Agua, por favor.' }] },
      { ja: '[ピアノ|piano][の|de][音|おと|sonido][が|(sujeto)][聞こえる|きこえる|se escucha]！', es: '¡Se escucha el piano!',
        r: [{ ja: '[本当|ほんとう|verdad]だ！[きれい|lindo]だね。', es: '¡Es verdad! Qué lindo.', ok: 1 }, { ja: '[いただきます|¡a comer!]！', es: '¡A comer!' }, { ja: '[雨|あめ|lluvia][です|es]。', es: 'Es lluvia.' }] },
    ],
  },
  yubin: {
    nombre: 'ゆうびんやさん',
    es: 'el cartero',
    charlas: [
      { ja: '[おはようございます|buen día (cortés)]！', es: '¡Buen día!',
        r: [{ ja: '[おはようございます|buen día (cortés)]！', es: '¡Buen día!', ok: 1 }, { ja: '[こんばんは|buenas noches]！', es: '¡Buenas noches!' }, { ja: '[ごちそうさま|gracias por la comida]。', es: 'Gracias por la comida.' }] },
      { ja: '[今日|きょう|hoy][は|わ|(tema)][忙しい|いそがしい|ocupado][です|estoy]…', es: 'Hoy estoy ocupado…',
        r: [{ ja: '[がんばって|¡ánimo!]ください！', es: '¡Ánimo!', ok: 1 }, { ja: '[いただきます|¡a comer!]。', es: '¡A comer!' }, { ja: '[桜|さくら|cerezo][です|es]。', es: 'Es un cerezo.' }] },
      { ja: '[手紙|てがみ|carta][です|es]。[どうぞ|tome]。', es: 'Una carta. Tome.',
        r: [{ ja: '[ありがとうございます|muchas gracias]！', es: '¡Muchas gracias!', ok: 1 }, { ja: '[いいえ|no]、[雨|あめ|lluvia][です|es]。', es: 'No, es lluvia.' }, { ja: '[さようなら|adiós]。', es: 'Adiós.' }] },
    ],
  },
  tsuri: {
    nombre: 'つりびと',
    es: 'el pescador',
    charlas: [
      { ja: '[川|かわ|río][は|わ|(tema)][静か|しずか|tranquilo][ですね|es, ¿no?]。', es: 'El río está tranquilo, ¿no?',
        r: [{ ja: '[そうですね|así es]。', es: 'Así es.', ok: 1 }, { ja: '[うるさい|ruidoso][です|es]！', es: '¡Es ruidoso!' }, { ja: '[よろしく|un gusto]。', es: 'Un gusto.' }] },
      { ja: '[明日|あした|mañana][は|わ|(tema)][雨|あめ|lluvia][です|es]よ。', es: 'Mañana llueve, ¿eh?',
        r: [{ ja: '[そうですか|ah, ¿sí?]。', es: 'Ah, ¿sí?', ok: 1 }, { ja: '[はい|sí]、[パン|pan][です|es]。', es: 'Sí, es pan.' }, { ja: '[おはよう|buen día]。', es: 'Buen día.' }] },
      { ja: '[魚|さかな|pez][が|(sujeto)][いません|no hay]…', es: 'No hay peces…',
        r: [{ ja: '[残念|ざんねん|qué pena][です|es]ね。', es: 'Qué pena.', ok: 1 }, { ja: '[美味しい|おいしい|rico][です|es]！', es: '¡Está rico!' }, { ja: '[十|じゅう|diez][時|じ|en punto][です|son]。', es: 'Son las diez.' }] },
    ],
  },
  yuki: {
    nombre: 'ゆき',
    es: 'Yuki (clienta del café)',
    charlas: [
      { ja: '[コーヒー|café][を|(objeto)][飲みます|のみます|tomar][か|¿?]？', es: '¿Tomás café?',
        r: [{ ja: '[はい|sí]、[毎日|まいにち|todos los días][飲みます|のみます|tomo]。', es: 'Sí, tomo todos los días.', ok: 1 }, { ja: '[いいえ|no]、[お茶|おちゃ|té][が|(sujeto)][好き|すき|gusta][です|es]。', es: 'No, me gusta el té.', ok: 1 }, { ja: '[ピアノ|piano][です|es]。', es: 'Es un piano.' }] },
      { ja: '[この|este][コーヒー|café][は|わ|(tema)][ちょっと|un poco][苦い|にがい|amargo][です|es]…', es: 'Este café está un poco amargo…',
        r: [{ ja: '[砂糖|さとう|azúcar][は|わ|(tema)][いかがですか|¿qué tal?]？', es: '¿Qué tal un poco de azúcar?', ok: 1 }, { ja: '[おやすみなさい|que descanses]。', es: 'Que descanses.' }, { ja: '[山|やま|montaña][です|es]。', es: 'Es una montaña.' }] },
      { ja: '[喫茶店|きっさてん|cafetería][の|de][マスター|el dueño][は|わ|(tema)][上手|じょうず|hábil][です|es]ね。', es: 'El dueño del café es muy hábil, ¿no?',
        r: [{ ja: '[はい|sí]、[すごい|increíble][です|es]！', es: '¡Sí, es increíble!', ok: 1 }, { ja: '[いいえ|no]、[学生|がくせい|estudiante][です|soy]。', es: 'No, soy estudiante.' }, { ja: '[いくら|cuánto cuesta][ですか|¿?]？', es: '¿Cuánto cuesta?' }] },
    ],
  },
  hana: {
    nombre: 'はな',
    es: 'Hana (alumna de piano)',
    charlas: [
      { ja: '[ピアノ|piano][を|(objeto)][弾きます|ひきます|tocar][か|¿?]？', es: '¿Tocás el piano?',
        r: [{ ja: '[はい|sí]、[少し|すこし|un poco]。', es: 'Sí, un poco.', ok: 1 }, { ja: '[今|いま|ahora][練習|れんしゅう|práctica][中|ちゅう|en medio de][です|estoy]！', es: '¡Estoy practicando ahora!', ok: 1 }, { ja: '[お茶|おちゃ|té][です|es]。', es: 'Es té.' }] },
      { ja: '[毎日|まいにち|todos los días][練習|れんしゅう|práctica][します|hago]。[大変|たいへん|duro][です|es]…', es: 'Practico todos los días. Es duro…',
        r: [{ ja: '[一緒|いっしょ|juntos][に|(modo)][がんばろう|esforcémonos]！', es: '¡Esforcémonos juntos!', ok: 1 }, { ja: '[安い|やすい|barato][です|es]。', es: 'Es barato.' }, { ja: '[はじめまして|encantado]。', es: 'Encantado.' }] },
      { ja: '[好き|すき|favorito][な|(une adjetivo)][曲|きょく|tema musical][は|わ|(tema)][何|なん|qué][ですか|¿?]？', es: '¿Cuál es tu tema favorito?',
        r: [{ ja: '「[さくらさくら|Sakura Sakura]」[です|es]！', es: '¡"Sakura Sakura"!', ok: 1 }, { ja: '[ベートーベン|Beethoven][が|(sujeto)][好き|すき|gusta][です|es]。', es: 'Me gusta Beethoven.', ok: 1 }, { ja: '[駅|えき|estación][は|わ|(tema)][あそこ|allá][です|es]。', es: 'La estación está allá.' }] },
    ],
  },
};

// Escenarios para la conversación libre con IA (Haru-sensei hace de interlocutor).
export const ESCENARIOS = [
  { id: 'presentacion', ico: '👋', tit: 'Presentarte', desc: 'Conocés a alguien nuevo en el templo.', rol: 'una persona amable que conoce al alumno en un santuario y le pregunta su nombre, de dónde es y sus hobbies' },
  { id: 'kissaten', ico: '☕', tit: 'Pedir en un kissaten', desc: 'Pedí un café en una cafetería de Tokio.', rol: 'el/la mozo/a de un kissaten (cafetería tradicional) en Tokio que toma el pedido, pregunta si lo quiere caliente o frío, con leche o azúcar, y cobra' },
  { id: 'konbini', ico: '🏪', tit: 'En el konbini', desc: 'Comprá cosas y pagá en la caja.', rol: 'el cajero de un konbini que pregunta si quiere bolsa, si calienta la comida, y dice el total en yenes' },
  { id: 'direcciones', ico: '🗺️', tit: 'Preguntar el camino', desc: 'Estás perdido buscando la estación.', rol: 'un transeúnte que explica cómo llegar a la estación con indicaciones simples (derecha, izquierda, derecho)' },
  { id: 'musica', ico: '🎹', tit: 'Hablar de música', desc: 'Charlá con una pianista sobre lo que te gusta.', rol: 'una pianista que charla sobre música, compositores favoritos y cuánto practica' },
  { id: 'libre', ico: '💬', tit: 'Charla libre', desc: 'Lo que quieras, a tu nivel.', rol: 'Haru-sensei, un profesor de japonés paciente y divertido que charla de cualquier tema' },
];
