# phaser-tilemap-plus [![Build Status](https://travis-ci.org/colinvella/phaser-tilemap-plus.svg?branch=master)](https://travis-ci.org/colinvella/phaser-tilemap-plus)

A [Phaser](http://phaser.io) game framework plugin that implements tile animation, sloped tile physics, events and custom property enhancements for tilemaps loaded from [Tiled](http://www.mapeditor.org) JSON map files within the [Phaser](http://phaser.io) game framework.

**Check out the interactive [demo](https://colinvella.github.io/phaser-tilemap-plus-demo/)**. :video_game:

![phaser-tilemap-plus-demo](https://user-images.githubusercontent.com/1244038/32296653-17530fd6-bf4d-11e7-80f2-c2d82bbed151.gif)

This is a Phaser plugin that leverages the map editing capabilities of the [Tiled](http://www.mapeditor.org) map editor. It allows the developer to selectively enable the following features:
* tile animation as defined in the [Tiled](http://www.mapeditor.org) map editor
* object layer based collision with support for sloped and curved tiles
* custom properties for tilemaps, tilesets and layers
* event handling for sprite to map collisions and region-triggered events

The plugin is designed to facilitate integration into existing code bases with minimal code changes.

## How It Works
The plugin injects code into Phaser's loader mechanism to load the underlying Tiled JSON files in a separate cache key, extracting information currently ignored by the tilemap loader. It also injects a custom factory function to enhance the loaded tilemap object with additional functionality, such as animation, physics, custom properties and event handling.

## Supported Formats
When exporting a Tiled map to JSON format for use with the library, make sure to set one of the following formats in Maps > Properties > Tile Layer Format:
* XML
* Base 64 Uncompressed
* CSV

## Installation :hammer:
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

## Usage :book:

For a complete working example, check out the source code of the [demo game](https://github.com/colinvella/phaser-tilemap-plus-demo).

### Install Plugin
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

### Enable Tile Animations
If you have defined tile animations within Tiled prior to exporting the map to JSON format, you can enable them by adding the following code after adding the tilemap and corresponding tilemap layers in your `create()` function:

```js
game.tilemap.plus.animation.enable();
```

![image](https://user-images.githubusercontent.com/1244038/32300241-dfa24bc2-bf58-11e7-83d8-1aaa6e7c99d1.png)

Animations can be disabled by calling `tilemap.plus.animation.disable()`.

### Enable Physics
You can add an object layer to your Tiled map and add polygons and rectangles to define collidable boundaries in your map, independently from the tiles used. This allows the use of sloped or curved floors, walls and ceilings, against which sprites can interact accordingly, such as sliding down or bouncing accurately. Object layer-based collision also allows the implementation of hidden passages and platforms.

The physics engine uses a fast quadtree-based broad phase collision detection, coupled with a separation axis
theorem (SAT) implementation for the narrow phase collision detection on the polygon objects defined in the object layer. On initialisation, the physics engine decomposes all concave polygons into convex polygons, to allow use of SAT. 

![image](https://user-images.githubusercontent.com/1244038/32300160-874d7096-bf58-11e7-9d22-d808a2b672b5.png)

To enable collision against an object layer, call the `enableObjectLayer` method, passing in the name of the object layer within the map, like this:
```js
game.tilemap.plus.physics.enableObjectLayer("Collision");
```

To collide sprites against the map, call the following in your `update()` method:
```js
game.tilemap.plus.physics.collideWith(sprite);
```

#### Surface Interaction

Whenever a sprite is touching the collision layer, its body will have a `plus` object attached with a number of collision related properties:

* `contactNormal`: a value of type `Vector` indicating the overall direction away from the contact surfaces. The contact normal is a unit vector (a vector of length 1.0)
* `contactNormals`: an array of `Vector` types containing contact normals for every contact surface
* `penetration`: a value of type `Vector` indicating the overall penetration into the contact surfaces. This is used by the physics engine to correct the sprite's position after it penetrates the tile map
* `penetrations`: an array of `Vector` types containing penetration vectors for every contact surface. The sum of these vectors equals the value of `penetration`

 These properties can be used to determine when and in what direction to jump off the surface. For example, a sprite is allowed to jump only when `sprite.body.plus.contactNormal.y < 0`, that is has a component pointing upwards.

#### Surface Rebound

To make sprites rebound off surfaces, add a `bounce` custom property to an object in the object layer, with a value that is a fraction
of the rebound velocity. For example. if you want a sprite to bounce back with half the incoming velocity, set `bounce` to `0.5`. To
make Sonic-style springs, you can assign a value higher than `1.0`.

<p align="center"><img src="https://user-images.githubusercontent.com/1244038/32395807-f74aa41e-c0e2-11e7-90cf-5f7e882fb724.gif" alt="phaser-tilemap-plus physics bounce"></p>

#### One Way Platforms

Many games implement platforms that the player can jump on from underneath. To implement a platform
with this behaviour, add a custom property `collideOnly = down` to the platform's shape in the object layer.
This will cause the physics engine to ignore collisions where the sprite's velocity doesn't have a downward
component, effectively allowing the sprite to pass through the platform from underneath.

In a similar manner, it is possible to make passthrough ceilings that impede upward motion by setting `collideOnly = up`. One way walls or entrances can similarly be implemented by setting `collideOnly = right` or
`collideOnly = left`.

### Custom Properties

Tiled allows the level designer to define custom properties at the map, layer and tileset level, that can be used to define meta data such as the player's starting position, exit point, level effects and so on. 
The plugin exposes these properties in the corresponding `tilemap`, `tilemapLayer`s and `tileset`s instanciated in the `create()` function of the game state.

#### Tilemap Custom Properties

Tilemap custom properties can be accessed as follows:

```js
// get player start position from tilemap custom properties
var mapProperties = tilemap.plus.properties;
player.x = mapProperties.playerStartX;
player.y = mapProperties.playerStartY;
```

#### Layer Custom Properties

Custom properties defined at the tilemap layer level can be accessed as follows:

```js
// get layer effects from custom properties
var layerProperties = tilemapLayer.plus.properties;
var rainEffect = layerProperties.rain;
var windEffect = layerProperties.wind;
```

#### Tileset Custom Properties

Tileset custom properties can be accessed as follows:

```js
// get loot probability from custom properties
var tilesetProperties = tileset.plus.properties;
var lootProbability = tilesetProperties.lootProbability;
```

### Event Handling

The event system allows event handlers, in the form of callback functions, to be hooked to specific events in the
game, such as when a sprite collides with the tilemap's collision layer if enabled. It is also possible to set up
a specific object layer, independent of the collision layer, to contain shapes that act as event triggers.

#### Collision Events

To listen to sprite against object layer collision events, listener functions can be mapped on a per sprite basis:

```js
// listen to player collisions against the tilemap
var playerListener = tilemap.plus.events.collisions.add(player,
  function(shape, oldVelocity, newVelocity, contactNormal) {
    // if the tilemap has a strong bounce property, play spring sound
    if (shape.properties.bounce > 1) {
        springAudio.play();
    }
    // if the downward velocity lessened drastically, play thud sound
    if (oldVelocity.y - newVelocity.y > 300) {
        thudAudio.play();                
    }
  }
);
```

The listener function is invoked whenever the sprite hits a shape from the collision layer. The function's
parameters consist of the shape, the old (pre-collision) and new (post-collision) velocity vectors of the sprite and
the contact normal vector (a vector of length 1 that points away at 90 degrees from the surface). These parameters
can be used to apply behaviours and/or effects as needed.

If a reference to a listener function is maintained, it can eventually be removed from the event system like this:

```js
// remove playerListener listener from player collision event list
tilemap.plus.events.collisions.remove(player, playerListener);
```

#### Region Based Events

Just as Tiled's object layers can be used to define physical boundaries within the map, they can also be used to
define event triggering regions, using a separate object layer dedicated for this purpose. Events can be set up
for any given sprite entering and/or leaving a region (a polygon or rectangle shape) in the object layer. This
is useful for setting up area-specific effects, trigger enemy spawning, set save points and so on.

To enable a specific object layer to handle region events, add the following code in the `create()` function:

```js
// enable region events using object layer named "Events"
tilemap.plus.events.regions.enableObjectLayer("Events");
```

After enabling region evemts, bind an `onEnter` listener function to a sprite:

```js
// simulate entering a poorly lit area if region has custom property isDark = true
var playerInside = tilemap.plus.events.regions.onEnterAdd(player, function(region) {
  if (region.properties.isDark) {
    // tween dark mask sprite to 50% alpha
    game.add.tween(lightSprite).to( { alpha: 0.5 }, 250, "Linear", true);
  }
});
```

An `onLeave` listener can be bound to a sprite in a similar way:

```js
// simulate leaving a poorly lit area
var playerOutside = tilemap.plus.events.regions.onLeaveAdd(player, function(region) {
  if (region.properties.isDark) {
    // tween dark mask sprite to transparent
    game.add.tween(lightSprite).to( { alpha: 0.0 }, 250, "Linear", true);
  }
});
```

To process region events, the `triggerWith(...)` function must be called for every frame by
invoking it from within the `update()` function:

```js
// trigger region events against player sprite
tilemap.plus.events.regions.triggerWith(player);
```

Finally, listeners can be unbound from a sprite using the `onEnterRemove(..)` and
`onLeaveRemove` functions, provided references to the listener functions are kept:

```js
// unhook enter and leave listeners from player sprite
tilemap.plus.events.regions.onEnterRemove(player, playerInside);
tilemap.plus.events.regions.onLeaveRemove(player, playerOutside);
```

## Further Information :point_left:

If you find bugs within the plugin or need help to incorporate it in your game, please raise an
[issue](https://github.com/colinvella/phaser-tilemap-plus/issues/new) on
[GitHub](https://github.com/colinvella/phaser-tilemap-plus). I will try to help you out as best
as I can.

## Thanks :heart:

A thank you note for those who made this plugin possible:

- [Richard Davey](https://twitter.com/photonstorm) - for Phaser :rocket:
- [Stefan Hedman (schteppe)](https://github.com/schteppe) - for the manual port of [Poly Decomp](https://github.com/schteppe/poly-decomp.js) by Mark Bayazit :bookmark_tabs:
- [Chris Andrew (@hexus)](https://github.com/hexus) - for the [phaser-arcade-slopes](https://github.com/hexus/phaser-arcade-slopes) library :triangular_ruler:, which was the source of inspiration for *phaser-arcade-plus* :thumbsup:

