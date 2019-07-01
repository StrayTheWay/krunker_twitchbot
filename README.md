# Krunker Twitch Bot Integration

This will allow you to run a **Twitch Bot** inside the krunker game process using Node.JS to allow your twitch fans to get the current game link without any hassles.


# How does it work?

The bot works like any other Node.JS twitch bot connecting to Twitch's IRC server and waiting for messages from your channel. It starts when the game launches right after Discord's RPC I am always looking for feedback to increase the stability of this project and I am looking to re code it again with some future simplification. It essentially just grabs the windows current link as the games client is just a browser running through Electron.

# How do I use it?

It is super simple just follow the 4 steps below if you have any issues please check out the video at the very bottom. If you still can not get it to work you can contact me on discord my id is StrayTheWay#0001 and I shall try to assist you as best as I can.

-	**Step 1: Go to the games directory**
	>To goto the games directory all you need to do is right click the desktop shortcut and click "Open File Location" then continue.
	
-	**Step 2: Go to the resources directory**
	>This step is super simple, If you don't see the resources directory but instead see a ton of shortcuts to other programs just do the first step again on the krunker shortcut inside the folder then continue.

-	**Step 3: Place the app.asar and config.json file inside the resources directory**
	>If you can't figure this part out please follow the video guide then continue.

-	**Step 5: Edit the config.json and enable the twitch bot as well as setting up your bot account**
	>This is a big step you need to setup another twitch account for your bot account and do /mod BOTACCOUNT then goto [https://twitchapps.com/tmi/](https://twitchapps.com/tmi/) and get your oauth token for the config file.
	
# What do I do with the config.json again?

      {
      "twitch_autolink": false,        -- Change to true to enable bot
      "channel_name": ["CHANNELNAME"], -- Change to your twitch channel name
      "bot_username": "BOTUSERNAME",   -- Change to the bots username for the account you made
      "oauth_token": "BOTOAUTHTOKEN"   -- Goto https://twitchapps.com/tmi/ and generate the oauth for the bot account.
    }

# Video Guide Below

**Please see the video below if you are having any trouble...**
