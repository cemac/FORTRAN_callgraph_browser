const debug = false;


if (debug) require("electron-reload")(__dirname);

const electron = require("electron");
const app = electron.app; 
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const screen = electron.screen;

var mainWindow;
var codeWindow;



app.on("window-all-closed", function() {
    if (process.platform != "darwin") {
        app.quit();
    }
});


app.on("ready", function() {
    
    const myLocation = "file://" + __dirname;
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;



    ///////// WINDOW SPLASH
    splashWindow = new BrowserWindow({
        width: 1020,
        height: 771,
        x: width/2-1020/2,
        y: height/2-771/2,
        resizable: false,
        title: "Loading Screen",
        webPreferences: { 
            nodeIntegration: true,
            enableRemoteModule: true
        },
        show: true,
        frame: false,
        icon:'./icon.png',
    });

    splashWindow.loadURL(myLocation +'/splash.html');


    //////// WINDOW MAIN
    mainWindow = new BrowserWindow({
        width: 0.6 * width-20,
        height: height - 10,
        x: 10,
        y: 10,
        resizable: true,
        title: "CodeSchema",
        webPreferences: { nodeIntegration: true },
        show: false,
        icon:'./icon.png'
    });

    mainWindow.loadURL(myLocation + "/index.html");

    /////// WINDOW CODE
    codeWindow = new BrowserWindow({
        width: 0.4 * width,
        height: height - 10,
        x: 0.6 * width,
        y: 10,
        resizable: true,
        title: "CodeViewer",
        webPreferences: { nodeIntegration: true },
        show: false,
     frame: true,
     icon:'./icon.png'
    });

    codeWindow.loadURL(myLocation + "/codewindow.html");






/////////////////////////
/// comms 
/////////////////////////

    ipcMain.on("ready", (event, data) => {
        splashWindow.close()
        codeWindow.show()
        mainWindow.show()
        mainWindow.webContents.send("start", []);
        
    });
    
    ipcMain.on("rescale", (event, data) => {
        codeWindow.webContents.send("rescale", data);
    });
    
    ipcMain.on("newcode", (event, arg) => {
        codeWindow.webContents.send("updatecode", arg);
    });

    ipcMain.on("highlightcode", (event, arg) => {
        codeWindow.webContents.send("highlight", arg);
    });

    // ALL
    const windows = [mainWindow, codeWindow];

    windows.forEach(d => {
        // closefns
        d.on("closed", function() {
            mainWindow = null;
            app.quit();
        });

        if (debug) d.openDevTools(); // and load the index.html of the app.
    });
});
