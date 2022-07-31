class Group {

    constructor(config) {
        this.name = config.getAttribute('Name');
        this.acronym = config.getAttribute('Acronym');
        this.color = config.getAttribute('Color');
        this.contestants = [];
    }

}