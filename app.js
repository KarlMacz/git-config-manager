const { app, BrowserWindow } = require('electron');
const is_dev = require('electron-is-dev');
const AutoLaunch = require('auto-launch');

require('./process');

let win = null;
let auto_launch = new AutoLaunch({
  name: 'Git Config Manager',
  path: app.getPath('exe')
});

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
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  auto_launch.isEnabled().then((is_enabled) => {
    if(!is_enabled) { 
      auto_launch.enable();
    }
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
