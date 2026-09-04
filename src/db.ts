import Dexie, { type EntityTable } from "dexie";

export type TitleType = "Series" | "Movie";

export interface TitleRecord {
  id: string;
  title: string;
  type: TitleType;
  year: number;
  country: string;
  genres: string[];
  actorOne: string;
  characterOne: string;
  actorTwo: string;
  characterTwo: string;
  coupleName: string;
  sceneTitle: string;
  poster?: string;
  sceneImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationRecord {
  id: string;
  titleId: string;
  evaluated: boolean;
  overall: number;
  acting: number;
  chemistry: number;
  story: number;
  visual: number;
  createdAt: string;
}

export interface SeasonRecord {
  id: string;
  name: string;
  kind: "annual" | "legacy";
  year?: number;
  active: boolean;
  revealed: boolean;
}

export interface SettingRecord {
  key: string;
  value: string | number | boolean;
}

export const awardCategories = [
  { name: "BL Of The Year", kind: "title" },
  { name: "Best BL Series", kind: "title" },
  { name: "Best BL Movie", kind: "title" },
  { name: "Best Couple", kind: "couple" },
  { name: "Best Supporting Couple", kind: "couple" },
  { name: "Best Storyline", kind: "title" },
  { name: "Best Originality", kind: "title" },
  { name: "Best Ending", kind: "title" },
  { name: "Best Main Character", kind: "character" },
  { name: "Best Green Flag", kind: "character" },
  { name: "Best Red Flag", kind: "character" },
  { name: "Best Chemistry", kind: "couple" },
  { name: "Best Kiss Scene", kind: "scene" },
  { name: "Hottest Couple Of The Year", kind: "couple" },
  { name: "Most Attractive Couple Of The Year", kind: "couple" },
  { name: "Best Acting", kind: "title" },
  { name: "Best Lead Performance", kind: "title" },
  { name: "Best Supporting Performance", kind: "title" },
  { name: "Best Cinematography", kind: "title" },
  { name: "Best OST", kind: "title" },
  { name: "Best Scene", kind: "scene" },
  { name: "Best Thai BL", kind: "title" },
  { name: "Best Korean BL", kind: "title" },
  { name: "Best Japanese BL", kind: "title" },
  { name: "Best Taiwanese BL", kind: "title" },
  { name: "Best Chinese BL", kind: "title" },
  { name: "Best International BL", kind: "title" },
  { name: "People's Choice", kind: "title" },
] as const;

const now = () => new Date().toISOString();
export const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

class AwardsDatabase extends Dexie {
  titles!: EntityTable<TitleRecord, "id">;
  evaluations!: EntityTable<EvaluationRecord, "id">;
  seasons!: EntityTable<SeasonRecord, "id">;
  settings!: EntityTable<SettingRecord, "key">;

  constructor() {
    super("bl_awards_db");
    this.version(1).stores({
      titles: "id, title, year, country, type",
      evaluations: "id, titleId, evaluated",
      seasons: "id, active, kind",
      settings: "key",
    });
  }
}

export const db = new AwardsDatabase();

const demoTitles: Omit<TitleRecord, "id" | "createdAt" | "updatedAt">[] = [
  {
    title: "Afterglow",
    type: "Series",
    year: 2026,
    country: "Thailand",
    genres: ["Romance", "Drama"],
    actorOne: "Keen",
    characterOne: "Ari",
    actorTwo: "Sea",
    characterTwo: "Nawin",
    coupleName: "Keen × Sea",
    sceneTitle: "The rooftop promise",
  },
  {
    title: "The Eighth Note",
    type: "Movie",
    year: 2026,
    country: "Taiwan",
    genres: ["Romance", "Music"],
    actorOne: "Jia",
    characterOne: "Yu",
    actorTwo: "Ren",
    characterTwo: "Ming",
    coupleName: "Jia × Ren",
    sceneTitle: "A song left unfinished",
  },
  {
    title: "Our Parallel Summer",
    type: "Series",
    year: 2026,
    country: "Korea",
    genres: ["Romance", "Youth"],
    actorOne: "Han",
    characterOne: "Joon",
    actorTwo: "Min",
    characterTwo: "Iseop",
    coupleName: "Han × Min",
    sceneTitle: "The last train home",
  },
  {
    title: "Soft Focus",
    type: "Series",
    year: 2025,
    country: "Japan",
    genres: ["Romance", "Slice of Life"],
    actorOne: "Riku",
    characterOne: "Renji",
    actorTwo: "Sora",
    characterTwo: "Haru",
    coupleName: "Riku × Sora",
    sceneTitle: "A photograph in the rain",
  },
];

export async function seedDatabase() {
  const [titleCount, seasonCount] = await Promise.all([
    db.titles.count(),
    db.seasons.count(),
  ]);
  if (!titleCount) {
    await db.titles.bulkAdd(
      demoTitles.map((title) => ({ ...title, id: makeId(), createdAt: now(), updatedAt: now() })),
    );
  }
  if (!seasonCount) {
    await db.seasons.add({
      id: "annual-2026",
      name: "BL Awards 2026",
      kind: "annual",
      year: 2026,
      active: true,
      revealed: false,
    });
  }
  const welcome = await db.settings.get("welcomeSeen");
  if (!welcome) await db.settings.put({ key: "welcomeSeen", value: false });
}

export async function saveTitle(input: Omit<TitleRecord, "id" | "createdAt" | "updatedAt">, id?: string) {
  const timestamp = now();
  const existing = id ? await db.titles.get(id) : undefined;
  const record: TitleRecord = {
    ...input,
    id: id ?? makeId(),
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
  await db.titles.put(record);
  return record;
}