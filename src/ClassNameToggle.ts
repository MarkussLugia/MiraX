// MIT License

// Copyright (c) 2023 MarkussLugia a.k.a. Siltra

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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