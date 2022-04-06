const { ipcRenderer } = require("electron");
// Change Directory
document.getElementById("ChangeDirButton").addEventListener("click", () => {
  ipcRenderer.send("select-dirs");
});
// Start Server
document.getElementById("StartServerButton").addEventListener("click", () => {
  ipcRenderer.send("toggle-server");
});
// Synchronous message emmiter and handler
console.log(ipcRenderer.sendSync("Marco"));

ipcRenderer.on("WatchedDirectory", (e, arg) => {
  document.getElementById("CurrentDir").innerHTML = arg;
});
ipcRenderer.on("toggled-server", (e, arg) => {
  let btn = document.getElementById("StartServerButton");
  btn.classList.toggle("stopped");
  btn.classList.toggle("started");
  btn.innerHTML = btn.classList.contains("stopped")
    ? "Start Server"
    : "Stop Server";
});
