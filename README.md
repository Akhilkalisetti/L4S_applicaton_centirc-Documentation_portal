# Project website

Static website / documentation portal for the Industrial AR L4S dual-queue project. No build step: plain HTML, CSS and JavaScript.

| File | Purpose |
|---|---|
| `index.html` | Objectives, problem statement, methodology, key results, team, progress |
| `results.html` | All 35 result plots: interactive explorer, guided E1/E2/E3 walkthrough, side-by-side viewer, filterable figure index |
| `documentation.html` | Install, run, options, experiments, outputs, analysis, results summary, glossary, FAQ |
| `assets/style.css`, `assets/main.js` | Shared styles (light/dark), lightbox, navigation |
| `assets/figures.js` | Figure catalog (titles, captions) and the numbers from `comparison.csv` |
| `assets/results.js` | Charts, side-by-side viewer and figure index for `results.html` |
| `assets/img/` | Plots copied from `results/industrial-ar/` (`compare/`, `e1/`, `e2/`, `e3/`, `e3-detail/`) |
| `assets/data/comparison.csv` | Downloadable merged results |

## View locally

```sh
cd project-website
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish with GitHub Pages

Push the repository, then in **Settings → Pages** choose "Deploy from a branch", branch `main`. GitHub Pages only serves the repository root or `/docs`, so either move this folder's contents into `docs/` or use a GitHub Actions Pages workflow that uploads `project-website/`.

## Editing

- **Team:** update the member cards in the `#team` section of `index.html`.
- **Progress:** change the `done` / `doing` / `todo` class on each timeline item and the percentage in the progress bar.
- **Figures:** after regenerating plots, copy them again into `assets/img/` (the top-level `e3-*.png` files go to `e3-detail/` without the `e3-` prefix). If the numbers change, update `assets/figures.js` (data and captions) and the tables in `results.html`.
