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

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const userLimit = parseInt(args[args.length - 1], 10);

  const link = args[args.length - 2];

  const cookie = args.slice(0, -2).join(" ");

  if (!cookie || !link || !userLimit || userLimit <= 0) {
    return api.sendMessage(
      "❌ Missing arguments!\n\nUsage:\nfbshare <cookie> <link> <limit>",
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
            limit: 1
          }
        });

        count++;

        if (data.status) {
          success++;
        } else {
          fail++;
          if (data.message?.includes("Invalid") || data.message?.includes("Failed")) break;
        }

        if (count % 2 === 0 || i === userLimit) {
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
