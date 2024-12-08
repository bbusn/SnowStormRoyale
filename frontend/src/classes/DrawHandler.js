import SpriteLoader from "./SpriteLoader";

class DrawHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    let spriteLoader = new SpriteLoader();
    this.sprites = spriteLoader.sprites;
  }

  draw(state, username, king) {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (state.players) {
      state.players.sort((a, b) => {
        return a.position.y - b.position.y;
      })
      state.players.forEach((player) => {
        if (player.username !== username) {
          this.context.fillStyle='black';
          this.context.font = "12px Arial";
          let textWidth = this.context.measureText(player.username).width;
          this.context.fillText(player.username, player.position.x - textWidth / 2, player.position.y + 25);
        }
        this.sprites['stickmanShadow'].draw(this.context, player.position.x, player.position.y);
        let {spriteKey, index} = player.animation;
        this.sprites[spriteKey].drawIndex(this.context, index, player.position.x, player.position.y);
        if (player.username === king) {
            this.sprites['crown'].draw(this.context, player.position.x, player.position.y - 70);
        }
      });
    }

    if (state.latency) {
      this.context.fillStyle='blue';
      this.context.font = "12px Arial";
      this.context.fillText(`Ping: ${state.latency}`, 10, 20);
    }
  }
}

export default DrawHandler;