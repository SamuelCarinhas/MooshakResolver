class Contestant {

    constructor({config, group, problems}) {
        this.name = config.getAttribute('Name');
        this.group = group;
        this.problems = problems;
        this.score = [];
        this.pending = [];
        this.htmlSubmissions = [];
        this.problemsSolved = 0;
        this.allScore = 0;
        this.pendingCount = 0;
        for(let _ of problems) {
            this.score.push(-2);
            this.pending.push(false);
        }
    }

    addSubmission(submission) {
        let index = this.problems.indexOf(submission.problem);
        if(submission.accepted) {
            this.score[index] = submission.score;
        } else {
            this.score[index] = -1;
        }
        this.pending[index] = submission.pending;
        if(!submission.pending && submission.accepted) {
            this.problemsSolved++;
            this.allScore += submission.score;
        } else {
            this.pendingCount++;
        }
    }

    reveal() {
        if(this.pendingCount == 0) {
            return false;
        } else {
            for(let i = 0; i < this.pending.length; i++) {
                if(this.pending[i]) {
                    if(this.subRevealing) {
                        this.pendingCount--;
                        this.pending[i] = false;
                        this.subRevealing = false;
                        this.htmlSubmissions[i].classList.remove('revealing');
                        this.htmlSubmissions[i].classList.remove('pending');
                        this.evaluate(this.htmlSubmissions[i], i);
                    } else {
                        this.subRevealing = true;
                        this.htmlSubmissions[i].classList.add('revealing');
                    }
                    break;
                }
            }
        }
        return true;
    }

    evaluate(data, i) {
        let score = this.score[i];
        if(this.pending[i]) {
            data.classList.add('pending');
            data.innerHTML = '?';
        } else if(score == -2) {
            data.classList.add('not-submitted');
            data.innerHTML = '-';
        } else if(score == -1) {
            data.classList.add('wrong');
            data.innerHTML = '✗';
        } else {
            data.classList.add('correct');
            this.allScore += score;
            this.problemsSolved++;
            this.problemsSolved + '/' + this.problems.length;
            this.htmlScoreData.innerHTML = new Date(this.allScore * 1000).toISOString().substr(11, 8);
            this.htmlProblemData.innerHTML = this.problemsSolved + '/' + this.problems.length;
            data.innerHTML = '✓';
        }
    }

    select() {
        this.selected = true;
        this.htmlElement.classList.add('selected');
        this.htmlElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    deselect() {
        this.selected = false;
        this.htmlElement.classList.remove('selected');
    }

    getElement() {
        let row = document.createElement('tr');
        row.classList.add('contestant');

        if(this.selected)
            row.classList.add('selected');
        
        let data = document.createElement('td');
        data.classList.add('name');
        data.innerHTML = this.group.acronym + ' ' + this.name;
        row.appendChild(data);

        let problemsData = document.createElement('td');
        problemsData.classList.add('problemData');
        problemsData.innerHTML = this.problemsSolved + '/' + this.problems.length;
        this.htmlProblemData = row.appendChild(problemsData);

        let scoreData = document.createElement('td');
        scoreData.classList.add('scoreData');
        scoreData.innerHTML = new Date(this.allScore * 1000).toISOString().substr(11, 8);
        this.htmlScoreData = row.appendChild(scoreData);

        for(let i = 0; i < this.problems.length; i++) {
            let data = document.createElement('td');

            this.evaluate(data, i);
            
            this.htmlSubmissions.push(row.appendChild(data));
        }

        return row;
    }

    compareTo(other) {
        if(this.problemsSolved != other.problemsSolved)
            return other.problemsSolved - this.problemsSolved;
        return this.allScore - other.allScore;
    }
}
