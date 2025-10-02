const fs = require('fs').promises;
const pidusage = require('pidusage');
const { createCanvas } = require('canvas');
const os = require('os');

module.exports.config = {
    name: "uptime",
    version: "1.0.6",
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
    while (n >= 1024 && ++l) n = n / 1024;
    return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
};

module.exports.getUptime = () => {
    const uptime = Math.floor(process.uptime()); 
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${days}day(s) ${hours}hour(s) ${mins}minute(s) ${seconds}second(s)`;
};

module.exports.run = async ({ api, event }) => {
    const usage = await pidusage(process.pid);
    const osInfo = { cpus: os.cpus().length };

    const uptimeMessage = module.exports.getUptime();

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
