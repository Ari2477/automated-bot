const fs = require("fs");
const path = "./uptimeData.json"; 

function getStartTime() {
  if (fs.existsSync(path)) {
    const data = JSON.parse(fs.readFileSync(path, "utf-8"));
    return data.startTime;
  } else {
    const now = Date.now();
    fs.writeFileSync(path, JSON.stringify({ startTime: now }));
    return now;
  }
}

module.exports.config = {
  name: "uptime",
  version: "1.0",
  aliases: ["upt"], 
  credit: "ari",
  category: "members",
  description: "Shows how long the bot has been online (persistent across restarts)"
};

module.exports.run = async function({ api, event, args }) {
  try {
    const startTime = getStartTime();
    const uptimeMs = Date.now() - startTime; 
    let totalSeconds = Math.floor(uptimeMs / 1000);

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
    const filledSlots = Math.round((hours / 24) * totalSlots);
    const emptySlots = totalSlots - filledSlots;
    const bar = "█".repeat(filledSlots) + "░".repeat(emptySlots);

    const message = `( ˘³˘)┌旦「 𝙾𝚗𝚕𝚒𝚗𝚎 」\nUptime: ${uptimeString}\n[ ${bar} ]`;

    await api.sendMessage(message, event.threadID);
  } catch (error) {
    console.error(error);
    await api.sendMessage("⚠️ An error occurred while retrieving uptime.", event.threadID);
  }
};
