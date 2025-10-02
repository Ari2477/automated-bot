 let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    if (fontEnabled && char in fontMapping) {
      formattedText += fontMapping[char];
    } else {
      formattedText += char;
    }
  }

  return formattedText;
}

const fs = require('fs').promises;
const pidusage = require('pidusage');
const { createCanvas } = require('canvas');
const os = require('os');

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

const startTime = Date.now();

module.exports.byte2mb = (bytes) => {
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let l = 0, n = parseInt(bytes, 10) || 0;
    while (n >= 1024 && ++l) n = n / 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
};

module.exports.getUptime = (uptime) => {
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days}d ${hours}h ${mins}m ${seconds}s`;
};

module.exports.run = async ({ api, event }) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const usage = await pidusage(process.pid);

    const osInfo = { cpus: os.cpus().length };

    const uptimeMessage = module.exports.getUptime(uptimeSeconds);

    const width = 820;
    const height = 280;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);

    ctx.fillStyle = "#00ff00";
    ctx.font = "bold 28px monospace";
    const title = "[ SYSTEM STATUS ]";
    const titleWidth = ctx.measureText(title).width;
    ctx.fillText(title, (width - titleWidth) / 2, 50);

    ctx.font = "20px monospace";
    const infos = [
        `> CPU Usage : ${usage.cpu.toFixed(1)}%`,
        `> RAM Usage : ${module.exports.byte2mb(usage.memory)}`,
        `> CPU Cores : ${osInfo.cpus}`,
        `> Ping      : ${Date.now() - event.timestamp}ms`,
        `> Uptime    : ${uptimeMessage}`
    ];

    let y = 100;
    infos.forEach(line => {
        ctx.fillText(formatFont(line), 60, y);
        y += 35;
    });

    const buffer = canvas.toBuffer('image/png');
    const filePath = './uptime.png';
    await fs.writeFile(filePath, buffer);

    await api.sendMessage(
        { attachment: require('fs').createReadStream(filePath) },
        event.threadID,
        event.messageID
    );
};
