// HTML Tokenization Specification: https://html.spec.whatwg.org/#tokenization
const EOF = Symbol('EOF');
const stack = [{ type: 'document', children: [] }];
let currentToken;
let currentAttribute;
let currentTextNode;

function parserHTML(html) {
    let state = data;
    for (const char of html) {
        state = state(char);
    }
    state = state(EOF);

    return stack[0];
}

function emit(token) {
    const top = stack[stack.length - 1];

    if (token.type === 'startTag') {
        const element = {
            type: 'element',
            tagName: token.tagName,
            children: [],
            attributes: [],
        };

        for (const [key, value] of Object.entries(token)) {
            if (key !== 'type' && key !== 'tagName') {
                element.attributes[key] = value;
            }
        }

        top.children.push(element);
        element.parent = top;

        if (!token.isSelfClosing) {
            stack.push(element);
        }

        currentTextNode = null;
    } else if (token.type === 'text') {
        if (currentTextNode === null) {
            currentTextNode = {
                type: 'text',
                content: '',
            };
            top.children.push(currentTextNode);
        }
        currentTextNode.content += token.content;
    } else if (token.type === 'endTag') {
        if (top.tagName !== token.tagName) {
            throw new Error("Start tag and end tag doesn't match.");
        }
        stack.pop();
        currentTextNode = null;
    }
}

// TODO: Unhandled character: &
function data(char) {
    if (char === '<') {
        return tagOpen;
    } else if (char === '\u0000') {
    } else if (char === EOF) {
        emit({ type: 'EOF' });
    } else {
        emit({ type: 'text', content: char });
        return data;
    }
}

// TODO: Unhandled characters: !, ?
function tagOpen(char) {
    if (char === '/') {
        return endTagOpen;
    } else if (char.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: '',
        };
        return tagName(char);
    } else if (char === EOF) {
    } else {
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
    } else if (char === EOF) {
    } else {
    }
}

function tagName(char) {
    if (char.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (char === '/') {
        return selfClosingStartTag;
    } else if (char.match(/^[A-Z]$/)) {
        currentToken.tagName += char.toLowerCase();
        return tagName;
    } else if (char === '>') {
        emit(currentToken);
        return data;
    } else if (char === '\u0000') {
    } else if (char === EOF) {
    } else {
        currentToken.tagName += char;
        return tagName;
    }
}

function beforeAttributeName(char) {
    if (char.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (char === '/' || char === '>' || char === EOF) {
        return afterAttributeName(char);
    } else if (char === '=') {
    } else {
        currentAttribute = {
            name: '',
            value: '',
        };
        return attributeName(char);
    }
}

function afterAttributeName(char) {
    if (char.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (char === '/') {
        return selfClosingStartTag;
    } else if (char === '=') {
        return beforeAttributeValue;
    } else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (char === EOF) {
    } else {
        currentAttribute = {
            name: '',
            value: '',
        };
        return attributeName(char);
    }
}

function attributeName(char) {
    if (
        char.match(/^[\t\n\f ]$/) ||
        char === '/' ||
        char === '>' ||
        char === EOF
    ) {
        return afterAttributeName(char);
    } else if (char === '=') {
        return beforeAttributeValue;
    } else if (char.match(/^[A-Z]$/)) {
        currentToken.tagName += char.toLowerCase();
        return attributeName;
    } else if (char === '\u0000') {
    } else if (char === '"' || char === "'" || char === '<') {
    } else {
        currentAttribute.name += char;
        return attributeName;
    }
}

function beforeAttributeValue(char) {
    if (
        char.match(/^[\t\n\f ]$/) ||
        char === '/' ||
        char === '>' ||
        char === EOF
    ) {
        return beforeAttributeValue;
    } else if (char === '"') {
        return doubleQuotedAttributeValue;
    } else if (char === "'") {
        return singleQuotedAttributeValue;
    } else if (char === '>') {
    } else {
        return unquotedAttributeValue(char);
    }
}

// TODO: Unhandled character: &
function doubleQuotedAttributeValue(char) {
    if (char === '"') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (char === '\u0000') {
    } else if (char === EOF) {
    } else {
        currentAttribute.value += char;
        return doubleQuotedAttributeValue;
    }
}

// TODO: Unhandled character: &
function singleQuotedAttributeValue(char) {
    if (char === "'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (char === '\u0000') {
    } else if (char === EOF) {
    } else {
        currentAttribute.value += char;
        return singleQuotedAttributeValue;
    }
}

// TODO: Unhandled character: &
function unquotedAttributeValue(char) {
    if (char.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (char === '\u0000') {
    } else if (
        char === '"' ||
        char === "'" ||
        char === '<' ||
        char === '=' ||
        char === '`'
    ) {
    } else if (char === EOF) {
    } else {
        currentAttribute.value += char;
        return unquotedAttributeValue;
    }
}

function afterQuotedAttributeValue(char) {
    if (char.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (char === '/') {
        return selfClosingStartTag;
    } else if (char === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (char === EOF) {
    } else {
    }
}

function selfClosingStartTag(char) {
    if (char === '>') {
        currentToken.isSelfClosing = true;
        emit(currentToken);
        return data;
    } else if (char === 'EOF') {
    } else {
    }
}

module.exports = {
    parserHTML,
};
