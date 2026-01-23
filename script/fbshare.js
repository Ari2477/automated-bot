const axios = require("axios");

module.exports.config = {
  name: "fbshare",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["sharefb", "fbpost", "spamshare"],
  description: "Auto FB Share using cookie",
  usage: "fbshare <cookie> <link> <limit>",
  credits: "Ari syempre",
  cooldown: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  
  const cookie = args[0];
  const link = args[1];
  const userLimit = parseInt(args[2]);

  
  if (!cookie || !link || !userLimit || userLimit <= 0) {
    return api.sendMessage(
      "❌ Missing arguments!\n\n" +
      "Usage:\nfbshare <cookie> <link> <limit>\n\n" +
      "Example:\n" +
      "fbshare c_user=xxx;xs=xxx; https://facebook.com/post 20",
      threadID,
      messageID
    );
  }

  api.sendMessage("🔄 FB Share processing... 0%", threadID, async (err, info) => {
    if (err) return;

    try {
      const url = "https://vern-rest-api.vercel.app/api/fb-share";

      let success = 0;
      let fail = 0;

      for (let i = 1; i <= userLimit; i++) {
        const { data } = await axios.get(url, {
          params: {
            cookie,
            link,
            limit: 1
          }
        });

        if (data.status) success++;
        else fail++;

        
        if (i % 20 === 0 || i === userLimit) {
          const percent = Math.floor((i / userLimit) * 100);

          api.editMessage(
            `🔄 FB Share processing... ${percent}%\n` +
            `Success: ${success}\nFail: ${fail}`,
            info.messageID
          );
        }
      }

      api.editMessage(
        `✅ FB Share finished!\n\nSuccess: ${success}\nFail: ${fail}`,
        info.messageID
      );

    } catch (error) {
      api.editMessage(
        "❌ Error: " + (error.response?.data?.message || error.message),
        info.messageID
      );
    }
  });
};
