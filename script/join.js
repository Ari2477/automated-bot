module.exports.config = {
  name: "join",
  version: "1.0.1",
  permission: 2,
  credits: "ari",
  description: "Join the bot's groups",
  category: "admin",
  cooldowns: 5,
  prefix: true
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, senderID, messageID } = event;

  try {
    const allThreads = await api.getThreadList(100, null, ["INBOX"]); 
    if (!allThreads.length) return api.sendMessage("No groups found.", threadID);

    let msg = "All groups:\n\n";
    const ID = [];
    allThreads.forEach((thread, index) => {
      msg += `${index + 1}. ${thread.name}\n`;
      ID.push(thread.threadID);
    });
    msg += "\nReply with the number of the group you want to join.";

    if (!global.client.handleReply) global.client.handleReply = new Map();
    const info = await api.sendMessage(msg, threadID);
    if (!global.client.handleReply.has(api.getCurrentUserID())) {
      global.client.handleReply.set(api.getCurrentUserID(), []);
    }

    global.client.handleReply.get(api.getCurrentUserID()).push({
      name: "join",
      author: senderID,
      messageID: info.messageID,
      ID: ID
    });
  } catch (error) {
    return api.sendMessage(`Error fetching groups: ${error}`, threadID);
  }
};

module.exports.handleReply = async function({ api, event, args, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  const { ID, author } = handleReply;

  if (author !== senderID) return api.sendMessage("You do not have permission to use this command.", threadID);
  if (!body || isNaN(body)) return api.sendMessage("Your selection must be a number.", threadID, messageID);

  const choice = parseInt(body) - 1;
  if (choice < 0 || choice >= ID.length) return api.sendMessage("Your pick is not on the list.", threadID, messageID);

  try {
    const threadInfo = await api.getThreadInfo(ID[choice]);
    const { participantIDs, approvalMode, threadName } = threadInfo;

    if (participantIDs.includes(senderID)) {
      return api.sendMessage("You are already in this group.", threadID, messageID);
    }

    await api.addUserToGroup(senderID, ID[choice]);

    if (approvalMode) {
      return api.sendMessage("Added you to the group's approval list. Check your pending messages.", threadID, messageID);
    } else {
      return api.sendMessage(`You have joined ${threadName}. Check your inbox if it doesn't appear immediately.`, threadID, messageID);
    }
  } catch (error) {
    return api.sendMessage(`I can't add you to that group.\nError: ${error}`, threadID, messageID);
  }
};
