const {remote, ipcRenderer} = require('electron');
const gameWindow = remote.getCurrentWindow();
const consts = require('./constants.js');
const Store = require('electron-store');
const config = new Store();
const Utilities = require('./utilities.js');
const ControllerSupport = require('./controller.js');
gameWindow.webContents.setAudioMuted(true);

window.prompt = (text) => {
    return ipcRenderer.sendSync('prompt', text);
}

ipcRenderer.on('esc', () => {
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    document.exitPointerLock();
});
ipcRenderer.on('ACTIVITY_JOIN_REQUEST', (event, data) => {
    if (!config.get('utilities_showInvites', true)) return window.rp.sendIgnore(data.user);
    
    window.rp.insertNotification(data.user);
});
ipcRenderer.on('log', console.log);

var seekNew = () => {
    let region = localStorage.getItem(consts.PING_REGION_CACHE_KEY) || 'sid-utils:ping-region';
    fetch('https://matchmaker.krunker.io/game-list?hostname=' + location.hostname)
        .then(res => res.json())
        .then(json => {
            if (!json.error) {
                json = json.filter(x => !x.data.cs && x.clients != x.maxClients && x.clients > 0 && x.region == region);
                if (json.length) {
                   // return window.switchServer(json[Math.floor(Math.random() * json.length)].id);
                    return gameWindow.loadURL(location.origin + "/?game=" + json[Math.floor(Math.random() * json.length)].id, {"extraHeaders" : "pragma: no-cache\n"});
                }
            }
            gameWindow.loadURL(location.origin, {"extraHeaders" : "pragma: no-cache\n"});
        })
        .catch(console.warn);
};

ipcRenderer.on('seek', _ => seekNew());

const RichPresence = window.rp = {

    init() {
        this.gameInfo = null;
        
        if (gameWindow.rpc.isConnected) this.sendDefault();
        this.getGameInfo();
        setInterval(() => {
            RichPresence.update();
        }, 15e3);
        setInterval(() => {
            RichPresence.getGameInfo();
        }, 25000);
    },

    getGameInfo() {
        if (!(this.info && this.info.id) || this.isIdle() || !gameWindow.rpc.isConnected) return;
        fetch('https://matchmaker.krunker.io/game-info?game=' + this.info.id)
            .then(res => res.json())
            .then(json => {
                this.gameInfo = json;
            })
            .catch(console.warn);
    },
    
    getPlayers() {
        return this.gameInfo ? ' - (' + this.gameInfo.clients + ' of ' + this.gameInfo.maxClients + ')' : '';
    },

    isIdle() {
        return instructionHolder.innerText.includes('Try seeking a new game');
    },

    update() {
        if (!gameWindow.rpc.isConnected) return;
        if (location.href.isEditor()) return this.sendEditor();
        if (location.href.isViewer()) return this.sendViewer();
        if (location.href.isSocial()) return this.sendSocial();
        if (location.href.isGame()) return this.isIdle() ? this.sendIdle() : this.sendGame();
    },

    sendGame() {
        this.info = window.getGameActivity();
        if (!this.info || !this.info.mode) return this.sendDefault();
        let activity = {
            largeImageKey: 'icon',
            largeImageText: this.info.user,
            instance: true
        };
        if (this.info.time) activity.endTimestamp = Math.floor(Date.now()/1000) + this.info.time;
        if (this.info.id) {
            activity.partyId = this.info.id;
            activity.joinSecret = location.hostname + '|join|' + this.info.id;
        }
        /*
        activity.partyId = 'party_id';
        activity.partySize = 1;
        activity.partyMax = 5;
        activity.joinSecret = 'join_secret';
        activity.matchSecret = this.getGameId();
        */

        if (this.info.class.index) {
            activity.smallImageKey = 'icon_' + this.info.class.index;
            activity.smallImageText = this.info.class.name;
        }

        activity.details = (this.info.custom ? 'Custom Match' : 'Public Match') + this.getPlayers();
        activity.state = this.info.mode + " on " + this.info.map;
        gameWindow.rpc.setActivity(activity);
    },

    sendEditor() {
        gameWindow.rpc.setActivity({
            details: 'making a map',
            largeImageKey: 'icon',
            instance: false
        });
    },
    
    sendViewer() {
        gameWindow.rpc.setActivity({
            details: 'browsing viewer',
            largeImageKey: 'icon',
            instance: false
        });
    },

    sendSocial() {
        gameWindow.rpc.setActivity({
            details: 'browsing social',
            largeImageKey: 'icon',
            instance: false
        });
    },

    sendIdle() {
        gameWindow.rpc.setActivity({
            details: 'idle',
            largeImageKey: 'icon',
            instance: false
        });
    },

    sendDefault() {
        gameWindow.rpc.setActivity({
            details: 'in the menu',
            largeImageKey: 'icon',
            instance: false
        });
    },
    
    sendIgnore(user) {
        gameWindow.rpc.closeJoinRequest(user);
    },
    
    sendAccept(user) {
        gameWindow.rpc.sendJoinInvite(user);
    },
    
    insertNotification(user) {
        if (this.gameInfo && this.gameInfo.clients == this.gameInfo.maxClients) return this.sendIgnore(user);
        for (chatList.innerHTML += `<div class='chatItem'>${user.username} -> <span class='chatMsg'>
            <input onclick='window.rp.sendAccept(${JSON.stringify(user)}); this.parentNode.innerHTML = "Accepted";' type='button' value='Accept' style='color: green'>
            <input onclick='window.rp.sendIgnore(${JSON.stringify(user)}); this.parentNode.innerHTML = "Declined";' type='button' value='Decline' style='color: red'></span></div><br/>`; 
            chatList.scrollHeight >= 250;) chatList.removeChild(chatList.childNodes[0])
    }
};

document.addEventListener("DOMContentLoaded", () => {
    gameWindow.webContents.setAudioMuted(false);

    RichPresence.init();
    ControllerSupport.init();

    if (location.href.match(consts.GAME_REGEX)) {
        window.utilities = new Utilities();
    } else if (location.href.match(consts.EDITOR_REGEX)) {
        window.onbeforeunload = null;
    }
}, false);