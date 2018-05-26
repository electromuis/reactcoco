import MyConnection from 'coco-lib/myconnection'
import Subscribable from 'subscribable'

import { DeviceEventEmitter } from 'react-native'


var ScrollResponderMixin = {
    mixins: [Subscribable.Mixin],

    componentWillMount: function () {

        this.addListenerOn(DeviceEventEmitter,
            'keyboardWillShow',
            this.scrollResponderKeyboardWillShow);

    },
    scrollResponderKeyboardWillShow: function (e: Event) {
        this.keyboardWillOpenTo = e;
        this.props.onKeyboardWillShow && this.props.onKeyboardWillShow(e);
    }
}



class Client {
    constructor(storage) {
        this.storage = storage
    }

    init() {
        this.socket = new WebSocket('ws://localhost:8080')
        this.socket.onerror = (e1, e2) => console.log(e1)
        this.socket.onopen = () => this.onSocketOpen()
        this.socket.onmessage = (m) => {
            m = JSON.parse(m.data)
            this.onSocketData(m, null)
        }

        DeviceEventEmitter.addListener('WS_OPEN', function(e: Event) {

        });

        DeviceEventEmitter.addListener('WS_MESSAGE', function(e: Event) {

        });
    }

    onSocketOpen() {
        console.log('Connection established!')
    }

    send(data, client) {
        //Client can only send to server, user=null
        this.socket.send(JSON.stringify(data))
    }

    handleMessage(type, data, client) {
        switch (type) {
            case "UPDATE_USER": {
                // this.app.updateUser(data.user)
                return true
            }
        }

        return false
    }
}

export default Client