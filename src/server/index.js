const http = require('http');

const HTMLResponse = `<html lang="en">
    <head>
        <style>
            body div #darth {
                color: #ffffff;
                background-color: #ff0000;
            }

            body div span {
                color: #ffffff;
                background-color: #0000ff;
            }
        </style>
    </head>
    <body>
        <div>
            <span id="darth">I am your father.</span>
            <br />
            <span>No. No. That's not true. That's impossible!</span>
        </div>
    </body>
</html>`;

// Reference: https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/
http.createServer((req, res) => {
    let body = [];
    req.on('error', (err) => console.log(err))
        .on('data', (chunk) => body.push(chunk))
        .on('end', () => {
            body = Buffer.concat(body).toString();
            console.log('body:', body);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(HTMLResponse);
        });
}).listen(8080);

console.log('Server started on port 8080...');
