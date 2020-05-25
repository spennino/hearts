import React from 'react'
import './App.css'
import Game from './components/game'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameCode: null,
      isFetching: false
    }
    this.createGame = this.createGame.bind(this)
  }

  createGame() {
    this.setState({
      isFetching: true
    })
    fetch('/api/game/create')
      .then(res => res.json())
      .then(gameCode => {
        this.setState({
          gameCode: gameCode,
          isFetching: false
        })
      })
  }

  render() {
    if (this.state.gameCode === null) {
      let buttonClass = this.state.isFetching ? 'hidden' : '';
      return (
        <div>
          <button
            type='button'
            className={buttonClass}
            onClick={this.createGame}
          >Create Game</button>
        </div>
      );
    } else {
      return (<Game gameCode={this.state.gameCode} />)
    }
  }
}

export default App
