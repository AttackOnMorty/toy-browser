const css = require('css');

function getCSSRules(text) {
    return css.parse(text).stylesheet.rules;
}

/*
NOTE:
1. Can only calculate body style.
2. Ignore recalculation of inline style.
*/
function computeCSS(element, stack, rules) {
    for (const rule of rules) {
        const selector = rule.selectors[0];
        const selectorParts = selector.split(' ').reverse();
        const elements = [...stack].reverse();

        // NOTE: Separately calculate whether the first element matches, because self-closing element will not be pushed into stack.
        if (!match(selectorParts[0], element)) continue;
        selectorParts.shift();

        let matched = false;
        let count = 0;
        for (const part of selectorParts) {
            if (match(part, elements[count])) {
                count++;
            }
        }
        if (count === selectorParts.length) {
            matched = true;
        }

        if (matched) {
            const computedStyle = element.computedStyle;
            const specificity = specificityOf(selector);
            for (const { property, value } of rule.declarations) {
                if (!computedStyle[property]) {
                    computedStyle[property] = {
                        value,
                        specificity: [0, 0, 0, 0],
                    };
                }
                if (
                    compare(computedStyle[property].specificity, specificity) <
                    0
                ) {
                    computedStyle[property] = {
                        value,
                        specificity,
                    };
                }
            }
        }
    }
}

function match(selector, element) {
    if (!selector || !element) {
        return false;
    }

    if (selector.charAt(0) === '#') {
        return findAttributeValueBy('id') === selector.substring(1);
    } else if (selector.charAt(0) === '.') {
        return findAttributeValueBy('class') === selector.substring(1);
    } else {
        return element.tagName === selector;
    }

    function findAttributeValueBy(name) {
        const attribute = element.attributes.filter(
            (attribute) => attribute.name === name
        )[0];
        return attribute && attribute.value;
    }
}

function specificityOf(selector) {
    const res = [0, 0, 0, 0];
    const selectorParts = selector.split(' ');
    for (const part of selectorParts) {
        if (part.charAt(0) === '#') {
            res[1] += 1;
        } else if (part.charAt(0) === '.') {
            res[2] += 1;
        } else {
            res[3] += 1;
        }
    }
    return res;
}

function compare(sp1, sp2) {
    if (sp1[0] > sp2[0]) {
        return sp1[0] - sp2[0];
    }
    if (sp1[1] > sp2[1]) {
        return sp1[1] - sp2[1];
    }
    if (sp1[2] > sp2[2]) {
        return sp1[2] - sp2[2];
    }
    return sp1[3] - sp2[3];
}

module.exports = {
    getCSSRules,
    computeCSS,
};
