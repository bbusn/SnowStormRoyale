const Animation = require('./Animation');
const randomPosition = require('../utils/randomPosition');
const randomKillPhrase = require('../utils/randomKillPhrase');

const actions = {
  NONE: 'none',
  HURT: 'hurt',
  ATTACK: {
    PUNCH: 'attack.punch'
  },
};

const attacks = {
  punch: {
    hitbox: {
      size: { x: 56, y: 24 },
      offset: { x: -56, y: -12 },
    },
  },
  punchR: {
    hitbox: {
      size: { x: 56, y: 24 },
      offset: { x: 0, y: -12 },
    },
  },
};

class Player {
  constructor(game, id, username) {
    this.game = game;
    this.username = username;
    this.hearts = 3;
    this.id = id;
    this.position = randomPosition();
    this.hurtbox = {
      size: { x: 44, y: 12 },
      offset: { x: -22, y: -6 },
    };
    this.baseMovespeed = { x: 10, y: 8 };
    this.movespeed = { ...this.baseMovespeed };
    this.sprintMultiplier = 1.7;
    this.facingRight = false;
    this.input = {};

    this.animations = {
      stand: new Animation('stickman', 0, 3, 4, true),
      standR: new Animation('stickmanR', 0, 3, 4, true),
      run: new Animation('stickman', 3, 4, 4, true),
      runR: new Animation('stickmanR', 3, 4, 4, true),
      sprint: new Animation('stickman', 3, 4, 2, true),
      sprintR: new Animation('stickmanR', 3, 4, 2, true),
      hurt: new Animation('stickman', 7, 5, 2, false),
      hurtR: new Animation('stickmanR', 7, 5, 2, false),
      punch: new Animation('stickmanAttacks', 0, 6, 2, false),
      punchR: new Animation('stickmanAttacksR', 0, 6, 2, false),
    };

    this.animations.punch.onIndex(3, () => {
      this.game.doAttack(attacks.punch, this);
    });
    this.animations.punchR.onIndex(3, () => {
      this.game.doAttack(attacks.punchR, this);
    });

    this.action = actions.NONE;
    this.animation = this.animations['stand'];
  }

  update() {
    this.input.left = !!this.input.left;
    this.input.right = !!this.input.right;
    this.input.up = !!this.input.up;
    this.input.down = !!this.input.down;
    this.input.attack = !!this.input.attack;
    const isSprinting = !!this.input.sprint;

    if (isSprinting) {
      this.movespeed.x = this.baseMovespeed.x * this.sprintMultiplier;
      this.movespeed.y = this.baseMovespeed.y * this.sprintMultiplier;
    } else {
      this.movespeed = { ...this.baseMovespeed };
    }

    let xInput = 0;
    if (this.input.left) xInput--;
    if (this.input.right) xInput++;
    let yInput = 0;
    if (this.input.up) yInput--;
    if (this.input.down) yInput++;

    if (xInput !== 0 && yInput !== 0) {
      const length = Math.sqrt(xInput * xInput + yInput * yInput);
      xInput /= length;
      yInput /= length;
    }

    this.animation.update();

    switch (this.action) {
      case actions.NONE:
        // MOVE with boundaries
        let newX = this.position.x + xInput * this.movespeed.x;
        let newY = this.position.y + yInput * this.movespeed.y;

        this.position.x = Math.max(30, Math.min(1220, newX));
        this.position.y = Math.max(60, Math.min(610, newY));

        // TURN
        if (xInput > 0) this.facingRight = true;
        else if (xInput < 0) this.facingRight = false;

        // SET STAND OR RUN ANIMATION
        if (xInput === 0 && yInput === 0) {
          this.animation = !this.facingRight ? this.animations['stand'] : this.animations['standR'];
        } else {
          if (isSprinting) this.animation = !this.facingRight ? this.animations['sprint'] : this.animations['sprintR'];
          else this.animation = !this.facingRight ? this.animations['run'] : this.animations['runR'];
        }

        // PUNCH
        if (this.input.attack) {
          this.game.sounds.push('attack');
          this.action = actions.ATTACK.PUNCH;
          this.animation = !this.facingRight ? this.animations['punch'] : this.animations['punchR'];
          this.animation.reset();
        }
        break;

      case actions.HURT:
        if (this.animation.isDone) {
          this.action = actions.NONE;
          this.animation = !this.facingRight ? this.animations['stand'] : this.animations['standR'];
        }
        break;

      case actions.ATTACK.PUNCH:
        if (this.animation.isDone) {
          this.action = actions.NONE;
          this.animation = !this.facingRight ? this.animations['stand'] : this.animations['standR'];
        }
        break;
    }
  }

  setKey(button, value) {
    this.input[button] = value;
  }

  loseOneHeart(attackerId) {
    this.hearts--;
    if (this.hearts < 1) {
      const killPhrase = randomKillPhrase();
      const username = this.game.players[attackerId].username;
      this.game.scores[username]++;
      this.game.scores[this.username] = 0;
      this.game.io.sockets.emit('kill', `${this.username} ${killPhrase} ${this.game.players[attackerId].username}`);
      this.game.io.to(this.id).emit('respawn');
      delete this.game.players[this.id];
    } else {
      this.game.io.to(this.id).emit('hurt', this.hearts);
    }
  }

  hurt() {
    this.action = actions.HURT;
    this.animation = !this.facingRight ? this.animations.hurt : this.animations.hurtR;
    this.animation.reset();
  }

  getDrawInfo() {
    return {
      position: this.position,
      facingRight: this.facingRight,
      animation: {
        spriteKey: this.animation.spriteKey,
        index: this.animation.getDrawIndex(),
      },
      username: this.username,
    };
  }
}

module.exports = Player;
