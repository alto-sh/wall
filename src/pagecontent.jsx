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

    const canvasRef = React.useRef(null);
    
    React.useEffect(() => {

        if (props.url == '' || props.url.match(URL)) {
            setMessage(null);

            if (url) {
                socket.emit('sync-dataurl', { url, data: canvasRef.current.toDataURL() });
            }

            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }

            setURL(props.url);
            fetch(`${SERVER}/canvas/${encodeURIComponent(props.url)}`)
                .then(r => r.json())
                .then(({ data }) => {
                    setDataUrl(data);
                });
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
                                src={ url } 
                                className={ styles.frame } 
                                scrolling="no">
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
                                <button onClick={ () => setURL(null) }>Back to home</button>
                            </div>
                        </>
                        :
                        <div className={ styles.placeholder }>
                            { props.children }
                        </div>
            }
        </div>
    );
};
