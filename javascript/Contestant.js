let scoreUtils = {
    noSubmission: -2,
    wrong: -1
}

class Contestant {

    constructor({config, group, problems, penalty}) {
        this.id = config.getAttribute('xml:id');
        this.name = config.getAttribute('Name');
        this.group = group;
        this.problems = problems;
        this.penalty = penalty;
        this.score = Array(this.problems.length).fill(scoreUtils.noSubmission);
        this.submissionTimes = Array(this.problems.length).fill(0);
        this.pending = Array(this.problems.length).fill(false);
        this.attempts = Array(this.problems.length).fill(0);
        this.htmlSubmissions = [];
        this.submissionsQueue = [];
        this.nameId = this.id.replace(`${this.group.id}.`, '');
    }

    addSubmission(submission) {
        let index = this.problems.indexOf(submission.problem);

        // This will ignore every submission after the first accepted
        // Remove this condition if you don't want this feature
        if(this.score[index] > 0)
            return;
        
        this.attempts[index] += !submission.accepted;
        
        this.score[index] = submission.accepted ? submission.score : scoreUtils.wrong;
        this.submissionTimes[index] = submission.score;
        this.pending[index] = submission.pending;
    
        if(submission.pending) {
            let aux = this.submissionsQueue.indexOf(index);
            if(aux !== -1)
                this.submissionsQueue.splice(aux, 1);
            this.submissionsQueue.push(index);
        }
    }

    reveal() {
        if(this.submissionsQueue.length === 0)
            return false;

        let index = this.submissionsQueue[0];
        if(this.subRevealing) {
            this.pending[index] = false;
            this.subRevealing = false;
            this.htmlSubmissions[index].classList.remove('revealing');
            this.htmlSubmissions[index].classList.remove('pending');
            this.evaluate(this.htmlSubmissions[index], index);
            this.submissionsQueue.shift();
        } else {
            this.subRevealing = true;
            this.htmlSubmissions[index].classList.add('revealing');
        }
        return true;
    }

    get allScore() {
        let score = 0;
        for(let i = 0; i < this.problems.length; i++)
            if(!this.pending[i] && this.score[i] > 0)
                score +=  this.score[i] + this.penalty * this.attempts[i];
        return score;
    }

    get problemsSolved() {
        let solved = 0;
        for(let i = 0; i < this.problems.length; i++)
            solved += !this.pending[i] && this.score[i] > 0;
        return solved;
    }

    evaluate(data, i) {
        let score = this.score[i];
        if(this.pending[i]) {
            data.classList.add('pending');
            data.innerHTML = `<p>?</p>\n${new Date(this.submissionTimes[i] * 1000).toISOString().substr(11, 8)} (${this.attempts[i]})</p>`;
        } else if(score == scoreUtils.noSubmission) {
            data.classList.add('not-submitted');
            data.innerHTML = '-';
        } else if(score == scoreUtils.wrong) {
            data.classList.add('wrong');
            data.innerHTML = `<p>✗</p>\n${new Date(this.submissionTimes[i] * 1000).toISOString().substr(11, 8)} (${this.attempts[i]})</p>`;
        } else {
            data.classList.add('correct');
            this.problemsSolved + '/' + this.problems.length;
            this.htmlScoreData.innerHTML = new Date(this.allScore * 1000).toISOString().substr(11, 8);
            this.htmlProblemData.innerHTML = this.problemsSolved + '/' + this.problems.length;
            data.innerHTML = `<p>✓</p>\n${new Date(this.submissionTimes[i] * 1000).toISOString().substr(11, 8)} (${this.attempts[i]})</p>`;
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
