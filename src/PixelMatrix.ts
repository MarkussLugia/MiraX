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


export class AlphaMatrix {
    data: Array<number[]>;
    width: number;
    height: number;

    constructor(imageData: ImageData) {
        const { width, height } = imageData
        this.data = AlphaMatrix.imageDataToAlphaMatrix(imageData)
        this.width = width
        this.height = height
    }

    static imageDataToAlphaMatrix(imageData: ImageData): Array<number[]> {
        const { data, width, height } = imageData
        const matrix = new Array<number[]>()
        for (let row = 0; row < height; row++) {
            const rowArray = new Array<number>(width)
            for (let col = 0; col < width; col++) {
                const index = row * width + col
                rowArray[col] = data[index * 4 + 3]
            }
            matrix.push(rowArray)
        }
        return matrix
    }

    static emptyArray(width: number) {
        return (new Array<number>(width)).fill(0)
    }

    public extendRight(delta: number) {
        const deltaArray = AlphaMatrix.emptyArray(delta)
        for (let index = 0; index < this.data.length; index++) {
            this.data[index] = this.data[index].concat(deltaArray)
        }
        this.width += delta
        return this
    }
    public extendLeft(delta: number) {
        const deltaArray = AlphaMatrix.emptyArray(delta)
        for (let index = 0; index < this.data.length; index++) {
            this.data[index] = deltaArray.concat(this.data[index])
        }
        this.width += delta
        return this
    }
    public extendBottom(delta: number) {
        const deltaArray = new Array<number[]>(delta)
        for (let index = 0; index < deltaArray.length; index++) {
            deltaArray[index] = AlphaMatrix.emptyArray(this.width)
        }
        this.data = this.data.concat(deltaArray)
        this.height += delta
        return this
    }
    public extendTop(delta: number) {
        const deltaArray = new Array<number[]>(delta)
        for (let index = 0; index < deltaArray.length; index++) {
            deltaArray[index] = AlphaMatrix.emptyArray(this.width)
        }
        this.data = deltaArray.concat(this.data)
        this.height += delta
        return this
    }
    public extend(delta: number) {
        return this.extendLeft(delta)
            .extendRight(delta)
            .extendTop(delta)
            .extendBottom(delta)
    }
    public toImageData(r: number = 0, g: number = 0, b: number = 0): ImageData {
        const imageDataArray = new Uint8ClampedArray(this.width * this.height * 4)
        for (let row = 0; row < this.height; row++) {
            const rowArray = this.data[row]
            for (let col = 0; col < this.width; col++) {
                const index = row * this.width + col
                imageDataArray[index * 4 + 3] = rowArray[col]
                imageDataArray[index * 4] = r
                imageDataArray[index * 4 + 1] = g
                imageDataArray[index * 4 + 2] = b
            }
        }
        return new ImageData(imageDataArray, this.width, this.height)
    }
    public stroke(radius: number) {
        const ctx = (new OffscreenCanvas(this.width, this.height)).getContext("2d") as OffscreenCanvasRenderingContext2D
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.data[row][col] > 127) {
                    ctx.beginPath();
                    ctx.arc(col, row, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
        const imageData = ctx.getImageData(0, 0, this.width, this.height)
        this.data = AlphaMatrix.imageDataToAlphaMatrix(imageData)
        return this
    }
}

export class BitMatrix {
    data: Array<boolean[]>;
    width: number;
    height: number;

    constructor(imageData: ImageData) {
        const { width, height } = imageData
        this.data = BitMatrix.imageDataToBitMatrix(imageData)
        this.width = width
        this.height = height
    }

    static imageDataToBitMatrix(imageData: ImageData): Array<boolean[]> {
        const { data, width, height } = imageData
        const matrix = new Array<boolean[]>()
        for (let row = 0; row < height; row++) {
            const rowArray = new Array<boolean>(width)
            for (let col = 0; col < width; col++) {
                const index = row * width + col
                rowArray[col] = data[index * 4 + 3] > 127 ? true : false
            }
            matrix.push(rowArray)
        }
        return matrix
    }

    static emptyArray(width: number) {
        return (new Array<boolean>(width)).fill(false)
    }

