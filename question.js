const Problem = require('./problem');

const OPERATIONS = ['+', '-', '*'];

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

        // For testing purposes, make this better of course
        let correctIndex = 0;
        let choices = [correctAnswer, 1111, 2222, 3333];
        
        // this.answerIndex = randInt(this.options.length + 1);

        // this.options = fakeAnswers.slice();
        // this.options.splice(this.answerIndex, 0, this.ans);

        return new Question(prob.str, choices, correctIndex);
    }
}

module.exports = Question