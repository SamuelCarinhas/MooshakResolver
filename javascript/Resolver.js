class Resolver {

    constructor(config) {
        this.element = config.element;
        this.content = config.content;
    }

    setup(text) {
        // Remove garbage from observations
        text = text.replace(/Observations="([^\"]|\r|\n)*"/g, '');

        let parser = new DOMParser();
        let xml = parser.parseFromString(text, 'text/xml');
        let contest = xml.firstChild;
        let contestData = {
            name: contest.getAttribute('Designation'),
            open: contest.getAttribute('Open'),
            start: contest.getAttribute('Start'),
            stop: contest.getAttribute('Stop'),
            close: contest.getAttribute('Close'),
            freeze: contest.getAttribute('HideListings')
        }

        let problems = contest.getElementsByTagName('Problems')[0];
        this.problemSet = [];
        for(let problem of problems.children)
            this.problemSet.push(new Problem(problem));
        this.problemSet.sort((a, b) => a.compareTo(b));

        let groups = contest.getElementsByTagName('Groups')[0];
        this.groups = [];
        this.contestants = [];
        for(let group of groups.children) {
            let g = new Group(group);
            this.groups.push(g);
            for(let team of group.children) {
                let contestant = new Contestant({
                    config: team,
                    group: g,
                    problems: this.problemSet,
                    penalty: 20 * 60,
                    rank: this.contestants.length+1
                });

                g.contestants.push(contestant);
                this.contestants.push(contestant);
            }
        }

        let submissions = contest.getElementsByTagName('Submissions')[0];
        this.submissions = [];
        for(let submission of submissions.children) {
            this.submissions.push(new Submission({
                config: submission,
                contestants: this.contestants,
                problemSet: this.problemSet,
                contestData: contestData
            }));
        }

        this.submissions.sort((a, b) => a.date - b.date);
        for(let submission of this.submissions) {
            submission.update();
        }

        this.contestants.sort((a, b) => a.compareTo(b));

        this.updateContestantsRank();

        this.addElements();
    }

    updateContestantsRank() {
        let updateRank = 0;
        for(let contestant of this.contestants)
            if(contestant.rankElement)
                contestant.rankElement.innerHTML = ++updateRank;
    }

    addElements() {
        for(let problem of this.problemSet) {
            let problems = this.element.getElementsByClassName('problems')[0];
            problem.htmlElement = problems.appendChild(problem.getElement());
        }

        for(let contestant of this.contestants) {
            contestant.htmlElement = this.element.appendChild(contestant.getElement());
        }
    }

    bindActions() {
        new KeyPressListener('Enter', () => {
            this.reveal();
        });
    }

    updateContestantsOrder() {
        this.contestants.sort((a, b) => a.compareTo(b));
        this.updateContestantsRank();
        for(let contestant of this.contestants) {
            this.element.removeChild(contestant.htmlElement);
        }
        for(let contestant of this.contestants) {
            contestant.htmlElement = this.element.appendChild(contestant.htmlElement);
        }
        this.updateContestantsRank();
    }

    reveal() {
        this.updateContestantsOrder();
        let revealContestant = undefined;
        for(let contestant of this.contestants) {
            if(contestant.submissionsQueue.length > 0 || contestant.final)
                revealContestant = contestant;
        }
        if(revealContestant) {
            if(revealContestant.submissionsQueue.length == 0 && revealContestant.final) {
                if(this.last)
                    this.last.deselect();
                revealContestant.final = false;
                revealContestant.select();
                this.last = revealContestant;
            } else {
                if(this.reviewing) {
                    revealContestant.reveal();
                    this.reviewing = false;
                } else {
                    if(this.last)
                        this.last.deselect();
                    revealContestant.select();
                    revealContestant.reveal();
                    this.reviewing = true;
                    this.last = revealContestant;
                }
            }
            this.updateContestantsOrder();
            revealContestant.scrollIntoView();    
        } else {
            this.last.deselect();
        }
    }

    init() {
        console.log('Resolver started');

        fetch(this.content)
            .then(response => response.text())
            .then(text => {
                this.setup(text);
                this.bindActions();
                this.updateContestantsOrder();
            });
    }

}
