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

let room = socket.channel("rooms:lobby", {})

let UserStore = {
  users: {},

  populate(users){
    this.users = users
  },

  addUser({key, meta, ref}){
    if(!this.users[key]){ this.users[key] = [] }
    this.users[key].push({meta, ref})
  },

  deleteUser({key, meta, ref}){ if(!this.users[key]){ return }
    let presences = this.users[key].filter(p => p.ref !== ref)
    if(presences.length === 0){
      delete this.users[key]
    } else {
      this.users[key] = presences
    }
  },

  list(keyName = "id"){
    return this.mapKV(this.users, (key, presences) => {
      let pres = presences[0].meta
      pres.count = presences.length
      pres[keyName] = key
      return pres
    })
  },

  mapKV(obj, func){
    return Object.getOwnPropertyNames(obj).map(key => func(key, obj[key]))
  }
}

let Chat = React.createClass({
  getInitialState(){
    return {users: []}
  },

  componentDidMount(){
    room.on("users_list", ({users}) => {
      console.log("users_list", users)
      UserStore.populate(users)
      this.setState({users: UserStore.list()})
    })
    room.on("presence_join", user => {
      console.log("join", user)
      UserStore.addUser(user)
      this.setState({users: UserStore.list()})
    })
    room.on("presence_leave", user => {
      console.log("leave", user)
      UserStore.deleteUser(user)
      this.setState({users: UserStore.list()})
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