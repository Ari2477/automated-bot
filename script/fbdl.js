const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "fbdl",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["fbdownload", "fbvid"],
  description: "Download Facebook video and send directly",
  usage: "fbdl <facebook_post_url>",
  credits: "Ari",
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const url = args[0];
  if (!url) {
    return api.sendMessage(
      "❌ Please provide a Facebook post URL.\nUsage: fbdl <facebook_post_url>",
      threadID,
      messageID
    );
  }

  api.sendMessage("🔄 Fetching video... Please wait.", threadID, async (err, info) => {
    if (err) return;

    try {
      const apiUrl = `https://vern-rest-api.vercel.app/api/fbdl?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.result || !data.result.url) {
        return api.editMessage("❌ Failed to fetch video.", info.messageID);
      }

      const videoUrl = data.result.url;

      const videoResponse = await axios.get(videoUrl, { responseType: "arraybuffer" });
      const tempFile = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
      fs.writeFileSync(tempFile, videoResponse.data);

      await api.sendMessage(
        { attachment: fs.createReadStream(tempFile) },
        threadID,
        () => {
          fs.unlinkSync(tempFile);
        },
        messageID
      );

      api.unsendMessage(info.messageID);

    } catch (error) {
      console.error("FB Video Error:", error);
      api.editMessage(
        "❌ Error fetching or sending video: " + (error.message || "Unknown error"),
        info.messageID
      );
    }
  });
};
