import { io } from "socket.io-client";
import resizeCanvas from "./utils/resizeCanvas";
import './style.css'
import DrawHandler from "./classes/DrawHandler";

let joined = false;
let username = false;
let king = false;
let lastScores = {};

const elements = {
    canvas: document.getElementById('canvas'),
    kills: document.querySelector('#kills'),
    hearts: document.querySelectorAll('.heart'),
    hurt: document.querySelector('#hurt'),
    heartsContainer: document.querySelector('#hearts'),
    usernameInput: document.getElementById('usernameInput'),
    scoreboard: document.getElementById('scoreboard'),
    menu: document.getElementById('menu'),
    error: document.getElementById('error'),
    joinButton: document.getElementById('joinButton'),
    players: document.querySelector('#players'),
    keys: document.querySelectorAll('.key'),
    soundKeys: document.querySelectorAll('.sound-key'),
    keysContainer: document.querySelector('#keys'),
    soundKeysContainer: document.querySelector('#soundKeys'),
    vulgarityFilter: document.querySelector('#vulgarityFilter'),
    keyTitles: document.querySelectorAll('.key-title'),
    clickKey: document.querySelector('#click-key'),
};


const drawHandler = new DrawHandler(elements.canvas);

const soundKeysMap = {
    '1': 'emotes/1',
    '&': 'emotes/1',
    '2': 'emotes/2',
    'é': 'emotes/2',
    '3': 'emotes/3',
    '"': 'emotes/3',
    '4': 'emotes/4',
    '\'': 'emotes/4',
    '5': 'emotes/5',
    '(': 'emotes/5',
    '6': 'emotes/6',
    '-': 'emotes/6',
    '7': 'emotes/7',
    'è': 'emotes/7',
    '8': 'emotes/8',
    '_': 'emotes/8',
    '9': 'emotes/9',
    'ç': 'emotes/9',
    '0': 'emotes/10',
    'à': 'emotes/10'
}

const soundDuration = {
    'emotes/1': 2000,
    'emotes/2': 1500,
    'emotes/3': 1500,
    'emotes/4': 3000,
    'emotes/5': 2000,
    'emotes/6': 9500,
    'emotes/7': 9500,
    'emotes/8': 10500,
    'emotes/9': 8500,
    'emotes/10': 10000,
}

const keyMap = {
    'up': 'up',
    'down': 'down',
    'left': 'left',
    'right': 'right',
    'z': 'up',
    's': 'down',
    'q': 'left',
    'd': 'right',
    'shift': 'sprint',
}

const sounds = ['attack', 'hurt', 'kill', 'emotes/1', 'emotes/2', 'emotes/3', 'emotes/4', 'emotes/5', 'emotes/6', 'emotes/7', 'emotes/8', 'emotes/9', 'emotes/10'];
const soundsWithVulgarity = ['emotes/1', 'emotes/4', 'emotes/7', 'emotes/8', 'emotes/9'];

let inputs = {}
let vulgarity = !elements.vulgarityFilter.checked;

elements.vulgarityFilter.addEventListener('change', function() {
    vulgarity = !this.checked;
});

const url = new URL(window.location.href);
const protocol = url.protocol === 'https:' ? 'wss' : 'ws';

const socketUrl = `${protocol}://${url.hostname}:${url.port}`;
const socket = io(socketUrl);

resizeCanvas(elements.canvas);

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => resizeCanvas(elements.canvas), 200);
});

const setKey = (button, value) => {
    if (!joined) return;
    if (button !== undefined && inputs[button] !== value) {
      inputs[button] = value;
      socket.emit("key", {button: button, value: value});
    }
}

const preloadedSounds = {};

// Preload all sounds
sounds.forEach(sound => {
    preloadedSounds[sound] = new Audio(`./sounds/${sound}.mp3`);
    preloadedSounds[sound].load();
});
  

