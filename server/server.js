import Connection from 'coco-lib/connection'
import {Server as WebSocketServer} from "ws";
import uuid from "node-uuid";
import Storage from "./components/storage"

class Server extends Connection {
    constructor(storage, server) {
        super(storage);
        let self = this
        this.clients = []

        Storage.User.prototype.sendMessage = function (type, packet) {
            let self = this
            this.clients.forEach((client) => {
                if(client.user === self) {
                    let message = self.sendPacket(type, packet, client)
                }
            })
        }

        this.server = server
    }

    handleMessage(type, data, client) {
        let user = null

        switch (type) {
            case "DISCONNECT":
                this.disconnect(client)
                return true
            case "REGISTER":
                if(!data.username || !data.password) {
                    return false
                }

                if(this.storage.users.findOneBy({username: data.username}) !== null) {
                    return false
                }

                user = new Storage.User({
                    username: data.username,
                    password: data.password
                })
                user.save()

                console.log("Registered")

                console.log(this.storage.users.rows)
                return true
            case "LOGIN":
                if(!data.username || !data.password) {
                    return false
                }

                user = this.storage.users.findOneBy({username: data.username})

                if(user === null) {
                    return false
                }

                if(user.password !== data.password) {
                    return false
                }

                return this.connectUser(client, user)

        }
        return false
    }

    storageTrigger(row, cmd) {
        console.log("Storage message: " + cmd)

        switch (row.table.name) {
            case "rooms":
                this.clients.forEach((c) => {

                    let data = {
                        table: row.table.name,
                        row: row.getData(),
                        command: cmd
                    }

                    this.sendPacket(
                        "storage",
                        data,
                        c.user
                    )
                })
                break;
        }
    }

    init() {
        for(let n in this.storage.tables) {
            if(n == "messages" || n == "users") {
                continue;
            }
            let table = this.storage.tables[n]
            table.addTrigger((r, c) => {this.storageTrigger(r, c)})
        }

        let self = this

        this.wss = new WebSocketServer({'server': this.server})
        this.wss.on('connection', ws => self.connect(ws))
    }

    connectUser(client, user) {
        if (client.user) {
            return false
        }

        client.user = user

        this.sendPacket('UPDATE_USER', {user: user.getData()}, client)
        console.log(user.rooms())
        user.rooms().forEach(room => {
            console.log(room)
            this.sendPacket(
                "storage",
                {
                    command: "insert",
                    table: room.table.name,
                    row: room.getData()
                }
            )

            room.userRows().forEach(r => {
                this.sendPacket(
                    "storage",
                    {
                        command: "insert",
                        table: r.table.name,
                        row: r.getData()
                    }
                )
            })
        })

        return true
    }

    disconnect(client) {
        if(this.clients.indexOf(client) > -1) {
            this.clients.splice(this.clients.indexOf(client, 1))
        }
    }

    connect(client) {
        client.on('message', (m) => {
            m = JSON.parse(m);
            this.onSocketData(m, client);
        })

        // user.save()
        //
        // // todo Rewrite this
        // this.sendPacket('UPDATE_USER', {user: user.getData()}, user)

        this.clients.push(client)
    }

    send(data, client) {
        try {
            client.send(JSON.stringify(data))
        } catch (e) {
            console.log("Error sending: " + e)
        }
    }
}

export default Server