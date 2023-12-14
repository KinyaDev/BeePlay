# Ideal Roleplay - A Discord Bot Tailored for Classic Roleplay

## What is Ideal Roleplay?

Ideal Roleplay is a utility discord bot meant to help you customize and automatize your roleplay servers, it offers character management and fake user profiles, stats, species, travel system by setupping roleplay channels, and way more!

## Features

### Custom AI NPCs (PREMIUM)

- `npc list` - get the list of all NPCs
  ![](https://i.imgur.com/f0jntlT.png)

- `npc create` creates a npc that will live in the specified
  channel with a give name, avatar and prompt.

![](https://i.imgur.com/kCHkkRI.png)

- `npc delete`

![](https://i.imgur.com/MsXavum.png)

### Character Management, Customization & Interaction

- `/register`
  Allows you to register a character, providing details such as name, icon, brackets, biography, and illustration.

- `/characters`
  Displays a list of your characters with a selectable menu for easily switching between them.

- `/update` allows you to update some details of your character such as icon, brackets and biography

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

**Link roleplay channels each others**

- `/roleplay channels link [mention channel] [mention channels]`

- `/roleplay channels unlink [mention channel]` presents options to delete the main roleplay channel with linked channels or unlink specific channels.

- `/roleplay channels link-list` shows the list of roleplay channels and the places/roleplay channels linked to them.

## Todolist

- **Species System**
  Introduce a species system, complete with species addition, detailed descriptions, and illustrations. Enable players to create characters with custom species, each with unique base stats.

- **Stats System**
  Establish comprehensive statistics such as health, attack damages, resistance, etc., tailored to your guild.

### Basic Events

**Register**
`/events role message [@role] [#channel] [remove_message] [add_message]`
`/events join message [#channel] [message]`
`/events leave message [#channel] [message]`
`/events join role [@role]`
`/events join bot-role [@role`
**Delete**
`/events role message delete` - selectmenu
`/events join message delete` - selectmenu
`/events leave message delete` - selectmenu
`/events join role delete` - selectmenu

`/roleplay events travel message [#channel] [leave_message] [join_message]`
`/roleplay events travel role [#channel] [#role] [remove_on_leave?]`
`/roleplay dungeons create [#channel] [name]`
`/roleplay dungeons delete [#channel] [name]`
`/roleplay dungeons message [enter_message] [pass_message]` - selectmenu
`/roleplay dungeons role pass [@role]`- selectmenu
`/roleplay dungeons role enter [@role]`- selectmenu
