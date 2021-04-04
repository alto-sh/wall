import * as React from 'react';
import * as ReactDOM from 'react-dom';

import '98.css';
import styles from './styles/searchbar.module.sass';

export const SearchBar = (props) => {
    const [ text, setText ] = React.useState('');

    return (
        <>
            {/*
            <div className={ styles.tabs }>
                <div className={ styles.active }>
                    <span>wall</span>
                </div>
                <div>
                    <span>wall</span>
                </div>
                <b></b>
                <b></b>
                <b></b>
                <b></b>
            </div>
            */}
            <div className={ styles.searchbar }>
                <input type="text" onChange={ (e) => setText(e.target.value) } onKeyDown={ (e) => {
                    if (e.key == 'Enter') {
                        props.onSearch(text);
                        setText('');
                    }
                } } value={ text } />
                <button onClick={ () => props.onSearch(text) }>Go</button>
            </div>
        </>
    );
};
