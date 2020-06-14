import React from 'react'
import PropTypes from 'prop-types'

function Score(props) {
  return (
    <tr>
      <td>Player {props.position}</td>
      <td class='right-align'>{props.tricksWon}</td>
      <td class='right-align'>{props.points}</td>
    </tr>
  )
}

Score.propTypes = {
  position: PropTypes.number,
  points: PropTypes.number,
  tricksWon: PropTypes.number,
}

export default Score