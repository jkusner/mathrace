/*
    John Kusner
    jjk320@lehigh.edu
    CSE 264
    Final Project
*/

const { randInt, randChoice } = require('./random');

const OPERATIONS = ['+', '-', '*'];

function randOperand(makeProblem=false) {
    if (makeProblem) {
        return Problem.generate(false);
    }
    return randInt(6) * (Math.random() > .8 ? -1 : 1);
}

function randOperator() {
    return randChoice(OPERATIONS);
}

class Problem {
    constructor(a, b, op) {
        this.a = a;
        this.b = b;
        this.op = op;

        this.solution = this.solve();
        this.str = this.toString();
    }
    solve() {
        let a = Problem.sln(this.a);
        let b = Problem.sln(this.b);

        if (this.op === '+') {
            return a + b;
        } else if (this.op === '-') {
            return a - b;
        } else if (this.op === '*') {
            return a * b;
        } else {
            throw 'OPERATOR ' + this.op + ' UNKNOWN!';
        }
    }
    toString() {
        let result = '';
        if (this.a instanceof Problem) {
            result += '(' + this.a.toString() + ')';
        } else {
            result += this.a;
        }

        result += ' ' + this.op + ' ';

        if (this.b instanceof Problem) {
            result += '(' + this.b.toString() + ')';
        } else {
            result += this.b;
        }

        // Avoid weird -0 result
        if (result === 0) result = 0;

        return result;
    }
    static generate(nest=true) {
        let a = randOperand(nest && Math.random() > .5);
        let b = randOperand();
        
        // flip a and b
        if (Math.random() > .5) {
            let temp = a;
            a = b;
            b = temp;
        }

        let op = randOperator();
        
        return new Problem(a, b, op);
    }
    static sln(p) {
        if (p instanceof Problem) {
            return p.solution;
        }
        return p;
    }
}

module.exports = Problem