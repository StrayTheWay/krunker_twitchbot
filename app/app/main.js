const electron = require('electron');
const {BrowserWindow, app, shell, Menu, ipcMain} = electron;
const localshortcut = require('electron-localshortcut');
const consts = require('./constants.js');
const url = require('url');
const prompt = require('electron-prompt');
const {autoUpdater} = require('electron-updater');
const Store = require('electron-store');
const config = new Store();
const fs = require('fs');
const DiscordRPC = require('discord-rpc');
const TwitchBot = require('twitch-bot');
var {oauth_token, twitch_autolink, channel_name, bot_username} = require('../../config.json');


let rpc = null;
let gameWindow = null,
    splashWindow = null,
    promptWindow = null;

const initSwitches = () => {
    if (consts.DEBUG) app.commandLine.appendSwitch('show-fps-counter');
    if (config.get('utilities_inputLagFix', false)) app.commandLine.appendSwitch('disable-accelerated-2d-canvas');
    if (!config.get('utilities_compMode', false) && config.get('utilities_unlimitedFrames', false)) {
        if (consts.isAMDCPU) {
            app.commandLine.appendSwitch('disable-zero-copy');
            app.commandLine.appendSwitch('ui-disable-partial-swap');
        }
        app.commandLine.appendSwitch('disable-frame-rate-limit');
    }
    app.commandLine.appendSwitch('force-color-profile', config.get('utilities_colorProfile', 'default'));
    app.commandLine.appendSwitch("disable-http-cache");
    app.commandLine.appendSwitch('ignore-gpu-blacklist', true);
}; initSwitches();

const initAppMenu = () => {
  	if (process.platform == 'darwin'){
	    const template = [{
	        label: "Application",
	        submenu: [
	            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
	            { type: "separator" },
	            { label: "Quit", accelerator: "Command+Q", click: _ => app.quit()}
	        ]}, {
	        label: "Edit",
	        submenu: [
	            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
	            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
	            { type: "separator" },
	            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
	            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
	            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
	            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
	        ]}
	    ];
	    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
	}  
}; initAppMenu();

const initDiscordRPC = () => {
    DiscordRPC.register(consts.DISCORD_ID);
    rpc = new DiscordRPC.Client({ transport: 'ipc' });
    rpc.isConnected = false;

    rpc.on('error', console.error);

    rpc.login({'clientId': consts.DISCORD_ID})
        .then(() => {
            rpc.isConnected = true;
            rpc.on('RPC_MESSAGE_RECEIVED', (event) => {
                if (!gameWindow) return;
                gameWindow.webContents.send('log', ['RPC_MESSAGE_RECEIVED', event]);
            });
            rpc.subscribe('ACTIVITY_JOIN', ({ secret }) => {
                if (!gameWindow) return;
                let parse = secret.split('|');
                if (parse[2].isCode()) {
                    gameWindow.loadURL('https://' + parse[0] + '/?game=' + parse[2], consts.NO_CACHE);
                }
            });

            rpc.subscribe('ACTIVITY_JOIN_REQUEST', (user) => {
                if (!gameWindow) return;
                gameWindow.webContents.send('ACTIVITY_JOIN_REQUEST', user);
            });
        })
        .catch(console.error);
}; initDiscordRPC();

if(twitch_autolink == true){
	const initTwitch = () => {
		const Bot = new TwitchBot({
			username: bot_username,
			oauth: oauth_token,
			channels: channel_name
		});

		Bot.on('message', chatter => {
			if(chatter.message.toLowerCase() === 'link' || chatter.message.toLowerCase() === '!link') {
				Bot.say(gameWindow.webContents.getURL());
			}else if(chatter.message.toLowerCase() === '!wutlul'){
				Bot.say("You can find the source code for this bot on Github under StrayTheWay...");
			}
		})
	}; initTwitch();	
}

const initGameWindow = () => {
    const {width, height} = electron.screen.getPrimaryDisplay().workArea;
	gameWindow = new BrowserWindow({
			width: 1600,
			height: 900,
			show: false,
			webPreferences: {
                nodeIntegration: false,
				webSecurity: false,
				preload: consts.joinPath(__dirname, 'preload.js')
			}
		});

	gameWindow.setMenu(null);
    gameWindow.rpc = rpc;
    
    let swapFolder = consts.joinPath(app.getPath('documents'), '/KrunkerResourceSwapper');

    fs.mkdir(swapFolder, { recursive: true }, e => {});
    let swap = {filter: {urls: []}, files: {}};
    const allFilesSync = (dir, fileList = []) => {
        fs.readdirSync(dir).forEach(file => {
            const filePath = consts.joinPath(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                allFilesSync(filePath);
            } else {
                if (!file.includes('.js')) {
                    let krunk = '*://krunker.io' + filePath.replace(swapFolder, '').replace(/\\/g, '/') + '*';
                    swap.filter.urls.push(krunk);
                    swap.files[krunk] = url.format({
                        pathname: filePath,
                        protocol: 'file:',
                        slashes: true
                    });
                }
            }
        });
    };
    allFilesSync(swapFolder);
    if (swap.filter.urls.length) {
        gameWindow.webContents.session.webRequest.onBeforeRequest(swap.filter, (details, callback) => {
            callback({cancel: false, redirectURL: swap.files[details.url] || details.url});
        });
    }
    
	gameWindow.loadURL('https://krunker.io/', consts.NO_CACHE);

    let nav = (e, url) => {
        e.preventDefault();
        if (url.isKrunker()) {
            gameWindow.loadURL(url, consts.NO_CACHE);
        } else { 
            shell.openExternal(url);
        }
    };

    gameWindow.webContents.on('new-window', nav);
	gameWindow.webContents.on('will-navigate', nav);

	gameWindow.once('ready-to-show', () => {
        if (consts.DEBUG) gameWindow.webContents.openDevTools({ mode: 'undocked' });
		if (config.get('fullscreen', false)) gameWindow.setFullScreen(true);
		splashWindow.destroy();
		//gameWindow.maximize();
		gameWindow.show();
	});

	//gameWindow.on('unmaximize', () => gameWindow.maximize());

	gameWindow.on('closed', () => {
		gameWindow = null;
	});
    
    initShortcuts();
};

