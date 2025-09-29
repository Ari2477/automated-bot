module.exports.config = {
  name: "uptime",
  version: "3.2",
  aliases: ["upt"], 
  credit: "ari",
  category: "members",
  description: "Shows how long the bot has been online"
};

module.exports.run = async function({ api, event, arg }) {
  try {
    let totalSeconds = Math.floor(process.uptime()); 
    
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let uptimeString = "";
    if (days > 0) uptimeString += `${days} Day${days > 1 ? "s" : ""} `;
    if (hours > 0) uptimeString += `${hours} Hr${hours > 1 ? "s" : ""} `;
    if (minutes > 0) uptimeString += `${minutes} Min${minutes > 1 ? "s" : ""} `;
    uptimeString += `${seconds} Sec${seconds > 1 ? "s" : ""}`;

    const startTime = new Date(Date.now() - Math.floor(process.uptime() * 1000));
    const startedAt = startTime.toLocaleString("en-US", { 
      timeZone: "Asia/Manila", 
      dateStyle: "medium",
      timeStyle: "short"
    });

    const message = `( ˘³˘)┌旦「 𝙾𝚗𝚕𝚒𝚗𝚎 」\nUptime: ${uptimeString}\nStarted: ${startedAt}`;

    await api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    await api.sendMessage("⚠️ An error occurred while retrieving uptime.", event.threadID, event.messageID);
  }
};
