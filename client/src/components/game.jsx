import React from 'react'
import Deck from '../models/deck'
import Player from '../models/player'
import Hand from './hand'
import PlayerView from './playerView'
import Score from './score'

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameCode: props.gameCode,
      players: [],
      trick: {},
      trickSuit: '',
      playerTurn: 1,
      status: ''
    }

    if (props.startGame) {
      this.startGame()
    } else {
      this.fetchGameState()
    }

    this.handleDiscard = this.handleDiscard.bind(this)
  }

  startGame() {
    const deck = new Deck()
    this.numOfPlayers = 4
    for (var i = 1; i <= this.numOfPlayers; i++) {
      this.state.players.push(new Player(i))
    }
    deck.shuffle()
    while (deck.cards.length) {
      this.state.players.forEach(player => {
        const card = deck.cards.pop()
        player.deal(card)
        if (card.suit === 'Clubs' && card.value === 2) {
          this.state.playerTurn = player.position
          this.state.status = "Player " + player.position + "'s turn"
        }
      })
    }
    this.state.players.forEach(player => player.sortHand())
    this.postGameUpdate().catch(console.log)
  }

  fetchGameState() { }

  async postGameUpdate() {
    const response = await fetch('/api/game/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.state)
    });
    return response.json()
  }

  handleDiscard(card, playerPosition) {
    const trick = { ...this.state.trick }
    if (Object.values(trick).length >= this.numOfPlayers
      || playerPosition !== this.state.playerTurn) {
      return;
    }
    trick[playerPosition] = card

    let trickSuit = this.state.trickSuit
    if (Object.values(trick).length === 1) {
      trickSuit = card.suit
    }

    const players = this.state.players.slice()
    players.forEach(player => player.discard(card))

    let playerTurn = this.state.playerTurn
    let status = this.state.status
    if (Object.values(trick).length === this.numOfPlayers) {
      let winnerPos;
      players.forEach(player => {
        let card = trick[player.position];
        if (card.suit === trickSuit) {
          if (winnerPos == null || card.isGreaterValueThan(trick[winnerPos])) {
            winnerPos = player.position
            playerTurn = null
          }
        }
      })
      status = "Player " + winnerPos + " wins the trick!"
      this.delayClearTrick(winnerPos)
    } else {
      playerTurn++
      if (playerTurn > this.numOfPlayers) {
        playerTurn = 1
      }
      status = "Player " + playerTurn + "'s turn"
    }

    this.setState({
      players: players,
      trick: trick,
      trickSuit: trickSuit,
      playerTurn: playerTurn,
      status: status
    }, () => {
      this.postGameUpdate()
    })
  }

  delayClearTrick(winnerPos) {
    setTimeout(() => {
      const players = this.state.players.slice()
      let trick = { ...this.state.trick }
      players.forEach(player => {
        if (player.position === winnerPos) {
          player.tricksWon = player.tricksWon.concat(Object.values(trick))
        }
      })
      trick = {}
      let status
      let playerTurn = null
      if (players[0].hand.length === 0) {
        status = "End of hand! Updating score..."
        this.delayUpdateScore()
      } else {
        status = "Player " + winnerPos + "'s turn"
        playerTurn = winnerPos
      }
      this.setState({
        players: players,
        trick: trick,
        playerTurn: playerTurn,
        status: status
      })
    }, 2000)
  }

  delayUpdateScore() {
    setTimeout(() => {
      const players = this.state.players.slice()
      let shotTheMoonPos = null
      players.forEach(player => {
        let points = this.countPoints(player.tricksWon)
        if (points === 26) {
          shotTheMoonPos = player.position
        } else {
          player.points += points
        }
        player.tricksWon = []
      })
      if (shotTheMoonPos) {
        players.forEach(player => {
          if (player.position !== shotTheMoonPos) {
            player.points += 26
          }
        })
      }
      this.setState({
        players: players,
        status: "End of hand!"
      })
    }, 2000)
  }

  countPoints(cards) {
    let points = 0
    cards.forEach(card => {
      if (card.suit === 'Hearts') {
        points++
      } else if (card.name === 'Queen of Spades') {
        points += 13
      }
    })
    return points
  }

  render() {
    const playerViews = this.state.players.map(player => {
      return (
        <PlayerView
          key={player.position}
          position={player.position}
          hand={player.hand}
          onCardClick={this.handleDiscard} />
      )
    })

    const tricksWon = this.state.players.map(player => {
      return (
        <PlayerView
          key={player.position + 'tricksWon'}
          position={player.position}
          hand={player.tricksWon}
          onCardClick={() => { }}
        />
      )
    })

    const scores = this.state.players.map(player => {
      return (
        <Score
          key={player.position}
          position={player.position}
          points={player.points}
        />
      )
    })

    let trickCards = Object.values(this.state.trick);

    return (
      <div className='game-container'>
        <div className='game-code'>
          Game code: {this.state.gameCode}
        </div>
        <div className='game-status'>
          Status: {this.state.status}
        </div>
        <div className='players'>
          {playerViews}
        </div>
        <div className='trick'>
          Trick:
          <Hand cards={trickCards} />
        </div>
        <div className='discards'>
          Tricks Won:
          {tricksWon}
        </div>
        <div className='score'>
          Score:
          {scores}
        </div>
      </div>
    )
  }
}

export default Game