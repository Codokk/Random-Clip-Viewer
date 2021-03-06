const { ipcRenderer } = require("electron");
// Change Directory
document
  .getElementById("ClipsDirectoryContainer")
  .addEventListener("click", () => {
    SendLog("Requesting Directory Dialog");
    ipcRenderer.send("select-dirs");
  });
// Start Server
document.getElementById("StartServerButton").addEventListener("click", () => {
  SendLog("Requesting Server Start");
  ipcRenderer.send("toggle-server");
});
// Update Settings
document.getElementById("UpdateSettings").addEventListener("click", () => {
  SendLog("Requesting Settings Update");
  ipcRenderer.send("UpdatePort", document.getElementById("Port").value);
});
// Quit app
document.getElementById("QuitButton").addEventListener("click", () => {
  Log("Exiting...", 'red');
  ipcRenderer.send("quit");
});
// Synchronous message emmiter and handler
SendLog("Marco");
ReceiveLog(ipcRenderer.sendSync("Marco"));

ipcRenderer.on("WatchedDirectory", (e, arg) => {
  ReceiveLog("Got New Clip Directory");
  document.getElementById("ClipsDirectory").value = arg;
});
ipcRenderer.on("Port", (e, arg) => {
  Badge("Port Updated");
  ReceiveLog("Got New Port");
  document.getElementById("Port").value = arg;
  document.getElementById("BrowserSourceUrl").value = "http://localhost:" + arg;
});
ipcRenderer.on("toggled-server", (e, arg) => {
  ReceiveLog("Server Started -- Toggle Button");
  let btn = document.getElementById("StartServerButton");
  btn.classList.toggle("red");
  btn.innerHTML = !btn.classList.contains("red")
    ? "Start Server"
    : "Stop Server";
});
function Badge(title, content) {
  console.log("Badging");
  let badge = document.createElement("div");
  let badgeTitle = document.createElement("div");
  let badgeContent = document.createElement("div");
  badgeTitle.classList.add("card-title", "white-text");
  badgeTitle.innerHTML = "&nbsp;" + title + "&nbsp;";
  badge.appendChild(badgeTitle);
  badge.classList.add("card", "blue-grey", "darken-1", "invisible");
  document.getElementById("Overlay").appendChild(badge);
  setTimeout(() => {
    badge.classList.remove("invisible");
    setTimeout(() => {
      badge.classList.add("invisible");
      setTimeout(() => {
        document.getElementById("Overlay").removeChild(badge);
      }, 1000);
    }, 5000);
  }, 1000);
}
function Log(content, color = null) {
  let entry = document.createElement("div");
  if (color != null) entry.classList.add(color + "-text");
  entry.innerHTML = content;
  document.getElementById("Console").appendChild(entry);
}
function SendLog(content) {
  Log("Client: - " + content, "blue");
}
function ReceiveLog(content) {
  Log("Server: - " + content, "green");
}
