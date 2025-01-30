/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */

function isStringInArray(string, array) {
    const lowerCaseString = string.toLowerCase();
    return array.some(element => element.toLowerCase() === lowerCaseString);
}

export default isStringInArray;