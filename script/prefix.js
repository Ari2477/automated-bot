const fs = require("fs");
const axios = require("axios");
const path = require("path");
const util = require("util");
const unlinkAsync = util.promisify(fs.unlink);

let config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config.json")));
} catch (e) {
  config.prefix = " ";
  config.botName = "🤖 | 𝙴𝚌𝚑𝚘 𝙰𝙸";
}

module.exports.config = {
  name: "prefix",
  version: "1.2.1",
  role: 0,
  description: "Displays the bot's prefix and a GIF.",
  prefix: true,
  premium: false,
  credits: "vern",
  cooldowns: 5,
  category: "info"
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const botPrefix = config.prefix || " ";
  const botName = config.botName || "🤖 | 𝙴𝚌𝚑𝚘 𝙰𝙸";
  const gifUrl = "https://media1.giphy.com/media/v1.Y2lkPTZjMDliOTUyd2xxZGw3NmFtYzhmZDZndm54NHIya240OG45MXZ6Nm02Nmh5cHV6OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9jwuxt5bXKadi/giphy.gif";

  const tempFilePath = path.join(__dirname, `prefix_${Date.now()}.gif`);

  try {
    const response = await axios({
      url: gifUrl,
      method: "GET",
      responseType: "stream"
    });
    
    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await new Promise((resolve, reject) => {
      api.sendMessage({
        body: `🤖 𝗕𝗼𝘁 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻\n📌 𝗣𝗿𝗲𝗳𝗶𝘅: ${botPrefix}\n🆔 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲: ${botName}\n\n🙏 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 𝗺𝘆 𝗯𝗼𝘁!`,
        attachment: fs.createReadStream(tempFilePath)
      }, threadID, (err) => {
        if (err) reject(err);
        else resolve();
      }, messageID);
    });

  } catch (error) {
    console.error("Error in prefix command:", error);
    api.sendMessage("⚠️ Failed to fetch or send the GIF.", threadID, messageID);
  } finally {
    unlinkAsync(tempFilePath).catch(e => {/* ignore */});
  }
};
