function out(botID, cTID, api) { 
  return new Promise((resolve) => { 
    api.removeUserFromGroup(botID, cTID, (err) => { 
      if (err) return resolve(null); 
      resolve(true); 
    }); 
  }); 
}

module.exports.config = { 
  name: "pending", 
  version: "2.1.0", 
  role: 0, 
  hasPrefix: false, 
  aliases: ["approve", "deny"], 
  description: "Manage pending groups (list, approve, deny)", 
  usage: "pending | approve <index/all> | deny <index/all>", 
  credits: "ari" 
};

module.exports.run = async function({ api, event }) {
  if (!global.botID) global.botID = api.getCurrentUserID();
  const args = event.body.trim().split(/\s+/);

  const SPAM = (await api.getThreadList(100, null, ["OTHER"])) || []; 
  const PENDING = (await api.getThreadList(100, null, ["PENDING"])) || []; 
  const pendingThread = [...SPAM, ...PENDING].filter(t => t.isGroup && t.isSubscribed);

  // LIST
  if (args[0] === "pending") {
    if (pendingThread.length === 0) {
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      return api.sendMessage("⚠ No pending groups.", event.threadID);
    }

    let msg = "📌 Pending Groups:\n";
    msg += pendingThread.map((t, i) => `${i+1}. ${t.name} (${t.threadID})`).join("\n");
    msg += "\n\nCommands:\n- approve <index/all>\n- deny <index/all>";

    api.setMessageReaction("📋", event.messageID, () => {}, true);
    return api.sendMessage(msg, event.threadID);
  }

  if (args[0] === "approve") {
    if (pendingThread.length === 0) {
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      return api.sendMessage("⚠ No pending groups to approve.", event.threadID);
    }

    const indexes = args[1] === "all"
      ? pendingThread.map((_, i) => i)
      : args.slice(1).map(i => parseInt(i) - 1).filter(i => i >= 0 && i < pendingThread.length);

    if (indexes.length === 0) {
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      return api.sendMessage("⚠ Invalid index.", event.threadID);
    }

    let success = 0, fail = [];
    for (const i of indexes) {
      const group = pendingThread[i];
      try {
        await api.sendMessage("✅ Approved! You can now use commands.", group.threadID);
        success++;
      } catch (e) {
        fail.push(group.name);
      }
    }

    api.setMessageReaction(success > 0 ? "✅" : "❌", event.messageID, () => {}, true);
    return api.sendMessage(
      `✅ Approved ${success} group(s).` + 
      (fail.length ? `\n⚠ Failed: ${fail.join(", ")}` : ""), 
      event.threadID
    );
  }

  if (args[0] === "deny") {
    if (pendingThread.length === 0) {
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      return api.sendMessage("⚠ No pending groups to deny.", event.threadID);
    }

    const indexes = args[1] === "all"
      ? pendingThread.map((_, i) => i)
      : args.slice(1).map(i => parseInt(i) - 1).filter(i => i >= 0 && i < pendingThread.length);

    if (indexes.length === 0) {
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);
      return api.sendMessage("⚠ Invalid index.", event.threadID);
    }

    let success = 0, fail = [];
    for (const i of indexes) {
      const group = pendingThread[i];
      try {
        await api.sendMessage("❌ Sorry, your group request was denied.", group.threadID);
        await out(global.botID, group.threadID, api);
        success++;
      } catch (e) {
        fail.push(group.name);
      }
    }

    api.setMessageReaction(success > 0 ? "❌" : "⚠️", event.messageID, () => {}, true);
    return api.sendMessage(
      `❌ Denied ${success} group(s).` + 
      (fail.length ? `\n⚠ Failed: ${fail.join(", ")}` : ""), 
      event.threadID
    );
  }

  api.setMessageReaction("ℹ️", event.messageID, () => {}, true);
  return api.sendMessage("📌 Usage:\n- pending\n- approve <index/all>\n- deny <index/all>", event.threadID);
};
