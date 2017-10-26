import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';

import Animation from "./Animation";
import Physics from "./Physics";

Phaser.Plugin.TilemapPlus = function (game, parent) {
	Phaser.Plugin.call(this, game, parent);

    Phaser.Loader.prototype.tilemapPlus = function(key, url, data, format) {
        this.tilemap(key, url, data, format);
        this.json(jsonKey(key), url);
    };
    
    Phaser.GameObjectFactory.prototype.tilemapPlus = function(key, tileWidth, tileHeight, width, height) {
        const tilemap = this.tilemap(key, tileWidth, tileHeight, width, height);
        const tilemapJson = this.game.cache.getJSON(jsonKey(key)); 
        tilemap.plus = new TilemapPlus(tilemapJson, this.game.time, tilemap);
        return tilemap;
    };    
};

function jsonKey(key) {
    return key + "-TilemapPlus";
}

class TilemapPlus {

    constructor(tilemapJson, time, tilemap) {
        this.tilemapJson = tilemapJson;
        this.time = time;
        this.tilemap = tilemap;
        this.timer = null;
        this.tileAnimations = [];
        this.game = time.game;
        this.animation = new Animation(tilemapJson, time, tilemap);
        this.physics = new Physics(tilemapJson);
    }    
}
