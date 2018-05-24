import {
    Platform,
    StyleSheet,
    Text,
    View,
    TextInput
} from 'react-native';
import React from 'react'
import {Form} from './'
import {Element} from "./index";

class ReactElement extends React.Component {
    state = {
        errors: []
    }

    constructor(props) {
        super(props)
    }
}

export class FormText extends ReactElement {
    render() {
        console.log(this.props)

        return React.createElement(TextInput, this.props, null);
    }
}

export class ReactForm extends React.Component {
    constructor(props) {
        super(props)
        this.form = props.form
        
        this.children = []

        for(let i = 0; i < this.form.elements.length; i++) {
            let elm = this.form.elements[i]

            switch (elm.constructor.name) {
                case 'Element' :
                    let props = elm.props
                    props.key = i
                    this.children.push(React.createElement(
                        FormText,
                        props,
                        []
                    ))

                    break
                default:
                    console.log("Cant find: " + elm.constructor.name)
            }
        }

        console.log(this.children)
    }

    getValue() {
        return this.form.getValue()
    }

    render() {
        let style = {}

        if(this.props.style) {
            style = this.props.style
        }

        return (
            <View style={style}>
                {this.children}
            </View>
        )
    }
}