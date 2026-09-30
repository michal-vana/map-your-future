/*
 * MAP YOUR FUTURE — kiosk
 * Stavový automat průchodu S0–S7 (docs/design.md kap. 3).
 * Texty, otázky, hodnocení i časování jsou výhradně ve window.MYF_CONFIG.
 * Klasický skript bez modulů, aby stránka běžela i z file://.
 */
(function () {
  'use strict';

  const CFG = window.MYF_CONFIG;
  if (!CFG) throw new Error('MYF_CONFIG chybí — načti js/config.demo.js před app.js');

  const TICK_MS = 200;
  const LEAVE_FALLBACK_MS = 1000;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const S = {
    ATTRACT:  'attract',  // S0
    INTRO:    'intro',    // S1
    QUESTION: 'question', // S2
    CALC:     'calc',     // S3
    RESULT:   'result',   // S4
    FIXED:    'fixed',    // S5
    CTA:      'cta',      // S6
    THANKS:   'thanks'    // S7
  };

  // Nečinnost v S1–S5: dialog „Jste tam ještě?" → reset. S6 a S7 mají vlastní pravidla.
  const IDLE_DIALOG_STATES = new Set([S.INTRO, S.QUESTION, S.CALC, S.RESULT, S.FIXED]);

  const RENDER = {
    [S.ATTRACT]:  renderAttract,
    [S.INTRO]:    renderIntro,
    [S.QUESTION]: renderQuestion,
    [S.CALC]:     renderCalc,
    [S.RESULT]:   renderResult,
    [S.FIXED]:    renderFixed,
    [S.CTA]:      renderCta,
    [S.THANKS]:   renderThanks
  };

  let dom;           // odkazy na prvky shellu
  let session;       // vše, co návštěvník zadal — při resetu se zahodí celé
  let view;          // aktuální obrazovka { state, node, enteredAt, ... }
  let lastActivity = 0;
  let dialog = null;

  function newSession() {
    return {
      answers: Object.create(null), // questionId → answerId
      qIndex: 0,
      askAtBooth: false
    };
  }

  // --- Pomocné funkce ------------------------------------------------

  function fmt(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m));
  }

  // Texty vždy přes textContent — konfigurace později přijde z administrace.
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value == null || value === false) continue;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key === 'vars') {
          for (const [name, v] of Object.entries(value)) node.style.setProperty(name, v);
        } else if (key === 'onclick') node.addEventListener('click', value);
        else node.setAttribute(key, value === true ? '' : value);
      }
    }
    if (children) for (const child of children) if (child) node.append(child);
    return node;
  }

  function svg(tag, attrs, children) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
    if (children) for (const child of children) node.append(child);
    return node;
  }

  function button(className, text, onClick) {
    return el('button', { type: 'button', class: className, text, onclick: onClick });
  }

  function backButton(onClick) {
    return button('btn-secondary btn-back', CFG.texts.back, onClick);
  }

  function screen(name, parts) {
    return el('section', { class: `screen screen--${name}` }, [
      el('header', { class: 'screen__header' }, parts.header),
      el('div', { class: 'screen__main' }, parts.main),
      el('div', { class: 'screen__actions' }, parts.actions),
      el('footer', { class: 'screen__footer' }, parts.footer)
    ]);
  }

  // Placeholder ikony oblasti — neutrální kruh, dokud nebude sada ikon (design.md kap. 7)
  function placeholderIcon() {
    return svg('svg', { class: 'icon', viewBox: '0 0 48 48', 'aria-hidden': 'true' }, [
      svg('circle', { cx: 24, cy: 24, r: 20, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }),
      svg('circle', { cx: 24, cy: 24, r: 4, fill: 'currentColor' })
    ]);
  }

  // Placeholder QR kódu — jen vyhledávací čtverce a popisek, žádná data
  function placeholderQr(caption) {
    const finder = (x, y) => [
      svg('rect', { class: 'qr__dark', x, y, width: 7, height: 7 }),
      svg('rect', { class: 'qr__light', x: x + 1, y: y + 1, width: 5, height: 5 }),
      svg('rect', { class: 'qr__dark', x: x + 2, y: y + 2, width: 3, height: 3 })
    ];
    const label = svg('text', {
      class: 'qr__text', x: 14.5, y: 15.2, 'text-anchor': 'middle', 'font-size': 2.4
    });
    label.textContent = caption;
    return svg('svg', { viewBox: '0 0 29 29', role: 'img', 'aria-label': caption }, [
      ...finder(0, 0), ...finder(22, 0), ...finder(0, 22),
      svg('rect', { class: 'qr__frame', x: 4.5, y: 10.5, width: 20, height: 8, 'stroke-width': 0.2 }),
      label
    ]);
  }

  function eventLabel() {
    const text = [CFG.event.name, CFG.event.date].filter(Boolean).join(' · ');
    return el('p', { class: 'label label--accent', text });
  }

  // --- Vyhodnocení ---------------------------------------------------

  // Krok 1: pevné hodnocení odpovědí z konfigurace. Skutečný scoring přijde v kroku 2.
  function evaluate() {
    return CFG.areas.map((area) => {
      const question = CFG.questions.find((q) => q.area === area.id);
      if (!question) return null;
      const answer = question.answers.find((a) => a.id === session.answers[question.id]);
      return answer && answer.rating ? { area, rating: answer.rating } : null;
    }).filter(Boolean);
  }

  // --- Obrazovky -----------------------------------------------------

  // S0 — attract loop
  function renderAttract() {
    const t = CFG.texts.attract;
    const node = screen(S.ATTRACT, {
      header: [eventLabel()],
      main: [el('div', { class: 'attract__prompts' }, t.prompts.map((text, i) =>
        el('p', {
          class: 'attract__prompt display' + (i === 0 ? ' is-active' : ''),
          'aria-hidden': i === 0 ? null : 'true',
          text
        })))],
      actions: [el('button', { type: 'button', class: 'btn-primary is-pulsing', text: t.cta })]
    });
    // Jakýkoli dotek kdekoli → S1
    node.addEventListener('click', () => go(S.INTRO));
    return node;
  }

  // S1 — úvod
  function renderIntro() {
    const t = CFG.texts.intro;
    const vars = { count: CFG.questions.length };
    return screen(S.INTRO, {
      header: [el('p', { class: 'label label--accent', text: t.label })],
      main: [el('div', { class: 'intro' }, [
        el('h1', { class: 'h1', text: t.title }),
        el('p', { class: 'body', text: t.text }),
        el('ul', { class: 'intro__facts' }, t.facts.map((fact) =>
          el('li', { class: 'fact' }, [
            el('span', { class: 'fact__value display tabular', text: fmt(fact.value, vars) }),
            el('span', { class: 'label', text: fmt(fact.label, vars) })
          ]))),
        el('p', { class: 'intro__privacy body', text: t.privacy })
      ])],
      actions: [button('btn-primary', t.cta, () => {
        session.qIndex = 0;
        go(S.QUESTION);
      })],
      footer: [backButton(reset)]
    });
  }

  // S2 — otázka; volba odpovědi rovnou posouvá dál
  function renderQuestion() {
    const question = CFG.questions[session.qIndex];
    const selectedId = session.answers[question.id];
    const isTiles = question.type === 'tiles';
    const headingId = `q-${question.id}`;
    let locked = false;

    const choices = question.answers.map((answer) => el('button', {
      type: 'button',
      class: isTiles ? 'tile' : 'answer',
      'aria-pressed': String(answer.id === selectedId),
      text: answer.label,
      onclick: (e) => choose(answer, e.currentTarget)
    }));

    const node = screen(S.QUESTION, {
      main: [el('div', { class: 'question' }, [
        el('h1', { class: 'h1', id: headingId, text: question.text }),
        el('div', {
          class: isTiles ? 'tile-grid' : 'answer-list',
          role: 'group',
          'aria-labelledby': headingId
        }, choices)
      ])],
      footer: [backButton(previousQuestion)]
    });

    function choose(answer, target) {
      if (locked) return;
      locked = true;
      session.answers[question.id] = answer.id;
      for (const b of choices) b.setAttribute('aria-pressed', String(b === target));
      setTimeout(() => {
        if (view.node === node) nextQuestion();
      }, CFG.timers.answerAdvanceMs);
    }

    return node;
  }

  function nextQuestion() {
    if (session.qIndex < CFG.questions.length - 1) {
      session.qIndex += 1;
      go(S.QUESTION);
    } else {
      go(S.CALC);
    }
  }

  function previousQuestion() {
    if (session.qIndex > 0) {
      session.qIndex -= 1;
      go(S.QUESTION, 'back');
    } else {
      go(S.INTRO, 'back');
    }
  }

  // S3 — výpočet; ikony oblastí se rozsvěcují zleva doprava
  function renderCalc() {
    const duration = CFG.timers.calculationMs;
    const areas = CFG.areas;
    const step = (duration * 0.8) / areas.length;
    return screen(S.CALC, {
      main: [el('div', { class: 'calc', vars: { '--calc-dur': `${duration}ms` } }, [
        el('ul', { class: 'calc__areas' }, areas.map((area, i) =>
          el('li', { class: 'calc__area', vars: { '--delay': `${Math.round(i * step)}ms` } }, [
            placeholderIcon(),
            el('span', { class: 'label', text: area.label })
          ]))),
        el('div', { class: 'bar', 'aria-hidden': 'true' }, [el('div', { class: 'bar__fill' })]),
        el('p', { class: 'h2', role: 'status', text: CFG.texts.calculation.text })
      ])]
    });
  }

  // S4 — co můžete ovlivnit
  function renderResult() {
    const t = CFG.texts.result;
    const results = evaluate();
    const good = results.filter((r) => r.rating === 'good').length;
    return screen(S.RESULT, {
      header: [
        el('p', { class: 'label label--accent', text: t.label }),
        el('div', { class: 'result-hero' }, [
          el('p', { class: 'result-hero__value display tabular', text: fmt(t.hero, { good, total: results.length }) }),
          el('p', { class: 'h2', text: t.heroLabel })
        ])
      ],
      main: [el('ul', { class: 'result-list' }, results.map((r, i) =>
        el('li', { class: `result-card result-card--${r.rating}`, vars: { '--i': i } }, [
          el('span', { class: 'result-card__bar', 'aria-hidden': 'true' }),
          el('p', { class: 'label', text: r.area.label }),
          el('p', { class: 'h2', text: CFG.ratings[r.rating].label }),
          el('p', { class: 'result-card__tip body', text: r.area.recommendations[r.rating] })
        ])))],
      actions: [button('btn-primary', t.cta, () => go(S.FIXED))],
      footer: [backButton(() => {
        session.qIndex = CFG.questions.length - 1;
        go(S.QUESTION, 'back');
      })]
    });
  }

  // S5 — co ovlivnit nemůžete
  function renderFixed() {
    const t = CFG.texts.fixed;
    return screen(S.FIXED, {
      header: [el('p', { class: 'label', text: t.label })],
      main: [el('div', { class: 'fixed' }, [
        el('h1', { class: 'h1', text: t.title }),
        el('ul', { class: 'fixed__list' }, t.items.map((item) =>
          el('li', { class: 'fixed__item' }, [
            el('p', { class: 'fixed__title', text: item.title }),
            el('p', { class: 'fixed__text body', text: item.text })
          ]))),
        el('p', { class: 'h2', text: t.bridge })
      ])],
      actions: [button('btn-primary', t.cta, () => go(S.CTA))],
      footer: [backButton(() => go(S.RESULT, 'back'))]
    });
  }

  // S6 — MetLife CTA
  function renderCta() {
    const t = CFG.texts.cta;
    return screen(S.CTA, {
      header: [el('p', { class: 'label label--accent', text: t.label })],
      main: [el('div', { class: 'cta' }, [
        el('h1', { class: 'h1', text: t.title }),
        el('p', { class: 'body', text: t.text }),
        el('figure', { class: 'cta__qr' }, [
          el('div', { class: 'qr' }, [placeholderQr(t.qrPlaceholder)]),
          el('figcaption', { class: 'body', text: t.qrCaption })
        ])
      ])],
      actions: [
        button('btn-primary', t.primary, () => go(S.THANKS)),
        button('btn-secondary', t.secondary, () => {
          session.askAtBooth = true;
          go(S.THANKS);
        })
      ],
      footer: [backButton(() => go(S.FIXED, 'back'))]
    });
  }

  // S7 — poděkování a odpočet
  function renderThanks() {
    const t = CFG.texts.thanks;
    const total = CFG.timers.thanksCountdownMs;
    return screen(S.THANKS, {
      main: [el('div', { class: 'thanks' }, [
        el('h1', { class: 'thanks__title display', text: t.title }),
        el('p', { class: 'body', text: session.askAtBooth ? t.textBooth : t.text }),
        el('div', { class: 'thanks__countdown', vars: { '--countdown-dur': `${total}ms` } }, [
          el('p', { class: 'body tabular', 'data-countdown': '', text: fmt(t.countdown, { s: Math.ceil(total / 1000) }) }),
          el('div', { class: 'bar', 'aria-hidden': 'true' }, [el('div', { class: 'bar__fill' })])
        ])
      ])],
      actions: [button('btn-primary', t.cta, reset)]
    });
  }

  // --- Navigace ------------------------------------------------------

  function go(state, dir = 'forward') {
    closeDialog();
    const node = RENDER[state]();
    const now = Date.now();
    view = { state, node, enteredAt: now };
    lastActivity = now;
    swap(node, dir);
    updateProgress();
  }

  // Stará obrazovka odjede a zmizí z DOM; nová je ovladatelná okamžitě.
  function swap(node, dir) {
    for (const old of dom.screens.querySelectorAll('.screen:not(.is-leaving)')) {
      old.dataset.dir = dir;
      old.classList.add('is-leaving');
      old.inert = true;
      const remove = () => old.remove();
      old.addEventListener('animationend', (e) => { if (e.target === old) remove(); });
      setTimeout(remove, LEAVE_FALLBACK_MS);
    }
    node.dataset.dir = dir;
    dom.screens.append(node);
  }

  function updateProgress() {
    const active = view.state === S.QUESTION;
    dom.progress.hidden = !active;
    if (!active) return;
    const n = session.qIndex + 1;
    const total = CFG.questions.length;
    dom.progressFill.style.setProperty('--progress', `${(n / total) * 100}%`);
    dom.progressTrack.setAttribute('aria-valuemax', total);
    dom.progressTrack.setAttribute('aria-valuenow', n);
    dom.progressLabel.textContent = fmt(CFG.texts.question.progress, { n, total });
  }

  // Úplné vymazání relace a návrat na S0
  function reset() {
    session = newSession();
    go(S.ATTRACT, 'fade');
  }

  // --- Dialog nečinnosti ---------------------------------------------

  function openDialog() {
    const t = CFG.texts.idle;
    const count = el('p', { class: 'idle-dialog__count body tabular', id: 'idle-count' });
    const node = el('div', {
      class: 'scrim',
      role: 'alertdialog',
      'aria-modal': 'true',
      'aria-labelledby': 'idle-title',
      'aria-describedby': 'idle-text idle-count'
    }, [
      el('div', { class: 'idle-dialog' }, [
        el('h2', { class: 'h1', id: 'idle-title', text: t.title }),
        el('p', { class: 'body', id: 'idle-text', text: t.text }),
        count,
        el('button', { type: 'button', class: 'btn-primary', text: t.cta })
      ])
    ]);
    // Dotek kdekoli v dialogu = návštěvník je tu. Zavírá se až na click,
    // aby dotek nepropadl na prvek pod dialogem.
    node.addEventListener('click', () => {
      closeDialog();
      lastActivity = Date.now();
    });
    view.node.inert = true;
    dom.dialogRoot.append(node);
    dialog = { node, count, shown: null };
  }

  function updateDialog(secondsLeft) {
    if (dialog.shown === secondsLeft) return;
    dialog.shown = secondsLeft;
    dialog.count.textContent = fmt(CFG.texts.idle.countdown, { s: secondsLeft });
  }

  function closeDialog() {
    if (!dialog) return;
    dialog.node.remove();
    dialog = null;
    if (view) view.node.inert = false;
  }

  // --- Hodiny --------------------------------------------------------

  function tick() {
    const now = Date.now();
    const T = CFG.timers;

    switch (view.state) {
      case S.ATTRACT: {
        const prompts = view.node.querySelectorAll('.attract__prompt');
        const index = Math.floor((now - view.enteredAt) / T.attractRotateMs) % prompts.length;
        if (index !== view.promptIndex) {
          view.promptIndex = index;
          prompts.forEach((p, i) => {
            p.classList.toggle('is-active', i === index);
            if (i === index) p.removeAttribute('aria-hidden');
            else p.setAttribute('aria-hidden', 'true');
          });
        }
        return;
      }
      case S.CALC:
        if (now - view.enteredAt >= T.calculationMs) {
          go(S.RESULT);
          return;
        }
        break;
      case S.CTA:
        if (now - lastActivity >= T.ctaIdleResetMs) reset();
        return;
      case S.THANKS: {
        const left = Math.ceil((T.thanksCountdownMs - (now - view.enteredAt)) / 1000);
        if (left <= 0) {
          reset();
        } else if (left !== view.shown) {
          view.shown = left;
          view.node.querySelector('[data-countdown]').textContent =
            fmt(CFG.texts.thanks.countdown, { s: left });
        }
        return;
      }
    }

    if (IDLE_DIALOG_STATES.has(view.state)) {
      const idle = now - lastActivity;
      if (idle >= T.idleResetMs) {
        reset();
        return;
      }
      if (!dialog && idle >= T.idleWarningMs) openDialog();
      if (dialog) updateDialog(Math.ceil((T.idleResetMs - idle) / 1000));
    }
  }

  function markActivity() {
    // Otevřený dialog se ruší jen vlastním clickem (viz openDialog).
    if (!dialog) lastActivity = Date.now();
  }

  // --- Kiosk hardening -----------------------------------------------

  function harden() {
    const block = (e) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    document.addEventListener('selectstart', block);
    // iOS Safari: pinch zoom
    for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
      document.addEventListener(type, block);
    }
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
    // Desktop prohlížeč v kiosk režimu: Ctrl + kolečko / Ctrl + +/−/0
    document.addEventListener('wheel', (e) => {
      if (e.ctrlKey) e.preventDefault();
    }, { passive: false });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) e.preventDefault();
    });
  }

  // --- Start ---------------------------------------------------------

  function init() {
    dom = {
      screens: document.getElementById('screens'),
      progress: document.getElementById('progress'),
      progressTrack: document.getElementById('progress-track'),
      progressFill: document.getElementById('progress-fill'),
      progressLabel: document.getElementById('progress-label'),
      logo: document.getElementById('brand-logo'),
      dialogRoot: document.getElementById('dialog-root')
    };

    document.documentElement.lang = CFG.locale;
    document.title = CFG.texts.documentTitle;
    dom.logo.src = CFG.assets.logo.src;
    dom.logo.alt = CFG.assets.logo.alt;

    harden();
    document.addEventListener('pointerdown', markActivity, { capture: true, passive: true });
    document.addEventListener('keydown', markActivity, { capture: true });

    session = newSession();
    go(S.ATTRACT, 'fade');
    setInterval(tick, TICK_MS);
  }

  init();
})();
