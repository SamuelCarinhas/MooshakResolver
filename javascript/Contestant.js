class Contestant {

    constructor({config, group, problems}) {
        this.name = config.getAttribute('Name');
        this.group = group;
        this.problems = problems;
        this.score = [];
        this.pending = [];
        this.problemsSolved = 0;
        this.allScore = 0;
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
        }
    }

    getElement() {
        let row = document.createElement('tr');
        row.classList.add('contestant');
        
        let data = document.createElement('td');
        data.classList.add('name');
        data.innerHTML = this.group.acronym + ' ' + this.name;
        row.appendChild(data);

        let problemsData = document.createElement('td');
        problemsData.classList.add('problemData');
        problemsData.innerHTML = this.problemsSolved + '/' + this.problems.length;
        row.appendChild(problemsData);

        let scoreData = document.createElement('td');
        scoreData.classList.add('scoreData');
        scoreData.innerHTML = new Date(this.allScore * 1000).toISOString().substr(11, 8);
        row.appendChild(scoreData);

        for(let i = 0; i < this.problems.length; i++) {
            let data = document.createElement('td');
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
                data.innerHTML = '✓';
            }
            
            row.appendChild(data);
        }

        return row;
    }

    compareTo(other) {
        if(this.problemsSolved != other.problemsSolved)
            return other.problemsSolved - this.problemsSolved;
        return this.allScore - other.allScore;
    }
}