const playSound = (sound) => {
    if (vulgarity && soundsWithVulgarity.includes(sound)) return;

    if (preloadedSounds[sound]) {
        preloadedSounds[sound].play()
            .catch((error) => {
                console.error(`Error playing ${sound}:`, error);
            });
    } else {
        console.error(`Sound not preloaded: ${sound}`);
    }
};

const leave = () => {
    joined = false;
    elements.menu.classList.remove('hidden');
    elements.error.classList.add('hidden');
    elements.heartsContainer.classList.add('hidden');
    elements.hearts.forEach(heart => heart.classList.remove('hidden'));
    elements.keyTitles.forEach(key => key.classList.remove('hidden'));
    elements.keysContainer.classList.remove('opacity-30');
    elements.keysContainer.classList.add('opacity-60');
    elements.soundKeysContainer.classList.add('hidden');
    elements.soundKeysContainer.classList.remove('flex');
    socket.emit('leave');
}
const askUsernames = () => {
    socket.emit('wantUsernames');
}

window.addEventListener('beforeunload', (event) => {
    if (!confirm('Are you sure you want to leave?')) {
        event.preventDefault();
    } else {
        socket.emit('leave');
    }
});

elements.soundKeys.forEach(key =>  {
    key.addEventListener('click', function() {
        if (!joined) return;
        const name = soundKeysMap[key.id];
        const duration = soundDuration[name];

        key.style.position = 'relative';
        key.style.overflow = 'hidden';

        const bgSpan = document.createElement('span');
        bgSpan.className = 'absolute top-0 left-0 w-full h-full bg-gray-400';
        bgSpan.style.transition = `width ${duration / 1000}s linear`;
        bgSpan.style.width = '0';

        key.appendChild(bgSpan);

        setTimeout(() => {
            bgSpan.style.width = '100%';
        }, 10);

        setTimeout(() => {
            bgSpan.remove();
        }, duration);

        socket.emit('addSound', name);
    });
});

document.addEventListener('contextmenu', event => event.preventDefault());
elements.joinButton.addEventListener('click', async () => {
    const regex = /^[a-zA-Z0-9]+$/;
   
    if (usernameInput.value.length < 3 || usernameInput.value.length > 15 || !regex.test(usernameInput.value)) {
        elements.error.innerHTML = 'Le pseudo doit contenir entre 3 et 15 caractères chiffres ou lettres';
        elements.error.classList.remove('hidden');
        return;
    }

    askUsernames();

    await new Promise(resolve => {
        socket.on('usernames', (usernames) => {
            usernames = usernames;
            if (usernames.includes(elements.usernameInput.value)) {
                elements.error.innerHTML = 'Ce pseudo est déjà pris';
                elements.error.classList.remove('hidden');
                return;
            }
            resolve();
        });
    });

   

    username = elements.usernameInput.value;

    
    elements.error.classList.add('hidden');
    elements.menu.classList.add('hidden');
    elements.keyTitles.forEach(key => key.classList.add('hidden'));
    elements.heartsContainer.classList.remove('hidden');
    elements.hearts.forEach(heart => heart.classList.remove('hidden'));
    elements.keysContainer.classList.add('opacity-30');
    elements.keysContainer.classList.remove('opacity-60');
    elements.soundKeysContainer.classList.remove('hidden');
    elements.soundKeysContainer.classList.add('flex');

    socket.emit('join', username);
    joined = true;
});

const handleKeyDown = (e) => {
    if (e.key === 'Escape') leave();
    if (e.key === 'Enter' && !joined) elements.joinButton.click();

    if (e.key && soundKeysMap[e.key]) {
        if (!joined) return;
    }

    elements.keys.forEach(key => {
        if (key.id === e.key.toLowerCase()) {
            key.classList.add('pressed');
        }
    });

    const button = keyMap[e.key.toLowerCase()];
    setKey(button, true);
};

const handleKeyUp = (e) => {

    elements.keys.forEach(key => {
        if (key.id === e.key.toLowerCase()) {
            setTimeout(() => {
                key.classList.remove('pressed');
            }, 100);
        }
    });

    const button = keyMap[e.key.toLowerCase()];
    setKey(button, false);
};

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

