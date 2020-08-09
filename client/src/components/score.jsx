import React from 'react'
import PropTypes from 'prop-types'

function Score(props) {
  return (
    <tr>
      <td>{props.name}</td>
      <td className='right-align'>{props.tricksWon}</td>
      <td className='right-align'>{props.points}</td>
    </tr>
  )
}

Score.propTypes = {
  position: PropTypes.number,
  name: PropTypes.string,
  points: PropTypes.number,
  tricksWon: PropTypes.number,
}

export default Score