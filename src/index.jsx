import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { SearchBar } from './searchbar.jsx';
import { PageContent } from './pagecontent.jsx';
import { SERVER, URL } from './config.js';

import styles from './styles/index.module.sass';

const App = (props) => {
    const [ url, setURL ] = React.useState('');
    const [ history, setHistory ] = React.useState([]);

    React.useEffect(() => {
        fetch(`${SERVER}/history`)
            .then(r => r.json())
            .then(json => {
                setHistory(json.data);
            });
    }, []);

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
        setURL(url) 
    };

    return (
        <div className={ styles.main }>
            <SearchBar onSearch={ goTo } />
            <PageContent url={ url }>
                <h1>wall</h1>
                <h2>graffiti the web</h2>
                <p>
                    the modern web has strict protections on websites,
                    their content, and who can modify them. this project
                    aims to reimagine that, by allowing users to graffiti
                    web pages and have their changes be reflected for anyone viewing
                    the page. other users can add their own graffiti, or they
                    can clean yours off. sound interesting? enter a url above and 
                    get started. don't want to do that? you can find a list of 
                    recently-graffitied pages below.
                </p>
                <p>
                    note that this site is still in beta, and there may be bugs.
                    for one thing: many sites won't be able to display here, because
                    of cors and whatnot. this should be fixed as soon as possible,
                    but in the meantime just find a site where it doesn't matter.
                </p>
                <h3>recently visited pages</h3>
                <ul>
                    {
                        history.map((item, index) => {
                            return (
                                <li key={ index }>
                                    <a onClick={ () => goTo(item) }>{ item }</a>
                                </li>
                            );
                        })
                    }
                </ul>
            </PageContent>
        </div>
    );
};

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
