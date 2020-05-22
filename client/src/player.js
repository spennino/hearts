const suits = require('./cardTypes.js').suits
const values = require('./cardTypes.js').values

class Player {
  constructor(position) {
    this.position = position
    this.hand = []
    this.tricksWon = []
    this.points = 0
  }

  deal(card) {
    this.hand.push(card)
  }

  discard(discardCard) {
    let index = -1
    this.hand.forEach((card, idx) => {
      if (card.name === discardCard.name) {
        index = idx
      }
    })
    if (index >= 0) {
      this.hand.splice(index, 1)
    }
  }

  sortHand() {
    this.hand.sort((cardA, cardB) => {
      if (suits.indexOf(cardA.suit) !== suits.indexOf(cardB.suit)) {
        return suits.indexOf(cardA.suit) > suits.indexOf(cardB.suit) ? 1 : -1
      } else {
        return values.indexOf(cardA.value) > values.indexOf(cardB.value) ? 1 : -1
      }
    })
  }
}

export default Player
