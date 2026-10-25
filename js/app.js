"use strict";

const STORAGE_KEY = "turnofacil.turnos.v1";
const STORAGE_VERSION = 1;
const TURN_STATUSES = Object.freeze({
  PENDING: "pending",
  ATTENDING: "attending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});
const STATUS_LABELS = Object.freeze({
  [TURN_STATUSES.PENDING]: "Pendiente",
  [TURN_STATUSES.ATTENDING]: "En atención",
  [TURN_STATUSES.COMPLETED]: "Completado",
  [TURN_STATUSES.CANCELLED]: "Cancelado",
});

const elements = {
  form: document.getElementById("turn-form"),
  clientName: document.getElementById("client-name"),
  registerButton: document.getElementById("register-turn"),
  callNextButton: document.getElementById("call-next-turn"),
  currentTurn: document.getElementById("current-turn"),
  pendingList: document.getElementById("pending-list"),
  pendingCount: document.getElementById("pending-count"),
  historyList: document.getElementById("history-list"),
  historyFilters: document.getElementById("history-filters"),
  historySearch: document.getElementById("history-search"),
  historyStatus: document.getElementById("history-status-filter"),
  message: document.getElementById("app-message"),
  stats: {
    [TURN_STATUSES.PENDING]: document.getElementById("stat-pending"),
    [TURN_STATUSES.ATTENDING]: document.getElementById("stat-attending"),
    [TURN_STATUSES.COMPLETED]: document.getElementById("stat-completed"),
    [TURN_STATUSES.CANCELLED]: document.getElementById("stat-cancelled"),
  },
};

let turns = [];
let nextTurnNumber = 1;
let submitting = false;
let storageAvailable = true;

function isValidTurn(turn) {
  return (
    turn !== null &&
    typeof turn === "object" &&
    Number.isSafeInteger(turn.number) &&
    turn.number > 0 &&
    typeof turn.name === "string" &&
    turn.name.trim().length > 0 &&
    typeof turn.createdAt === "string" &&
    !Number.isNaN(Date.parse(turn.createdAt)) &&
    Object.values(TURN_STATUSES).includes(turn.status)
  );
}

function loadTurns() {
  let savedValue;

  try {
    savedValue = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    storageAvailable = false;
    showMessage(
      "No se pudo acceder a localStorage. Los cambios solo estarán disponibles mientras esta página permanezca abierta.",
      "error"
    );
    return;
  }

  if (savedValue === null) {
    return;
  }

  try {
    const savedData = JSON.parse(savedValue);
    if (
      savedData === null ||
      typeof savedData !== "object" ||
      savedData.version !== STORAGE_VERSION ||
      !Array.isArray(savedData.turns) ||
      !Number.isSafeInteger(savedData.nextTurnNumber) ||
      savedData.nextTurnNumber < 1 ||
      !savedData.turns.every(isValidTurn)
    ) {
      throw new Error("El formato de los turnos guardados no es válido.");
    }

    const numbers = new Set(savedData.turns.map((turn) => turn.number));
    const attendingCount = savedData.turns.filter(
      (turn) => turn.status === TURN_STATUSES.ATTENDING
    ).length;
    const greatestNumber = savedData.turns.reduce(
      (greatest, turn) => Math.max(greatest, turn.number),
      0
    );

    if (
      numbers.size !== savedData.turns.length ||
      attendingCount > 1 ||
      savedData.nextTurnNumber <= greatestNumber
    ) {
      throw new Error("Los turnos guardados contienen datos inconsistentes.");
    }

    turns = savedData.turns;
    nextTurnNumber = savedData.nextTurnNumber;
  } catch (error) {
    turns = [];
    nextTurnNumber = 1;
    showMessage(
      "Los datos guardados no son válidos y no se cargaron. Al registrar un turno nuevo, se guardará una lista limpia.",
      "error"
    );
  }
}

function saveTurns() {
  if (!storageAvailable) {
    return false;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        nextTurnNumber,
        turns,
      })
    );
    return true;
  } catch (error) {
    storageAvailable = false;
    return false;
  }
}

function showMessage(message, kind = "success") {
  elements.message.textContent = message;
  elements.message.dataset.kind = kind;
  elements.message.hidden = false;
}

