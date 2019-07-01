const {remote} = require('electron');
const Store = require('electron-store');
const config = new Store();
const consts = require('./constants.js');
const url = require('url');

class Utilities {
    constructor() {
        this.findingNew = false;
        this.deaths = 0;
        this.lastSent = 0;
        this.settings = null;
        this.onLoad();
    }

    createSettings() {
        inviteButton.insertAdjacentHTML("afterend", '\n<div class="button small" onmouseenter="playTick()" onclick="showWindow(window.windows.length-1);">Join</div>');
        subLogoButtons.insertAdjacentHTML("beforeend", '<div class="button small" onmouseenter="playTick()" onclick="showWindow(window.windows.length);">Utilities</div>');
        const selectStyle = `border: none; background: #eee; padding: 4px; float: right; margin-left: 10px;`;
        const textInputStyle = `border: none; background: #eee; padding: 6px; padding-bottom: 6px; float: right;`;
        this.settings = {
            unlimitedFrames: {
                name: "Unlimited FPS",
                pre: "<div class='setHed'><center>Utilities</center></div><div class='setHed'>Render</div><hr>",
                val: false,
                disabled: config.get('utilities_compMode', false),
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("unlimitedFrames", this.checked);'
                        ${this.settings.unlimitedFrames.val ? 'checked' : ''} ${this.settings.unlimitedFrames.disabled ? 'disabled': ''}>
                        <span class='slider'${this.settings.unlimitedFrames.disabled ? ' style="background-color:red"': ''}></span></label>`;
                }
            },
            colorProfile: {
                name: "Color Profile",
                val: 'default',
                html: _ => {
                    return `<select style='${selectStyle}' onchange='window.utilities.setSetting("colorProfile", this.value); alert("This setting requires a client restart to take effect");'>
                    <option value='default'${this.settings.colorProfile.val == 'default' ? ' selected' : ''}>Default</option>
                    <option value='srgb'${this.settings.colorProfile.val == 'srgb' ? ' selected' : ''}>sRGB</option>
                    <option value='generic-rgb'${this.settings.colorProfile.val == 'generic-rgb' ? ' selected' : ''}>Display P3 D65</option>
                    <option value='color-spin-gamma24'${this.settings.colorProfile.val == 'color-spin-gamma24' ? ' selected' : ''}>Color spin with gamma 2.4</option>
                    </select>`
                }
            },
            showLeaderboard: {
                name: "Show Leaderboard",
                val: true,
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("showLeaderboard", this.checked)' ${this.settings.showLeaderboard.val ? "checked" : ""}><span class='slider'></span></label>`;
                },
                set: val => {
                    leaderDisplay.style.display = val ? "block" : "none";
                }
            },
            showInvites: {
                name: "Show Invites",
                pre: "<br><div class='setHed'>Discord</div><hr>",
                val: true,
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("showInvites", this.checked)' ${this.settings.showInvites.val ? "checked" : ""}><span class='slider'></span></label>`;
                }
            },
            autoSearch: {
                name: "Auto-Search",
                pre: "<br><div class='setHed'>Match Making</div><hr>",
                val: false,
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("autoSearch", this.checked)' ${this.settings.autoSearch.val ? "checked" : ""}><span class='slider'></span></label>`;
                }
            },
            filterSelect: {
                name: 'Filters',
                val: {
                    region: "any",
                    mode: "any",
                    map: "any",
                    type: "any"
                },
                html: _ => {
                    return `
                        <select id="filterRegion" style='${selectStyle}' onchange="window.utilities.setSetting('filterSelect', {region: filterRegion.value, mode: filterMode.value, map: filterMap.value, type: filterType.value})">
                            <option value="any" ${this.settings.filterSelect.val.region == "any" ? "selected" : ""}>Region</option>
                            ${consts.MATCH_MAKING.REGIONS.map(v => `<option value="${v[0]}" ${this.settings.filterSelect.val.region == v[0] ? "selected" : ""}>${v[1]}</option>`).join('')}
                        </select>
                        <select id="filterMode" style='${selectStyle}' onchange="window.utilities.setSetting('filterSelect', {region: filterRegion.value, mode: filterMode.value, map: filterMap.value, type: filterType.value})">
                            <option value="any" ${this.settings.filterSelect.val.mode == "any" ? "selected" : ""}>Mode</option>
                            ${consts.MATCH_MAKING.MODES.map(v => `<option value="${v[0]}" ${this.settings.filterSelect.val.mode == v[0] ? "selected" : ""}>${v[1]}</option>`).join('')}
                        </select>
                        <select id="filterMap" style='${selectStyle}' onchange="window.utilities.setSetting('filterSelect', {region: filterRegion.value, mode: filterMode.value, map: filterMap.value, type: filterType.value})">
                            <option value="any" ${this.settings.filterSelect.val.map == "any" ? "selected" : ""}>Map</option>
                            ${consts.MATCH_MAKING.MAPS.map(v => `<option value="${v[0]}" ${this.settings.filterSelect.val.map == v[0] ? "selected" : ""}>${v[1]}</option>`).join('')}
                        </select>
                        <select id="filterType" style='${selectStyle}' onchange="window.utilities.setSetting('filterSelect', {region: filterRegion.value, mode: filterMode.value, map: filterMap.value, type: filterType.value})">
                            <option value="any" ${this.settings.filterSelect.val.type == "any" ? "selected" : ""}>Type</option>
                            ${consts.MATCH_MAKING.TYPES.map(v => `<option value="${v[0]}" ${this.settings.filterSelect.val.type == v[0] ? "selected" : ""}>${v[1]}</option>`).join('')}
                        </select>`;
                }               
            },
            minPlayersSlider: {
                name: "Min Players",
                val: 0,
                html: _ => {
                    return `<span class='sliderVal' id='slid_utilities_minPlayersSlider'>${this.settings.minPlayersSlider.val}</span><div class='slidecontainer'><input type='range' min='0' max='8' step='1' value='${this.settings.minPlayersSlider.val}' class='sliderM' oninput="window.utilities.setSetting('minPlayersSlider', this.value)"></div>`
                }
            },
            maxPlayersSlider: {
                name: "Max Players",
                val: 8,
                html: _ => {
                    return `<span class='sliderVal' id='slid_utilities_maxPlayersSlider'>${this.settings.maxPlayersSlider.val}</span><div class='slidecontainer'><input type='range' min='0' max='8' step='1' value='${this.settings.maxPlayersSlider.val}' class='sliderM' oninput="window.utilities.setSetting('maxPlayersSlider', this.value)"></div>`
                }
            },
            searchKeybind: {
                name: "Search Keybind",
                val: 'F4',
                html: _ => {
                    return `<input type='text' id='searchKeybind' placeholder='Keybind' name='text' style='${textInputStyle}; width: 100px; text-align: center' value='${this.settings.searchKeybind.val}' oninput='window.utilities.setSetting("searchKeybind", this.value)' style='float:right;margin-top:5px'/>`
                }
            },
            compMode: {
                name: "Competitive Mode",
                pre: "<br><div class='setHed'>Features</div><hr>",
                val: false,
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("compMode", this.checked)' ${this.settings.compMode.val ? "checked" : ""}><span class='slider'></span></label>`;
                },
                set: (val, init) => {
                    if (!init){
                        alert("App will now restart");
                        remote.app.relaunch();
                        remote.app.quit();
                    }
                }
            },
            // autoFindNew: {
            //     name: "New Lobby Finder",
            //     val: false,
            //     html: _ => {
            //         return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("autoFindNew", this.checked)' ${this.settings.autoFindNew.val ? "checked" : ""}><span class='slider'></span></label>`;
            //     }
            // },
            matchEndMessage: {
                name: "Match End Message",
                val: '',
                html: _ => {
                    return `<input type='text' id='matchEndMessage' placeholder='Match End Message' name='text' style='${textInputStyle}' value='${this.settings.matchEndMessage.val}' oninput='window.utilities.setSetting("matchEndMessage", this.value)' style='float:right;margin-top:5px'/>`
                }
            },
            deathCounter: {
                name: "Death Counter",
                val: false,
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("deathCounter", this.checked)' ${this.settings.deathCounter.val ? "checked" : ""}><span class='slider'></span></label>`;
                },
                set: val => {
                    document.getElementById('deathCounter').style.display = val ? "inline-block" : "none";
                }
            },
            forceChallenge: {
                name: "Force Challenge Mode",
                val: false,
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("forceChallenge", this.checked)' ${this.settings.forceChallenge.val ? "checked" : ""}><span class='slider'></span></label>`;
                },
                set: val => {
                    if (val && !challButton.lastElementChild.firstChild.checked) challButton.lastElementChild.firstChild.click();
                }
            },
            autoMod: {
                name: "Auto Load Mod",
                val: '',
                html: _ => {
                    return `<input type='text' id='autoMod' placeholder='Mod URL' name='text' style='${textInputStyle}' value='${this.settings.autoMod.val}' oninput='window.utilities.setSetting("autoMod", this.value)' style='float:right;margin-top:5px'/>`
                },
                set: val => {
                    if (val.length > 1) loadModPack(val, true);
                }
            },
            customCrosshair: {
                name: "Display",
                pre: "<br><div class='setHed'>Crosshair</div><hr>",
                val: 0,
                html: _ => {
                    return `<select style='${selectStyle}' onchange="window.utilities.setSetting('customCrosshair', this.value)">
                    <option value="0"${this.settings.customCrosshair.val == 0 ? " selected" : ""}>Normal</option>
                    <option value="1"${this.settings.customCrosshair.val == 1 ? " selected" : ""}>Custom</option>
                    <option value="2"${this.settings.customCrosshair.val == 2 ? " selected" : ""}>Custom & Normal</option>
                    </select>`
                },
                set: val => {
                    let options = ['customCrosshairShape', 'customCrosshairAlwaysShow', 'customCrosshairShadow', 'customCrosshairColor', 'customCrosshairLength', 'customCrosshairThickness'];
                    for (let opt of options) {
                        this.settings[opt].hide = val == 0;
                        let doc = document.getElementById(opt + '_div');
                        if (doc) doc.style.display = val == 0 ? 'none' : 'block';
                    }
                    this.settings.customCrosshairShape.set(this.settings.customCrosshairShape.val);
                }
            },
            customCrosshairShape: {
                name: "Style",
                val: 0,
                hide: true,
                html: _ => {
                    return `<select style='${selectStyle}' onchange="window.utilities.setSetting('customCrosshairShape', this.value)">
                    <option value="0"${this.settings.customCrosshairShape.val == 0 ? " selected" : ""}>Cross</option>
                    <option value="1"${this.settings.customCrosshairShape.val == 1 ? " selected" : ""}>Hollow Circle</option>
                    <option value="2"${this.settings.customCrosshairShape.val == 2 ? " selected" : ""}>Solid Circle</option>
                    <option value="3"${this.settings.customCrosshairShape.val == 3 ? " selected" : ""}>Image</option>
                    <option value="4"${this.settings.customCrosshairShape.val == 4 ? " selected" : ""}>Hollow Square</option>
                    <option value="5"${this.settings.customCrosshairShape.val == 5 ? " selected" : ""}>Solid Square</option>
                    </select>`
                },
                set: val => {
                    this.settings.customCrosshairImage.hide = this.settings.customCrosshair.val == 0 ? true: !(val == 3);
                    this.settings.customCrosshairShadow.hide = this.settings.customCrosshair.val == 0 ? true: val == 3;
                    let doc = document.getElementById('customCrosshairImage_div');
                    if (doc) doc.style.display = this.settings.customCrosshairImage.hide ? 'none' : 'block';
                    doc = document.getElementById('customCrosshairShadow_div');
                    if (doc) doc.style.display = this.settings.customCrosshairShadow.hide ? 'none' : 'block';
                }
            },
            customCrosshairImage: {
                name: "Image",
                val: '',
                hide: true,
                html: _ => {
                    return `<input type='url' id='customCrosshairImage' placeholder='Crosshair Image URL' name='text' style='${textInputStyle}' value='${this.settings.customCrosshairImage.val}' oninput='window.utilities.setSetting("customCrosshairImage", this.value)' style='float:right;margin-top:5px'/>`
                }
            },
            customCrosshairAlwaysShow: {
                name: "Always Show",
                val: false,
                hide: true,
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("customCrosshairAlwaysShow", this.checked)' ${this.settings.customCrosshairAlwaysShow.val ? "checked" : ""}><span class='slider'></span></label>`;
                }
            },
            customCrosshairShadow: {
                name: "Shadow",
                val: '#000000',
                hide: true,
                html: _ => {
                    return `<input type='color' id='crosshairShadow' name='color' value='${this.settings.customCrosshairShadow.val}' oninput='window.utilities.setSetting("customCrosshairShadow", this.value)' style='float:right;margin-top:5px'/>`
                }
            },
            customCrosshairColor: {
                name: "Color",
                val: "#ffffff",
                hide: true,
                html: _ => {
                    return `<input type='color' id='crosshairColor' name='color' value='${this.settings.customCrosshairColor.val}' oninput='window.utilities.setSetting("customCrosshairColor", this.value)' style='float:right;margin-top:5px'/>`
                }
            },
            customCrosshairLength: {
                name: "Length",
                val: 16,
                hide: true,
                html: _ => {
                    return `<span class='sliderVal' id='slid_utilities_customCrosshairLength'>${this.settings.customCrosshairLength.val}</span><div class='slidecontainer'><input type='range' min='2' max='50' step='2' value='${this.settings.customCrosshairLength.val}' class='sliderM' oninput="window.utilities.setSetting('customCrosshairLength', this.value)"></div>`
                }
            },
            customCrosshairThickness: {
                name: "Thickness",
                val: 2,
                hide: true,
                html: _ => {
                    return `<span class='sliderVal' id='slid_utilities_customCrosshairThickness'>${this.settings.customCrosshairThickness.val}</span><div class='slidecontainer'><input type='range' min='2' max='20' step='2' value='${this.settings.customCrosshairThickness.val}' class='sliderM' oninput="window.utilities.setSetting('customCrosshairThickness', this.value)"></div>`
                }
            },
            customADSDot: {
                name: "ADSDot Image",
                pre: "<br><div class='setHed'>Customization</div><hr>",
                val: '',
                html: _ => {
                    return `<input type='url' id='customADSDot' placeholder='ADSDot URL' name='url' style='${textInputStyle}' value='${this.settings.customADSDot.val}' oninput='window.utilities.setSetting("customADSDot", this.value)' style='float:right;margin-top:5px'/>`
                }
            },
            customScope: {
                name: "Scope Image",
                val: '',
                html: _ => {
                    return `<input type='url' id='customScope' placeholder='Scope Image URL' name='url' style='${textInputStyle}' value='${this.settings.customScope.val}' oninput='window.utilities.setSetting("customScope", this.value)' style='float:right;margin-top:5px'/>`
                },
                set: val => {
                    recticleImg.src = val.length > 1 ? val : location.origin + '/textures/recticle.png';
                }
            },
            customScopeHideBoxes: {
                name: "Hide Black Boxes",
                val: false,
                disabled: config.get('utilities_compMode', false),
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("customScopeHideBoxes", this.checked)' ${this.settings.customScopeHideBoxes.val ? "checked" : ""} ${this.settings.customScopeHideBoxes.disabled ? 'disabled': ''}><span class='slider'></span></label>`;
                },
                set: val => {
                    if (this.settings.customScopeHideBoxes.disabled) {
                        [...document.querySelectorAll('.black')].forEach(el => el.style.display = "block");
                        let doc = document.getElementById('customScopeHideBoxes_div');
                        if (doc && this.settings.customScopeHideBoxes.disabled) doc.firstElementChild.lastElementChild.style.backgroundColor = 'red';
                    } else {
                        [...document.querySelectorAll('.black')].forEach(el => el.style.display = val ? "none" : "block");
                    }
                }
            },
            customAmmo: {
                name: "Ammo Icon",
                val: '',
                html: _ => {
                    return `<input type='url' id='customAmmo' placeholder='Ammo Icon URL' name='url' style='${textInputStyle}' value='${this.settings.customAmmo.val}' oninput='window.utilities.setSetting("customAmmo", this.value)' style='float:right;margin-top:5px'/>`
                },
                set: val => {
                    ammoIcon.src = val.length > 1 ? val : location.origin + '/textures/ammo_0.png';
                }
            },
            customFlashOverlay: {
                name: "Muzzle Flash Image",
                val: '',
                html: _ => {
                    return `<input type='url' id='customFlashOverlay' placeholder='Muzzle Flash URL' name='url' style='${textInputStyle}' value='${this.settings.customFlashOverlay.val}' oninput='window.utilities.setSetting("customFlashOverlay", this.value)' style='float:right;margin-top:5px'/>`
                },
                set: val => {
                    flashOverlay.src = val.length > 1 ? val : location.origin + '/img/muzflash.png';
                }
            },
            customKills: {
                name: "Kill Icon",
                val: '',
                html: _ => {
                    return `<input type='url' id='customKills' placeholder='Kill Icon URL' name='url' style='${textInputStyle}' value='${this.settings.customKills.val}' oninput='window.utilities.setSetting("customKills", this.value)' style='float:right;margin-top:5px'/>`
                },
                set: val => {
                    killsIcon.src = val.length > 1 ? val : location.origin + '/img/skull.png';
                }
            },
            customDeaths: {
                name: "Death Icon",
                val: '',
                html: _ => {
                    return `<input type='url' id='customDeaths' placeholder='Death Icon URL' name='url' style='${textInputStyle}' value='${this.settings.customDeaths.val}' oninput='window.utilities.setSetting("customDeaths", this.value)' style='float:right;margin-top:5px'/>`
                },
                set: val => {
                    deathIcon.src = val.length > 1 ? val : url.format({
                        pathname: consts.joinPath(__dirname, '/images/death_counter.png'),
                        protocol: 'file:',
                        slashes: true
                    });
                }
            },
            customBlood: {
                name: "Death Overlay",
                val: '',
                html: _ => {
                    return `<input type='url' id='customBlood' placeholder='Death Overlay URL' name='url' style='${textInputStyle}' value='${this.settings.customBlood.val}' oninput='window.utilities.setSetting("customBlood", this.value)' style='float:right;margin-top:5px'/>`
                },
                set: val => {
                    bloodDisplay.src = val.length > 1 ? val : location.origin + '/img/blood.png';
                }
            },
            customTimer: {
                name: "Timer Icon",
                val: '',
                html: _ => {
                    return `<input type='url' id='customTimer' placeholder='Timer Icon URL' name='url' style='${textInputStyle}' value='${this.settings.customTimer.val}' oninput='window.utilities.setSetting("customTimer", this.value)' style='float:right;margin-top:5px'/>`
                },
                set: val => {
                    timerIcon.src = val.length > 1 ? val : location.origin + '/img/timer.png';
                }
            },
            inputLagFix: {
                name: "Input Lag Fix",
                pre: "<br><div class='setHed'>Experimental</div><hr>",
                val: false,
                html: _ => {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("inputLagFix", this.checked); alert("This setting requires a client restart to take effect.");' ${this.settings.inputLagFix.val ? "checked" : ""}><span class='slider'></span></label>`;
                }
            },
        };
        window.windows.push({
            header: "Join",
            gen: _ => {
                return `<input id='gameURL' type='text' placeholder='Enter Game URL/Code' class='accountInput' style='margin-top:0' value=''></input>
                <div class='accountButton' onclick='window.utilities.joinGame()', style='width:100%'>Join</div>`;
            }
        });
        window.windows.push({
            header: "Utilities",
            gen: _ => {
                var tmpHTML = "";
                for (var key in window.utilities.settings) {
                    if (window.utilities.settings[key].noShow) continue;
                    if (window.utilities.settings[key].pre) tmpHTML += window.utilities.settings[key].pre;
                    tmpHTML += "<div class='settName' id='" + key + "_div' style='display:" + (window.utilities.settings[key].hide ? 'none' : 'block') +"'>" + window.utilities.settings[key].name +
                        " " + window.utilities.settings[key].html() + "</div>";
                }
                tmpHTML += "<br><a onclick='window.utilities.resetSettings()' class='menuLink'>Reset Settings</a>";
                return tmpHTML;
            }
        });
        this.setupSettings();
    }
    
    setupSettings() {
        for (const key in this.settings) {
            if (!this.settings[key].disabled){
                var tmpVal = config.get(`utilities_${key}`, null);
                this.settings[key].val = tmpVal !== null ? tmpVal : this.settings[key].val;
                if (this.settings[key].val == "false") this.settings[key].val = false;
                if (this.settings[key].set) this.settings[key].set(this.settings[key].val, true);
            }
        }
    }
    
    joinGame() {
        let code = gameURL.value || '';
        if (code.isGame()) {
            remote.getCurrentWindow().loadURL(code, consts.NO_CACHE);
        } else if (code.isCode()) {
            window.switchServer(code);
        }
    }

    createDeathCounter() {
        let deathCounter = document.createElement('div');
        deathCounter.id = 'deathCounter';
        deathCounter.style.cssText = `margin-left: 10px;
            margin-top: 20px;
            background-color: rgba(0, 0, 0, 0.2);
            padding: 10px;
            display: inline-block;
            font-size: 26px;
            padding-right: 20px;
            padding-left: 14px;
            display: none`;

        let deathIcon = document.createElement('img');
        deathIcon.id = 'deathIcon';
        deathIcon.src = url.format({
			pathname: consts.joinPath(__dirname, '/images/death_counter.png'),
			protocol: 'file:',
			slashes: true
        });
        deathIcon.style.cssText = `width: 38px;
            height: 38px;
            padding-right: 10px;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;`;
        deathCounter.appendChild(deathIcon); 

        let deathsVal = document.createElement('span');
        deathsVal.id = 'deathsVal';
        deathsVal.style.color = 'rgba(255, 255, 255, 0.7)';
        deathsVal.innerHTML = '0';
        deathCounter.appendChild(deathsVal);      

        topRight.appendChild(deathCounter);
    }
    
    createCrosshair() {
        let div = document.createElement('div');
        div.id = 'custCross';
        div.style.display = 'none';

        let crossS = document.createElement('div');
        crossS.id = 'crossS';
        crossS.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;`;
        div.appendChild(crossS);

        let crossH = document.createElement('div');
        crossH.id = 'crossH';
        crossH.style.cssText = crossS.style.cssText;
        div.appendChild(crossH); 

        let crossV = document.createElement('div');
        crossV.id = 'crossV';
        crossV.style.cssText = crossS.style.cssText;
        div.appendChild(crossV);
            
        let crossCirc = document.createElement('div');
        crossCirc.id = 'crossCirc';
        crossCirc.style.cssText = crossS.style.cssText;
        div.appendChild(crossCirc); 
            
        let crossImg = document.createElement('div');
        crossImg.id = 'crossImg';
        crossImg.style.cssText = `  
            position: fixed;
            top: 0;
            left: 0;
            margin: auto;
            width: 100%;
            height: 100%;
            background-repeat: no-repeat;
            background-position: center;
            display: none`;
        div.appendChild(crossImg); 

        inGameUI.appendChild(div); 
    }
    
    updateCrosshair() {
        if (this.settings.customCrosshair.val == 0 || !this.settings.customCrosshairAlwaysShow.val && (aimDot.style.opacity != "0" || aimRecticle.style.opacity != "0")) return custCross.style.display = 'none';
        custCross.style.display = 'block';
        
        let shadow = consts.hexToRGB(this.settings.customCrosshairShadow.val);
        let thickness = parseInt(this.settings.customCrosshairThickness.val);
        let length = parseInt(this.settings.customCrosshairLength.val);
        let color = this.settings.customCrosshairColor.val;
        //let outline = parseInt(this.settings.customCrosshairOutline.val);
        //let outlineColor = this.settings.customCrosshairOutlineColor.val;
        let shape = parseInt(this.settings.customCrosshairShape.val);

        if (shape == 0) { // CROSS
            crossV.style.display = 'block';
            crossH.style.display = 'block';
            crossS.style.display = 'block';
            crossCirc.style.display = 'none';
            crossImg.style.display = 'none';

            crossV.style.height = `${length * 2}px`;
            crossV.style.width = `${thickness}px`;
            crossV.style.backgroundColor = `${color}`;

            crossH.style.height = `${thickness}px`;
            crossH.style.width = `${length * 2}px`;
            crossH.style.backgroundColor = `${color}`;
            crossH.style.boxShadow = `0px 0px 5px 1px rgba(${shadow.join(',')},0.75)`;

            crossS.style.height = `${length * 2}px`;
            crossS.style.width = `${thickness}px`;
            crossS.style.backgroundColor = `${color}`;
            crossS.style.boxShadow = `0px 0px 5px 1px rgba(${shadow.join(',')},0.75)`;
            
            //if (outline > 0) { }
                
        } else if (shape == 3) { // IMAGE
        
            crossV.style.display = 'none';
            crossH.style.display = 'none';
            crossS.style.display = 'none';
            crossCirc.style.display = 'none';
            crossImg.style.display = 'block';

            if (crossImg.style.backgroundImage != this.settings.customCrosshairImage.val) {
                crossImg.style.backgroundImage = `url(${this.settings.customCrosshairImage.val})`;
            }
            
        } else { // HOLLOW CIRCLE | FILLED CIRCLE
        
            crossV.style.display = 'none';
            crossH.style.display = 'none';
            crossS.style.display = 'none';
            crossCirc.style.display = 'block';
            crossImg.style.display = 'none';

            crossCirc.style.height = `${length * 2}px`;
            crossCirc.style.width = `${length * 2}px`;
            crossCirc.style.backgroundColor = shape == 2 || shape == 5 ? `${color}` : ``;
            crossCirc.style.border = shape == 2 || shape == 5 ? `` : `${thickness}px solid ${color}`;
            crossCirc.style.boxShadow = `0px 0px 5px 1px rgba(${shadow.join(',')},0.75)`;
            crossCirc.style.borderRadius = shape > 3 ? '':'50%';
            
            //if (outline > 0) { }
            
        }
        
    }

    createObservers() {
        //Crosshair
        this.newObserver(crosshair, 'style', (target) => {
            if (this.settings.customCrosshair.val == 0) return;
            crosshair.style.opacity = this.crosshairOpacity(crosshair.style.opacity);
        }, false);
        
        //AimDot
        this.newObserver(aimDot, 'src', (target) => {
            if (this.settings.customADSDot.val.length > 1) {
                if (this.settings.customADSDot.val != target.src) {
                    target.src = this.settings.customADSDot.val;
                }
            }
        });
        
        //Death Counter
        this.newObserver(killCardHolder, 'style', () => {
            this.deaths++;
            deathsVal.innerHTML = this.deaths; 
        });
        this.newObserver(victorySub, 'src', () => {
            this.deaths = 0;
            deathsVal.innerHTML = this.deaths;
            
            if (this.settings.matchEndMessage.val.length) {
                if (Date.now() - this.lastSent > 20) {
                    this.sendMessage(this.settings.matchEndMessage.val);
                    this.lastSent = Date.now();
                }
            }
        });
        
        // //New Match Finder
        // this.newObserver(instructionHolder, 'style', (target) => {
        //     if (this.settings.autoFindNew.val) {
        //         if (target.innerText.includes('Try seeking a new game') &&
        //             !target.innerText.includes('Kicked for inactivity')) {
        //                 location = document.location.origin;
        //             }
        //     }
        // });

        //Auto-Search
        this.newObserver(instructions, 'childList', (target) => {
            if (this.settings.autoSearch.val){
                if (target.innerText.includes('Game is full.') || target.innerText.includes('NoAvailableServers')){
                    this.searchMatch();
                }    
            }                    
        }, false);
        this.newObserver(endTimer, 'childList', (target) => {
            if (this.settings.autoSearch.val){
                if (target.innerText.endsWith('01')){
                    this.searchMatch();                   
                }      
            }             
        }, false);      
    }
    
    newObserver(elm, check, callback, onshow = true) {
        return new MutationObserver((mutationsList, observer) => {
            if (check == 'src' || onshow && mutationsList[0].target.style.display == 'block' || !onshow) {
                callback(mutationsList[0].target);
            }
        }).observe(elm, check == 'childList' ? {childList: true} : {attributes: true, attributeFilter: [check]});
    }
    
    sendMessage(msg) {
        chatInput.value = msg;
        chatInput.focus()
        window.pressButton(13);
        chatInput.blur();
    }

    searchMatch() {
        const filter = {
            region: this.settings.filterSelect.val.region,
            mode: this.settings.filterSelect.val.mode,
            map: this.settings.filterSelect.val.map,
            type: this.settings.filterSelect.val.type,
            minPlayers: this.settings.minPlayersSlider.val,
            maxPlayers: this.settings.maxPlayersSlider.val,
        }

        fetch('https://matchmaker.krunker.io/game-list?hostname=' + location.hostname)
            .then(data => data.json())
            .then(json => {
                const matches = json.filter(match => {
                    return match.data.i ? ((filter.region == "any" ? true : match.region == filter.region)
                        && (filter.mode == "any" ? true : match.data.i.includes(filter.mode))
                        && (filter.map == "any" ? true : match.data.i.includes(filter.map))
                        && (filter.type == "any" ? true : match.data.cs == (filter.type == "custom"))
                        && match.clients >= filter.minPlayers
                        && match.clients <= filter.maxPlayers) : false;
                });
                if (matches.length > 0) {
                    window.switchServer(matches[Math.floor(Math.random() * matches.length)].id);
                    //remote.getCurrentWindow().loadURL(location.origin + "/?game=" + 
                        //matches[Math.floor(Math.random() * matches.length)].id, consts.NO_CACHE);
                } else {
                    if (this.settings.autoSearch.val){
                        this.searchMatch();
                    } else {
                        alert("No Matches Found :(");
                    }
                }
            })      
    }

    createWatermark() {
        const el = document.createElement("div");
        el.id = "watermark";
        el.style.position = "absolute";
        el.style.color = "rgba(0,0,0, 0.3)";
        el.style.bottom = "0";
        el.style.left = "20px";
        el.style.fontSize = "6pt";
        el.innerHTML = "Krunker.io Client v" + remote.app.getVersion();
        gameUI.appendChild(el);
    }

    crosshairOpacity(val) {
        return parseInt(this.settings.customCrosshair.val) == 1 ? 0 : val;
    }

    render() {
        this.updateCrosshair();
        window.requestAnimationFrame(_ => this.render());
    }

    resetSettings() {
        if (confirm("Are you sure you want to reset all your utilties settings? This will also refresh the page")) {
            Object.keys(config.store).filter(x=>x.includes("utilities_")).forEach(x => config.remove(x));
            location.reload();
        }
    }

    setSetting(t, e) {
        this.settings[t].val = e;
        config.set(`utilities_${t}`, e);
        if (document.getElementById(`slid_utilities_${t}`)) document.getElementById(`slid_utilities_${t}`).innerHTML = e;
        if (this.settings[t].set) this.settings[t].set(e);
    }
    
    keyDown(event) {
        if (document.activeElement.tagName == "INPUT") return;
        switch(event.key){
            case '`':
                if (event.ctrlKey || event.shiftKey) return;
                document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
                document.exitPointerLock();
                window.showWindow(window.windows.length);
                break;
            case this.settings.searchKeybind.val:
                this.searchMatch();
                break;
        }
    }

    onLoad() {
        [...document.querySelectorAll(".menuItemIcon")].forEach(el => el.style.height = "60px");
        this.createCrosshair();
        this.createWatermark();
        this.createDeathCounter();;
        this.createSettings();
        this.createObservers();
        window.addEventListener("keydown", event => this.keyDown(event));
        window.requestAnimationFrame(_ => this.render());
    }
}

module.exports = Utilities;