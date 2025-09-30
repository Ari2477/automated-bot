const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const os = require('os');
const pidusage = require('pidusage');

let fontEnabled = true;

function formatFont(text) {
    const fontMapping = {
        a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
        n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
        A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
        N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
    };
    return text.split('').map(c => fontEnabled && fontMapping[c] ? fontMapping[c] : c).join('');
}

module.exports.config = {
    name: "uptime",
    version: "1.0.5",
    role: 0,
    credits: "ari",
    description: "Get bot uptime and system information",
    hasPrefix: false,
    cooldown: 5,
    aliases: ["up"]
};

module.exports.byte2mb = (bytes) => {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++l) n /= 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
};

module.exports.getStartTimestamp = async () => {
    try {
        const startTimeStr = await fs.readFile('time.txt', 'utf8');
        return parseInt(startTimeStr);
    } catch {
        return Date.now();
    }
};

module.exports.saveStartTimestamp = async (timestamp) => {
    try {
        await fs.writeFile('time.txt', timestamp.toString());
    } catch (e) {
        console.error(e);
    }
};

module.exports.getUptime = (uptime) => {
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    return `${months} Month(s), ${remainingDays} day(s), ${hours} hour(s), ${mins} minute(s), ${seconds} second(s)`;
};

function drawPixelIcon(ctx, x, y, color) {
    ctx.fillStyle = color;
    const size = 12;
    ctx.fillRect(x, y - size + 2, size, size);
}

module.exports.run = async ({ api, event }) => {
    const startTime = await module.exports.getStartTimestamp();
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const usage = await pidusage(process.pid);

    const osInfo = { cpus: os.cpus().length };

    const width = 820;
    const height = 250;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);

    ctx.fillStyle = "";
    ctx.font = "bold 30px monospace";
    const title = "[ BOT UPTIME ]";
    const titleWidth = ctx.measureText(title).width; 
    ctx.fillText(title, (width - titleWidth) / 2, 50);

    ctx.font = "20px monospace";
    const infos = [
        { text: formatFont(`CPU: ${usage.cpu.toFixed(1)}%`), color: "#ff5555" },
        { text: formatFont(`RAM: ${module.exports.byte2mb(usage.memory)}`), color: "#55ff55" },
        { text: formatFont(`Cores: ${osInfo.cpus}`), color: "#5555ff" },
        { text: formatFont(`Ping: ${Date.now() - event.timestamp}ms`), color: "#ffff55" }
    ];

    const padding = 30;
    const iconSize = 20;
    let totalWidth = -padding;
    infos.forEach(info => {
        totalWidth += ctx.measureText(info.text).width + iconSize + padding;
    });

    let startX = (width - totalWidth) / 2;
    let y = 120;
    infos.forEach(info => {
        drawPixelIcon(ctx, startX, y, info.color);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(info.text, startX + iconSize + 8, y);
        startX += ctx.measureText(info.text).width + iconSize + padding;
    });

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px monospace";
    const uptimeText = formatFont(`${module.exports.getUptime(uptimeSeconds)}`);
    const uptimeWidth = ctx.measureText(uptimeText).width;
    ctx.fillText(uptimeText, (width - uptimeWidth) / 2, 200);

    const buffer = canvas.toBuffer('image/png');
    const filePath = './uptime.png';
    await fs.writeFile(filePath, buffer);

    await api.sendMessage({ attachment: fs.createReadStream(filePath) }, event.threadID, event.messageID);
    await module.exports.saveStartTimestamp(startTime);
};
