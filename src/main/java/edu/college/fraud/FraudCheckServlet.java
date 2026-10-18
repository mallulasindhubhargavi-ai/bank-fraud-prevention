package edu.college.fraud;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/** Receives a transaction from the browser and applies simple demo risk rules. */
@WebServlet("/api/fraud-check")
public class FraudCheckServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String accountNumber = clean(request.getParameter("accountNumber"));
        String location = clean(request.getParameter("location"));
        String type = clean(request.getParameter("type"));
        double amount;
        try {
            amount = Double.parseDouble(request.getParameter("amount"));
            if (amount <= 0 || amount > 1000000) throw new NumberFormatException();
        } catch (Exception ex) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(response, "{\"error\":\"Enter a valid amount greater than 0 and no more than 1,000,000.\"}");
            return;
        }
        if (accountNumber.isEmpty() || location.isEmpty() || type.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(response, "{\"error\":\"Account number, type, and location are required.\"}");
            return;
        }

        String risk = "Low";
        String reason = "Amount and location look typical for this demo.";
        // These simple thresholds are for learning only, not real banking decisions.
        if (amount >= 10000) {
            risk = "High";
            reason = "Large transaction: amount is at least 10,000.";
        } else if (amount >= 5000) {
            risk = "Medium";
            reason = "Unusual amount: transaction is at least 5,000.";
        }
        if (location.equalsIgnoreCase("International")) {
            risk = "High";
            reason = "International location is flagged by the demo rule.";
        } else if (location.equalsIgnoreCase("Unknown") && !risk.equals("High")) {
            risk = "Medium";
            reason = "Unknown location needs a manual review.";
        }

        String json = "{\"risk\":\"" + risk + "\",\"reason\":\"" + escape(reason)
                + "\",\"accountNumber\":\"" + escape(accountNumber) + "\",\"type\":\""
                + escape(type) + "\"}";
        writeJson(response, json);
    }

    private String clean(String value) { return value == null ? "" : value.trim(); }
    private String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }
    private void writeJson(HttpServletResponse response, String json) throws IOException {
        try (PrintWriter out = response.getWriter()) { out.print(json); }
    }
}
