export type Quest = {
  id: string;
  title: string;
  detail: string;
  exp: number;
  gold: number;
  done: boolean;
  date: string;
  secret?: boolean;
  difficulty?: number;
};

export type Reward = { id: string; title: string; cost: number; claimed: boolean };
export type GameState = {
  level: number;
  exp: number;
  gold: number;
  hp: number;
  streak: number;
  stats: { STR: number; INT: number; END: number; DISC: number };
  statPoints: number;
  quests: Quest[];
  rewards: Reward[];
  logs: { id: string; text: string; date: string }[];
  lastReset: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const UTC_PLUS_5_MS = 5 * 60 * 60 * 1000;
const MAX_SECRET_QUESTS_PER_DAY = 3;

export const xpNeeded = (level: number) => 100 + (level - 1) * 50;

// Shift the instant by five hours before reading the UTC date. This keeps the
// daily boundary fixed at midnight UTC+5 regardless of the browser's timezone.
export const todayKey = (date = new Date()) =>
  new Date(date.getTime() + UTC_PLUS_5_MS).toISOString().slice(0, 10);

export const msUntilNextUtc5Midnight = () => {
  const shiftedNow = Date.now() + UTC_PLUS_5_MS;
  return Math.ceil(shiftedNow / DAY_MS) * DAY_MS - shiftedNow;
};

const targetByLevel = (base: number, step: number, level: number, cap: number) =>
  Math.min(cap, base + Math.max(0, level - 1) * step);

const rewardByLevel = (base: number, level: number, cap: number) =>
  Math.min(cap, Math.round(base * (1 + Math.max(0, level - 1) * 0.04)));

export function generateDailyQuests(level: number, date = todayKey()): Quest[] {
  const movementMinutes = targetByLevel(10, 2, level, 50);
  const pages = targetByLevel(10, 1, level, 40);
  const focusMinutes = targetByLevel(25, 2, level, 60);
  const planningTasks = targetByLevel(3, 1, level, 8);

  return [
    {
      id: `daily-move-${date}`,
      title: `Утренняя зарядка · ${movementMinutes} минут`,
      detail: 'Разомнись и добавь движению в день',
      exp: rewardByLevel(25, level, 100),
      gold: rewardByLevel(15, level, 60),
      done: false,
      date,
      difficulty: level,
    },
    {
      id: `daily-read-${date}`,
      title: `Прочитать ${pages} страниц`,
      detail: 'Развивай интеллект небольшими шагами',
      exp: rewardByLevel(20, level, 100),
      gold: rewardByLevel(10, level, 60),
      done: false,
      date,
      difficulty: level,
    },
    {
      id: `daily-water-${date}`,
      title: 'Выпить свою норму воды',
      detail: 'Поддерживай комфортный для себя режим питья',
      exp: rewardByLevel(15, level, 100),
      gold: rewardByLevel(10, level, 60),
      done: false,
      date,
      difficulty: level,
    },
    {
      id: `daily-focus-${date}`,
      title: `Фокус-сессия · ${focusMinutes} минут`,
      detail: `Составь план из ${planningTasks} приоритетов и работай без отвлечений`,
      exp: rewardByLevel(30, level, 100),
      gold: rewardByLevel(20, level, 60),
      done: false,
      date,
      difficulty: level,
    },
  ];
}

const secretQuestTemplates = [
  (level: number) => {
    const minutes = targetByLevel(10, 2, level, 45);
    return { title: `Теневая тренировка · ${minutes} минут`, detail: 'Дополнительное движение для охотника' };
  },
  (level: number) => {
    const minutes = targetByLevel(15, 2, level, 50);
    return { title: `Испытание концентрации · ${minutes} минут`, detail: 'Одна задача, без переключений и отвлечений' };
  },
  (level: number) => {
    const pages = targetByLevel(5, 1, level, 30);
    return { title: `Запечатанная глава · ${pages} страниц`, detail: 'Прочитай ещё немного сверх дневного плана' };
  },
  (level: number) => {
    const minutes = targetByLevel(10, 1, level, 30);
    return { title: `Охотничий дозор · ${minutes} минут`, detail: 'Прогуляйся без телефона и других экранов' };
  },
  (level: number) => {
    const tasks = targetByLevel(1, 1, level, 5);
    return { title: `Экзамен системы · ${tasks} пункта`, detail: 'Разбери и заверши пункты своего списка дел' };
  },
];

export function generateSecretQuest(level: number, date: string, existing: Quest[]): Quest {
  const alreadyUsed = new Set(existing.filter((quest) => quest.secret && quest.date === date).map((quest) => quest.title));
  const available = secretQuestTemplates
    .map((create) => create(level))
    .filter((quest) => !alreadyUsed.has(quest.title));
  const pool = available.length ? available : secretQuestTemplates.map((create) => create(level));
  const selected = pool[Math.floor(Math.random() * pool.length)];
  const number = existing.filter((quest) => quest.secret && quest.date === date).length + 1;

  return {
    id: `secret-${date}-${number}-${crypto.randomUUID()}`,
    ...selected,
    exp: rewardByLevel(35 + number * 5, level, 120),
    gold: rewardByLevel(20 + number * 5, level, 75),
    done: false,
    date,
    secret: true,
    difficulty: level,
  };
}

export const maxSecretQuestsPerDay = MAX_SECRET_QUESTS_PER_DAY;

export const defaultState = (): GameState => {
  const today = todayKey();
  return {
    level: 1,
    exp: 0,
    gold: 100,
    hp: 100,
    streak: 0,
    stats: { STR: 1, INT: 1, END: 1, DISC: 1 },
    statPoints: 0,
    quests: generateDailyQuests(1, today),
    rewards: [
      { id: 'r1', title: 'Игры / отдых — 1 час', cost: 150, claimed: false },
      { id: 'r2', title: 'Любимый десерт', cost: 80, claimed: false },
      { id: 'r3', title: 'Вечер без чувства вины', cost: 250, claimed: false },
    ],
    logs: [],
    lastReset: today,
  };
};

export function addExp(state: GameState, amount: number): GameState {
  let level = state.level;
  let exp = state.exp + amount;
  let statPoints = state.statPoints;
  while (exp >= xpNeeded(level)) {
    exp -= xpNeeded(level);
    level++;
    statPoints += 3;
  }
  return { ...state, level, exp, statPoints };
}
