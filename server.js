const http = require('http');

// Reference: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
http.createServer((req, res) => {
    let body = [];
    req.on('error', (err) => console.log(err))
        .on('data', (chunk) => body.push(chunk))
        .on('end', () => {
            body = Buffer.concat(body).toString();
            console.log('body:', body);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(' Hello World\n');
        });
}).listen(8080);

console.log('Server started on port 8080...');
