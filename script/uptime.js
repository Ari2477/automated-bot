const os = require("os");
const pidusage = require("pidusage");

module.exports.config = {
  name: "uptime",
  version: "1.0.5",
  hasPermssion: 0,
  credits: "ari",
  description: "Check bot uptime and system info",
  commandCategory: "system",
  usePrefix: true,
  cooldowns: 5,
  dependencies: {
    "pidusage": ""
  }
};

function byte2mb(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let l = 0, n = parseInt(bytes, 10) || 0;
  while (n >= 1024 && ++l) n = n / 1024;
  return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
}

module.exports.languages = {
  "en": {
    "returnResult": "🤖 BOT UPTIME\n━━━━━━━━━━━━━━━━━━\n⏳ %1d %2h %3m %4s\n👤 Users: %5\n💬 Threads: %6\n⚡ CPU: %7%\n💾 RAM: %8\n🖥️ Cores: %9\n📡 Ping: %10ms\n💻 Platform: %11\n🔧 Arch: %12"
  }
};

module.exports.run = async ({ api, event, args, getText }) => {
  try {
    const time = process.uptime();

    const days = Math.floor(time / (60 * 60 * 24));
    const hours = Math.floor((time % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    const seconds = Math.floor(time % 60);

    const usage = await pidusage(process.pid);
    const osInfo = {
      platform: os.platform(),
      architecture: os.arch(),
      cores: os.cpus().length
    };

    const timeStart = Date.now();
    let mode = args[0] || "normal";

    if (mode === "short") {
      return api.sendMessage(
        `⏳ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s\n⚡ CPU: ${usage.cpu.toFixed(1)}%\n💾 RAM: ${byte2mb(usage.memory)}`,
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      getText(
        "returnResult",
        days,
        hours,
        minutes,
        seconds,
        global.data.allUserID.length,
        global.data.allThreadID.length,
        usage.cpu.toFixed(1),
        byte2mb(usage.memory),
        osInfo.cores,
        Date.now() - timeStart,
        osInfo.platform,
        osInfo.architecture
      ),
      event.threadID,
      event.messageID
    );

  } catch (err) {
    return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};
