import Game from "./Game";
import { randomPosition, Position } from "../utils/position";

class Stickman {
    public game: Game; 
    public id: number;
    public position: Position

    constructor(game: Game, id: number) {
        this.game = game;
        this.id = id;
        this.position = randomPosition()
    }
}

export default Stickman;