const css = require('css');

function addCSSRules(text, rules) {
    const AST = css.parse(text);
    rules.push(...AST.stylesheet.rules);
}

/*
NOTE:
1. Can only calculate body style.
2. Ignore recalculation of inline style.
*/
// REFACTOR: Compute logic
function computeCSS(element, stack, rules) {
    const elements = [...stack].reverse();

    if (!element.computedStyle) {
        element.computedStyle = {};
    }

    elements.unshift(element);

    for (const rule of rules) {
        const selectors = rule.selectors[0].split(' ').reverse();

        if (!match(element, selectors[0])) continue;

        let matched = false;
        let j = 1;
        for (const element of elements) {
            if (match(element, selectors[j])) {
                j++;
            }
        }

        if (j >= selectors.length) {
            matched = true;
        }

        if (matched) {
            const specificity = specificityOf(rule.selectors[0]);
            const computedStyle = element.computedStyle;
            for (const { property, value } of rule.declarations) {
                if (!computedStyle[property]) {
                    computedStyle[property] = {};
                }
                if (!computedStyle[property].specificity) {
                    computedStyle[property].value = value;
                    computedStyle[property].specificity = specificity;
                } else if (
                    compare(computedStyle[property].specificity, specificity) <
                    0
                ) {
                    computedStyle[property].value = value;
                    computedStyle[property].specificity = specificity;
                }
            }
        }
    }
}

function match(element, selector) {
    if (!selector) {
        return false;
    }

    if (selector[0] === '#') {
        return findAttributeValueBy('id') === selector.slice(1);
    } else if (selector[0] === '.') {
        return findAttributeValueBy('class') === selector.slice(1);
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
    addCSSRules,
    computeCSS,
};
