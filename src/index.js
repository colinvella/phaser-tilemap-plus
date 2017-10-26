import TilemapPlus from "./tilemap-plus/TilemapPlus";

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

    function jsonKey(key) {
        return key + "-TilemapPlus";
    }
};