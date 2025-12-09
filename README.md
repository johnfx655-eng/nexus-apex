<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Nexus Apex — Intelligence</title>
  <meta name="description" content="Nexus Apex — Enterprise sovereign financial dashboard." />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles/styles.css" />
</head>
<body data-page="intelligence">
  <div id="app-loader" class="app-loader" aria-hidden="true" role="status" aria-live="polite">
    <div class="loader-center">
      <div class="loader-logo">Nexus Apex</div>
      <div class="loader-bar" id="loaderBar"><span></span></div>
      <div class="loader-text" id="loaderText">Loading secure modules…</div>
    </div>
  </div>

  <header class="topbar" role="banner">
    <div class="container topbar-inner">
      <div class="brand">Nexus Apex</div>
      <nav class="primary-nav" role="navigation" aria-label="Primary">
        <a class="nav-link" href="index.html" data-nav>Intelligence</a>
        <a class="nav-link" href="protocols.html" data-nav>Protocols</a>
        <a class="nav-link" href="sovereign-id.html" data-nav>Sovereign ID</a>
      </nav>
      <div class="user-meta">
        <div class="user-name">Amnon Ronen</div>
        <div class="user-avatar">AR</div>
      </div>
    </div>
  </header>

  <main id="main" class="container" role="main" tabindex="-1">
    <section class="hero">
      <div class="hero-left card">
        <div class="card-head">
          <h1 class="title">Total Asset Value</h1>
          <div class="sub muted">Consolidated, realtime (simulated)</div>
        </div>

        <div class="value-row">
          <div class="value-large" id="netWorth">—</div>
          <div class="value-meta">
            <div class="meta-item"><div class="meta-label">Decoupling Fee</div><div class="meta-value danger" id="releaseFee">—</div></div>
            <div class="meta-item"><div class="meta-label">Final Transfer</div><div class="meta-value" id="finalAmount">—</div></div>
          </div>
        </div>

        <div class="sparkline" aria-hidden="true">
          <!-- lightweight inline sparkline -->
          <svg viewBox="0 0 200 40" preserveAspectRatio="none" class="sparkline-svg">
            <polyline fill="none" stroke="#F6C85F" stroke-width="2" points="0,25 20,18 40,20 60,10 80,12 100,8 120,12 140,6 160,10 180,8 200,6" />
          </svg>
        </div>

        <div class="card-actions">
          <button class="btn primary" id="audioSummaryBtn">Audio Summary</button>
          <button class="btn secondary" data-nav href="protocols.html">Next: Protocols</button>
        </div>
      </div>

      <aside class="hero-right card">
        <div class="card-head">
          <h2 class="title small">System Health</h2>
        </div>
        <ul class="status-list">
          <li><span class="sname">Quantum Link</span><span class="svalue ok">ONLINE</span></li>
          <li><span class="sname">Data Sync</span><span class="svalue ok">ONLINE</span></li>
          <li><span class="sname">Sovereign ID</span><span class="svalue warn">PENDING</span></li>
          <li><span class="sname">AI Engine</span><span class="svalue ok">ONLINE</span></li>
        </ul>

        <hr />

        <div class="transactions">
          <h3 class="muted">Recent Ledger Events</h3>
          <table class="table ledger" aria-label="Recent transactions">
            <thead><tr><th>Time</th><th>Event</th><th>Hash</th><th class="numeric">Value</th></tr></thead>
            <tbody id="transactionLog">
              <!-- populated by JS -->
            </tbody>
          </table>
        </div>
      </aside>
    </section>

    <section class="details card">
      <div class="card-head">
        <h2 class="title">Audit & Security</h2>
        <div class="muted">Realistic enterprise indicators</div>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <div class="label">Last Audit</div>
          <div class="value">2025-11-22</div>
        </div>
        <div class="detail-item">
          <div class="label">Encryption</div>
          <div class="value">AES-256 / Quantum-resistant layered keys</div>
        </div>
        <div class="detail-item">
          <div class="label">Region</div>
          <div class="value">EU / IL (primary)</div>
        </div>
        <div class="detail-item">
          <div class="label">Risk Score</div>
          <div class="value score">Low<span class="score-dot ok"></span></div>
        </div>
      </div>
    </section>

  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="container">© Nexus Apex — Secure Ledger Technologies</div>
  </footer>

  <script src="scripts/common.js" defer></script>
</body>
</html>
