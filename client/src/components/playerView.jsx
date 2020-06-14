import React from 'react'
import PropTypes from 'prop-types'
import Hand from './hand.jsx'

function PlayerView(props) {
  return (
    <div className='player'>
      <h3>Player {props.position}</h3>
      Tricks Won: {props.tricksWon}
      <Hand
        cards={props.hand}
        onCardClick={(card) => props.onCardClick(card, props.position)}
      />
    </div>
  )
}

PlayerView.propTypes = {
  position: PropTypes.number,
  hand: PropTypes.array,
  tricksWon: PropTypes.number,
  onCardClick: PropTypes.func
}

export default PlayerView