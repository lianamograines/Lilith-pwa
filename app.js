// Minimal interactive engine with save/restore and back-stack
const $ = s => document.querySelector(s);
const textEl = $('#text');
const choicesEl = $('#choices');
const backBtn = $('#btn-back');
const restartBtn = $('#btn-restart');
const saveBtn = $('#btn-save');
const loadBtn = $('#btn-load');
const menuBtn = $('#btn-menu');
const sheet = $('#menu');
const closeBtn = $('#btn-close');

// --- STORY DATA ---
const story = {
  start: "prologue",
  nodes: {
    prologue: {
      text: `Нил дышит ночной прохладой. Лилит стоит на песке у подножия пирамиды,\nладонь жжёт знак — шрам в форме глаза.\nЖрец Анубиса шепнул: «Выбор откроет врата. Но каждый путь забирает дань».`,
      choices: [
        { text: "Войти в пирамиду через затопленный ход", goto: "flooded", hint: "Холод, тьма и эхо" },
        { text: "Вызвать бога писцов Тота для знамения", goto: "thoth", hint: "Слово сильнее клинка" }
      ]
    },
    flooded: {
      text: `Вода по колено, стены в иле. На сводах — звёздные карты.\nВ тишине всплывает жук-скарабей, несёт золотой ключ.`,
      choices: [
        { text: "Взять ключ (принять дар Кепри)", goto: "key_taken" },
        { text: "Оттолкнуть скарабея (не принимать дар)", goto: "key_refused" }
      ]
    },
    key_taken: {
      text: `Ключ холоден и легок. На нём выгравирован знак «открывай лишь сердце».\nПроход впереди распахивается, но тень на стене двигается не в такт твоему дыханию.`,
      choices: [
        { text: "Войти в зал с колоннами", goto: "hall" },
        { text: "Отступить и вернуться к развилке", goto: "prologue" }
      ]
    },
    key_refused: {
      text: `Скарабей тонет в темноте. Стены начинают сходиться. За спиной слышен шёпот: «Отвергнув дар, ты заплатила временем».`,
      choices: [
        { text: "Пробиться вперёд", goto: "hall", hint: "Будет сложнее" },
        { text: "Вернуться к началу", goto: "prologue" }
      ]
    },
    hall: {
      text: `Колонны нарисованы как папирусные стебли. На полу — шахматная сетка Маа́т.\nВ центре — весы, на чашах перо и сердце. Голос: «Правда или желание, Лилит?»`,
      choices: [
        { text: "Выбрать Правду (Маат)", goto: "maat" },
        { text: "Выбрать Желание (Исида)", goto: "isis" }
      ]
    },
    maat: {
      text: `Ты кладёшь ладонь на перо. Шрам-глаз теплеет. Вспышка — и ты видишь память,\nкоторую прятала: ты пришла не за сокровищем, а за именем, способным вернуть кого-то из Дуата.`,
      choices: [
        { text: "Признать это вслух", goto: "confess" },
        { text: "Сохранить молчание", goto: "silence" }
      ]
    },
    confess: {
      text: `Зал принимает твои слова. Из песка поднимается шакал Анубиса.\n«Имя дано тому, кто не лжёт себе». Он дарит тебе шнур с узлом-картушем.`,
      choices: [
        { text: "Взять шнур и назвать имя", goto: "name" },
        { text: "Поклониться и уйти с даром", goto: "ending_wanderer" }
      ]
    },
    silence: {
      text: `Перевесило сердце. Факелы гаснут по одному.\nШёпот: «Желая не названное, теряешь названное». Дверь назад остаётся приоткрыта.`,
      choices: [
        { text: "Вернуться к развилке", goto: "prologue" },
        { text: "Идти во тьму", goto: "ending_lost" }
      ]
    },
    isis: {
      text: `Ты выбираешь Желание — и кружево ветра приносит запах лотоса.\nЛёгкие шаги. Женщина с троном на голове улыбается: «Желание — это тоже имя».`,
      choices: [
        { text: "Попросить сил изменить судьбу", goto: "isis_power" },
        { text: "Попросить вернуть ушедшего", goto: "isis_return" }
      ]
    },
    isis_power: {
      text: `Исида касается твоего шрама. «Сила — это цепь выборов». На коже возникает второй знак — змея-ураей.`,
      choices: [
        { text: "С новым знаком войти глубже", goto: "hall_deeper" },
        { text: "Сохранить силы и уйти", goto: "ending_wanderer" }
      ]
    },
    isis_return: {
      text: `«Вернуть можно имя, не тело», — шепчет Исида. В ладони появляется картуш с пустым местом.`,
      choices: [
        { text: "Записать имя (ввести вручную)", action: "inputName" },
        { text: "Не трогать картуш", goto: "prologue" }
      ]
    },
    hall_deeper: {
      text: `За колоннами — скрытая дверь. На пороге — статуя с головой ибиса.\n«Слово — крыло, молчание — камень», — говорит Тот.`,
      choices: [
        { text: "Принять письмена Тота (получить заклинание)", goto: "thoth_spell" },
        { text: "Отказаться и вернуться", goto: "prologue" }
      ]
    },
    thoth: {
      text: `Ты начертила знак луны. Песок зашептал, и из воздуха сложился ибис.\nТот кивает: «Спроси верно — получишь больше ответа».`,
      choices: [
        { text: "Спросить путь к имени", goto: "thoth_spell" },
        { text: "Спросить цену возвращения", goto: "thoth_price" }
      ]
    },
    thoth_spell: {
      text: `Тот дарит слово, что открывает уста мёртвых. Оно звенит, как серебро.\nНо предупреждает: «Слово без сердца — пустой звук».`,
      choices: [
        { text: "Идти к весам Маат", goto: "maat" },
        { text: "Искать тайный ход", goto: "secret" }
      ]
    },
    thoth_price: {
      text: `«Цена — часть тебя», — отвечает Тот. «Или память, или имя твоё». Песок рисует круг.`,
      choices: [
        { text: "Отдать память", goto: "ending_clean" },
        { text: "Отдать собственное имя", goto: "ending_nameless" }
      ]
    },
    secret: {
      text: `Ты замечаешь, что одна плита пола звучит иначе. Под ней — сухой ход.\nВ глубине — саркофаг без имени.`,
      choices: [
        { text: "Открыть саркофаг", goto: "ending_open" },
        { text: "Оставить в покое", goto: "prologue" }
      ]
    },
    name: {
      text: `Имя срывается с губ. Узел-картуш вспыхивает. Воздух густеет,\nи на миг ты слышишь знакомый смех — ответ из Дуата.`,
      choices: [
        { text: "Протянуть руку в свет", goto: "ending_reunion" },
        { text: "Опустить узел в Нил", goto: "ending_clean" }
      ]
    },

    // Endings
    ending_reunion: {
      text: `Финал: Воссоединение. Свет обнимает тебя, и тень уходит. Ты платила правдой и получила имя.`,
      choices: [{ text: "Сыграть снова", goto: "prologue" }]
    },
    ending_wanderer: {
      text: `Финал: Странница. Ты уходишь в пустыню со знанием, но без свершения. Песок стирает следы.`,
      choices: [{ text: "Сыграть снова", goto: "prologue" }]
    },
    ending_lost: {
      text: `Финал: Заблудшая. Тишина становится океаном без берегов. Иногда это тоже выбор.`,
      choices: [{ text: "Сыграть снова", goto: "prologue" }]
    },
    ending_open: {
      text: `Финал: Нарушенный покой. Когда ты открываешь саркофаг, мир делает вдох — и задерживает его.`,
      choices: [{ text: "Сыграть снова", goto: "prologue" }]
    },
    ending_clean: {
      text: `Финал: Чистая вода. Нил уносит то, что ты принесла. Память стирает углы боли.`,
      choices: [{ text: "Сыграть снова", goto: "prologue" }]
    },
    ending_nameless: {
      text: `Финал: Безымянная. Лилит — теперь слово без привязки. Но даже без имени ветер знает тебя.`,
      choices: [{ text: "Сыграть снова", goto: "prologue" }]
    }
  }
};

