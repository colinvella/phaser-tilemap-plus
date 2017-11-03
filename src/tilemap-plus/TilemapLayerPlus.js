export default class TilemapLayerPlus {
    constructor(tilemapLayer) {
        this.properties = tilemapLayer.layer.properties || {};
    }
}