function clearMessage() {
  elements.message.textContent = "";
  elements.message.hidden = true;
  delete elements.message.dataset.kind;
}

function persistAndRender(successMessage) {
  render();
  if (saveTurns()) {
    if (successMessage) {
      showMessage(successMessage);
    }
    return;
  }
  showMessage(
    "El cambio se aplicó en esta página, pero no se pudo guardar. Al recargar, podría perderse.",
    "error"
  );
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function createTurnDetails(turn) {
  const details = createElement("div", "turn-details");
  details.append(
    createElement("span", "turn-number", `Turno #${turn.number}`),
    createElement("span", "turn-name", turn.name)
  );
  return details;
}

function createStatusLabel(status) {
  const label = createElement("span", "status-label", STATUS_LABELS[status]);
  label.dataset.status = status;
  return label;
}

function createActionButton(label, className, onClick, ariaLabel) {
  const button = createElement("button", `button button-small ${className}`, label);
  button.type = "button";
  button.setAttribute("aria-label", ariaLabel);
  button.addEventListener("click", onClick);
  return button;
}

function createEmptyMessage(title, description) {
  const item = createElement("li", "empty-state list-empty");
  item.append(
    createElement("p", "empty-title", title),
    createElement("p", "", description)
  );
  return item;
}

function renderPendingTurns() {
  const pendingTurns = turns
    .filter((turn) => turn.status === TURN_STATUSES.PENDING)
    .sort((first, second) => first.number - second.number);
  elements.pendingCount.textContent = String(pendingTurns.length);
  elements.pendingCount.setAttribute(
    "aria-label",
    `${pendingTurns.length} ${pendingTurns.length === 1 ? "turno pendiente" : "turnos pendientes"}`
  );

  if (pendingTurns.length === 0) {
    elements.pendingList.replaceChildren(
      createEmptyMessage(
        "Aún no hay turnos pendientes",
        "Los nuevos turnos se mostrarán en esta lista."
      )
    );
    return;
  }

  const items = pendingTurns.map((turn) => {
    const item = createElement("li", "turn-item");
    const actions = createElement("div", "turn-actions");
    actions.append(
      createActionButton(
        "Cancelar",
        "button-danger",
        () => cancelTurn(turn.number),
        `Cancelar turno número ${turn.number}`
      )
    );
    item.append(createTurnDetails(turn), actions);
    return item;
  });
  elements.pendingList.replaceChildren(...items);
}

function renderCurrentTurn() {
  const currentTurn = turns.find(
    (turn) => turn.status === TURN_STATUSES.ATTENDING
  );

  if (!currentTurn) {
    elements.currentTurn.className = "empty-state";
    elements.currentTurn.replaceChildren(
      createElement("span", "empty-icon", "—"),
      createElement("p", "empty-title", "Sin turno en atención"),
      createElement("p", "", "El turno actual aparecerá aquí.")
    );
    return;
  }

  elements.currentTurn.className = "turn-item current-turn-card";
  const details = createTurnDetails(currentTurn);
  details.append(createElement("span", "turn-meta", "En atención"));
  const actions = createElement("div", "turn-actions");
  actions.append(
    createActionButton(
      "Completar turno",
      "button-primary",
      () => completeTurn(currentTurn.number),
      `Completar turno número ${currentTurn.number}`
    )
  );
  elements.currentTurn.replaceChildren(details, actions);
}

function matchesHistoryFilters(turn) {
  const searchText = elements.historySearch.value.trim().toLocaleLowerCase("es");
  const statusFilter = elements.historyStatus.value;
  const searchableNumber = String(turn.number);
  const matchesSearch =
    searchText.length === 0 ||
    turn.name.toLocaleLowerCase("es").includes(searchText) ||
    searchableNumber.includes(searchText.replace(/^#/, ""));

  return matchesSearch && (statusFilter === "" || turn.status === statusFilter);
}

function renderHistory() {
  const matchingTurns = turns
    .filter(matchesHistoryFilters)
    .sort((first, second) => second.number - first.number);

  if (matchingTurns.length === 0) {
    const hasFilters =
      elements.historySearch.value.trim() !== "" ||
      elements.historyStatus.value !== "";
    elements.historyList.replaceChildren(
      createEmptyMessage(
        hasFilters ? "No hay coincidencias" : "Todavía no hay registros",
        hasFilters
          ? "Prueba con otro nombre, número o estado."
          : "Los turnos registrados se mostrarán aquí."
      )
    );
    return;
  }

  const items = matchingTurns.map((turn) => {
    const item = createElement("li", "turn-item history-turn");
    const details = createTurnDetails(turn);
    const date = new Date(turn.createdAt).toLocaleString("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
    });
    const meta = createElement("div", "turn-meta");
    const time = createElement("time", "", date);
    time.setAttribute("datetime", turn.createdAt);
    meta.append(time, createStatusLabel(turn.status));
    details.append(meta);
    item.append(details);
    return item;
  });
  elements.historyList.replaceChildren(...items);
}

function renderStats() {
  for (const [status, stat] of Object.entries(elements.stats)) {
    stat.textContent = String(
      turns.filter((turn) => turn.status === status).length
    );
  }
}

function render() {
  renderStats();
  renderCurrentTurn();
  renderPendingTurns();
  renderHistory();
}

function updateTurnStatus(number, expectedStatus, newStatus, successMessage) {
  const turnIndex = turns.findIndex(
    (turn) => turn.number === number && turn.status === expectedStatus
  );
  if (turnIndex === -1) {
    showMessage("El turno ya no está disponible para ese cambio.", "error");
    return;
  }

  turns[turnIndex] = { ...turns[turnIndex], status: newStatus };
  persistAndRender(successMessage);
}

function cancelTurn(number) {
  updateTurnStatus(
    number,
    TURN_STATUSES.PENDING,
    TURN_STATUSES.CANCELLED,
    `El turno #${number} fue cancelado.`
  );
}

function completeTurn(number) {
  updateTurnStatus(
    number,
    TURN_STATUSES.ATTENDING,
    TURN_STATUSES.COMPLETED,
    `El turno #${number} fue completado.`
  );
}

function registerTurn(event) {
  event.preventDefault();
  if (submitting) {
    return;
  }

  submitting = true;
  elements.registerButton.disabled = true;
  clearMessage();
  let registrationAccepted = false;

  try {
    const name = elements.clientName.value.trim();
    if (!name) {
      showMessage("Ingresa el nombre del cliente para registrar el turno.", "error");
      elements.clientName.focus();
      return;
    }
    if (
      !Number.isSafeInteger(nextTurnNumber) ||
      nextTurnNumber >= Number.MAX_SAFE_INTEGER
    ) {
      showMessage("No es posible asignar otro número de turno.", "error");
      return;
    }

    const newTurn = {
      number: nextTurnNumber,
      name,
      createdAt: new Date().toISOString(),
      status: TURN_STATUSES.PENDING,
    };
    turns = [...turns, newTurn];
    nextTurnNumber += 1;
    elements.form.reset();
    persistAndRender(`Turno #${newTurn.number} registrado para ${name}.`);
    registrationAccepted = true;
  } finally {
    if (registrationAccepted) {
      window.setTimeout(() => {
        submitting = false;
        elements.registerButton.disabled = false;
      }, 300);
    } else {
      submitting = false;
      elements.registerButton.disabled = false;
    }
  }
}

function callNextTurn() {
  if (turns.some((turn) => turn.status === TURN_STATUSES.ATTENDING)) {
    showMessage("Completa el turno actual antes de iniciar otro.", "error");
    return;
  }

  const nextTurn = turns
    .filter((turn) => turn.status === TURN_STATUSES.PENDING)
    .sort((first, second) => first.number - second.number)[0];

  if (!nextTurn) {
    showMessage("No hay turnos pendientes para iniciar.", "error");
    return;
  }

  updateTurnStatus(
    nextTurn.number,
    TURN_STATUSES.PENDING,
    TURN_STATUSES.ATTENDING,
    `Inició la atención del turno #${nextTurn.number}.`
  );
}

function initializeApp() {
  loadTurns();
  elements.form.addEventListener("submit", registerTurn);
  elements.historyFilters.addEventListener("submit", (event) => {
    event.preventDefault();
  });
  elements.callNextButton.addEventListener("click", callNextTurn);
  elements.historySearch.addEventListener("input", renderHistory);
  elements.historyStatus.addEventListener("change", renderHistory);
  render();
}

initializeApp();