    public extendRight(delta: number) {
        const deltaArray = BitMatrix.emptyArray(delta)
        for (let index = 0; index < this.data.length; index++) {
            this.data[index] = this.data[index].concat(deltaArray)
        }
        this.width += delta
        return this
    }
    public extendLeft(delta: number) {
        const deltaArray = BitMatrix.emptyArray(delta)
        for (let index = 0; index < this.data.length; index++) {
            this.data[index] = deltaArray.concat(this.data[index])
        }
        this.width += delta
        return this
    }
    public extendBottom(delta: number) {
        const deltaArray = new Array<boolean[]>(delta)
        for (let index = 0; index < deltaArray.length; index++) {
            deltaArray[index] = BitMatrix.emptyArray(this.width)
        }
        this.data = this.data.concat(deltaArray)
        this.height += delta
        return this
    }
    public extendTop(delta: number) {
        const deltaArray = new Array<boolean[]>(delta)
        for (let index = 0; index < deltaArray.length; index++) {
            deltaArray[index] = BitMatrix.emptyArray(this.width)
        }
        this.data = deltaArray.concat(this.data)
        this.height += delta
        return this
    }
    public extend(delta: number) {
        return this.extendLeft(delta)
            .extendRight(delta)
            .extendTop(delta)
            .extendBottom(delta)
    }
    public toImageData(r: number = 0, g: number = 0, b: number = 0): ImageData {
        const imageDataArray = new Uint8ClampedArray(this.width * this.height * 4)
        for (let row = 0; row < this.height; row++) {
            const rowArray = this.data[row]
            for (let col = 0; col < this.width; col++) {
                const index = row * this.width + col
                imageDataArray[index * 4 + 3] = rowArray[col] ? 255 : 0
                imageDataArray[index * 4] = r
                imageDataArray[index * 4 + 1] = g
                imageDataArray[index * 4 + 2] = b
            }
        }
        return new ImageData(imageDataArray, this.width, this.height)
    }
    public stroke(radius: number) {
        const ctx = (new OffscreenCanvas(this.width, this.height)).getContext("2d") as OffscreenCanvasRenderingContext2D
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.data[row][col]) {
                    ctx.beginPath();
                    ctx.arc(col, row, radius, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }
        const imageData = ctx.getImageData(0, 0, this.width, this.height)
        this.data = BitMatrix.imageDataToBitMatrix(imageData)
        return this
    }
    static round3Matrix: Array<number[]> = [
        [-1, -1], [+0, -1], [+1, -1],
        [-1, +0], [+0, +0], [+1, +0],
        [-1, +1], [+0, +1], [+1, +1],
    ]
    static round5Matrix: Array<number[]> = [
        [+0, -3],
        [-1, -2], [+0, -2], [+1, -2],
        [-2, -1], [-1, -1], [+0, -1], [+1, -1], [+2, -1],
        [-3, +0], [-2, +0], [-1, +0], [+0, +0], [+1, +0], [+2, +0], [+3, +0],
        [-2, +1], [-1, +1], [+0, +1], [+1, +1], [+2, +1],
        [-1, +2], [+0, +2], [+1, +2],
        [+0, +3],
    ]
    public sumAround(x: number, y: number, matrix: Array<number[]>) {
        let sum = 0
        for (const offset of matrix) {
            if (this.data[y + offset[1]] && this.data[y + offset[1]][x + offset[0]]) sum += 1
        }
        return sum
    }
    public smooth5() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                // per pixel process
                if (this.data[row][col]) {
                    const sum5 = this.sumAround(col, row, BitMatrix.round5Matrix)
                    if (sum5 <= 6) this.data[row][col] = false
                }
                else {
                    const sum5 = this.sumAround(col, row, BitMatrix.round5Matrix)
                    if (sum5 >= 13) this.data[row][col] = true
                }

            }
        }
        // reverse
        for (let row = this.height - 1; row >= 0; row--) {
            for (let col = this.width - 1; col >= 0; col--) {
                if (this.data[row][col]) {
                    const sum5 = this.sumAround(col, row, BitMatrix.round5Matrix)
                    if (sum5 <= 6) this.data[row][col] = false
                }
                else {
                    const sum5 = this.sumAround(col, row, BitMatrix.round5Matrix)
                    if (sum5 >= 13) this.data[row][col] = true
                }

            }
        }
        return this
    }
    public smooth3() {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                // per pixel process
                if (this.data[row][col]) {
                    const sum3 = this.sumAround(col, row, BitMatrix.round3Matrix)
                    if (sum3 <= 3) this.data[row][col] = false
                }
                else {
                    const sum3 = this.sumAround(col, row, BitMatrix.round3Matrix)
                    if (sum3 >= 5) this.data[row][col] = true
                }

            }
        }
        // reverse
        for (let row = this.height - 1; row >= 0; row--) {
            for (let col = this.width - 1; col >= 0; col--) {
                if (this.data[row][col]) {
                    const sum3 = this.sumAround(col, row, BitMatrix.round3Matrix)
                    if (sum3 <= 3) this.data[row][col] = false
                }
                else {
                    const sum3 = this.sumAround(col, row, BitMatrix.round3Matrix)
                    if (sum3 >= 5) this.data[row][col] = true
                }

            }
        }
        return this
    }
}