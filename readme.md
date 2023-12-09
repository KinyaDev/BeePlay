![BeePlay Banner](https://i.imgur.com/Wir3YJi.png)

# BeePlay - A Discord Bot Tailored for Classic Roleplay

## What is BeePlay?

BeePlay is a utility discord bot meant to help you customize and automatize your roleplay servers, it offers character management and fake user profiles, stats, species, travel system by setupping roleplay channels, and way more!

## Features

### Character Management, Customization & Interaction

- `/register`
  Allows you to register a character, providing details such as name, icon, brackets, biography, and illustration.

  ![Register Cmd Img 1](https://i.imgur.com/6eGz1Ee.png)
  ![Register Cmd Img 2](https://i.imgur.com/ReNVgEZ.png)

- `/characters`
  Displays a list of your characters with a selectable menu for easily switching between them.

  ![Characters Cmd Img 1](https://i.imgur.com/x1qCNgP.png)

You can make speak your character in a text channel in the same manner as the Tupperbox bot, with the brackets you gave to your character. Send a message by replacing "text" of the brackets by any text to make speak your character through a fake user profile. For instance, if your character has `c!text` brackets, then send `c!Hello World`.

![Send Character](https://i.imgur.com/wPw2pZf.png)
![Send Character 2](https://i.imgur.com/v1ykkTg.png)

- `/unregister`
  A select menu appear to delete the selected character

  ![Unregister Cmd Img 1](https://i.imgur.com/opcRIef.png)
  ![Unregister Cmd Img 2](https://i.imgur.com/a7OUUIu.png)

### Roleplay System

Establish roleplay channels and connect them with a travel system based on channel permissions. No direct access to a sky island from the desert; travel to the mountain first!

- `/travel` displays a menu based on the roleplay channel you're in, allowing you to travel to other channels. It hides irrelevant roleplay channels and highlights the target channel.

  ![](https://i.imgur.com/gQtZkB2.png)
  ![](https://i.imgur.com/lFgCKM3.png)

**Tell which channels are roleplay ones**

- `/roleplay channels set [mention channels]`
- `/roleplay channels add [mention channels]`

  ![](https://i.imgur.com/xmuvQ9V.png)
  ![](https://i.imgur.com/lBkMzd5.png)

- `/roleplay channels remove [mention channels]`

  ![](https://i.imgur.com/zj4n3jz.png)

**Link roleplay channels each others**

- `/roleplay channels link [mention channel] [mention channels]`

  ![](https://i.imgur.com/jkgz1kl.png)
  ![](https://i.imgur.com/Ll9AQnv.png)

- `/roleplay channels unlink [mention channel]` presents options to delete the main roleplay channel with linked channels or unlink specific channels.

  ![](https://i.imgur.com/5nQUskz.png)

  1. Unlink all
     ![](https://i.imgur.com/JjCfMul.png)
  2. Unlink one
     ![](https://i.imgur.com/5c3V8WX.png)
     ![](https://i.imgur.com/B57t6F0.png)

- `/roleplay channels link-list` shows the list of roleplay channels and the places/roleplay channels linked to them.

  ![](https://i.imgur.com/vh3zKJD.png)

## Todolist

- [PREMIUM] Custom AI NPC

- **Species System**
  Introduce a species system, complete with species addition, detailed descriptions, and illustrations. Enable players to create characters with custom species, each with unique base stats.

- **Stats System**
  Establish comprehensive statistics such as health, attack damages, resistance, etc., tailored to your guild.
