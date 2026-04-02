import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --primary: #4647d3;
          --primary-dim: #3939c7;
          --primary-container: #9396ff;
          --secondary: #b80438;
          --tertiary: #006947;
          --on-primary: #f4f1ff;
          --on-surface: #2c2f31;
          --on-surface-variant: #595c5e;
          --surface: #f5f7f9;
          --surface-container-lowest: #ffffff;
          --surface-container-low: #eef1f3;
          --surface-container: #e5e9eb;
          --surface-container-high: #dfe3e6;
          --outline-variant: #abadaf;
          --outline: #747779;
        }

        html { scroll-behavior: smooth; }

        body {
          font-family: 'Newsreader', serif;
          background: var(--surface);
          color: var(--on-surface);
          overflow-x: hidden;
        }

        .msym {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 20px;
          line-height: 1;
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          vertical-align: middle;
        }

        /* ── NAV ── */
        .lp-nav {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 900px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 9999px;
          padding: 10px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          box-shadow: 0 8px 32px rgba(70,71,211,0.1);
        }
        .lp-nav-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: var(--on-surface);
        }
        .lp-nav-links {
          display: none;
          gap: 32px;
          align-items: center;
        }
        @media (min-width: 768px) { .lp-nav-links { display: flex; } }
        .lp-nav-links a {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--on-surface-variant);
          text-decoration: none;
          transition: color 0.2s, transform 0.2s;
        }
        .lp-nav-links a:hover { color: var(--primary); transform: scale(1.05); }
        .lp-nav-links a.active { color: var(--primary); font-weight: 700; }
        .lp-nav-btn {
          background: var(--primary);
          color: var(--on-primary);
          border: none;
          border-radius: 9999px;
          padding: 8px 20px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(70,71,211,0.2);
        }
        .lp-nav-btn:hover { transform: scale(1.05); box-shadow: 0 8px 24px rgba(70,71,211,0.3); }

        /* ── HERO ── */
        .lp-hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 140px 24px 80px;
          position: relative;
          overflow: hidden;
        }
        .lp-hero-orb-1 {
          position: absolute; top: -10%; right: -5%;
          width: 600px; height: 600px;
          background: rgba(70,71,211,0.05);
          border-radius: 9999px;
          filter: blur(120px);
          z-index: -1;
          animation: lp-pulse 6s ease-in-out infinite;
        }
        .lp-hero-orb-2 {
          position: absolute; bottom: -10%; left: -5%;
          width: 500px; height: 500px;
          background: rgba(184,4,56,0.05);
          border-radius: 9999px;
          filter: blur(120px);
          z-index: -1;
        }
        @keyframes lp-pulse {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .lp-hero-inner { max-width: 900px; width: 100%; }

        .lp-hero h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(40px, 9vw, 88px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 0.9;
          color: var(--on-surface);
          margin-bottom: 48px;
        }
        .lp-hero h1 em {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 400;
          color: var(--primary);
        }

        .lp-hero-search {
          position: relative;
          max-width: 640px;
          margin: 0 auto 32px;
        }
        .lp-hero-search::before {
          content: '';
          position: absolute;
          inset: -4px;
          background: linear-gradient(to right, rgba(70,71,211,0.2), rgba(184,4,56,0.2));
          border-radius: 20px;
          filter: blur(8px);
          opacity: 0.3;
          transition: opacity 0.3s;
        }
        .lp-hero-search:hover::before { opacity: 0.6; }
        .lp-hero-search-inner {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(32px);
          border-radius: 16px;
          padding: 8px;
          border: 1px solid rgba(171,173,175,0.1);
          box-shadow: 0 24px 48px rgba(0,0,0,0.08);
        }
        .lp-hero-search-inner .msym {
          margin-left: 12px;
          color: var(--outline);
          font-size: 22px;
        }
        .lp-hero-search-inner input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          padding: 10px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          color: var(--on-surface);
        }
        .lp-hero-search-inner input::placeholder { color: var(--outline-variant); }
        .lp-hero-search-btn {
          background: var(--primary);
          color: var(--on-primary);
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .lp-hero-search-btn:hover { background: var(--primary-dim); transform: scale(1.02); }

        .lp-hero-caption {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--outline);
          margin-bottom: 80px;
        }

        /* Node pills */
        .lp-node-row {
          display: flex;
          justify-content: center;
          gap: 48px;
          flex-wrap: wrap;
        }
        .lp-node-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: default;
        }
        .lp-node-pill-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: var(--surface-container-lowest);
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          border: 1px solid rgba(171,173,175,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s;
        }
        .lp-node-pill:hover .lp-node-pill-icon { transform: translateY(-4px); }
        .lp-node-pill span.label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--outline);
        }

        /* ── SECTION SHARED ── */
        .lp-section { padding: 96px 24px; }
        .lp-section-tag {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--primary);
          margin-bottom: 16px;
        }
        .lp-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: var(--on-surface);
          margin-bottom: 16px;
        }
        .lp-section-sub {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 18px;
          color: var(--on-surface-variant);
          max-width: 480px;
          line-height: 1.6;
        }

        /* ── FEATURES GRID ── */
        .lp-features { background: var(--surface); }
        .lp-features-inner { max-width: 1100px; margin: 0 auto; }
        .lp-features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-top: 56px;
        }
        @media (min-width: 640px) { .lp-features-grid { grid-template-columns: 1fr 1fr; } }

        .lp-feat-card {
          background: var(--surface-container-lowest);
          border-radius: 20px;
          padding: 32px;
          border: 1px solid rgba(171,173,175,0.1);
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s;
          position: relative;
          overflow: hidden;
        }
        .lp-feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(70,71,211,0.08);
        }
        .lp-feat-card-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }
        .lp-feat-card h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--on-surface);
          margin-bottom: 10px;
        }
        .lp-feat-card p {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 15px;
          color: var(--on-surface-variant);
          line-height: 1.6;
        }
        .lp-feat-card-badge {
          position: absolute;
          bottom: 20px; right: 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 4px 10px;
          border-radius: 9999px;
        }
        .lp-feat-card-visual {
          margin-top: 24px;
          height: 64px;
          display: flex;
          align-items: flex-end;
          gap: 6px;
        }
        .lp-feat-bar {
          border-radius: 4px;
          flex: 1;
          background: rgba(70,71,211,0.12);
        }
        .lp-feat-bar.hi { background: rgba(70,71,211,0.4); }

        /* ── WORKFLOW ── */
        .lp-workflow { background: var(--surface); }
        .lp-workflow-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 64px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .lp-workflow-inner { flex-direction: row; align-items: flex-start; }
        }
        .lp-workflow-text { flex: 1; }
        .lp-workflow-text h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--on-surface);
          margin-bottom: 24px;
        }
        .lp-workflow-text h2 em {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 400;
          color: var(--primary);
        }
        .lp-workflow-text p {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 17px;
          color: var(--on-surface-variant);
          line-height: 1.7;
          max-width: 400px;
          margin-bottom: 40px;
        }
        .lp-workflow-pills { display: flex; flex-wrap: wrap; gap: 24px; }
        .lp-workflow-pill {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lp-workflow-pill-dot {
          width: 40px; height: 40px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lp-workflow-pill span.txt {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .lp-workflow-visual {
          flex: 1;
          position: relative;
          height: 480px;
          width: 100%;
          max-width: 500px;
        }
        .lp-wv-card {
          position: absolute;
          border-radius: 20px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.12);
          transition: transform 0.7s cubic-bezier(0.23,1,0.32,1);
        }
        .lp-wv-card:hover { transform: rotate(0deg) !important; }

        /* ── CTA ── */
        .lp-cta { background: var(--surface); padding: 128px 24px; }
        .lp-cta-inner {
          max-width: 1000px;
          margin: 0 auto;
          background: var(--surface-container-lowest);
          border-radius: 32px;
          padding: 64px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0,0,0,0.06);
          border: 1px solid rgba(171,173,175,0.05);
        }
        .lp-cta-orb-1 {
          position: absolute; top: -96px; left: -96px;
          width: 256px; height: 256px;
          background: rgba(70,71,211,0.1);
          border-radius: 9999px;
          filter: blur(80px);
        }
        .lp-cta-orb-2 {
          position: absolute; bottom: -96px; right: -96px;
          width: 256px; height: 256px;
          background: rgba(184,4,56,0.1);
          border-radius: 9999px;
          filter: blur(80px);
        }
        .lp-cta h2 {
          position: relative;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(40px, 8vw, 80px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--on-surface);
          margin-bottom: 24px;
        }
        .iridescent {
          background: linear-gradient(90deg, #4647d3, #b80438, #006947, #4647d3);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: lp-shine 8s linear infinite;
        }
        @keyframes lp-shine { to { background-position: 300% center; } }
        .lp-cta p {
          position: relative;
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 20px;
          color: var(--on-surface-variant);
          max-width: 480px;
          margin: 0 auto 48px;
          line-height: 1.6;
        }
        .lp-cta-actions {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        @media (min-width: 640px) { .lp-cta-actions { flex-direction: row; justify-content: center; } }
        .lp-cta-btn {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%);
          color: var(--on-primary);
          border: none;
          border-radius: 9999px;
          padding: 18px 44px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 16px 40px rgba(70,71,211,0.35);
          transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
        }
        .lp-cta-btn:hover { transform: scale(1.08); box-shadow: 0 24px 56px rgba(70,71,211,0.5); }
        .lp-cta-btn:active { transform: scale(0.96); }
        .lp-cta-link {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--on-surface-variant);
          text-decoration: none;
          padding: 16px 28px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
        }
        .lp-cta-link:hover { color: var(--primary); }

        /* ── FOOTER ── */
        .lp-footer {
          background: var(--surface);
          padding: 96px 24px 48px;
          position: relative;
          overflow: hidden;
        }
        .lp-footer-watermark {
          position: absolute;
          bottom: -10px; left: -10px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(80px, 15vw, 180px);
          font-weight: 900;
          text-transform: uppercase;
          color: var(--on-surface);
          opacity: 0.025;
          pointer-events: none;
          user-select: none;
          line-height: 1;
          letter-spacing: -0.05em;
        }
        .lp-footer-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
        .lp-footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          margin-bottom: 64px;
        }
        @media (min-width: 768px) { .lp-footer-grid { grid-template-columns: 5fr 7fr; } }
        .lp-footer-brand {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.03em;
          text-transform: uppercase;
          color: var(--on-surface);
          margin-bottom: 20px;
        }
        .lp-footer-desc {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 17px;
          color: var(--on-surface-variant);
          max-width: 320px;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .lp-footer-socials { display: flex; gap: 12px; }
        .lp-footer-social {
          width: 40px; height: 40px;
          border-radius: 9999px;
          border: 1px solid rgba(171,173,175,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--outline);
          text-decoration: none;
          transition: all 0.3s;
        }
        .lp-footer-social:hover {
          background: var(--primary);
          color: var(--on-primary);
          border-color: var(--primary);
        }
        .lp-footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .lp-footer-col-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--primary);
          margin-bottom: 20px;
          display: block;
        }
        .lp-footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .lp-footer-col a {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: var(--on-surface-variant);
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-footer-col a:hover { color: var(--primary); }
        .lp-footer-bottom {
          padding-top: 32px;
          border-top: 1px solid rgba(171,173,175,0.1);
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        @media (min-width: 768px) {
          .lp-footer-bottom { flex-direction: row; justify-content: space-between; }
        }
        .lp-footer-copy {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--outline);
        }
        .lp-footer-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--outline);
        }
        .lp-status-dot {
          width: 6px; height: 6px;
          border-radius: 9999px;
          background: var(--tertiary);
          animation: lp-blink 2s ease-in-out infinite;
        }
        @keyframes lp-blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.3; }
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-brand">MeshChat</div>
        <div className="lp-nav-links">
          <a href="#features" className="active">
            Features
          </a>
          <a href="#security">Security</a>
          <a href="#how">How it works</a>
          <a href="#docs">Docs</a>
        </div>
        <button
          className="lp-nav-btn"
          onClick={() => (window.location.href = "#cta")}
        >
          Get Started
        </button>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-orb-1" />
        <div className="lp-hero-orb-2" />
        <div className="lp-hero-inner">
          <h1>
            The <em>Invisible</em>
            <br />
            Network for Chat.
          </h1>

          <div className="lp-hero-search">
            <div className="lp-hero-search-inner">
              <span className="msym">hub</span>
              <input
                placeholder="Find a peer, room, or channel..."
                type="text"
                readOnly
              />
              <button
                className="lp-hero-search-btn"
                onClick={() => window.navigate && window.navigate("/signup")}
              >
                Join Now{" "}
                <span className="msym" style={{ fontSize: 16 }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          <p className="lp-hero-caption">
            Peer-to-peer encrypted messaging · No servers · No surveillance ·
            Open protocol
          </p>

          <div className="lp-node-row">
            {[
              { icon: "hub", label: "P2P Mesh", color: "#4647d3" },
              { icon: "lock", label: "E2E Encrypt", color: "#b80438" },
              { icon: "cell_tower", label: "No Server", color: "#006947" },
              { icon: "shield_person", label: "Anonymous", color: "#3939c7" },
            ].map((n) => (
              <div className="lp-node-pill" key={n.label}>
                <div className="lp-node-pill-icon">
                  <span
                    className="msym"
                    style={{ color: n.color, fontSize: 24 }}
                  >
                    {n.icon}
                  </span>
                </div>
                <span className="label">{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-section lp-features" id="features">
        <div className="lp-features-inner">
          <p className="lp-section-tag">Coordination Layer</p>
          <h2 className="lp-section-title">
            Four Pillars.
            <br />
            One Mesh.
          </h2>
          <p className="lp-section-sub">
            Every feature engineered for privacy-first, serverless communication
            at scale.
          </p>

          <div className="lp-features-grid">
            {/* Card 1 */}
            <div className="lp-feat-card">
              <div
                className="lp-feat-card-icon"
                style={{ background: "rgba(70,71,211,0.08)" }}
              >
                <span
                  className="msym"
                  style={{ color: "#4647d3", fontSize: 22 }}
                >
                  lock
                </span>
              </div>
              <h3>End-to-End Encryption</h3>
              <p>
                Messages are encrypted on your device and can only be decrypted
                by the recipient. Zero knowledge by design.
              </p>
              <div className="lp-feat-card-visual">
                {[30, 50, 40, 64, 45, 55, 42, 60].map((h, i) => (
                  <div
                    key={i}
                    className={`lp-feat-bar${h > 50 ? " hi" : ""}`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Card 2 */}
            <div className="lp-feat-card">
              <div
                className="lp-feat-card-icon"
                style={{ background: "rgba(184,4,56,0.08)" }}
              >
                <span
                  className="msym"
                  style={{ color: "#b80438", fontSize: 22 }}
                >
                  verified_user
                </span>
              </div>
              <h3>Identity Verification</h3>
              <p>
                Cryptographic key pairs ensure you always know who you're
                talking to — without a central authority.
              </p>
              <div
                className="lp-feat-card-badge"
                style={{ background: "rgba(184,4,56,0.08)", color: "#b80438" }}
              >
                Status: Verified
              </div>
            </div>

            {/* Card 3 */}
            <div className="lp-feat-card">
              <div
                className="lp-feat-card-icon"
                style={{ background: "rgba(0,105,71,0.08)" }}
              >
                <span
                  className="msym"
                  style={{ color: "#006947", fontSize: 22 }}
                >
                  route
                </span>
              </div>
              <h3>Onion Routing</h3>
              <p>
                Messages traverse multiple encrypted hops across the mesh,
                making traffic analysis practically impossible.
              </p>
            </div>

            {/* Card 4 */}
            <div className="lp-feat-card">
              <div
                className="lp-feat-card-icon"
                style={{ background: "rgba(70,71,211,0.08)" }}
              >
                <span
                  className="msym"
                  style={{ color: "#3939c7", fontSize: 22 }}
                >
                  hub
                </span>
              </div>
              <h3>Distributed Nodes</h3>
              <p>
                No single point of failure. The network lives across thousands
                of peers — resilient, decentralized, unstoppable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="lp-section lp-workflow" id="security">
        <div className="lp-workflow-inner">
          <div className="lp-workflow-text">
            <p className="lp-section-tag" style={{ marginBottom: 16 }}>
              The Workflow
            </p>
            <h2>
              Messaging that
              <br />
              <em>flows</em> with you.
            </h2>
            <p>
              We don't route through servers; we route through trust. Every
              message takes the fastest, safest path across the mesh — encrypted
              at every hop, readable only at its destination.
            </p>
            <div className="lp-workflow-pills">
              <div className="lp-workflow-pill">
                <div
                  className="lp-workflow-pill-dot"
                  style={{ background: "rgba(70,71,211,0.08)" }}
                >
                  <span
                    className="msym"
                    style={{ color: "#4647d3", fontSize: 16 }}
                  >
                    speed
                  </span>
                </div>
                <span
                  className="txt"
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  Zero Latency
                </span>
              </div>
              <div className="lp-workflow-pill">
                <div
                  className="lp-workflow-pill-dot"
                  style={{ background: "rgba(184,4,56,0.08)" }}
                >
                  <span
                    className="msym"
                    style={{ color: "#b80438", fontSize: 16 }}
                  >
                    visibility_off
                  </span>
                </div>
                <span
                  className="txt"
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                  }}
                >
                  Metadata Free
                </span>
              </div>
            </div>
          </div>

          <div className="lp-workflow-visual">
            {/* Code card */}
            <div
              className="lp-wv-card"
              style={{
                top: 40,
                right: 16,
                width: 300,
                padding: 24,
                background: "#fff",
                border: "1px solid rgba(171,173,175,0.1)",
                transform: "rotate(3deg)",
                zIndex: 3,
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "rgba(248,113,113,0.3)",
                  }}
                />
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "rgba(251,191,36,0.3)",
                  }}
                />
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "rgba(52,211,153,0.3)",
                  }}
                />
              </div>
              <code
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  display: "block",
                  lineHeight: 1.7,
                  color: "#595c5e",
                }}
              >
                <span style={{ color: "#4647d3" }}>const</span> msg = peer.
                <span style={{ color: "#a20030" }}>send</span>({"{"})<br />
                &nbsp;&nbsp;
                <span style={{ color: "#595c5e", fontStyle: "italic" }}>
                  // Encrypting…
                </span>
                <br />
                &nbsp;&nbsp;to:{" "}
                <span style={{ color: "#006947" }}>"@alice"</span>,<br />
                &nbsp;&nbsp;cipher:{" "}
                <span style={{ color: "#4647d3" }}>AES_256_GCM</span>
                <br />
                {"}"});
              </code>
            </div>

            {/* Alert card */}
            <div
              className="lp-wv-card"
              style={{
                top: 128,
                left: 16,
                width: 300,
                padding: 28,
                background: "var(--primary)",
                color: "var(--on-primary)",
                transform: "rotate(-5deg)",
                zIndex: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    opacity: 0.8,
                  }}
                >
                  Mesh Alert
                </span>
                <span
                  className="msym"
                  style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                Message Delivered
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  opacity: 0.8,
                  fontFamily: "Plus Jakarta Sans",
                }}
              >
                E2E encrypted via 4-hop path · 38ms
              </div>
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    opacity: 0.6,
                  }}
                >
                  Status: Protected
                </span>
                <span
                  className="msym"
                  style={{ fontSize: 16, animation: "lp-pulse 2s infinite" }}
                >
                  lock
                </span>
              </div>
            </div>

            {/* Ghost card */}
            <div
              className="lp-wv-card"
              style={{
                bottom: 40,
                right: 40,
                width: 280,
                padding: 28,
                background: "var(--surface-container-high)",
                opacity: 0.35,
                filter: "blur(1px)",
                transform: "rotate(2deg)",
                zIndex: 2,
              }}
            >
              {[{ w: "50%" }, { w: "75%" }, { w: "25%" }].map((s, i) => (
                <div
                  key={i}
                  style={{
                    height: 14,
                    width: s.w,
                    background: "rgba(44,47,49,0.1)",
                    borderRadius: 4,
                    marginBottom: 14,
                  }}
                />
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                inset: 0,
                margin: "auto",
                width: 200,
                height: 200,
                background: "rgba(70,71,211,0.08)",
                borderRadius: "50%",
                filter: "blur(60px)",
                zIndex: 1,
                animation: "lp-pulse 4s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta" id="cta">
        <div className="lp-cta-inner">
          <div className="lp-cta-orb-1" />
          <div className="lp-cta-orb-2" />
          <h2>
            Ready to
            <br />
            <span className="iridescent">Connect?</span>
          </h2>
          <p>
            Join the mesh. Your messages belong to you — not to servers, not to
            corporations. No compromises.
          </p>
          <div className="lp-cta-actions">
            <button className="lp-cta-btn" onClick={() => navigate("/signup")}>
              Create Your Node{" "}
              <span className="msym" style={{ fontSize: 20 }}>
                arrow_forward
              </span>
            </button>
            <a className="lp-cta-link" href="#features">
              See How It Works{" "}
              <span className="msym" style={{ fontSize: 16 }}>
                chevron_right
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-watermark">Mesh</div>
        <div className="lp-footer-inner">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand">MeshChat</div>
              <p className="lp-footer-desc">
                Pioneering the boundary between privacy and connection.
                Distributed by design, secure by nature.
              </p>
              <div className="lp-footer-socials">
                <a className="lp-footer-social" href="#">
                  <span className="msym" style={{ fontSize: 16 }}>
                    public
                  </span>
                </a>
                <a className="lp-footer-social" href="#">
                  <span className="msym" style={{ fontSize: 16 }}>
                    code
                  </span>
                </a>
              </div>
            </div>
            <div className="lp-footer-links-grid">
              <div className="lp-footer-col">
                <span className="lp-footer-col-title">Platform</span>
                <ul>
                  <li>
                    <a href="#">Messaging</a>
                  </li>
                  <li>
                    <a href="#">Channels</a>
                  </li>
                  <li>
                    <a href="#">Integration</a>
                  </li>
                </ul>
              </div>
              <div className="lp-footer-col">
                <span className="lp-footer-col-title">Support</span>
                <ul>
                  <li>
                    <a href="#">Mission</a>
                  </li>
                  <li>
                    <a href="#">Careers</a>
                  </li>
                  <li>
                    <a href="#">Newsroom</a>
                  </li>
                </ul>
              </div>
              <div className="lp-footer-col">
                <span className="lp-footer-col-title">Legal</span>
                <ul>
                  <li>
                    <a href="#">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="#">Terms of Service</a>
                  </li>
                  <li>
                    <a href="#">Compliance</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p className="lp-footer-copy">
              © 2024 MeshChat. Engineered across the mesh.
            </p>
            <div className="lp-footer-status">
              <div className="lp-status-dot" />
              Network Status: Nominal
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Landing;
