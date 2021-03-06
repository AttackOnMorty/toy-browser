const net = require('net');
const ResponseParser = require('./ResponseParser');

class Request {
    constructor(options) {
        this.method = options.method || 'GET';
        this.host = options.host;
        this.post = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};

        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (this.headers['Content-Type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body);
        } else if (
            this.headers['Content-Type'] === 'application/x-www-form-urlencoded'
        ) {
            this.bodyText = Object.keys(this.body)
                .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
                .join('&');
        }

        this.headers['Content-Length'] = this.bodyText.length;
    }

    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser();

            if (connection) {
                connection.write(this.toString());
                return;
            }

            connection = net.createConnection(
                {
                    host: this.host,
                    port: this.post,
                },
                () => {
                    connection.write(this.toString());
                }
            );

            connection.on('data', (data) => {
                console.log(data.toString());
                parser.receive(data.toString());
                if (parser.isFinished) {
                    resolve(parser.response);
                    connection.end();
                }
            });

            connection.on('err', (err) => {
                reject(err);
                connection.end();
            });
        });
    }

    toString() {
        const headerText = Object.keys(this.headers)
            .map((key) => `${key}: ${this.headers[key]}`)
            .join('\r\n');
        return `${this.method} ${this.path} HTTP/1.1\r\n${headerText}\r\n\r\n${this.bodyText}`;
    }
}

module.exports = Request;
