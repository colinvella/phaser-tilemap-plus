export default class TilemapPlusAnimation {
    constructor(tilemapJson, time, tilemap) {
        this.tilemapJson = tilemapJson;
        this.time = time;
        this.tilemap = tilemap;
        this.timer = null;
        this.tileAnimations = [];
        this.game = time.game;
    }

    enable() {
        if (this.timer == null) {
            for (const tilesetJson of this.tilemapJson.tilesets) {
                if (tilesetJson.tiles) {
                    _addAnimationsFromTileset.bind(this)(tilesetJson);
                }
            }

            this.timer = this.time.events.loop(20, () => _animate.bind(this)());
        }   
    }

    disable() {
        if (this.timer != null) {
            this.time.events.remove(this.timer);
            this.timer = null;
            this.tileAnimations = [];
        }
    }
}


function _addAnimationsFromTileset(tilesetJson) {
    for (const tileJson of Object.values(tilesetJson.tiles)) {
        const animationJson = tileJson.animation;
        if (animationJson && animationJson.length > 0) {
            _addAnimationsFromAnimatedTile.bind(this)(tilesetJson, animationJson);
        }
    }
}

function _addAnimationsFromAnimatedTile(tilesetJson, animationJson) {
    const tiles = animationJson.map(animationJson => animationJson.tileid);
    
    const frameInterval = animationJson.find(() => true).duration;
    const tileset = this.tilemap.tilesets.find(t => t.name === tilesetJson.name);
    
    const tileAnimation = {
        tiles,
        frameInterval,
        tileset,
        tileLocations: _getTileLocations.bind(this)(tiles),
        currentFrame: 0,
    };        

    this.tileAnimations.push(tileAnimation);
}

function _animate() {
    const currentTime = this.time.now;
    let dirty = false;
    for (const tileAnimation of this.tileAnimations) {
        const tiles = tileAnimation.tiles;
        const frameInterval = tileAnimation.frameInterval;
        const tileset = tileAnimation.tileset;
        const tileLocations = tileAnimation.tileLocations;
        const currentFrame = tileAnimation.currentFrame;
        
        const newFrame = Math.floor(currentTime / frameInterval) % tiles.length;
        if (newFrame != currentFrame) {
            const newFrameIndex = tileset.firstgid + tiles[newFrame];
            for (const tileLocation of tileLocations) {
                const tile = this.tilemap.getTile(tileLocation.x, tileLocation.y, tileLocation.layer, true);
                tile.index = newFrameIndex;
            }
            tileAnimation.currentFrame = newFrame;
            dirty = true;
        }
    }

    if (dirty) {
        for (const layer of this.tilemap.layers) {
            layer.dirty = true;                
        }
    }
}

function _getTileLocations(tiles) {
    const tileLocations = [];
    for (const layerJson of this.tilemapJson.layers) {
        if (layerJson.type !== "tilelayer") {
            continue;            
        }
        const data = layerJson.data;
        const width = layerJson.width;
        const height = layerJson.height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (tiles.includes(data[y * width + x] - 1)) {
                    tileLocations.push({x, y, layer: layerJson.name});
                }
            }
        }
    }
    return tileLocations;
}
