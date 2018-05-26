import uuid from "react-native-uuid"

let storage = null
let rowTables = {}
let tableRows = []

export class Table {
    constructor(name, storage) {
        this.storage = storage
        let str = name.substring(0, name.length - 1);
        this.name = name
        this.rows = []
        this.triggers = {
            insert: [],
            update: [],
            delete: []
        }
    }

    get rowClass() {
        return tableRows[this.name]
    }

    addTrigger(callback, action) {
        if(!action) {
            action = ["insert", "update", "delete"]
        }

        if(Array.isArray(action)) {
            action.forEach((action) => {this.triggers[action].push(callback)})
        } else {
            if(this.triggers[action]) {
                this.triggers[action].push(callback)
            } else {
                console.log("Not valid trigger: " + action)
            }
        }
    }

    //Send message to triggers
    insert(row) {
        this.rows.push(row)
        this.triggers.insert.forEach((f) => f(row, "insert"))
    }

    //Send message to triggers
    update(row) {
        this.triggers.update.forEach((f) => f(row, "update"))
    }

    findBy(query) {
        let found = []

        this.rows.forEach((row) => {
            let match = true
            for(let key in query) {
                if(row.matchCol(key, query[key]) !== true) {
                    match = false
                    break
                }
            }

            if(match === true) {
                found.push(row)
            }
        })

        return found
    }

    findOneBy(query) {
        for(let i in this.rows) {
            let row = this.rows[i]

            let match = true

            for(let prop in query) {
                let val = query[prop]

                if(row.matchCol(prop, val) === false) {
                    match = false
                    break
                }
            }

            if(match === true) {
                return row
            }
        }

        return null
    }
}

export class Row {
    constructor(colls, data) {
        if(storage === null) {
            console.log("Storage not loaded yet")
            return;
        }
        this.storage = storage
        this.colls = colls

        for(let key in data) {
            if(this.colls.indexOf(key) > -1) {
                let val = data[key]
                this[key] = val
            }
        }
    }

    get table() {
        let c = this.constructor.name
        return storage[rowTables[c]]
    }

    setFromArray(data) {
        for (let key in data) {
            this[key] = data[key]
        }
    }

    save() {
        if(this.id) {
            this.table.update(this)
        } else {
            this.id = uuid.v4()
            this.table.insert(this)
        }

        return this
    }

    matchCol(name, value) {
        if(!this[name]) {
            return false
        }

        // if(Array.isArray(this[name])) {
        //     return this[name].indexOf(value) > -1
        // }
        //
        // if(Array.isArray(value)) {
        //     return value.indexOf(this[name]) > -1
        // }

        return this[name] == value
    }

    getData() {
        let ret = {}

        this.colls.forEach((col) => {
            ret[col] = this[col]
        })

        return ret;
    }
}

export class Reaction extends Row {
    constructor(data) {
        super(
            [
                "id",
                "creatorId",
                "alertId"
            ],
            data
        )
    }

    creator() {
        return this.storage.users.findOneBy({id: this.creatorId})
    }

    alert() {
        return this.storage.alerts.findOneBy({id: this.alertId})
    }
}

export class Alert extends Row {
    constructor(data) {
        super(
            [
                "id",
                "creatorId",
                "roomId"
            ],
            data
        )
    }

    creator() {
        return this.storage.users.findOneBy({id: this.creatorId})
    }

    room() {
        return this.storage.rooms.findBy({id: this.roomId})
    }
}

export class Room extends Row {
    constructor(data) {
        super(
            [
                "id",
                "name",
                "creatorId"
            ],
            data
        )
    }

    users() {
        return this.storage.roomsUsers.findBy({roomId: this.id}).map(ru => {return ru.user()})
    }

    userRows() {
        return this.storage.roomsUsers.findBy({roomId: this.id})
    }

    creator() {
        return this.storage.users.findOneBy({id: this.creatorId})
    }

    alerts() {
        return this.storage.alerts.findBy({roomId: this.id})
    }
}

export class User extends Row {
    constructor(data) {
        super(
            [
                "id",
                "username",
                "password"
            ],
            data
        )
    }

    rooms() {
        return this.storage.roomsUsers.findBy({userId: this.id}).map((ru) => {return ru.room()})
    }
}

export class RoomUser extends Row {
    constructor(data) {
        super(
            [
                "roomId",
                "userId"
            ],
            data
        );
    }

    user() {
        return this.storage.users.findOneBy({userId: this.userId})
    }

    room() {
        return this.storage.rooms.findOneBy({roomId: this.roomId})
    }
}

export class Message extends Row {
    constructor(data, connection) {
        if(!data.status) {
            data.status = "PENDING"
        }

        super(
            [
                "id",
                "status",
                "type",
                "data"
            ],
            data
        )

        this.callbacks = []
        this.connection = connection
    }

    setStatus(status) {
        this.status = status
        this.save()

        if(this.callbacks) {
            this.callbacks.forEach((c) => c(this))
        }
    }

    onSuccess(callback) {
        if(this.status === "ACKED") {
            callback()
        } else {
            this.callbacks.push((row) => {
                if(row.status === "ACKED") {
                    callback()
                }
            })
        }

        return this
    }

    onFailed(callback) {
        if(this.status === "FAILED") {
            callback()
        } else {
            this.callbacks.push((row) => {
                if(row.status === "FAILED") {
                    callback()
                }
            })
        }

        return this
    }
}

const structure = [
    [Room, 'Room', 'rooms'],
    [User, 'User', 'users'],
    [RoomUser, 'RoomUser', 'roomsUsers'],
    [Alert, 'Alert', 'alerts'],
    [Reaction, 'Reactions', 'reactions'],
    [Message, 'Message', 'messages']
]

let rowClasses = {}

structure.forEach(r => {
    rowClasses[r[1]] = r[0]
    tableRows[r[2]] = r[1]
})

export class DynamicClass {
    constructor (className, opts) {
        if(!rowClasses[className]) {
            console.log("Class: " + className + " not registered")
        }

        return new rowClasses[className](opts);
    }
}

export class Storage {
    constructor() {
        this.tables = {}

        structure.forEach(r => {
            this.tables[r[2]] = new Table(r[2], this)
            this[r[2]] = this.tables[r[2]]

            rowTables[r[1]] = r[2]
        })

        storage = this
    }

    //Save socket storage message to local
    hanldeSocketMessage(message) {
        if(message.type !== "storage") {
            return false
        }

        console.log("Storage message:")
        console.log(message)

        let data = message.data
        let rowData = data.row
        let table = this.tables[data.table]

        if(data.command === "insert") {
            let row = table.findOneBy(rowData.id)
            if(!row) {
                row = new DynamicClass(table.rowClass, rowData)
                table.insert(row)
            }

            return true
        } else if(data.command === "update") {
            let row = table.findOneBy(rowData.id)
            row.setFromArray(rowData)
            row.save()

            return true
        } else {
            return false
        }
    }
}
