import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: "",
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/signup", form);
      alert(res.data.message);
      navigate("/page");
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .su-root {
          min-height: 100vh;
          width: 100vw;
          background: #f5f7f9;
          display: flex;
          flex-direction: column;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #2c2f31;
          overflow-x: hidden;
          position: relative;
        }

        /* Aura orbs */
        .su-orb {
          position: fixed;
          border-radius: 9999px;
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.4;
          z-index: 0;
        }
        .su-orb-1 { top: -10%; left: -5%; width: 50vw; height: 50vw; background: #9396ff; }
        .su-orb-2 { bottom: -10%; right: -5%; width: 40vw; height: 40vw; background: #ffc2c5; }
        .su-orb-3 { top: 20%; right: 10%; width: 30vw; height: 30vw; background: #69f6b8; opacity: 0.15; }

        /* Layout */
        .su-main {
          flex: 1;
          display: flex;
          flex-direction: row;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        /* Left panel */
        .su-left {
          display: none;
          width: 42%;
          background: rgba(238, 241, 243, 0.6);
          flex-direction: column;
          justify-content: center;
          padding: 64px 56px;
          overflow: hidden;
          position: relative;
        }
        @media (min-width: 768px) { .su-left { display: flex; } }

        .su-left-gradient {
          position: absolute;
          right: 0; top: 0;
          height: 100%;
          width: 96px;
          background: linear-gradient(to right, transparent, rgba(245,247,249,0.5));
          pointer-events: none;
        }

        .su-brand {
          font-family: 'Space Grotesk', sans-serif;
          color: #4647d3;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.03em;
          margin-bottom: 48px;
        }

        .su-left-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(40px, 5vw, 56px);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          color: #2c2f31;
          margin-bottom: 24px;
        }
        .su-left-title span {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-weight: 300;
          color: #4647d3;
        }

        .su-left-desc {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 18px;
          color: #595c5e;
          max-width: 340px;
          line-height: 1.6;
          margin-bottom: 48px;
        }

        /* Agent grid */
        .agent-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 300px;
        }
        .agent-card {
          padding: 20px;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(16px);
          border-radius: 16px;
          border: 1px solid rgba(171,173,175,0.1);
          box-shadow: 0 20px 40px rgba(70,71,211,0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1);
          cursor: default;
        }
        .agent-card:hover { transform: scale(1.05); }
        .agent-card:nth-child(2) { margin-top: 32px; }
        .agent-card:nth-child(3) { margin-top: -16px; }
        .agent-card:nth-child(4) { margin-top: 16px; }

        .agent-icon {
          font-family: 'Material Symbols Outlined';
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: normal;
          font-style: normal;
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .agent-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #595c5e;
        }

        /* Right panel */
        .su-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 24px;
          background: rgba(255,255,255,0.4);
          backdrop-filter: blur(12px);
        }

        .su-form-wrap {
          width: 100%;
          max-width: 440px;
        }

        .su-mobile-brand {
          font-family: 'Space Grotesk', sans-serif;
          color: #4647d3;
          font-size: 22px;
          font-weight: 700;
          text-align: center;
          margin-bottom: 32px;
        }
        @media (min-width: 768px) { .su-mobile-brand { display: none; } }

        .su-form-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #2c2f31;
          margin-bottom: 6px;
        }
        .su-form-sub {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 16px;
          color: #595c5e;
          margin-bottom: 40px;
        }

        /* Fields */
        .su-field { margin-bottom: 24px; }
        .su-label {
          display: block;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #2c2f31;
          margin-bottom: 8px;
          margin-left: 4px;
        }
        .su-field-wrap { position: relative; }
        .su-field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #abadaf;
          font-size: 20px;
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          transition: color 0.3s;
        }
        .su-field-wrap:focus-within .su-field-icon { color: #4647d3; }

        .su-input {
          width: 100%;
          height: 52px;
          padding: 0 16px 0 44px;
          background: #eef1f3;
          border: none;
          border-radius: 12px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          color: #2c2f31;
          outline: none;
          transition: all 0.3s;
        }
        .su-input::placeholder { color: rgba(116,119,121,0.5); }
        .su-input:focus {
          box-shadow: 0 0 0 2px rgba(70,71,211,0.2);
          background: #d9dde0;
        }

        .su-hint {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #747779;
        }
        .su-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          margin-left: 4px;
          margin-right: 4px;
        }

        .su-btn {
          width: 100%;
          height: 56px;
          background: linear-gradient(to right, #4647d3, #3939c7);
          color: #f4f1ff;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 16px;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(70,71,211,0.2);
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
          margin-top: 8px;
        }
        .su-btn:hover { transform: scale(1.02); box-shadow: 0 12px 32px rgba(70,71,211,0.35); }
        .su-btn:active { transform: scale(0.98); }

        .su-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 32px 0 24px;
        }
        .su-divider-line { flex: 1; height: 1px; background: rgba(171,173,175,0.2); }
        .su-divider-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: #747779;
          white-space: nowrap;
        }

        .su-signin-row {
          text-align: center;
          margin-top: 24px;
        }
        .su-signin-row p {
          font-family: 'Newsreader', serif;
          font-style: italic;
          color: #595c5e;
          font-size: 15px;
        }
        .su-signin-btn {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-style: normal;
          font-weight: 700;
          color: #b80438;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 4px;
          margin-left: 4px;
          font-size: 15px;
          transition: color 0.3s;
        }
        .su-signin-btn:hover { color: #4647d3; }

        /* Footer */
        .su-footer {
          position: relative;
          z-index: 1;
          width: 100%;
          padding: 32px 48px;
          border-top: 1px solid rgba(203,213,225,0.15);
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        @media (min-width: 768px) {
          .su-footer { flex-direction: row; justify-content: space-between; }
        }
        .su-footer-copy {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 13px;
          color: #94a3b8;
        }
        .su-footer-links { display: flex; gap: 32px; }
        .su-footer-link {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 13px;
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.3s;
          opacity: 0.8;
        }
        .su-footer-link:hover { color: #fb7185; opacity: 1; }
      `}</style>

      <div className="su-root">
        {/* Aura orbs */}
        <div className="su-orb su-orb-1" />
        <div className="su-orb su-orb-2" />
        <div className="su-orb su-orb-3" />

        <main className="su-main">
          {/* Left Panel */}
          <section className="su-left">
            <div style={{ position: "relative", zIndex: 1 }}>
              <div className="su-brand">MeshChat</div>
              <h1 className="su-left-title">
                Join the
                <br />
                <span>Network</span>
              </h1>
              <p className="su-left-desc">
                A decentralized chat built for privacy. Your messages travel
                peer-to-peer — no servers, no surveillance, no compromise.
              </p>
              {/* Node grid */}
              <div className="agent-grid">
                <div className="agent-card">
                  <span className="agent-icon" style={{ color: "#4647d3" }}>
                    hub
                  </span>
                  <span className="agent-label">P2P Mesh</span>
                </div>
                <div className="agent-card">
                  <span className="agent-icon" style={{ color: "#b80438" }}>
                    lock
                  </span>
                  <span className="agent-label">E2E Encrypt</span>
                </div>
                <div className="agent-card">
                  <span className="agent-icon" style={{ color: "#006947" }}>
                    cell_tower
                  </span>
                  <span className="agent-label">No Server</span>
                </div>
                <div className="agent-card">
                  <span className="agent-icon" style={{ color: "#3939c7" }}>
                    shield_person
                  </span>
                  <span className="agent-label">Anonymous</span>
                </div>
              </div>
            </div>
            <div className="su-left-gradient" />
          </section>

          {/* Right Panel */}
          <section className="su-right">
            <div className="su-form-wrap">
              <div className="su-mobile-brand">MeshChat</div>

              <h3 className="su-form-title">Create your node</h3>
              <p className="su-form-sub">
                Claim your identity on the decentralized mesh.
              </p>

              <form onSubmit={handleSubmit}>
                {/* Phone */}
                <div className="su-field">
                  <label className="su-label" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="su-field-wrap">
                    <span className="su-field-icon material-symbols-outlined">
                      phone
                    </span>
                    <input
                      className="su-input"
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="su-field">
                  <label className="su-label" htmlFor="username">
                    Username
                  </label>
                  <div className="su-field-wrap">
                    <span className="su-field-icon material-symbols-outlined">
                      alternate_email
                    </span>
                    <input
                      className="su-input"
                      id="username"
                      type="text"
                      placeholder="your_handle"
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="su-field">
                  <div className="su-label-row">
                    <label
                      className="su-label"
                      htmlFor="password"
                      style={{ margin: 0 }}
                    >
                      Password
                    </label>
                    <span className="su-hint">Min. 8 characters</span>
                  </div>
                  <div className="su-field-wrap">
                    <span className="su-field-icon material-symbols-outlined">
                      lock_open
                    </span>
                    <input
                      className="su-input"
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button className="su-btn" type="submit">
                  Join the Mesh
                </button>
              </form>

              <div className="su-divider">
                <div className="su-divider-line" />
                <span className="su-divider-text">Already have a node?</span>
                <div className="su-divider-line" />
              </div>

              <div className="su-signin-row">
                <p>
                  Already in the mesh?
                  <button
                    className="su-signin-btn"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="su-footer">
          <span className="su-footer-copy">
            © 2024 MeshChat. All rights reserved.
          </span>
          <div className="su-footer-links">
            <a className="su-footer-link" href="#">
              Privacy Policy
            </a>
            <a className="su-footer-link" href="#">
              Terms of Service
            </a>
            <a className="su-footer-link" href="#">
              Security Architecture
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Signup;
