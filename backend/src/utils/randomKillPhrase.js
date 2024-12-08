const killPhrases = [
    "s\'est fait castagner par",
    "s\'est fait défoncer par",
    "s\'est fait éclater par",
    "s\'est fait massacrer par",
    "a été tué par l'cousin",
    "s\'est fait calmer par",
    "a été fumé comme un hérisson par",
    "est mort complet à cause de",
    "s\'est fait ranger dans l\'garage par",
    "s\'est fait éteindre le moteur par",
    "s\'est fait péter la caravane par",
    "s\'est fait envoyer à la casse par",
    "a pris un coup de cric par",
    "a mangé le pare-chocs à cause de",
    "s’est fait ranger dans la remorque par",
    "a pris la mandale de",
    "a pris le bouillon de",
    "a pris la tôle de",
    "a pris le parpaing de",
    "a la machoire cassée grâce à",
    "a pris le coup de boule de",
    "s\'est pris le coup de latte de",
    "a pris le coup du pied de",
    "a pris un coup de tournevis de la part de",
]

function randomKillPhrase() {
    return killPhrases[Math.floor(Math.random() * killPhrases.length)];
}

module.exports = randomKillPhrase;