(function () {
    const { useState, useRef, useEffect, createElement } = React;
    const html = htm.bind(createElement);
    const L = window.lucideReact || {};
    const Ic = ({ name, size = 18, color }) => L[name] ? createElement(L[name], { size, color }) : null;

    // Your logo lives at surepass.png (next to index.html)
    const DEFAULT_LOGO = 'surepass.png';
    const CARD_FONT = 'Poppins,Inter,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';

    const THEMES = [
        { name: 'Crimson Red', c: '#B91C1C', light: '#F87171', soft: '#FEE2E2' },
        { name: 'Deep Navy', c: '#1E3A8A', light: '#60A5FA', soft: '#DBEAFE' },
        { name: 'Emerald Green', c: '#047857', light: '#34D399', soft: '#D1FAE5' },
        { name: 'Royal Purple', c: '#6D28D9', light: '#A78BFA', soft: '#EDE9FE' },
        { name: 'Ocean Teal', c: '#0F766E', light: '#2DD4BF', soft: '#CCFBF1' },
        { name: 'Sunset Orange', c: '#EA580C', light: '#FB923C', soft: '#FFEDD5' },
        { name: 'Magenta Rose', c: '#BE185D', light: '#F472B6', soft: '#FCE7F3' },
        { name: 'Electric Indigo', c: '#4338CA', light: '#818CF8', soft: '#E0E7FF' },
        { name: 'Sky Blue', c: '#0284C7', light: '#38BDF8', soft: '#E0F2FE' },
        { name: 'Golden Amber', c: '#B45309', light: '#FBBF24', soft: '#FEF3C7' },
        { name: 'Midnight Black', c: '#111827', light: '#6B7280', soft: '#E5E7EB' }
    ];

    const SAMPLE = {
        appTitle: 'SurePass: CBT Practice for 100 Level Students',
        course: 'PHY 101',
        topic: 'Work',
        question: 'A 25 N force acts opposite to the motion of an object that travels 4 m. The work done by the force is?',
        opts: ['-100 J', '100 J', '-21 J', '21 J']
    };

    function Field({ label, children }) {
        return html`<div><label class="lbl">${label}</label>${children}</div>`;
    }

    function Logo({ src }) {
        const [failed, setFailed] = useState(false);
        useEffect(() => setFailed(false), [src]);
        const NAVY = '#0f2a5c';
        return html`
    <div class="sp-logo">
      ${!failed
                ? html`<img src=${src} onError=${() => setFailed(true)} />`
                : html`<${Ic} name="GraduationCap" size=${68} color=${NAVY} /><div style=${{ marginTop: -8 }}><${Ic} name="ShieldCheck" size=${68} color=${NAVY} /></div>`}
    </div>`;
    }

    // Course-code text is drawn on a small canvas and shown as an image,
    // so it is perfectly centred in the pill in the preview AND the downloaded PNG.
    function PillLabel({ text }) {
        const [img, setImg] = useState(null);
        useEffect(() => {
            let alive = true;
            const draw = () => {
                const font = '700 30px ' + CARD_FONT;
                const H = 44, S = 2;
                const c = document.createElement('canvas');
                const g = c.getContext('2d');
                g.font = font;
                const w = Math.ceil(g.measureText(text).width) + 4;
                c.width = w * S; c.height = H * S;
                g.scale(S, S);
                g.font = font;
                g.fillStyle = '#ffffff';
                g.textAlign = 'center';
                g.textBaseline = 'alphabetic';
                const cap = g.measureText('H').actualBoundingBoxAscent || 22;
                g.fillText(text, w / 2, H / 2 + cap / 2);
                if (alive) setImg({ src: c.toDataURL('image/png'), w, H });
            };
            draw();
            if (document.fonts && document.fonts.load) document.fonts.load('700 30px Poppins').then(draw).catch(() => { });
            return () => { alive = false; };
        }, [text]);
        return img ? html`<img src=${img.src} width=${img.w} height=${img.H} />` : null;
    }

    function Card({ d, theme, logo }) {
        const ql = d.question.length;
        const qs = ql > 320 ? 34 : ql > 220 ? 38 : ql > 140 ? 44 : 48;
        const ol = Math.max(...d.opts.map(x => x.length), 0);
        const os = ol > 90 ? 34 : ol > 55 ? 40 : 46;
        const vars = { '--accent': theme.c, '--accent-0': theme.c + '00', '--qs': qs + 'px', '--os': os + 'px' };

        return html`
    <div id="card" class="sp-card" style=${vars}>
      <div class="sp-main">
        <div class="sp-head">
          <${Logo} src=${logo || DEFAULT_LOGO} />
          <div class="sp-title">${d.appTitle}</div>
          <div class="sp-pill"><${PillLabel} text=${'COURSE CODE: ' + (d.course || '').toUpperCase()} /></div>
          ${d.topic ? html`<div class="sp-topic">Topic: ${d.topic}</div>` : null}
          <div class="sp-rule sp-rule-sm"></div>
        </div>

        <div class="sp-qotd">
          <div class="sp-qotd-title">QUESTION OF THE DAY</div>
          <div class="sp-rule sp-rule-lg"></div>
        </div>

        <div class="sp-question">${d.question}</div>

        <div class="sp-opts">
          ${d.opts.map((t, i) => html`
            <div key=${i} class="sp-opt">
              <div class="sp-opt-l">${'ABCD'[i]}.</div>
              <div class="sp-opt-t">${t || '—'}</div>
            </div>`)}
        </div>
      </div>

      <div class="sp-foot">
        <div>Drop your answer in the comments! 👇</div>
        <div>Download SurePass: Study & CBT</div>
        <div>and practice more</div>
      </div>
    </div>`;
    }

    function App() {
        const [d, setD] = useState({ ...SAMPLE, opts: [...SAMPLE.opts] });
        const [theme, setTheme] = useState(THEMES[0]);
        const [logo, setLogo] = useState(null);
        const [msg, setMsg] = useState(null);
        const [scale, setScale] = useState(0.35);
        const [exporting, setExporting] = useState(false);
        const wrapRef = useRef(null);

        useEffect(() => {
            const fit = () => { if (wrapRef.current) setScale(wrapRef.current.clientWidth / 1080); };
            fit();
            const ro = new ResizeObserver(fit);
            if (wrapRef.current) ro.observe(wrapRef.current);
            return () => ro.disconnect();
        }, []);

        const set = (k, v) => setD(p => ({ ...p, [k]: v }));
        const setOpt = (i, v) => setD(p => ({ ...p, opts: p.opts.map((o, j) => j === i ? v : o) }));

        function onLogo(file) {
            if (!file) return;
            const r = new FileReader();
            r.onload = () => setLogo(r.result);
            r.readAsDataURL(file);
        }

        async function download() {
            setExporting(true); setMsg(null);
            try {
                if (document.fonts && document.fonts.ready) await document.fonts.ready;
                const el = document.getElementById('card');
                const canvas = await html2canvas(el, {
                    scale: 1, width: 1080, height: 1920, backgroundColor: '#ffffff', useCORS: true, logging: false,
                    onclone: (doc) => {
                        const w = doc.getElementById('card-wrap'); const s = doc.getElementById('card-scale');
                        w.style.width = '1080px'; w.style.height = '1920px'; w.style.overflow = 'visible'; w.style.borderRadius = '0'; w.style.boxShadow = 'none';
                        s.style.transform = 'none';
                    }
                });
                const name = 'surepass-qotd-' + (d.course || 'card').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png';
                const a = document.createElement('a');
                a.href = canvas.toDataURL('image/png'); a.download = name;
                document.body.appendChild(a); a.click(); a.remove();
                setMsg({ t: 'ok', s: 'PNG exported at 1080 × 1920.' });
            } catch (e) {
                setMsg({ t: 'err', s: 'Export failed. Run the page from a local server (not file://) so the logo can be read, then try again.' });
            } finally { setExporting(false); }
        }

        const msgBox = msg && html`<div class="rounded-lg px-3 py-2 text-sm mt-3" style=${{ background: msg.t === 'ok' ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)', color: msg.t === 'ok' ? '#059669' : '#dc2626' }}>${msg.s}</div>`;

        return html`
    <div class="max-w-6xl mx-auto p-4 md:p-6">
      <header class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style=${{ background: theme.c }}><${Ic} name="GraduationCap" size=${22} color="#fff" /></div>
        <div>
          <h1 class="text-xl font-extrabold leading-tight">Question-of-the-Day Card Maker</h1>
          <p class="text-sm" style=${{ color: 'var(--muted)' }}>Turn exam questions into TikTok-ready 9:16 cards for SurePass.</p>
        </div>
      </header>

      <div class="grid gap-5 lg:grid-cols-[1fr_440px] items-start">
        <div class="panel p-4 md:p-5 space-y-4">
          <div class="grid sm:grid-cols-3 gap-3">
            <${Field} label="APP TITLE"><input class="fld" value=${d.appTitle} onInput=${e => set('appTitle', e.target.value)} /><//>
            <${Field} label="COURSE CODE"><input class="fld" placeholder="CHM 101" value=${d.course} onInput=${e => set('course', e.target.value)} /><//>
            <${Field} label="TOPIC / TITLE"><input class="fld" placeholder="General Chemistry" value=${d.topic} onInput=${e => set('topic', e.target.value)} /><//>
          </div>

          <${Field} label="QUESTION TEXT"><textarea class="fld" rows="4" placeholder="Type your question here" value=${d.question} onInput=${e => set('question', e.target.value)}></textarea><//>

          <div class="grid sm:grid-cols-2 gap-3">
            ${d.opts.map((o, i) => html`<${Field} key=${i} label=${'OPTION ' + 'ABCD'[i]}><input class="fld" placeholder=${'Type option ' + 'ABCD'[i]} value=${o} onInput=${e => setOpt(i, e.target.value)} /><//>`)}
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <${Field} label="ACCENT THEME">
              <div class="flex gap-2 flex-wrap">
                ${THEMES.map(t => html`
                  <button key=${t.name} title=${t.name} aria-label=${t.name} onClick=${() => setTheme(t)} class="w-10 h-10 rounded-full flex items-center justify-center" style=${{ background: t.c, outline: theme.name === t.name ? '3px solid ' + t.c : 'none', outlineOffset: 2 }}>
                    ${theme.name === t.name ? html`<${Ic} name="Check" size=${18} color="#fff" />` : null}
                  </button>`)}
                <label title="Custom colour" class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer" style=${{ background: 'conic-gradient(red,yellow,lime,aqua,blue,magenta,red)' }}>
                  <input type="color" class="hidden" onInput=${e => setTheme({ name: 'Custom colour', c: e.target.value, light: e.target.value, soft: e.target.value })} />
                </label>
              </div>
              <div class="text-xs mt-1" style=${{ color: 'var(--muted)' }}>${theme.name}</div>
            <//>
             
          </div>
          ${msgBox}
        </div>

        <div class="lg:sticky lg:top-4">
          <div class="panel p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="text-sm font-bold flex items-center gap-2"><${Ic} name="Smartphone" size=${16} /> Live preview · 9:16</div>
              <div class="text-xs" style=${{ color: 'var(--muted)' }}>1080 × 1920</div>
            </div>
            <div ref=${wrapRef} class="mx-auto" style=${{ maxWidth: 400 }}>
              <div id="card-wrap" style=${{ width: 1080 * scale, height: 1920 * scale, overflow: 'hidden', borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,.25)' }}>
                <div id="card-scale" style=${{ width: 1080, height: 1920, transform: 'scale(' + scale + ')', transformOrigin: 'top left' }}>
                  <${Card} d=${d} theme=${theme} logo=${logo} />
                </div>
              </div>
            </div>
            <button onClick=${download} disabled=${exporting} class="w-full mt-4 rounded-xl py-3 font-bold text-white flex items-center justify-center gap-2" style=${{ background: theme.c, opacity: exporting ? .7 : 1 }}>
              <${Ic} name="Download" size=${18} /> ${exporting ? 'Rendering…' : 'Download PNG for TikTok'}
            </button>
          </div>
        </div>
      </div>
    </div>`;
    }

    ReactDOM.createRoot(document.getElementById('root')).render(createElement(App));
})();