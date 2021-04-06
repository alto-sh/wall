const express = require('express');

const app = express();

app.use(express.static(__dirname + '/dist'));

app.listen(parseInt(process.env['PORT'] || 9000), () => {
    console.log('Server up');
});