document.addEventListener('mousedown', function() {

    elements.clickKey.classList.add('pressed');
    setTimeout(() => {
        elements.clickKey.classList.remove('pressed');
    }, 300);

    let button = 'attack';
    setKey(button, true);
});


document.addEventListener('blur', function() {
    let button = 'attack';
    setKey(button, false);
    for (let key in inputs) {
        setKey(key, false);
    }
});


document.addEventListener('mouseup', function() {
    let button = 'attack';
    setKey(button, false);
});



socket.on('connect_error', () => {
    elements.error.innerHTML = 'Impossible de se connecter au serveur';
    elements.error.classList.remove('hidden');
});


let killInterval;

const updatePlayersList = (message, color) => {
    const playerMessage = document.createElement('div');
    playerMessage.innerHTML = message;
    playerMessage.style.color = color;
    elements.players.appendChild(playerMessage);
    setTimeout(() => {
        elements.players.removeChild(playerMessage);
    }, 5000);
};

socket.on('left', (username) => {
    updatePlayersList(`${username} est parti(e)`, 'red');
});

socket.on('joined', (username) => {
    updatePlayersList(`${username} est apparu(e)`, 'green');
});

socket.on('kill', (kill) => {
    playSound('kill');
    elements.kills.innerHTML = kill;
    clearInterval(killInterval);
    killInterval = setInterval(() => {
        elements.kills.innerHTML = '';
    }, 3000);
})

socket.on('hurt', (heartsCount) => {
    let changes = false;
    elements.hearts.forEach((heart, index) => {
        if (index < heartsCount) {
            if (heart.classList.contains('hidden')) {
                heart.classList.remove('hidden');
                changes = true;
            }
        } else {
            if (!heart.classList.contains('hidden')) {
                heart.classList.add('hidden');
                playSound('hurt');
                changes = true;
            }
        }
    });
    if (changes) {
        elements.hurt.classList.remove('hidden');
        setTimeout(() => {
            elements.hurt.classList.add('hidden');
        }, 100);
    }
});


socket.on('respawn', () => {
    joined = false;
    elements.menu.classList.remove('hidden');
    elements.error.classList.add('hidden');
    elements.heartsContainer.classList.add('hidden');
    elements.hearts.forEach(heart => heart.classList.remove('hidden'));
    elements.keyTitles.forEach(key => key.classList.remove('hidden'));
    elements.keysContainer.classList.remove('opacity-30');
    elements.keysContainer.classList.add('opacity-60');
    elements.soundKeysContainer.classList.add('hidden');
    elements.soundKeysContainer.classList.remove('flex');
})
let lastFrameTime = 0;

socket.on("state", function(state) {
    const now = performance.now();
    const deltaTime = now - lastFrameTime;

    if (deltaTime < 1000 / 60) return;

    lastFrameTime = now;

    if (state.sounds) {
        state.sounds.forEach(sound => {
            if (sound) {
                playSound(sound);
            }
        });
    }
    
    drawHandler.draw(state, username, king);
    
    if (JSON.stringify({ scores: state.scores, count: state.count }) !== JSON.stringify(lastScores)) {
        lastScores = { scores: state.scores, count: state.count };
        elements.scoreboard.innerHTML = `
            <h3 class="w-full bg-gray-200/50 px-6 text-primary font-semibold">Tableau des scores - <span class="font-normal text-gray-400">${state.count} en jeu</span></h3>
        `;
        const sortedScores = Object.entries(state.scores).sort((a, b) => b[1] - a[1]);
        sortedScores.forEach(([username, score], index) => {
            if (score === 0) return;   
            if (index === 0) {
                king = username;
                elements.scoreboard.innerHTML += `<li class="text-yellow-500 font-bold"><span>${username}</span> ${score}</li>`;
            } else {
                elements.scoreboard.innerHTML += `<li><span>${username}</span> ${score}</li>`;
            }
        });
    }
});