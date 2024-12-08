const Player = require('./Player');

const playerExists = (players, id) => {
  return players[id] ? true : false
}

class Game {

  constructor(io) {
    this.io = io;
    this.players = {};
    this.sounds = [];
    this.scores = {};

    this.io.on("connection", (socket) => {
      if (playerExists(this.players, socket.id)) delete this.players[socket.id];

      socket.on("disconnect", () => {
        if (playerExists(this.players, socket.id)) {
          const username = this.players[socket.id].username;
          io.sockets.emit("left", `${username}`);
          this.scores[username] = 0;
          delete this.players[socket.id];
        } 
      });

      socket.on("wantUsernames", () => {
        const usernames = Object.values(this.players).map((player) => player.username);
        socket.emit("usernames", usernames);
      });

      socket.on("addSound", (sound) => {
        this.sounds.push(sound);
      });

      socket.on("join", (username) => {
        if (playerExists(this.players, socket.id)) delete this.players[socket.id];

        this.scores[username] = 0;

        this.players[socket.id] = new Player(this, socket.id, username);
        io.sockets.emit("joined", `${username}`);
      });

      socket.on("leave", () => {
        if (playerExists(this.players, socket.id)) {
          const username = this.players[socket.id].username;
          io.sockets.emit("left", `${username}`);
          this.scores[username] = 0;
          delete this.players[socket.id];
        } 
      });


      socket.on("key", ({button, value}) => {
        let player = this.players[socket.id];
        if (player) {
          player.setKey(button, value);
        }
      });
    })
  }

  update() {
    Object.values(this.players).forEach((player) => {
      if (player) player.update();
    });
  }

  sendState() {
    let players = Object.values(this.players).map((player) => {
      return player.getDrawInfo();
    });
    this.io.sockets.volatile.emit("state", {
      players: players,
      sounds: this.sounds,
      scores: this.scores,
      count: Object.keys(this.players).length,
    });
    this.sounds = [];
  }

  doAttack(attack, attacker) {
    Object.values(this.players).forEach((player) => {
      if (
        player.id !== attacker.id 
        && this.checkCollision(attack.hitbox, attacker.position, player.hurtbox, player.position)
      ) {
        player.hurt();
        player.loseOneHeart(attacker.id);
        attacker.animation.pause(5);
        player.animation.pause(5);
      }
    });
  }

  checkCollision(box1, box1Pos, box2, box2Pos) {
    return (
      box1Pos.x + box1.offset.x < box2Pos.x + box2.offset.x + box2.size.x
      && box1Pos.x + box1.offset.x + box1.size.x > box2Pos.x + box2.offset.x
      && box1Pos.y + box1.offset.y < box2Pos.y + box2.offset.y + box2.size.y
      && box1Pos.y + box1.offset.y + box1.size.y > box2Pos.y + box2.offset.y
    );
  }
}

module.exports = Game;