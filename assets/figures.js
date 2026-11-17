/* Catalog of every result figure in assets/img, plus the numbers from comparison.csv. */
window.PROJECT_DATA = {
  apps: ["Remote video", "3D instructions", "Sensors", "Maintenance logs"],
  experiments: ["E1", "E2", "E3"],
  perApp: {
    offered:      [8.0, 4.0, 0.04096, 3.0],
    throughput:   { E1: [4.149, 2.403, 0.049, 3.065], E2: [5.031, 2.122, 0.049, 2.447], E3: [4.723, 2.232, 0.049, 2.645] },
    satisfaction: { E1: [51.9, 60.1, 100, 100],       E2: [62.9, 53.0, 100, 81.6],       E3: [59.0, 55.8, 100, 88.2] },
    meanDelay:    { E1: [96, 100, 95, 98],            E2: [112, 114, 107, 109],          E3: [107, 111, 103, 104] },
    p95Delay:     { E1: [119, 120, 119, 119],         E2: [134, 135, 134, 134],          E3: [132, 133, 132, 132] },
    p99Delay:     { E1: [121, 122, 121, 121],         E2: [137, 138, 137, 137],          E3: [137, 138, 137, 137] },
    utility:      { E1: [1, 1, 1, 1],                 E2: [0.9, 0.6, 0.5, 0.2],          E3: [0.69, 0.67, 0.61, 0.2] }
  },
  network: {
    weighted:   { E1: 0.724, E2: 0.720, E3: 0.722 },
    ecn:        { E1: 20.16, E2: 16.85, E3: 16.33 },
    queueAvg:   { E1: 615,   E2: 1971,  E3: 1777 },
    queueP95:   { E1: 4052,  E2: 18000, E3: 16500 },
    queueP99:   { E1: 6604,  E2: 25500, E3: 25500 },
    queueMax:   { E1: 11104, E2: 31500, E3: 35708 },
    l4sAvg:     { E1: 0.41,  E2: 1.61,  E3: 1.45 },
    l4sP95:     { E1: 3,     E2: 14,    E3: 12 },
    l4sP99:     { E1: 5,     E2: 19,    E3: 19 },
    l4sZero:    { E1: 81.6,  E2: 85.0,  E3: 85.6 },
    l4sMax:     { E1: 8,     E2: 24,    E3: 27 },
    drops:      { E1: 0, E2: 0, E3: 0 }
  }
};

