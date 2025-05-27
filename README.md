# Home Assistant - UI Tweaks
This project is adding minor quality of life improvements to the UI. Modifies the Assist Chat UI to make it more pleasant to work with and better facilitate longer chat sessions. Also modifies the automation and script drag&drop editors to better show indentation levels. The tweaks only work for the web, not in phone app.

## Home Assistant Assist Chat UI

- Increase dialog width and heigth
- Prevent dialog window from closing when clicking outside its bounds
- Prefix "AI" to the page title while chat is open

## Automation and script editor

- Colorize panels in editor
- Change colors for each indentation level


## How to install:
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
