# Framer Presentation Templates

## Features

* When viewed on a desktop browser, your prototype will appear inside a device "frame", with an optional background behind it. The content of your prototype will be scaled to match the size of your browser window.
* When viewed on a mobile device, the frame disappears, so your prototype can feel like a real app.
* Self-contained. All you need to do is link to a script. No need to bother with additional assets or write code.
* Option to prompt users to add the prototype as an app on their homescreen before using it.
* Switch between presentation and development mode by pressing `Alt + P`.

## Usage

1. Download a template file from `templates/` that matches your needs and place it in your prototype's main directory. Here's the list of all currently available templates:
  * [iPhone 5s (White, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5s-white.js)
  * [iPhone 5s (White, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5s-white-landscape.js)
  * [iPhone 5s (Black, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5s-black.js)
  * [iPhone 5s (Black, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5s-black-landscape.js)
  * [iPhone 5s (Gold, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5s-gold.js)
  * [iPhone 5s (Gold, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5s-gold-landscape.js)
  * [iPhone 5c (White, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-white.js)
  * [iPhone 5c (White, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-white-landscape.js)
  * [iPhone 5c (Blue, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-blue.js)
  * [iPhone 5c (Blue, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-blue-landscape.js)
  * [iPhone 5c (Green, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-green.js)
  * [iPhone 5c (Green, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-green-landscape.js)
  * [iPhone 5c (Red, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-red.js)
  * [iPhone 5c (Red, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-red-landscape.js)
  * [iPhone 5c (Yellow, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-yellow.js)
  * [iPhone 5c (Yellow, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/iphone-5c-yellow-landscape.js)
  * [iPad Mini (White, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/ipad-mini-white.js)
  * [iPad Mini (White, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/ipad-mini-white-landscape.js)
  * [iPad Mini (Black, Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/ipad-mini-black.js)
  * [iPad Mini (Black, Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/ipad-mini-black-landscape.js)
  * [Nexus 5 (Portrait)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/nexus-5.js)
  * [Nexus 5 (Landscape)](https://raw.githubusercontent.com/tisho/framer-templates/master/templates/nexus-5-landscape.js)

2. Open your `index.html` in a text editor and link to the template using a `<script>` tag. The template should be included *after* the `framer.js` script:

  ```html
  <script src="framer/framer.js"></script>
  <script src="framer/framerps.js"></script>
  <script src="app.js"></script>

  <!-- Link to the template script: -->
  <script src="iphone-5s-white.js"></script>
  ```
3. Load `index.html` in a browser. You should see your prototype appear inside the presentation template.

## Setting the Background Image

The default background image is a plain off-white color, but if that's not to your tastes, you can use your own by specifying it as a template option before you load the template:

```html
<script>config.template = { backgroundImage: '[url to your background image]' };</script>
<script src="iphone-5s-white.js"></script>
```

## "Add to Homescreen" Prompt

<img src="http://tisho.co/framer-templates/images/homescreen-prompt-screenshot.png" width="414">

The templates have built-in capability for reminding users that view your prototype inside a mobile browser to add it to their homescreen for a more app-like experience. This feature is off by default, but you can turn it on like this:

```html
<script>config.template = { shouldShowAddToHomescreenPrompt: true };</script>
<script src="iphone-5s-white.js"></script>
```

## Building Your Own Template

All templates use the same basic code, but vary in configuration, depending on which device you want to use to present your prototype.
Here's what the configuration file for the white iPhone template looks like:

```json
{
  "backgroundImage": "",
  "shouldShowAddToHomescreenPrompt": false,
  "deviceWidth": 385,
  "deviceHeight": 805,
  "screenWidth": 320,
  "screenHeight": 568,
  "contentWidth": 640,
  "contentHeight": 1136,
  "cursorWidth": 32,
  "promptAnchorTop": 704,
  "promptAnchorLeft": 320,
  "addToHomescreenPromptImage": "images/addtohomescreen-prompt-iphone.png",
  "deviceImage": "images/iphone-5s-white.png",
  "cursorImage1x": "",
  "cursorImage2x": ""
}
```

Let's go over the different attributes:

* `backgroundImage` `(data URI, URL, or image path)` *Default:* empty

  An image that will be placed behind the device image.

* `shouldShowAddToHomescreenPrompt` `(true or false)` *Default:* false

  Specifies whether an "add to homescreen" prompt should be shown when the prototype is viewed on an iOS device, but not in homescreen standalone app mode.

* `deviceWidth` and `deviceHeight` `(number)`

  The width and height of the device image you're using. Note that the device image is automatically scaled by 50% in order to look crisp and clear on a retina screen, so you'll need to specify the size / 2 (e.g. if your image is 2050px, put in 1025 for device width).

* `screenWidth` and `screenHeight` `(number)`

  The size of the actual screen in your device image. For the iPhone background, for example, the size of the screen is `320x568`.

* `contentWidth` and `contentHeight` `(number)`

  The size of your actual prototype. This is usually the screen size multiplied by 2. By default, Framer's template assumes that your content is 640px wide (iPhone sized).

* `cursorWidth` `(number)`

  The width of the custom cursor image you supplied. This is used to figure out the location of anchor point of the cursor (for circular cursors, for example, this would be the middle of the circle).

* `promptAnchorTop` and `promptAnchorLeft` `(number)`

  This is the point in the "add to homescreen" prompt image that the arrow points to. You don't have to specify this if you're not using the prompt in the first place.

* `addToHomescreenPromptImage` `(data URI, URL, or image path)`

  This image will be displayed if the prototype is viewed on a mobile device and not in standalone (homescreen app) mode.

* `deviceImage` `(data URI, URL, or image path)`

  This is the device image that will be used to "hold" your prototype. Make sure that the actual screen portion of the device is centered perfectly in the image (hint: use one of the existing images for a template).

* `cursorImage1x` and `cursorImage2x` `(data URI, URL, or image path)` *Default:* a 32x32 bobble cursor.

  Custom cursor images in normal and retina resolutions.

**Note:** All image paths are automatically converted to data URIs, so that the template is self-contained.

To create your own template, copy one of the `config-*.json` files, edit the configuration values in there and then run:

```
npm install
cake build
```

You should see something like this:

```
clean Cleaning out templates directory...
build Using src/config-ipad-mini-black.json to generate templates/ipad-mini-black.js
build Using src/config-ipad-mini-white.json to generate templates/ipad-mini-white.js
build Using src/config-iphone-5c-blue.json to generate templates/iphone-5c-blue.js
build Using src/config-iphone-5c-green.json to generate templates/iphone-5c-green.js
build Using src/config-iphone-5c-red.json to generate templates/iphone-5c-red.js
build Using src/config-iphone-5c-white.json to generate templates/iphone-5c-white.js
build Using src/config-iphone-5c-yellow.json to generate templates/iphone-5c-yellow.js
build Using src/config-iphone-5s-black.json to generate templates/iphone-5s-black.js
build Using src/config-iphone-5s-gold.json to generate templates/iphone-5s-gold.js
build Using src/config-iphone-5s-white.json to generate templates/iphone-5s-white.js
build Using src/config-nexus-5.json to generate templates/nexus-5.js

All done. Have a nice day!
```

The newly generated template will appear under the `templates/` directory.

## Thanks & Acknowledgements

* [iPhone 5s & 5c PSD](http://dribbble.com/shots/1239144-iPhone-5s-iPhone-5c-PSD) by Louie Mantia
* [Nexus 5 PSD](http://dribbble.com/shots/1294040-Free-Nexus-5-PSD) by Victor Stuber
* [Bobble Cursor Image](https://github.com/joshpuckett/FramerWebView/blob/master/img/bobble.png) from Josh Puckett's [FramerWebView](https://github.com/joshpuckett/FramerWebView)
