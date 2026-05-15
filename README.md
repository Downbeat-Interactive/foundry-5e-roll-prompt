
<img width="664" height="546" alt="image" src="https://github.com/user-attachments/assets/1653516e-5d24-4ed6-96bb-15e536c60e34" />

# 5e Skill Picker Macro

A Foundry VTT v14 macro for D&D5e that opens skill picker and rolls the selected skill using the normal D&D5e roll workflow.

## Features

- Uses the selected token’s actor first
- Falls back to the user’s assigned character
- Uses skill icons from the [Intrinsical icon set](https://github.com/intrinsical/tw-dnd/tree/main/icons/skill)
- Rolls through `actor.rollSkill({ skill })`

## Requirements

- Foundry VTT v14
- D&D5e system
- A selected token or assigned user character
- Internet access for GitHub-hosted skill icons, unless you change the icon path to local files

## Installation

1. Open Foundry VTT.
2. Go to the **Macros** bar.
3. Create a new macro.
4. Set the macro type to **Script**.
5. Paste the full script.
6. Save and run it.

Or, by importing the JSON:
1. Download the released `skill-picker-macro.json`
2. Create a new macro.
3. Name it.
4. Right click the macro and choose "Import Data"
5. Select the `skill-picker-macro.json` file.

## Icon Source

The macro uses SVG icons from:

```text
https://github.com/intrinsical/tw-dnd/tree/6e5928176496f95d78874b273a840850a4317c70/icons/skill