// State & history
let current = story.start;
let stack = []; // for back button
let flags = { name: null };

function render(nodeKey){
  const node = story.nodes[nodeKey];
  current = nodeKey;
  textEl.textContent = node.text.replaceAll("\n", "\n");
  choicesEl.innerHTML = "";
  node.choices.forEach((ch, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.innerHTML = `<div>${formatText(ch.text)}</div>${ch.hint ? `<div class="hint">${ch.hint}</div>` : ""}`;
    btn.addEventListener('click', () => {
      if (ch.action === 'inputName') {
        const name = prompt('Впиши имя, которое хочешь вернуть из Дуата:');
        if (name && name.trim().length > 0) {
          flags.name = name.trim();
          go('name');
        }
        return;
      }
      go(ch.goto);
    });
    choicesEl.appendChild(btn);
  });
  backBtn.disabled = stack.length === 0;
}

function go(next){
  stack.push(current);
  // Dynamic text injection examples
  if (next === 'name' && flags.name){
    story.nodes.name.text = `Имя «${flags.name}» срывается с губ. Узел-картуш вспыхивает. Воздух густеет,\nи на миг ты слышишь знакомый смех — ответ из Дуата.`;
  }
  render(next);
}

function back(){
  if (stack.length > 0) {
    const prev = stack.pop();
    render(prev);
  }
}

function formatText(t){
  // simple formatter: replace **bold** and *italic*
  return t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Persistence
function saveGame(){
  const data = { current, stack, flags };
  localStorage.setItem('lilit_save', JSON.stringify(data));
  alert('Сохранено!');
}
function loadGame(){
  const raw = localStorage.getItem('lilit_save');
  if (!raw) { alert('Сохранений нет'); return; }
  try{
    const data = JSON.parse(raw);
    current = data.current || story.start;
    stack = Array.isArray(data.stack) ? data.stack : [];
    flags = data.flags || {};
    render(current);
  }catch(e){
    alert('Не удалось загрузить сохранение');
  }
}
function restart(){
  current = story.start;
  stack = [];
  flags = { name: null };
  render(current);
}

// UI events
backBtn.addEventListener('click', back);
restartBtn.addEventListener('click', restart);
saveBtn.addEventListener('click', saveGame);
loadBtn.addEventListener('click', loadGame);
menuBtn.addEventListener('click', () => sheet.classList.remove('hidden'));
closeBtn.addEventListener('click', () => sheet.classList.add('hidden'));

// Start
render(story.start);
