/* mount the static brand icon + segmented progress bar once */
document.getElementById("brandIconSlot").innerHTML = ICONS.brand;
(function mountSegbar(){
  const seg = document.getElementById("segbar");
  for(let i=0;i<7;i++){
    seg.appendChild(el(`<span class="${i<4 ? "filled" : ""}"></span>`));
  }
})();

/* ------------------------------- render ------------------------------- */

function el(html){ const d=document.createElement("div"); d.innerHTML=html.trim(); return d.firstChild; }

function render(){
  const app = document.getElementById("app");
  app.innerHTML = "";
  if(state.view === "home") app.appendChild(renderHome());
  else if(state.view === "pending") app.appendChild(renderPending());
  else if(state.view === "flow") app.appendChild(renderFlow());
  else if(state.view === "result") app.appendChild(renderResult());
  else if(state.view === "logs") app.appendChild(renderLogs());
}

function renderHome(){
  const wrap = el(`<div>
    <p class="lede">Answer a few short questions about what is happening. The tool will return a step by step response, grouped by stage, with the exact source behind every step.</p>
    <div class="home-head-row">
      <h2 class="prompt">What's happening right now?</h2>
      <button class="logs-link" id="viewLogsBtn">${ICONS.report} View incident log</button>
    </div>
    <div class="grid"></div>
  </div>`);
  wrap.querySelector("#viewLogsBtn").addEventListener("click", ()=>{
    state = {view:"logs", categoryId:null, step:0, answers:{}, playbook:[]};
    render();
  });
  const grid = wrap.querySelector(".grid");
  CATEGORIES.forEach(c=>{
    const card = el(`
      <button class="card">
        <div class="card-top">
          <div class="card-icon ${c.ready ? "ready" : "pending"}">${ICONS[c.id]}</div>
          <span class="status ${c.ready ? "ready" : "pending"}">${c.ready ? "Ready" : "Pending"}</span>
        </div>
        <h3>${c.name}</h3>
        <p>${c.blurb}</p>
      </button>
    `);
    card.addEventListener("click", ()=>{
      if(c.ready){
        state = {view:"flow", categoryId:c.id, step:0, answers:{}, playbook:[]};
      } else {
        state = {view:"pending", categoryId:c.id, step:0, answers:{}, playbook:[]};
      }
      render();
    });
    grid.appendChild(card);
  });
  return wrap;
}

function renderPending(){
  const cat = CATEGORIES.find(c=>c.id===state.categoryId);
  const node = el(`
    <div class="pending-card">
      <div class="picon">${ICONS[cat.id]}</div>
      <h2>${cat.name}</h2>
      <p>The source guidance for this category (the equivalent NCSC and DSPT material used for the four finished categories) has not been extracted and verified yet. Rather than invent plausible sounding rules, this category is deliberately left unbuilt until that step is done, consistent with the risk log in the build plan.</p>
    </div>
  `);
  return attachBack(node);
}

function attachBack(node){
  const btn = el(`<button class="back">${ICONS.back} Back to categories</button>`);
  btn.addEventListener("click", ()=>{ state = {view:"home", categoryId:null, step:0, answers:{}, playbook:[]}; render(); });
  node.appendChild(btn);
  return node;
}

function renderFlow(){
  const flow = FLOWS[state.categoryId];
  const cat = CATEGORIES.find(c=>c.id===state.categoryId);
  const next = flow.next(state.answers);

  if(next.type === "redirect"){
    const node = el(`
      <div class="qcard">
        <p class="eyebrow">${cat.name}</p>
        <h2>${next.text}</h2>
      </div>
    `);
    return attachBack(node);
  }

  if(next.type === "done"){
    state.playbook = flow.playbook(state.answers);
    state.view = "result";
    return renderResult();
  }

  const rail = el(`<div class="stage-rail"></div>`);
  STAGES.forEach(s=>{
    rail.appendChild(el(`<span class="stage-pill">${ICONS[s]}${STAGE_LABEL[s]}</span>`));
  });

  const card = el(`
    <div class="qcard">
      <p class="eyebrow">${cat.name}</p>
      <h2>${next.text}</h2>
      <div class="options"></div>
    </div>
  `);
  const optionsWrap = card.querySelector(".options");
  next.options.forEach(o=>{
    const b = el(`<button class="opt"><span class="dot"></span>${o.label}</button>`);
    b.addEventListener("click", ()=>{
      state.answers[next.key] = o.value;
      render();
    });
    optionsWrap.appendChild(b);
  });

  const wrap = document.createElement("div");
  wrap.appendChild(rail);
  wrap.appendChild(card);
  return attachBack(wrap);
}

