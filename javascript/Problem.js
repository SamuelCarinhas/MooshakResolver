class Problem {

    constructor(config) {
        this.name = config.getAttribute('Name');
        this.color = config.getAttribute('Color');
    }

    compareTo(other) {
        if(this.name < other.name) return -1;
        if(this.name > other.name) return 1;
        return 0;
    }

    getElement() {
        let header = document.createElement('th');
        header.classList.add('problem');
        header.innerHTML = this.name;

        return header;
    }

}
