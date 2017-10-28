# phaser-tilemap-plus [![Build Status](https://travis-ci.org/colinvella/phaser-tilemap-plus.svg?branch=master)](https://travis-ci.org/colinvella/phaser-tilemap-plus)

Tilemap animations, physics, events and custom property enhancements for Tiled JSON map files within the [Phaser](http://phaser.io) game framework

This is a Phaser plugin that leverages the map editing capabilities of the [Tiled](http://www.mapeditor.org/) map editor. It allows the developer to selectively enable the following features:
* tile animation
* object layer based collision (for use with Arcade physics)
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

### Modular
```js
require("phaser-tilemap-plus"); // ES5 require() function
```
or
```es6
import "phaser-tilemap-plus"; // ES6 import keyword
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

# Install Plugin
Within the `create()` function or method of your game state, add the plugin to the Phaser framework. If you have multiple states, this can be done in your booting state.

```js
  game.plugins.add(Phaser.Plugin.TilemapPlus); // ES5  
```
or
```es6
  this.game.plugins.add(Phaser.Plugin.TilemapPlus); // ES6 if create() is a method override
```

*NOTE:* In general, the difference between ES5 and ES6 code is that in ES6, the `game` object is a property of the game state object and must be prefixed by `this`. The next examples will quote only ES5 code for the sake of brevity.

# Load Tilemap
Within your `preload()` function or method, replace the call to `load.tilemap` with `load.tilemapPlus`
```js
game.load.tilemapPlus('tileMap', 'path-to/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
```

# Add Tilemap
Within your `create()` function or method (after loading the plugin if in the same game state), replace the call to `add.tilemap` with `add.tilemapPlus`
```js
game.tilemap = this.add.tilemapPlus('tileMap');
```

# Enable Tile Animations
If you have defined tile animations within Tiled prior to exporting the map to JSON format, you can enable them like this:
```js
game.tilemap.plus.animation.enable();
```
Animations can be disabled by calling `tilemap.plus.animation.disable()`.

# Enable Physics
You can add an object layer to your Tiled map and add polygons and rectangles to define collidable boundaries in your map, independent of the tiles used. This allows the use of sloped floors, walls and ceilings, against which sprites can interact accordingly, such as sliding down. Object later based collision also allows the implementation of hidden passages and platforms.

To enable collision against an object layer, call the `enableObjectLayer` method, passing in the name of the object layer within the map, like this:
```js
game.tilemap.plus.physics.enableObjectLayer("Collision");
```

To collide sprites against the map, call the following in your `update()` method:
```js
game.tilemap.plus.physics.collideWith(sprite);
```

Whenever a sprite is touching the collision layer, it's body will have contactNormal `Vector` indicating the direction away from the contact surface. This can be used to determine when and in what direction to jump off the surface.

# Custom Properties

To do

# Object Layer Event Handling

To do
