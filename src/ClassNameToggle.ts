interface ConfigObject {
    className?: string,
    interval?: number,
    randomStart?: boolean
}
interface DefaultConfigObject extends ConfigObject {
    className: string,
    interval: number,
    randomStart: boolean
}

export default class ClassNameToggle {
    target: HTMLElement;
    config: DefaultConfigObject = {
        className: "alt",
        interval: 200,
        randomStart: false
    }
    intervalId: number = -1

    constructor(target: HTMLElement, config?: ConfigObject) {
        Object.assign(this.config, config)
        this.target = target;
        let delay = 0
        if (this.config.randomStart) {
            delay = Math.round(Math.random() * this.config.interval)
        }
        setTimeout(() => {
            this.intervalId = setInterval(() => {
                this.toggleClass()
            }, this.config.interval)
        }, delay);
    };
    toggleClass() {
        const newClassName = this.target.className.replace(this.config.className, "")
        if (this.target.className == newClassName) {
            this.target.className += ` ${this.config.className}`
        }
        else this.target.className = newClassName
    }
};
