function randInt(max) {
    return Math.floor(Math.random() * max);
}
function randChoice(arr) {
    return arr[randInt(arr.length)];
}

module.exports = {
    randInt,
    randChoice
}