import CollisionEvents from "./CollisionEvents";
import RegionEvents from "./RegionEvents";

export default class Events {
    constructor(tilemapJson) {
        this.collisions = new CollisionEvents();
        this.regions = new RegionEvents(tilemapJson);
    }
}