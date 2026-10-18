"use strict";

// All records below are fictional and remain in this browser only.
const ACCOUNT_KEY = "safeBankDemoAccounts";
const TRANSACTION_KEY = "safeBankDemoTransactions";
const ALERT_KEY = "safeBankDemoAlerts";
const accounts = [
  { number: "DEMO-1001", holder: "Alex Morgan", homeLocation: "New York" },
  { number: "DEMO-1002", holder: "Jamie Lee", homeLocation: "Chicago" },
  { number: "DEMO-1003", holder: "Riley Patel", homeLocation: "San Francisco" }
];
// Keep the fictional account list in Local Storage too, as a simple demo dataset.
if (!localStorage.getItem(ACCOUNT_KEY)) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
// Seed a few fictional records so the dashboard and alerts are useful on first visit.
if (!localStorage.getItem(TRANSACTION_KEY)) {
  const sampleTransactions = [
    { id: "sample-1", createdAt: "2026-10-17T09:20:00.000Z", accountNumber: "DEMO-1001", amount: 850, type: "Online purchase", location: "New York", risk: "Low", reason: "Amount and location look typical for this demo.", status: "Pending" },
    { id: "sample-2", createdAt: "2026-10-17T11:05:00.000Z", accountNumber: "DEMO-1002", amount: 6200, type: "Transfer", location: "Chicago", risk: "Medium", reason: "Unusual amount: transaction is at least 5,000.", status: "Under Review" },
    { id: "sample-3", createdAt: "2026-10-17T13:45:00.000Z", accountNumber: "DEMO-1003", amount: 12500, type: "Withdrawal", location: "International", risk: "High", reason: "International location is flagged by the demo rule.", status: "Pending" }
  ];
  localStorage.setItem(TRANSACTION_KEY, JSON.stringify(sampleTransactions));
  localStorage.setItem(ALERT_KEY, JSON.stringify(sampleTransactions.filter(item => item.risk !== "Low")));
}

if (!sessionStorage.getItem("demoUserName")) window.location.replace("login.html");
const userName = sessionStorage.getItem("demoUserName") || "Student";
document.getElementById("sidebarName").textContent = userName;
document.getElementById("welcomeName").textContent = userName;

