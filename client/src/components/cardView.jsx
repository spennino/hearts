import React from 'react'
import PropTypes from 'prop-types'

class CardView extends React.Component {
  render() {
    return (
      <li
        onClick={() => this.props.onCardClick(this.props.card)}>
        {this.props.card.name}
      </li>
    )
  }
}

CardView.propTypes = {
  card: PropTypes.object,
  onCardClick: PropTypes.func
}

export default CardView