/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
// import sqlite from 'sqlite3';
import betterSqlite from 'better-sqlite3';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';


// let databasePath = 'src/Database/test.db';

let databasePath = 'db/test.db';



function createDataBase() {
  /**
   * starting connection
   */
  let database;
  try {
    database = betterSqlite(databasePath);
  } catch(err) {
    database = new betterSqlite(databasePath);
  }
  /**
   * creating table if not exists in the db
   */
  const sqlScript = `CREATE TABLE IF NOT EXISTS customer(
    id TEXT PRIMARY KEY,
    password TEXT NOT NULL);`;

  /**
   * run script
   */
  database.prepare(sqlScript).run();

  /**
   * close connection
   */
  database.close();

}

// const getAllCustomer = async () => {
//   /**
//    * starting connection
//    */

//   let page : number = 1;
//   const database = betterSqlite(databasePath);

//   /**
//    * selecting all in the interval to 10 for each page
//    */
//   const sqlScript = `SELECT * FROM 'customer'`;
//   // WHERE(id > ? AND id <= ?);`


//   /**
//    * preparing and running script
//    */

//   const dbResponse = database.prepare(sqlScript).all();
//   // const dbResponse = database.prepare(sqlScript).all(((page-1)*10), (page*10));

//   /**
//    * for pagination
//    *
//    * the number of all in database
//    */

//    const numberOfProducts = database.prepare('SELECT * FROM customer;').all().length;

//   /**
//    * organizing to be more clear in the react app
//    */
//   const productInfo = {
//     page,
//     pages: (numberOfProducts / 10) + 1
//   }
//   const response = {
//     data: dbResponse,
//     productInfo
//   };

//    /**
//     * disconect
//     */
//   database.close();
//   return response;
// }

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('searcDb', async() =>{
  const result = await getAllCustomer();
  return result;
});

ipcMain.handle('openFile',async ()=>{
  // await handleFileOpen();
  const result  = await dialog.showOpenDialog({ properties: ['openFile'] });
  return result;
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });


  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  //new AppUpdater();
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const handleFileOpen = async () => {
  const result  = await dialog.showOpenDialog({ properties: ['openFile'] });
  return result;
}

app
  .whenReady()
  .then(() => {
    // ipcMain.handle('searchDb',getAllCustomer);
    //ipcMain.handle('openFile', handleFileOpen)
    createWindow();
    createDataBase();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
