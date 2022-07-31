class KeyPressListener {

    constructor(keycode, callback) {
        let keySafe = true;

        this.keydownFunction = (e) => {
            if (e.code === keycode && keySafe) {
                keySafe = false;
                callback();
            }
        };

        this.keyupFunction = (e) => {
            if (e.code === keycode) {
                keySafe = true;
            }
        };

        document.addEventListener('keydown', this.keydownFunction);
        document.addEventListener('keyup', this.keyupFunction);
    }
    
    unbind() {
        document.removeEventListener('keydown', this.keydownFunction);
        document.removeEventListener('keyup', this.keyupFunction);
    }

}