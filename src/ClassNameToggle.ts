export class ClassToggleHook {
    target: HTMLElement;
    toggleClassName: string;

    constructor(target: HTMLElement, className?: string) {
        this.toggleClassName = className || "alt"
        this.target = target;
    };

    toggle() {
        ClassToggleHook.toggleElementClass(this.target, this.toggleClassName)
    }

    static toggleElementClass(target: HTMLElement, className: string) {
        const newClassName = target.className.replace(className, "")
        if (target.className == newClassName) target.className += ` ${className}`
        else target.className = newClassName
    }
};

export class ClassToggleInterval extends ClassToggleHook {
    interval: number;
    intervalId: number = -1;
    constructor(target: HTMLElement, className?: string, interval?: number) {
        super(target, className)
        this.interval = interval || 200
    }
    start() {
        this.intervalId = setInterval(() => this.toggle(), this.interval)
    }
    stop() {
        clearInterval(this.intervalId);
        this.intervalId = -1
    }
}