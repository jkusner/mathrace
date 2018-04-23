const OPERATIONS = ['+', '-', '*'];

function randInt(max) {
    return Math.floor(Math.random() * max);
}

function randOperand(makeProblem=false) {
    if (makeProblem) {
        return Problem.generate(false);
    }
    return randInt(11) - 5;
}

function randOperator() {
    return OPERATIONS[randInt(OPERATIONS.length)];
}

function sln(p) {
    if (p instanceof Problem) {
        return p.solution;
    }
    return p;
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
        let a = sln(this.a);
        let b = sln(this.b);

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
}

module.exports = Problem