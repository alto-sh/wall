const express = require('express');

const app = express();

app.use(express.static(__dirname + '/dist'));

app.listen(parseInt(process.env['PORT']), () => {
    console.log('Server up');
});
