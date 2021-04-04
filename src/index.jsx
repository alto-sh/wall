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
        <div className={`window ${styles.main}`}>
            <div className="title-bar">
                <div className="title-bar-text">
                    wall - Microsovt Internet Explorer
                </div>
                <div className="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close"></button>
                </div>
            </div>
            <div className={`window-body ${styles.body}`}>
                <SearchBar onSearch={ goTo } />
                <PageContent url={ url } />
            </div>
        </div>
    );
};

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
