# phaser-tilemap-plus [![Build Status](https://travis-ci.org/colinvella/phaser-tilemap-plus.svg?branch=master)](https://travis-ci.org/colinvella/phaser-tilemap-plus)

Tilemap animations, physics, events and custom property enhancements for Tiled JSON map files within the [Phaser](http://phaser.io) game framework

Check out the [demo](https://colinvella.github.io/phaser-tilemap-plus-demo/).

![phaser-tilemap-plus-demo](https://user-images.githubusercontent.com/1244038/32296653-17530fd6-bf4d-11e7-80f2-c2d82bbed151.gif)

This is a Phaser plugin that leverages the map editing capabilities of the [Tiled](http://www.mapeditor.org/) map editor. It allows the developer to selectively enable the following features:
* tile animation
* object layer based collision (for use with Arcade physics)
* custom properties (not yet implemented)
* object layer based event handling (not yet implemented)

The plugin is designed to facilitate integration into existing code bases with minimal code changes.

*NOTE:* This plugin is a work in progress in early development stage. Feel free to try it out or even integrate it in your
projects, but please bear in mind that the API is still in flux and future updates may introduce breaking changes.

## How It Works
The plugin injects code into Phaser's loader mechanism to load the underlying Tiled JSON files in a separate cache key, extracting information currently ignored by the tilemap loader. It also injects a custom factory function to enhance the loaded tilemap object with additional functionality, such as animation, physiscs, custom properties and event handling.

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

Load the tilemap and corresponding tilemap layers as you normally would. The plugin will transparently enhance the tilemap to support the additional features.

*NOTE:* In general, the difference between ES5 and ES6 code is that in ES6, the `game` object is a property of the game state object and must be prefixed by `this`. The next examples will quote only ES5 code for the sake of brevity.

# Enable Tile Animations
If you have defined tile animations within Tiled prior to exporting the map to JSON format, you can enable them by adding the following code after adding the tilemap and corresponding tilemap layers in your `create()` function:

```js
game.tilemap.plus.animation.enable();
```

![image](https://user-images.githubusercontent.com/1244038/32300241-dfa24bc2-bf58-11e7-83d8-1aaa6e7c99d1.png)

Animations can be disabled by calling `tilemap.plus.animation.disable()`.

# Enable Physics
You can add an object layer to your Tiled map and add polygons and rectangles to define collidable boundaries in your map, independently from the tiles used. This allows the use of sloped or curved floors, walls and ceilings, against which sprites can interact accordingly, such as sliding down. Object layer based collision also allows the implementation of hidden passages and platforms.

![image](https://user-images.githubusercontent.com/1244038/32300160-874d7096-bf58-11e7-9d22-d808a2b672b5.png)

To enable collision against an object layer, call the `enableObjectLayer` method, passing in the name of the object layer within the map, like this:
```js
game.tilemap.plus.physics.enableObjectLayer("Collision");
```

To collide sprites against the map, call the following in your `update()` method:
```js
game.tilemap.plus.physics.collideWith(sprite);
```

To make sprites rebound off surfaces, add a `bounce` custom property to an object in the object layer, with a value that is a fraction
of the rebound velocity. For example. if you want a sprite to bounce back with half the incoming velocity, set `bounce` to `0.5`. To
make Sonic-style springs, you can assign a value higher than `1.0`.

<p align="center"><img src="https://user-images.githubusercontent.com/1244038/32395807-f74aa41e-c0e2-11e7-90cf-5f7e882fb724.gif" alt="phaser-tilemap-plus physics bounce"></p>

Whenever a sprite is touching the collision layer, its body will have `contactNormal` of type `Vector` indicating the direction away from the contact surfaces. This can be used to determine when and in what direction to jump off the surface. For example, a sprite is
allowed to jump only when `sprite.body.contactNormal.y < 0`, that is, has a component pointing upwards.

# Custom Properties

Tiled allows the level designer to define custom properties at the map, layer and tileset level, that can be used to define meta data such as the player's starting position, exit point, level effects and so on. 
The plugin exposes these properties in the corresponding `tilemap`, `tilemapLayer`s and `tileset`s instanciated in the `create()` function of the game state.

## Tilemap Custom Properties

Tilemap custom properties can be accessed as follows:

```js
// get player start position from tilemap custom properties
var mapProperties = tilemap.plus.properties;
player.x = mapProperties.playerStartX;
player.y = mapProperties.playerStartY;
```

## Layer Custom Properties

Custom properties defined at the tilemap layer level can be accessed as follows:

```js
// get layer effects from custom properties
var layerProperties = tilemapLayer.plus.properties;
var rainEffect = layerProperties.rain;
var windEffect = layerProperties.wind;
```

## Tileset Custom Properties

Tileset custom properties can be accessed as follows:

```js
// get loot probability from custom properties
var tilesetProperties = tileset.plus.properties;
var lootProbability = tilesetProperties.lootProbability;
```

# Object Layer Event Handling

To do
