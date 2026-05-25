const questions = [
  {
    text: "Um colega recebe apelidos ofensivos com frequência. Qual atitude ajuda de forma segura?",
    options: ["Rir para não ficar de fora", "Acolher o colega e comunicar um adulto responsável", "Compartilhar a história no grupo"],
    correct: 1,
    feedback: "Acolher e buscar apoio de um adulto ajuda a interromper a violência sem aumentar a exposição."
  },
  {
    text: "Igualdade e equidade significam exatamente a mesma coisa?",
    options: ["Sim, sempre", "Não; equidade considera apoios necessários para acesso justo", "Não; equidade favorece apenas alguns alunos"],
    correct: 1,
    feedback: "Equidade reconhece necessidades diferentes para garantir participação e dignidade."
  },
  {
    text: "Ao ouvir um comentário preconceituoso, o que é apropriado fazer?",
    options: ["Ignorar sempre", "Responder com outra ofensa", "Dizer que a fala não é respeitosa e buscar ajuda se necessário"],
    correct: 2,
    feedback: "Interromper com segurança e recorrer a apoio demonstra responsabilidade coletiva."
  },
  {
    text: "Diversidade cultural na escola deve ser:",
    options: ["Valorizada como parte da aprendizagem", "Escondida para evitar discussões", "Comentada apenas em datas especiais"],
    correct: 0,
    feedback: "A convivência cotidiana valoriza histórias, identidades e diferentes maneiras de viver."
  },
  {
    text: "Uma mensagem humilhante em um grupo de turma pode ser bullying?",
    options: ["Não, porque aconteceu online", "Sim, cyberbullying também causa violência e precisa de apoio", "Só se tiver muitos emojis"],
    correct: 1,
    feedback: "Ofensas em ambientes digitais também precisam ser registradas e comunicadas a responsáveis."
  },
  {
    text: "Cidadania na escola envolve:",
    options: ["Apenas conhecer regras", "Participar, respeitar direitos e colaborar com soluções", "Deixar decisões somente para adultos"],
    correct: 1,
    feedback: "Cidadania inclui escuta, participação e compromisso com a proteção de todos."
  }
];

const questionCard = document.getElementById("questionCard");
const resultCard = document.getElementById("quizResult");
const questionText = document.getElementById("questionText");
const questionCount = document.getElementById("questionCount");
const optionsArea = document.getElementById("quizOptions");
const feedback = document.getElementById("quizFeedback");
const next = document.getElementById("nextQuestion");
const progress = document.getElementById("quizProgress");
const scoreText = document.getElementById("scoreText");
const resultMessage = document.getElementById("resultMessage");
let position = 0;
let score = 0;
let answered = false;

function showQuestion() {
  const question = questions[position];
  answered = false;
  next.disabled = true;
  feedback.hidden = true;
  questionCount.textContent = `Pergunta ${position + 1} de ${questions.length}`;
  questionText.textContent = question.text;
  progress.style.width = `${(position / questions.length) * 100}%`;
  optionsArea.replaceChildren(...question.options.map((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "option";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answer(optionIndex, button));
    return button;
  }));
}

function answer(option, selectedButton) {
  if (answered) return;
  answered = true;
  const question = questions[position];
  if (option === question.correct) score += 1;
  [...optionsArea.children].forEach((button) => { button.disabled = true; });
  selectedButton.classList.add("selected");
  feedback.textContent = `${option === question.correct ? "Boa escolha! " : "Vamos aprender: "}${question.feedback}`;
  feedback.hidden = false;
  next.disabled = false;
  next.textContent = position === questions.length - 1 ? "Ver resultado" : "Continuar";
}

function finishQuiz() {
  progress.style.width = "100%";
  questionCard.hidden = true;
  resultCard.hidden = false;
  scoreText.textContent = `${score}/${questions.length}`;
  resultMessage.textContent = score >= 5
    ? "Excelente! Você reconhece atitudes que fortalecem uma escola respeitosa."
    : "Você concluiu a trilha. Revise os temas para fortalecer ainda mais suas escolhas.";
  localStorage.setItem("universoQuizResult", JSON.stringify({ score, total: questions.length, date: new Date().toISOString() }));
}

next?.addEventListener("click", () => {
  if (!answered) return;
  if (position === questions.length - 1) {
    finishQuiz();
    return;
  }
  position += 1;
  showQuestion();
});

document.getElementById("restartQuiz")?.addEventListener("click", () => {
  position = 0;
  score = 0;
  resultCard.hidden = true;
  questionCard.hidden = false;
  next.textContent = "Continuar";
  showQuestion();
});
document.getElementById("printCertificate")?.addEventListener("click", () => window.print());
showQuestion();
