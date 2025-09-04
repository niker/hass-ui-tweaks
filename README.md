# Home Assistant - Automation Editor & Assist Chat UI Tweaks
This project is adding quality of life improvements to Home Assistant Lovelace and Configuration UI. Modifies the Automation Editor for better clarity when dealing with deeply-nested automations. Modifies the Assist Chat Dialog to better facilitate longer chat sessions with AI. The tweaks only work for the web, not in phone app.

## Home Assistant Assist Chat UI

- Increase dialog width and heigth
- Prevent dialog window from closing when clicking outside its bounds
- Prefix "AI" to the page title while chat is open
- Protect the chat from accidentally being closed by shortcut keys
- Allow URLs to be clickable (with http:// https://)
- Allows clickable image previews (with img:// imgs://)

![Snímek obrazovky 2025-05-27 234334](https://github.com/user-attachments/assets/8e66ba58-32b5-49c4-b032-a8b8fd7d8ac7)

## Automation and script editor

- Colorize panels in editor
- Change colors for each indentation level
- Hide excessive guide lines
- Move the fullscreen button out of the text

![Snímek obrazovky 2025-09-04 14:40:15](https://github.com/user-attachments/assets/37956466-431c-42df-ab9a-e239653a89b9)


## How to install:

### Install with HACS

[![Open this repository in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=niker&repository=hass-ui-tweaks&category=plugin)


### Manual installation
- Clone this repository to `/config/www` in your Home Assitant

	or
	
- Just copy the `hass-ui-tweaks.js` file to `/config/www/hass-ui-tweaks/hass-ui-tweaks.js`

- Go to Settings - Dashboards
- Click the 3 dots at the top right and select Resources
- Click Add Resource button and enter
Url: `/local/hass-ui-tweaks/hass-ui-tweaks.js`
Select: JavaScript module
- Save and refresh your UI with CTRL+F5 the changes should apply.

## Modifications:
- You can modify the JS file and configure many variables to meet your needs.
- If you want to personalize the tweak on individual machines, you could also easily connvert the JS file to a GreaseMonkey/TamperMonkey script and set custom settings for each machine.
