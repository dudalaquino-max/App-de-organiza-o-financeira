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
      id: "fixedExpense",
      title: "Despesas Fixas",
      type: "expense",
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
      id: "variableExpense",
      title: "Despesas Variáveis",
      type: "expense",
      fixed: false,
      accent: "var(--color-variable-accent)",
    },
  ];

  const CONTEXTS = ["empresa", "pessoal"];

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

  function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function entriesForCategory(category) {
    const all = state[currentContext][category.id];
    if (category.fixed) return all;
    return all.filter((e) => e.date && e.date.slice(0, 7) === currentMonth);
  }

  function categoryTotal(category) {
    return entriesForCategory(category).reduce((sum, e) => sum + e.value, 0);
  }

  const board = document.getElementById("board");
  const cardTemplate = document.getElementById("category-card-template");

  function buildCard(category) {
    const node = cardTemplate.content.cloneNode(true);
    const article = node.querySelector(".category-card");
    article.classList.add(`type-${category.type}`);
    article.style.setProperty("--accent-color", category.accent);
    article.dataset.categoryId = category.id;

    node.querySelector(".category-title").textContent = category.title;

    const form = node.querySelector(".entry-form");
    const dateInput = form.querySelector(".entry-date");
    dateInput.value = category.fixed
      ? `${currentMonth}-01`
      : `${currentMonth}-${String(new Date().getDate()).padStart(2, "0")}`;

    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const description = form.querySelector(".entry-description").value.trim();
      const value = parseFloat(form.querySelector(".entry-value").value);
      const date = form.querySelector(".entry-date").value;
      if (!description || !value || value <= 0 || !date) return;

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

  function renderSummary() {
    const income = CATEGORIES.filter((c) => c.type === "income").reduce(
      (sum, c) => sum + categoryTotal(c),
      0
    );
    const expense = CATEGORIES.filter((c) => c.type === "expense").reduce(
      (sum, c) => sum + categoryTotal(c),
      0
    );
    const balance = income - expense;

    document.getElementById("summary-income").textContent = formatCurrency(income);
    document.getElementById("summary-expense").textContent = formatCurrency(expense);

    const balanceEl = document.getElementById("summary-balance");
    balanceEl.textContent = formatCurrency(balance);
    balanceEl.closest(".summary-card").classList.toggle("negative", balance < 0);
  }

  function render() {
    board.innerHTML = "";
    CATEGORIES.forEach((category) => {
      const node = buildCard(category);
      board.appendChild(node);
      const article = board.querySelector(
        `.category-card[data-category-id="${category.id}"]`
      );
      fillEntryList(article, category);
    });
    renderSummary();
  }

  if (getAuth() && sessionStorage.getItem(SESSION_KEY) === "1") {
    showApp();
  } else {
    showAuthScreen();
  }
})();
