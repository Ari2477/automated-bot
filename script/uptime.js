const os = require("os");

module.exports.config = {
  name: "uptime",
  version: "1.0.3",
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
    "returnResult": "🤖 BOT UPTIME\n━━━━━━━━━━━━━━━━━━\n⏳ %1h %2m %3s\n👤 Users: %4\n💬 Threads: %5\n⚡ CPU: %6%\n💾 RAM: %7\n🖥️ Cores: %8\n📡 Ping: %9ms\n💻 Platform: %10\n🔧 Arch: %11"
  }
};

module.exports.run = async ({ api, event, args, getText }) => {
  try {
    const time = process.uptime(),
      hours = Math.floor(time / (60 * 60)),
      minutes = Math.floor((time % (60 * 60)) / 60),
      seconds = Math.floor(time % 60);

    const pidusage = await global.nodemodule["pidusage"](process.pid);
    const osInfo = {
      platform: os.platform(),
      architecture: os.arch(),
      cores: os.cpus().length
    };

    const timeStart = Date.now();

    let mode = args[0] || "normal";

    if (mode === "short") {
      return api.sendMessage(
        `⏳ Uptime: ${hours}h ${minutes}m ${seconds}s\n⚡ CPU: ${pidusage.cpu.toFixed(1)}%\n💾 RAM: ${byte2mb(pidusage.memory)}`,
        event.threadID,
        event.messageID
      );
    }

    return api.sendMessage(
      getText(
        "returnResult",
        hours,
        minutes,
        seconds,
        global.data.allUserID.length,
        global.data.allThreadID.length,
        pidusage.cpu.toFixed(1),
        byte2mb(pidusage.memory),
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
