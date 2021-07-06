const Request = require('./http/Request');
const Parser = require('./parser/HTMLParser');

(async function () {
    const request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: 8080,
        path: '/',
        headers: {
            ['X-weapon']: 'lightsaber',
        },
        body: {
            name: 'Luke Skywalker',
        },
    });

    const response = await request.send();
    const dom = Parser.parserHTML(response.body);
    console.log(JSON.stringify(dom, null, 4));
})();
