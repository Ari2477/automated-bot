const moment = require("moment");
require("moment-duration-format");

module.exports.config = {
  name: "uptime",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "ari",
  description: "burat na malaki",
  commandCategory: "system",
  usages: "uptime",
  cooldowns: 5
};

if (!global.loginTime) {
  global.loginTime = Date.now();
}

module.exports.run = async function({ api, event }) {
  let activeMs = Date.now() - global.loginTime;

  let days = moment.duration(activeMs).days();
  let hours = moment.duration(activeMs).hours();
  let minutes = moment.duration(activeMs).minutes();
  let seconds = moment.duration(activeMs).seconds();

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
