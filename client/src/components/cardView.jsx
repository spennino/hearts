import React from 'react'
import PropTypes from 'prop-types'

class CardView extends React.Component {
  render() {
    return (
      <div
        className='card-container'
        onClick={() => this.props.onCardClick(this.props.card)}>
        <div className={'left-align ' + this.props.card.color}>{this.props.card.suit}</div>
        <div className={'center-align ' + this.props.card.color}>{this.props.card.value}</div>
        <div className={'right-align ' + this.props.card.color}>{this.props.card.suit}</div>
      </div>
    )
  }
}

CardView.propTypes = {
  card: PropTypes.object,
  onCardClick: PropTypes.func
}

export default CardView