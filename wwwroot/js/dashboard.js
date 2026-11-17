/*
 * Client-side behaviour for the workshop dashboard:
 *  - header date and clock
 *  - per-card countdown (HH:MM:SS, "-HH:MM:SS" once the target time has passed)
 *  - live overdue state of each card
 *  - live summary counts
 *
 * Bay data is rendered by the server; this script only updates what changes every second.
 * Class names below are plain string literals so Tailwind picks them up when it scans this file.
 */
(function () {
  'use strict';

  var pad2 = function (n) {
    return String(n).padStart(2, '0');
  };

  /* ---------------------------------------------------------------
   * Header clock
   * ------------------------------------------------------------- */
  var dateEl = document.getElementById('header-date');
  var timeEl = document.getElementById('header-time');

  function updateClock() {
    var now = new Date();

    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  /* ---------------------------------------------------------------
   * Countdown helpers
   * ------------------------------------------------------------- */
  function formatCountdown(totalSeconds) {
    var isNegative = totalSeconds < 0;
    var abs = Math.abs(totalSeconds);

    var hours = Math.floor(abs / 3600);
    var minutes = Math.floor((abs % 3600) / 60);
    var seconds = abs % 60;

    var formatted = pad2(hours) + ':' + pad2(minutes) + ':' + pad2(seconds);
    return isNegative ? '-' + formatted : formatted;
  }

  /** Converts an ISO date string or "HH:mm" (today) into a timestamp, or null. */
  function getTargetTimestamp(target) {
    var date = new Date(target);
    if (!isNaN(date.getTime()) && target.indexOf('T') !== -1) {
      return date.getTime();
    }

    var match = target.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      return null;
    }

    var t = new Date();
    t.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return t.getTime();
  }

  /* ---------------------------------------------------------------
   * Cards
   * ------------------------------------------------------------- */
  var OVERDUE_CARD_ON = [
    'border-[3px]',
    'border-[#FF334F]',
    'shadow-[0_0_0_2px_rgba(255,51,79,0.35),0_0_12px_rgba(255,51,79,0.45),0_0_28px_rgba(255,51,79,0.35)]',
    'animate-overdue-glow',
  ];
  var OVERDUE_CARD_OFF = ['border', 'border-[#D3E0EC]'];
  var COUNTDOWN_COLORS = ['text-[#C83D4A]', 'text-[#1B6FB8]', 'text-[#0A1B2E]'];

  var cards = Array.prototype.map.call(
    document.querySelectorAll('[data-bay-card]'),
    function (el) {
      return {
        el: el,
        status: el.getAttribute('data-status'),
        target: el.getAttribute('data-target') || '',
        countdownEl: el.querySelector('[data-countdown]'),
        badgeInService: el.querySelector('[data-badge="IN_SERVICE"]'),
        badgeOverdue: el.querySelector('[data-badge="OVERDUE"]'),
        // Last applied overdue state, so classes are only touched on change.
        applied: el.getAttribute('data-status') === 'OVERDUE',
      };
    }
  );

  function applyOverdueState(card, isOverdue) {
    if (card.applied === isOverdue) {
      return;
    }
    card.applied = isOverdue;

    var cl = card.el.classList;
    if (isOverdue) {
      OVERDUE_CARD_OFF.forEach(function (c) { cl.remove(c); });
      OVERDUE_CARD_ON.forEach(function (c) { cl.add(c); });
    } else {
      OVERDUE_CARD_ON.forEach(function (c) { cl.remove(c); });
      OVERDUE_CARD_OFF.forEach(function (c) { cl.add(c); });
    }

    if (card.badgeInService) card.badgeInService.classList.toggle('hidden', isOverdue);
    if (card.badgeOverdue) card.badgeOverdue.classList.toggle('hidden', !isOverdue);
  }

  function updateCard(card) {
    // Empty bay or no target: the countdown stays at --:--:--.
    if (card.status === 'EMPTY' || !card.target || !card.countdownEl) {
      return;
    }

    var targetTs = getTargetTimestamp(card.target);
    var text = '--:--:--';
    var negative = false;

    if (targetTs !== null) {
      var diff = Math.floor((targetTs - Date.now()) / 1000);
      text = formatCountdown(diff);
      negative = diff < 0;
    }

    if (card.countdownEl.textContent !== text) {
      card.countdownEl.textContent = text;
    }

    var isOverdue = card.status === 'OVERDUE' || negative;

    COUNTDOWN_COLORS.forEach(function (c) { card.countdownEl.classList.remove(c); });
    card.countdownEl.classList.add(
      negative ? 'text-[#C83D4A]' : isOverdue ? 'text-[#1B6FB8]' : 'text-[#0A1B2E]'
    );

    applyOverdueState(card, isOverdue);
  }

  /* ---------------------------------------------------------------
   * Summary counts
   * ------------------------------------------------------------- */
  var summaryEls = {
    inService: document.querySelector('[data-summary="in-service"]'),
    overdue: document.querySelector('[data-summary="overdue"]'),
    empty: document.querySelector('[data-summary="empty"]'),
  };

  function isCardOverdueForSummary(el) {
    var status = el.getAttribute('data-status');
    var finish = el.getAttribute('data-finish');
    var finishDate = el.getAttribute('data-finish-date');

    var isOverdue = status === 'OVERDUE';

    if (status === 'IN_SERVICE' && finish) {
      // Prefer the full ISO date so the summary agrees with the card countdown.
      var isoTarget = finishDate && finishDate.indexOf('T') !== -1
        ? new Date(finishDate).getTime()
        : NaN;
      var match = finish.match(/^(\d{1,2}):(\d{2})$/);

      if (!isNaN(isoTarget)) {
        isOverdue = isoTarget < Date.now();
      } else if (match) {
        var t = new Date();
        t.setHours(Number(match[1]), Number(match[2]), 0, 0);
        isOverdue = t.getTime() <= Date.now();
      }
    }

    return isOverdue;
  }

  function updateSummary() {
    var inService = 0;
    var overdue = 0;
    var empty = 0;

    cards.forEach(function (card) {
      if (card.status === 'EMPTY') {
        empty++;
      } else if (isCardOverdueForSummary(card.el)) {
        overdue++;
      } else {
        inService++;
      }
    });

    if (summaryEls.inService) summaryEls.inService.textContent = pad2(inService);
    if (summaryEls.overdue) summaryEls.overdue.textContent = pad2(overdue);
    if (summaryEls.empty) summaryEls.empty.textContent = pad2(empty);
  }

  /* ---------------------------------------------------------------
   * Tick
   * ------------------------------------------------------------- */
  function tick() {
    updateClock();
    cards.forEach(updateCard);
    updateSummary();
  }

  tick();
  setInterval(tick, 1000);
})();
