class Resolver {

    constructor(config) {
        this.element = config.element;
        this.content = config.content;
    }

    setup(text) {
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
                    problems: this.problemSet
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

        this.contestants.sort((a, b) => a.compareTo(b));

        this.addElements();
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

    reveal() {
        if(!this.stack) {
            this.stack = [];
            for(let contestant of this.contestants) {
                this.stack.push(contestant);
            }
        }

        if(this.stack.length > 0) {
            if(this.reviewing) {
                console.log('a');
                this.last.reveal();
                this.reviewing = false;
                this.contestants.sort((a, b) => a.compareTo(b));
                for(let contestant of this.contestants) {
                    this.element.removeChild(contestant.htmlElement);
                }
                for(let contestant of this.contestants) {
                    contestant.htmlElement = this.element.appendChild(contestant.htmlElement);
                }
                this.last.select();
                return;
            }
            if(this.last) {
                this.last.deselect();
            }
            let contestant = this.stack.pop();
            contestant.select();
    
            if(contestant.reveal()) {
                this.reviewing = true;
                let i = 0;
                
                while(i < this.stack.length && this.stack[i].compareTo(contestant) < 0) {
                    i++;
                }

                this.stack.splice(i, 0, contestant);
            }
            this.last = contestant;
        }
    }

    init() {
        console.log('Resolver started');

        
        fetch(this.content)
            .then(response => response.text())
            .then(text => {
                this.setup(text);
                this.bindActions();
            });
    }

}
