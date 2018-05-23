import React, {Component} from 'react';
import TopLevelComponent from "../components/TopLevelComponent";
import {AppContext} from '../utilities/context'


export default class EntryScreen extends Component {
    render() {
        return (
            <AppContext.Consumer>
                {connection => (
                    <TopLevelComponent connection={connection}/>
                )}
            </AppContext.Consumer>
        );
    }
}