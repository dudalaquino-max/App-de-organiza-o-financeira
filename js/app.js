(() => {
  "use strict";

  const STORAGE_KEY = "financeApp.v1";
  const AUTH_KEY = "financeApp.auth";
  const SESSION_KEY = "financeApp.session";

  async function hashPassword(password) {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function getAuth() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY));
    } catch (e) {
      return null;
    }
  }

  function setAuth(username, passHash) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ username, passHash }));
  }

  const authScreen = document.getElementById("auth-screen");
  const appShell = document.getElementById("app-shell");
  const authForm = document.getElementById("auth-form");
  const authUsername = document.getElementById("auth-username");
  const authPassword = document.getElementById("auth-password");
  const authPasswordConfirm = document.getElementById("auth-password-confirm");
  const authConfirmLabel = document.getElementById("auth-confirm-label");
  const authSubtitle = document.getElementById("auth-subtitle");
  const authSubmit = document.getElementById("auth-submit");
  const authError = document.getElementById("auth-error");
  const authResetLink = document.getElementById("auth-reset-link");
  const currentUsernameEl = document.getElementById("current-username");
  const logoutBtn = document.getElementById("logout-btn");

  function isSetupMode() {
    return !getAuth();
  }

  function refreshAuthFormMode() {
    const setup = isSetupMode();
    authError.textContent = "";
    if (setup) {
      authSubtitle.textContent = "Crie seu acesso para começar.";
      authSubmit.textContent = "Criar acesso";
      authPasswordConfirm.required = true;
      authConfirmLabel.style.display = "";
      authPasswordConfirm.style.display = "";
      authPassword.autocomplete = "new-password";
    } else {
      authSubtitle.textContent = "Entre com seu usuário e senha.";
      authSubmit.textContent = "Entrar";
      authPasswordConfirm.required = false;
      authConfirmLabel.style.display = "none";
      authPasswordConfirm.style.display = "none";
      authPassword.autocomplete = "current-password";
    }
  }

  function showApp() {
    const auth = getAuth();
    authScreen.hidden = true;
    appShell.hidden = false;
    currentUsernameEl.textContent = auth ? auth.username : "";
    render();
  }

  function showAuthScreen() {
    appShell.hidden = true;
    authScreen.hidden = false;
    authForm.reset();
    refreshAuthFormMode();
    authUsername.focus();
  }

  authForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    authError.textContent = "";
    const username = authUsername.value.trim();
    const password = authPassword.value;
    const auth = getAuth();

    if (isSetupMode()) {
      if (password !== authPasswordConfirm.value) {
        authError.textContent = "As senhas não coincidem.";
        return;
      }
      const passHash = await hashPassword(password);
      setAuth(username, passHash);
      sessionStorage.setItem(SESSION_KEY, "1");
      showApp();
      return;
    }

    const passHash = await hashPassword(password);
    if (username !== auth.username || passHash !== auth.passHash) {
      authError.textContent = "Usuário ou senha incorretos.";
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    showApp();
  });

  authResetLink.addEventListener("click", () => {
    if (
      !confirm(
        "Isso apaga apenas o usuário e senha de acesso (seus lançamentos financeiros continuam salvos). Deseja continuar?"
      )
    ) {
      return;
    }
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    showAuthScreen();
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    showAuthScreen();
  });

  const CATEGORIES = [
    {
      id: "fixedIncome",
      title: "Crédito Fixo",
      type: "income",
      fixed: true,
      accent: "var(--color-fixed-accent)",
    },
    {
      id: "variableIncome",
      title: "Crédito Variável",
      type: "income",
      fixed: false,
      accent: "var(--color-variable-accent)",
    },
    {
      id: "fixedExpense",
      title: "Despesas Fixas",
      type: "expense",
      fixed: true,
      accent: "var(--color-fixed-accent)",
    },
    {
      id: "variableExpense",
      title: "Despesas Variáveis",
      type: "expense",
      fixed: false,
      accent: "var(--color-variable-accent)",
    },
  ];

  const CONTEXTS = ["empresa", "pessoal"];

  const SPECS_KEY = "financeApp.specs";

  const DEFAULT_SPECS = {
    empresa: {
      fixedIncome: [],
      fixedExpense: ["Água", "Luz"],
      variableIncome: [],
      variableExpense: [],
    },
    pessoal: {
      fixedIncome: [],
      fixedExpense: ["Água", "Luz"],
      variableIncome: [],
      variableExpense: ["Mercado", "Gasolina/Uber", "Lazer", "Presentes", "iFood"],
    },
  };

  function loadSpecs() {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(SPECS_KEY));
    } catch (e) {
      raw = null;
    }
    const specs = {};
    CONTEXTS.forEach((ctx) => {
      specs[ctx] = {};
      CATEGORIES.forEach((c) => {
        const saved = raw && raw[ctx] && Array.isArray(raw[ctx][c.id]) ? raw[ctx][c.id] : null;
        specs[ctx][c.id] = saved || DEFAULT_SPECS[ctx][c.id].slice();
      });
    });
    return specs;
  }

  function saveSpecs() {
    localStorage.setItem(SPECS_KEY, JSON.stringify(specsState));
  }

  const specsState = loadSpecs();

  function emptyContextData() {
    const data = {};
    CATEGORIES.forEach((c) => (data[c.id] = []));
    return data;
  }

  function loadState() {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      raw = null;
    }
    const state = {};
    CONTEXTS.forEach((ctx) => {
      state[ctx] =
        raw && raw[ctx] ? Object.assign(emptyContextData(), raw[ctx]) : emptyContextData();
    });
    return state;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const state = loadState();

  let currentContext = "empresa";
  let currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const monthInput = document.getElementById("month-input");
  monthInput.value = currentMonth;
  monthInput.addEventListener("change", () => {
    currentMonth = monthInput.value || currentMonth;
    render();
  });

  document.querySelectorAll(".context-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentContext = btn.dataset.context;
      document.querySelectorAll(".context-tab").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      render();
    });
  });

  let currentView = "entries";
  const entriesView = document.getElementById("entries-view");
  const reportView = document.getElementById("report-view");

  function applyViewVisibility() {
    entriesView.hidden = currentView !== "entries";
    reportView.hidden = currentView !== "report";
  }

  document.querySelectorAll(".view-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentView = btn.dataset.view;
      document.querySelectorAll(".view-tab").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      applyViewVisibility();
    });
  });

  function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function entriesForCategory(category, context = currentContext, month = currentMonth) {
    const all = state[context][category.id];
    if (category.fixed) return all;
    return all.filter((e) => e.date && e.date.slice(0, 7) === month);
  }

  function categoryTotal(category, context = currentContext, month = currentMonth) {
    return entriesForCategory(category, context, month).reduce((sum, e) => sum + e.value, 0);
  }

  function getContextTotals(context, month = currentMonth) {
    const income = CATEGORIES.filter((c) => c.type === "income").reduce(
      (sum, c) => sum + categoryTotal(c, context, month),
      0
    );
    const expense = CATEGORIES.filter((c) => c.type === "expense").reduce(
      (sum, c) => sum + categoryTotal(c, context, month),
      0
    );
    return { income, expense, balance: income - expense };
  }

  function getBusinessTransfer(month = currentMonth) {
    return Math.max(0, getContextTotals("empresa", month).balance);
  }

  const boardIncome = document.getElementById("board-income");
  const boardExpense = document.getElementById("board-expense");
  const cardTemplate = document.getElementById("category-card-template");

  const NEW_SPEC_VALUE = "__new__";

  function populateSpecSelect(select, category) {
    const previousValue = select.value;
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecione a especificação";
    placeholder.disabled = true;
    select.appendChild(placeholder);

    specsState[currentContext][category.id].forEach((spec) => {
      const opt = document.createElement("option");
      opt.value = spec;
      opt.textContent = spec;
      select.appendChild(opt);
    });

    const newOpt = document.createElement("option");
    newOpt.value = NEW_SPEC_VALUE;
    newOpt.textContent = "+ Criar nova especificação";
    select.appendChild(newOpt);

    if (previousValue && specsState[currentContext][category.id].includes(previousValue)) {
      select.value = previousValue;
    } else {
      placeholder.selected = true;
    }
  }

  function buildCard(category) {
    const node = cardTemplate.content.cloneNode(true);
    const article = node.querySelector(".category-card");
    article.classList.add(`type-${category.type}`);
    article.style.setProperty("--accent-color", category.accent);
    article.dataset.categoryId = category.id;

    node.querySelector(".category-title").textContent = category.title;

    const form = node.querySelector(".entry-form");
    const specSelect = form.querySelector(".entry-description");
    populateSpecSelect(specSelect, category);

    specSelect.addEventListener("change", () => {
      if (specSelect.value !== NEW_SPEC_VALUE) return;
      const name = (window.prompt("Nome da nova especificação:") || "").trim();
      if (!name) {
        populateSpecSelect(specSelect, category);
        return;
      }
      const specs = specsState[currentContext][category.id];
      const exists = specs.some((s) => s.toLowerCase() === name.toLowerCase());
      if (!exists) {
        specs.push(name);
        saveSpecs();
      }
      populateSpecSelect(specSelect, category);
      specSelect.value = exists ? specs.find((s) => s.toLowerCase() === name.toLowerCase()) : name;
    });

    const dateInput = form.querySelector(".entry-date");
    dateInput.value = category.fixed
      ? `${currentMonth}-01`
      : `${currentMonth}-${String(new Date().getDate()).padStart(2, "0")}`;

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const description = specSelect.value;
      const value = parseFloat(form.querySelector(".entry-value").value);
      const date = form.querySelector(".entry-date").value;
      if (!description || description === NEW_SPEC_VALUE || !value || value <= 0 || !date) return;

      state[currentContext][category.id].push({
        id: crypto.randomUUID(),
        description,
        value,
        date,
      });
      saveState();
      render();
    });

    return node;
  }

  function fillEntryList(article, category) {
    const list = article.querySelector(".entry-list");
    const hint = article.querySelector(".empty-hint");
    const entries = entriesForCategory(category).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

    list.innerHTML = "";
    hint.style.display = entries.length ? "none" : "block";

    entries.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "entry-item";

      const meta = document.createElement("div");
      meta.className = "entry-meta";

      const desc = document.createElement("span");
      desc.className = "entry-desc";
      desc.textContent = entry.description;
      desc.title = entry.description;

      const dateEl = document.createElement("span");
      dateEl.className = "entry-date";
      const [y, m, d] = entry.date.split("-");
      dateEl.textContent = `${d}/${m}/${y}`;

      meta.appendChild(desc);
      meta.appendChild(dateEl);

      const valueEl = document.createElement("span");
      valueEl.className = "entry-value";
      valueEl.textContent = formatCurrency(entry.value);

      const delBtn = document.createElement("button");
      delBtn.className = "btn-delete";
      delBtn.title = "Remover lançamento";
      delBtn.textContent = "✕";
      delBtn.addEventListener("click", () => {
        state[currentContext][category.id] = state[currentContext][category.id].filter(
          (e) => e.id !== entry.id
        );
        saveState();
        render();
      });

      li.appendChild(meta);
      li.appendChild(valueEl);
      li.appendChild(delBtn);
      list.appendChild(li);
    });

    article.querySelector(".category-total").textContent = formatCurrency(categoryTotal(category));
  }

  const transferBanner = document.getElementById("business-transfer-banner");
  const transferDetailEl = document.getElementById("transfer-detail");
  const transferValueEl = document.getElementById("transfer-value");

  function updateTransferBanner(transfer) {
    if (currentContext !== "pessoal") {
      transferBanner.hidden = true;
      return;
    }
    transferBanner.hidden = false;
    transferValueEl.textContent = formatCurrency(transfer);
    const businessBalance = getContextTotals("empresa").balance;
    transferDetailEl.textContent =
      businessBalance < 0
        ? "A empresa está com saldo negativo neste mês — nenhum repasse automático."
        : "Saldo do mês empresarial (créditos − despesas), somado automaticamente ao saldo pessoal.";
  }

  function renderSummary() {
    const baseIncome = CATEGORIES.filter((c) => c.type === "income").reduce(
      (sum, c) => sum + categoryTotal(c),
      0
    );
    const expense = CATEGORIES.filter((c) => c.type === "expense").reduce(
      (sum, c) => sum + categoryTotal(c),
      0
    );
    const transfer = currentContext === "pessoal" ? getBusinessTransfer() : 0;
    const income = baseIncome + transfer;
    const balance = income - expense;

    document.getElementById("summary-income").textContent = formatCurrency(income);
    document.getElementById("summary-expense").textContent = formatCurrency(expense);

    const balanceEl = document.getElementById("summary-balance");
    balanceEl.textContent = formatCurrency(balance);
    balanceEl.closest(".summary-card").classList.toggle("negative", balance < 0);

    updateTransferBanner(transfer);
  }

  const reportCardTemplate = document.getElementById("report-card-template");

  function buildReportCard(category) {
    const node = reportCardTemplate.content.cloneNode(true);
    const article = node.querySelector(".report-card");
    article.classList.add(`type-${category.type}`);
    article.style.setProperty("--accent-color", category.accent);

    node.querySelector(".category-title").textContent = category.title;

    const entries = entriesForCategory(category);
    const bySpec = {};
    entries.forEach((e) => {
      bySpec[e.description] = (bySpec[e.description] || 0) + e.value;
    });
    const rows = Object.entries(bySpec).sort((a, b) => b[1] - a[1]);

    const list = node.querySelector(".report-list");
    const hint = node.querySelector(".empty-hint");
    hint.style.display = rows.length ? "none" : "block";

    rows.forEach(([spec, total]) => {
      const li = document.createElement("li");
      li.className = "report-row";

      const specEl = document.createElement("span");
      specEl.className = "report-spec";
      specEl.textContent = spec;

      const valueEl = document.createElement("span");
      valueEl.className = "report-value";
      valueEl.textContent = formatCurrency(total);

      li.appendChild(specEl);
      li.appendChild(valueEl);
      list.appendChild(li);
    });

    node.querySelector(".category-total").textContent = formatCurrency(categoryTotal(category));

    return node;
  }

  function buildTransferReportCard() {
    const node = reportCardTemplate.content.cloneNode(true);
    const article = node.querySelector(".report-card");
    article.classList.add("type-income");
    article.style.setProperty("--accent-color", "var(--color-fixed-accent)");

    node.querySelector(".category-title").textContent = "Repasse da Empresa";

    const transfer = getBusinessTransfer();
    const list = node.querySelector(".report-list");
    const hint = node.querySelector(".empty-hint");
    hint.style.display = "none";

    const li = document.createElement("li");
    li.className = "report-row";
    const specEl = document.createElement("span");
    specEl.className = "report-spec";
    specEl.textContent = "Saldo empresarial do mês";
    const valueEl = document.createElement("span");
    valueEl.className = "report-value";
    valueEl.textContent = formatCurrency(transfer);
    li.appendChild(specEl);
    li.appendChild(valueEl);
    list.appendChild(li);

    node.querySelector(".category-total").textContent = formatCurrency(transfer);
    return node;
  }

  const reportBoardIncome = document.getElementById("report-board-income");
  const reportBoardExpense = document.getElementById("report-board-expense");

  function renderReport() {
    reportBoardIncome.innerHTML = "";
    reportBoardExpense.innerHTML = "";
    CATEGORIES.forEach((category) => {
      const target = category.type === "income" ? reportBoardIncome : reportBoardExpense;
      target.appendChild(buildReportCard(category));
    });
    if (currentContext === "pessoal") {
      reportBoardIncome.appendChild(buildTransferReportCard());
    }
  }

  function render() {
    boardIncome.innerHTML = "";
    boardExpense.innerHTML = "";
    CATEGORIES.forEach((category) => {
      const node = buildCard(category);
      const target = category.type === "income" ? boardIncome : boardExpense;
      target.appendChild(node);
      const article = target.querySelector(
        `.category-card[data-category-id="${category.id}"]`
      );
      fillEntryList(article, category);
    });
    renderSummary();
    renderReport();
  }

  const chatToggle = document.getElementById("chat-toggle");
  const chatPanel = document.getElementById("chat-panel");
  const chatClose = document.getElementById("chat-close");
  const chatMessages = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  function addChatMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `chat-message ${sender}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  let chatGreeted = false;

  chatToggle.addEventListener("click", () => {
    chatPanel.hidden = !chatPanel.hidden;
    if (!chatPanel.hidden) {
      if (!chatGreeted) {
        addChatMessage(
          "Oi! Me conta o que você gastou ou recebeu, tipo:\n\"gastei 45 no mercado\"\n\"recebi 3000 de salário\"\n\"paguei 120 de luz\"",
          "bot"
        );
        chatGreeted = true;
      }
      chatInput.focus();
    }
  });

  chatClose.addEventListener("click", () => {
    chatPanel.hidden = true;
  });

  const EXPENSE_WORDS = ["gastei", "gasto", "paguei", "pagar", "comprei", "debitei", "saiu", "despesa"];
  const INCOME_WORDS = [
    "recebi",
    "receber",
    "ganhei",
    "ganho",
    "entrou",
    "faturei",
    "faturamento",
    "vendi",
    "receita",
    "credito",
    "crédito",
    "renda",
    "caiu",
  ];

  function parseChatValue(text) {
    const match = text.match(/(\d{1,3}(?:\.\d{3})+,\d{2}|\d+,\d{1,2}|\d+\.\d{1,2}|\d+)/);
    if (!match) return null;
    let raw = match[1];
    if (raw.includes(",")) {
      raw = raw.replace(/\./g, "").replace(",", ".");
    }
    const value = parseFloat(raw);
    return !isNaN(value) && value > 0 ? value : null;
  }

  function detectChatType(lowerText) {
    const hasExpense = EXPENSE_WORDS.some((w) => lowerText.includes(w));
    const hasIncome = INCOME_WORDS.some((w) => lowerText.includes(w));
    if (hasExpense && !hasIncome) return "expense";
    if (hasIncome && !hasExpense) return "income";
    return null;
  }

  function detectChatContext(lowerText) {
    if (/\bempresa\b|\bempresarial\b/.test(lowerText)) return "empresa";
    if (/\bpessoal\b/.test(lowerText)) return "pessoal";
    return currentContext;
  }

  function detectChatSpec(lowerText, context, type) {
    const candidateCategoryIds = CATEGORIES.filter((c) => c.type === type).map((c) => c.id);

    for (const catId of candidateCategoryIds) {
      for (const spec of specsState[context][catId]) {
        if (lowerText.includes(spec.toLowerCase())) {
          return { categoryId: catId, spec, isNew: false };
        }
      }
    }

    const prepMatch = lowerText.match(/\b(?:em|no|na|de|do|da|com)\s+([a-zà-ú0-9/\s]+)/i);
    if (!prepMatch) return null;

    let candidate = prepMatch[1]
      .replace(/\d+(?:[.,]\d+)?/g, "")
      .replace(/\b(empresa|empresarial|pessoal)\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!candidate) return null;

    const name = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    const categoryId = type === "income" ? "variableIncome" : "variableExpense";
    return { categoryId, spec: name, isNew: true };
  }

  function handleChatMessage(text) {
    const lowerText = text.toLowerCase();
    const value = parseChatValue(text);
    const type = detectChatType(lowerText);
    const context = detectChatContext(lowerText);

    if (!value) {
      addChatMessage("Não encontrei um valor. Tente algo como: \"gastei 45 no mercado\".", "bot");
      return;
    }
    if (!type) {
      addChatMessage(
        "Foi um ganho ou um gasto? Use palavras como \"gastei\"/\"paguei\" para despesa ou \"recebi\"/\"ganhei\" para crédito.",
        "bot"
      );
      return;
    }

    const result = detectChatSpec(lowerText, context, type);
    if (!result) {
      addChatMessage(
        "Não entendi em que categoria. Tente: \"gastei 45 no mercado\" ou \"paguei 100 de luz\".",
        "bot"
      );
      return;
    }

    const { categoryId, spec, isNew } = result;
    if (isNew) {
      const specs = specsState[context][categoryId];
      const exists = specs.some((s) => s.toLowerCase() === spec.toLowerCase());
      if (!exists) {
        specs.push(spec);
        saveSpecs();
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    state[context][categoryId].push({
      id: crypto.randomUUID(),
      description: spec,
      value,
      date: today,
    });
    saveState();
    render();

    const category = CATEGORIES.find((c) => c.id === categoryId);
    const contextLabel = context === "empresa" ? "Empresa" : "Pessoal";
    addChatMessage(
      `✅ Registrei ${type === "income" ? "um crédito" : "uma despesa"} de ${formatCurrency(
        value
      )} em "${spec}" (${contextLabel} · ${category.title}).`,
      "bot"
    );
  }

  chatForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    addChatMessage(text, "user");
    chatInput.value = "";
    handleChatMessage(text);
  });

  if (getAuth() && sessionStorage.getItem(SESSION_KEY) === "1") {
    showApp();
  } else {
    showAuthScreen();
  }
})();
