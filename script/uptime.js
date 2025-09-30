module.exports.config = {
  name: "uptime",
  aliases: ["up"],
  version: "1.2.1",
  hasPermssion: 0,
  credits: "ari",
  description: "Displays bot uptime",
  commandCategory: "system",
  usages: "uptime",
  cooldowns: 5
};

if (!global.loginTime) {
  global.loginTime = Date.now();
}

module.exports.run = async function({ api, event }) {
  let activeMs = Date.now() - global.loginTime;

  let days = Math.floor(activeMs / (1000 * 60 * 60 * 24));
  let hours = Math.floor((activeMs / (1000 * 60 * 60)) % 24);
  let minutes = Math.floor((activeMs / (1000 * 60)) % 60);
  let seconds = Math.floor((activeMs / 1000) % 60);

  let totalSeconds = activeMs / 1000;
  let scaleSeconds = 7 * 24 * 60 * 60; 
  let percentage = Math.min(totalSeconds / scaleSeconds, 1);

  let progressBarLength = 10; 
  let filledLength = Math.floor(progressBarLength * percentage);

  let progressBar = "█".repeat(filledLength) + "─".repeat(progressBarLength - filledLength);

  let message =
`⏳ 𝐔𝐩𝐭𝐢𝐦𝐞 𝐬𝐭𝐚𝐭𝐮𝐬 
━━━━━━━━━━━━━━
[${progressBar}] ${(percentage * 100).toFixed(1)}%
📅 Dᴀʏ    : ${days}
🕒 Hᴏᴜʀs  : ${hours}
⏰ Mɪɴᴜᴛᴇs: ${minutes}
⌛ Sᴇᴄᴏɴᴅs: ${seconds}
━━━━━━━━━━━━━━
🤖 Bot has been running smoothly! 🚀`;

  return api.sendMessage(message, event.threadID, event.messageID);
};
