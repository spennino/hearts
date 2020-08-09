import React from 'react'
import './App.css'
import Game from './components/game'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameCode: null,
      inputGameCode: '',
      playerName: '',
      submitButtonLabel: 'Create or Join Game',
      isFetching: false,
      gameStateResponse: null,
    }
    this.createGame = this.createGame.bind(this)
    this.handleGameCodeChange = this.handleGameCodeChange.bind(this)
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleGameCodeChange(event) {
    let inputGameCode = event.target.value
    let submitButtonLabel
    if (!inputGameCode || inputGameCode === '') {
      submitButtonLabel = 'Create Game'
    } else {
      submitButtonLabel = 'Join Game'
    }
    this.setState({ inputGameCode, submitButtonLabel })
  }

  handleNameChange(event) {
    this.setState({ playerName: event.target.value })
  }

  handleSubmit(event) {
    event.preventDefault();
    if (!this.state.inputGameCode || this.state.inputGameCode === '') {
      this.createGame()
    } else {
      this.fetchGame()
    }
  }

  createGame() {
    this.setState({ isFetching: true })
    fetch('/api/game/create')
      .then(res => res.json())
      .then(gameCode => {
        this.setState({
          gameCode: gameCode,
          isFetching: false
        })
      })
      .catch(console.log)
  }

  fetchGame() {
    this.setState({ isFetching: true })
    fetch(`/api/game/get/${this.state.inputGameCode}`)
      .then(response => {
        switch (response.status) {
          case 200:
            response.json().then(json => {
              this.setState({
                gameCode: this.state.inputGameCode,
                gameStateResponse: json
              })
            })
            break
          case 404:
            alert('Game Code not found, please try another')
            break
          default:
            alert('There was an error, please try again')
        }
        this.setState({ isFetching: false })
      })
      .catch(console.log)
  }

  render() {
    if (this.state.gameCode === null) {
      let buttonClass = this.state.isFetching ? 'btn hidden' : 'btn';
      let createEnabled = !this.state.inputGameCode || this.state.inputGameCode === ''
      return (
        <div className='home-page'>
          <h1>Hearts<span className='red'>♥</span>Chat</h1>
          <div className='home-page-input'>
            <input
              className='input'
              type="text"
              value={this.state.playerName}
              onChange={this.handleNameChange}
              placeholder="Your Name (required)"
              name="code" />
            <input
              className='input'
              type="text"
              value={this.state.inputGameCode}
              onChange={this.handleGameCodeChange}
              placeholder="Game Code (if joining)"
              name="code" />
            <div className='row-container create-join-buttons'>
              <button
                type='button'
                className={buttonClass}
                onClick={this.handleSubmit}
                disabled={!createEnabled}
              >Create Game</button>
              <button
                type='button'
                className={buttonClass}
                onClick={this.handleSubmit}
                disabled={createEnabled}
              >Join Game</button>
            </div>
          </div>
        </div >
      );
    } else {
      return (
        <Game
          gameCode={this.state.gameCode}
          playerName={this.state.playerName}
          gameStateResponse={this.state.gameStateResponse}
        />
      )
    }
  }
}

export default App
