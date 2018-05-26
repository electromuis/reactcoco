import {
    View,
    TextInput,
    ActivityIndicator
} from 'react-native';
import React from 'react'

export class FormText extends React.Component {
    render() {
        let self = this

        let props = Object.assign({style: {}}, this.props)

        if(props.errorStyle) {
            delete props.errorStyle
        }

        if(this.props.elm.errors.length > 0 && this.props.errorStyle) {
            props.style = this.props.errorStyle
        }

        props.onChangeText = (text) => {
            self.props.elm.setValue(text)
        }

        return React.createElement(TextInput, props, null);
    }
}

export class ReactElement extends React.Component {
    constructor(props) {
        super(props)
        this.elm = props.elm
    }

    render() {
        switch (this.elm.constructor.name) {
            case 'Element' :
                let props = Object.assign({}, this.elm.props)
                props.elm = this.elm
                props.underlineColorAndroid = 'rgba(0,0,0,0)'

                return React.createElement(
                    FormText,
                    props,
                    null
                )
            default:
                console.log("Cant find: " + this.elm.constructor.name)
        }
    }
}

export class ReactForm extends React.Component {
    constructor(props) {
        super(props)
        this.form = props.form

        this.state = {
            elements: this.form.elements
        }
    }

    getValue() {
        const val = this.form.getValue()
        this.setState({elements: this.form.elements})
        this.forceUpdate()
        this.render()
        return val
    }

    render() {
        let style = {}

        if(this.props.style) {
            style = this.props.style
        }

        let content = (this.state.elements.map((elm, i) => {
            return (<ReactElement key={i} elm={elm} />)
        }))

        if(this.props.loading && this.props.loading === true) {
            content = (<ActivityIndicator size="large" color="red" />)
        }

        return (
            <View style={style}>
                {content}
            </View>
        )
    }
}