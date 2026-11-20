/* The Florette Manor · app · compiled from manor.template.html (JSX → JS); needs React 18 UMD + manor-data.js before it */
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} = React;
function deepMerge(base, over) {
  if (Array.isArray(over)) return over;
  if (over && typeof over === 'object') {
    const out = Object.assign({}, base || {});
    for (const k of Object.keys(over)) out[k] = deepMerge(base ? base[k] : undefined, over[k]);
    return out;
  }
  return over === undefined ? base : over;
}
function setPath(obj, path, value) {
  const parts = path.replace(/\[id=([\w-]+)\]/g, '.#$1').split('.').filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (p[0] === '#') {
      const id = p.slice(1);
      cur = cur.find(x => x && String(x.id) === id);
      if (!cur) return;
      continue;
    }
    if (cur[p] === undefined) cur[p] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (last[0] === '#') return;
  cur[last] = value;
}
function imgSrc(el) {
  if (!el) return '';
  const im = el.tagName === 'IMG' ? el : el.querySelector('img');
  if (!im) return '';
  let best = '',
    bw = -1;
  (im.getAttribute('srcset') || im.getAttribute('data-srcset') || '').split(',').forEach(c => {
    const p = c.trim().split(/\s+/);
    if (!p[0]) return;
    const w = parseFloat((p[1] || '').replace(/[^0-9.]/g, '')) || 1;
    if (w >= bw) {
      bw = w;
      best = p[0];
    }
  });
  return best || im.getAttribute('data-src') || im.currentSrc || im.src || '';
}
function lift(id, set) {
  const el = document.getElementById(id);
  const u = imgSrc(el);
  if (u) {
    set(u);
    el.style.display = 'none';
  }
}
function resolveData() {
  let data = window.FS_DATA && typeof window.FS_DATA === 'object' ? JSON.parse(JSON.stringify(window.FS_DATA)) : JSON.parse((window.FS_DATA_PARTS || []).join('') || '{}');
  try {
    const j = document.getElementById('fs-data');
    if (j && j.textContent.trim()) data = deepMerge(data, JSON.parse(j.textContent));
  } catch (e) {
    console.warn('fs-data JSON could not be read', e);
  }
  document.querySelectorAll('[data-fs]').forEach(el => {
    try {
      setPath(data, el.getAttribute('data-fs'), el.textContent.trim());
    } catch (e) {}
  });
  const tok = s => String(s).replace(/[^A-Za-z0-9_-]+/g, '-');
  const visit = (parent, key, path) => {
    const v = parent[key];
    if (typeof v === 'string') {
      const el = document.getElementById(path);
      if (el) {
        parent[key] = el.textContent.trim();
        el.style.display = 'none';
      }
    } else if (v && typeof v === 'object') walk(v, path);
  };
  const walk = (node, path) => {
    if (Array.isArray(node)) node.forEach((v, i) => visit(node, i, path + '-' + tok(v && typeof v === 'object' ? v.id ?? v.key ?? v.n ?? i : i)));else Object.keys(node).forEach(k => visit(node, k, path + '-' + tok(k)));
  };
  try {
    walk(data, 'fs');
  } catch (e) {
    console.warn('id overrides', e);
  }
  lift('fs-img-hero', u => {
    data.hero.img = u;
  });
  if (data.beds) lift('fs-img-beds', u => {
    data.beds.img = u;
  });
  (data.roster || []).forEach(m => lift('fs-img-roster-' + m.id, u => {
    m.img = u;
  }));
  (data.events || []).forEach(e => {
    lift('fs-img-event-' + e.id, u => {
      e.img = u;
    });
    lift('fs-img-banner-' + e.id, u => {
      e.banner = u;
    });
  });
  (data.ledger || []).forEach(f => lift('fs-img-file-' + f.id, u => {
    f.img = u;
  }));
  (data.partners && data.partners.items || []).forEach(p => lift('fs-img-partner-' + p.id, u => {
    p.img = u;
  }));
  (data.journey || []).forEach(s => lift('fs-img-specimen-' + s.n, u => {
    s.img = u;
  }));
  return data;
}
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];
const PAGES = [['I', 'The Foyer', '#fs-foyer', 'foyer'], ['II', 'The Herbarium', '#fs-herbarium', 'herbarium'], ['III', 'The Almanac', '#fs-almanac', 'almanac'], ['IV', 'The Garden Beds', '#fs-beds', 'beds'], ['V', 'By the Door', '#fs-door', 'door'], ['VI', 'Open Secrets', '#fs-secrets', 'secrets'], ['VII', 'The Hall Tray', '#fs-partners', 'partners'], ['VIII', 'The Letter', '#fs-letter', 'letter']];
const hrefOf = p => window.FS_HREFS && window.FS_HREFS[p[3]] || p[2];
const inCarrd = () => !!document.querySelector('.fs-mount');
function createStore(v) {
  let s = v;
  const subs = new Set();
  return {
    get: () => s,
    set: n => {
      s = typeof n === 'function' ? n(s) : n;
      subs.forEach(f => f());
    },
    sub: f => {
      subs.add(f);
      return () => subs.delete(f);
    }
  };
}
const modeStore = createStore((() => {
  try {
    return localStorage.getItem('fs-mode') || 'manor';
  } catch (e) {
    return 'manor';
  }
})());
const toastStore = createStore('');
const routeStore = createStore(null);
const keyStore = createStore(false);
const secKey = k => {
  const i = PAGES.findIndex(p => p[3] === k);
  return `sec:Carrd section · set its ID to “${k}” · embed 1${i + 1}-${k}.html → Embed · Code · Inline · <div class="fs-mount" data-page="${k}" data-href="#${k}"> · CSS ${PAGES[i][2]}`;
};
const useStore = st => React.useSyncExternalStore(st.sub, st.get);
const Stars = ({
  n
}) => React.createElement("div", {
  className: "st",
  "aria-label": n + ' of 5'
}, '★'.repeat(n), '☆'.repeat(5 - n));
const Marg = ({
  tl,
  tr,
  bl,
  br
}) => React.createElement(React.Fragment, null, ['tl', 'tr', 'bl', 'br'].map(c => React.createElement(Bot, {
  key: c,
  k: "corner",
  className: 'flourish ' + c
})), tl && React.createElement("div", {
  className: "marg tl"
}, tl), tr && React.createElement("div", {
  className: "marg tr"
}, tr), bl && React.createElement("div", {
  className: "marg bl"
}, bl), br && React.createElement("div", {
  className: "marg br"
}, br));
function useMode() {
  const mode = useStore(modeStore);
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    try {
      localStorage.setItem('fs-mode', mode);
    } catch (e) {}
  }, [mode]);
  return [mode, () => modeStore.set(m => m === 'manor' ? 'sunlit' : 'manor')];
}
function useToast() {
  const msg = useStore(toastStore);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => toastStore.set(''), 1800);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg, toastStore.set];
}
function copyText(text, done) {
  const fallback = () => {
    try {
      const s = document.createElement('span');
      s.textContent = text;
      document.body.appendChild(s);
      const r = document.createRange();
      r.selectNodeContents(s);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      document.execCommand('copy');
      document.body.removeChild(s);
      done('Copied');
    } catch (e) {
      done('Select and copy · ' + text);
    }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done('Copied · ' + text), fallback);else fallback();
}
function useCurrentPage(dep) {
  const [cur, setCur] = useState('#fs-foyer');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) setCur('#' + e.target.id);
      });
    }, {
      rootMargin: '-45% 0px -50% 0px'
    });
    PAGES.forEach(p => {
      const el = document.querySelector(p[2]);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [dep]);
  return cur;
}
function readRoute() {
  const m = /^#fs-evening-([\w-]+)$/.exec(location.hash || '');
  return m ? m[1] : null;
}
if (!inCarrd()) routeStore.set(readRoute());
function useRoute() {
  const route = useStore(routeStore);
  useEffect(() => {
    if (inCarrd()) return;
    const h = () => routeStore.set(readRoute());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return route;
}
function goEvening(id, ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  if (inCarrd()) {
    routeStore.set(id);
    const m = document.querySelector('.fs-mount[data-page="almanac"]');
    if (m) requestAnimationFrame(() => window.scrollTo({
      top: m.getBoundingClientRect().top + window.scrollY - 72,
      behavior: 'smooth'
    }));
  } else location.hash = id ? '#fs-evening-' + id : '#fs-almanac';
}
function Chrome({
  site,
  mode,
  toggle,
  cur
}) {
  const [open, setOpen] = useState(false);
  const prog = useRef(null);
  useEffect(() => {
    if (!open) return;
    const k = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open]);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = 0;
      const el = prog.current;
      if (!el) return;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
      el.style.setProperty('--p', p.toFixed(2) + '%');
      el.style.setProperty('--po', p > 0.5 ? '1' : '0');
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('scroll', on, {
      passive: true
    });
    window.addEventListener('resize', on);
    window.addEventListener('hashchange', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      window.removeEventListener('hashchange', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const [msg] = useToast();
  const showKey = !inCarrd() || /fskey/.test(location.search + location.hash);
  return React.createElement(React.Fragment, null, React.createElement(Sprite, null), React.createElement("nav", {
    className: "nav",
    id: "fs-nav",
    "aria-label": "Pages",
    "data-fsk": "emb:Hidden embeds \xB7 01-head.html \u2192 Hidden\xB7Head \xB7 02-body-end.html \u2192 Hidden\xB7Body End \xB7 the bar needs no element \xB7 CSS #fs-nav"
  }, React.createElement("div", {
    className: "prog",
    id: "fs-progress",
    ref: prog,
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "wrap"
  }, React.createElement("a", {
    className: "mark",
    href: hrefOf(PAGES[0]),
    "aria-label": "The Florette"
  }, React.createElement("b", null, "Flor"), React.createElement("i", null, "ette")), React.createElement("div", {
    className: "navlinks"
  }, PAGES.map(p => React.createElement("a", {
    key: p[0],
    href: hrefOf(p),
    className: 'ul' + (cur === p[2] ? ' on' : '')
  }, p[1].replace('The ', '')))), showKey && React.createElement("button", {
    className: "mode key",
    id: "fs-key",
    onClick: () => keyStore.set(v => !v),
    "aria-pressed": useStore(keyStore),
    title: "The Keeper\u2019s Key \u2014 show where every Carrd element and id goes"
  }, React.createElement("span", {
    className: "sw",
    "aria-hidden": "true"
  }), React.createElement("span", {
    className: "lbl"
  }, "keeper\u2019s key")), React.createElement("button", {
    className: "mode",
    id: "fs-mode",
    onClick: toggle,
    "aria-pressed": mode === 'sunlit',
    title: "Toggle the reading mode"
  }, React.createElement("span", {
    className: "sw",
    "aria-hidden": "true"
  }), React.createElement("span", {
    className: "lbl"
  }, mode === 'manor' ? 'sunlit archive' : 'manor mode')), React.createElement("button", {
    className: "burger",
    "aria-label": "Open the directory",
    onClick: () => setOpen(true)
  }, "\u2261")), open && React.createElement("div", {
    className: "drawer",
    role: "dialog",
    "aria-label": "Directory"
  }, React.createElement("button", {
    className: "x",
    "aria-label": "Close",
    onClick: () => setOpen(false)
  }, "\u2715"), PAGES.map(p => React.createElement("a", {
    key: p[0],
    href: hrefOf(p),
    onClick: () => setOpen(false)
  }, React.createElement("span", null, p[0]), p[1])), React.createElement("a", {
    href: site.discord,
    target: "_blank",
    rel: "noopener"
  }, React.createElement("span", null, "\u2767"), "Discord"))), msg && React.createElement("div", {
    className: "toast",
    role: "status"
  }, msg), React.createElement(KeyOverlay, null), React.createElement("div", {
    className: "rail l",
    id: "fs-rail-l",
    "aria-label": "Page index"
  }, PAGES.map(p => React.createElement("a", {
    key: p[0],
    href: hrefOf(p),
    className: cur === p[2] ? 'on' : '',
    title: p[1]
  }, p[0]))), React.createElement("div", {
    className: "rail r",
    id: "fs-rail-r",
    "aria-label": "Doors"
  }, React.createElement("a", {
    href: site.discord,
    target: "_blank",
    rel: "noopener",
    title: "Discord"
  }, "\u2709"), React.createElement("a", {
    href: site.athenaeum,
    target: "_blank",
    rel: "noopener",
    title: "The Athenaeum"
  }, "\u2600"), React.createElement("a", {
    href: site.solarium,
    target: "_blank",
    rel: "noopener",
    title: "The Solarium"
  }, "\u263D"), React.createElement("button", {
    onClick: toggle,
    title: "Toggle the reading mode"
  }, "\u25D0"), showKey && React.createElement("button", {
    onClick: () => keyStore.set(v => !v),
    title: "The Keeper\u2019s Key"
  }, "\u2756")));
}
function Foyer({
  hero,
  site,
  tomes
}) {
  const p = pageNo('#fs-foyer');
  return React.createElement("header", {
    className: "page foyer",
    id: "fs-foyer",
    "data-fsk": secKey('foyer')
  }, React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, p.r), " \xB7 The Foyer"),
    tr: 'page. ' + p.n,
    bl: React.createElement(React.Fragment, null, "Crystal \xB7 Mateus \xB7 ", React.createElement("b", null, "Lavender Beds")),
    br: "kept by Aurore Laon"
  }), React.createElement(Tome, {
    id: "#fs-foyer",
    tomes: tomes
  }), React.createElement("div", {
    className: "hero",
    id: "fs-hero",
    "aria-hidden": "true",
    "data-fsk": "img:Image \xB7 ID fs-img-hero \xB7 the banner \xB7 caption Text fs-hero-caption",
    style: hero.img ? {
      '--img': `url('${hero.img}')`
    } : undefined
  }, hero.caption && React.createElement("span", {
    className: "cap micro"
  }, hero.caption)), React.createElement("div", {
    className: "wrap"
  }, React.createElement("h1", {
    className: "title t"
  }, React.createElement("span", {
    className: "sm"
  }, "The house of the"), React.createElement("span", {
    className: "big"
  }, React.createElement("i", null, "Flor"), "ette")), React.createElement("div", {
    className: "sub"
  }, React.createElement("span", {
    className: "tagl",
    "data-fsk": "txt:Text \xB7 ID fs-hero-tagline"
  }, hero.tagline), React.createElement("div", {
    className: "chno"
  }, p.n)), React.createElement("div", {
    className: "lead"
  }, React.createElement("p", {
    className: "body",
    "data-fsk": "txt:Text \xB7 ID fs-hero-lead"
  }, React.createElement("b", null, hero.lead.split(':')[0], ":"), hero.lead.split(':').slice(1).join(':')), React.createElement("div", {
    className: "ctas",
    "data-fsk": "txt:Text \xB7 fs-hero-buttons-0-label \xB7 -1-label \xB7 -2-label (links: -href)"
  }, hero.buttons.map((b, i) => React.createElement("a", {
    key: b.href,
    className: 'btn' + (i === 0 ? ' fill' : ''),
    href: b.href
  }, b.label)), React.createElement("a", {
    className: "btn",
    href: site.discord,
    target: "_blank",
    rel: "noopener"
  }, "Discord \u2197"))), React.createElement("div", {
    className: "meta",
    id: "fs-meta",
    "data-fsk": "txt:Text \xB7 fs-hero-meta-0-k / -v \u2026 fs-hero-meta-3-v"
  }, hero.meta.map(m => React.createElement("div", {
    key: m.k
  }, React.createElement("div", {
    className: "k"
  }, m.k), React.createElement("div", {
    className: "v"
  }, m.v))))));
}
const CATS = [['all', 'All nights'], ['rp', 'RP & venues'], ['midcore', 'Mid-core & combat'], ['creative', 'Creative & social']];
function Almanac({
  rhythm,
  events,
  traditions,
  tomes
}) {
  const [cat, setCat] = useState('all');
  const pn = pageNo('#fs-almanac');
  const today = new Date().getDay();
  const now = Date.now();
  const sorted = useMemo(() => events.slice().sort((a, b) => Date.parse(a.start) - Date.parse(b.start)), [events]);
  const next = sorted.find(e => Date.parse(e.start) > now) || sorted[sorted.length - 1];
  const [sel, setSel] = useState(next ? next.id : null);
  const e = sorted.find(x => x.id === sel) || next;
  const idx = sorted.findIndex(x => x.id === (e && e.id));
  const track = useRef(null);
  const [ends, setEnds] = useState({
    s: true,
    e: false
  });
  const measure = useCallback(() => {
    const t = track.current;
    if (!t) return;
    setEnds({
      s: t.scrollLeft <= 2,
      e: t.scrollLeft + t.clientWidth >= t.scrollWidth - 2
    });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, sorted.length]);
  useEffect(() => {
    const t = track.current;
    if (!t || !e) return;
    const el = t.querySelector('.tile.on');
    if (!el) return;
    const left = el.offsetLeft;
    if (left < t.scrollLeft + 8 || left + el.offsetWidth > t.scrollLeft + t.clientWidth - 8) t.scrollTo({
      left: Math.max(0, left - 8),
      behavior: 'smooth'
    });
  }, [e && e.id]);
  const slide = dir => {
    const t = track.current;
    if (!t) return;
    t.scrollBy({
      left: dir * Math.max(160, t.clientWidth * 0.8),
      behavior: 'smooth'
    });
  };
  const dateOf = x => {
    const dt = new Date(x.start);
    if (isNaN(dt)) return '';
    const f = o => new Intl.DateTimeFormat('en-US', Object.assign({
      timeZone: 'America/New_York'
    }, o)).format(dt);
    return f({
      month: 'short',
      day: 'numeric'
    }) + ' · ' + f({
      year: 'numeric'
    });
  };
  return React.createElement("section", {
    className: "page alm",
    id: "fs-almanac",
    "data-fsk": secKey('almanac')
  }, React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, pn.r), " \xB7 The Gardener\u2019s Almanac"),
    tr: 'page. ' + pn.n,
    bl: "all times EST",
    br: React.createElement(React.Fragment, null, "the week \xB7 ", React.createElement("b", null, rhythm.days[today]))
  }), React.createElement(Tome, {
    id: "#fs-almanac",
    tomes: tomes
  }), React.createElement("div", {
    className: "pgnum",
    "aria-hidden": "true"
  }, pn.n), React.createElement("div", {
    className: "vrule dia",
    style: {
      left: 'calc(var(--gut) + 6px)',
      top: '14%',
      height: '30%'
    },
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "wrap"
  }, React.createElement("div", {
    className: "head"
  }, React.createElement("div", null, React.createElement("span", {
    className: "eyebrow"
  }, "The Gardener\u2019s Almanac"), React.createElement("h2", null, "the ", React.createElement("span", {
    className: "strike"
  }, "week"), ", in order")), React.createElement("div", {
    className: "r"
  }, React.createElement("div", {
    className: "tabs",
    role: "tablist"
  }, CATS.map(c => React.createElement("button", {
    key: c[0],
    role: "tab",
    "aria-selected": cat === c[0],
    className: cat === c[0] ? 'on' : '',
    onClick: () => setCat(c[0])
  }, c[1]))))), React.createElement("div", {
    className: "week",
    id: "fs-rhythm",
    "data-fsk": "css:#fs-rhythm \xB7 .fs-day[data-day] \xB7 the week\u2019s items: rhythm.items through the fs-data JSON"
  }, rhythm.days.map((d, i) => {
    const items = rhythm.items.filter(it => it.day === i && (cat === 'all' || it.cat === cat));
    return React.createElement("div", {
      className: 'day fs-day' + (i === today ? ' today' : ''),
      "data-day": d,
      key: d
    }, React.createElement("div", {
      className: "dn"
    }, d.slice(0, 3), React.createElement("small", null, i === today ? 'tonight' : d)), items.length ? React.createElement("ul", null, items.map((it, k) => React.createElement("li", {
      key: k,
      className: it.cat
    }, React.createElement("div", {
      className: "t"
    }, it.time), React.createElement("div", {
      className: "n"
    }, it.venue === 'ath' ? '☀ ' : it.venue === 'sol' ? '☽ ' : '', it.name)))) : React.createElement("div", {
      className: "rest"
    }, "a quiet night"));
  })), React.createElement("div", {
    className: "under"
  }, React.createElement("div", {
    className: "legend"
  }, React.createElement("span", null, React.createElement("i", {
    style: {
      background: 'var(--gold)'
    }
  }), "RP & venues"), React.createElement("span", null, React.createElement("i", {
    style: {
      background: 'var(--crim2)'
    }
  }), "Mid-core & combat"), React.createElement("span", null, React.createElement("i", {
    style: {
      background: '#B48BD6'
    }
  }), "Creative & social"), React.createElement("span", null, "\u2600 Athenaeum \xB7 \u263D Solarium")), (cat === 'all' || cat === 'creative') && React.createElement("div", {
    className: "daily",
    "data-fsk": "txt:Text \xB7 fs-rhythm-daily-desc (also -name \xB7 -time)"
  }, "\u270E ", React.createElement("b", null, rhythm.daily.name), " \u2014 ", rhythm.daily.time.toLowerCase(), ". ", rhythm.daily.desc)), traditions && traditions.length > 0 && React.createElement("div", {
    id: "fs-traditions"
  }, React.createElement(Flor, null), React.createElement("div", {
    className: "micro gold",
    style: {
      marginBottom: 8
    }
  }, "What stayed \xB7 traditions of the house"), React.createElement("div", {
    className: "trad",
    "data-fsk": "txt:Text \xB7 fs-traditions-0-n / -p \u2026 3 \xB7 CSS .fs-tradition"
  }, traditions.map(t => React.createElement("div", {
    key: t.n,
    className: "fs-tradition"
  }, React.createElement(Bot, {
    k: "rosette"
  }), React.createElement("b", null, t.n), React.createElement("p", null, t.p))))), React.createElement("div", {
    className: "soi",
    id: "fs-soirees"
  }, React.createElement("div", {
    className: "notif"
  }, React.createElement("span", {
    className: "micro"
  }, "Notification"), React.createElement("h3", null, "New evening ", React.createElement("span", {
    className: "strike"
  }, "unfolded")), React.createElement("p", null, "Congratulations, you have found the seasonal soir\xE9es. Choose an evening to learn more about it.")), React.createElement("div", {
    className: "tilesw",
    id: "fs-soiree-strip"
  }, React.createElement("button", {
    className: "arr",
    "aria-label": "Earlier evenings",
    disabled: ends.s,
    onClick: () => slide(-1)
  }, "\u2039"), React.createElement("div", {
    className: "tiles",
    role: "tablist",
    ref: track,
    onScroll: measure
  }, sorted.map(x => React.createElement("button", {
    key: x.id,
    role: "tab",
    "aria-selected": e && e.id === x.id,
    className: 'tile fs-event' + (e && e.id === x.id ? ' on' : ''),
    "data-id": x.id,
    "data-fsk": 'img:Image · fs-img-event-' + x.id + ' · Text fs-events-' + x.id + '-blurb · .fs-event[data-id]',
    style: {
      '--ac': x.ac,
      ...(x.img ? {
        '--img': `url('${x.img}')`
      } : {})
    },
    onClick: () => setSel(x.id)
  }, Date.parse(x.start) < now && React.createElement("span", {
    className: "held"
  }, "held"), React.createElement("span", {
    className: "d"
  }, dateOf(x)), React.createElement("span", {
    className: "t"
  }, x.t)))), React.createElement("button", {
    className: "arr",
    "aria-label": "Later evenings",
    disabled: ends.e,
    onClick: () => slide(1)
  }, "\u203A")), e && React.createElement("div", {
    className: "unlock",
    key: e.id,
    "data-fsk": 'txt:Text · fs-events-' + e.id + '-story / -when / -where / -dress / -note · page banner: Image fs-img-banner-' + e.id
  }, React.createElement("div", null, React.createElement("div", {
    className: "u"
  }, Date.parse(e.start) > now ? next && next.id === e.id ? 'Unfolded · the next evening' : 'Unfolded · on the calendar' : 'Unfolded · held'), React.createElement("h4", null, e.t.split(' ').slice(0, -1).join(' '), " ", React.createElement("em", null, e.t.split(' ').slice(-1))), React.createElement("div", {
    className: "q"
  }, "\u201C", e.blurb.split(' — ')[0], "\u201D ", React.createElement("b", null, e.s)), React.createElement("div", {
    className: "about"
  }, React.createElement("span", {
    className: "k"
  }, "About the evening:"), React.createElement("p", null, e.story || e.blurb)), e.highlights.length > 0 && React.createElement("div", {
    className: "cols"
  }, React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "From the Solarium"), React.createElement("ul", null, e.highlights.slice(0, 3).map((h, i) => React.createElement("li", {
    key: i
  }, h)))), React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "From the Athenaeum"), React.createElement("ul", null, e.highlights.slice(3, 6).map((h, i) => React.createElement("li", {
    key: i
  }, h))))), e.amusements.length > 0 && React.createElement("div", {
    className: "am"
  }, e.amusements.map((a, i) => React.createElement("div", {
    key: i
  }, React.createElement("b", null, a.name), React.createElement("i", null, a.host), React.createElement("p", null, a.text))))), React.createElement("div", {
    className: "side"
  }, React.createElement("div", {
    className: "img",
    style: e.img ? {
      '--img': `url('${e.img}')`,
      '--ac': e.ac
    } : {
      '--ac': e.ac
    }
  }), React.createElement("div", {
    className: "meta2"
  }, React.createElement("div", null, React.createElement("span", {
    className: "k"
  }, "Date"), React.createElement("span", null, e.when)), React.createElement("div", null, React.createElement("span", {
    className: "k"
  }, "Where"), React.createElement("span", null, e.where)), e.dress && React.createElement("div", null, React.createElement("span", {
    className: "k"
  }, "Dress"), React.createElement("span", null, e.dress)), e.note && React.createElement("div", null, React.createElement("span", {
    className: "k"
  }, "Note"), React.createElement("span", null, e.note))), React.createElement("div", {
    className: "go"
  }, e.url ? React.createElement("a", {
    className: "btn fill sm",
    href: e.url,
    target: "_blank",
    rel: "noopener"
  }, "Visit its own site \u2197") : React.createElement("a", {
    className: "btn fill sm fs-evening-link",
    href: '#fs-evening-' + e.id,
    onClick: ev => goEvening(e.id, ev)
  }, "Read the full evening \u2192"), React.createElement("span", {
    className: "hint"
  }, e.url ? 'this evening keeps its own pages' : 'the story · amusements · menu · giveaways · company'))), React.createElement("button", {
    className: "next",
    onClick: () => setSel(sorted[(idx + 1) % sorted.length].id)
  }, "Next evening \u203A")))));
}
const ORBS = ['✿', '☾', '✦', '❧', '✸', '❀', '✺', '❖'];
function inWords(start) {
  const diff = Date.parse(start) - Date.now();
  if (isNaN(diff)) return '';
  if (diff <= 0) return diff > -6 * 36e5 ? 'happening now' : 'held';
  const d = Math.floor(diff / 864e5),
    h = Math.floor(diff % 864e5 / 36e5);
  if (d === 0) return h <= 1 ? 'within the hour' : `in ${h} hours`;
  if (d === 1) return 'tomorrow';
  return `in ${d} days`;
}
function Evening({
  e,
  events,
  partners,
  site
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
    const t = document.title;
    document.title = e.t + ' · The Florette';
    return () => {
      document.title = t;
    };
  }, [e.id]);
  const sorted = events.slice().sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const idx = sorted.findIndex(x => x.id === e.id);
  const prev = sorted[(idx - 1 + sorted.length) % sorted.length],
    nxt = sorted[(idx + 1) % sorted.length];
  const words = e.t.split(' ');
  const halls = (e.partners || []).map(id => partners.items.find(p => p.id === id)).filter(Boolean);
  const hl = e.highlights || [],
    half = Math.ceil(hl.length / 2),
    menu = e.menu || [],
    gifts = e.giveaways || [],
    games = e.amusements || [];
  const prices = [...new Set(menu.map(d => d.p))];
  const priceNote = menu.length ? prices.length === 1 ? `all ${prices[0]} gil` : menu.length + ' on the card' : '';
  const evHref = x => x.url ? x.url : '#fs-evening-' + x.id;
  const evGo = x => x.url ? undefined : ev => goEvening(x.id, ev);
  let n = 0;
  const sk = (t, em) => React.createElement("div", {
    className: "sk"
  }, React.createElement("i", null, ROMAN[n++], "."), t, em && React.createElement("em", null, "\xB7 ", em));
  return React.createElement("article", {
    className: "eve fs-evening",
    id: 'fs-evening-' + e.id,
    "data-id": e.id,
    style: {
      '--ac': e.ac
    }
  }, React.createElement("header", {
    className: "hero"
  }, React.createElement("div", {
    className: "img",
    "data-fsk": 'img:Image · fs-img-banner-' + e.id + ' (else fs-img-event-' + e.id + ')',
    style: e.banner || e.img ? {
      '--img': `url('${e.banner || e.img}')`
    } : undefined,
    "aria-hidden": "true"
  }), React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, pageNo('#fs-almanac').r), " \xB7 an evening, unfolded"),
    tr: React.createElement(React.Fragment, null, "the almanac \xB7 ", React.createElement("b", null, e.id))
  }), React.createElement("div", {
    className: "ring",
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "wrap"
  }, React.createElement("a", {
    className: "back",
    href: "#fs-almanac",
    onClick: ev => goEvening(null, ev)
  }, "\u2190 back to the Almanac"), React.createElement("div", {
    className: "eyebrow"
  }, e.s), React.createElement("h1", null, words.slice(0, -1).join(' '), " ", React.createElement("i", null, words.slice(-1))), React.createElement("div", {
    className: "when"
  }, React.createElement("span", null, e.when), React.createElement("span", {
    className: "in"
  }, inWords(e.start))))), React.createElement("div", {
    className: "wrap body2"
  }, React.createElement("div", {
    className: "meta"
  }, React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "When"), React.createElement("div", {
    className: "v"
  }, e.when)), React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "Where"), React.createElement("div", {
    className: "v"
  }, e.where)), e.dress && React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "Dress"), React.createElement("div", {
    className: "v"
  }, e.dress)), e.note && React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "Note"), React.createElement("div", {
    className: "v"
  }, e.note))), React.createElement("section", {
    className: "sec"
  }, sk('The evening'), React.createElement("div", {
    className: "story"
  }, React.createElement("p", {
    className: "dc",
    "data-fsk": 'txt:Text · fs-events-' + e.id + '-story'
  }, e.story || e.blurb), React.createElement("div", {
    className: "aside"
  }, React.createElement("div", {
    className: "k"
  }, "In a line"), React.createElement("p", null, e.blurb), e.sessions && e.sessions.length > 0 && React.createElement(React.Fragment, null, React.createElement("span", {
    className: "k"
  }, "The evenings"), React.createElement("ul", {
    className: "sess"
  }, e.sessions.map((s, i) => React.createElement("li", {
    key: i
  }, React.createElement("b", null, s.d), React.createElement("span", null, s.t))))), e.note && React.createElement(React.Fragment, null, React.createElement("span", {
    className: "k"
  }, "Before you come"), React.createElement("p", null, e.note, "."))))), hl.length > 0 && React.createElement("section", {
    className: "sec"
  }, sk('On the floor'), React.createElement("div", {
    className: "cols"
  }, React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "From the Solarium"), React.createElement("ul", null, hl.slice(0, half).map((h, i) => React.createElement("li", {
    key: i
  }, h)))), React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "From the Athenaeum"), React.createElement("ul", null, hl.slice(half).map((h, i) => React.createElement("li", {
    key: i
  }, h)))))), games.length > 0 && React.createElement("section", {
    className: "sec"
  }, sk('The evening’s amusements', games.length + ' to play'), React.createElement("div", {
    className: "games"
  }, games.map((a, i) => React.createElement("div", {
    className: "game",
    key: i
  }, React.createElement("span", {
    className: "orb",
    "aria-hidden": "true"
  }, ORBS[i % ORBS.length]), React.createElement("b", null, a.name), React.createElement("i", null, a.host), React.createElement("p", null, a.text))))), React.createElement("section", {
    className: "sec",
    id: "fs-menu"
  }, sk('The evening’s menu', priceNote), menu.length ? React.createElement("div", {
    className: "menu",
    "data-fsk": 'txt:Text · fs-events-' + e.id + '-menu-0-n / -d / -p … · new dishes through fs-data'
  }, menu.map((d, i) => React.createElement("div", {
    className: "dish",
    key: i
  }, React.createElement("span", {
    className: "ic",
    "aria-hidden": "true"
  }, d.ic), React.createElement("b", null, d.n), React.createElement("span", {
    className: "p"
  }, d.p, " ", React.createElement("small", null, "gil")), React.createElement("i", null, (d.g || []).join(' · ')), React.createElement("p", null, d.d)))) : React.createElement("p", {
    className: "none"
  }, "The card for this evening is still being written; the bar will have something for you regardless.")), React.createElement("section", {
    className: "sec",
    id: "fs-giveaways"
  }, sk('Giveaways', gifts.length ? gifts.length + ' to win' : ''), gifts.length ? React.createElement("div", {
    className: "gifts",
    "data-fsk": 'txt:Text · fs-events-' + e.id + '-giveaways-0-name / -prize / -how'
  }, gifts.map((g, i) => React.createElement("div", {
    className: "gift",
    key: i
  }, /^to be announced/i.test(g.prize || '') && React.createElement("span", {
    className: "seal"
  }, "to be announced"), React.createElement("div", {
    className: "k"
  }, g.k || 'Drawn on the night'), React.createElement("b", null, g.name), React.createElement("div", {
    className: "prize"
  }, g.prize), React.createElement("p", null, g.how)))) : React.createElement("p", {
    className: "none"
  }, "No giveaways have been written for this evening yet.")), React.createElement("section", {
    className: "sec",
    id: "fs-company"
  }, sk('In company with', halls.length ? halls.length + ' partnered' : ''), halls.length ? React.createElement("div", {
    className: "cards"
  }, halls.map((p, i) => React.createElement(PartnerCard, {
    p: p,
    i: i,
    key: p.id
  }))) : React.createElement("p", {
    className: "none"
  }, "No partnered hall has written itself onto this evening yet. When one does, its calling card from the Hall Tray appears here.")), React.createElement("div", {
    className: "foot"
  }, React.createElement("div", {
    className: "nx"
  }, React.createElement("a", _extends({
    href: evHref(prev),
    onClick: evGo(prev)
  }, prev.url ? {
    target: '_blank',
    rel: 'noopener'
  } : {}), React.createElement("small", null, "\u2039 the evening before"), prev.t), React.createElement("a", _extends({
    href: evHref(nxt),
    onClick: evGo(nxt)
  }, nxt.url ? {
    target: '_blank',
    rel: 'noopener'
  } : {}), React.createElement("small", null, "the evening after \u203A"), nxt.t)), React.createElement("div", {
    className: "ct"
  }, React.createElement("a", {
    className: "btn fill",
    href: site.discord,
    target: "_blank",
    rel: "noopener"
  }, "Ask on Discord \u2197"), React.createElement("a", {
    className: "btn",
    href: "#fs-almanac",
    onClick: ev => goEvening(null, ev)
  }, "Back to the Almanac")))));
}
function KeyOverlay() {
  const on = useStore(keyStore);
  const [boxes, setBoxes] = useState([]);
  useEffect(() => {
    if (on) document.documentElement.setAttribute('data-key', 'on');else document.documentElement.removeAttribute('data-key');
    if (!on) {
      setBoxes([]);
      return;
    }
    let raf = 0;
    const calc = () => {
      raf = 0;
      const out = [];
      document.querySelectorAll('[data-fsk]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < -60 || r.top > innerHeight + 60) return;
        const lt = r.top < 72 && r.height > 120 ? Math.min(72 - r.top + 8, r.height - 40) : 0;
        out.push({
          k: el.getAttribute('data-fsk'),
          t: r.top,
          l: r.left,
          w: r.width,
          h: r.height,
          lt
        });
      });
      setBoxes(out);
    };
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener('scroll', tick, true);
    window.addEventListener('resize', tick);
    const iv = setInterval(calc, 700);
    return () => {
      window.removeEventListener('scroll', tick, true);
      window.removeEventListener('resize', tick);
      clearInterval(iv);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [on]);
  if (!on) return null;
  return ReactDOM.createPortal(React.createElement("div", {
    className: "fsk-layer",
    "aria-hidden": "true"
  }, boxes.map((b, i) => {
    const m = /^(\w+):([\s\S]*)$/.exec(b.k) || [0, 'css', b.k];
    return React.createElement("div", {
      key: i,
      className: 'fsk ' + m[1],
      style: {
        top: b.t,
        left: b.l,
        width: b.w,
        height: b.h
      }
    }, React.createElement("span", {
      style: m[1] === 'sec' ? {
        top: b.lt - 1
      } : {
        top: b.lt - 9,
        maxWidth: Math.max(120, b.w - 6)
      }
    }, m[2]));
  }), React.createElement("div", {
    className: "fsk-legend"
  }, React.createElement("button", {
    type: "button",
    onClick: () => keyStore.set(false)
  }, "close"), React.createElement("b", null, "The Keeper\u2019s Key"), " \xB7 what to add in Carrd, and where.", React.createElement("br", null), React.createElement("span", {
    className: "sw",
    style: {
      background: '#D4AF37'
    }
  }), React.createElement("b", null, "Image"), " element \xB7 give it the ID shown", React.createElement("br", null), React.createElement("span", {
    className: "sw",
    style: {
      background: '#F3EADA',
      border: '1px solid #8E7E97'
    }
  }), React.createElement("b", null, "Text"), " element \xB7 its ID replaces that string", React.createElement("br", null), React.createElement("span", {
    className: "sw",
    style: {
      background: '#C9304C'
    }
  }), React.createElement("b", null, "Section"), " \xB7 the Carrd section ID, its embed file and mount", React.createElement("br", null), React.createElement("span", {
    className: "sw",
    style: {
      background: '#8E7E97'
    }
  }), "CSS hook only (ids and classes for custom CSS)", React.createElement("br", null), "Every string has an id: ", React.createElement("b", null, "fs-"), " + its path (full list in carrd/ids.md). Lists are edited through the fs-data JSON.")), document.body);
}
function Sprite() {
  const fern = [];
  for (let i = 0; i < 11; i++) {
    const y = 180 - i * 15,
      l = 26 - i * 1.9;
    fern.push(React.createElement("path", {
      key: 'l' + i,
      d: `M50 ${y} q ${-l * .6} -2 ${-l} ${-l * .55}`
    }), React.createElement("path", {
      key: 'r' + i,
      d: `M50 ${y - 7} q ${l * .6} -2 ${l} ${-l * .55}`
    }));
  }
  const petals = [];
  for (let i = 0; i < 8; i++) petals.push(React.createElement("ellipse", {
    key: i,
    cx: "50",
    cy: "27",
    rx: "9",
    ry: "21",
    transform: `rotate(${i * 45} 50 50)`
  }));
  return React.createElement("svg", {
    width: "0",
    height: "0",
    style: {
      position: 'absolute'
    },
    "aria-hidden": "true"
  }, React.createElement("symbol", {
    id: "fs-sprig",
    viewBox: "0 0 100 160"
  }, React.createElement("g", {
    className: "bot"
  }, React.createElement("path", {
    d: "M50 156 C 47 120, 55 85, 50 12"
  }), React.createElement("path", {
    d: "M50 128 c -18 -4 -28 -14 -30 -30 c 16 2 26 12 30 30 z"
  }), React.createElement("path", {
    d: "M50 108 c 18 -4 28 -14 30 -30 c -16 2 -26 12 -30 30 z"
  }), React.createElement("path", {
    d: "M50 86 c -17 -4 -26 -13 -28 -28 c 15 2 24 11 28 28 z"
  }), React.createElement("path", {
    d: "M50 66 c 17 -4 26 -13 28 -28 c -15 2 -24 11 -28 28 z"
  }), React.createElement("path", {
    d: "M50 46 c -14 -3 -21 -11 -23 -23 c 12 2 20 9 23 23 z"
  }), React.createElement("path", {
    d: "M50 12 c -7 10 -7 19 0 26 c 7 -7 7 -16 0 -26 z"
  }))), React.createElement("symbol", {
    id: "fs-rosette",
    viewBox: "0 0 100 100"
  }, React.createElement("g", {
    className: "bot"
  }, petals, React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "7"
  }))), React.createElement("symbol", {
    id: "fs-corner",
    viewBox: "0 0 100 100"
  }, React.createElement("g", {
    className: "bot"
  }, React.createElement("path", {
    d: "M4 96 L4 24 Q4 4 24 4 L96 4"
  }), React.createElement("path", {
    d: "M12 96 L12 30 Q12 12 30 12 L96 12"
  }), React.createElement("path", {
    d: "M20 28 q 8 -10 18 -2 q 6 6 -2 12 q -6 4 -8 -2"
  }), React.createElement("circle", {
    cx: "24",
    cy: "24",
    r: "2.2"
  }), React.createElement("path", {
    d: "M4 60 q 10 -4 18 4 M60 4 q -4 10 4 18"
  }))), React.createElement("symbol", {
    id: "fs-fern",
    viewBox: "0 0 100 200"
  }, React.createElement("g", {
    className: "bot"
  }, React.createElement("path", {
    d: "M50 196 Q 47 110 51 8"
  }), fern)));
}
const Bot = ({
  k,
  className,
  style
}) => React.createElement("svg", {
  className: className,
  style: style,
  "aria-hidden": "true"
}, React.createElement("use", {
  href: '#fs-' + k
}));
const Flor = ({
  sm
}) => React.createElement("div", {
  className: 'flor' + (sm ? ' sm' : ''),
  "aria-hidden": "true"
}, React.createElement("i", null), React.createElement(Bot, {
  k: "rosette"
}), React.createElement("i", null));
const Ghost = ({
  k,
  style
}) => React.createElement(Bot, {
  k: k,
  className: "ghost-bot",
  style: style
});
function pageNo(id) {
  const i = PAGES.findIndex(p => p[2] === id);
  return {
    r: ROMAN[i] || '',
    n: String(i + 1).padStart(2, '0'),
    name: (PAGES[i] || [])[1] || ''
  };
}
function Tome({
  id,
  tomes
}) {
  const p = pageNo(id);
  const t = (tomes || {})[id] || {};
  return React.createElement("div", {
    className: "tome",
    "aria-hidden": "true"
  }, React.createElement("span", {
    className: "ln"
  }), React.createElement("span", {
    className: "med"
  }, p.r), React.createElement("span", {
    className: "ln r"
  }), t.bot && React.createElement("i", null, t.bot), t.note && React.createElement("em", null, "\xB7 ", t.note));
}
function Herbarium({
  story,
  journey,
  homes,
  tomes
}) {
  const p = pageNo('#fs-herbarium');
  return React.createElement("section", {
    className: "page herb",
    id: "fs-herbarium",
    "data-fsk": secKey('herbarium')
  }, React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, p.r), " \xB7 The Herbarium"),
    tr: 'page. ' + p.n,
    bl: React.createElement(React.Fragment, null, "first pressed ", React.createElement("b", null, "February 2024")),
    br: React.createElement(React.Fragment, null, React.createElement("b", null, journey.length), " specimens, and counting")
  }), React.createElement(Tome, {
    id: "#fs-herbarium",
    tomes: tomes
  }), React.createElement("div", {
    className: "pgnum",
    "aria-hidden": "true"
  }, p.n), React.createElement(Ghost, {
    k: "fern",
    style: {
      right: 'calc(var(--gutr) + 2vw)',
      top: '4%',
      width: 'min(22vw,260px)'
    }
  }), React.createElement("div", {
    className: "wrap"
  }, React.createElement("div", {
    className: "head"
  }, React.createElement("div", {
    "data-fsk": "txt:Text \xB7 fs-story-script \xB7 fs-story-sub"
  }, React.createElement("div", {
    className: "scr"
  }, story.script), React.createElement("h2", null, "The ", React.createElement("i", null, "Herbarium")), React.createElement("div", {
    className: "sub"
  }, story.sub)), React.createElement("div", {
    className: "facts",
    "data-fsk": "txt:Text \xB7 fs-story-facts-0-k / -v \u2026 3"
  }, story.facts.map(f => React.createElement("div", {
    key: f.k
  }, React.createElement("div", {
    className: "k"
  }, f.k), React.createElement("div", {
    className: "v"
  }, f.v))))), React.createElement("div", {
    className: "sk"
  }, React.createElement("i", null, "I."), "Our story"), React.createElement("div", {
    className: "story2"
  }, React.createElement("div", {
    "data-fsk": "txt:Text \xB7 fs-story-paras-0 \u2026 fs-story-paras-5"
  }, story.paras.map((t, i) => React.createElement("p", {
    key: i,
    className: i === 0 ? 'dc' : ''
  }, t))), React.createElement("div", null, React.createElement("div", {
    className: "quote",
    "data-fsk": "txt:Text \xB7 fs-story-quote"
  }, React.createElement(Bot, {
    k: "rosette"
  }), "\u201C", story.quote, "\u201D"), React.createElement("div", {
    className: "ages",
    "data-fsk": "txt:Text \xB7 fs-story-ages-0-n / -d \u2026 2"
  }, story.ages.map((a, i) => React.createElement("div", {
    className: "age",
    key: a.n
  }, React.createElement("i", null, ROMAN[i], "."), React.createElement("b", null, a.n), React.createElement("p", null, a.d)))))), React.createElement(Flor, null), React.createElement("div", {
    className: "sk"
  }, React.createElement("i", null, "II."), "The two doors", React.createElement("em", null, "\xB7 two hours of the same home")), React.createElement("div", {
    className: "doors",
    style: {
      marginTop: 18
    }
  }, homes.map(h => React.createElement("div", {
    className: "door fs-home",
    "data-key": h.key,
    key: h.key,
    "data-fsk": 'txt:Text · fs-homes-' + h.key + '-p / -hours / -d / -href · CSS .fs-home[data-key]'
  }, React.createElement(Ghost, {
    k: "sprig"
  }), React.createElement("div", {
    className: "g"
  }, h.glyph), React.createElement("div", {
    className: "k"
  }, h.k), React.createElement("h3", null, h.n), React.createElement("div", {
    className: "d"
  }, h.d), React.createElement("div", {
    className: "h"
  }, h.glyph, " ", h.hours), React.createElement("p", null, h.p), h.href && React.createElement("a", {
    className: "btn sm",
    href: h.href,
    target: "_blank",
    rel: "noopener"
  }, "Explore the home \u2197")))), React.createElement(Flor, null), React.createElement("div", {
    className: "sk"
  }, React.createElement("i", null, "III."), "The two beginnings"), React.createElement("div", {
    className: "begin",
    style: {
      marginTop: 18
    },
    "data-fsk": "txt:Text \xB7 fs-story-beginnings-0-p / -by \xB7 -1-p / -by"
  }, story.beginnings.map(b => React.createElement("div", {
    key: b.k
  }, React.createElement("div", {
    className: "k"
  }, b.k), React.createElement("p", null, b.p), React.createElement("div", {
    className: "by"
  }, b.by)))), React.createElement(Flor, null), React.createElement("div", {
    className: "sk"
  }, React.createElement("i", null, "IV."), "Specimens", React.createElement("em", null, "\xB7 the garden, year by year")), React.createElement("div", {
    className: "sheets",
    id: "fs-specimens"
  }, journey.map((s, i) => React.createElement("article", {
    className: "sheet2 fs-specimen",
    "data-n": s.n,
    key: s.n,
    "data-fsk": 'img:Image · fs-img-specimen-' + s.n + ' · Text fs-journey-' + s.n + '-t / -p / -where · .fs-specimen[data-n]'
  }, React.createElement("span", {
    className: "tape",
    "aria-hidden": "true"
  }), React.createElement("span", {
    className: "gl",
    "aria-hidden": "true"
  }, s.g), React.createElement(Ghost, {
    k: i % 2 ? 'fern' : 'sprig'
  }), s.img && React.createElement("div", {
    className: "pic",
    style: {
      '--img': `url('${s.img}')`
    }
  }), React.createElement("div", {
    className: "lab"
  }, "Specimen ", s.n, " \xB7 ", s.when), React.createElement("b", null, s.t), React.createElement("p", null, s.p), React.createElement("div", {
    className: "cap"
  }, s.where)))), React.createElement("p", {
    className: "note",
    "data-fsk": "txt:Text \xB7 fs-story-specimensNote"
  }, story.specimensNote)));
}
const TIERS = [['all', 'Everyone'], ['leadership', 'Leadership'], ['staff', 'Staff'], ['fc', 'Members'], ['associate', 'Associates']];
const BEDS = [['leadership', '01', 'Leadership'], ['staff', '02', 'Staff'], ['fc', '03', 'FC Members'], ['associate', '04', 'Associates']];
function bedOf(m) {
  if (m.cat === 'leadership') return 'leadership';
  if (m.cat === 'staff') return 'staff';
  return m.mem === 'associate' ? 'associate' : m.mem === 'fc' ? 'fc' : 'staff';
}
function homesOf(m, long) {
  return m.v.map(v => v === 'athenaeum' ? long ? '☀ the Athenaeum' : '☀ Athenaeum' : long ? '☽ the Solarium' : '☽ Solarium').join(' · ');
}
function atHouse(m) {
  const first = m.n.split(' ')[0];
  const homes = m.v.map(v => v === 'athenaeum' ? 'the Athenaeum' : 'the Solarium');
  const where = homes.length === 2 ? 'both the Athenaeum and the Solarium' : homes[0] || '';
  const role = (m.mrole || m.role).replace(/ · /g, ', ');
  const out = [];
  if (m.cat === 'leadership') out.push(`${first} keeps the house as ${role}${where ? `, across ${where}` : ''}.`);else if (m.cat === 'staff') out.push(`${first} works the floor as ${role}${where ? ` at ${where}` : ''}${m.stn ? `, stationed at ${m.stn}` : ''}.`);else out.push(`${first} is a member of the company — one of the names that keep the garden full.`);
  if (m.spec) out.push(`Their craft: ${m.spec.toLowerCase()}.`);
  if (m.flex) out.push('They are flex staff, and work two or more positions wherever the evening needs them.');
  if (m.mem === 'fc') out.push('They wear the Free Company tag.');else if (m.mem === 'associate') out.push('They keep their own banner, as an Associate of the house.');
  return out.join(' ');
}
function Profile({
  m,
  onClose,
  toast
}) {
  const closeRef = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    closeRef.current && closeRef.current.focus();
    const k = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', k);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      document.documentElement.style.overflow = '';
      prev && prev.focus && prev.focus();
    };
  }, []);
  const tier = bedOf(m);
  const no = String(m.id).padStart(3, '0');
  const tierName = tier === 'leadership' ? 'Leadership' : tier === 'staff' ? 'Staff' : tier === 'fc' ? 'FC Member' : 'Associate';
  return React.createElement("div", {
    className: "lay",
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, React.createElement("div", {
    className: "doss fs-profile",
    "data-id": m.id,
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": 'fs-mname-' + m.id
  }, React.createElement("button", {
    className: "x",
    ref: closeRef,
    "aria-label": "Close the file",
    onClick: onClose
  }, "\u2715"), React.createElement("div", {
    className: "pic",
    "data-fsk": 'img:Image · ID fs-img-roster-' + m.id,
    style: m.img ? {
      '--img': `url('${m.img}')`
    } : undefined
  }, React.createElement("span", {
    className: "fileno"
  }, "File No. ", no, " \xB7 ", tierName), React.createElement("span", {
    className: "vline",
    "aria-hidden": "true"
  }), React.createElement(Bot, {
    k: "sprig",
    className: "sprig"
  }), React.createElement("span", {
    className: "mono",
    "aria-hidden": "true"
  }, m.n[0]), React.createElement("span", {
    className: "cap"
  }, m.v.length ? homesOf(m, true) : 'the garden')), React.createElement("div", {
    className: "bd"
  }, React.createElement("div", {
    className: "hd"
  }, React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, m.mrole || m.role), React.createElement("h3", {
    id: 'fs-mname-' + m.id
  }, m.n), m.e && React.createElement("div", {
    className: "e"
  }, m.e)), React.createElement("div", {
    className: "facts"
  }, React.createElement("span", {
    className: "g"
  }, tierName), (tier === 'leadership' || tier === 'staff') && m.mem === 'fc' && React.createElement("span", null, "FC Member"), (tier === 'leadership' || tier === 'staff') && m.mem === 'associate' && React.createElement("span", null, "Associate"), m.flex && React.createElement("span", {
    className: "c"
  }, "\u2726 flex"), m.tags.map(t => React.createElement("span", {
    key: t
  }, t)))), React.createElement("div", {
    className: "chs",
    "data-fsk": 'txt:Text · fs-roster-' + m.id + '-intro (I) · -bio (II) · -hooks (IV) · -spec · -stn'
  }, React.createElement("div", null, React.createElement("div", {
    className: "ch"
  }, React.createElement("div", {
    className: "cn"
  }, React.createElement("i", null, "I."), "How they came to the house"), m.intro ? React.createElement("p", {
    className: "dc"
  }, m.intro) : React.createElement("p", {
    className: "empty"
  }, "Their arrival has not been written yet. Ask them on the floor; it is usually a good story.")), React.createElement("div", {
    className: "ch"
  }, React.createElement("div", {
    className: "cn"
  }, React.createElement("i", null, "II."), "The story"), m.bio ? React.createElement("p", null, m.bio) : React.createElement("p", {
    className: "empty"
  }, "Still being written."))), React.createElement("div", null, React.createElement("div", {
    className: "ch"
  }, React.createElement("div", {
    className: "cn"
  }, React.createElement("i", null, "III."), "At the house"), React.createElement("p", null, atHouse(m))), React.createElement("div", {
    className: "ch"
  }, React.createElement("div", {
    className: "cn"
  }, React.createElement("i", null, "IV."), "Threads to pull"), m.hooks ? React.createElement("p", null, m.hooks) : React.createElement("p", {
    className: "empty"
  }, "No threads filed yet \u2014 find them on the floor and start one.")))), (m.carrd || m.disc) && React.createElement("div", {
    className: "ext"
  }, m.carrd && React.createElement("a", {
    href: 'https://' + m.carrd.replace(/^https?:\/\//, ''),
    target: "_blank",
    rel: "noopener"
  }, "\u2740 carrd \u2197"), m.disc && React.createElement("button", {
    type: "button",
    onClick: () => copyText(m.disc, toast),
    title: "Copy the Discord handle"
  }, "discord \xB7 ", m.disc)))));
}
function Beds({
  roster,
  badges,
  beds,
  toast,
  tomes
}) {
  const [tier, setTier] = useState('all');
  const [badge, setBadge] = useState('');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const pn = pageNo('#fs-beds');
  const list = useMemo(() => roster.filter(m => (tier === 'all' || bedOf(m) === tier || tier === 'fc' && m.mem === 'fc' || tier === 'associate' && m.mem === 'associate') && (!badge || m.tags.includes(badge)) && (!q || (m.n + ' ' + m.role + ' ' + (m.spec || '')).toLowerCase().includes(q.toLowerCase()))), [roster, tier, badge, q]);
  const grouped = BEDS.map(b => [b, list.filter(m => bedOf(m) === b[0])]).filter(x => x[1].length);
  return React.createElement("section", {
    className: "page beds",
    id: "fs-beds",
    "data-fsk": secKey('beds')
  }, React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, pn.r), " \xB7 The Garden Beds"),
    tr: 'page. ' + pn.n,
    bl: React.createElement(React.Fragment, null, React.createElement("b", null, roster.length), " names in the garden"),
    br: "\u2726 flex \xB7 two or more positions"
  }), React.createElement(Tome, {
    id: "#fs-beds",
    tomes: tomes
  }), React.createElement("div", {
    className: "pgnum l b",
    "aria-hidden": "true"
  }, pn.n), React.createElement("div", {
    className: "hrule",
    style: {
      left: 0,
      top: '12%',
      width: 'min(30vw,260px)'
    },
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "wrap"
  }, React.createElement("div", {
    className: "intro"
  }, React.createElement("figure", {
    className: "plate2",
    id: "fs-beds-plate",
    "data-fsk": "img:Image \xB7 ID fs-img-beds \xB7 caption Text fs-beds-caption",
    style: beds.img ? {
      '--img': `url('${beds.img}')`
    } : undefined
  }, React.createElement("span", {
    className: "mono",
    "aria-hidden": "true"
  }, "F"), React.createElement("figcaption", {
    className: "cap"
  }, beds.caption)), React.createElement("div", null, React.createElement("div", {
    className: "scr",
    "data-fsk": "txt:Text \xB7 fs-beds-script"
  }, beds.script), React.createElement("h2", null, "The ", React.createElement("i", null, "Garden"), " Beds"), React.createElement("p", {
    className: "body",
    "data-fsk": "txt:Text \xB7 fs-beds-lead"
  }, beds.lead), React.createElement("ul", {
    className: "roles",
    "data-fsk": "txt:Text \xB7 fs-beds-roles-0-k / -v \u2026 7"
  }, beds.roles.map(r => React.createElement("li", {
    key: r.k
  }, React.createElement("b", null, r.k), " ", r.v))), React.createElement("p", {
    className: "choose",
    "data-fsk": "txt:Text \xB7 fs-beds-choose"
  }, beds.choose))), React.createElement("div", {
    className: "ctrl"
  }, React.createElement("div", {
    className: "tiers",
    role: "tablist"
  }, TIERS.map(t => React.createElement("button", {
    key: t[0],
    role: "tab",
    "aria-selected": tier === t[0],
    className: tier === t[0] ? 'on' : '',
    onClick: () => setTier(t[0])
  }, t[1]))), React.createElement("div", {
    className: "badges"
  }, badges.map(b => React.createElement("button", {
    key: b,
    "aria-pressed": badge === b,
    className: badge === b ? 'on' : '',
    onClick: () => setBadge(badge === b ? '' : b)
  }, b))), React.createElement("input", {
    id: "fs-search",
    type: "search",
    placeholder: "search a name\u2026",
    value: q,
    onChange: e => setQ(e.target.value),
    "aria-label": "Search the roster"
  })), grouped.length === 0 && React.createElement("div", {
    className: "empty"
  }, "\u2740 No one has claimed that corner of the garden yet", badge ? ' — badges are set per person in the data' : '', "."), grouped.map(([b, ms]) => React.createElement("div", {
    className: "bed",
    key: b[0],
    id: 'fs-bed-' + b[0]
  }, React.createElement("div", {
    className: "bh"
  }, React.createElement("span", null, b[2]), React.createElement("i", null, "\xB7 ", ms.length)), React.createElement("div", {
    className: 'ppl' + (b[0] === 'leadership' ? ' wide' : '')
  }, ms.map(m => React.createElement("button", {
    key: m.id,
    className: "person fs-member",
    "data-id": m.id,
    "data-fsk": 'img:Image · fs-img-roster-' + m.id + ' · Text fs-roster-' + m.id + '-intro / -bio / -hooks / -disc / -carrd · .fs-member[data-id]',
    onClick: () => setSel(m),
    "aria-label": 'Read ' + m.n + '’s dossier'
  }, m.img && React.createElement("span", {
    className: "pic",
    style: {
      '--img': `url('${m.img}')`
    },
    "aria-hidden": "true"
  }), React.createElement("span", {
    className: "n"
  }, m.n), React.createElement("span", {
    className: "r"
  }, m.role, m.flex && React.createElement("span", {
    className: "fx",
    title: "Flex \u2014 works two or more positions"
  }, "\u2726")), React.createElement("span", {
    className: "view"
  }, "read the dossier"))))))), sel && React.createElement(Profile, {
    m: sel,
    onClose: () => setSel(null),
    toast: toast
  }));
}
function Door({
  rules,
  brakes,
  tomes
}) {
  const [i, setI] = useState(0);
  const a = rules[i];
  const pn = pageNo('#fs-door');
  const half = Math.ceil(a.clauses.length / 2);
  return React.createElement("section", {
    className: "page door",
    id: "fs-door",
    "data-fsk": secKey('door')
  }, React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, pn.r), " \xB7 By the Door"),
    tr: 'page. ' + pn.n,
    bl: "an out-of-character code of conduct",
    br: React.createElement(React.Fragment, null, "article ", React.createElement("b", null, a.n), " of IX")
  }), React.createElement(Tome, {
    id: "#fs-door",
    tomes: tomes
  }), React.createElement("div", {
    className: "pgnum",
    "aria-hidden": "true"
  }, pn.n), React.createElement("div", {
    className: "vrule",
    style: {
      left: 'calc(var(--gut) + 6px)',
      top: '20%',
      height: '56%'
    },
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "wrap"
  }, React.createElement("div", {
    className: "plateline",
    "data-fsk": "css:.fs-article[data-n] \xB7 Text fs-rules-<numeral>-title / -sub / -lead \xB7 clauses fs-rules-<numeral>-clauses-<n>-text"
  }, React.createElement("div", {
    className: "orn",
    "aria-hidden": "true"
  }, "\u2767 \u2726 \u2767"), React.createElement("div", {
    className: "arts",
    role: "tablist"
  }, rules.map((r, k) => React.createElement("button", {
    key: r.n,
    role: "tab",
    "aria-selected": k === i,
    className: k === i ? 'on' : '',
    onClick: () => setI(k)
  }, r.n)))), React.createElement("article", {
    className: "book fs-article",
    "data-n": a.n,
    key: a.n
  }, React.createElement("div", {
    className: "at"
  }, React.createElement("small", null, "Article ", a.n, "."), a.title, "."), React.createElement("div", {
    className: "found"
  }, "found among the papers of the house \xB7 ", a.sub), React.createElement("p", {
    className: "epi"
  }, "\u201C", a.lead, "\u201D", React.createElement("small", null, "the floor, not the ceiling.")), React.createElement("div", {
    className: "cols"
  }, React.createElement("div", null, a.clauses.slice(0, half).map((c, k) => React.createElement("div", {
    className: 'cl' + (k === 0 ? ' first' : ''),
    key: c.n
  }, React.createElement("i", null, c.n), React.createElement("span", {
    className: k === 0 ? 'lead-drop' : ''
  }, c.lead && React.createElement("b", null, c.lead, " "), c.text)))), React.createElement("div", null, a.clauses.slice(half).map(c => React.createElement("div", {
    className: "cl",
    key: c.n
  }, React.createElement("i", null, c.n), React.createElement("span", null, c.lead && React.createElement("b", null, c.lead, " "), c.text))))), a.note && React.createElement("div", {
    className: "note"
  }, React.createElement("b", null, "\u2740 ", a.note.k), a.note.p), React.createElement("div", {
    className: "pn"
  }, React.createElement("button", {
    disabled: i === 0,
    onClick: () => setI(i - 1)
  }, "\u2039 previous article"), React.createElement("span", null, a.n, " / IX"), React.createElement("button", {
    disabled: i === rules.length - 1,
    onClick: () => setI(i + 1)
  }, "next article \u203A"))), React.createElement("div", {
    className: "rated",
    id: "fs-brakes",
    role: "note",
    "data-fsk": "txt:Text \xB7 fs-brakes-k \xB7 -word \xB7 -p \xB7 fs-brakes-lines-0 \u2026 2 \xB7 CSS #fs-brakes"
  }, React.createElement("div", {
    className: "r",
    "aria-hidden": "true"
  }, "B"), React.createElement("div", {
    className: "t"
  }, React.createElement("b", null, "Brakes \xB7 all fiction stops"), React.createElement("i", null, brakes.k, " \xB7 say it anywhere, any time"), React.createElement("p", null, brakes.p), React.createElement("ul", null, brakes.lines.map((l, k) => React.createElement("li", {
    key: k
  }, l)))))));
}
function Secrets({
  ledger,
  tomes
}) {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const go = useCallback(d => setI(k => (k + d + ledger.length) % ledger.length), [ledger.length]);
  useEffect(() => {
    let visible = false;
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
      es.forEach(e => {
        visible = e.isIntersecting;
      });
    }, {
      threshold: .35
    }) : null;
    if (io && ref.current) io.observe(ref.current);
    const k = e => {
      const t = e.target;
      if (t && /INPUT|TEXTAREA|SELECT/.test(t.tagName)) return;
      const inside = ref.current && ref.current.contains(document.activeElement);
      if (!visible && !inside) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener('keydown', k);
    return () => {
      window.removeEventListener('keydown', k);
      io && io.disconnect();
    };
  }, [go]);
  const f = ledger[i];
  const glyphs = ['❀', '☽', '✦', '❧', '✺', '✧'];
  return React.createElement("section", {
    className: "page sec",
    id: "fs-secrets",
    "data-fsk": secKey('secrets')
  }, React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, pageNo('#fs-secrets').r), " \xB7 Open Secrets"),
    tr: 'page. ' + pageNo('#fs-secrets').n,
    bl: React.createElement(React.Fragment, null, "file ", React.createElement("b", null, f.no), " \xB7 ", f.where),
    br: "the archive ledger"
  }), React.createElement(Tome, {
    id: "#fs-secrets",
    tomes: tomes
  }), React.createElement("div", {
    className: "pgnum l",
    "aria-hidden": "true"
  }, pageNo('#fs-secrets').n), React.createElement("div", {
    className: "ghost-glyph",
    style: {
      right: '-4vw',
      bottom: '-10vh'
    },
    "aria-hidden": "true"
  }, "\u2740"), React.createElement("div", {
    className: "wrap"
  }, React.createElement("div", {
    className: "head"
  }, React.createElement("span", {
    className: "eyebrow"
  }, "Open Secrets"), React.createElement("h2", null, "the house\u2019s ", React.createElement("i", null, "worst-kept"), " secrets")), React.createElement("div", {
    className: "ledger",
    ref: ref,
    tabIndex: 0,
    "aria-label": "The archive ledger \u2014 use the arrow keys to leaf through",
    "aria-live": "polite"
  }, React.createElement("div", {
    className: "tarot fs-file",
    "data-id": f.id,
    key: f.id
  }, React.createElement("div", {
    className: "tcard img",
    "data-fsk": 'img:Image · fs-img-file-' + f.id + ' · CSS .fs-file[data-id]',
    style: f.img ? {
      '--img': `url('${f.img}')`
    } : undefined
  }, React.createElement("span", {
    className: "cs tl"
  }, "\u2726"), React.createElement("span", {
    className: "cs tr"
  }, "\u2726"), React.createElement("span", {
    className: "cs bl"
  }, "\u2726"), React.createElement("span", {
    className: "cs br"
  }, "\u2726"), React.createElement("div", {
    className: "dia"
  }, React.createElement("span", null, i + 1)), React.createElement("div", {
    className: "orb",
    "aria-hidden": "true"
  }, glyphs[i % glyphs.length]), React.createElement("span", {
    className: "seal",
    "aria-label": 'Status: ' + f.status
  }, f.status), React.createElement("div", null, React.createElement("div", {
    className: "vline",
    style: {
      margin: '0 auto 8px'
    }
  }), React.createElement("div", {
    className: "star",
    "aria-hidden": "true"
  }, "\u273A"))), React.createElement("div", {
    className: "tcard txt",
    "data-fsk": 'txt:Text · fs-ledger-' + f.id + '-name / -desig / -summary / -pull / -add · status -status'
  }, React.createElement("div", {
    className: "hd"
  }, React.createElement("span", null, "Florette"), React.createElement("b", null, f.no, "/", String(ledger.length).padStart(3, '0')), React.createElement("span", null, f.where)), React.createElement("div", {
    className: "stars",
    "aria-hidden": "true"
  }, "\u2736 \u2736 \u2736 \u2736"), React.createElement("div", {
    className: "two"
  }, React.createElement("div", null, "every house has its open secrets. ours are less secret than they are invitations."), React.createElement("div", null, "a running joke, grown into a corner of the story. pull it, or add to it.")), React.createElement("div", {
    className: "emb",
    "aria-hidden": "true"
  }, "\u273A"), React.createElement("div", {
    className: "name"
  }, f.name), React.createElement("div", {
    className: "desig"
  }, f.desig), React.createElement("div", {
    className: "sum"
  }, f.summary), React.createElement("div", {
    className: "threads"
  }, React.createElement("div", {
    className: "th pull"
  }, React.createElement("span", {
    className: "k"
  }, "\u2726 Pull the thread"), f.pull), React.createElement("div", {
    className: "th add"
  }, React.createElement("span", {
    className: "k"
  }, "\u2767 Add to the story"), f.add)), React.createElement("div", {
    className: "tags"
  }, f.tags.map(t => React.createElement("span", {
    key: t
  }, t))), React.createElement("div", {
    className: "meters"
  }, Object.entries(f.meters).map(([k, v]) => React.createElement("div", {
    className: "meter",
    key: k
  }, React.createElement("div", {
    className: "k"
  }, k), React.createElement(Stars, {
    n: v
  })))), React.createElement("div", {
    className: "bar",
    "aria-hidden": "true"
  }))), React.createElement("div", {
    className: "lnav"
  }, React.createElement("button", {
    className: "arrow",
    "aria-label": "Previous file",
    onClick: () => go(-1)
  }, "\u2039"), React.createElement("div", null, React.createElement("div", {
    className: "dots"
  }, ledger.map((x, k) => React.createElement("button", {
    key: x.id,
    className: k === i ? 'on' : '',
    "aria-label": 'File ' + (k + 1) + ': ' + x.name,
    onClick: () => setI(k)
  }))), React.createElement("div", {
    className: "pg"
  }, "file ", i + 1, " of ", ledger.length)), React.createElement("button", {
    className: "arrow",
    "aria-label": "Next file",
    onClick: () => go(1)
  }, "\u203A")), React.createElement("div", {
    className: "keyhint"
  }, "leaf with ", React.createElement("kbd", null, "\u2190"), " ", React.createElement("kbd", null, "\u2192"), ", the dots, or the arrows"))));
}
function PartnerCard({
  p,
  i
}) {
  return React.createElement("article", {
    className: "ccard fs-partner",
    "data-id": p.id,
    "data-fsk": 'img:Image · fs-img-partner-' + p.id + ' · Text fs-partners-items-' + p.id + '-blurb / -hours / -type / -where / -carrd / -discord · .fs-partner[data-id]'
  }, React.createElement(Bot, {
    k: "sprig",
    className: "sprig"
  }), p.img ? React.createElement("span", {
    className: "emb",
    style: {
      '--img': `url('${p.img}')`
    },
    "aria-hidden": "true"
  }) : React.createElement("span", {
    className: "no",
    "aria-hidden": "true"
  }, String(i + 1).padStart(2, '0')), React.createElement("div", {
    className: "bd"
  }, React.createElement("h3", null, p.name), React.createElement("div", {
    className: "k"
  }, p.type), React.createElement("div", {
    className: "w"
  }, p.where), React.createElement("div", {
    className: "h"
  }, p.hours), React.createElement("p", null, p.blurb), React.createElement("div", {
    className: "l"
  }, p.carrd && React.createElement("a", {
    href: p.carrd,
    target: "_blank",
    rel: "noopener"
  }, "\u2740 carrd \u2197"), p.discord && React.createElement("a", {
    href: p.discord,
    target: "_blank",
    rel: "noopener"
  }, "discord \u2197"), !p.carrd && !p.discord && React.createElement("span", {
    className: "soon"
  }, "links coming soon"))), React.createElement("span", {
    className: 'seal' + (p.rating === '18+' ? ' n' : ''),
    title: p.rating === '18+' ? '18+ behind its own doors' : 'Safe for work throughout'
  }, p.rating));
}
function Partners({
  partners,
  site,
  tomes
}) {
  const who = partners.become.who || '';
  const pn = pageNo('#fs-partners');
  const parts = who ? partners.become.p.split(who) : [partners.become.p];
  return React.createElement("section", {
    className: "page tray",
    id: "fs-partners",
    "data-fsk": secKey('partners')
  }, React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, pn.r), " \xB7 The Hall Tray"),
    tr: 'page. ' + pn.n,
    bl: React.createElement(React.Fragment, null, React.createElement("b", null, partners.items.length), " cards on the tray"),
    br: "good company keeps good company"
  }), React.createElement(Tome, {
    id: "#fs-partners",
    tomes: tomes
  }), React.createElement("div", {
    className: "pgnum",
    "aria-hidden": "true"
  }, pn.n), React.createElement("div", {
    className: "vrule dia",
    style: {
      left: 'calc(var(--gut) + 6px)',
      top: '20%',
      height: '36%'
    },
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "wrap"
  }, React.createElement("div", {
    className: "head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow"
  }, partners.eyebrow), React.createElement("h2", null, "Partners ", React.createElement("i", null, "&"), React.createElement("br", null), "Affiliates"), React.createElement("p", {
    className: "body",
    "data-fsk": "txt:Text \xB7 fs-partners-lead (eyebrow: fs-partners-eyebrow)"
  }, partners.lead)), React.createElement("div", null, React.createElement("p", {
    className: "rule",
    style: {
      margin: 0
    },
    "data-fsk": "txt:Text \xB7 fs-partners-rule-0-k / -v \u2026 2"
  }, partners.rule.map((r, i) => React.createElement("span", {
    key: i
  }, React.createElement("b", null, r.k), " ", r.v, " "))), React.createElement("div", {
    className: "key"
  }, React.createElement("span", null, React.createElement("i", {
    "aria-hidden": "true"
  }), "SFW throughout"), React.createElement("span", null, React.createElement("i", {
    className: "n",
    "aria-hidden": "true"
  }), "18+ behind its own doors \xB7 public space SFW")))), React.createElement("div", {
    className: "cards",
    id: "fs-cards"
  }, partners.items.map((p, i) => React.createElement(PartnerCard, {
    p: p,
    i: i,
    key: p.id
  }))), React.createElement("div", {
    className: "become",
    id: "fs-become",
    "data-fsk": "txt:Text \xB7 fs-partners-become-k / -p / -who \xB7 CSS #fs-become"
  }, React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, partners.become.k), React.createElement("p", null, parts[0], who && React.createElement("b", null, who), parts[1])), React.createElement("a", {
    className: "btn",
    href: site.discord,
    target: "_blank",
    rel: "noopener"
  }, "Leave a card \u2197"))));
}
function Letter({
  letter,
  site,
  toast,
  tomes
}) {
  const [k, setK] = useState(letter.tabs[0].key);
  const pn = pageNo('#fs-letter');
  const tab = letter.tabs.find(t => t.key === k) || letter.tabs[0];
  const hi = new Set(tab.contacts);
  return React.createElement("section", {
    className: "page let",
    id: "fs-letter",
    "data-fsk": secKey('letter')
  }, React.createElement(Marg, {
    tl: React.createElement(React.Fragment, null, "Tome ", React.createElement("b", null, pn.r), " \xB7 The Letter on the Desk"),
    tr: 'page. ' + pn.n,
    bl: "\xA9 this letter belongs to the house",
    br: "write back on Discord"
  }), React.createElement(Tome, {
    id: "#fs-letter",
    tomes: tomes
  }), React.createElement("div", {
    className: "pgnum",
    "aria-hidden": "true"
  }, pn.n), React.createElement("div", {
    className: "vrule",
    style: {
      right: 'calc(var(--gutr) + 6px)',
      top: '22%',
      height: '40%'
    },
    "aria-hidden": "true"
  }), React.createElement("div", {
    className: "wrap"
  }, React.createElement("div", {
    className: "credit"
  }, "This letter belongs to the Florette; one should take a seat if necessary."), React.createElement("h2", null, React.createElement("span", {
    className: "scr",
    "aria-hidden": "true"
  }, "L"), React.createElement("span", {
    className: "ul2"
  }, "etter"), React.createElement("span", {
    className: "num"
  }, "\xA9 ", pn.r)), React.createElement("div", {
    className: "sheet",
    id: "fs-letter-sheet"
  }, React.createElement("span", {
    className: "corner tl"
  }, "A. Laon, keeper."), React.createElement("span", {
    className: "corner tr"
  }, "unfold whichever corner suits you"), React.createElement("div", {
    className: "to",
    "data-fsk": "txt:Text \xB7 fs-letter-to"
  }, letter.to), React.createElement("p", {
    "data-fsk": "txt:Text \xB7 fs-letter-open"
  }, letter.open), React.createElement("p", {
    "data-fsk": "txt:Text \xB7 fs-letter-pen"
  }, letter.pen), React.createElement("div", {
    className: "folds",
    role: "tablist",
    "data-fsk": "css:.fs-tab[data-key] \xB7 Text fs-letter-tabs-visitor-headline / -body / -perks-0 / -expect-0 / -cta (also member \xB7 associate \xB7 staff)"
  }, letter.tabs.map(t => React.createElement("button", {
    key: t.key,
    role: "tab",
    "aria-selected": k === t.key,
    className: 'fold fs-tab' + (k === t.key ? ' on' : ''),
    "data-key": t.key,
    onClick: () => setK(t.key)
  }, t.label))), React.createElement("div", {
    className: "foldp",
    key: tab.key
  }, React.createElement("h4", null, tab.headline), React.createElement("p", null, tab.body), React.createElement("div", {
    className: "cols"
  }, React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "What you get"), React.createElement("ul", null, tab.perks.map((p, i) => React.createElement("li", {
    key: i
  }, p)))), React.createElement("div", null, React.createElement("div", {
    className: "k"
  }, "What we ask"), React.createElement("ul", null, tab.expect.map((p, i) => React.createElement("li", {
    key: i
  }, p)))))), React.createElement("div", {
    className: "sigrow"
  }, React.createElement("div", {
    className: "sig",
    "data-fsk": "txt:Text \xB7 fs-letter-sign"
  }, letter.sign.replace('— ', '')), React.createElement("span", {
    className: "wax",
    title: "sealed by the house",
    "aria-hidden": "true"
  }, React.createElement(Bot, {
    k: "rosette"
  }))), React.createElement("div", {
    className: "ps",
    "data-fsk": "txt:Text \xB7 fs-letter-ps"
  }, letter.ps), React.createElement("a", {
    className: "btn",
    href: site.discord,
    target: "_blank",
    rel: "noopener"
  }, tab.cta, " \u2197")), React.createElement("div", {
    className: "marg2"
  }, React.createElement("span", null, React.createElement("span", {
    className: "circ"
  }, pn.r)), React.createElement("span", null, "( the house \xB7 ", React.createElement("i", null, "familya."), " )"), React.createElement("span", null, letter.contacts.length, " who hold the pen")), React.createElement("div", {
    className: "pens",
    id: "fs-contacts"
  }, React.createElement("div", {
    className: "k micro"
  }, "who holds the pen"), React.createElement("div", {
    className: "list",
    "data-fsk": "txt:Text \xB7 fs-letter-contacts-aurore-d (-n \xB7 -r) \xB7 saya \xB7 morgan \xB7 leiha \xB7 smaug \xB7 rita \xB7 CSS .fs-contact[data-key]"
  }, letter.contacts.map(c => React.createElement("div", {
    key: c.key,
    className: 'pen fs-contact' + (hi.size ? hi.has(c.key) ? ' hi' : ' off' : ''),
    "data-key": c.key
  }, React.createElement("span", {
    className: "n"
  }, c.n), React.createElement("span", {
    className: "r"
  }, c.r), React.createElement("button", {
    className: "d",
    onClick: () => copyText(c.d, toast),
    title: "Copy the Discord handle"
  }, c.d)))), React.createElement("p", {
    className: "keyhint"
  }, hi.size ? 'the lit names are the ones to write to for this corner.' : 'visitors need write to no one — just come by.'))));
}
function Page({
  k,
  data,
  cur,
  toast
}) {
  const d = data;
  switch (k) {
    case 'foyer':
      return React.createElement(Foyer, {
        hero: d.hero,
        site: d.site,
        directory: d.directory,
        tomes: d.tomes,
        cur: cur
      });
    case 'herbarium':
      return React.createElement(Herbarium, {
        story: d.story,
        journey: d.journey,
        homes: d.homes,
        tomes: d.tomes
      });
    case 'almanac':
      return React.createElement(Almanac, {
        rhythm: d.rhythm,
        events: d.events,
        traditions: d.traditions,
        tomes: d.tomes
      });
    case 'beds':
      return React.createElement(Beds, {
        roster: d.roster,
        badges: d.badges,
        beds: d.beds,
        toast: toast,
        tomes: d.tomes
      });
    case 'door':
      return React.createElement(Door, {
        rules: d.rules,
        brakes: d.brakes,
        tomes: d.tomes
      });
    case 'secrets':
      return React.createElement(Secrets, {
        ledger: d.ledger,
        tomes: d.tomes
      });
    case 'partners':
      return React.createElement(Partners, {
        partners: d.partners,
        site: d.site,
        tomes: d.tomes
      });
    case 'letter':
      return React.createElement(Letter, {
        letter: d.letter,
        site: d.site,
        toast: toast,
        tomes: d.tomes
      });
    default:
      return null;
  }
}
const Foot = ({
  footer
}) => React.createElement("footer", {
  className: "ft",
  id: "fs-foot",
  "data-fsk": "txt:Text \xB7 fs-footer-line \xB7 fs-footer-small \xB7 fs-footer-colophon \xB7 CSS #fs-foot"
}, React.createElement("div", {
  className: "wrap"
}, React.createElement("div", {
  className: "word"
}, "Florette"), React.createElement("small", null, "\u201C", footer.line, "\u201D"), React.createElement("small", null, footer.small), footer.colophon && React.createElement("span", {
  className: "colo"
}, React.createElement(Bot, {
  k: "rosette"
}), footer.colophon, React.createElement(Bot, {
  k: "rosette"
}))));
function App() {
  const data = useMemo(resolveData, []);
  const route = useRoute();
  const ev = route ? data.events.find(e => e.id === route) : null;
  const [mode, toggle] = useMode();
  const [, toast] = useToast();
  const cur = useCurrentPage(!!ev);
  useEffect(() => {
    if (ev) return;
    const h = location.hash;
    if (h && /^#fs-[\w-]+$/.test(h)) {
      const el = document.querySelector(h);
      if (el) requestAnimationFrame(() => el.scrollIntoView());
    }
  }, [ev]);
  return React.createElement(React.Fragment, null, React.createElement(Chrome, {
    site: data.site,
    mode: mode,
    toggle: toggle,
    cur: ev ? '#fs-almanac' : cur
  }), ev ? React.createElement("main", null, React.createElement(Evening, {
    e: ev,
    events: data.events,
    partners: data.partners,
    site: data.site
  })) : React.createElement("main", null, PAGES.map(p => React.createElement(Page, {
    key: p[3],
    k: p[3],
    data: data,
    cur: cur,
    toast: toast
  }))), React.createElement(Foot, {
    footer: data.footer
  }));
}
function MountPage({
  page,
  data
}) {
  const route = useRoute();
  const ev = page === 'almanac' && route ? data.events.find(e => e.id === route) : null;
  const [mode, toggle] = useMode();
  const [, toast] = useToast();
  const cur = useCurrentPage(!!ev);
  if (page === 'nav') return React.createElement(Chrome, {
    site: data.site,
    mode: mode,
    toggle: toggle,
    cur: cur
  });
  if (page === 'foot') return React.createElement(Foot, {
    footer: data.footer
  });
  if (ev) return React.createElement(React.Fragment, null, React.createElement(Sprite, null), React.createElement(Evening, {
    e: ev,
    events: data.events,
    partners: data.partners,
    site: data.site
  }));
  const last = page === 'letter' && !document.querySelector('.fs-mount[data-page="foot"]');
  return React.createElement(React.Fragment, null, React.createElement(Sprite, null), React.createElement(Page, {
    k: page,
    data: data,
    cur: cur,
    toast: toast
  }), last && React.createElement(Foot, {
    footer: data.footer
  }));
}
(function boot() {
  let mounts = Array.from(document.querySelectorAll('.fs-mount'));
  if (!mounts.length) {
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));
    return;
  }
  if (!mounts.some(m => m.dataset.page === 'nav')) {
    const n = document.createElement('div');
    n.className = 'fs-mount fs-navroot';
    n.dataset.page = 'nav';
    document.body.prepend(n);
    mounts = [n].concat(mounts);
  }
  window.FS_HREFS = window.FS_HREFS || {};
  mounts.forEach(m => {
    if (m.dataset.href) window.FS_HREFS[m.dataset.page] = m.dataset.href;
  });
  const data = resolveData();
  mounts.forEach(m => ReactDOM.createRoot(m).render(React.createElement(MountPage, {
    page: m.dataset.page,
    data: data
  })));
})();
