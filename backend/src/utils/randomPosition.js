function randomPosition() {
    return {
        x:  (Math.random() * 400) + 200,
        y:  (Math.random() * 300) + 100
    }
}

module.exports = randomPosition;