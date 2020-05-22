const values = require('./cardTypes.js').values

class Card {
  constructor(suit, value) {
    this.suit = suit
    this.value = value
    this.name = value + ' of ' + suit
  }

  isGreaterValueThan(card) {
    return values.indexOf(this.value) > values.indexOf(card.value)
  }
}

export default Card
