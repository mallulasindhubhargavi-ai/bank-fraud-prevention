# Bank Account Fraud Prevention System

A small second-year college project using HTML, CSS, vanilla JavaScript, Core Java Servlets, Tomcat, Local Storage, and Session Storage. All account names and numbers are fictional. The app is an educational demonstration, not a real fraud detection or banking system.

## Project structure

```text
BankAccountFraudPreventionSystem/
├── pom.xml
├── README.md
└── src/main/
    ├── java/edu/college/fraud/FraudCheckServlet.java
    └── webapp/
        ├── index.html
        ├── login.html
        ├── css/styles.css
        ├── js/app.js
        ├── js/login.js
        └── WEB-INF/web.xml
```

## Requirements

- JDK 11 or later
- Apache Maven 3.8 or later
- Apache Tomcat 10.1 (Tomcat 10 uses Jakarta Servlet APIs; Tomcat 9 uses the older `javax.servlet` API and is not compatible with this project as written)

## Build and run

1. Install the JDK, Maven, and Tomcat 10.1. Set `JAVA_HOME` to your JDK folder and confirm `java -version` and `mvn -version` work.
2. Open a terminal in the project folder (the folder containing `pom.xml`).
3. Build the deployable WAR file:

   ```sh
   mvn clean package
   ```

4. Copy `target/bank-fraud-prevention.war` into Tomcat's `webapps` folder.
5. Start Tomcat with `bin\startup.bat` on Windows, or `bin/startup.sh` on macOS/Linux. Tomcat deploys the WAR automatically.
6. Open `http://localhost:8080/bank-fraud-prevention/` in a browser. Sign in using any display name; this demo has no password.

### One-command run on this prepared Windows project

The project folder includes portable JDK, Maven, and Tomcat copies under `.tools` (excluded from source control because they are large). In PowerShell, run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\start-app.ps1
```

The script builds the WAR, copies it to the local Tomcat, starts Tomcat, and waits for the app to respond. Open the URL it prints. To stop the local server, run `.\stop-app.ps1` in PowerShell. Maven dependencies are cached in `.tools/m2` after the first build, so later builds use the local cache.

To stop Tomcat, run `bin\shutdown.bat` (Windows) or `bin/shutdown.sh` (macOS/Linux).

## How to demonstrate it

1. Sign in with a display name. The name is saved in Session Storage for this browser tab/session and removed on logout.
2. Select **New transaction**, choose one of the fictional accounts and enter an amount, type, and location.
3. Submit. The browser sends an HTTP POST to `api/fraud-check`; `FraudCheckServlet` evaluates the simple rules and returns JSON. The browser displays the actual Servlet result, then saves the transaction and returned reason to Local Storage.
4. Check the dashboard, alert list, and history. Search history by account, type, location, or risk, and update alert status.

### Demo risk rules in Java

- High: amount is 10,000 or more, or location is International.
- Medium: amount is 5,000 or more, or location is Unknown.
- Low: otherwise.

An amount rule that results in High remains High if the location is Unknown. The Java source is `src/main/java/edu/college/fraud/FraudCheckServlet.java`.

## Storage and communication

- **Local Storage:** fictional accounts, a few starter transactions, and a separate suspicious-alert list. Newly checked transactions and their alert statuses are saved here too. Data is local to the browser and can be cleared from browser storage.
- **Session Storage:** demo display name only; logout removes it. No password is used or stored.
- **HTTP:** the form sends URL-encoded fields to the Java Servlet. If Tomcat is not running or the app was opened directly as a file, the request fails and no transaction is saved.
- The Servlet rule thresholds are deliberately basic and only for a class demonstration. They do not establish a real person's identity or make real banking decisions.

## Viva explanation

The HTML defines the screens, CSS styles them, and JavaScript handles navigation and browser storage. On form submission, JavaScript uses `fetch()` to send the form fields to a Servlet running inside Tomcat. The Servlet applies the rules and sends a JSON response. JavaScript uses that response to show the result and store a transaction. Local Storage keeps demo transactions after a browser restart; Session Storage holds the temporary sign-in name. The application has no database.

## Deploy to Netlify

This project includes a Netlify configuration. Netlify hosts `src/main/webapp` as the frontend and runs `netlify/functions/fraud-check.mjs` as the fraud-check API. The `netlify.toml` rewrite keeps the browser request at `/api/fraud-check`.

For deployment, connect this project or its Git repository to Netlify. Netlify will read `netlify.toml`; no Maven, WAR, JDK, or Tomcat setup is needed for this version.

Do not upload the WAR file directly to Netlify. Manual drag-and-drop can deploy only the static frontend and will not deploy the function. Use a connected repository or Netlify CLI so both the frontend and function are deployed. The function contains the same educational risk rules as the Java Servlet.
