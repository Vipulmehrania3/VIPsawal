:root {
    --primary: #06b6d4;
    --primary-dark: #0891b2;
    --bg: #0f172a;
    --card: #1e293b;
    --text: #f8fafc;
    --text-muted: #94a3b8;
    --border: #334155;
    --success: #10b981;
    --danger: #ef4444;
    --vip-grad: linear-gradient(135deg, #f59e0b, #d97706);
}

html.light {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --text-muted: #64748b;
    --border: #e2e8f0;
}

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
body { background: #000; display: flex; justify-content: center; height: 100vh; overflow: hidden; }

/* Mobile Frame */
.app-container {
    width: 100%; max-width: 450px; height: 100%; background: var(--bg);
    position: relative; overflow: hidden; display: flex; flex-direction: column;
    color: var(--text); transition: background 0.3s;
}

/* Nav */
.app-nav {
    padding: 1rem; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid var(--border); background: var(--bg); z-index: 10;
}
.nav-logo { display: flex; align-items: center; gap: 8px; font-family: 'Outfit'; font-weight: 700; font-size: 1.2rem; cursor: pointer; }
.logo-icon { width: 32px; height: 32px; background: var(--primary); color: white; display: grid; place-items: center; border-radius: 8px; }
.icon-btn, .text-btn { background: none; border: 1px solid var(--border); color: var(--text); padding: 8px; border-radius: 8px; cursor: pointer; }
.icon-btn.primary { background: var(--primary); border-color: var(--primary); color: white; }

/* Screens */
.app-screen {
    position: absolute; top: 65px; bottom: 0; left: 0; right: 0;
    background: var(--bg); transform: translateX(100%); transition: transform 0.3s ease;
    display: flex; flex-direction: column;
}
.app-screen.active { transform: translateX(0); }

.content-scroll { flex: 1; overflow-y: auto; padding-bottom: 80px; }
.padded { padding: 1.5rem; }

/* Home */
.hero-section { padding: 2rem 1.5rem; text-align: center; }
.hero-section h1 { font-family: 'Outfit'; font-size: 3rem; background: linear-gradient(to right, var(--primary), #3b82f6); -webkit-background-clip: text; color: transparent; }
.subject-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 0 1.5rem; }
.subject-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px;
    padding: 1.5rem; cursor: pointer; transition: 0.2s;
}
.subject-card:hover { border-color: var(--primary); transform: translateY(-3px); }
.subject-card i { font-size: 2rem; color: var(--primary); margin-bottom: 10px; display: block; }
.subject-card h3 { font-size: 1.1rem; }

.vip-banner {
    margin: 1.5rem; background: var(--vip-grad); padding: 1.2rem; border-radius: 16px;
    display: flex; align-items: center; gap: 1rem; color: white; cursor: pointer;
}
.vip-icon { font-size: 1.5rem; background: rgba(255,255,255,0.2); width: 40px; height: 40px; display: grid; place-items: center; border-radius: 50%; }

/* Lists & Selection */
.screen-header { padding: 1rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); }
.back-btn { background: none; border: none; color: var(--text); font-size: 1.2rem; cursor: pointer; }
.list-container { padding: 1rem; }
.chapter-item {
    background: var(--card); border: 1px solid var(--border); padding: 1rem;
    border-radius: 12px; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center;
}
.chapter-left { display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; }
.checkbox { width: 20px; height: 20px; border: 2px solid var(--text-muted); border-radius: 4px; display: grid; place-items: center; }
.chapter-item.selected { border-color: var(--primary); background: rgba(6, 182, 212, 0.1); }
.chapter-item.selected .checkbox { background: var(--primary); border-color: var(--primary); }
.chapter-item.selected .checkbox i { color: white; font-size: 0.7rem; }
.topic-btn { background: var(--border); color: var(--text); border: none; padding: 5px 10px; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }

/* Sidebar */
.topic-sidebar {
    position: absolute; top: 0; right: 0; width: 85%; height: 100%; background: var(--card);
    z-index: 50; transform: translateX(100%); transition: transform 0.3s;
    border-left: 1px solid var(--border); display: flex; flex-direction: column;
}
.topic-sidebar.open { transform: translateX(0); }
.sidebar-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
.topic-list { padding: 1.5rem; overflow-y: auto; flex: 1; }
.topic-item { display: flex; align-items: center; gap: 10px; padding: 10px; cursor: pointer; }
.topic-item span { color: var(--text-muted); }
.topic-item.selected span { color: var(--text); font-weight: 600; }

/* Quiz UI */
.setting-card { background: var(--card); padding: 1rem; border-radius: 12px; border: 1px solid var(--border); margin-bottom: 1rem; }
.full-width { width: 100%; }
.btn { padding: 1rem; border-radius: 12px; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; }
.btn-primary { background: var(--primary); color: white; }
.btn-secondary { background: var(--card); border: 1px solid var(--border); color: var(--text); }
.screen-footer { padding: 1rem; border-top: 1px solid var(--border); background: var(--bg); }

.progress-bar { height: 4px; background: var(--border); width: 100%; }
#progress-fill { height: 100%; background: var(--primary); width: 0%; transition: width 0.3s; }
.question-text { font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; }
.options-container button {
    width: 100%; padding: 1rem; text-align: left; background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; margin-bottom: 0.8rem; color: var(--text); cursor: pointer; transition: 0.2s;
}
.options-container button.selected { border-color: var(--primary); background: rgba(6, 182, 212, 0.1); }

/* Results */
.result-body { text-align: center; }
.trophy-img { width: 100px; margin-bottom: 1rem; }
#result-score { font-size: 3rem; font-family: 'Outfit'; font-weight: 700; color: var(--primary); }
.stats-row { display: flex; gap: 1rem; margin: 2rem 0; }
.stat-box { flex: 1; background: var(--card); padding: 1rem; border-radius: 12px; border: 1px solid var(--border); }
.stat-val { display: block; font-size: 1.5rem; font-weight: 700; }
.stat-val.correct { color: var(--success); }
.stat-val.wrong { color: var(--danger); }
.review-item { text-align: left; background: var(--card); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border); }
.review-item h4 { margin-bottom: 0.5rem; color: var(--text); }
.review-item .ans { font-size: 0.9rem; margin-bottom: 0.2rem; }
.review-item .exp { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem; font-style: italic; }

/* Chat */
.chat-interface { display: flex; flex-direction: column; gap: 1rem; }
.chat-msg { padding: 10px 15px; border-radius: 12px; max-width: 80%; font-size: 0.95rem; line-height: 1.4; }
.chat-msg.ai { background: var(--card); border: 1px solid var(--border); align-self: flex-start; }
.chat-msg.user { background: var(--primary); color: white; align-self: flex-end; }
.chat-footer { display: flex; gap: 10px; align-items: center; }
#doubt-input { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--card); color: var(--text); }
.disabled { opacity: 0.5; cursor: not-allowed; }

/* Loader */
.loader { position: absolute; inset: 0; background: rgba(15,23,42,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; opacity: 0; pointer-events: none; transition: 0.3s; }
.loader.active { opacity: 1; pointer-events: auto; }
.spinner { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
