import {
  Activity,
  Archive,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleUserRound,
  Clapperboard,
  Film,
  FolderHeart,
  GalleryHorizontalEnd,
  Gem,
  Heart,
  ImagePlus,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  awardCategories,
  db,
  type EvaluationRecord,
  type TitleRecord,
  type TitleType,
  makeId,
  saveTitle,
} from "./db";
import type { UpdateStatus } from "./electron";

type PageMeta = { title: string; eyebrow: string; description: string };
const pageMeta: Record<string, PageMeta> = {
  overview: { title: "The season so far", eyebrow: "Overview", description: "Your private archive of stories worth remembering." },
  titles: { title: "Title library", eyebrow: "Database / Titles", description: "The one source of truth for your BL archive." },
  actors: { title: "Cast archive", eyebrow: "Database / Actors", description: "A derived view of every performer in your collection." },
  characters: { title: "Characters", eyebrow: "Database / Characters", description: "The people who stayed with you after the credits." },
  couples: { title: "Couples", eyebrow: "Database / Couples", description: "Chemistry, pairings, and the relationships that define each story." },
  scenes: { title: "Scenes", eyebrow: "Database / Scenes", description: "A visual index of the moments you never want to forget." },
  evaluations: { title: "Private evaluations", eyebrow: "Evaluations", description: "Your scores stay sealed until Awards Night." },
  awards: { title: "Awards dashboard", eyebrow: "Awards", description: "Prepare the envelope. The season is almost ready." },
  eligibility: { title: "Eligibility", eyebrow: "Awards / Eligibility", description: "See what is ready to enter the ceremony." },
  hall: { title: "Hall of Fame", eyebrow: "Archive", description: "The titles and couples that earned a permanent place." },
  settings: { title: "Settings", eyebrow: "System", description: "Shape your private awards experience." },
};

const navGroups = [
  { label: "Workspace", links: [{ to: "/", key: "overview", label: "Overview", icon: LayoutDashboard }] },
  {
    label: "Database",
    links: [
      { to: "/titles", key: "titles", label: "Titles", icon: Film },
      { to: "/actors", key: "actors", label: "Actors", icon: CircleUserRound },
      { to: "/characters", key: "characters", label: "Characters", icon: UsersRound },
      { to: "/couples", key: "couples", label: "Couples", icon: Heart },
      { to: "/scenes", key: "scenes", label: "Scenes", icon: GalleryHorizontalEnd },
    ],
  },
  { label: "Evaluate", links: [{ to: "/evaluations", key: "evaluations", label: "Evaluations", icon: BarChart3 }] },
  {
    label: "Awards",
    links: [
      { to: "/awards", key: "awards", label: "Dashboard", icon: Trophy },
      { to: "/awards/night", key: "night", label: "Awards Night", icon: Sparkles },
      { to: "/eligibility", key: "eligibility", label: "Eligibility", icon: Check },
    ],
  },
  { label: "Archive", links: [{ to: "/hall-of-fame", key: "hall", label: "Hall of Fame", icon: Gem }, { to: "/settings", key: "settings", label: "Settings", icon: Settings }] },
];

const placeholderPoster = [
  "poster-rose",
  "poster-blue",
  "poster-amber",
  "poster-plum",
  "poster-forest",
];

function getPosterClass(title: string) {
  return placeholderPoster[title.length % placeholderPoster.length];
}

function imageFileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("Images must be 8 MB or smaller."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("That image could not be read."));
    };
    reader.onerror = () => reject(new Error("That image could not be read."));
    reader.readAsDataURL(file);
  });
}

