export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Only POST requests are supported." }, 405);
  }

  const fields = await request.formData();
  const accountNumber = clean(fields.get("accountNumber"));
  const location = clean(fields.get("location"));
  const type = clean(fields.get("type"));
  const amount = Number(fields.get("amount"));

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
    return json({ error: "Enter a valid amount greater than 0 and no more than 1,000,000." }, 400);
  }
  if (!accountNumber || !location || !type) {
    return json({ error: "Account number, type, and location are required." }, 400);
  }

  let risk = "Low";
  let reason = "Amount and location look typical for this demo.";
  if (amount >= 10000) {
    risk = "High";
    reason = "Large transaction: amount is at least 10,000.";
  } else if (amount >= 5000) {
    risk = "Medium";
    reason = "Unusual amount: transaction is at least 5,000.";
  }
  if (location.toLowerCase() === "international") {
    risk = "High";
    reason = "International location is flagged by the demo rule.";
  } else if (location.toLowerCase() === "unknown" && risk !== "High") {
    risk = "Medium";
    reason = "Unknown location needs a manual review.";
  }

  return json({ risk, reason, accountNumber, type });
};

function clean(value) {
  return value == null ? "" : String(value).trim();
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=UTF-8" }
  });
}

