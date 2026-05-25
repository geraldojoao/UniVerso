const list = document.getElementById("commitmentList");
const form = document.getElementById("commitmentForm");
const status = document.getElementById("commitmentStatus");

function renderCommitments(items) {
  if (!list || !items.length) return;
  list.replaceChildren(...items.map((commitment) => {
    const card = document.createElement("div");
    const message = document.createElement("p");
    const author = document.createElement("span");
    card.className = "commitment";
    message.textContent = `"${commitment.message}"`;
    author.textContent = commitment.name;
    card.append(message, author);
    return card;
  }));
}

async function loadApprovedCommitments() {
  if (!list || window.location.protocol === "file:") return;
  try {
    const response = await fetch("/api/commitments");
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.commitments) && data.commitments.length) renderCommitments(data.commitments);
  } catch {
    // Seed commitments remain visible when the API is temporarily unavailable.
  }
}

function fieldMessage(field, message) {
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  const target = form.querySelector(`[data-error-for="${field.id}"]`);
  if (target) target.textContent = message;
  return !message;
}

function validate(field) {
  const value = field.value.trim();
  if (!value) return fieldMessage(field, "Este campo é obrigatório.");
  if (field.id === "commitmentName" && value.length > 40) return fieldMessage(field, "Use apenas seu primeiro nome.");
  if (field.id === "commitmentText" && value.length < 10) return fieldMessage(field, "Escreva ao menos 10 caracteres.");
  return fieldMessage(field, "");
}

if (form) {
  const fields = ["commitmentName", "commitmentText"].map((id) => document.getElementById(id));
  fields.forEach((field) => field.addEventListener("blur", () => validate(field)));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const firstInvalid = fields.find((field) => !validate(field));
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submit = form.querySelector("button[type='submit']");
    const payload = Object.fromEntries(new FormData(form).entries());
    submit.disabled = true;
    status.hidden = true;
    status.classList.remove("error");

    try {
      const response = await fetch("/api/commitments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar.");
      form.reset();
      status.textContent = "Compromisso recebido! Ele aparecerá no mural após moderação.";
      status.hidden = false;
    } catch (error) {
      status.textContent = error.message || "Não foi possível enviar agora.";
      status.classList.add("error");
      status.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
}

loadApprovedCommitments();
