const { app, BrowserWindow } = require('electron');
const is_dev = require('electron-is-dev');

let win = null;

app.allowRendererProcessReuse = true;
app.contextIsolation = true;

app.on('window-all-closed', () => {
  if(process.platform != 'darwin') {
    app.exit();
  }
});

app.on('ready', () => {
  win = new BrowserWindow({
    maximizable: false,
    resizable: false,
    height: 640,
    width: 480,
    show: false
  });

  win.loadURL(`file://${__dirname}/src/index.html`);
  win.setMenu(null);
  
  if(is_dev) {
    win.webContents.openDevTools();
  }

  win.on('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    win = null;
  });
});
