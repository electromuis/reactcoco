import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Button,
    Image,
    TouchableOpacity
} from 'react-native';
import form from '../utilities/form'

if(Platform.OS === 'web') {

} else {
    form.form.Form.stylesheet.textbox.normal = {
        backgroundColor: 'white'
    }
// form.form.Form.stylesheet.textbox.normal.backgroundColor = 'white';
// form.form.Form.stylesheet.textbox.normal.margin = 0;
// form.form.Form.stylesheet.textbox.normal.padding = 0;
// console.log(form.form.Form.stylesheet.textbox.normal);
}


const FormSchema = form.struct({
    username: form.String,
    password: form.String
})

const FormOptions = {
    auto: 'placeholders'
}

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


export default class TopLevelComponent extends Component {
    onPress = () => {
        console.log(this._form.getValue())
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image source={require('../res/logo.png')} style={styles.logo} />
                </View>
                <View style={styles.formContainer}>
                    <form.form.Form ref={c => this._form = c} options={FormOptions} type={FormSchema} />
                </View>

                <MyButton onPress={this.onPress} title={"Sign in"} />
                <MyButton onPress={this.onPress} title={"Register"} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'stretch',
        padding: 20,
        backgroundColor: 'red',
        flex: 1
    },

    formContainer: {
        margin: 0,
        padding: 0,
        paddingBottom: -4,

        backgroundColor: 'lightgrey',
        // marginBottom: 5
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
