/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */

import numberToWords from "./numberToWords";

function createObjectFromNumber(n) {
    return {
        range: n,
        within: "within" + numberToWords(n),
        beyond: "beyond" + numberToWords(n),
    };
}

export default createObjectFromNumber;