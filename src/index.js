import TilemapPlus from "./tilemap-plus/TilemapPlus";
import TilemapLayerPlus from "./tilemap-plus/TilemapLayerPlus";
import TilesetPlus from "./tilemap-plus/TilesetPlus";
import SpritePlus from "./tilemap-plus/SpritePlus";

Phaser.Plugin.TilemapPlus = function (game, parent) {
	Phaser.Plugin.call(this, game, parent);
    
    const originalTilemapLoader = Phaser.Loader.prototype.tilemap;
    Phaser.Loader.prototype.tilemap = function(key, url, data, format) {
        originalTilemapLoader.call(this, key, url, data, format);
        this.json(jsonKey(key), url);
    };
    
    const originalTilemapFactory = Phaser.GameObjectFactory.prototype.tilemap;
    Phaser.GameObjectFactory.prototype.tilemap = function(key, tileWidth, tileHeight, width, height) {
        const tilemap = originalTilemapFactory.call(this, key, tileWidth, tileHeight, width, height);
        const tilemapJson = this.game.cache.getJSON(jsonKey(key)); 
        tilemap.plus = new TilemapPlus(tilemapJson, this.game.time, tilemap);
        return tilemap;
    };

    const originalTilemapCreateLayer = Phaser.Tilemap.prototype.createLayer;
    Phaser.Tilemap.prototype.createLayer = function(layer, width, height, group) {
        const tilemapLayer = originalTilemapCreateLayer.call(this, layer, width, height, group);
        tilemapLayer.plus = new TilemapLayerPlus(tilemapLayer);
        return tilemapLayer;
    };

    const originalTilemapAddTilesetImage = Phaser.Tilemap.prototype.addTilesetImage;
    Phaser.Tilemap.prototype.addTilesetImage = function(tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {
        const tilesetImage = originalTilemapAddTilesetImage.call(this, tileset, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid);
        tilesetImage.plus = new TilesetPlus(tilesetImage);
        return tilesetImage;
    };

    const originalSpriteFactory = Phaser.GameObjectFactory.prototype.sprite;
    Phaser.GameObjectFactory.prototype.sprite = function(x, y, key, frame, group) {
        const sprite = originalSpriteFactory.call(this, x, y, key, frame, group);
        sprite.plus = new SpritePlus(sprite);
        return sprite;
    };

    function jsonKey(key) {
        return key + "-TilemapPlus";
    }
};