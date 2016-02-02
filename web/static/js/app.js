// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"
import socket from "./socket"
import {Presence} from "phoenix"
import React from "react"
import ReactDOM from "react-dom"


let room = socket.channel("rooms:lobby", {})
room.presences = {}

let listBy = (id, {metas: [first, ...rest]}) => {
  first.count = rest.length + 1
  first.id = id
  return first
}

let onJoin = (id, current, newPres) => {
  if(!current){
    console.log("user has entered for the first time", newPres)
  } else {
    console.log("user additional presence", newPres)
  }
}
let onLeave = (id, current, leftPres) => {
  if(current.metas.length === 0){
    console.log("user has left from all devices", leftPres)
  } else {
    console.log("user left from a device", leftPres)
  }
}

let Chat = React.createClass({
  getInitialState(){
    return {users: []}
  },

  componentDidMount(){
    room.on("presences", state => {
      console.log("presences", state)
      Presence.syncState(room.presences, state, onJoin, onLeave)
      this.setState({users: Presence.list(room.presences, listBy)})
    })
    room.on("presence_diff", diff => {
      console.log("users diff", diff)
      Presence.syncDiff(room.presences, diff, onJoin, onLeave)
      this.setState({users: Presence.list(room.presences, listBy)})
    })
    room.join()
      .receive("ok", resp => { console.log("Joined successfully", resp) })
      .receive("error", resp => { console.log("Unable to join", resp) })
  },

  render(){
    console.log("render", this.state.users)
    return(
      <div>
        <h2>Online Users</h2>
        <ul>
        {this.state.users.map(user => {
          return <li key={user.id}>{user.id} {user.online_at} {user.count}</li>
        })}
        </ul>
      </div>
    )
  }
})

ReactDOM.render(
  <Chat />,
  document.getElementById("container")
)