function readTransactions() {
  try { return JSON.parse(localStorage.getItem(TRANSACTION_KEY)) || []; }
  catch (error) { return []; }
}
function saveTransactions(items) {
  localStorage.setItem(TRANSACTION_KEY, JSON.stringify(items));
  // Alerts are a separate stored list for the alerts screen; the transaction is the source record.
  localStorage.setItem(ALERT_KEY, JSON.stringify(items.filter(item => item.risk !== "Low")));
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
  });
}
function money(amount) { return Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function riskTag(risk) { return '<span class="risk-pill risk-' + risk.toLowerCase() + '">' + escapeHtml(risk) + '</span>'; }
function emptyRow(columns, message) { return '<tr><td class="empty-cell" colspan="' + columns + '">' + message + '</td></tr>'; }

function render() {
  const items = readTransactions().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const suspicious = items.filter(item => item.risk !== "Low");
  document.getElementById("totalAccounts").textContent = accounts.length;
  document.getElementById("totalTransactions").textContent = items.length;
  document.getElementById("totalSuspicious").textContent = suspicious.length;
  document.getElementById("alertNavCount").textContent = suspicious.length;
  const accountSelect = document.getElementById("accountNumber");
  if (accountSelect.options.length === 0) {
    accountSelect.innerHTML = '<option value="">Choose an account</option>' + accounts.map(a => '<option value="' + a.number + '">' + a.number + ' · ' + a.holder + '</option>').join("");
  }
  document.getElementById("recentTable").innerHTML = items.length ? items.slice(0, 5).map(transactionRow).join("") : emptyRow(6, "No transactions yet. Add one to see the Java fraud check in action.");
  document.getElementById("historyTable").innerHTML = renderHistory(items);
  document.getElementById("alertsTable").innerHTML = suspicious.length ? suspicious.map(alertRow).join("") : emptyRow(6, "No suspicious transactions to review.");
}
function transactionRow(item) {
  return '<tr><td>' + escapeHtml(new Date(item.createdAt).toLocaleString()) + '</td><td>' + escapeHtml(item.accountNumber) + '</td><td>' + escapeHtml(item.type) + '</td><td>' + money(item.amount) + '</td><td>' + escapeHtml(item.location) + '</td><td>' + riskTag(item.risk) + '</td></tr>';
}
function renderHistory(items) {
  const search = document.getElementById("historySearch").value.toLowerCase().trim();
  const matches = items.filter(item => [item.accountNumber, item.type, item.location, item.risk].join(" ").toLowerCase().includes(search));
  return matches.length ? matches.map(transactionRow).join("") : emptyRow(6, "No matching transactions.");
}
function alertRow(item) {
  const statuses = ["Pending", "Under Review", "Resolved"];
  const options = statuses.map(status => '<option' + (item.status === status ? " selected" : "") + '>' + status + '</option>').join("");
  return '<tr><td>' + escapeHtml(new Date(item.createdAt).toLocaleString()) + '</td><td>' + escapeHtml(item.accountNumber) + '</td><td>' + money(item.amount) + '</td><td>' + escapeHtml(item.location) + '</td><td>' + escapeHtml(item.reason) + ' ' + riskTag(item.risk) + '</td><td><select class="status-select" data-id="' + escapeHtml(item.id) + '" aria-label="Alert status">' + options + '</select></td></tr>';
}

const titles = { dashboard: "Dashboard", transaction: "New transaction", alerts: "Fraud alerts", history: "Transaction history" };
function showView() {
  const view = location.hash.slice(1) || "dashboard";
  const selected = titles[view] ? view : "dashboard";
  document.querySelectorAll(".view").forEach(section => section.classList.add("hidden"));
  document.getElementById("view-" + selected).classList.remove("hidden");
  document.querySelectorAll(".nav-link[data-view]").forEach(link => link.classList.toggle("active", link.dataset.view === selected));
  document.getElementById("pageTitle").textContent = titles[selected];
  if (selected === "history") document.getElementById("historyTable").innerHTML = renderHistory(readTransactions());
}

document.getElementById("transactionForm").addEventListener("submit", async function (event) {
  event.preventDefault();
  const message = document.getElementById("formMessage");
  message.className = "message";
  message.textContent = "Contacting the Java fraud detection Servlet…";
  const form = new URLSearchParams({
    accountNumber: document.getElementById("accountNumber").value,
    amount: document.getElementById("amount").value,
    type: document.getElementById("type").value,
    location: document.getElementById("location").value
  });
  try {
    // This request goes to the real Java Servlet deployed in the same Tomcat app.
    const response = await fetch("api/fraud-check", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }, body: form.toString() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "The fraud check failed.");
    const items = readTransactions();
    items.push({ id: "txn-" + Date.now() + "-" + Math.random().toString(16).slice(2, 7), createdAt: new Date().toISOString(), accountNumber: result.accountNumber, amount: Number(document.getElementById("amount").value), type: result.type, location: document.getElementById("location").value, risk: result.risk, reason: result.reason, status: "Pending" });
    saveTransactions(items);
    message.className = "message success";
    message.textContent = "Servlet result: " + result.risk + " risk. " + result.reason + " Transaction saved in this browser.";
    this.reset();
    render();
  } catch (error) {
    message.className = "message error";
    message.textContent = "Could not complete the Java fraud check: " + error.message + " Make sure the project is deployed on Tomcat.";
  }
});

document.getElementById("alertsTable").addEventListener("change", function (event) {
  if (!event.target.matches(".status-select")) return;
  const items = readTransactions();
  const found = items.find(item => item.id === event.target.dataset.id);
  if (found) { found.status = event.target.value; saveTransactions(items); render(); }
});
document.getElementById("historySearch").addEventListener("input", () => { document.getElementById("historyTable").innerHTML = renderHistory(readTransactions()); });
document.getElementById("logoutButton").addEventListener("click", function () { sessionStorage.removeItem("demoUserName"); window.location.href = "login.html"; });
window.addEventListener("hashchange", showView);
render();
showView();
