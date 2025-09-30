 const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');

const GRAPH_API_BASE = 'https://graph.facebook.com';
const FB_HARDCODED_TOKEN = '6628568379|c1e620fa708a1d5696fb991c1bde5662';
const GOODBYE_API_URL = 'https://nexalo-api.vercel.app/api/goodbye-card';

function getProfilePictureURL(userID, size = [512, 512]) {
  const [height, width] = size;
  return `${GRAPH_API_BASE}/${userID}/picture?width=${width}&height=${height}&access_token=${FB_HARDCODED_TOKEN}`;
}

const shortQuotes = [
  "Farewell, dear friend!",
  "Wishing you the best!",
  "Goodbye, take care!",
  "Until we meet again!",
  "Safe travels, friend!",
  "Best of luck always!",
  "See you soon, pal!",
  "Keep shining, star!"
];

module.exports.config = {
  name: "goobye",
  eventType: ["log:unsubscribe"], 
  version: "1.0",
};

module.exports.handleEvent = async function({ api, event }) {
  const threadID = event.threadID;
  const leftUserID = event.logMessageData.leftParticipantFbId;

  try {
    const userInfo = await new Promise((resolve, reject) => {
      api.getUserInfo([leftUserID], (err, info) => {
        if (err) reject(err);
        else resolve(info);
      });
    });
    const userName = userInfo[leftUserID]?.name || "Unknown User";

    const profilePicUrl = getProfilePictureURL(leftUserID);

    const randomQuote = shortQuotes[Math.floor(Math.random() * shortQuotes.length)];

    const apiUrl = `${GOODBYE_API_URL}?image=${encodeURIComponent(profilePicUrl)}&username=${encodeURIComponent(userName)}&text=${encodeURIComponent(randomQuote)}`;

    const response = await axios.get(apiUrl, { responseType: 'stream', timeout: 10000 });

    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error("API response is not an image");
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const fileName = `goodbye_${crypto.randomBytes(8).toString('hex')}.png`;
    const filePath = path.join(tempDir, fileName);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const stats = fs.statSync(filePath);
    if (stats.size === 0) throw new Error("Downloaded goodbye image is empty");

    const msg = {
      body: `👋 ${userName} has left the group, goodbye my friend`,
      attachment: fs.createReadStream(filePath)
    };

    await new Promise((resolve, reject) => {
      api.sendMessage(msg, threadID, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    fs.unlinkSync(filePath);
    console.log(chalk.cyan(`[Leave Event] ${userName} left Thread: ${threadID}`));
  } catch (error) {
    api.sendMessage(`⚠️ Failed to send goodbye message.`, threadID);
    console.log(chalk.red(`[Leave Event Error] ${error.message}`));
  }
};
