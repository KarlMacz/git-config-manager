const { app, BrowserWindow, Menu } = require('electron');

let win = null;

app.on('window-all-closed', () => {
  if(process.platform != 'darwin') {
    app.exit();
  }
});

app.on('ready', () => {
  win = new BrowserWindow({
    height: 480,
    width: 640,
    show: false
  });

  win.loadURL(`file://${__dirname}/src/index.html`);
  win.webContents.openDevTools();

  Menu.setApplicationMenu(null);

  win.on('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    win = null;
  });
});
