import React from 'react';

export default function DesignPage() {
  return (
    <div className="page max-w-[960px] mx-auto py-14 px-10 text-primary bg-navy">
      
      {/* HEADER */}
      <header className="site-header">
        <div className="logo-mark">
          <div className="logo-blob">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <ellipse cx="8" cy="12" rx="6" ry="8" fill="white" opacity={0.9} />
              <ellipse cx="16" cy="12" rx="6" ry="8" fill="white" opacity={0.9} />
            </svg>
          </div>
          <span className="logo-wordmark">TM LABS</span>
        </div>
        <span className="version-pill">Design System v1.0</span>
      </header>

      {/* HERO */}
      <section className="hero">
        <p className="hero-eyebrow">Brand &amp; Component Guidelines</p>
        <h1 className="hero-title">
          Built on<br />
          <span className="grad">TM Labs</span> precision
        </h1>
        <p className="hero-sub">Tokens, type, color, and components for every surface across the TM Labs product suite.</p>
      </section>

      {/* 01 COLOR */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">01</span>
          <span className="section-title">Color</span>
        </div>

        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Primary palette
        </p>
        <div className="colors-grid">
          <div className="swatch">
            <div className="swatch-chip grad-chip" />
            <div className="swatch-info">
              <div className="swatch-name">Brand Gradient</div>
              <div className="swatch-hex">#FF3396 → #6633FF</div>
            </div>
          </div>
          <div className="swatch">
            <div className="swatch-chip pink-chip" />
            <div className="swatch-info">
              <div className="swatch-name">Neon Pink</div>
              <div className="swatch-hex">#FF3396</div>
            </div>
          </div>
          <div className="swatch">
            <div className="swatch-chip purple-chip" />
            <div className="swatch-info">
              <div className="swatch-name">Neon Purple</div>
              <div className="swatch-hex">#6633FF</div>
            </div>
          </div>
          <div className="swatch">
            <div className="swatch-chip navy-chip" />
            <div className="swatch-info">
              <div className="swatch-name">Deep Navy</div>
              <div className="swatch-hex">#0F1B35</div>
            </div>
          </div>
          <div className="swatch">
            <div className="swatch-chip navy2-chip" />
            <div className="swatch-info">
              <div className="swatch-name">Navy 2</div>
              <div className="swatch-hex">#1A2847</div>
            </div>
          </div>
          <div className="swatch">
            <div className="swatch-chip mid-chip" />
            <div className="swatch-info">
              <div className="swatch-name">Mid Navy</div>
              <div className="swatch-hex">#1E2D50</div>
            </div>
          </div>
          <div className="swatch">
            <div className="swatch-chip s1-chip" />
            <div className="swatch-info">
              <div className="swatch-name">Surface 1</div>
              <div className="swatch-hex">#1A2440</div>
            </div>
          </div>
          <div className="swatch">
            <div className="swatch-chip s2-chip" />
            <div className="swatch-info">
              <div className="swatch-name">Surface 2</div>
              <div className="swatch-hex">#202C4A</div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', marginTop: '8px' }}>
          Semantic / status colors
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--surface-1)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>Success</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Completed, done, active tasks</span>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>#22C55E</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>Warning / At Risk</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Spillovers, at-risk projects</span>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>#F59E0B</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--surface-1)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>Danger / Blocked</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Blockers, overdue, errors</span>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>#EF4444</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#8A9CC8', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>Secondary text</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Supporting copy, captions</span>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>#8A9CC8</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--surface-1)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#4A5A82', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>Muted / Disabled</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Placeholders, disabled states</span>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>#4A5A82</span>
          </div>
        </div>
      </section>

      {/* 02 GRADIENTS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">02</span>
          <span className="section-title">Gradients</span>
        </div>
        <div className="two-col">
          <div>
            <div className="grad-box g1" style={{ marginBottom: '8px' }}>135° — primary use</div>
            <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>linear-gradient(135deg, #FF3396, #6633FF)</code>
          </div>
          <div>
            <div className="grad-box g2" style={{ marginBottom: '8px' }}>90° — horizontal</div>
            <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>linear-gradient(90deg, #FF3396, #6633FF)</code>
          </div>
          <div>
            <div className="grad-box g3" style={{ marginBottom: '8px' }}>180° — vertical</div>
            <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>linear-gradient(180deg, #FF3396, #6633FF)</code>
          </div>
          <div>
            <div className="grad-box g4" style={{ marginBottom: '8px' }}>Dark surface</div>
            <code style={{ fontSize: '11px', color: 'var(--text-muted)' }}>linear-gradient(135deg, #0F1B35, #1E2D50)</code>
          </div>
        </div>
      </section>

      {/* 03 TYPOGRAPHY */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">03</span>
          <span className="section-title">Typography</span>
        </div>
        <div className="two-col" style={{ marginBottom: '24px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Display &amp; Headings
            </span>
            <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              IBM Plex Sans
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Weights: 400 · 500 · 600 · 700</div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Body &amp; UI
            </span>
            <div style={{ fontFamily: "'Geist',sans-serif", fontSize: '24px', fontWeight: 400, color: 'var(--text-primary)' }}>
              Geist
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Weights: 300 · 400 · 500 · 600</div>
          </div>
        </div>
        <div className="type-table">
          <div className="type-row">
            <div><div className="t-display">Accelerate growth</div></div>
            <div className="type-meta">
              <div className="type-token">display</div>
              <div className="type-spec">IBM Plex Sans · 44px · 700 · −0.03em</div>
            </div>
          </div>
          <div className="type-row">
            <div><div className="t-h1">Project Management Platform</div></div>
            <div className="type-meta">
              <div className="type-token">heading-1</div>
              <div className="type-spec">IBM Plex Sans · 30px · 600 · −0.02em</div>
            </div>
          </div>
          <div className="type-row">
            <div><div className="t-h2">Team Performance Overview</div></div>
            <div className="type-meta">
              <div className="type-token">heading-2</div>
              <div className="type-spec">IBM Plex Sans · 22px · 600 · −0.01em</div>
            </div>
          </div>
          <div className="type-row">
            <div><div className="t-h3">Active Projects</div></div>
            <div className="type-meta">
              <div className="type-token">heading-3</div>
              <div className="type-spec">IBM Plex Sans · 17px · 600</div>
            </div>
          </div>
          <div className="type-row">
            <div>
              <div className="t-body-lg">Track delivery speed, blockers, and workload across all active projects in real time.</div>
            </div>
            <div className="type-meta">
              <div className="type-token">body-lg</div>
              <div className="type-spec">Geist · 16px · 400 · 1.6</div>
            </div>
          </div>
          <div className="type-row">
            <div>
              <div className="t-body">Tasks completed this week, monthly trends, and overdue items by assignee.</div>
            </div>
            <div className="type-meta">
              <div className="type-token">body</div>
              <div className="type-spec">Geist · 14px · 400 · 1.6</div>
            </div>
          </div>
          <div className="type-row">
            <div>
              <div className="t-caption">Last updated 3 minutes ago · 14 tasks synced</div>
            </div>
            <div className="type-meta">
              <div className="type-token">caption</div>
              <div className="type-spec">Geist · 12px · 400 · 1.5</div>
            </div>
          </div>
          <div className="type-row">
            <div><div className="t-overline">Section label</div></div>
            <div className="type-meta">
              <div className="type-token">overline</div>
              <div className="type-spec">Geist · 11px · 600 · 0.14em · UPPER</div>
            </div>
          </div>
          <div className="type-row">
            <div><div className="t-code">task.status === 'blocked'</div></div>
            <div className="type-meta">
              <div className="type-token">mono</div>
              <div className="type-spec">monospace · 13px · on pink tint</div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 BUTTONS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">04</span>
          <span className="section-title">Buttons</span>
        </div>
        <div className="card full">
          <p className="comp-label">Variants</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <button className="btn btn-primary">Create task</button>
            <button className="btn btn-secondary">Export report</button>
            <button className="btn btn-ghost">View details</button>
            <button className="btn btn-danger">Delete project</button>
          </div>
          <p className="comp-label">Small</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
            <button className="btn btn-primary btn-sm">New task</button>
            <button className="btn btn-secondary btn-sm">Filter</button>
            <button className="btn btn-ghost btn-sm">Cancel</button>
            <button className="btn btn-danger btn-sm">Remove</button>
          </div>
          <p className="comp-label">Icon buttons</p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary" style={{ width: '36px', height: '36px', padding: 0, fontSize: '18px', borderRadius: 'var(--radius)' }}>+</button>
            <button className="btn btn-icn" title="Grid view">⊞</button>
            <button className="btn btn-icn" title="Download">↓</button>
            <button className="btn btn-icn" title="Refresh">⟳</button>
            <button className="btn btn-icn" title="Settings">⚙</button>
          </div>
        </div>
      </section>

      {/* 05 BADGES */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">05</span>
          <span className="section-title">Badges &amp; Tags</span>
        </div>
        <div className="card full">
          <p className="comp-label">Status</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
            <span className="badge b-green">Completed</span>
            <span className="badge b-purple">In Progress</span>
            <span className="badge b-amber">At Risk</span>
            <span className="badge b-red">Blocked</span>
            <span className="badge b-pink">Urgent</span>
            <span className="badge b-grey">Backlog</span>
          </div>
          <p className="comp-label">Priority</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span className="badge b-red b-no-dot" style={{ fontSize: '10px' }}>⬆ Urgent</span>
            <span className="badge b-pink b-no-dot" style={{ fontSize: '10px' }}>↑ High</span>
            <span className="badge b-purple b-no-dot" style={{ fontSize: '10px' }}>→ Normal</span>
            <span className="badge b-grey b-no-dot" style={{ fontSize: '10px' }}>↓ Low</span>
          </div>
        </div>
      </section>

      {/* 06 FORMS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">06</span>
          <span className="section-title">Form Elements</span>
        </div>
        <div className="two-col">
          <div className="card">
            <p className="comp-label">Text inputs</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Task name</label>
                <input className="input" placeholder="e.g. Design onboarding flow" />
                <span className="input-hint">Be specific to help your team</span>
              </div>
              <div>
                <label className="input-label">Due date</label>
                <input className="input input-error" defaultValue="invalid-date" />
                <span className="input-hint err">Enter a valid date (MM/DD/YYYY)</span>
              </div>
            </div>
          </div>
          <div className="card">
            <p className="comp-label">Select &amp; textarea</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Assignee</label>
                <select className="select" defaultValue="Rossie — Product Manager">
                  <option>Rossie — Product Manager</option>
                  <option>Emmanuel — Developer</option>
                  <option>Raphael — Designer</option>
                </select>
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea className="input" rows={3} placeholder="What needs to be done?" style={{ resize: 'vertical', lineHeight: 1.5 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 07 CARDS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">07</span>
          <span className="section-title">Cards</span>
        </div>
        <div className="two-col">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="card-title">Getly Dashboard</div>
              <span className="badge b-green" style={{ fontSize: '10px' }}>On Track</span>
            </div>
            <div className="card-sub">Retention and acquisition metrics for the Getly product suite. 12 of 14 tasks complete.</div>
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="av-stack">
                <div className="av av-sm av-pink">RE</div>
                <div className="av av-sm av-purple">JS</div>
                <div className="av av-sm av-green">KZ</div>
              </div>
              <div className="prog-bar" style={{ flex: 1 }}>
                <div className="prog-fill" style={{ width: '86%' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>86%</span>
            </div>
          </div>
          <div className="card card-accent">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="card-title">The Hive Platform</div>
              <span className="badge b-amber" style={{ fontSize: '10px' }}>At Risk</span>
            </div>
            <div className="card-sub">AI-powered marketing platform. Investor deck and PRD in final review. 2 blockers active.</div>
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--pink-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="av-stack">
                <div className="av av-sm av-pink">ME</div>
                <div className="av av-sm av-amber">RK</div>
              </div>
              <div className="prog-bar" style={{ flex: 1 }}>
                <div className="prog-fill" style={{ width: '47%' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>47%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 08 KPI */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">08</span>
          <span className="section-title">KPI Cards</span>
        </div>
        <div className="four-col">
          <div className="kpi">
            <div className="kpi-label">Total Tasks</div>
            <div className="kpi-value">148</div>
            <div className="kpi-delta">+12 this week</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Completed</div>
            <div className="kpi-value">94</div>
            <div className="kpi-delta">↑ 63.5% rate</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Blocked</div>
            <div className="kpi-value" style={{ color: '#EF4444' }}>7</div>
            <div className="kpi-delta neg">3 critical</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Spillovers</div>
            <div className="kpi-value" style={{ background: 'linear-gradient(90deg,var(--pink),var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              12
            </div>
            <div className="kpi-delta neg">from last week</div>
          </div>
        </div>
      </section>

      {/* 09 AVATARS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">09</span>
          <span className="section-title">Avatars &amp; Members</span>
        </div>
        <div className="card full">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="av av-lg av-pink">RE</div>
              <div className="av av-md av-purple">JS</div>
              <div className="av av-sm av-green">KZ</div>
            </div>
            <div style={{ width: '1px', height: '44px', background: 'var(--border)' }} />
            <div className="av-stack">
              <div className="av av-md av-pink">RE</div>
              <div className="av av-md av-purple">JS</div>
              <div className="av av-md av-green">KZ</div>
              <div className="av av-md" style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '2px solid var(--navy)', fontSize: '10px' }}>
                +4
              </div>
            </div>
            <div style={{ width: '1px', height: '44px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="av av-sm av-pink">RE</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Rossie</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Product Manager</div>
                </div>
                <span className="badge b-pink b-no-dot" style={{ marginLeft: '8px', fontSize: '10px' }}>PM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="av av-sm av-purple">JU</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>John Uguru</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Developer</div>
                </div>
                <span className="badge b-grey b-no-dot" style={{ marginLeft: '8px', fontSize: '10px' }}>Staff</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 TABS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">10</span>
          <span className="section-title">Tabs &amp; Navigation</span>
        </div>
        <div className="card full">
          <p className="comp-label" style={{ marginBottom: '14px' }}>Dashboard navigation</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="tab-group">
              <button className="tab on">Overview</button>
              <button className="tab">Reporting</button>
              <button className="tab">Team</button>
              <button className="tab">Projects</button>
            </div>
            <div className="tab-group">
              <button className="tab on">List</button>
              <button className="tab">Board</button>
              <button className="tab">Calendar</button>
            </div>
            <div className="tab-group">
              <button className="tab on">Weekly</button>
              <button className="tab">Monthly</button>
              <button className="tab">All Time</button>
            </div>
          </div>
        </div>
      </section>

      {/* 11 PROGRESS & STATUS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">11</span>
          <span className="section-title">Progress &amp; Status</span>
        </div>
        <div className="two-col">
          <div className="card">
            <p className="comp-label">Progress bars</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Getly Dashboard</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>86%</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: '86%' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>The Hive Platform</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>47%</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: '47%' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Confetti App</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>12%</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <p className="comp-label">Task status rows</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Analytics pipeline</span>
                </div>
                <span className="badge b-green b-no-dot" style={{ fontSize: '10px' }}>Done</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-1)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--pink)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Design system tokens</span>
                </div>
                <span className="badge b-purple b-no-dot" style={{ fontSize: '10px' }}>In Progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Stakeholder deck</span>
                </div>
                <span className="badge b-red b-no-dot" style={{ fontSize: '10px' }}>Blocked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface-1)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>API integration</span>
                </div>
                <span className="badge b-amber b-no-dot" style={{ fontSize: '10px' }}>At Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 NOTIFICATIONS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">12</span>
          <span className="section-title">Notifications</span>
        </div>
        <div className="notif">
          <div className="notif-icon" style={{ background: 'var(--pink-soft)', color: 'var(--pink)' }}>⊕</div>
          <div style={{ flex: 1 }}>
            <div className="notif-title">Task assigned to you</div>
            <div className="notif-sub">Rossie assigned you to <strong style={{ color: 'var(--text-primary)' }}>Design system tokens</strong></div>
          </div>
          <span className="notif-time">2m ago</span>
        </div>
        <div className="notif">
          <div className="notif-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>⚠</div>
          <div style={{ flex: 1 }}>
            <div className="notif-title">Task due tomorrow</div>
            <div className="notif-sub"><strong style={{ color: 'var(--text-primary)' }}>API integration spec</strong> is due on Thursday</div>
          </div>
          <span className="notif-time">1h ago</span>
        </div>
        <div className="notif">
          <div className="notif-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>✓</div>
          <div style={{ flex: 1 }}>
            <div className="notif-title">Blocker resolved</div>
            <div className="notif-sub"><strong style={{ color: 'var(--text-primary)' }}>Auth flow</strong> — your waiting task is now unblocked</div>
          </div>
          <span className="notif-time">3h ago</span>
        </div>
      </section>

      {/* 13 MODAL & EMPTY */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">13</span>
          <span className="section-title">Modal &amp; Empty State</span>
        </div>
        <div className="two-col">
          <div className="modal">
            <div className="modal-title">Delete project?</div>
            <div className="modal-body">This will permanently delete <strong style={{ color: 'var(--text-primary)' }}>The Hive</strong> and all its tasks, comments, and attachments. This cannot be undone.</div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm">Cancel</button>
              <button className="btn btn-danger btn-sm">Delete project</button>
            </div>
          </div>
          <div className="empty">
            <div className="empty-icon">⊡</div>
            <div className="empty-title">No tasks yet</div>
            <div className="empty-body">Create your first task to start tracking work across this project.</div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '4px' }}>Create task</button>
          </div>
        </div>
      </section>

      {/* 14 SPACING */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">14</span>
          <span className="section-title">Spacing Scale</span>
        </div>
        <div className="card full">
          <p className="comp-label">Base-4 scale</p>
          <div>
            <div className="sp-row"><div className="sp-box" style={{ width: '4px', height: '18px' }} /><div><span className="sp-name">--space-1</span> <span className="sp-size">4px · icon inner padding</span></div></div>
            <div className="sp-row"><div className="sp-box" style={{ width: '8px', height: '18px' }} /><div><span className="sp-name">--space-2</span> <span className="sp-size">8px · gap between badge and label</span></div></div>
            <div className="sp-row"><div className="sp-box" style={{ width: '12px', height: '18px' }} /><div><span className="sp-name">--space-3</span> <span className="sp-size">12px · card inner gap</span></div></div>
            <div className="sp-row"><div className="sp-box" style={{ width: '16px', height: '18px' }} /><div><span className="sp-name">--space-4</span> <span className="sp-size">16px · section sub-gap</span></div></div>
            <div className="sp-row"><div className="sp-box" style={{ width: '24px', height: '18px' }} /><div><span className="sp-name">--space-6</span> <span className="sp-size">24px · card padding</span></div></div>
            <div className="sp-row"><div className="sp-box" style={{ width: '32px', height: '18px' }} /><div><span className="sp-name">--space-8</span> <span className="sp-size">32px · page gutter</span></div></div>
            <div className="sp-row"><div className="sp-box" style={{ width: '48px', height: '18px' }} /><div><span className="sp-name">--space-12</span> <span className="sp-size">48px · between major sections</span></div></div>
            <div className="sp-row"><div className="sp-box" style={{ width: '64px', height: '18px' }} /><div><span className="sp-name">--space-16</span> <span className="sp-size">64px · hero breathing room</span></div></div>
          </div>
        </div>
      </section>

      {/* 15 RADIUS */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">15</span>
          <span className="section-title">Border Radius</span>
        </div>
        <div className="card full">
          <div className="r-grid">
            <div className="r-item"><div className="r-box" style={{ borderRadius: '4px' }} /><code style={{ fontSize: '10px', color: 'var(--pink)' }}>--r-sm</code><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>4px · tags</span></div>
            <div className="r-item"><div className="r-box" style={{ borderRadius: '8px' }} /><code style={{ fontSize: '10px', color: 'var(--pink)' }}>--r-md</code><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>8px · inputs, btns</span></div>
            <div className="r-item"><div className="r-box" style={{ borderRadius: '12px' }} /><code style={{ fontSize: '10px', color: 'var(--pink)' }}>--r-lg</code><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>12px · cards</span></div>
            <div className="r-item"><div className="r-box" style={{ borderRadius: '16px' }} /><code style={{ fontSize: '10px', color: 'var(--pink)' }}>--r-xl</code><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>16px · modals</span></div>
            <div className="r-item"><div className="r-box" style={{ borderRadius: '100px' }} /><code style={{ fontSize: '10px', color: 'var(--pink)' }}>--r-pill</code><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>100px · badges</span></div>
            <div className="r-item"><div className="r-box" style={{ borderRadius: '50%' }} /><code style={{ fontSize: '10px', color: 'var(--pink)' }}>--r-circle</code><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>50% · avatars</span></div>
          </div>
        </div>
      </section>

      {/* 16 TOKEN REFERENCE */}
      <section className="section">
        <div className="section-header">
          <span className="section-num">16</span>
          <span className="section-title">CSS Token Reference</span>
        </div>
        <div className="two-col">
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Color tokens</p>
            <div className="tok-row"><span className="tok-name">--pink</span><span className="tok-val">#FF3396</span><div className="tok-dot" style={{ background: '#FF3396' }} /></div>
            <div className="tok-row"><span className="tok-name">--purple</span><span className="tok-val">#6633FF</span><div className="tok-dot" style={{ background: '#6633FF' }} /></div>
            <div className="tok-row"><span className="tok-name">--navy</span><span className="tok-val">#0F1B35</span><div className="tok-dot" style={{ background: '#0F1B35', borderColor: 'rgba(255,255,255,0.15)' }} /></div>
            <div className="tok-row"><span className="tok-name">--surface-1</span><span className="tok-val">#1A2440</span><div className="tok-dot" style={{ background: '#1A2440', borderColor: 'rgba(255,255,255,0.15)' }} /></div>
            <div className="tok-row"><span className="tok-name">--surface-2</span><span className="tok-val">#202C4A</span><div className="tok-dot" style={{ background: '#202C4A', borderColor: 'rgba(255,255,255,0.15)' }} /></div>
            <div className="tok-row"><span className="tok-name">--text-primary</span><span className="tok-val">#F0F4FF</span><div className="tok-dot" style={{ background: '#F0F4FF' }} /></div>
            <div className="tok-row"><span className="tok-name">--text-secondary</span><span className="tok-val">#8A9CC8</span><div className="tok-dot" style={{ background: '#8A9CC8' }} /></div>
            <div className="tok-row"><span className="tok-name">--text-muted</span><span className="tok-val">#4A5A82</span><div className="tok-dot" style={{ background: '#4A5A82' }} /></div>
          </div>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Tint &amp; border tokens</p>
            <div className="tok-row"><span className="tok-name">--pink-soft</span><span className="tok-val">FF3396 / 12%</span><div className="tok-dot" style={{ background: 'rgba(255,51,150,0.12)', borderColor: 'rgba(255,51,150,0.3)' }} /></div>
            <div className="tok-row"><span className="tok-name">--purple-soft</span><span className="tok-val">6633FF / 12%</span><div className="tok-dot" style={{ background: 'rgba(102,51,255,0.12)', borderColor: 'rgba(102,51,255,0.3)' }} /></div>
            <div className="tok-row"><span className="tok-name">--pink-border</span><span className="tok-val">FF3396 / 30%</span><div className="tok-dot" style={{ background: 'transparent', border: '2px solid rgba(255,51,150,0.3)' }} /></div>
            <div className="tok-row"><span className="tok-name">--border</span><span className="tok-val">fff / 7%</span><div className="tok-dot" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.07)' }} /></div>
            <div className="tok-row"><span className="tok-name">--border-strong</span><span className="tok-val">fff / 14%</span><div className="tok-dot" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.14)' }} /></div>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', marginTop: '16px' }}>Font tokens</p>
            <div className="tok-row"><span className="tok-name">--font-display</span><span className="tok-val" style={{ fontFamily: "'IBM Plex Sans',sans-serif" }}>IBM Plex Sans</span></div>
            <div className="tok-row"><span className="tok-name">--font-body</span><span className="tok-val" style={{ fontFamily: "'Geist',sans-serif" }}>Geist</span></div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ paddingTop: '32px', marginTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-blob" style={{ width: '26px', height: '26px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <ellipse cx="8" cy="12" rx="6" ry="8" fill="white" opacity={0.9} />
              <ellipse cx="16" cy="12" rx="6" ry="8" fill="white" opacity={0.9} />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>TM LABS</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Design System v1.0 · 2025 · IBM Plex Sans + Geist</span>
      </footer>

    </div>
  );
}
