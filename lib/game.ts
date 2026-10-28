export type Quest = { id: string; title: string; detail: string; exp: number; gold: number; done: boolean; date: string };
export type Reward = { id: string; title: string; cost: number; claimed: boolean };
export type GameState = { level: number; exp: number; gold: number; hp: number; streak: number; stats: { STR: number; INT: number; END: number; DISC: number }; statPoints: number; quests: Quest[]; rewards: Reward[]; logs: { id: string; text: string; date: string }[]; lastReset: string };
export const xpNeeded = (level: number) => 100 + (level - 1) * 50;
export const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const defaultState = (): GameState => ({ level: 1, exp: 0, gold: 100, hp: 100, streak: 0, stats: { STR: 1, INT: 1, END: 1, DISC: 1 }, statPoints: 0, quests: [
 { id:'q1', title:'Утренняя зарядка', detail:'10 минут движения', exp:25, gold:15, done:false, date:todayKey() },
 { id:'q2', title:'Прочитать 10 страниц', detail:'Развивай интеллект', exp:20, gold:10, done:false, date:todayKey() },
 { id:'q3', title:'Выпить 2 л воды', detail:'Поддержи выносливость', exp:15, gold:10, done:false, date:todayKey() },
 { id:'q4', title:'Фокус-сессия', detail:'25 минут без отвлечений', exp:30, gold:20, done:false, date:todayKey() },
 ], rewards:[{id:'r1',title:'Игры / отдых — 1 час',cost:150,claimed:false},{id:'r2',title:'Любимый десерт',cost:80,claimed:false},{id:'r3',title:'Вечер без чувства вины',cost:250,claimed:false}], logs:[], lastReset:todayKey() });
export function addExp(state: GameState, amount: number): GameState {
 let level = state.level, exp = state.exp + amount, statPoints = state.statPoints;
 while (exp >= xpNeeded(level)) { exp -= xpNeeded(level); level++; statPoints += 3; }
 return { ...state, level, exp, statPoints };
}
