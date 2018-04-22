const OPERATIONS = ['+', '-', '*'];

function randInt(max) {
    return Math.floor(Math.random() * max);
}

class Question {
    constructor(a, b, op, ans) {
        this.a = a;
        this.b = b;
        this.op = op;
        this.ans = ans;
        this.buildString();
    }
    buildString() {
        let qString = '';
        if (this.a instanceof Question) {
            qString += '(' + this.a.str + ')';
        } else {
            qString += this.a;
        }

        qString += ' ' + this.op + ' ';

        if (this.b instanceof Question) {
            qString += '(' + this.b.str + ')';
        } else {
            qString += this.b;
        }
        this.str = qString;
    }
    static generate(diff=0) {
        let a, b;
        
        if (randInt(diff + 1) > 0) {
            a = Question.generate(diff - 1);
        } else {
            a = randInt(20) - 10;
        }

        b = randInt(20) - 10;

        if (Math.random() > .5) {
            let temp = a;
            a = b;
            b = temp;
        }

        let op = OPERATIONS[randInt(OPERATIONS.length)];
        
        let aAns = a instanceof Question ? a.ans : a;
        let bAns = b instanceof Question ? b.ans : b;

        let ans = eval(aAns + ' ' + op + ' ' + bAns);

        return new Question(a, b, op, ans);
    }
}

module.exports = Question