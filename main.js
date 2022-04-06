// Electron Requirements
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
require('update-electron-app')({updateInterval: '1 hour'})
const path = require("path");
const fs = require("fs");
// Webserver Requirements
const express = require("express");
const xpress = express();
// Default Stuff incase store doesn't loadFile
let port = 8675; //309
let WatchPath = "Unset";
// Settings Requirements
const Store = require("./store.js");
let store = new Store();
port = store.get("port");
WatchPath = store.get("path");

let isServerRunning = false;
let mainWindow;
let allVideos = new Array();
let availVideos = new Array();
let Server;
const supportedExtensions = [".mp4"];

const createWindow = () => {
  //Opens the Control Pannel
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile("control/CP.html");
};
/* Express Routing */
xpress.get("/", (req, res) => {
  res.setHeader("Feature-Policy","autoplay 'self'");
  res.sendFile(__dirname + "/view/View.html");

});
xpress.get("/randomvideo", (req, res) => {
  // Handles the logic of which video to play
  console.log("Getting Random Video");
  let randomVideoNum = Math.floor(Math.random() * (availVideos.length - 1));
  let idex = allVideos.indexOf(availVideos[randomVideoNum]);
  res.send(`{"index":${idex}, "left": ${availVideos.length}}`);
  availVideos.splice(randomVideoNum, 1);
  if (availVideos.length < 1) availVideos = allVideos;
});
xpress.get("/playvideo/:id", (req, res) => {
  // Plays video at index given
  let id = req.params.id;
  console.log(id);
  let vid = path.join(WatchPath, allVideos[id]);

  let stat = fs.statSync(vid);
  let total = stat.size;
  if (req.headers.range) {
    // meaning client (browser) has moved the forward/back slider
    // which has sent this request back to this server logic ... cool

    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;
    var chunksize = end - start + 1;

    var file = fs.createReadStream(vid, { start: start, end: end });
    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": total,
      "Content-Type": "video/mp4",
    });
    fs.createReadStream(vid).pipe(res);
  }
});
/* IPC Code */
ipcMain.on("Marco", (e, args) => {
  e.returnValue = "Polo";
  e.sender.send("WatchedDirectory", WatchPath);
  e.sender.send("Port", port);
});
ipcMain.on("select-dirs", async (e, args) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  console.log("directories selected", result.filePaths);
  let newPath = result.filePaths[0];
  e.sender.send("WatchedDirectory", newPath);
  WatchPath = newPath;
  store.set('path', newPath);
  ScanVideos();
});
ipcMain.on("toggle-server", async (e, args) => {
  if (isServerRunning) {
    Server.close();
  } else {
    ScanVideos();
    Server = xpress.listen(port);
  }
  isServerRunning = !isServerRunning;
  e.sender.send("toggled-server");
});

function ScanVideos() {
  allVideos = new Array();
  try {
    fs.readdir(WatchPath, (e, files) => {
      if (e) console.log(e);
      files.forEach((f) => {
        allVideos.push(f);
      });
      availVideos = allVideos;
      console.log("VIDEOS DONE!");
    });
  } catch {
    console.log("Couldn't Read That Directory");
  }
}

/* Startup Code */
app.whenReady().then(() => {
  createWindow();
  //Mac Code
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
