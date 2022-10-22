class Submission {

    constructor({config, contestants, problemSet, contestData}) {
        this.contestant = contestants.find(c => c.nameId == config.getAttribute('Team'));
        this.problem = problemSet.find(p => p.id == `problems.${config.getAttribute('Problem')}`);
        this.classify = config.getAttribute('Classify');
        this.date = config.getAttribute('Date');
        this.contestData = contestData;
    }

    update() {
        this.contestant.addSubmission(this);
    }

    get accepted() {
        return this.classify == 'Accepted';
    }

    get pending() {
        return this.contestData.stop - this.date < this.contestData.freeze * 60;
    }

    get score() {
        return parseInt(this.date) - parseInt(this.contestData.start);
    }

}