/**
 * Joshua Alele-Beals
 * joshbeals22@gmail.com
 * github.com/joshBeals
 */

function numberToWords(n) {
    const words = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
    return n >= 1 && n <= 10 ? words[n-1] : n.toString();
}

export default numberToWords;