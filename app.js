// Avaada AI Platform – Client-side logic (patched v2)
// Fixes: navigation mapping, dynamic icon refresh after nav re-render, ensure chat input focus & message sending work, guarantee right sidebar visible and char counter update on init.
(function () {
  /* --------------------------- Static Data --------------------------- */
  const data = {
    user: {
      name: "Rajesh Kumar",
      role: "Energy Analyst",
      avatar: "/api/placeholder/40/40",
      email: "rajesh.kumar@avaada.com",
    },
    navigation: [
      { id: "dashboard", label: "Dashboard", icon: "grid", badge: null },
      { id: "projects", label: "Projects", icon: "folder", badge: "3" },
      { id: "teams", label: "Teams", icon: "users", badge: "12" },
      { id: "analytics", label: "Analytics", icon: "bar-chart-2", badge: null },
      { id: "chat-history", label: "Chat History", icon: "message-circle", badge: null },
      { id: "settings", label: "Settings", icon: "settings", badge: null },
    ],
    chatHistory: [
      { id: "chat-1", title: "Solar Panel Efficiency Analysis", timestamp: "2 hours ago", preview: "Can you analyze the efficiency trends of our solar panels?", active: false },
      { id: "chat-2", title: "Wind Energy Market Report", timestamp: "1 day ago", preview: "Generate a comprehensive wind energy market report for India", active: false },
      { id: "chat-3", title: "Renewable Energy Policy Discussion", timestamp: "2 days ago", preview: "What are the latest renewable energy policies in India?", active: false },
      { id: "chat-4", title: "Green Hydrogen Production", timestamp: "3 days ago", preview: "Explain green hydrogen production methods and costs", active: false },
      { id: "chat-5", title: "Energy Storage Solutions", timestamp: "5 days ago", preview: "Compare different energy storage technologies for grid applications", active: false },
    ],
    activeProjects: [
      { id: "proj-1", title: "Gujarat Solar Park Phase 3", status: "In Progress", progress: 75, deadline: "Dec 2025" },
      { id: "proj-2", title: "Wind Farm Optimization", status: "Planning", progress: 25, deadline: "Mar 2026" },
      { id: "proj-3", title: "Energy Storage Integration", status: "Review", progress: 90, deadline: "Jan 2026" },
    ],
    recentActivity: [
      { id: "activity-1", icon: "message-circle", message: "New chat: Solar Panel Efficiency Analysis", timestamp: "2 hours ago" },
      { id: "activity-2", icon: "folder", message: "Updated Gujarat Solar Park Phase 3 progress to 75%", timestamp: "4 hours ago" },
    ],
    aiModels: [
      { id: "gpt4", name: "GPT-4", active: true },
      { id: "claude3", name: "Claude-3" },
      { id: "llama2", name: "Llama-2" },
      { id: "gemini", name: "Gemini Pro" },
    ],
    quickActions: [
      { id: "new-chat", label: "New Chat", icon: "plus" },
      { id: "upload-doc", label: "Upload Document", icon: "upload" },
      { id: "schedule-meeting", label: "Schedule Meeting", icon: "calendar" },
      { id: "generate-report", label: "Generate Report", icon: "file-text" },
    ],
  };

  /* --------------------------- Utility --------------------------- */
  const qs = (sel) => document.querySelector(sel);
  const qsa = (sel) => document.querySelectorAll(sel);
  const byId = (id) => document.getElementById(id);

  const leftSidebar = byId("leftSidebar");
  const navMenu = byId("navMenu");
  const chatHistoryLeft = byId("chatHistoryList");
  const chatHistoryCenter = byId("chatHistoryCenterList");
  const messagesArea = byId("messagesArea");
  const chatForm = byId("chatForm");
  const chatInput = byId("chatInput");
  const charCounter = byId("charCounter");
  const typingIndicator = byId("typingIndicator");
  const projectsList = byId("projectsList");
  const projectsCenterList = byId("projectsCenterList");
  const quickActionsGrid = byId("quickActionsGrid");
  const activityFeed = byId("activityFeed");
  const headerMeta = byId("mainViewHeader");
  const mobileMenuBtn = byId("mobileMenuBtn");

  const viewMap = {
    dashboard: "chatView",
    projects: "projectsView",
    teams: "teamsView",
    analytics: "analyticsView",
    "chat-history": "chatHistoryView",
    settings: "settingsView",
  };

  /* --------------------------- Rendering --------------------------- */
  function renderNav() {
    navMenu.innerHTML = data.navigation
      .map(
        (nav) => `<li><a href="#" class="nav-link ${nav.active ? "active" : ""}" data-id="${nav.id}">
          <i data-feather="${nav.icon}"></i>
          <span>${nav.label}</span>
          ${nav.badge ? `<span class="nav-badge">${nav.badge}</span>` : ""}
        </a></li>`
      )
      .join("");
  }

  function renderChatHistory(targetEl) {
    targetEl.innerHTML = data.chatHistory
      .map(
        (c) => `<li class="chat-history-item ${c.active ? "active" : ""}" data-id="${c.id}">
          <div class="chat-title">${c.title}</div>
          <div class="chat-timestamp">${c.timestamp}</div>
        </li>`
      )
      .join("");
  }

  function renderProjects(targetEl) {
    targetEl.innerHTML = data.activeProjects
      .map(
        (p) => `<div class="project-card">
          <div class="project-card-header"><strong>${p.title}</strong><span class="status status--info">${p.status}</span></div>
          <div class="progress-bar mb-8"><div class="progress-fill" style="width:${p.progress}%"></div></div>
          <div class="text-xs text-secondary">Deadline: ${p.deadline}</div>
        </div>`
      )
      .join("");
  }

  function renderQuickActions() {
    quickActionsGrid.innerHTML = data.quickActions
      .map(
        (qa) => `<div class="quick-action" data-id="${qa.id}"><i data-feather="${qa.icon}"></i><span>${qa.label}</span></div>`
      )
      .join("");
  }

  function renderActivity() {
    activityFeed.innerHTML = data.recentActivity
      .map(
        (a) => `<li class="activity-item"><i data-feather="${a.icon}"></i>
        <div class="flex flex-col"><span class="activity-message">${a.message}</span><span class="activity-time">${a.timestamp}</span></div></li>`
      )
      .join("");
  }

  function renderHeader(viewId) {
    if (!headerMeta) return;
    if (viewId === "dashboard") {
      headerMeta.innerHTML = `<div><h2>Welcome back, Rajesh!</h2><p class="text-sm">Avaada AI at your service.</p></div>
      <div class="flex items-center gap-8"><select id="modelSelect" class="form-control w-auto" aria-label="AI model selector"></select>
      <button class="btn btn--outline btn--sm" id="clearChatBtn"><i data-feather="trash-2"></i></button></div>`;
      renderModelSelect();
      byId("clearChatBtn").addEventListener("click", () => (messagesArea.innerHTML = ""));
    } else {
      headerMeta.innerHTML = `<h2 class="capitalize">${viewId.replace("-", " ")}</h2>`;
    }
  }

  function renderModelSelect() {
    const select = byId("modelSelect");
    select.innerHTML = data.aiModels
      .map((m) => `<option value="${m.id}" ${m.active ? "selected" : ""}>${m.name}</option>`)
      .join("");
  }

  /* --------------------------- Chat --------------------------- */
  function appendMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `message-bubble ${sender}`;
    div.textContent = text;
    messagesArea.appendChild(div);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function handleChatSubmit(evt) {
    evt.preventDefault();
    const txt = chatInput.value.trim();
    if (!txt) return;
    appendMessage(txt, "user");
    chatInput.value = "";
    updateCounter();
    typingIndicator.classList.remove("hidden");
    setTimeout(() => {
      typingIndicator.classList.add("hidden");
      appendMessage(`You asked about "${txt}". Here's a quick insight from Avaada AI.`, "ai");
    }, 800);
  }

  function updateCounter() {
    charCounter.textContent = `${chatInput.value.length} / 2000`;
  }

  /* --------------------------- View Switching --------------------------- */
  function showView(id) {
    Object.values(viewMap).forEach((vid) => byId(vid).classList.add("hidden"));
    byId(viewMap[id]).classList.remove("hidden");
    data.navigation.forEach((n) => (n.active = n.id === id));
    renderNav();
    refreshIcons();
    renderHeader(id);
  }

  /* --------------------------- Icon Refresh --------------------------- */
  function refreshIcons() {
    window.feather && window.feather.replace();
  }

  /* --------------------------- Event binding --------------------------- */
  function bindEvents() {
    navMenu.addEventListener("click", (e) => {
      const link = e.target.closest(".nav-link");
      if (!link) return;
      e.preventDefault();
      showView(link.dataset.id);
      if (window.innerWidth <= 768) toggleMobileMenu(false);
    });

    chatHistoryLeft.addEventListener("click", handleHistorySelect);
    chatHistoryCenter && chatHistoryCenter.addEventListener("click", handleHistorySelect);

    chatForm.addEventListener("submit", handleChatSubmit);
    chatInput.addEventListener("input", updateCounter);

    quickActionsGrid.addEventListener("click", (e) => {
      const qa = e.target.closest(".quick-action");
      qa && alert(`${qa.dataset.id} clicked (demo)`);
    });

    mobileMenuBtn && mobileMenuBtn.addEventListener("click", () => toggleMobileMenu());
  }

  function handleHistorySelect(e) {
    const item = e.target.closest(".chat-history-item");
    if (!item) return;
    const id = item.dataset.id;
    data.chatHistory.forEach((c) => (c.active = c.id === id));
    renderChatHistory(chatHistoryLeft);
    chatHistoryCenter && renderChatHistory(chatHistoryCenter);
    refreshIcons();
  }

  function toggleMobileMenu(show) {
    const visible = typeof show === "boolean" ? show : !leftSidebar.classList.contains("open");
    leftSidebar.classList.toggle("open", visible);
    mobileMenuBtn.classList.toggle("btn--primary", visible);
  }

  /* --------------------------- Init --------------------------- */
  function init() {
    renderNav();
    renderChatHistory(chatHistoryLeft);
    chatHistoryCenter && renderChatHistory(chatHistoryCenter);
    renderProjects(projectsList);
    projectsCenterList && renderProjects(projectsCenterList);
    renderQuickActions();
    renderActivity();
    refreshIcons();
    bindEvents();
    chatInput && chatInput.focus();
    updateCounter();
    showView("dashboard");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
