import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity
} from 'react-native';
import {
    Form,
    Element,
    RequiredRule
} from '../../../cocolib/form'
import {ReactForm} from '../utilities/form/react'
import AppContext from '../utilities/context'

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'white',
        margin: 5,
        height: 50,
        padding: 10,
        fontSize: 20
    },

    inputError: {
        backgroundColor: 'white',
        margin: 5,
        height: 50,
        padding: 10,
        fontSize: 20,

        borderWidth: 1,
        borderColor: 'red'
    },

    container: {
        alignSelf: 'stretch',
        padding: 20,
        backgroundColor: 'red',
        flex: 1
    },

    form: {
        margin: 0,
        padding: 10,

        backgroundColor: 'lightgrey',
        marginBottom: 10
    },

    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },

    logo: {
        width: 100,
        height: 100
    }
});


class MyButton extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        const buttonStyle = {
            backgroundColor: 'darkred',
            padding: 10,
            marginBottom: 10,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
        }

        const textStyle = {
            color: 'white',
            fontSize: 20
        }

        return (
            <TouchableOpacity onPress={this.props.onPress} style={buttonStyle} activeOpacity={0.8}>
                <Text style={textStyle}>{this.props.title}</Text>
            </TouchableOpacity>
        )
    }
}

const form = new Form([
    new Element(
        "username",
        {
            style: styles.input,
            errorStyle: styles.inputError,
            placeholder: "Username"
        },
        [new RequiredRule('')]
    ),
    new Element(
        "password",
        {
            style: styles.input,
            errorStyle: styles.inputError,
            secureTextEntry: true,
            placeholder: "******"
        },
        [new RequiredRule('')]
    )
])

export default class EntryScreen extends Component {
    onPress = () => {
        const res = this.refs.form.getValue()
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image source={require('../res/logo.png')} style={styles.logo} />
                </View>

                <ReactForm ref={'form'} style={styles.form} form={form}/>


                <MyButton onPress={this.onPress} title={"Sign in"} />
                <MyButton onPress={this.onPress} title={"Register"} />
            </View>
        );
    }
}
