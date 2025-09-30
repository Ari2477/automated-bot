module.exports.config = {
  name: "uptime",
  aliases: ["up"],
  version: "1.0.4",
  hasPermssion: 0,
  credits: "ari",
  description: "burat na malaki ",
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

  let message = 
`⏳ 𝗨𝗽𝘁𝗶𝗺𝗲 𝗦𝘁𝗮𝘁𝘂𝘀
━━━━━━━━━━━━━━━
📆 Days   : ${days}
🕒 Hours  : ${hours}
⏰ Mins   : ${minutes}
⌛ Secs   : ${seconds}
━━━━━━━━━━━━━━━
🤖 Bot has been running smoothly since login!`;

  return api.sendMessage(message, event.threadID, event.messageID);
};
