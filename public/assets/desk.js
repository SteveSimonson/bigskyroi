/**
 * Big Sky ROI — desk interactivity
 * ROI capital model + mobile nav + live clock
 */
(function () {
  "use strict";

  /* —— Mobile nav —— */
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* —— Desk clock —— */
  const asof = document.querySelectorAll("[data-asof]");
  function tickClock() {
    const now = new Date();
    const opts = {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const t = new Intl.DateTimeFormat("en-US", opts).format(now);
    asof.forEach((el) => {
      el.textContent = "NY " + t;
    });
  }
  if (asof.length) {
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* —— ROI capital model —— */
  const form = document.getElementById("roi-form");
  if (!form) return;

  const fields = {
    unitCost: document.getElementById("unit-cost"),
    sellPrice: document.getElementById("sell-price"),
    units: document.getElementById("units"),
    fbaFee: document.getElementById("fba-fee"),
    referral: document.getElementById("referral"),
    adPct: document.getElementById("ad-pct"),
    otherPct: document.getElementById("other-pct"),
    months: document.getElementById("months"),
  };

  const outs = {
    capital: document.getElementById("out-capital"),
    profit: document.getElementById("out-profit"),
    roi: document.getElementById("out-roi"),
    margin: document.getElementById("out-margin"),
    cpp: document.getElementById("out-cpp"),
    annualized: document.getElementById("out-annualized"),
    breakeven: document.getElementById("out-breakeven"),
    verdict: document.getElementById("out-verdict"),
  };

  function money(n) {
    const sign = n < 0 ? "-" : "";
    return sign + "$" + Math.abs(n).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  function pct(n) {
    return (n * 100).toFixed(1) + "%";
  }

  function syncLabels() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const key = el.getAttribute("data-bind");
      const input = fields[key];
      if (!input) return;
      let v = input.value;
      if (key === "referral" || key === "adPct" || key === "otherPct") {
        el.textContent = v + "%";
      } else if (key === "unitCost" || key === "sellPrice" || key === "fbaFee") {
        el.textContent = "$" + Number(v).toFixed(2);
      } else if (key === "months") {
        el.textContent = v + " mo";
      } else {
        el.textContent = Number(v).toLocaleString("en-US");
      }
    });
  }

  function compute() {
    const unitCost = Number(fields.unitCost.value);
    const sellPrice = Number(fields.sellPrice.value);
    const units = Number(fields.units.value);
    const fbaFee = Number(fields.fbaFee.value);
    const referral = Number(fields.referral.value) / 100;
    const adPct = Number(fields.adPct.value) / 100;
    const otherPct = Number(fields.otherPct.value) / 100;
    const months = Math.max(1, Number(fields.months.value));

    const revenue = sellPrice * units;
    const cogs = unitCost * units;
    const referralFee = revenue * referral;
    const fba = fbaFee * units;
    const ads = revenue * adPct;
    const other = revenue * otherPct;
    const totalCost = cogs + referralFee + fba + ads + other;
    const profit = revenue - totalCost;
    const capital = cogs; // inventory capital at risk (simplified)
    const roi = capital > 0 ? profit / capital : 0;
    const margin = revenue > 0 ? profit / revenue : 0;
    const cpp = units > 0 ? profit / units : 0;
    const annualized = roi * (12 / months);
    const contrib = sellPrice - unitCost - fbaFee - sellPrice * referral - sellPrice * adPct - sellPrice * otherPct;
    const breakevenUnits = contrib > 0 ? Math.ceil(capital / contrib) : Infinity;

    outs.capital.textContent = money(capital);
    outs.profit.textContent = money(profit);
    outs.profit.classList.toggle("neg", profit < 0);
    outs.roi.textContent = pct(roi);
    outs.roi.className = "big" + (roi < 0 ? " neg" : "");
    outs.margin.textContent = pct(margin);
    outs.cpp.textContent = "$" + cpp.toFixed(2);
    outs.annualized.textContent = pct(annualized);
    outs.breakeven.textContent =
      breakevenUnits === Infinity ? "—" : breakevenUnits.toLocaleString("en-US") + " units";

    let cls = "fail";
    let msg =
      "Capital destroys value under these assumptions. Revisit price, COGS, or ad intensity before deploying inventory capital.";
    if (roi >= 0.45 && margin >= 0.18 && annualized >= 0.8) {
      cls = "pass";
      msg =
        "Desk view: Attractive risk-adjusted return. Inventory capital clears our hurdle (≥45% cycle ROI, ≥18% net margin). Size the position; stress-test ad inflation +10pts.";
    } else if (roi >= 0.2 && margin >= 0.1) {
      cls = "warn";
      msg =
        "Desk view: Marginal. Meets a soft floor but fails institutional hurdle. Only proceed with a clear path to fee compression, ACOS improvement, or price power.";
    }

    outs.verdict.className = "verdict " + cls;
    outs.verdict.textContent = msg;
  }

  Object.values(fields).forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      syncLabels();
      compute();
    });
  });

  syncLabels();
  compute();
})();