function renderResult(){
  const cat = CATEGORIES.find(c=>c.id===state.categoryId);
  const wrap = el(`
    <div>
      <div class="result-head">
        <p class="eyebrow">Response playbook</p>
        <h2>${cat.name}</h2>
        <p>Generated ${new Date().toLocaleString("en-GB")}</p>
      </div>
    </div>
  `);

  STAGES.forEach(stage=>{
    const items = state.playbook.filter(p=>p.stage===stage);
    if(items.length === 0) return;
    const section = el(`<div class="section"></div>`);
    section.appendChild(el(`<span class="section-label ${stage}">${ICONS[stage]}${STAGE_LABEL[stage]}</span>`));
    items.forEach(it=>{
      const step = el(`
        <div class="step ${stage} ${it.critical ? "critical" : ""}">
          <p>${it.text}</p>
          <span class="source">${it.source}</span>
        </div>
      `);
      section.appendChild(step);
    });
    wrap.appendChild(section);
  });

  const saveStatus = el(`<div class="save-status" id="saveStatus"></div>`);

  const actions = el(`
    <div class="actions-row">
      <button class="btn primary" id="saveBtn">${ICONS.report} Save this log</button>
      <button class="btn" id="printBtn">${ICONS.print} Print or save as PDF</button>
      <button class="btn" id="restartBtn">${ICONS.refresh} Start again</button>
    </div>
  `);

  actions.querySelector("#saveBtn").addEventListener("click", async ()=>{
    const statusEl = wrap.querySelector("#saveStatus");
    statusEl.textContent = "Saving…";
    statusEl.className = "save-status pending";
    try{
      const res = await fetch("/api/incidents", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          category: state.categoryId,
          categoryLabel: cat.name,
          answers: state.answers,
          playbook: state.playbook,
          generatedAt: new Date().toISOString(),
        }),
      });
      if(!res.ok) throw new Error("Server responded with " + res.status);
      const data = await res.json();
      statusEl.textContent = `Saved — reference #${data.id}`;
      statusEl.className = "save-status ok";
    } catch(err){
      statusEl.textContent = "Could not reach the server. Is it running? (npm start)";
      statusEl.className = "save-status error";
    }
  });

  actions.querySelector("#restartBtn").addEventListener("click", ()=>{
    state = {view:"home", categoryId:null, step:0, answers:{}, playbook:[]};
    render();
  });
  actions.querySelector("#printBtn").addEventListener("click", ()=> window.print());

  wrap.appendChild(actions);
  wrap.appendChild(saveStatus);

  return wrap;
}

function renderLogs(){
  const wrap = el(`
    <div>
      <div class="result-head">
        <p class="eyebrow">NHS DSPT incident recording requirement</p>
        <h2>Incident log</h2>
        <p id="logsMeta">Loading…</p>
      </div>
      <div id="logsList"></div>
    </div>
  `);

  fetch("/api/incidents")
    .then(res => { if(!res.ok) throw new Error("status " + res.status); return res.json(); })
    .then(rows => {
      wrap.querySelector("#logsMeta").textContent = rows.length + (rows.length === 1 ? " entry recorded" : " entries recorded");
      const list = wrap.querySelector("#logsList");
      if(rows.length === 0){
        list.appendChild(el(`<div class="pending-card"><p>No incidents have been logged yet. Complete a category and select "Save this log" on the result screen.</p></div>`));
        return;
      }
      rows.forEach(r=>{
        const cat = CATEGORIES.find(c=>c.id===r.category);
        const entry = el(`
          <div class="step" style="border-left-color:var(--accent)">
            <p><strong>#${r.id} — ${r.categoryLabel || (cat ? cat.name : r.category)}</strong></p>
            <span class="source">logged ${new Date(r.receivedAt).toLocaleString("en-GB")}, ${r.playbook.length} playbook steps</span>
          </div>
        `);
        list.appendChild(entry);
      });
    })
    .catch(()=>{
      wrap.querySelector("#logsMeta").textContent = "";
      wrap.querySelector("#logsList").appendChild(
        el(`<div class="pending-card"><p>Could not reach the server. Make sure it's running with <code>npm start</code> and this page was opened at <code>http://localhost:3000</code>, not opened directly as a file.</p></div>`)
      );
    });

  return attachBack(wrap);
}

render();
