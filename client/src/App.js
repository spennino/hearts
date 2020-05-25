import React from 'react'
import './App.css'
import Game from './components/game'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameCode: null,
      inputGameCode: '',
      isFetching: false
    }
    this.createGame = this.createGame.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
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
      .catch(console.log)
  }

  handleChange(event) {
    this.setState({ inputGameCode: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    fetch(`/api/game/get/${this.state.inputGameCode}`)
      .then(response => {
        switch (response.status) {
          case 200:
            this.setState({ gameCode: this.state.inputGameCode })
            break
          case 404:
            alert('Game Code not found, please try another')
            break
          default:
            alert('There was an error, please try again')
        }
      })
      .catch(console.log)
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
          <form onSubmit={this.handleSubmit}>
            <label>
              Game Code:
              <input
                type="text"
                value={this.state.inputGameCode}
                onChange={this.handleChange}
                name="code" />
            </label>
            <input type="submit" value="Join" />
          </form>
        </div>
      );
    } else {
      return (<Game gameCode={this.state.gameCode} />)
    }
  }
}

export default App
