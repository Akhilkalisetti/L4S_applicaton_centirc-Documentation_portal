(function () {
  var root = document.documentElement;

  // Theme toggle (remembered per browser)
  try { var saved = localStorage.getItem("theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  var themeBtn = document.getElementById("theme-toggle");
  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncIcon() { if (themeBtn) themeBtn.textContent = isDark() ? "☀" : "☾"; }
  if (themeBtn) {
    syncIcon();
    themeBtn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncIcon();
    });
  }

  // Mobile menu
  var menuBtn = document.getElementById("menu-toggle");
  var links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () { links.classList.toggle("open"); });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") links.classList.remove("open"); });
  }

  // Scroll spy for in-page navigation
  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"], .docs-nav a[href^="#"], .subnav a[href^="#"]'));
  var targets = spyLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && targets.length) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = "#" + en.target.id;
        spyLinks.forEach(function (a) {
          var on = a.getAttribute("href") === id;
          a.classList.toggle("active", on);
          if (on && a.closest(".subnav") && a.scrollIntoView) {
            var bar = a.closest(".subnav .container");
            if (bar) bar.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
          }
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    targets.forEach(function (t) { obs.observe(t); });
  }

  // Reading progress bar
  var prog = document.querySelector(".read-progress span");
  if (prog) {
    var onScroll = function () {
      var h = root.scrollHeight - root.clientHeight;
      prog.style.width = (h > 0 ? (root.scrollTop / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Back-to-top button
  var top = document.createElement("button");
  top.className = "to-top"; top.type = "button"; top.setAttribute("aria-label", "Back to top"); top.textContent = "↑";
  document.body.appendChild(top);
  top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  window.addEventListener("scroll", function () { top.classList.toggle("show", window.scrollY > 900); }, { passive: true });

  // Tabs (simple tab groups)
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = group.querySelectorAll(".tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          var sel = t === tab;
          t.setAttribute("aria-selected", sel ? "true" : "false");
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !sel;
        });
      });
    });
  });

  // Copy buttons on code blocks
  document.querySelectorAll("pre").forEach(function (pre) {
    var btn = document.createElement("button");
    btn.className = "copy-btn"; btn.type = "button"; btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = (code || pre).innerText;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = "Copy"; }, 1400);
        });
      }
    });
    pre.appendChild(btn);
  });

  // Docs sidebar filter
  var filter = document.getElementById("docs-filter");
  if (filter) {
    filter.addEventListener("input", function () {
      var q = filter.value.toLowerCase().trim();
      document.querySelectorAll(".docs-nav li").forEach(function (li) {
        var a = li.querySelector("a");
        var sec = a && document.querySelector(a.getAttribute("href"));
        var hay = (li.textContent + " " + (sec ? sec.textContent : "")).toLowerCase();
        li.hidden = q && hay.indexOf(q) === -1;
      });
    });
  }

  // Lightbox with previous / next
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML =
    '<button class="lb-btn lb-close" aria-label="Close">✕</button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous figure">‹</button>' +
    '<div class="lb-body"><img alt=""><div class="lb-cap"></div></div>' +
    '<button class="lb-btn lb-next" aria-label="Next figure">›</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".lb-cap");
  var list = [], idx = 0;

  function visibleFigImgs(scope) {
    return Array.prototype.filter.call((scope || document).querySelectorAll("figure img"), function (i) {
      return i.offsetParent !== null && !i.closest(".lightbox");
    });
  }
  function show(i) {
    if (!list.length) return;
    idx = (i + list.length) % list.length;
    var img = list[idx], cap = img.closest("figure").querySelector("figcaption");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.innerHTML = (cap ? cap.innerHTML : img.alt) + '<span class="lb-count">' + (idx + 1) + " / " + list.length + "</span>";
  }
  function open(img) {
    list = visibleFigImgs(img.closest("section"));
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    show(Math.max(0, list.indexOf(img)));
  }
  function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }

  document.addEventListener("click", function (e) {
    var img = e.target.closest && e.target.closest("figure img");
    if (img && !img.closest(".lightbox")) open(img);
  });
  lb.addEventListener("click", function (e) {
    if (e.target.closest(".lb-prev")) return show(idx - 1);
    if (e.target.closest(".lb-next")) return show(idx + 1);
    if (e.target.closest(".lb-cap")) return;
    if (e.target === lbImg) return show(idx + 1);
    close();
  });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "ArrowLeft") show(idx - 1);
  });

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
