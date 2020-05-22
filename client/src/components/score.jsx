import React from 'react'
import PropTypes from 'prop-types'

function Score(props) {
  return (
    <div>
      Player {props.position}: {props.points}
    </div>
  )
}

Score.propTypes = {
  position: PropTypes.number,
  points: PropTypes.number
}

export default Score