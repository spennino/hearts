import React from 'react'
import PropTypes from 'prop-types'
import CardView from './cardView.jsx'

function Hand(props) {
  const cards = props.cards.map(card => {
    return (
      <CardView
        key={card.name + props.isDiscard}
        card={card}
        onCardClick={props.onCardClick}
      />)
  })
  return <ul>{cards}</ul>
}

Hand.propTypes = {
  cards: PropTypes.array,
  onCardClick: PropTypes.func,
  isDiscard: PropTypes.bool
}

export default Hand