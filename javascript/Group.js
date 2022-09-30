class Group {

    constructor(config) {
        this.id = config.getAttribute('xml:id');
        this.name = config.getAttribute('Name');
        this.acronym = config.getAttribute('Acronym');
        this.color = config.getAttribute('Color');
        this.contestants = [];
    }

}