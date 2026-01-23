const axios = require("axios");

module.exports.config = {
  name: "fbshare",
  version: "1.5.0",
  role: 0,
  hasPrefix: true,
  aliases: ["sharefb", "fbpost", "spamshare"],
  description: "Auto FB Share using cookie with required [ cookie ] [ link ] [ limit ]",
  usage: "fbshare [ cookie ] [ link ] [ limit ]",
  credits: "Ari syempre",
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const cookie = args[0]?.replace(/^\[|\]$/g, "").trim();
  const link = args[1]?.replace(/^\[|\]$/g, "").trim();
  const userLimit = parseInt(args[2]?.replace(/^\[|\]$/g, "").trim(), 10);

  if (!cookie || !link || !userLimit || userLimit <= 0) {
    return api.sendMessage(
      "❌ Missing required arguments!\n\n" +
      "Usage: fbshare [ cookie ] [ link ] [ limit ]\n\n" +
      "• [ cookie ] = Your Facebook cookie (must include c_user and xs)\n" +
      "• [ link ] = The full Facebook post link to share\n" +
      "• [ limit ] = Number of shares to perform (positive number)",
      threadID,
      messageID
    );
  }

  api.sendMessage("🔄 FB Share processing... 0%", threadID, async (err, info) => {
    if (err) return;

    try {
      const url = `https://vern-rest-api.vercel.app/api/fb-share`;

      let count = 0;
      let success = 0;
      let fail = 0;

      for (let i = 1; i <= userLimit; i++) {
        const { data } = await axios.get(url, {
          params: {
            cookie: cookie,
            link: link,
            limit: 2
          }
        });

        count++;

        if (data.status) {
          success++;
        } else {
          fail++;
          if (data.message?.includes("Invalid") || data.message?.includes("Failed")) break;
        }

        if (count % 20 === 0 || i === userLimit) {
          const percent = Math.floor((count / userLimit) * 100);
          api.editMessage(
            `🔄 FB Share processing... ${percent}%\nTotal attempted: ${count}\nSuccess: ${success}\nFail: ${fail}`,
            info.messageID
          );
        }
      }

      api.editMessage(
        `✅ FB Share finished!\nTotal attempted: ${count}\nSuccess: ${success}\nFail: ${fail}`,
        info.messageID
      );

    } catch (error) {
      console.error("FB Share Error:", error);
      const errMsg = "❌ Error: " + (error.response?.data?.message || error.message || "Unknown error occurred.");
      api.editMessage(errMsg, info.messageID);
    }
  });
};
