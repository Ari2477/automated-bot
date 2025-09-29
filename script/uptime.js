module.exports.config = {
  name: "uptime",
  version: "3.1",
  aliases: ["upt"], 
  credit: "ari",
  category: "members",
  description: "Shows how long the bot has been online"
};

if (!global.uptimeOffset) {
  global.uptimeOffset = process.uptime();
}

module.exports.run = async function({ api, event, arg }) {
  try {
    let totalSeconds = Math.floor(process.uptime() - global.uptimeOffset); 
    
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

    const totalSlots = 12;
    const filledSlots = Math.min(Math.round((minutes / 60) * totalSlots), totalSlots);
    const emptySlots = totalSlots - filledSlots;
    const bar = "█".repeat(filledSlots) + "░".repeat(emptySlots);

    const message = `( ˘³˘)┌旦「 𝙾𝚗𝚕𝚒𝚗𝚎 」\nUptime: ${uptimeString}\n[ ${bar} ]`;

    await api.sendMessage(message, event.threadID, event.messageID);
  } catch (error) {
    console.error(error);
    await api.sendMessage("⚠️ An error occurred while retrieving uptime.", event.threadID, event.messageID);
  }
};
