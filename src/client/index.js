const Request = require('./http/Request');
const Parser = require('./parser');

(async function () {
    const request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: 8080,
        path: '/',
        headers: {
            ['X-weapon']: 'lightsaber'
        },
        body: {
            name: 'Luke Skywalker'
        }
    });

    const response = await request.send();
    console.log(response);

    const dom = Parser.parserHTML(response.body);
})();
