import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";
import { GET as getCommitments, POST as postCommitment } from "../api/commitments.js";
import { POST as postContact } from "../api/contact.js";

const root = new URL("../", import.meta.url).pathname.slice(1).replaceAll("%20", " ");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

const server = createServer(async (request, response) => {
  if (request.url === "/api/commitments" && request.method === "GET") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ commitments: [{ name: "Turma 8º A", message: "Vou acolher sem julgar." }] }));
    return;
  }
  if ((request.url === "/api/commitments" || request.url === "/api/contact") && request.method === "POST") {
    response.writeHead(201, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: true }));
    return;
  }
  const requested = request.url.split("?")[0] === "/" ? "/index.html" : request.url.split("?")[0];
  const safePath = normalize(requested).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(root, safePath);
  if (!extname(filePath)) filePath += ".html";
  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mime[extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

await new Promise((resolve) => server.listen(4178, "127.0.0.1", resolve));
const base = "http://127.0.0.1:4178";
const executablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const browser = await chromium.launch({ headless: true, executablePath });

try {
  const pageErrors = [];
  const mobile = await browser.newPage({ viewport: { width: 375, height: 900 } });
  mobile.on("pageerror", (error) => pageErrors.push(error.message));
  await mobile.goto(base);
  assert.equal(await mobile.locator("[data-menu-open]").isVisible(), true);
  await mobile.locator("[data-menu-open]").click();
  assert.equal(await mobile.locator("#mobileNav").isVisible(), true);
  await mobile.keyboard.press("Escape");
  assert.equal(await mobile.locator("#mobileNav").isVisible(), false);
  await mobile.close();

  const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(base);
  await page.locator("[data-filter='aluno']").click();
  assert.equal(await page.locator(".resource:not([hidden])").count(), 3);
  await page.locator("[data-next]").click();
  assert.equal(await page.locator("[data-slide]:not([hidden]) strong").innerText(), "Professores");
  await page.locator("#commitmentName").fill("Ana");
  await page.locator("#commitmentText").fill("Vou ajudar a construir conversas respeitosas.");
  await page.locator("#commitmentForm button[type='submit']").click();
  await page.locator("#commitmentStatus").waitFor({ state: "visible" });
  await page.locator("#contactName").fill("Ana Souza");
  await page.locator("#contactEmail").fill("ana@escola.edu.br");
  await page.locator("#contactMessage").fill("Gostaria de usar o projeto com minha turma.");
  await page.locator("#contactForm button[type='submit']").click();
  await page.locator("#contactStatus").waitFor({ state: "visible" });

  const pages = [
    "/professores.html", "/pesquisa.html", "/apoio.html", "/quiz.html",
    "/temas/igualdade.html", "/temas/bullying.html", "/temas/diversidade.html",
    "/temas/cidadania.html", "/temas/como-agir.html", "/materiais/plano-aula-respeito.html"
  ];
  for (const route of pages) {
    await page.goto(`${base}${route}`);
    assert.equal(await page.locator("h1").count(), 1, `Página sem título: ${route}`);
  }
  const internalMobile = await browser.newPage({ viewport: { width: 375, height: 900 } });
  for (const route of pages) {
    await internalMobile.goto(`${base}${route}`);
    assert.equal(await internalMobile.locator("[data-menu-open]").isVisible(), true, `Menu móvel ausente: ${route}`);
  }
  await internalMobile.close();

  await page.goto(`${base}/quiz.html`);
  for (let index = 0; index < 6; index += 1) {
    await page.locator(".option").first().click();
    await page.locator("#nextQuestion").click();
  }
  assert.equal(await page.locator("#quizResult").isVisible(), true);
  assert.ok(await page.evaluate(() => localStorage.getItem("universoQuizResult")));
  assert.deepEqual(pageErrors, []);
  await page.close();

  const invalidContact = await postContact(new Request("https://site.test/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", email: "não-é-email", message: "" })
  }));
  assert.equal(invalidContact.status, 400);
  const pendingWithoutDatabase = await postCommitment(new Request("https://site.test/api/commitments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Ana", message: "Vou respeitar as diferenças." })
  }));
  assert.equal(pendingWithoutDatabase.status, 503);
  const publicWithoutDatabase = await getCommitments();
  assert.equal(publicWithoutDatabase.status, 503);

  console.log("Smoke test aprovado: páginas, interações, quiz e endpoints validados.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
