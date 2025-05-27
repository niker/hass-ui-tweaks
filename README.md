# Home Assistant - Assist UI Tweaks
This project is adding minor quality of life improvements to the Home Assistant Assist Chat UI to make it more pleasant to work with and better facilitate longer chat sessions.

## Features:
- Increase dialog width and heigth
- Prevent dialog window from closing when clicking outside its bounds
- Prefix "AI" to the page title while chat is open

## How to install:
- Clone this repository to `/config/www` in your Home Assitant

	or
	
- Just copy the `hass-ui-tweaks.js` file to `/config/www/hass-assist-ui-tweaks/hass-ui-tweaks.js`

- Go to Settings - Dashboards
- Click the 3 dots at the top right and select Resources
- Click Add Resource button and enter
Url: `/local/assist-ui-tweaks/assist-ui-tweaks.js`
Select: JavaScript module
- Save and refresh your UI with CTRL+F5 the changes should apply.

## Modifications:
- You can modify the JS file and set a custom width and height to your preference.
- If you want to personalize the tweak on individual machines, you could also easily connvert the JS file to a GreaseMonkey/TamperMonkey script and set custom sizes for each machine.
