const os = require("os");

module.exports.config = {
  name: "uptime",
  aliases: ["up", "status", "sysup"],
  description: "Show bot uptime, system info, ping, RAM, CPU.",
  version: "1.1.0",
  role: 0,
  cooldown: 0,
  credits: "Ari",
  hasPrefix: false,
  usage: "uptime [ping|ram|cpu]"
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const { threadID, messageID } = event;
    const query = args[0] ? args[0].toLowerCase() : "default";

    const uptimeFormatted = getLiveUptime();

    const osInfo = `${os.type()} ${os.release()} ${os.arch()} (${os.platform()})`;
    const totalMemory = formatBytes(os.totalmem());
    const freeMemory = formatBytes(os.freemem());
    const usedMemory = formatBytes(os.totalmem() - os.freemem());
    const cpuModel = os.cpus()[0].model;

    const now = new Date();
    const date = now.toLocaleDateString("en-PH", { timeZone: "Asia/Manila" });
    const time = now.toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour12: true });

    let message = "";

    switch (query) {
      case "ping":
        const start = Date.now();
        await api.sendMessage("🏓 Pinging...", threadID);
        const ping = Date.now() - start;
        message = `🏓 Pong! Response time: ${ping}ms`;
        break;

      case "ram":
        message =
`💾 𝗥𝗔𝗠 𝗨𝗦𝗔𝗚𝗘
• Used: ${usedMemory}
• Free: ${freeMemory}
• Total: ${totalMemory}`;
        break;

      case "cpu":
        message =
`🖥️ 𝗖𝗣𝗨 𝗜𝗡𝗙𝗢
• Model: ${cpuModel}
• Cores: ${os.cpus().length}`;
        break;

      default:
        message =
`♡   ∩_∩
 （„• ֊ •„)♡
╭─∪∪────────────⟡
│ ⏰ 𝗥𝗨𝗡𝗧𝗜𝗠𝗘
│ ${uptimeFormatted}
├───────────────⟡
│ 👑 𝗦𝗬𝗦𝗧𝗘𝗠
│ OS: ${osInfo}
│ CPU: ${cpuModel}
│ RAM: ${usedMemory} / ${totalMemory}
├───────────────⟡
│ 📅 DATE: ${date}
│ ⏰ TIME: ${time}
╰───────────────⟡`;
    }

    api.sendMessage(message, threadID, messageID);

  } catch (error) {
    console.error("Error:", error);
    api.sendMessage("❌ Unable to retrieve uptime/system info.", event.threadID, event.messageID);
  }
};

function getLiveUptime() {
  const totalSeconds = Math.floor(process.uptime());
  return convertTime(totalSeconds);
}

function convertTime(totalSeconds) {
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(100 * (bytes / Math.pow(1024, i))) / 100 + ' ' + sizes[i];
}
