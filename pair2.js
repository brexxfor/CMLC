module.exports.config = {
  name: "pair2",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Raihan",
  description: "Ghep doi ngau nhien",
  commandCategory: "random-img",
  usages: "",
  cooldowns: 0,
  dependencies: ["axios", "fs-extra"]
};

module.exports.onStart = async () => {
  // This function is called when the bot starts.
  // You can initialize any resources or configurations here.
  console.log("Pair2 command has been initialized.");
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies }) {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  const { threadID, senderID, messageID } = event;

  try {
    // Fetch user data
    const data = await Currencies.getData(senderID);
    const money = data.money;

    if (money < 500) {
      return api.sendMessage(
        `You need 500 USD for 1 pairing. Please use ${global.config.PREFIX}work to earn money or ask the admin bot! 🤑 There's something new to eat 🤑`,
        threadID,
        messageID
      );
    }

    // Select a random participant for pairing
    const threadInfo = await api.getThreadInfo(threadID);
    const participants = threadInfo.participantIDs;
    const randomID = participants[Math.floor(Math.random() * participants.length)];

    // Fetch user info
    const userInfo = await api.getUserInfo([senderID, randomID]);
    const senderName = userInfo[senderID].name;
    const receiverName = userInfo[randomID].name;

    // Update nicknames
    api.changeNickname(`😘👉🔐🔐 ${receiverName} Property 🔐🔐👈😘`, threadID, senderID);
    api.changeNickname(`😘👉🔐🔐 ${senderName} Property 🔐🔐👈😘`, threadID, randomID);

    // Fetch avatars
    const senderAvatar = await axios.get(
      `https://graph.facebook.com/${senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );
    const receiverAvatar = await axios.get(
      `https://graph.facebook.com/${randomID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );

    // Save avatars to cache
    fs.writeFileSync(__dirname + "/cache/avt.png", Buffer.from(senderAvatar.data, "utf-8"));
    fs.writeFileSync(__dirname + "/cache/avt2.png", Buffer.from(receiverAvatar.data, "utf-8"));

    // Prepare pairing message
    const pairingMessage = {
      body: `Complete the pairing bar you lost 500 dollars!\nYour partner is of the same gender: ${receiverName}\nDual ratio: 50%\n${senderName} ❤️ ${receiverName}`,
      mentions: [
        { id: senderID, tag: senderName },
        { id: randomID, tag: receiverName },
      ],
      attachment: [
        fs.createReadStream(__dirname + "/cache/avt.png"),
        fs.createReadStream(__dirname + "/cache/avt2.png"),
      ],
    };

    // Send pairing message
    api.sendMessage(pairingMessage, threadID, () => {
      // Clean up avatar files
      fs.unlinkSync(__dirname + "/cache/avt.png");
      fs.unlinkSync(__dirname + "/cache/avt2.png");
    }, messageID);

    // Deduct money from the user's balance
    Currencies.setData(senderID, { money: money - 500 });

  } catch (error) {
    console.error("Error in pair2 command:", error);
    api.sendMessage("An error occurred while processing your request. Please try again later.", threadID, messageID);
  }
};
