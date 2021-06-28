const Request = require('./http/Request');

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
})();
