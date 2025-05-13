module.exports.config = {
  name: "poli",
  version: "1.0",
  hasPermssion: 0,
  credits: "Raihan",
  description: "Generate an image from a text prompt using Pollinations",
  commandCategory: "image",
  usages: "<query>",
  cooldowns: 2,
};

module.exports.onStart = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID } = event;

  const query = args.join(" ");
  if (!query) {
    return api.sendMessage("Please provide a text prompt for the image.", threadID, messageID);
  }

  const path = __dirname + "/cache/poli.png";
  try {
    const response = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
      responseType: "arraybuffer",
    });
    fs.writeFileSync(path, Buffer.from(response.data, "utf-8"));

    api.sendMessage(
      {
        body: `Image generated for: "${query}"`,
        attachment: fs.createReadStream(path),
      },
      threadID,
      () => fs.unlinkSync(path),
      messageID
    );
  } catch (error) {
    console.error("Error generating image:", error);
    api.sendMessage("An error occurred while generating the image. Please try again later.", threadID, messageID);
  }
};
