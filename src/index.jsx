import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SearchBar } from './searchbar.jsx';
import { PageContent } from './pagecontent.jsx';
import { SERVER, URL } from './config.js';

import styles from './styles/index.module.sass';

const App = (props) => {
    const [ url, setURL ] = React.useState('');

    const goTo = (url) => {
        if (url.match(URL)) {
            fetch(`${SERVER}/history/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url
                })
            });
        }
        setURL(url);
    };

    return (
        <div className={ styles.main }>
            <SearchBar onSearch={ goTo } />
            <PageContent url={ url } />
        </div>
    );
};

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
