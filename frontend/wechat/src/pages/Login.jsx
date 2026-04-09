import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://cgq4646h-4000.inc1.devtunnels.ms/login",
        form,
      );
      alert(res.data.message);
      localStorage.setItem("myUsername", form.username);
      navigate("/page");
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .aura-root {
          min-height: 100vh;
          width: 100vw;
          background: #f5f7f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #2c2f31;
        }

        .aura-orb {
          position: fixed;
          pointer-events: none;
          border-radius: 9999px;
          z-index: 0;
        }
        .aura-orb-1 {
          top: -20%;
          left: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, #4647d3 0%, transparent 70%);
          filter: blur(120px);
          opacity: 0.3;
          animation: pulse 4s ease-in-out infinite;
        }
        .aura-orb-2 {
          bottom: -20%;
          right: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, #ffc2c5 0%, transparent 70%);
          filter: blur(120px);
          opacity: 0.2;
          animation: pulse 4s ease-in-out infinite;
          animation-delay: 2s;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.05); }
        }

        .aura-main {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 560px;
          padding: 48px 24px;
        }

        .aura-brand {
          margin-bottom: 48px;
          padding-left: 16px;
        }
        .aura-brand-label {
          font-family: 'Space Grotesk', sans-serif;
          color: #4647d3;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2em;
          margin-bottom: 8px;
        }
        .aura-brand-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(42px, 8vw, 60px);
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #2c2f31;
          line-height: 1;
        }
        .aura-brand-title span {
          font-family: 'Newsreader', serif;
          font-style: italic;
          color: #b80438;
          font-size: 0.7em;
          margin-left: 8px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 16px;
          padding: 56px;
          border: 1px solid rgba(255,255,255,0.4);
          box-shadow: 0 25px 50px rgba(70, 71, 211, 0.05);
          position: relative;
          overflow: hidden;
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 128px; height: 128px;
          background: rgba(70, 71, 211, 0.05);
          border-radius: 9999px;
          transform: translate(50%, -50%);
          filter: blur(20px);
        }
        .glass-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 96px; height: 96px;
          background: rgba(184, 4, 56, 0.05);
          border-radius: 9999px;
          transform: translate(-50%, 50%);
          filter: blur(20px);
        }

        .field-group {
          margin-bottom: 32px;
          position: relative;
          z-index: 1;
        }

        .field-label {
          display: block;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #595c5e;
          margin-bottom: 12px;
          margin-left: 4px;
        }

        .field-wrapper {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #747779;
          font-size: 20px;
          transition: color 0.3s;
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          line-height: 1;
        }
        .field-wrapper:focus-within .field-icon {
          color: #4647d3;
        }

        .aura-input {
          width: 100%;
          height: 56px;
          padding: 0 24px 0 48px;
          background: rgba(238, 241, 243, 0.5);
          border: none;
          border-radius: 12px;
          box-shadow: inset 2px 2px 4px rgba(0,0,0,0.02), inset -2px -2px 4px rgba(255,255,255,0.8);
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 17px;
          color: #2c2f31;
          outline: none;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .aura-input::placeholder {
          color: #abadaf;
        }
        .aura-input:focus {
          box-shadow: 0 0 0 2px rgba(70, 71, 211, 0.2), inset 2px 2px 4px rgba(0,0,0,0.02);
          background: rgba(217, 221, 224, 0.8);
        }

        .field-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          margin-left: 4px;
        }
        .lost-key {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #4647d3;
          text-decoration: none;
          transition: color 0.3s;
        }
        .lost-key:hover { color: #b80438; }

        .submit-btn {
          width: 100%;
          height: 64px;
          background: linear-gradient(to right, #4647d3, #3939c7);
          color: #f4f1ff;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.03em;
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 8px 24px rgba(70, 71, 211, 0.3);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          margin-top: 40px;
          position: relative;
          z-index: 1;
        }
        .submit-btn:hover {
          box-shadow: 0 12px 32px rgba(70, 71, 211, 0.5);
          transform: scale(1.02);
        }
        .submit-btn:active {
          transform: scale(0.98);
        }
        .submit-btn .btn-icon {
          font-family: 'Material Symbols Outlined';
          font-size: 20px;
          transition: transform 0.3s;
        }
        .submit-btn:hover .btn-icon {
          transform: translateX(4px);
        }

        .aura-footer {
          margin-top: 48px;
          text-align: center;
        }
        .aura-footer p {
          font-family: 'Newsreader', serif;
          font-style: italic;
          color: #595c5e;
          font-size: 15px;
        }
        .signup-link {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-style: normal;
          font-weight: 700;
          color: #2c2f31;
          text-decoration: none;
          border-bottom: 2px solid rgba(70, 71, 211, 0.2);
          margin-left: 4px;
          cursor: pointer;
          transition: all 0.3s;
          background: none;
          border-top: none;
          border-left: none;
          border-right: none;
          padding: 0;
          font-size: 15px;
        }
        .signup-link:hover {
          color: #b80438;
          border-bottom-color: #b80438;
        }

        .aura-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding-top: 32px;
        }
        .divider-line {
          height: 1px;
          width: 32px;
          background: rgba(171, 173, 175, 0.3);
        }
        .divider-icons {
          display: flex;
          gap: 16px;
        }
        .divider-icon {
          font-family: 'Material Symbols Outlined';
          color: #abadaf;
          cursor: pointer;
          font-size: 20px;
          transition: color 0.3s;
          font-weight: normal;
          font-style: normal;
        }
        .divider-icon:hover { color: #4647d3; }

        .aura-page-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          padding: 32px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          opacity: 0.6;
          transition: opacity 0.6s;
          z-index: 1;
        }
        .aura-page-footer:hover { opacity: 1; }
        .footer-copy {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 13px;
          color: #64748b;
        }
        .footer-links {
          display: flex;
          gap: 32px;
        }
        .footer-link {
          font-family: 'Newsreader', serif;
          font-style: italic;
          font-size: 13px;
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-link:hover { color: #fb7185; }

        .bleed-art {
          display: none;
          position: fixed;
          top: 25%;
          right: -96px;
          width: 384px;
          height: 384px;
          opacity: 0.1;
          transform: rotate(12deg);
          pointer-events: none;
          z-index: 0;
        }
        @media (min-width: 1024px) { .bleed-art { display: block; } }
        .bleed-art img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
          filter: grayscale(1);
        }

        @media (max-width: 600px) {
          .glass-card { padding: 32px 24px; }
          .aura-page-footer { flex-direction: column; gap: 16px; }
          .footer-links { gap: 16px; }
        }
      `}</style>

      <div className="aura-root">
        {/* Kinetic Aura Orbs */}
        <div className="aura-orb aura-orb-1" />
        <div className="aura-orb aura-orb-2" />

        {/* Main */}
        <main className="aura-main">
          {/* Brand */}
          <div className="aura-brand">
            <p className="aura-brand-label">AURA KINETIC</p>
            <h1 className="aura-brand-title">
              Secure Entry<span>.</span>
            </h1>
          </div>

          {/* Glass Card */}
          <div className="glass-card">
            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="field-group">
                <label className="field-label" htmlFor="username">
                  Identity Vector
                </label>
                <div className="field-wrapper">
                  <span className="field-icon material-symbols-outlined">
                    fingerprint
                  </span>
                  <input
                    className="aura-input"
                    id="username"
                    type="text"
                    placeholder="username"
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <div className="field-row">
                  <label
                    className="field-label"
                    htmlFor="password"
                    style={{ marginBottom: 0 }}
                  >
                    Access Cipher
                  </label>
                  <a className="lost-key" href="#">
                    Lost Key?
                  </a>
                </div>
                <div className="field-wrapper">
                  <span className="field-icon material-symbols-outlined">
                    encrypted
                  </span>
                  <input
                    className="aura-input"
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Submit */}
              <button className="submit-btn" type="submit">
                Enter the Aura
                <span className="btn-icon material-symbols-outlined">
                  arrow_forward_ios
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="aura-footer">
            <p>
              New to the artifact?
              <button
                className="signup-link"
                onClick={() => navigate("/signup")}
              >
                Request Invitation
              </button>
            </p>
            <div className="aura-divider">
              <span className="divider-line" />
              <div className="divider-icons">
                <span className="divider-icon material-symbols-outlined">
                  language
                </span>
                <span className="divider-icon material-symbols-outlined">
                  help
                </span>
              </div>
              <span className="divider-line" />
            </div>
          </div>
        </main>

        {/* Bleed Art */}
        <div className="bleed-art">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwJmRu5o4L8goF3BNHjjzL4CUdLwaTKH8QndZf3JnO_gkmETeor-DvvxT2E3m0A4Mb1zz3IJxDNKqe18-zRkwK3A-Vz5H8WKGNM1nOh3Kl4cjs72T1g3-2O0mMME9oz8OzVAUp-3XWJipJ3j5SO_aWlIbKzWmzjLCEOOB-eNz_SSCN5gQfK2Mhr6qnllizivk4UIizXy3NmUnMM896pJOx4cWOhHcxCaQIZR2gTOR_0FOAFegwoCl3TUJCcylvmgSGmMDMuHNR9fxr"
            alt="Abstract iridescent fluid art"
          />
        </div>

        {/* Page Footer */}
        <footer className="aura-page-footer">
          <span className="footer-copy">
            © 2024 Aura Kinetic Security. All rights reserved.
          </span>
          <div className="footer-links">
            <a className="footer-link" href="#">
              Privacy Policy
            </a>
            <a className="footer-link" href="#">
              Terms of Service
            </a>
            <a className="footer-link" href="#">
              Security Architecture
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Login;
