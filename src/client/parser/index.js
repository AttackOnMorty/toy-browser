// Reference: https://html.spec.whatwg.org/#data-state
const EOF = Symbol('EOF');
let currentToken;

function parserHTML(html) {
    let state = data;
    for (const char of html) {
        state = state(char);
    }
    state = state(EOF);
}

function emit(token) {
    console.log(token);
}

function data(char) {
    if (char === '<') {
        return tagOpen;
    } else if (char === 'EOF') {
        emit({ type: 'EOF' });
        return;
    } else {
        emit({ type: 'text', content: char });
        return data;
    }
}

function tagOpen(char) {
    if (char === '/') {
        return endTagOpen;
    } else if (char.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: '',
        };
        return tagName(char);
    } else {
        return;
    }
}

function endTagOpen(char) {
    if (char.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: '',
        };
        return tagName(char);
    } else if (char === '>') {
    } else if (char === 'EOF') {
    } else {
    }
}

function tagName(char) {
    if (char.match(/^[\t\n\f ]$/)) {
        emit(currentToken)
        return beforeAttributeName;
    } else if (char === '/') {
        return selfClosingStartTag;
    } else if (char.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += char;
        return tagName;
    } else if (char === '>') {
        emit(currentToken)
        return data;
    } else {
        return tagName;
    }
}

function beforeAttributeName(char) {
    if (char.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (char === '>') {
        return data;
    } else if (char === '=') {
        return beforeAttributeName;
    } else {
        return beforeAttributeName;
    }
}

function selfClosingStartTag(char) {
    if (char === '>') {
        currentToken.isSelfClosing = true;
        return data;
    } else if (char === 'EOF') {
    } else {
    }
}

module.exports = {
    parserHTML,
};
