import React from 'react'
import Deck from '../models/deck'
import Player from '../models/player'
import Hand from './hand'
import PlayerView from './playerView'
import Score from './score'
import Card from '../models/card'

const WS_URL = process.env.NODE_ENV === 'development'
  ? 'ws://localhost:5000'
  : 'wss://infinite-sea-14790.herokuapp.com/'

class Game extends React.Component {

  constructor(props) {
    super(props)
    this.numOfPlayers = props.numOfPlayers || 4

    let parsedGamedState
    if (props.gameStateResponse) {
      // current issue: can't call set state until component is mounted
      // need the gameCode set bc of the check before the parsing
      this.state = { gameCode: props.gameCode }
      parsedGamedState = this.parseGameStateResponse(props.gameStateResponse)
    }

    this.state = {
      ws: new WebSocket(WS_URL),
      gameCode: props.gameCode,
      playerName: props.playerName,
      playerAdded: false,
      players: parsedGamedState ? parsedGamedState.players : [],
      trick: parsedGamedState ? parsedGamedState.trick : {},
      trickSuit: parsedGamedState ? parsedGamedState.trickSuit : '',
      playerTurn: parsedGamedState ? parsedGamedState.playerTurn : 1,
      status: parsedGamedState ? parsedGamedState.status : ''
    }

    this.handleDiscard = this.handleDiscard.bind(this)
    this.dealNextHand = this.dealNextHand.bind(this)
  }

  componentDidMount() {
    this.state.ws.onopen = () => {
      if (!this.state.playerAdded) {
        this.addPlayer(this.state.playerName)
      }
    }
    this.state.ws.onmessage = evt => {
      this.parseResponseAndUpdateState(evt.data)
    }
    this.state.ws.onclose = () => {
      this.setState({
        ws: new WebSocket(WS_URL),
      })
    }
  }

  addPlayer(playerName) {
    const players = this.state.players.slice()
    players.push(new Player(players.length + 1, playerName))
    this.setState({ players: players, playerAdded: true })
    if (players.length === this.numOfPlayers) {
      this.startGame()
    } else {
      let remaining = this.numOfPlayers - players.length
      this.setState({ status: "Waiting on " + remaining + " more player(s)" })
    }
    this.sendGameUpdate()
  }

  startGame() {
    const players = this.state.players.slice()
    const deck = new Deck()
    deck.shuffle()
    while (deck.cards.length) {
      players.forEach(player => { player.deal(deck.cards.pop()) })
    }
    players.forEach(player => {
      player.hand.forEach(card => {
        if (card.suit === '♣' && card.value === 2) {
          this.setState({
            playerTurn: player.position,
            status: "Player " + player.position + "'s turn"
          })
        }
      })
    })
    players.forEach(player => player.sortHand())
  }

  fetchGameState() {
    fetch(`/api/game/get/${this.state.gameCode}`)
      .then(response => response.json())
      .then(json => this.parseResponseAndUpdateState(json))
  }

  parseResponseAndUpdateState(json) {
    this.setState(this.parseGameStateResponse(json))
  }

  parseGameStateResponse(json) {
    let response = JSON.parse(json)
    if (response.gameCode !== this.state.gameCode) {
      return
    }
    let newPlayers = response.players || []
    newPlayers = newPlayers.map(player => {
      let newPlayer = new Player(player.position, player.name)
      newPlayer.hand = this.parseCards(player.hand)
      newPlayer.tricksWon = this.parseCards(player.tricksWon)
      newPlayer.points = player.points
      return newPlayer
    })
    let newTrick = {}
    for (var i = 1; i <= this.numOfPlayers; i++) {
      let card = response.trick[i]
      if (card) {
        newTrick[i] = new Card(response.trick[i].suit, response.trick[i].value)
      }
    }

    return {
      players: newPlayers,
      trick: newTrick,
      trickSuit: response.trickSuit,
      playerTurn: response.playerTurn,
      status: response.status
    }
  }

  parseCards(cards) {
    cards = cards || []
    return cards.map(card => {
      return new Card(card.suit, card.value)
    })
  }

  sendGameUpdate() {
    this.state.ws.send(JSON.stringify(this.state))
  }

  dealNextHand() {
    const players = this.state.players.slice()
    const deck = new Deck()

    deck.shuffle()
    while (deck.cards.length > 0) {
      players.forEach(player => player.deal(deck.cards.pop()))
    }

    players.forEach(player => player.sortHand())

    let playerTurn, status
    players.forEach(player => {
      player.hand.forEach(card => {
        if (card.suit === '♣' && card.value === 2) {
          playerTurn = player.position
          status = "Player " + player.position + "'s turn"
        }
      })
    })
    this.setState({ players, playerTurn, status }, () => {
      this.sendGameUpdate()
    })
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
      this.sendGameUpdate()
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
      }, () => {
        this.sendGameUpdate()
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
      }, () => {
        this.sendGameUpdate()
      })
    }, 2000)
  }

  countPoints(cards) {
    let points = 0
    cards.forEach(card => {
      if (card.suit === '♥') {
        points++
      } else if (card.name === 'Q of ♠') {
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
          name={player.name}
          hand={player.hand}
          tricksWon={player.tricksWon.length / 4}
          onCardClick={this.handleDiscard} />
      )
    })

    const scores = this.state.players.map(player => {
      return (
        <Score
          key={player.position}
          position={player.position}
          name={player.name}
          points={player.points}
          tricksWon={player.tricksWon.length / 4}
        />
      )
    })

    let trickCards = Object.values(this.state.trick);

    let dealButtonClass = this.state.status !== 'End of hand!' ? 'hidden' : '';

    return (
      <div>
        <div className='row-container'>
          <div className='game-code'>
            <h1>Hearts<span className='red'>♥</span>Chat</h1>
            <h2>Game code: {this.state.gameCode}</h2>
          </div>
        </div>
        <div className='row-container'>
          <div className='status'>
            <div className='status-description'>
              {this.state.status}
              <div>
                <button
                  type='button'
                  className={dealButtonClass}
                  onClick={this.dealNextHand}
                >Deal</button>
              </div>
            </div>
          </div>
          <div className='trick-container'>
            <div className='trick'>
              <h2>Trick:</h2>
              <Hand cards={trickCards} />
            </div>
          </div>
          <div className='score'>
            <table>
              <tbody>
                <tr>
                  <th>Player</th>
                  <th className='right-align'>Tricks Won</th>
                  <th className='right-align'>Score</th>
                </tr>
                {scores}
              </tbody>
            </table>
          </div>
        </div>
        <div className='row-container'>

        </div>
        {playerViews}
      </div>
    )
  }
}

export default Game