function App() {
  const location = useLocation();
  const [titles, setTitles] = useState<TitleRecord[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([]);
  const [welcome, setWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [titleEditor, setTitleEditor] = useState<{ open: boolean; title?: TitleRecord }>({ open: false });

  const refresh = useCallback(async () => {
    const [titleRows, evaluationRows, welcomeSetting] = await Promise.all([
      db.titles.orderBy("year").reverse().toArray(),
      db.evaluations.toArray(),
      db.settings.get("welcomeSeen"),
    ]);
    setTitles(titleRows);
    setEvaluations(evaluationRows);
    setWelcome(welcomeSetting?.value !== true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const currentKey = location.pathname.startsWith("/titles") ? "titles"
    : location.pathname.startsWith("/actors") ? "actors"
      : location.pathname.startsWith("/characters") ? "characters"
        : location.pathname.startsWith("/couples") ? "couples"
          : location.pathname.startsWith("/scenes") ? "scenes"
            : location.pathname.startsWith("/evaluations") ? "evaluations"
              : location.pathname.startsWith("/eligibility") ? "eligibility"
                : location.pathname.startsWith("/hall") ? "hall"
                  : location.pathname.startsWith("/settings") ? "settings"
                    : location.pathname.startsWith("/awards") ? "awards" : "overview";
  const activeSeason = "BL Awards 2026";
  const meta = pageMeta[currentKey] ?? pageMeta.overview;

  const dismissWelcome = async () => {
    await db.settings.put({ key: "welcomeSeen", value: true });
    setWelcome(false);
  };
  const handleSaved = async () => {
    await refresh();
    setTitleEditor({ open: false });
    toast.success("Title saved to your archive");
  };
  const handleDelete = async (id: string) => {
    await db.titles.delete(id);
    await db.evaluations.where("titleId").equals(id).delete();
    await refresh();
    toast.success("Title removed from the archive");
  };

  if (location.pathname === "/awards/night") {
    return <AwardsNight titles={titles} evaluations={evaluations} />;
  }

  return (
    <div className="app-shell">
      <UpdateCenter />
      <AnimatePresence>
        {sidebarOpen && <motion.button className="mobile-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      </AnimatePresence>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><span>BL</span><i /></div>
          <div><strong>BL Awards</strong><small>private archive</small></div>
        </div>
        <div className="season-select"><span className="season-dot" /><span>{activeSeason}</span><ChevronDown size={14} /></div>
        <nav className="nav-groups">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <p className="nav-label">{group.label}</p>
              {group.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink key={link.to} to={link.to} end={link.to === "/"} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
                    <Icon size={17} strokeWidth={1.8} /><span>{link.label}</span>
                    {link.key === "awards" && <span className="nav-badge">28</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="privacy-note"><Archive size={16} /><div><strong>Local-first</strong><span>Your archive stays yours.</span></div></div>
          <div className="profile-row"><div className="profile-avatar">J</div><div><strong>My archive</strong><span>Owner mode</span></div><MoreDots /></div>
        </div>
      </aside>
      <main className="main-shell">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="breadcrumbs"><span>{meta.eyebrow.split(" / ")[0]}</span>{meta.eyebrow.includes(" / ") && <><ArrowRight size={12} /><span className="muted">{meta.eyebrow.split(" / ")[1]}</span></>}</div>
          <div className="topbar-actions"><span className="autosave"><span className="save-dot" /> Saved locally</span><button className="icon-button" aria-label="Settings"><Settings size={18} /></button></div>
        </header>
        <div className="content">
          <Routes>
            <Route path="/" element={<Overview titles={titles} evaluations={evaluations} />} />
            <Route path="/titles" element={<TitlesPage titles={titles} evaluations={evaluations} onAdd={() => setTitleEditor({ open: true })} onEdit={(title) => setTitleEditor({ open: true, title })} onDelete={handleDelete} />} />
            <Route path="/actors" element={<ActorsPage titles={titles} />} />
            <Route path="/characters" element={<CharactersPage titles={titles} />} />
            <Route path="/couples" element={<CouplesPage titles={titles} />} />
            <Route path="/scenes" element={<ScenesPage titles={titles} />} />
            <Route path="/evaluations" element={<EvaluationsPage titles={titles} evaluations={evaluations} onRefresh={refresh} />} />
            <Route path="/awards" element={<AwardsDashboard titles={titles} evaluations={evaluations} />} />
            <Route path="/eligibility" element={<EligibilityPage titles={titles} evaluations={evaluations} />} />
            <Route path="/hall-of-fame" element={<HallOfFame titles={titles} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <AnimatePresence>
        {welcome && <WelcomeScreen year={2026} onContinue={dismissWelcome} />}
      </AnimatePresence>
      <AnimatePresence>
        {titleEditor.open && <TitleModal title={titleEditor.title} onClose={() => setTitleEditor({ open: false })} onSaved={handleSaved} />}
      </AnimatePresence>
    </div>
  );
}

function UpdateCenter() {
  const [status, setStatus] = useState<UpdateStatus>({ state: "current" });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const updater = window.blAwards?.updater;
    if (!updater || window.blAwards?.platform !== "win32") return;
    const unsubscribe = updater.onStatus((nextStatus) => {
      setStatus(nextStatus);
      if (nextStatus.state === "available" || nextStatus.state === "downloaded") setDismissed(false);
    });
    return unsubscribe;
  }, []);

  if (dismissed || status.state === "current" || status.state === "checking" || status.state === "error") return null;
  const updater = window.blAwards?.updater;
  if (!updater) return null;
  const availableVersion = status.state === "available" ? status.version : "";

  const download = () => {
    setStatus({ state: "downloading", percent: 0 });
    updater.download().catch(() => undefined);
  };

  return (
    <AnimatePresence>
      <motion.div className="update-center" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
        <div className="update-copy">
          <Sparkles size={16} />
          <div>
            <strong>{status.state === "downloaded" ? "Update ready to install" : status.state === "downloading" ? "Downloading update" : `BL Awards ${availableVersion} is available`}</strong>
            <span>{status.state === "downloading" ? `${status.percent}% downloaded` : status.state === "downloaded" ? "Restart when you are ready. Your archive will stay local." : "A new desktop release is ready for your archive."}</span>
          </div>
        </div>
        <div className="update-actions">
          {status.state === "available" && <button className="primary-button" onClick={download}>Update now</button>}
          {status.state === "downloading" && <div className="update-progress"><span style={{ width: `${status.percent}%` }} /></div>}
          {status.state === "downloaded" && <button className="primary-button" onClick={() => updater.install()}>Restart & install</button>}
          <button className="update-later" onClick={() => setDismissed(true)}>Later</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function MoreDots() {
  return <span className="more-dots"><i /><i /><i /></span>;
}

function WelcomeScreen({ year, onContinue }: { year: number; onContinue: () => void }) {
  return (
    <motion.div className="welcome-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="welcome-glow glow-one" /><div className="welcome-glow glow-two" />
      <motion.div className="welcome-content" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="welcome-emblem"><span>BL</span></div>
        <p className="overline">A personal annual tradition</p>
        <h1>BL Awards <em>{year}</em></h1>
        <p className="welcome-subtitle">Your personal BL awards platform</p>
        <button className="primary-button welcome-button" onClick={onContinue}>Continue <ArrowRight size={16} /></button>
        <p className="welcome-footnote"><Archive size={13} /> Private · Offline · Yours</p>
      </motion.div>
      <div className="welcome-corner welcome-corner-left">EST. 2026</div>
      <div className="welcome-corner welcome-corner-right">THE 01ST SEASON</div>
    </motion.div>
  );
}

function PageHeading({ eyebrow, title, description, action }: PageMeta & { action?: React.ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</div>;
}

function Overview({ titles, evaluations }: { titles: TitleRecord[]; evaluations: EvaluationRecord[] }) {
  const navigate = useNavigate();
  const current = titles.filter((title) => title.year === 2026);
  const evaluated = current.filter((title) => evaluations.some((evaluation) => evaluation.titleId === title.id && evaluation.evaluated));
  const latest = titles.slice(0, 3);
  return <div className="page">
    <PageHeading eyebrow="Overview" title="The season so far" description="Your private archive of stories worth remembering." action={<button className="primary-button" onClick={() => navigate("/titles")}><Plus size={17} /> Add a title</button>} />
    <div className="hero-season">
      <div className="hero-season-copy"><div className="season-kicker"><span className="live-line" /> CURRENT SEASON</div><h2>BL Awards <span>2026</span></h2><p>Every story leaves a mark. This is where yours become a tradition.</p><button className="text-button" onClick={() => navigate("/awards")}>View season progress <ArrowRight size={15} /></button></div>
      <div className="hero-season-stat"><span>01</span><small>active season</small></div>
      <div className="hero-confetti confetti-one" /><div className="hero-confetti confetti-two" /><div className="hero-confetti confetti-three" />
    </div>
    <div className="metrics-grid">
      <MetricCard icon={<Film size={18} />} label="Titles in archive" value={titles.length} detail="+ this season" tone="rose" />
      <MetricCard icon={<Check size={18} />} label="Evaluated" value={evaluated.length} detail={`${current.length ? Math.round((evaluated.length / current.length) * 100) : 0}% of season`} tone="gold" />
      <MetricCard icon={<Trophy size={18} />} label="Awards categories" value="28" detail="ready to prepare" tone="blue" />
      <MetricCard icon={<CalendarDays size={18} />} label="Years covered" value={new Set(titles.map((title) => title.year)).size} detail="across your archive" tone="plum" />
    </div>
    <div className="section-grid">
      <section className="panel recent-panel"><div className="panel-heading"><div><p className="eyebrow">Your archive</p><h3>Recently added</h3></div><button className="subtle-button" onClick={() => navigate("/titles")}>View all <ArrowRight size={14} /></button></div><div className="recent-list">{latest.map((title) => <MiniTitleRow key={title.id} title={title} evaluation={evaluations.find((evaluation) => evaluation.titleId === title.id)} />)}</div></section>
      <section className="panel progress-panel"><div className="panel-heading"><div><p className="eyebrow">Ceremony readiness</p><h3>Season progress</h3></div><span className="status-chip neutral">In progress</span></div><div className="progress-ring-wrap"><div className="progress-ring" style={{ "--progress": `${current.length ? (evaluated.length / current.length) * 360 : 0}deg` } as React.CSSProperties}><div><strong>{current.length ? Math.round((evaluated.length / current.length) * 100) : 0}%</strong><span>evaluated</span></div></div><div className="progress-legend"><div><span className="legend-dot filled" /><span>Evaluated</span><strong>{evaluated.length}</strong></div><div><span className="legend-dot empty" /><span>To evaluate</span><strong>{current.length - evaluated.length}</strong></div><button className="text-button" onClick={() => navigate("/evaluations")}>Continue evaluating <ArrowRight size={14} /></button></div></div></section>
    </div>
    <div className="quote-strip"><Sparkles size={17} /><p>“The best stories are the ones we choose to remember.”</p><span>— your archive</span></div>
  </div>;
}

function MetricCard({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string | number; detail: string; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function MiniTitleRow({ title, evaluation }: { title: TitleRecord; evaluation?: EvaluationRecord }) {
  return <div className="mini-title-row"><Poster title={title} size="small" /><div className="mini-title-copy"><strong>{title.title}</strong><span>{title.type} · {title.year} · {title.country}</span></div><span className={`status-chip ${evaluation?.evaluated ? "success" : "neutral"}`}>{evaluation?.evaluated ? "Evaluated" : "To evaluate"}</span></div>;
}

function TitlesPage({ titles, evaluations, onAdd, onEdit, onDelete }: { titles: TitleRecord[]; evaluations: EvaluationRecord[]; onAdd: () => void; onEdit: (title: TitleRecord) => void; onDelete: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Series" | "Movie">("All");
  const filtered = titles.filter((title) => `${title.title} ${title.country} ${title.actorOne} ${title.actorTwo}`.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || title.type === filter));
  return <div className="page"><PageHeading eyebrow="Database / Titles" title="Title library" description="The one source of truth for your BL archive." action={<button className="primary-button" onClick={onAdd}><Plus size={17} /> Add title</button>} />
    <div className="toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, actors, countries…" /></div><div className="filter-pills">{(["All", "Series", "Movie"] as const).map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="result-count">{filtered.length} titles</span></div>
    {filtered.length ? <div className="title-grid">{filtered.map((title) => <TitleCard key={title.id} title={title} evaluation={evaluations.find((evaluation) => evaluation.titleId === title.id)} onEdit={() => onEdit(title)} onDelete={() => onDelete(title.id)} />)}</div> : <EmptyState icon={<Film />} title="Your archive is quiet" body="Add your first title to begin building this season." action={onAdd} />}
  </div>;
}

function Poster({ title, size = "medium" }: { title: TitleRecord; size?: "small" | "medium" | "large" }) {
  return <div className={`poster ${size} ${getPosterClass(title.title)} ${title.poster ? "has-image" : ""}`} style={title.poster ? { backgroundImage: `url(${title.poster})` } : undefined}><span>{title.title.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span><small>{title.year}</small></div>;
}

function TitleCard({ title, evaluation, onEdit, onDelete }: { title: TitleRecord; evaluation?: EvaluationRecord; onEdit: () => void; onDelete: () => void }) {
  const [menu, setMenu] = useState(false);
  return <motion.article className="title-card" layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="card-poster-wrap"><Poster title={title} /><span className="type-pill">{title.type}</span><button className="card-menu" onClick={() => setMenu((value) => !value)} aria-label="Title actions"><MoreDots /></button>{menu && <div className="card-menu-popover"><button onClick={onEdit}>Edit title</button><button onClick={onDelete} className="danger-text">Delete</button></div>}</div><div className="title-card-body"><div className="title-card-heading"><div><h3>{title.title}</h3><p>{title.year} · {title.country}</p></div><span className={`status-dot ${evaluation?.evaluated ? "evaluated" : ""}`} title={evaluation?.evaluated ? "Evaluated" : "Not evaluated"} /></div><div className="genre-row">{title.genres.map((genre) => <span key={genre}>{genre}</span>)}</div><div className="title-card-meta"><span><UsersRound size={13} /> {title.actorOne} × {title.actorTwo}</span><span><Clapperboard size={13} /> {title.sceneTitle ? "Scene saved" : "No scene"}</span></div></div></motion.article>;
}

function ActorsPage({ titles }: { titles: TitleRecord[] }) {
  const actors = useMemo(() => {
    const map = new Map<string, { name: string; titles: TitleRecord[] }>();
    titles.forEach((title) => [title.actorOne, title.actorTwo].forEach((name) => { if (!name) return; const row = map.get(name) ?? { name, titles: [] }; row.titles.push(title); map.set(name, row); }));
    return [...map.values()];
  }, [titles]);
  return <div className="page"><PageHeading eyebrow="Database / Actors" title="Cast archive" description="A derived view of every performer in your collection." /><div className="view-note"><Archive size={16} /><span>Actors are derived from your title entries. Edit their relationship from the source title.</span></div><div className="actor-grid">{actors.map((actor, index) => <div className="actor-card" key={actor.name}><div className={`actor-avatar actor-tone-${index % 5}`}>{actor.name[0]}</div><div className="actor-info"><h3>{actor.name}</h3><p>{actor.titles.length} linked {actor.titles.length === 1 ? "title" : "titles"}</p><div className="linked-titles">{actor.titles.slice(0, 3).map((title) => <span key={title.id}>{title.title}</span>)}</div></div><ArrowRight size={16} /></div>)}</div></div>;
}

function CharactersPage({ titles }: { titles: TitleRecord[] }) {
  const chars = titles.flatMap((title) => [{ name: title.characterOne, actor: title.actorOne, title }, { name: title.characterTwo, actor: title.actorTwo, title }]).filter((char) => char.name);
  return <div className="page"><PageHeading eyebrow="Database / Characters" title="Characters" description="The people who stayed with you after the credits." /><div className="view-note"><Archive size={16} /><span>Character records are synchronized automatically from your titles.</span></div><div className="character-list">{chars.map((char, index) => <div className="character-row" key={`${char.title.id}-${char.name}`}><div className={`character-avatar actor-tone-${index % 5}`}>{char.actor[0]}</div><div className="character-main"><strong>{char.name}</strong><span>{char.actor} · {char.title.title}</span></div><span className="character-kind">{index % 2 ? "Lead" : "Main character"}</span><ArrowRight size={15} /></div>)}</div></div>;
}

function CouplesPage({ titles }: { titles: TitleRecord[] }) {
  return <div className="page"><PageHeading eyebrow="Database / Couples" title="Couples" description="Chemistry, pairings, and the relationships that define each story." /><div className="couple-grid">{titles.filter((title) => title.actorOne && title.actorTwo).map((title) => <div className="couple-card" key={title.id}><div className="couple-visual"><div className={`couple-avatar left actor-tone-${title.title.length % 5}`}>{title.actorOne[0]}</div><div className={`couple-avatar right actor-tone-${(title.title.length + 2) % 5}`}>{title.actorTwo[0]}</div></div><div className="couple-copy"><span>{title.title} · {title.year}</span><h3>{title.coupleName || `${title.actorOne} × ${title.actorTwo}`}</h3><p>{title.characterOne} × {title.characterTwo}</p></div><span className="status-chip neutral">Primary</span></div>)}</div></div>;
}

function ScenesPage({ titles }: { titles: TitleRecord[] }) {
  return <div className="page"><PageHeading eyebrow="Database / Scenes" title="Scenes" description="A visual index of the moments you never want to forget." /><div className="scene-grid">{titles.filter((title) => title.sceneTitle).map((title) => <div className="scene-card" key={title.id}><div className={`scene-image ${getPosterClass(title.title)} ${title.sceneImage ? "has-image" : ""}`} style={title.sceneImage ? { backgroundImage: `url(${title.sceneImage})` } : undefined}>{!title.sceneImage && <Clapperboard size={26} />}<span>16:9</span></div><div><p>{title.title} · {title.year}</p><h3>{title.sceneTitle}</h3></div></div>)}</div></div>;
}

function EvaluationsPage({ titles, evaluations, onRefresh }: { titles: TitleRecord[]; evaluations: EvaluationRecord[]; onRefresh: () => Promise<void> }) {
  const [selected, setSelected] = useState<TitleRecord | null>(null);
  return <div className="page"><PageHeading eyebrow="Evaluations" title="Private evaluations" description="Your scores stay sealed until Awards Night." /><div className="privacy-banner"><div className="privacy-banner-icon"><Archive size={18} /></div><div><strong>Scores are quarantined</strong><span>Only evaluation status is visible here. Weighted scores and rankings stay hidden until the ceremony.</span></div><span className="status-chip gold">Locked</span></div><div className="evaluation-list">{titles.filter((title) => title.year === 2026).map((title) => { const evaluation = evaluations.find((item) => item.titleId === title.id); return <div className="evaluation-row" key={title.id}><Poster title={title} size="small" /><div className="evaluation-title"><strong>{title.title}</strong><span>{title.type} · {title.country}</span></div><span className={`status-chip ${evaluation?.evaluated ? "success" : "neutral"}`}>{evaluation?.evaluated ? "Evaluated" : "Not evaluated"}</span><button className="outline-button" onClick={() => setSelected(title)}>{evaluation?.evaluated ? "Edit evaluation" : "Evaluate title"}</button></div>; })}</div>{selected && <EvaluationModal title={selected} existing={evaluations.find((evaluation) => evaluation.titleId === selected.id)} onClose={() => setSelected(null)} onSaved={async () => { setSelected(null); await onRefresh(); }} />}</div>;
}

function EvaluationModal({ title, existing, onClose, onSaved }: { title: TitleRecord; existing?: EvaluationRecord; onClose: () => void; onSaved: () => Promise<void> }) {
  const [scores, setScores] = useState({ overall: existing?.overall ?? 8, acting: existing?.acting ?? 8, chemistry: existing?.chemistry ?? 8, story: existing?.story ?? 8, visual: existing?.visual ?? 8 });
  const update = (key: keyof typeof scores, value: number) => setScores((current) => ({ ...current, [key]: value }));
  const save = async () => { await db.evaluations.put({ id: existing?.id ?? makeId(), titleId: title.id, evaluated: true, ...scores, createdAt: existing?.createdAt ?? new Date().toISOString() }); toast.success("Evaluation sealed"); await onSaved(); };
  return <div className="modal-backdrop"><motion.div className="modal evaluation-modal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><ModalHeader eyebrow="Private evaluation" title={title.title} onClose={onClose} /><p className="modal-intro">Rate this title from 1–10. Your individual scores are hidden until Awards Night.</p><div className="score-list">{([["overall", "Overall feeling"], ["acting", "Acting"], ["chemistry", "Chemistry"], ["story", "Story"], ["visual", "Visual language"]] as const).map(([key, label]) => <label className="score-row" key={key}><span>{label}</span><input type="range" min="1" max="10" value={scores[key]} onChange={(event) => update(key, Number(event.target.value))} /><strong>{scores[key]}</strong></label>)}</div><div className="modal-actions"><button className="subtle-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={save}><Archive size={16} /> Seal evaluation</button></div></motion.div></div>;
}

function AwardsDashboard({ titles, evaluations }: { titles: TitleRecord[]; evaluations: EvaluationRecord[] }) {
  const navigate = useNavigate();
  const seasonTitles = titles.filter((title) => title.year === 2026);
  const evaluated = seasonTitles.filter((title) => evaluations.some((evaluation) => evaluation.titleId === title.id && evaluation.evaluated));
  const ready = evaluated.length >= 2;
  return <div className="page"><PageHeading eyebrow="Awards" title="Awards dashboard" description="Prepare the envelope. The season is almost ready." action={<button className="primary-button ceremony-button" onClick={() => navigate("/awards/night")}><Sparkles size={17} /> Enter Awards Night</button>} /><div className="award-hero"><div><span className="season-kicker"><span className="live-line" /> SEASON READINESS</span><h2>BL Awards <em>2026</em></h2><p>{ready ? "The stage is ready when you are." : "Complete a few more evaluations before the envelopes can be prepared."}</p></div><div className="readiness-score"><strong>{seasonTitles.length ? Math.round((evaluated.length / seasonTitles.length) * 100) : 0}<small>%</small></strong><span>ready</span></div></div><div className="metrics-grid awards-metrics"><MetricCard icon={<Film size={18} />} label="Eligible titles" value={seasonTitles.length} detail="release year 2026" tone="rose" /><MetricCard icon={<Check size={18} />} label="Evaluated titles" value={evaluated.length} detail={`${seasonTitles.length - evaluated.length} remaining`} tone="gold" /><MetricCard icon={<Trophy size={18} />} label="Ready categories" value={ready ? "28" : "0"} detail={ready ? "all systems go" : "awaiting evaluations"} tone="blue" /><MetricCard icon={<Activity size={18} />} label="At-risk categories" value={ready ? "0" : "28"} detail="ceremony check" tone="plum" /></div><div className="panel category-readiness"><div className="panel-heading"><div><p className="eyebrow">Category check</p><h3>Readiness at a glance</h3></div><span className={`status-chip ${ready ? "success" : "gold"}`}>{ready ? "READY" : "AT RISK"}</span></div><div className="category-grid">{awardCategories.slice(0, 12).map((category, index) => <div className="category-item" key={category.name}><span className={`category-status ${ready || index < evaluated.length ? "ready" : "risk"}`} /> <span>{category.name}</span><small>{ready || index < evaluated.length ? "Ready" : "Needs data"}</small></div>)}</div></div></div>;
}

function EligibilityPage({ titles, evaluations }: { titles: TitleRecord[]; evaluations: EvaluationRecord[] }) {
  return <div className="page"><PageHeading eyebrow="Awards / Eligibility" title="Eligibility" description="Annual awards consider titles released in the active season year." /><div className="eligibility-callout"><CalendarDays size={18} /><div><strong>BL Awards 2026</strong><span>Only titles with a release year of 2026 can enter the annual ceremony. Legacy seasons can draw from the full archive.</span></div></div><div className="eligibility-table"><div className="table-head"><span>Title</span><span>Release year</span><span>Evaluation</span><span>Eligibility</span></div>{titles.map((title) => <div className="table-row" key={title.id}><div className="table-title-cell"><Poster title={title} size="small" /><strong>{title.title}</strong></div><span>{title.year}</span><span className={`status-chip ${evaluations.some((evaluation) => evaluation.titleId === title.id) ? "success" : "neutral"}`}>{evaluations.some((evaluation) => evaluation.titleId === title.id) ? "Evaluated" : "Pending"}</span><span className={`status-chip ${title.year === 2026 ? "success" : "neutral"}`}>{title.year === 2026 ? "Eligible" : "Legacy only"}</span></div>)}</div></div>;
}

function HallOfFame({ titles }: { titles: TitleRecord[] }) {
  const favorites = titles.slice(0, 2);
  return <div className="page"><PageHeading eyebrow="Archive" title="Hall of Fame" description="The titles and couples that earned a permanent place." /><div className="hall-empty"><div className="hall-stars"><Star size={19} /><Star size={25} /><Star size={19} /></div><h2>Your legacy is waiting</h2><p>Winners from future Awards Nights will live here, preserved season after season.</p></div>{favorites.length > 0 && <><div className="subsection-heading"><div><p className="eyebrow">Archive preview</p><h3>Standout titles</h3></div></div><div className="hall-preview">{favorites.map((title, index) => <div className="hall-card" key={title.id}><Poster title={title} size="large" /><div><span>BL Awards {title.year}</span><h3>{title.title}</h3><p>{index === 0 ? "A title to remember" : "A story with staying power"}</p></div><Gem size={18} /></div>)}</div></>}</div>;
}

function SettingsPage() {
  return <div className="page"><PageHeading eyebrow="System" title="Settings" description="Shape your private awards experience." /><div className="settings-layout"><div className="settings-menu"><button className="selected"><Settings size={16} /> General</button><button><Trophy size={16} /> Awards system</button><button><Archive size={16} /> Data & backup</button></div><div className="settings-content"><SettingSection title="Your archive" description="A few choices that make BL Awards feel like yours."><div className="setting-row"><div><strong>Default season</strong><span>Used when the application opens</span></div><select defaultValue="2026"><option value="2026">BL Awards 2026</option><option value="2027">BL Awards 2027</option></select></div><div className="setting-row"><div><strong>Evaluation preset</strong><span>Criteria used when rating a title</span></div><select defaultValue="standard"><option value="standard">Standard mode</option><option value="academy">Full Academy mode</option></select></div></SettingSection><SettingSection title="Ceremony" description="Keep the reveal exactly as dramatic as it should be."><div className="setting-row"><div><strong>Nominees per category</strong><span>Default nomination count</span></div><span className="setting-value">Top 5</span></div><div className="setting-row"><div><strong>Tie threshold</strong><span>Close competitions allow manual selection</span></div><span className="setting-value">0.25</span></div></SettingSection><SettingSection title="Data & privacy" description="Your data is stored locally in this application."><div className="setting-row"><div><strong>Storage</strong><span>IndexedDB · bl_awards_db</span></div><span className="status-chip success">Local only</span></div></SettingSection></div></div></div>;
}

function SettingSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="settings-section"><div className="settings-section-heading"><h3>{title}</h3><p>{description}</p></div>{children}</section>;
}

function AwardsNight({ titles, evaluations }: { titles: TitleRecord[]; evaluations: EvaluationRecord[] }) {
  const navigate = useNavigate();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const category = awardCategories[categoryIndex];
  const eligible = titles.filter((title) => title.year === 2026 && evaluations.some((evaluation) => evaluation.titleId === title.id));
  const winner = eligible[0];
  const next = () => { setRevealed(false); setCategoryIndex((index) => Math.min(index + 1, awardCategories.length - 1)); };
  return <div className="ceremony-screen"><div className="ceremony-stars" /><header className="ceremony-topbar"><button className="ceremony-brand" onClick={() => navigate("/")}><span className="brand-mark small"><span>BL</span><i /></span><span>BL Awards <em>2026</em></span></button><div className="ceremony-progress"><span>Category {String(categoryIndex + 1).padStart(2, "0")}</span><div><span style={{ width: `${((categoryIndex + 1) / awardCategories.length) * 100}%` }} /></div><span>{awardCategories.length}</span></div><button className="exit-ceremony" onClick={() => navigate("/awards")}><X size={16} /> Exit ceremony</button></header><main className="ceremony-main"><div className="ceremony-eyebrow"><span className="live-line" /> THE ENVELOPES ARE READY <span className="live-line" /></div><AnimatePresence mode="wait"><motion.div key={category.name} className="ceremony-category" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}><p className="category-number">CATEGORY {String(categoryIndex + 1).padStart(2, "0")}</p><h1>{category.name}</h1><p className="category-kind">Presented with love from your private archive</p><div className={`ceremony-envelope ${revealed ? "is-revealed" : ""}`}><div className="envelope-glow" />{revealed && winner ? <div className="revealed-winner"><Poster title={winner} size="large" /><p className="winner-label">And the award goes to</p><h2>{winner.title}</h2><span>{winner.coupleName}</span></div> : <div className="sealed-envelope"><div className="envelope-seal"><span>BL</span></div><p>The winner is sealed</p><small>Open when you are ready</small></div>}</div><div className="ceremony-actions">{!revealed ? <button className="reveal-button" onClick={() => setRevealed(true)}><Sparkles size={17} /> Reveal winner</button> : categoryIndex < awardCategories.length - 1 ? <button className="reveal-button" onClick={next}>Next category <ArrowRight size={17} /></button> : <button className="reveal-button" onClick={() => navigate("/hall-of-fame")}>Visit Hall of Fame <Gem size={17} /></button>}</div></motion.div></AnimatePresence></main><footer className="ceremony-footer"><span>PERSONAL · PERMANENT · ANNUAL</span><span>BL AWARDS ARCHIVE</span></footer></div>;
}

function TitleModal({ title, onClose, onSaved }: { title?: TitleRecord; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState({
    title: title?.title ?? "",
    type: title?.type ?? "Series" as TitleType,
    year: String(title?.year ?? 2026),
    country: title?.country ?? "Thailand",
    genres: title?.genres.join(", ") ?? "Romance",
    actorOne: title?.actorOne ?? "",
    characterOne: title?.characterOne ?? "",
    actorTwo: title?.actorTwo ?? "",
    characterTwo: title?.characterTwo ?? "",
    coupleName: title?.coupleName ?? "",
    sceneTitle: title?.sceneTitle ?? "",
    poster: title?.poster ?? "",
    sceneImage: title?.sceneImage ?? "",
  });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const save = async () => {
    if (!form.title.trim() || !form.actorOne.trim() || !form.actorTwo.trim()) { toast.error("Add a title and both lead actors"); return; }
    await saveTitle({
      ...form,
      title: form.title.trim(),
      year: Number(form.year),
      type: form.type as TitleType,
      genres: form.genres.split(",").map((genre) => genre.trim()).filter(Boolean),
      poster: form.poster || undefined,
      sceneImage: form.sceneImage || undefined,
    }, title?.id);
    await onSaved();
  };
  return <div className="modal-backdrop"><motion.div className="modal title-modal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <ModalHeader eyebrow={title ? "Edit title" : "Add to archive"} title={title ? title.title : "New title"} onClose={onClose} />
    <div className="form-grid">
      <label className="full-field"><span>Title <b>*</b></span><input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. The story we keep" autoFocus /></label>
      <label><span>Type <b>*</b></span><select value={form.type} onChange={(event) => update("type", event.target.value)}><option>Series</option><option>Movie</option></select></label>
      <label><span>Release year <b>*</b></span><input type="number" min="1900" max="2200" value={form.year} onChange={(event) => update("year", event.target.value)} /></label>
      <label><span>Country</span><select value={form.country} onChange={(event) => update("country", event.target.value)}><option>Thailand</option><option>Korea</option><option>Japan</option><option>Taiwan</option><option>China</option><option>International</option></select></label>
      <label><span>Genres <small>comma separated</small></span><input value={form.genres} onChange={(event) => update("genres", event.target.value)} placeholder="Romance, Drama" /></label>
      <div className="form-divider full-field"><span>Lead relationship</span></div>
      <label><span>Actor 1 <b>*</b></span><input value={form.actorOne} onChange={(event) => update("actorOne", event.target.value)} placeholder="First name" /></label>
      <label><span>Character 1</span><input value={form.characterOne} onChange={(event) => update("characterOne", event.target.value)} placeholder="Character name" /></label>
      <label><span>Actor 2 <b>*</b></span><input value={form.actorTwo} onChange={(event) => update("actorTwo", event.target.value)} placeholder="First name" /></label>
      <label><span>Character 2</span><input value={form.characterTwo} onChange={(event) => update("characterTwo", event.target.value)} placeholder="Character name" /></label>
      <label className="full-field"><span>Couple name <small>auto-generated if blank</small></span><input value={form.coupleName} onChange={(event) => update("coupleName", event.target.value)} placeholder={`${form.actorOne || "Actor 1"} × ${form.actorTwo || "Actor 2"}`} /></label>
      <label className="full-field"><span>Signature scene</span><input value={form.sceneTitle} onChange={(event) => update("sceneTitle", event.target.value)} placeholder="A moment you never want to forget" /></label>
      <div className="form-divider full-field"><span>Visual archive</span></div>
      <ImageDropzone label="Poster artwork" hint="Shown across your title archive" value={form.poster} onChange={(value) => update("poster", value)} />
      <ImageDropzone label="Signature scene photo" hint="Shown in your Scenes gallery" value={form.sceneImage} onChange={(value) => update("sceneImage", value)} />
    </div>
    <div className="modal-actions"><button className="subtle-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={save}><Check size={16} /> Save title</button></div>
  </motion.div></div>;
}

function ImageDropzone({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const chooseFile = async (file?: File) => {
    if (!file) return;
    try {
      onChange(await imageFileToDataUrl(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "That image could not be added.");
    }
  };

  const openPicker = () => inputRef.current?.click();
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  return <div className="image-field">
    <div className="image-field-heading"><span>{label}</span><small>{hint}</small></div>
    <div
      className={`image-dropzone ${dragging ? "is-dragging" : ""} ${value ? "has-image" : ""}`}
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); void chooseFile(event.dataTransfer.files[0]); }}
      aria-label={`${label}: choose or drop an image`}
    >
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => { void chooseFile(event.target.files?.[0]); event.currentTarget.value = ""; }} />
      {value ? <>
        <img src={value} alt={`${label} preview`} />
        <div className="image-dropzone-overlay"><span>Click or drop to replace</span></div>
        <button type="button" className="image-remove" onClick={(event) => { event.stopPropagation(); onChange(""); }}><Trash2 size={13} /> Remove</button>
      </> : <>
        <ImagePlus size={21} />
        <strong>Drop an image here</strong>
        <span>or choose one from your device</span>
        <button type="button" className="dropzone-button" onClick={(event) => { event.stopPropagation(); openPicker(); }}><Upload size={13} /> Choose image</button>
      </>}
    </div>
  </div>;
}

function ModalHeader({ eyebrow, title, onClose }: { eyebrow: string; title: string; onClose: () => void }) {
  return <div className="modal-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><button className="modal-close" onClick={onClose} aria-label="Close"><X size={19} /></button></div>;
}

function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action: () => void }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{body}</p><button className="primary-button" onClick={action}><Plus size={16} /> Add a title</button></div>;
}

export default App;