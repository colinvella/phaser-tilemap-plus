import Animation from "./Animation";
import Physics from "./Physics";

export default class TilemapPlus {

    constructor(tilemapJson, time, tilemap) {
        this.tilemapJson = tilemapJson;
        this.time = time;
        this.tilemap = tilemap;
        this.timer = null;
        this.tileAnimations = [];
        this.game = time.game;
        this.animation = new Animation(tilemapJson, time, tilemap);
        this.physics = new Physics(tilemapJson);
        this.properties = tilemapJson.properties || {};
    }    
}
