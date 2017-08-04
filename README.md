# FREE BEERS SLACK BOT

You can use this bot on your Slack team so it will record how many times a user says something with __free beers__.

You can print a ranking of top free beered people by writing `FBRanking` on a channel if the bot is inside it.

You will need to create a bot on your Slack team and run this nodejs script on a server.

To configure the bot you will require a `.env` file with next params:

```
BOT_NAME=freebeerbot
SLACK_TOKEN=yourslackbottoken
SLACK_CHANNEL=thechannelwherebotisgonnaanswer
DATABASE=databasefilename
```

This script stores data on sqlite3 database. If the database file does not exists the script will try to create it.