# Uptime Slackbot

This is and example repository on how to create an "Uptime Slackbot". It uses Firestore Database and Firebase Cloud Functions to check for the Up- or Downtime of a given URL and sends Messages to a slack channel.

I documented some of the steps in a series on dev.to:  
1. [Uptime Slackbot: Getting Started](https://dev.to/nicomartin/uptime-slackbot-getting-started-2n71)
2. [Uptime Monitoring with Firebase](https://dev.to/nicomartin/uptime-monitoring-with-firebase-4off)
3. [Uptime Monitoring Slackbot](https://dev.to/nicomartin/uptime-monitoring-slackbot-35m0)

## Config
It uses two ENV variables to define the URL and the slack webhook URL:
```
// .env
URL=https://urltocheck.com
WEBHOOK=https://hooks.slack.com/services/{ID}/{AUTH_TOKEN}
```

## License
This project is licensed under the MIT License.
