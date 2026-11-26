/* Car Shop Estética Automotiva — interações (sem dependências, sem backend) */
(function () {
  'use strict';

  var WA_NUMBER = '5548998038007';
  var WA_DEFAULT = 'Olá! Vim pelo site e gostaria de um orçamento.';

  function waLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /* ---------- Links de WhatsApp ---------- */
  document.querySelectorAll('.js-wa').forEach(function (a) { a.href = waLink(WA_DEFAULT); });
  document.querySelectorAll('.js-svc').forEach(function (a) {
    var svc = a.getAttribute('data-service');
    a.href = waLink('Olá! Vim pelo site e gostaria de um orçamento de ' + svc + '.');
    a.setAttribute('aria-label', 'Pedir no WhatsApp: ' + svc);
  });

  /* ---------- Menu do celular ---------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    toggle.querySelector('.sr').textContent = open ? 'Fechar menu' : 'Abrir menu';
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Orçamento rápido ---------- */
  var form = document.getElementById('quote-form');
  var errorEl = document.getElementById('quote-error');
  var dateInput = document.getElementById('quote-date');
  var todayISO = spNow().iso;
  dateInput.min = todayISO;

  function formatDate(iso) {
    var p = iso.split('-');
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
    var weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'UTC' }).format(d);
    return weekday + ', ' + p[2] + '/' + p[1];
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var veiculo = form.querySelector('input[name="veiculo"]:checked');
    var servicos = Array.prototype.map.call(form.querySelectorAll('input[name="servico"]:checked'), function (i) { return i.value; });
    var nome = form.nome.value.trim();
    var dia = form.dia.value;

    var missing = [];
    if (!veiculo) missing.push('o tipo de veículo');
    if (!servicos.length) missing.push('pelo menos um serviço');
    if (!nome) missing.push('seu nome');
    if (missing.length) {
      errorEl.textContent = 'Falta informar ' + missing.join(', ').replace(/, ([^,]*)$/, ' e $1') + '.';
      var first = !veiculo ? form.querySelector('input[name="veiculo"]')
        : !servicos.length ? form.querySelector('input[name="servico"]') : form.nome;
      first.focus();
      return;
    }
    if (dia && dia < todayISO) {
      errorEl.textContent = 'Escolha um dia a partir de hoje.';
      dateInput.focus();
      return;
    }
    errorEl.textContent = '';

    var lines = [
      'Olá! Vim pelo site e gostaria de um orçamento.',
      '',
      'Nome: ' + nome,
      'Veículo: ' + veiculo.value,
      'Serviços:'
    ];
    servicos.forEach(function (s) { lines.push('- ' + s); });
    if (dia) {
      var wd = new Date(dia + 'T12:00:00Z').getUTCDay();
      lines.push('Dia preferido: ' + formatDate(dia) + (wd === 0 ? ' (domingo, sei que é fechado; aceito outro dia)' : ''));
    }
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------- Antes e depois ---------- */
  // TROCAR FOTOS: preencha before/after com o caminho da imagem (ex.: 'img/farol-antes.webp').
  var BA_ITEMS = {
    farol:    { label: 'farol',    before: '', after: '', altBefore: 'Farol amarelado antes da revitalização', altAfter: 'Farol transparente depois da revitalização' },
    estofado: { label: 'estofado', before: '', after: '', altBefore: 'Banco de tecido manchado antes da limpeza', altAfter: 'Banco de tecido limpo depois da limpeza' },
    couro:    { label: 'couro',    before: '', after: '', altBefore: 'Banco de couro ressecado antes da hidratação', altAfter: 'Banco de couro hidratado depois do serviço' },
    pintura:  { label: 'pintura',  before: '', after: '', altBefore: 'Pintura com riscos e sem brilho antes do polimento', altAfter: 'Pintura espelhada depois do polimento' }
  };

  var ba = document.getElementById('ba-panel');
  var range = ba.querySelector('.ba__range');
  var beforeEl = ba.querySelector('.ba__before');
  var afterEl = ba.querySelector('.ba__after');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.ba-tabs [role="tab"]'));

  function setPos(v) { ba.style.setProperty('--pos', v + '%'); }
  range.addEventListener('input', function () { setPos(range.value); });

  function fillLayer(el, src, alt, label) {
    el.innerHTML = '';
    el.setAttribute('data-label', label);
    if (src) {
      var img = new Image();
      img.src = src; img.alt = alt; img.loading = 'lazy'; img.decoding = 'async';
      el.appendChild(img);
    }
  }

  function showBA(key, focus) {
    var item = BA_ITEMS[key];
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-ba') === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) { ba.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); }
    });
    // Mantém a primeira carga com o conteúdo do HTML (permite trocar a foto do farol direto no index.html).
    if (item.before || ba.dataset.kind !== key) fillLayer(beforeEl, item.before, item.altBefore, 'foto: ' + item.label + ' antes');
    if (item.after || ba.dataset.kind !== key) fillLayer(afterEl, item.after, item.altAfter, 'foto: ' + item.label + ' depois');
    ba.dataset.kind = key;
    range.value = 50; setPos(50);
    range.setAttribute('aria-label', 'Comparar antes e depois: ' + item.label);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showBA(t.getAttribute('data-ba')); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); showBA(tabs[n].getAttribute('data-ba'), true); }
    });
  });
  if (BA_ITEMS.farol.before || BA_ITEMS.farol.after) { ba.dataset.kind = ''; showBA('farol'); }

  /* ---------- Galeria com ampliação ---------- */
  var dialog = document.getElementById('lightbox');
  var stage = document.getElementById('lightbox-stage');
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var current = 0;
  var lastFocus = null;

  function render(i) {
    current = (i + items.length) % items.length;
    var src = items[current].querySelector('.slot, img');
    var img = items[current].querySelector('img');
    stage.innerHTML = '';
    if (img) {
      var big = new Image();
      big.src = img.getAttribute('data-full') || img.currentSrc || img.src;
      big.alt = img.alt;
      stage.appendChild(big);
    } else {
      var ph = document.createElement('div');
      ph.className = 'slot';
      ph.setAttribute('data-label', src ? src.getAttribute('data-label') : 'foto');
      stage.appendChild(ph);
    }
    dialog.setAttribute('aria-label', 'Foto ' + (current + 1) + ' de ' + items.length);
  }

  if (dialog && typeof dialog.showModal === 'function') {
    items.forEach(function (btn, i) {
      var label = btn.querySelector('img') ? btn.querySelector('img').alt : (btn.querySelector('.slot') || {}).getAttribute && btn.querySelector('.slot').getAttribute('data-label');
      btn.setAttribute('aria-label', 'Ampliar ' + (label || 'foto ' + (i + 1)));
      btn.addEventListener('click', function () { lastFocus = btn; render(i); dialog.showModal(); });
    });
    dialog.querySelector('.lightbox__close').addEventListener('click', function () { dialog.close(); });
    dialog.querySelector('.lightbox__nav--prev').addEventListener('click', function () { render(current - 1); });
    dialog.querySelector('.lightbox__nav--next').addEventListener('click', function () { render(current + 1); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') render(current + 1);
      if (e.key === 'ArrowLeft') render(current - 1);
    });
    dialog.addEventListener('close', function () { if (lastFocus) lastFocus.focus(); });

    // Deslizar para trocar de foto no celular
    var startX = null;
    stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) render(current + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ---------- Aberto ou fechado agora (America/Sao_Paulo) ---------- */
  // Minutos desde 00:00. Domingo = 0.
  var HOURS = {
    0: null,
    1: [480, 1260], 2: [480, 1260], 3: [480, 1260],
    4: [480, 1320], 5: [480, 1320],
    6: [420, 1050]
  };
  var DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

  function spNow() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday];
    return { day: wd, mins: (+o.hour % 24) * 60 + (+o.minute), iso: o.year + '-' + o.month + '-' + o.day };
  }
  function hhmm(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }

  function updateStatus() {
    var now = spNow();
    var el = document.getElementById('open-status');
    var text = el.querySelector('.status__text');
    var h = HOURS[now.day];

    document.querySelectorAll('.hours tr').forEach(function (tr) {
      tr.classList.toggle('is-today', tr.getAttribute('data-days').split(',').indexOf(String(now.day)) !== -1);
    });

    if (h && now.mins >= h[0] && now.mins < h[1]) {
      el.className = 'status is-open';
      text.textContent = 'Aberto agora · fecha às ' + hhmm(h[1]);
      return;
    }
    el.className = 'status is-closed';
    if (h && now.mins < h[0]) {
      text.textContent = 'Fechado agora · abre hoje às ' + hhmm(h[0]);
      return;
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (HOURS[d]) {
        var when = i === 1 ? 'amanhã' : (d === 6 ? 'no sábado' : (d === 0 ? 'no domingo' : 'na ' + DAY_NAMES[d]));
        text.textContent = 'Fechado agora · abre ' + when + ' às ' + hhmm(HOURS[d][0]);
        return;
      }
    }
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  document.getElementById('year').textContent = spNow().iso.slice(0, 4);
})();
