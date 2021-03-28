import * as React from 'react';
import * as ReactDOM from 'react-dom';

import socketIo from 'socket.io-client';
import { SERVER, URL } from './config.js';

import styles from './styles/pagecontent.module.sass';

const socket = socketIo(SERVER);
const id = Math.random().toString().split('.')[1];

export const PageContent = (props) => {
    const [ url, setURL ] = React.useState(null);
    const [ content, setContent ] = React.useState('');
    const [ mouse, setMouse ] = React.useState(false);
    const [ x, setX ] = React.useState(0);
    const [ y, setY ] = React.useState(0);
    const [ ctx, setCtx ] = React.useState(null);
    const [ timer, setTimer ] = React.useState(null);
    const [ dataUrl, setDataUrl ] = React.useState(null);
    const [ tool, setTool ] = React.useState('spraycan');
    const [ message, setMessage ] = React.useState(null);
    const [ history, setHistory ] = React.useState([]);

    const canvasRef = React.useRef(null);

    const loadHistory = () => {
        fetch(`${SERVER}/history`)
            .then(r => r.json())
            .then(json => {
                setHistory(json.data);
            });
    }

    React.useEffect(loadHistory, []);

    const loadURL = (load) => {
        if (url) {
            socket.emit('sync-dataurl', { url, data: canvasRef.current.toDataURL() });
        }

        if (ctx && canvasRef.current) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        setURL(load);

        fetch(`${SERVER}/fetch/${encodeURIComponent(load)}`)
            .then(r => r.text())
            .then(data => {
                setContent(data);
            });

        fetch(`${SERVER}/canvas/${encodeURIComponent(load)}`)
            .then(r => r.json())
            .then(({ data }) => {
                setDataUrl(data);
            });
    };
    
    React.useEffect(() => {
        if (props.url == '' || props.url.match(URL)) {
            setMessage(null);
            loadURL(props.url);
        } else {
            setMessage('Invalid URL.');
            return;
        }
    }, [ props.url ]);

    React.useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = canvasRef.current.offsetWidth;
            canvasRef.current.height = canvasRef.current.offsetHeight;

            const ctx = canvasRef.current.getContext('2d');
            setCtx(ctx);
        }
    }, [ canvasRef.current ]);

    if (ctx && dataUrl) { 
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const image = new Image();
        image.src = dataUrl;
        image.onload = () => {
            ctx.drawImage(image, 0, 0);
        };
        setDataUrl(null);
    }

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return [ e.clientX - rect.left, e.clientY - rect.top ];
    };

    const drawLine = (x1, y1, x2, y2, use) => {
        if (ctx) {
            ctx.lineWidth = 20;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (use == 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();

                ctx.arc(x1, y1, 10, 0, 2 * Math.PI);
        
                ctx.fill();
                ctx.closePath();
            } else if (use == 'spraycan') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = '#ff0000';

                ctx.beginPath();

                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);

                ctx.stroke();
                ctx.closePath();
            }
        }
    };

    socket.on('draw-line', ({ x1, y1, x2, y2, use, ...data }) => {
        if (data.url == url && data.id != id) {
            drawLine(x1, y1, x2, y2, use);
        }
    });

    const handleMouseDown = (e) => {
        const [ x2, y2 ] = getPos(e);
        setX(x2);
        setY(y2);

        setMouse(true); 
    };
    
    const handleMouseMove = (e) => {
        const [ x2, y2 ] = getPos(e);

        if (mouse) {
            drawLine(x, y, x2, y2, tool);
            socket.emit('draw-line', { x1: x, y1: y, x2, y2, url, id, use: tool });
            socket.emit('sync-dataurl', { url, data: canvasRef.current.toDataURL() });
        }

        setX(x2);
        setY(y2);
    };

    const goTo = (to) => {
        if (to.match(URL)) {
            fetch(`${SERVER}/history/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: to
                })
            });
            console.log(to);
            setURL(to);
            loadURL(to);
        }
    };

    return (
        <div className={ styles.container }>
            {
                message
                    ?
                    <div className={ styles.placeholder }>
                        <span className={ styles.err }>{ message }</span>
                    </div>
                    :
                    url
                        ?
                        <>
                            <iframe 
                                className={ styles.frame } 
                                srcDoc={ content }
                                sandbox="allow-same-origin">
                            </iframe>
                            <canvas 
                                ref={ canvasRef } 
                                className={ styles.canvas } 
                                onMouseDown={ handleMouseDown }
                                onMouseUp={ (e) => {
                                    clearTimeout(timer);
                                    setMouse(false);
                                } } 
                                onMouseMove={ handleMouseMove }>
                            </canvas>
                            <div className={ styles.tools }>
                                <button onClick={ () => setTool('spraycan') }>Spray can</button>
                                <button onClick={ () => setTool('eraser') }>Eraser</button>
                                <button onClick={ () => {
                                    setURL(null);
                                    loadHistory();
                                } }>Back to home</button>
                            </div>
                        </>
                        :
                        <div className={ styles.placeholder }>
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
                        </div>
            }
        </div>
    );
};
