const { randInt, randChoice } = require('./random');
const Problem = require('./problem');

function negate(prob) {
    return Problem.sln(prob) * -1;
}

let fakeAnswerGenerators = [
    // Negate solution
    negate,
    // Negate a
    prob => (new Problem(negate(prob.a), prob.b, prob.op)).solution,
    // Negate b
    prob => (new Problem(prob.a, negate(prob.b), prob.op)).solution,
    // Negate a and b
    prob => (new Problem(negate(prob.a), negate(prob.b), prob.op)).solution,
    // Add random number
    prob => prob.solution + randInt(5),
    // Subtract random number
    prob => prob.solution - randInt(5)
    // TODO add and subtract from a and b, etc
];

function makeFakeAnswers(prob) {
    let realAnswer = prob.solution;
    let fakes = [];
    while (fakes.length < 3) {
        let fake = randChoice(fakeAnswerGenerators)(prob);
        if (fake !== realAnswer && fakes.indexOf(fake) < 0) {
            fakes.push(fake);
        }
    }
    return fakes;
}

class Question {
    constructor(str, choices, correctIndex) {
        this.str = str;
        this.choices = choices;
        this.correctIndex = correctIndex;
    }
    getData() {
        return {
            str: this.str,
            choices: this.choices
        };
    }
    static generate() {
        let prob = Problem.generate();
        let correctAnswer = prob.solution;

        let correctIndex = randInt(4);
        let choices = makeFakeAnswers(prob);
        choices.splice(correctIndex, 0, correctAnswer);

        console.log(prob.str, choices, correctIndex);

        return new Question(prob.str, choices, correctIndex);
    }
}

module.exports = Question