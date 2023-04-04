const fetch = require("node-fetch");

const USERNAME = "Uptime Slackbot";
const ICON_URL = "";

export const sendMessage = async (text: string) => {
  if (!process.env.WEBHOOK) {
    return;
  }
  const payload = {
    username: USERNAME,
    text,
    ...(ICON_URL ? { icon_url: ICON_URL } : {}),
  };

  return fetch(process.env.WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "payload=" + encodeURIComponent(JSON.stringify(payload)),
  });
};
