import Script from "next/script";

export const metadata = {
  title: "Arcade Agents — a control panel for your AI agents, in the notch",
  description:
    "Watch your AI coding agents, approve what they want to do, and jump back — from your MacBook notch. Claude Code, Codex, Grok Build.",
};

export default function Home() {
  return (
    <>
      <nav>
        <div className="wrap nav-in">
          <a className="brand" href="#top">
            <canvas data-icon="cabinet" width="52" height="52"></canvas>
            Arcade&nbsp;Agents
          </a>
          <div className="nav-links">
            <a href="#watch">Watch</a>
            <a href="#features">Features</a>
            <a href="#agents">Agents</a>
            <a href="#faq">FAQ</a>
          </div>
          <a className="btn btn-primary" href="#download">
            Subscribe
          </a>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="wrap">
          <div className="badge-row">
            <span className="badge">macOS 14+ · Apple Silicon</span>
            <span className="badge">Native Swift · no Electron</span>
            <span className="badge">Fully local</span>
          </div>
          <h1 className="hero-title">
            Your agents,
            <br />
            live in the <span className="accent-pink">notch</span>.
          </h1>
          <p className="hero-sub">
            Arcade Agents watches every AI coding agent you run, shows you what
            each one is doing, and lets you approve — or stop — what it wants,
            without leaving your editor.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary btn-lg" href="#download">
              ▼ Download for Mac
            </a>
            <a className="btn btn-ghost btn-lg" href="#watch">
              See it work
            </a>
          </div>
          <p className="hero-note">Claude Code · Codex · Grok Build</p>

          {/* interactive notch demo */}
          <div className="stage" id="watch">
            <div className="island" id="island">
              {/* collapsed layer */}
              <div className="layer layer-collapsed" id="layerCollapsed">
                <div className="ears" id="ears"></div>
                <span className="collapsed-activity" id="collapsedActivity">
                  Running&nbsp;Bash
                </span>
              </div>
              {/* victory lap: the creature runs the island when its agent finishes */}
              <div className="layer layer-lap" id="layerLap">
                <canvas id="lapCanvas" width="1000" height="80"></canvas>
              </div>
              {/* expanded layer */}
              <div className="layer layer-panel" id="layerPanel">
                <div className="panel-head">
                  <span className="lbl">ARCADE&nbsp;AGENTS</span>
                  <span className="count" id="activeCount">
                    3 active
                  </span>
                  <span className="icbtn">⚙</span>
                </div>
                <div id="panelBody"></div>
              </div>
            </div>
            <div className="demo-controls">
              <button id="ctlLive" className="live">
                ● live demo
              </button>
              <button data-jump="working">working</button>
              <button data-jump="approval">needs approval</button>
              <button data-jump="sessions">all agents</button>
              <button data-jump="lap">victory lap</button>
            </div>
            <p className="demo-hint">
              The real thing, at real size — click a state, try Allow or Deny,
              and watch a finished agent take its lap.
            </p>
          </div>
        </div>
      </header>

      {/* value props */}
      <section id="features">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Every agent. One glance.</span>
            <h2>Stop context-switching to babysit a robot.</h2>
            <p>
              From the moment an agent starts to the moment it needs you — all
              in a strip of black the width of your notch.
            </p>
          </div>
          <div className="props">
            <div className="prop reveal">
              <canvas data-sprite="claude:shell:pink" width="64" height="64"></canvas>
              <h3>Watch it work, live</h3>
              <p>
                Not a log of what finished — what&apos;s happening <em>now</em>.
                The notch reads{" "}
                <span className="accent-pink">Running&nbsp;Bash</span> while the
                command is still running, so a long build looks busy instead of
                looking dead.
              </p>
            </div>
            <div className="prop reveal">
              <canvas data-sprite="grok:thinking:pink" width="64" height="64"></canvas>
              <h3>A creature per agent</h3>
              <p>
                Claude, Codex and Grok each get their own body — you can
                tell them apart at a glance. The shape says which tool it&apos;s
                using; the colour says whether you&apos;re needed:{" "}
                <span className="accent-pink">pink working</span>,{" "}
                <span className="accent-green">green done</span>,{" "}
                <span className="accent-yellow">yellow waiting on you</span>.
              </p>
            </div>
            <div className="prop reveal">
              <canvas
                data-sprite="codex:needsApproval:yellow"
                width="64"
                height="64"
              ></canvas>
              <h3>Approve in the notch</h3>
              <p>
                When an agent wants to run a command or edit a file, the island
                opens with the command and two buttons. Allow or deny without
                touching your terminal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* signature features */}
      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Not just a monitor</span>
            <h2>Four things nobody else in the notch does.</h2>
          </div>

          <div className="feat reveal">
            <div className="feat-copy">
              <span className="eyebrow">Risk-scored approvals</span>
              <h3>It reads the command before you do.</h3>
              <p>
                Every request is scored by blast radius.{" "}
                <span className="accent-pink">rm -rf</span> and force-pushes
                light up red with the reason spelled out; a{" "}
                <span className="accent-green">git status</span> barely
                registers. Tick &quot;always allow&quot; on the boring ones and
                it stops asking — but a destructive command can never become a
                rule.
              </p>
            </div>
            <div className="feat-visual">
              <div className="gate-risk">
                <span className="dot" style={{ background: "var(--pink)" }}></span>
                <span className="accent-pink" style={{ fontWeight: 700 }}>
                  DESTRUCTIVE
                </span>
                <span style={{ color: "var(--ink3)" }}>
                  force push — rewrites remote history
                </span>
              </div>
              <div className="gate-cmd">git push --force origin main</div>
              <div className="gate-actions">
                <button className="gate-btn deny">Deny</button>
                <button className="gate-btn allow">Allow</button>
              </div>
            </div>
          </div>

          <div className="feat g reveal">
            <div className="feat-copy">
              <span className="eyebrow">Approve from your phone</span>
              <h3>Start a long run. Walk away.</h3>
              <p>
                The gate already waits up to 24 hours for a human — so answering
                from the kitchen costs nothing. Scan a QR, and pending approvals
                show up on your phone with the same risk read. Local network
                only. No cloud, no account, off by default.
              </p>
            </div>
            <div
              className="feat-visual"
              style={{ display: "flex", gap: "20px", alignItems: "center" }}
            >
              <div className="qr"></div>
              <div>
                <div
                  className="k"
                  style={{
                    fontFamily: "var(--mono)",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Scan with your phone
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11.5px",
                    color: "var(--ink3)",
                    lineHeight: 1.5,
                  }}
                >
                  http://your-mac.local:8787
                  <br />· fresh token each time
                  <br />· never leaves your Wi-Fi
                </div>
              </div>
            </div>
          </div>

          <div className="feat reveal">
            <div className="feat-copy">
              <span className="eyebrow">The audit trail</span>
              <h3>What did it touch while you were gone?</h3>
              <p>
                Every tool call and every decision, written to disk as it
                happens. Come back from lunch and read exactly what ran — or
                hand the CSV to whoever asks whether agents can be trusted
                against production.
              </p>
            </div>
            <div
              className="feat-visual"
              style={{ fontFamily: "var(--mono)", fontSize: "12px" }}
            >
              <div className="card-row">
                <span style={{ color: "var(--ink3)" }}>14:02:11</span>
                <span className="k">Claude Code</span>
                <span className="v accent-green">approved</span>
              </div>
              <div className="card-row">
                <span style={{ color: "var(--ink3)" }}>14:02:44</span>
                <span className="k">Codex</span>
                <span className="v" style={{ color: "var(--ink2)" }}>
                  read
                </span>
              </div>
              <div className="card-row">
                <span style={{ color: "var(--ink3)" }}>14:03:09</span>
                <span className="k">Grok Build</span>
                <span className="v accent-yellow">denied</span>
              </div>
            </div>
          </div>

          <div className="feat y reveal">
            <div className="feat-copy">
              <span className="eyebrow">The scoreboard</span>
              <h3>Which agent is earning its keep?</h3>
              <p>
                Tools run, approvals granted, and a trust score — the share of
                an agent&apos;s requests you actually said yes to. An agent you
                keep denying is one you don&apos;t trust, and now you can see it.
              </p>
            </div>
            <div className="feat-visual scoreboard">
              <div className="row">
                <span className="rank accent-yellow">#1</span>
                <canvas data-sprite="claude:done:green" width="48" height="48"></canvas>
                <div>
                  <div
                    className="k"
                    style={{ fontFamily: "var(--mono)", fontWeight: 700 }}
                  >
                    Claude Code
                  </div>
                  <div
                    className="where"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--ink3)",
                    }}
                  >
                    142 tools · 38 approved
                  </div>
                </div>
                <span className="trust accent-green">96%</span>
              </div>
              <div className="row">
                <span className="rank" style={{ color: "var(--ink3)" }}>
                  #2
                </span>
                <canvas data-sprite="grok:shell:green" width="48" height="48"></canvas>
                <div>
                  <div
                    className="k"
                    style={{ fontFamily: "var(--mono)", fontWeight: 700 }}
                  >
                    Grok Build
                  </div>
                  <div
                    className="where"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--ink3)",
                    }}
                  >
                    88 tools · 20 approved
                  </div>
                </div>
                <span className="trust accent-yellow">74%</span>
              </div>
              <div className="row">
                <span className="rank" style={{ color: "var(--ink3)" }}>
                  #3
                </span>
                <canvas data-sprite="codex:thinking:pink" width="48" height="48"></canvas>
                <div>
                  <div
                    className="k"
                    style={{ fontFamily: "var(--mono)", fontWeight: 700 }}
                  >
                    Codex
                  </div>
                  <div
                    className="where"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--ink3)",
                    }}
                  >
                    51 tools · 9 approved
                  </div>
                </div>
                <span className="trust accent-pink">52%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* the arcade layer */}
      <section>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">The arcade layer</span>
            <h2>It&apos;s a serious tool. It just doesn&apos;t behave like one.</h2>
            <p>
              The safety machinery is real. The way it tells you about it
              isn&apos;t po-faced.
            </p>
          </div>

          <div className="feat reveal">
            <div className="feat-copy">
              <span className="eyebrow">Victory lap</span>
              <h3>Finish a run, take a bow.</h3>
              <p>
                When an agent completes, its creature goes{" "}
                <span className="accent-green">green</span> and runs the length
                of the island — hopping, throwing off pixel sparks. A second and
                a half, then it&apos;s back to being a quiet ear. It&apos;s how
                you catch a finished run out of the corner of your eye instead of
                alt-tabbing to check.
              </p>
            </div>
            <div
              className="feat-visual"
              style={{
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "96px",
                overflow: "hidden",
              }}
            >
              <canvas
                id="lapDemo"
                width="760"
                height="72"
                style={{ width: "100%", height: "66px" }}
              ></canvas>
            </div>
          </div>

          <div className="feat g reveal">
            <div className="feat-copy">
              <span className="eyebrow">Boss fight</span>
              <h3>A destructive command isn&apos;t just another card.</h3>
              <p>
                When something scores{" "}
                <span className="accent-pink">critical</span> — a force push, a
                recursive delete — the island doesn&apos;t quietly ask. The card
                turns into a boss fight, the creature grows, and the reason is
                spelled out in plain English. Denying it is the win, and the
                scoreboard counts it.
              </p>
            </div>
            <div className="feat-visual" style={{ background: "#000" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid rgba(250,135,191,.45)",
                  background: "rgba(250,135,191,.10)",
                  borderRadius: "9px",
                  padding: "9px 13px",
                  marginBottom: "14px",
                }}
              >
                <span
                  className="accent-pink"
                  style={{
                    fontFamily: "var(--mono)",
                    fontWeight: 800,
                    letterSpacing: ".06em",
                  }}
                >
                  ⚠ BOSS FIGHT
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "12px",
                    color: "var(--ink2)",
                  }}
                >
                  destructive
                </span>
              </div>
              <div className="gate-cmd" style={{ marginBottom: 0 }}>
                rm -rf ~/Library/Developer
              </div>
            </div>
          </div>

          <div className="feat reveal">
            <div className="feat-copy">
              <span className="eyebrow">Collision warning</span>
              <h3>Two agents, one repo, no idea about each other.</h3>
              <p>
                Run Claude and Grok in the same project and they will happily
                stomp each other&apos;s edits — neither one knows the other
                exists. Arcade Agents does, and it says so, loudly, before it
                costs you an hour. It also tracks your git worktrees, so you can
                give each agent its own.
              </p>
            </div>
            <div className="feat-visual" style={{ background: "#000" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(250,135,191,.10)",
                  borderRadius: "9px",
                  padding: "10px 13px",
                }}
              >
                <span
                  className="accent-pink"
                  style={{
                    fontFamily: "var(--mono)",
                    fontWeight: 800,
                    fontSize: "12px",
                  }}
                >
                  ⚠ COLLISION
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "12.5px",
                    color: "var(--ink2)",
                  }}
                >
                  two agents editing sparrow
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  marginTop: "16px",
                  alignItems: "center",
                }}
              >
                <canvas data-sprite="claude:shell:pink" width="44" height="44"></canvas>
                <canvas data-sprite="grok:shell:pink" width="44" height="44"></canvas>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11.5px",
                    color: "var(--ink3)",
                  }}
                >
                  both in ~/sparrow
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* agents */}
      <section id="agents">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Zero config</span>
            <h2>Launch it once. It wires up your agents.</h2>
            <p>
              It writes one hook into each agent&apos;s own config — your
              existing hooks preserved, every change backed up first.
            </p>
          </div>
          <div className="agents-grid">
            <div className="agent-card reveal">
              <canvas data-sprite="claude:idle:green" width="64" height="64"></canvas>
              <div className="an">Claude Code</div>
              <div className="as accent-green">watching</div>
            </div>
            <div className="agent-card reveal">
              <canvas data-sprite="codex:idle:green" width="64" height="64"></canvas>
              <div className="an">Codex</div>
              <div className="as accent-green">watching</div>
            </div>
            <div className="agent-card reveal">
              <canvas data-sprite="grok:idle:green" width="64" height="64"></canvas>
              <div className="an">Grok Build</div>
              <div className="as accent-green">watching</div>
            </div>
          </div>
        </div>
      </section>

      {/* download */}
      <section className="download" id="download">
        <div className="wrap">
          <div className="dl-card reveal">
            <canvas data-icon="cabinet" width="152" height="152"></canvas>
            <h2>Put your agents in the notch.</h2>
            <p style={{ color: "var(--ink2)", maxWidth: "400px", margin: "0 auto" }}>
              $4.99 / year · cancel anytime · no account, nothing leaves your
              Mac.
            </p>
            <div
              className="hero-cta"
              style={{ justifyContent: "center", marginTop: "26px" }}
            >
              <a className="btn btn-primary btn-lg" href="/checkout">
                Subscribe — $4.99/yr
              </a>
              <a className="btn btn-ghost btn-lg" href="/ArcadeAgents.dmg">
                ▼ Download for Mac
              </a>
            </div>
            <div className="dl-meta">
              <span>macOS 14+</span>
              <span>Apple Silicon</span>
              <span>Developer ID signed</span>
              <span>&lt; 50MB RAM</span>
            </div>
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">Questions</span>
            <h2>Frequently asked.</h2>
          </div>
          <div className="faq">
            <details className="reveal">
              <summary>Which agents does it support?</summary>
              <p>
                Claude Code, Codex and Grok Build today, with real approvals and
                live status. Each one speaks a different
                hook dialect, and Arcade Agents translates all of them, so an
                approval genuinely blocks the agent until you decide.
              </p>
            </details>
            <details className="reveal">
              <summary>Why does Grok ask about every single command?</summary>
              <p>
                Because it has to. Grok exposes only one place to intercept a
                tool call, so every call passes through the gate — where Claude
                and Codex have a dedicated approval event and everything else
                flows straight through. Set <em>Auto-approve read-only</em> in
                Settings and the boring ones stop asking; teach it a rule and
                they stop for good.
              </p>
            </details>
            <details className="reveal">
              <summary>Does anything leave my Mac?</summary>
              <p>
                No. There&apos;s no cloud, no account, and no telemetry. Agents
                talk to the app over a local socket. Phone approval, when you
                turn it on, serves a page on your own Wi-Fi behind a fresh token
                — it never touches the internet.
              </p>
            </details>
            <details className="reveal">
              <summary>How do approvals actually work?</summary>
              <p>
                When an agent wants to run a tool, its hook calls a tiny bridge
                that opens the island and waits. You click Allow or Deny, and the
                agent — blocked the whole time — proceeds or stops. If the app
                isn&apos;t running, the bridge gets out of the way instantly so
                nothing ever hangs.
              </p>
            </details>
            <details className="reveal">
              <summary>What if I don&apos;t have a notch?</summary>
              <p>
                It falls back to a floating pill at the top-center of your
                screen, and rides above fullscreen apps so it&apos;s there even
                when you&apos;re heads-down in an editor.
              </p>
            </details>
            <details className="reveal">
              <summary>Is it heavy?</summary>
              <p>
                No. Native Swift, no Electron, under 50MB of RAM and near-zero
                CPU when idle. The characters and the 8-bit sounds are both
                generated in code — there isn&apos;t a single image or audio file
                in the app.
              </p>
            </details>
            <details className="reveal">
              <summary>Can I run several agents at once?</summary>
              <p>
                That&apos;s the point. Every session shows up as its own creature
                in the notch, approvals queue so none get lost, and the Worktrees
                view tells you which agent is live in which git worktree. If two
                agents end up in the same project, it warns you — they can&apos;t
                see each other, but it can.
              </p>
            </details>
            <details className="reveal">
              <summary>macOS says it&apos;s from an unidentified developer.</summary>
              <p>
                The app is signed with a Developer ID certificate. The first time
                you open it, Control-click the app in Applications and choose{" "}
                <em>Open</em> — after that it launches normally. It&apos;s a
                one-time step.
              </p>
            </details>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap foot">
          <div>
            <a className="brand" href="#top">
              <canvas data-icon="cabinet" width="46" height="46"></canvas>
              Arcade&nbsp;Agents
            </a>
            <p style={{ marginTop: "10px" }}>
              Built by{" "}
              <a
                href="https://www.f-r.co/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fahrenheit Research
              </a>
              . © 2026.
            </p>
          </div>
          <div className="foot-links">
            <a href="#watch">Watch</a>
            <a href="#features">Features</a>
            <a href="#agents">Agents</a>
            <a href="#download">Download</a>
          </div>
        </div>
      </footer>

      <Script src="/landing.js" strategy="afterInteractive" />
    </>
  );
}
