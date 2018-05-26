

import http from 'http'
import Server from "./server"
import LocalStorage from "./localStorage"
import express from 'express'


let server = http.createServer()
let app = new express({server: server})

let storage = new LocalStorage("db.json")

let socketServer = new Server(storage, server)

storage.load(() => {

    storage.saveTriggers()
    socketServer.init()

})

server.on('request', app)
server.listen(8080, () => console.log('Listening on port 8080.'))
