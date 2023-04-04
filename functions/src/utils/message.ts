const fetch = require("node-fetch");

export const sendMessage = async (text: string) => {
  if (!process.env.WEBHOOK) {
    return;
  }
  const payload = {
    username: "Uptime Slackbot",
    text,
  };

  return fetch(process.env.WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "payload=" + encodeURIComponent(JSON.stringify(payload)),
  });
};
