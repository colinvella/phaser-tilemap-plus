# phaser-tilemap-plus
Tilemap animations, physics, events and custom property enhancements for Tiled JSON map files within the [Phaser](http://phaser.io) game framework

This is a Phaser plugin that leverages the map editing capabilities of the [Tiled](http://www.mapeditor.org/) map editor. It allows the developer to selectively enable the following features:
* tile animation
* object layer based collision
* custom properties (not yet implemented)
* object layer based event handling (not yet implemented)

The plugin is designed to facilitate integration into existing code bases with minimal code changes.

## How does it work
The plugin injects code into Phaser's loader mechanism to load the underlying Tiled JSON files in a separate cache key, extracting information currently ignored by the tilemap loader. It then enhances the loaded tilemap object with additional functionality, such as animation, physiscs, custom properties and event handling. 

## Installation
```shell
npm install phaser-tilemap-plus -S
```

## Code Import
There are several options for importing the code

### ES5
Use `require` to load the module into your code after Phaser 
```js
require("phaser-tilemap-plus");
```

### ES6
Use the `import` keyword to load the code
```es6
import "phaser-tilemap-plus";
```

### Script Reference
If you're not working in a NodeJS environment, copy the distribution script phaser-tilemap-plus.js from the
[latest release](https://github.com/colinvella/phaser-tilemap-plus/releases)
and include it after Phaser.

```html
<script src="phaser.min.js"></script>
<script src="phaser-tilemap-plus.js"></script>
```

# Usage
