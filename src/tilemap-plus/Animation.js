export default class Animation {
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
    const tilesJson = tilesetJson.tiles;
    if (!tilesJson) {
        return;
    }
    for (const animatedTileId of Object.keys(tilesJson)) {
        const tileJson = tilesJson[animatedTileId];
        const animationJson = tileJson.animation;
        if (animationJson && animationJson.length > 0) {
            _addAnimationsFromAnimatedTile.bind(this)(tilesetJson, animatedTileId, animationJson);
        }
    }
}

function _addAnimationsFromAnimatedTile(tilesetJson, animatedTileId, animationJson) {
    const frames = animationJson.map(element => ({ tileId: element.tileid, duration: element.duration}));

    if (frames.length === 0) {
        return;
    }
    
    const tileset = this.tilemap.tilesets.find(t => t.name === tilesetJson.name);
    
    const tileAnimation = {
        frames,
        tileset,
        tileLocations: _getTileLocations.bind(this)(tileset.firstgid + parseInt(animatedTileId)),
        currentFrame: 0,
        currentDuration: 0
    };        

    this.tileAnimations.push(tileAnimation);
}

function _animate() {
    const deltaTime = this.time.elapsedMS;

    let dirty = false;
    for (const tileAnimation of this.tileAnimations) {
        const frames = tileAnimation.frames;
        const tileset = tileAnimation.tileset;
        const tileLocations = tileAnimation.tileLocations;
        const currentFrame = tileAnimation.currentFrame;
        const frameDuration = frames[currentFrame].duration;
        tileAnimation.currentDuration += deltaTime;
        if (tileAnimation.currentDuration > frameDuration) {
            tileAnimation.currentDuration -= frameDuration;
            tileAnimation.currentFrame = (currentFrame + 1) % frames.length;

            const newFrameIndex = tileset.firstgid + frames[tileAnimation.currentFrame].tileId;
            for (const tileLocation of tileLocations) {
                const tile = this.tilemap.getTile(tileLocation.x, tileLocation.y, tileLocation.layer, true);
                tile.index = newFrameIndex;
            }
            dirty = true;
        }
    }

    if (dirty) {
        for (const layer of this.tilemap.layers) {
            layer.dirty = true;                
        }
    }
}

function _getTileLocations(animatedTileId) {
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
                if (data[y * width + x] === animatedTileId) {
                    tileLocations.push({x, y, layer: layerJson.name});
                }
            }
        }
    }
    return tileLocations;
}
