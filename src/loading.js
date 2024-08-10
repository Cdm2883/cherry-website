export default class FullscreenLoading {
    counter = 0;
    isLoading = false;
    loading() {
        if (++this.counter > 0 && !this.isLoading) {
            this.isLoading = true;
            this.onLoading();
        }
    }
    loaded() {
        if (--this.counter <= 0 && this.isLoading) {
            this.isLoading = false;
            this.onLoaded();
        }
    }

    constructor() {
        this.container = document.getElementById('fullscreen-loading');
    }

    onLoading() {
        console.log('onLoading');
    }

    onLoaded() {
        console.log('onLoaded');
    }
}
