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

// TODO this lib needs rewriting

interface ConfigObject {
    xMove?: boolean,
    yMove?: boolean
    moveRatio?: number,
    basis?: "width" | "height" | "auto"
    anchorDepth?: number
    updateInterval?: number
}
interface DefaultConfigObject extends ConfigObject {
    xMove: boolean,
    yMove: boolean,
    moveRatio: number,
    basis: "width" | "height" | "auto",
    anchorDepth: number,
    updateInterval: number
}
interface AddChildConfigObject {
    depth: number
}
// @ts-ignore
const isChromium: boolean = !!window.chrome;

export default class DepthField {
    container: HTMLDivElement;
    children: DepthFieldChild[] = [];
    config: DefaultConfigObject = {
        xMove: true,
        yMove: true,
        basis: "auto",
        moveRatio: 0.08,
        anchorDepth: 50,
        updateInterval: 60
    }
    temp = {
        moveDistanceBasis: 0,
        containerObserver: null,
        childWidth: 0,
        childHeight: 0,
        childLeft: 0,
        childTop: 0,
    }
    intervalId: number = 0
    xRatio: number = 0
    yRatio: number = 0

    constructor(container: HTMLDivElement, config?: ConfigObject) {
        Object.assign(this.config, config)
        this.container = container;
        let containerObserver = new ResizeObserver(() => {
            this.updateSize()
        })
        containerObserver.observe(this.container)
        this.intervalId = setInterval(() => {
            this.updatePositionEase(this.xRatio, this.yRatio)
        }, this.config.updateInterval)
    };
    addChild(childElement: HTMLDivElement | null, config: AddChildConfigObject) {
        if (!childElement) return
        const child = new DepthFieldChild(childElement)
        child.depth = config.depth

        child.target.style.zIndex = `${config.depth}`
        child.target.style.transition = `all 1.5s cubic-bezier(.7,0,.5,1), translate ${this.config.updateInterval +20}ms linear`
        setTimeout(() => {
            child.target.style.transition = `translate ${this.config.updateInterval +20}ms linear`
        }, 1510);
        this.updateChildSize(child)
        this.children.push(child)
    }
    static computeOffsetMax(childDepth: number, anchorDepth: number, moveDistanceBasis: number) {
        const anchorFullRange = anchorDepth > 50 ? anchorDepth : 100 - anchorDepth
        const offsetRatio = (childDepth - anchorDepth) / anchorFullRange
        return moveDistanceBasis * offsetRatio
    }
    updateSize() {
        const rect = this.container.getBoundingClientRect()
        let scaleRatio = this.config.moveRatio * 2 + 1
        this.temp.childWidth = Math.ceil(rect.width * scaleRatio)
        this.temp.childHeight = Math.ceil(rect.height * scaleRatio)
        this.temp.childLeft = Math.ceil(rect.width * this.config.moveRatio)
        this.temp.childTop = Math.ceil(rect.height * this.config.moveRatio)
        switch (this.config.basis) {
            case "width":
                this.temp.moveDistanceBasis = rect.width * this.config.moveRatio
                break;
            case "height":
                this.temp.moveDistanceBasis = rect.height * this.config.moveRatio
                break;
            case "auto":
                if (rect.width < rect.height) {
                    this.temp.moveDistanceBasis = rect.width * this.config.moveRatio
                }
                else {
                    this.temp.moveDistanceBasis = rect.height * this.config.moveRatio
                }
                break;
            default:
                this.temp.moveDistanceBasis = 0
        }
        this.children.forEach(child => this.updateChildSize(child))
    }
    updateChildSize(child: DepthFieldChild) {
        child.target.style.width = `${this.temp.childWidth}px`
        child.target.style.height = `${this.temp.childHeight}px`
        child.target.style.left = `-${this.temp.childLeft}px`
        child.target.style.top = `-${this.temp.childTop}px`
        child.offsetMax = DepthField.computeOffsetMax(child.depth, this.config.anchorDepth, this.temp.moveDistanceBasis)
    }

    halfPI = Math.PI / 2
    updatePositionEase(xRatio: number, yRatio: number) {
        this.updatePosition(Math.sin(this.halfPI * xRatio), Math.sin(this.halfPI * yRatio))
    }

    updatePosition(xRatio: number, yRatio: number) {
        this.children.forEach(child => {
            child.updatePosition(xRatio, yRatio)
        })
    }
};

class DepthFieldChild {
    target: HTMLElement
    offsetMax: number = 0
    depth: number = 0
    constructor(target: HTMLDivElement) {
        this.target = target;
    };
    updatePosition(xRatio: number, yRatio: number) {
        this.target.style.translate =
            `${xRatio * this.offsetMax}px ${yRatio * this.offsetMax}px`
    }
}