import React from 'react';
import EntryScreen from './src/screens/EntryScreen';
import Routing, {Router} from './src/utilities/routing/index';
import AppContext from './src/utilities/context'

const Route = Routing.Route;


class App extends React.Component {
    render() {
        return (
            <Router>
                <Route path='/' component={EntryScreen}/>
            </Router>
        );
    }
}

export default App;