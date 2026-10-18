// The demo stores only a display name in this tab's temporary session storage.
if (sessionStorage.getItem("demoUserName")) window.location.replace("index.html");
document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();
  sessionStorage.setItem("demoUserName", document.getElementById("displayName").value.trim());
  window.location.href = "index.html";
});