const initSplashWindow = () => {
	splashWindow = new BrowserWindow({
			width: 650,
			height: 370,
			transparent: true,
			frame: false,
			skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true
            }
		});
	splashWindow.setMenu(null);
	splashWindow.setResizable(false);
	splashWindow.loadURL(url.format({
			pathname: consts.joinPath(__dirname, 'splash.html'),
			protocol: 'file:',
			slashes: true
		}));
    splashWindow.webContents.on('did-finish-load', () => initUpdater());
    if (consts.DEBUG) splashWindow.webContents.openDevTools({ mode: 'undocked' });
};

const initPromptWindow = () => {
	let response;

	ipcMain.on('prompt', (event, text) => {
		response = null;

		promptWindow = new BrowserWindow({
			width: 300,
			height: 157,
			show: false,
			frame: false,
			skipTaskbar: true,
	      	alwaysOnTop: true,
		    resizable: false,
		    movable: false,
		});

		promptWindow.loadURL(url.format({
				pathname: consts.joinPath(__dirname, 'prompt.html'),
				protocol: 'file:',
				slashes: true
			}));
		if (consts.DEBUG) promptWindow.webContents.openDevTools({ mode: 'undocked' });

		promptWindow.webContents.on('did-finish-load', () => {
			promptWindow.show();
            promptWindow.webContents.send('text', `${text}`);
		});

		promptWindow.on('closed', () => {
			event.returnValue = response;
			promptWindow = null;
		})

	});
	ipcMain.on('prompt-response', (event, args) => {
		response = args === '' ? null : args;
	});
}; initPromptWindow();

const initUpdater = () => {
    if (consts.DEBUG || process.platform == 'darwin') return initGameWindow();
    autoUpdater.on('checking-for-update', (info) => splashWindow.webContents.send('checking-for-update'));    

    autoUpdater.on('error', (err) => {
        splashWindow.webContents.send('update-error', err);
        setTimeout(() => initGameWindow(), 2000);
        //app.quit();
    });    

    autoUpdater.on('download-progress', (info) => splashWindow.webContents.send('download-progress', info));

    autoUpdater.on('update-available', (info) => splashWindow.webContents.send('update-available', info));

    autoUpdater.on('update-not-available', (info) => {
        splashWindow.webContents.send('update-not-available', info);
        setTimeout(() => initGameWindow(), 2000);
    });

    autoUpdater.on('update-downloaded', (info) => {
        splashWindow.webContents.send('update-downloaded', info);
        setTimeout(() => autoUpdater.quitAndInstall(), 5000);
    });
    
    autoUpdater.checkForUpdates();
}

const initShortcuts = () => {
	const KEY_BINDS = {
		escape: {
			key: 'Esc',
			press: _ => gameWindow.webContents.send('esc')
		},
		quit: {
			key: 'Alt+F4',
			press: _ => app.quit()
		},
		refresh: {
			key: 'F5',
			press: _ => gameWindow.webContents.reloadIgnoringCache()
		},
		fullscreen: {
			key: 'F11',
			press: _ => {
				let full = !gameWindow.isFullScreen();
				gameWindow.setFullScreen(full);
				config.set("fullscreen", full);
			}
		},
		menu: {
			key: 'Ctrl+Tab',
			press: _ => {
                prompt({
                    title: 'Pick where you want to go',
                    value: 'New Match',
                    type: 'select',
                    selectOptions: {
                        'new': 'New Match',
                        'social.html': 'Social',
                        'editor.html': 'Map Editor'
                    }
                })
                .then((r) => {
                    if (r == "new") {
                        gameWindow.webContents.send('seek');
                    } else if (r) {
                        gameWindow.loadURL("https://krunker.io/" + r, consts.NO_CACHE);
                    }
                })
                .catch(console.error);
			}
		},
		clearConfig: {
			key: 'Ctrl+F1',
			press: _ => {
				config.store = {};
		        app.relaunch();
		        app.quit();		
			}
		},
		openConfig: {
			key: 'Shift+F1',
			press: _ => config.openInEditor(),
		}
	}
	Object.keys(KEY_BINDS).forEach(k => {
		localshortcut.register(gameWindow, KEY_BINDS[k].key, () => KEY_BINDS[k].press());
	});
}

app.on('ready', () => initSplashWindow());
app.on('activate', () => {
	if (gameWindow === null && (splashWindow === null || splashWindow.isDestroyed())) initSplashWindow();
});
app.on('before-quit', () => {
    rpc.destroy().catch(console.error);
    localshortcut.unregisterAll();
    gameWindow.close();
});
app.on('window-all-closed', () => app.quit());