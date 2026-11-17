(function () {
  var D = window.PROJECT_DATA, FIGS = window.FIGURES, KIND = window.FIGURE_KINDS;
  var EXPS = D.experiments;
  var NS = "http://www.w3.org/2000/svg";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function figHTML(f, label) {
    return '<img loading="lazy" src="' + f.src + '" alt="' + esc(f.title) + '">' +
      '<figcaption><b>' + (label ? label + ". " : "") + esc(f.title) + "</b>" + esc(f.caption) + "</figcaption>";
  }

  // 1. Walkthrough figures, numbered in page order
  var n = 0, numberOf = {};
  document.querySelectorAll("figure[data-fig]").forEach(function (el) {
    var f = window.figById(el.getAttribute("data-fig"));
    if (!f) { el.remove(); return; }
    n += 1; numberOf[f.id] = n;
    el.id = "fig-" + f.id;
    el.innerHTML = figHTML(f, "Figure " + n);
  });
  var countEl = document.getElementById("fig-count");
  if (countEl) countEl.textContent = FIGS.length;

  // 2. SVG bar charts
  function el(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function niceMax(v) {
    var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
  }

  function groupedBars(host, groups, series, o) {
    o = o || {};
    var W = 760, H = 320, L = 52, R = 12, T = 22, B = 46;
    var max = niceMax(o.max || Math.max.apply(null, series.reduce(function (a, s) { return a.concat(s.values); }, [])) * 1.08);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": o.label || "Bar chart" });
    var ih = H - T - B, iw = W - L - R;
    for (var t = 0; t <= 4; t++) {
      var v = max * t / 4, y = T + ih - ih * t / 4;
      svg.appendChild(el("line", { x1: L, x2: W - R, y1: y, y2: y, class: "grid-line" }));
      svg.appendChild(el("text", { x: L - 8, y: y + 4, "text-anchor": "end", class: "axis" }, o.fmtAxis ? o.fmtAxis(v) : +v.toFixed(2)));
    }
    var gw = iw / groups.length, pad = gw * 0.16, bw = (gw - 2 * pad) / series.length;
    groups.forEach(function (g, gi) {
      var gx = L + gi * gw;
      var gmax = Math.max.apply(null, series.map(function (s) { return s.values[gi]; }));
      var tiny = gmax < max * 0.04;
      if (tiny) svg.appendChild(el("text", { x: gx + gw / 2, y: T + ih - 10, "text-anchor": "middle", class: "val" },
        o.tinyLabel ? o.tinyLabel(gi) : series.map(function (s) { return o.fmt(s.values[gi], true); }).join(" · ")));
      series.forEach(function (s, si) {
        var val = s.values[gi], h = Math.max(1, ih * val / max), x = gx + pad + si * bw, y = T + ih - h;
        var r = el("rect", { x: x + 1, y: y, width: Math.max(2, bw - 2), height: h, rx: 3, class: "bar " + s.cls });
        r.appendChild(el("title", {}, s.name + " · " + g + ": " + o.fmt(val)));
        svg.appendChild(r);
        if (bw > 26 && !tiny) svg.appendChild(el("text", { x: x + bw / 2, y: y - 5, "text-anchor": "middle", class: "val" }, o.fmt(val, true)));
      });
      svg.appendChild(el("text", { x: gx + gw / 2, y: H - B + 20, "text-anchor": "middle", class: "cat" }, g));
    });
    if (o.unit) svg.appendChild(el("text", { x: 6, y: 12, class: "axis" }, o.unit));
    host.innerHTML = "";
    host.appendChild(svg);
  }

  var METRICS = {
    throughput:   { unit: "Mbps", fmt: function (v, s) { return v < 0.1 ? v.toFixed(3) : v.toFixed(s ? 2 : 3); }, offered: true,
                    note: "Grey bars are the offered load. Sensors are fully served in every run (0.049 Mbps received vs 0.041 offered)." },
    satisfaction: { unit: "%", max: 100, fmt: function (v) { return v.toFixed(v === 100 ? 0 : 1) + (arguments[1] ? "" : "%"); },
                    note: "Satisfaction = min(received / offered, 1). Video and instructions trade places depending on the weights; logs drop below 100% once their utility is 0.2." },
    meanDelay:    { unit: "ms", fmt: function (v) { return String(v); }, note: "Mean one-way delay from FlowMonitor. E1 is lowest for every flow." },
    p95Delay:     { unit: "ms", fmt: function (v) { return String(v); }, note: "p95 delay from FlowMonitor histogram bins. Weighted runs add 12–16 ms." },
    p99Delay:     { unit: "ms", fmt: function (v) { return String(v); }, note: "p99 delay from FlowMonitor histogram bins." },
    utility:      { unit: "utility", max: 1, fmt: function (v) { return v.toFixed(2); },
                    note: "Time-averaged control utility per flow. E3's average differs from E2 even though both start with the same weights." }
  };

  var appChart = document.getElementById("app-chart");
  var appNote = document.getElementById("app-note");
  var legend = document.getElementById("app-legend");
  function drawApp(metric) {
    var m = METRICS[metric], series = [];
    if (m.offered) series.push({ name: "Offered", cls: "s-off", values: D.perApp.offered });
    EXPS.forEach(function (e, i) { series.push({ name: e, cls: "s-e" + (i + 1), values: D.perApp[metric][e] }); });
    groupedBars(appChart, D.apps, series, { unit: m.unit, fmt: m.fmt, max: m.max, tinyLabel: m.offered ? function () { return "0.041 → 0.049 Mbps"; } : null, label: metric + " by application and experiment" });
    legend.innerHTML = series.map(function (s) { return '<span><i class="' + s.cls + '"></i>' + s.name + "</span>"; }).join("");
    appNote.textContent = m.note;
  }
  if (appChart) {
    drawApp("throughput");
    document.querySelectorAll("#metric-switch button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll("#metric-switch button").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
        drawApp(b.getAttribute("data-metric"));
      });
    });
  }

  var NET = [
    { key: "weighted", title: "Weighted satisfaction", fmt: function (v) { return v.toFixed(3); }, max: 1, hint: "Higher is better" },
    { key: "ecn", title: "ECN marking ratio", fmt: function (v) { return v.toFixed(2) + "%"; }, hint: "Share of enqueued packets marked" },
    { key: "queueP95", title: "Queue occupancy p95", fmt: function (v) { return v.toLocaleString() + " B"; }, hint: "Lower is better" },
    { key: "l4sP99", title: "L4S sojourn p99", fmt: function (v) { return v + " ms"; }, hint: "Lower is better" }
  ];
  var net = document.getElementById("net-charts");
  if (net) {
    NET.forEach(function (m) {
      var card = document.createElement("div");
      card.className = "card mini-chart";
      card.innerHTML = "<h4>" + m.title + "</h4><div class='chart'></div><div class='hint'>" + m.hint + "</div>";
      net.appendChild(card);
      var vals = EXPS.map(function (e) { return D.network[m.key][e]; });
      var W = 260, H = 170, T = 22, B = 26, ih = H - T - B, max = m.max || Math.max.apply(null, vals) * 1.15;
      var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": m.title + ": " + EXPS.map(function (e, i) { return e + " " + m.fmt(vals[i]); }).join(", ") });
      svg.appendChild(el("line", { x1: 8, x2: W - 8, y1: T + ih, y2: T + ih, class: "grid-line" }));
      vals.forEach(function (v, i) {
        var bw = 60, gap = (W - 3 * bw) / 4, x = gap + i * (bw + gap), h = Math.max(1, ih * v / max), y = T + ih - h;
        var r = el("rect", { x: x, y: y, width: bw, height: h, rx: 4, class: "bar s-e" + (i + 1) });
        r.appendChild(el("title", {}, EXPS[i] + ": " + m.fmt(v)));
        svg.appendChild(r);
        svg.appendChild(el("text", { x: x + bw / 2, y: y - 6, "text-anchor": "middle", class: "val val-lg" }, m.fmt(v)));
        svg.appendChild(el("text", { x: x + bw / 2, y: H - 6, "text-anchor": "middle", class: "cat cat-lg" }, EXPS[i]));
      });
      card.querySelector(".chart").appendChild(svg);
    });
  }

  // 3. Side-by-side viewer
  var sbsSwitch = document.getElementById("sbs-switch"), sbsGrid = document.getElementById("sbs-grid");
  function drawSbs(kind) {
    sbsGrid.innerHTML = EXPS.map(function (e) {
      var f = window.figById(e.toLowerCase() + "-" + kind);
      return '<figure class="sbs">' + figHTML(f) + "</figure>";
    }).join("");
    sbsSwitch.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-kind") === kind ? "true" : "false"); });
  }
  if (sbsSwitch) {
    sbsSwitch.innerHTML = Object.keys(KIND).map(function (k) { return '<button role="tab" data-kind="' + k + '">' + KIND[k] + "</button>"; }).join("");
    sbsSwitch.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) drawSbs(b.getAttribute("data-kind")); });
    drawSbs("throughput");
  }

  // 4. Full figure index
  var expFilter = document.getElementById("exp-filter"), kindFilter = document.getElementById("kind-filter"),
      search = document.getElementById("fig-search"), index = document.getElementById("fig-index"), status = document.getElementById("fig-status");
  if (index) {
    var groups = ["All", "Compare", "E1", "E2", "E3", "E3 detail"];
    var state = { exp: "All", kind: "", q: "" };
    expFilter.innerHTML = groups.map(function (g) {
      var c = g === "All" ? FIGS.length : FIGS.filter(function (f) { return f.exp === g; }).length;
      return '<button data-exp="' + g + '" aria-selected="' + (g === "All") + '">' + g + " <small>" + c + "</small></button>";
    }).join("");
    kindFilter.innerHTML = '<option value="">All plot types</option>' + Object.keys(KIND).map(function (k) { return '<option value="' + k + '">' + KIND[k] + "</option>"; }).join("");
    function draw() {
      var q = state.q.toLowerCase();
      var list = FIGS.filter(function (f) {
        return (state.exp === "All" || f.exp === state.exp) && (!state.kind || f.kind === state.kind) &&
          (!q || (f.title + " " + f.caption + " " + f.exp).toLowerCase().indexOf(q) !== -1);
      });
      index.innerHTML = list.map(function (f) {
        var num = numberOf[f.id] ? '<a class="fig-ref" href="#fig-' + f.id + '">Fig. ' + numberOf[f.id] + "</a>" : "";
        return '<figure class="index-fig"><span class="badge b-' + f.exp.replace(/\s/g, "").toLowerCase() + '">' + f.exp + "</span>" + num + figHTML(f) +
          '<a class="dl" href="' + f.src + '" download>Download PNG</a></figure>';
      }).join("") || '<p class="muted-text">No figures match.</p>';
      status.textContent = "Showing " + list.length + " of " + FIGS.length + " figures";
    }
    expFilter.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.exp = b.getAttribute("data-exp");
      expFilter.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      draw();
    });
    kindFilter.addEventListener("change", function () { state.kind = kindFilter.value; draw(); });
    search.addEventListener("input", function () { state.q = search.value.trim(); draw(); });
    draw();
  }
})();
