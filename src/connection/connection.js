import {Message} from "../utilities/storage";

class Connection {
    constructor (storage) {
        this.storage = storage
    }

    sendPacket(type, data, client) {
        let message = new Message({
            data: data,
            type: type
        })
        message.save()

        let msg = message.getData()
        console.log("Sending: " + type)
        console.log(data)
        this.send(msg, client)

        message.setStatus("SENT")

        return message
    }

    handleMessage(type, data) {
        return false
    }

    onSocketData(decoded, client) {
        console.log("Received: ")
        console.log(decoded)

        let result = this.handleSocketData(decoded, client)
        console.log("Result: " + result)

        if(result === true && decoded.id) {
            let pack = {replyId: decoded.id, type: "ACK"}
            this.send(pack, client)

            // console.log("Acking: ")
            // console.log(pack)
        }
    }

    handleSocketData(packet, client) {
        if(packet.type === "ACK") {
            let row = this.storage.tables.messages.findOneBy({id: packet.replyId})
            if (row) {
                row.setStatus("ACKED")
                return true
            } else {
                //todo Unknown message
                console.log("Got: ACK for " + packet.replyId)
                console.log(this.storage.messages)
                return false
            }
        }

        if(this.storage.hanldeSocketMessage(packet)) {
            return true
        }

        if(this.handleMessage(packet.type, packet.data, client)) {
            return true
        }

        return false
    }

    send(msg, user) {
        throw "No"
    }
}

export default Connection