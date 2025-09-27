module.exports.config = {
  name: "uptime",
  version: "1.0",
  author: "ari",
  category: "members",
  description: "Shows how long the bot has been online"
};

module.exports.run = async function({ api, event, args }) {
  try {
    const uptime = process.uptime(); 

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    let uptimeString = "";
    if (days > 0) uptimeString += `${days} Day${days > 1 ? "s" : ""} `;
    if (hours > 0) uptimeString += `${hours} Hr${hours > 1 ? "s" : ""} `;
    if (minutes > 0) uptimeString += `${minutes} Min${minutes > 1 ? "s" : ""} `;
    uptimeString += `${seconds} Sec${seconds > 1 ? "s" : ""}`;

    const totalSlots = 12; 
    const filledSlots = Math.round((hours / 24) * totalSlots);
    const emptySlots = totalSlots - filledSlots;
    const bar = "█".repeat(filledSlots) + "░".repeat(emptySlots);

    const message = `( ˘³˘)┌旦「 𝙾𝚗𝚕𝚒𝚗𝚎 」\n${uptimeString}\n[${bar}]`;
    await api.sendMessage(message, event.threadID);
  } catch (error) {
    console.error(error);
    await api.sendMessage("An error occurred while retrieving data.", event.threadID);
  }
};
