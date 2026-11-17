/* Builds the documentation sidebar shared by every page. */
(function () {
  var REPO = "https://github.com/Akhilkalisetti/L4S_applicaton_centirc-Documentation_portal";
  var NAV = [
    { title: "Overview", page: "index.html", items: [
      ["introduction", "Introduction"], ["objectives", "Project objectives"], ["problem", "Problem statement"],
      ["methodology", "Methodology"], ["team", "Team"], ["progress", "Project progress"]
    ] },
    { title: "User guide", page: "documentation.html", items: [
      ["overview", "Overview"], ["requirements", "Requirements"], ["build", "Configure & build"], ["run", "Run the scenarios"],
      ["options", "Command-line options"], ["experiments", "Experiment definitions"], ["congestion", "Utility-weighted DCTCP"],
      ["outputs", "Output files"], ["analysis", "Analysis & plotting"], ["metrics", "Metric definitions"],
      ["glossary", "Glossary"], ["faq", "FAQ & troubleshooting"], ["layout", "Repository layout"], ["license", "License"]
    ] },
    { title: "Results", page: "results.html", items: [
      ["summary", "Summary"], ["explorer", "Interactive explorer"], ["setup", "1 · Setup"], ["e1", "2 · E1 equal utility"],
      ["e2", "3 · E2 fixed utility"], ["e3", "4 · E3 dynamic utility"], ["comparison", "5 · Comparison"],
      ["side-by-side", "Side-by-side viewer"], ["all-figures", "All figures"], ["limitations", "Limitations"]
    ] }
  ];

  var aside = document.getElementById("sidebar");
  if (!aside) return;
  var here = location.pathname.split("/").pop() || "index.html";

  var html =
    '<div class="sb-head">' +
      '<a class="sb-brand" href="index.html"><span class="brand-dot"></span><span>Industrial AR · L4S<small>Documentation</small></span></a>' +
      '<button class="icon-btn" id="theme-toggle" aria-label="Toggle dark mode">☾</button>' +
      '<button class="icon-btn sb-toggle" id="sb-toggle" aria-label="Show contents" aria-expanded="false">☰</button>' +
    "</div>" +
    '<div class="sb-body" id="sb-body">' +
      '<input type="search" id="docs-filter" class="docs-search" placeholder="Search docs…" aria-label="Search documentation">';
  NAV.forEach(function (g) {
    var cur = g.page === here;
    html += '<h4><a href="' + g.page + '"' + (cur ? ' class="cur"' : "") + ">" + g.title + "</a></h4><ul>";
    g.items.forEach(function (it) {
      html += '<li><a href="' + (cur ? "" : g.page) + "#" + it[0] + '">' + it[1] + "</a></li>";
    });
    html += "</ul>";
  });
  html += '<a class="sb-repo" href="' + REPO + '" target="_blank" rel="noopener">GitHub repository ↗</a></div>';
  aside.innerHTML = html;

  var t = document.getElementById("sb-toggle"), body = document.getElementById("sb-body");
  t.addEventListener("click", function () {
    var open = body.classList.toggle("open");
    t.setAttribute("aria-expanded", open ? "true" : "false");
  });
  body.addEventListener("click", function (e) { if (e.target.tagName === "A") body.classList.remove("open"); });
})();
