import React, { useEffect } from 'react';
import {CircleProgress} from 'react-gradient-progress'


export default function Progress({state}) {

  return (
    <div>
    {state.room.session_number >= state.room.session_goal
    ? 
    <div>
      <CircleProgress percentage={100} strokeWidth={8} />
          <h5>Sessions Completed: {state.sessionComplete ? state.room.session_number + 1 : state.room.session_number}</h5>
    </div>
    :
    <div>
        <div>
        { state.sessionComplete ?
        <div>
          <CircleProgress percentage={Math.floor((state.room.session_number + 1) / state.room.session_goal * 100)} strokeWidth={8} />
          <h5>Sessions Completed: {state.room.session_number + 1}</h5>
        </div>
        :
        <div>
          <CircleProgress percentage={Math.floor(state.room.session_number / state.room.session_goal * 100)} strokeWidth={8} />
          <h5>Sessions Completed: {state.room.session_number}</h5>
        </div>
        }
      </div>
    </div>
    }
    </div>
  )
}