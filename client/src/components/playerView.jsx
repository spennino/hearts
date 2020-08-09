import React from 'react'
import PropTypes from 'prop-types'
import Hand from './hand.jsx'

function PlayerView(props) {
  return (
    <div className='row-container-column'>
      <h3>{props.name}'s hand</h3>
      <Hand
        cards={props.hand}
        onCardClick={(card) => props.onCardClick(card, props.position)}
      />
    </div>
  )
}

PlayerView.propTypes = {
  position: PropTypes.number,
  name: PropTypes.string,
  hand: PropTypes.array,
  tricksWon: PropTypes.number,
  onCardClick: PropTypes.func
}

export default PlayerView