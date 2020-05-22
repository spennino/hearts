import Card from './card'
const suits = require('./cardTypes.js').suits
const values = require('./cardTypes.js').values

class Deck {
  constructor() {
    this.cards = []
    for (const suit in suits) {
      for (const value in values) {
        const card = new Card(suits[suit], values[value])
        this.cards.push(card)
      }
    }
  }

  shuffle() {
    const { cards } = this
    let m = cards.length; let i

    while (m) {
      i = Math.floor(Math.random() * m--);
      [cards[m], cards[i]] = [cards[i], cards[m]]
    }

    return this
  }
}

export default Deck
