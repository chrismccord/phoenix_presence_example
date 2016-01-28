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
import React from "react"
import ReactDOM from "react-dom"


class Presence {

  constructor(){
    this.users = {}
  }

  populate(users){
    this.users = users
  }

  // {123: {metas: [], post: {}jj}}
  add(presences){
    this.mapKV(presences, (key, presence) => {
      let currentPresence = this.users[key]
      this.users[key] = presence
      if(currentPresence){
        this.users[key].metas = currentPresence.metas.concat(presence.metas)
      }
    })
  }

  remove(presences){
    this.mapKV(presences, (key, presence) => {
      if(!this.users[key]){ return }
      let refsToRemove = presence.metas.map(m => m.phx_ref)
      let metas = this.users[key].metas.filter(p => refsToRemove.indexOf(p.phx_ref) < 0)

      if(metas.length === 0){
        delete this.users[key]
      } else {
        this.users[key].metas = metas
      }
    })
  }

  list(chooser){
    if(!chooser){ chooser = function(key, pres){ return pres } }

    return this.mapKV(this.users, (key, presence) => {
      return chooser(key, presence)
    })
  }

  // private

  mapKV(obj, func){
    return Object.getOwnPropertyNames(obj).map(key => func(key, obj[key]))
  }
}

let room = socket.channel("rooms:lobby", {})
room.presence = new Presence()

let listBy = (id, {metas: [first, ...rest]}) => {
  first.count = rest.length + 1
  first.id = id
  return first
}

let Chat = React.createClass({
  getInitialState(){
    return {users: []}
  },

  componentDidMount(){
    room.on("presences", users => {
      console.log("presences", users)
      room.presence.populate(users)
      this.setState({users: room.presence.list(listBy)})
    })
    room.on("presence_join", user => {
      console.log("user has joined", user)
      room.presence.add(user)
      this.setState({users: room.presence.list(listBy)})
    })
    room.on("presence_leave", user => {
      console.log("user has left", user)
      room.presence.remove(user)
      this.setState({users: room.presence.list(listBy)})
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