(function () {
  var KIND = {
    "utility-policy":  "Utility policy",
    "throughput":      "Throughput",
    "cwnd":            "Congestion window",
    "delay":           "Delay",
    "jitter-loss":     "Jitter & loss",
    "network-metrics": "ECN & satisfaction",
    "queue-occupancy": "Queue occupancy",
    "queue-sojourn":   "Queue sojourn"
  };

  var per = {
    E1: {
      "utility-policy": "Every flow holds utility 1.0 for the whole run, so the congestion response is plain DCTCP. This is the reference allocation.",
      "throughput": "Offered vs received rate. Video gets 4.149 Mbps (of 8), instructions 2.403 (of 4); logs (3.065) and sensors (0.049) are fully served.",
      "cwnd": "Congestion windows of the four TCP flows. With equal utility, all flows react to ECN marks the same way and settle into steady DCTCP sawtooths.",
      "delay": "Mean, p95 and p99 one-way delay per flow. Mean 95–100 ms, p95 119–120 ms, p99 121–122 ms: the lowest delay of the three experiments.",
      "jitter-loss": "FlowMonitor jitter and packet loss. No flow loses a packet; only the low-rate sensor flow shows ~5 ms average jitter.",
      "network-metrics": "Aggregate ECN marking (20.16%, the highest of the three) and per-app satisfaction (51.9 / 60.1 / 100 / 100%). Weighted score 0.724.",
      "queue-occupancy": "DualPI2 aggregate queue sampled every 10 ms. It stays small: p95 4,052 B, peak 11,104 B.",
      "queue-sojourn": "L4S sojourn-time distribution. 81.6% of samples are 0 ms, p99 is 5 ms and the maximum 8 ms. No Classic-queue traffic is present."
    },
    E2: {
      "utility-policy": "Fixed remote-assistance weights for all 100 s: video 0.9, instructions 0.6, sensors 0.5, logs 0.2.",
      "throughput": "Video rises to 5.031 Mbps (+0.88 vs E1) while instructions drop to 2.122 and logs to 2.447 Mbps. Sensors are unchanged at 0.049.",
      "cwnd": "Video's window runs higher (≈75–95 KiB) while the low-utility logs flow backs off harder, especially after ≈45 s.",
      "delay": "Mean 107–114 ms, p95 134–135 ms, p99 137–138 ms. Delay is ≈15 ms higher than E1 at this load.",
      "jitter-loss": "Still zero packet loss; sensor jitter ≈5 ms, other flows ≈0.",
      "network-metrics": "ECN marking falls to 16.85%. Satisfaction 62.9 / 53.0 / 100 / 81.6%. Weighted score 0.720.",
      "queue-occupancy": "Larger, burstier queue than E1: p95 18,000 B, peak 31,500 B.",
      "queue-sojourn": "85.0% of L4S samples are 0 ms, but the non-zero tail stretches to 24 ms (p99 19 ms)."
    },
    E3: {
      "utility-policy": "Activity-driven schedule: remote assistance (0–30 s), component inspection (30–60 s), overheating detection (60–80 s), remote assistance (80–100 s).",
      "throughput": "Whole-run received rates: video 4.723 Mbps (0.308 below E2), instructions 2.232 (+0.110 vs E2), sensors 0.049 (same), logs 2.645 (+0.198). E3 delivers more to instructions and logs, but not to video overall.",
      "cwnd": "Windows track the schedule: video dips when its utility drops to 0.4 at 30 s; instructions climb to ≈55–60 KiB during 30–60 s; sensors grow during 60–80 s.",
      "delay": "Mean 103–111 ms, p95 132–133 ms, p99 137–138 ms: between E1 and E2.",
      "jitter-loss": "Zero loss on every flow; sensor jitter ≈5 ms.",
      "network-metrics": "Lowest ECN marking of the three (16.33%). Satisfaction 59.0 / 55.8 / 100 / 88.2%. Weighted score 0.722.",
      "queue-occupancy": "p95 16,500 B with the highest single peak (35,708 B), around the utility transitions.",
      "queue-sojourn": "85.6% of L4S samples are 0 ms; tail up to 27 ms, p99 19 ms. No Classic samples."
    }
  };

  var figs = [];
  // Cross-experiment comparison
  [
    ["throughput", "Throughput: E1 vs E2 vs E3", "Received rate per application. Relative to E2, E3 delivers more to instructions (+0.110 Mbps) and logs (+0.198 Mbps), less to video (−0.308 Mbps), and the same to sensors."],
    ["delay-percentiles", "Delay percentiles: E1 vs E2 vs E3", "p95 and p99 application delay per flow. E1 is lowest (≈120 ms); E2 and E3 add ≈12–17 ms."],
    ["queue-occupancy", "Queue occupancy: E1 vs E2 vs E3", "Aggregate DualPI2 occupancy over time. Weighted runs build a noticeably larger standing queue than the equal-weight baseline."],
    ["network-metrics", "ECN marking & weighted satisfaction", "ECN marking drops from 20.16% (E1) to 16.85% (E2) and 16.33% (E3); weighted satisfaction is essentially flat (0.724 / 0.720 / 0.722)."]
  ].forEach(function (f) {
    figs.push({ id: "cmp-" + f[0], src: "assets/img/compare/" + f[0] + ".png", exp: "Compare", kind: f[0] === "delay-percentiles" ? "delay" : f[0], title: f[1], caption: f[2] });
  });
  // E3 annotated detail set
  [
    ["utility-schedule", "utility-policy", "E3 utility schedule (annotated)", "Step changes at 30, 60 and 80 s, used as the reference timeline for every other E3 plot."],
    ["throughput", "throughput", "E3 throughput (annotated)", "Offered vs received with values: video 4.72 / 8.00, instructions 2.23 / 4.00, sensors 0.05 / 0.04, logs 2.64 / 3.00 Mbps."],
    ["cwnd", "cwnd", "E3 congestion windows with utility transitions", "Dashed lines mark each utility change. The window of whichever flow is promoted grows, and the demoted flow's window shrinks within a few seconds."],
    ["delay", "delay", "E3 end-to-end delay (annotated)", "Mean / p95 / p99 per flow: video 107/132/137, instructions 111/133/138, sensors 103/132/137, logs 104/132/137 ms."],
    ["jitter-loss", "jitter-loss", "E3 jitter and loss (annotated)", "Sensor jitter 5.000 ms, all others 0.000 ms; 0.00% loss on every flow."],
    ["ecn-satisfaction", "network-metrics", "E3 ECN marking and satisfaction (annotated)", "16.33% aggregate marking; satisfaction 59.0%, 55.8%, 100% and 88.2% (weighted score 0.722)."],
    ["queue-sojourn", "queue-sojourn", "E3 queue occupancy and sojourn", "Left: aggregate queue over time. Right: L4S sojourn density, where 85.6% of samples are zero and the tail spans 1–27 ms. No Classic samples."]
  ].forEach(function (f) {
    figs.push({ id: "e3d-" + f[0], src: "assets/img/e3-detail/" + f[0] + ".png", exp: "E3 detail", kind: f[1], title: f[2], caption: f[3] });
  });
  // Per-experiment sets
  ["E1", "E2", "E3"].forEach(function (e) {
    Object.keys(KIND).forEach(function (k) {
      figs.push({ id: e.toLowerCase() + "-" + k, src: "assets/img/" + e.toLowerCase() + "/" + k + ".png", exp: e, kind: k, title: e + " · " + KIND[k], caption: per[e][k] });
    });
  });

  window.FIGURES = figs;
  window.FIGURE_KINDS = KIND;
  window.figById = function (id) { for (var i = 0; i < figs.length; i++) if (figs[i].id === id) return figs[i]; return null; };
})();
