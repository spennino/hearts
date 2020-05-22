import React from 'react'
import PropTypes from 'prop-types'
import Hand from './hand.jsx'

function PlayerView(props) {
  return (
    <div>
      Player {props.position}
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
  onCardClick: PropTypes.func
}

export default PlayerView