# Uptime Slackbot

This is and example repository on how to create an "Uptime Slackbot". It uses Firestore Database and Firebase Cloud Functions to check for the Up- or Downtime of a given URL and sends Messages to a slack channel.

## Config
It uses two ENV variables to define the URL and the slack webhook URL:
```
// .env
URL=https://urltocheck.com
WEBHOOK=https://hooks.slack.com/services/{ID}/{AUTH_TOKEN}
```

## License
This project is licensed under the MIT License.
