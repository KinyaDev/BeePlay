![BeePlay Banner](https://i.imgur.com/Wir3YJi.png)

# BeePlay - A Discord Bot Tailored for Classic Roleplay

## What is BeePlay?

BeePlay is a utility discord bot meant to help you customize and automatize your roleplay servers, it offers character management and fake user profiles, stats, species, travel system by setupping roleplay channels, and way more!

## Features

### Character Management, Customization & Interaction

- `/characters`
  Displays a list of your characters with a selectable menu for easily switching between them.

- `/register`
  Allows you to register a character, providing details such as name, icon, brackets, biography, and illustration.

![Register Command Demo]()

You can make speak your character in a text channel in the same manner as the Tupperbox bot, with the brackets you gave to your character. Send a message by replacing "text" of the brackets by any text to make speak your character through a fake user profile. For instance, if your character has `c!text` brackets, then send `c!Hello World`.

- `/unregister`
  A select menu appear to delete the selected character

### Roleplay System

Establish roleplay channels and connect them with a travel system based on channel permissions. No direct access to a sky island from the desert; travel to the mountain first!

- `/travel` displays a menu based on the roleplay channel you're in, allowing you to travel to other channels. It hides irrelevant roleplay channels and highlights the target channel.

**Tell which channels are roleplay ones**

- `/roleplay channels set [mention channels]`
- `/roleplay channels add [mention channels]`
- `/roleplay channels remove [mention channels]`

## Todolist

- [PREMIUM] Custom AI NPC

**Species System**
Introduce a species system, complete with species addition, detailed descriptions, and illustrations. Enable players to create characters with custom species, each with unique base stats.

**Stats System**
Establish comprehensive statistics such as health, attack damages, resistance, etc., tailored to your guild.

**Link rolepkay channels System**

- `/roleplay channels link [mention channel] [mention channels]`
- `/roleplay channels unlink [mention channel]` presents options to delete the main roleplay channel with linked channels or unlink specific channels.
