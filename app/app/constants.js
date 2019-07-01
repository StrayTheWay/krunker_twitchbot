const os = require('os');
const fs = require('fs');
const path = require('path');
const url = require('url');

module.exports.DEBUG = process.argv.includes('--dev') || false;

module.exports.isAMDCPU = Boolean(os.cpus().filter(x => /amd/i.test(x.model)).length);

module.exports.GAME_REGEX = /^(https?:\/\/)?(www\.)?(.+)krunker\.io(|\/|\/\?game=.+)$/;
module.exports.GAME_CODE_REGEX = /^([A-Z]+):(\w+)$/;
module.exports.EDITOR_REGEX = /^(https?:\/\/)?(www\.)?(.+)krunker\.io\/editor\.html$/;
module.exports.VIEWER_REGEX = /^(https?:\/\/)?(www\.)?(.+)krunker\.io\/viewer\.html$/;
module.exports.SOCIAL_REGEX = /^(https?:\/\/)?(www\.)?(.+)krunker\.io\/social\.html$/;
module.exports.SITE_REGEX = /^(https?:\/\/)?(www\.)?(.+\.|)krunker\.io(|\/|.+)$/;
module.exports.PING_REGION_CACHE_KEY = "pingRegion4";

module.exports.DISCORD_ID = '560173821533880322';

module.exports.NO_CACHE = {"extraHeaders" : "pragma: no-cache\n"};

module.exports.MATCH_MAKING = {
    REGIONS: [
        ["de-fra", "FRA"],
        ["us-fl", "MIA"],
        ["us-ca-sv", "SV"],
        ["sgp", "SIN"],
        ["jb-hnd", "TOK"],
        ["au-syd", "SYD"],
    ],
    MODES: [
        ["ctf", "CTF"],
        ["ffa", "FFA"],
        ["point", "POINT"],
    ],
    MAPS: [
        ["Burg", "Burg"],
        ["Littletown", "Littletown"],
        ["Sandstorm", "Sandstorm"],
        ["Subzero", "Subzero"],
    ],
    TYPES: [
        ["public", "Public"],
        ["custom", "Custom"],
    ]
};

String.prototype.isCode = function() {
    return (this + '').match(module.exports.GAME_CODE_REGEX);
};

String.prototype.isGame = function() {
    return (this + '').match(module.exports.GAME_REGEX);
};

String.prototype.isEditor = function() {
    return (this + '').match(module.exports.EDITOR_REGEX);
};

String.prototype.isViewer = function() {
    return (this + '').match(module.exports.VIEWER_REGEX);
};

String.prototype.isSocial = function() {
    return (this + '').match(module.exports.SOCIAL_REGEX);
};

String.prototype.isKrunker = function() {
    return (this + '').match(module.exports.SITE_REGEX);
};

module.exports.joinPath = function(foo, bar) {
    return path.join(foo, bar);
}

module.exports.hexToRGB = hex => hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16));