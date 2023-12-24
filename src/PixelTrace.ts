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

type Delta = (-1 | 0 | 1)

const round3Matrix: Array<Delta[]> = [
    [-1, -1], [+0, -1], [+1, -1],
    [-1, +0], [+0, +0], [+1, +0],
    [-1, +1], [+0, +1], [+1, +1],
]

const clockwiseDeltas: Array<Delta[]> = [
    [+0, -1], [+1, -1], [+1, +0], [+1, +1], [+0, +1], [-1, +1], [-1, +0], [-1, -1],
]

function getClockwiseIndex(dx: Delta, dy: Delta) {
    switch (dx) {
        case +0: switch (dy) {
            case +0: return 0 // problem
            case +1: return 4
            case -1: return 0
        }
        case +1: switch (dy) {
            case +0: return 2
            case +1: return 3
            case -1: return 1
        }
        case -1: switch (dy) {
            case +0: return 6
            case +1: return 5
            case -1: return 7
        }
    }
}

function checkValue(data: Array<boolean[]>, x: number, y: number): boolean {
    return (data[y] && data[y][x])
}

function sumAround(data: Array<boolean[]>, x: number, y: number): number {
    let sum = 0
    for (const offset of round3Matrix) {
        if (checkValue(data, x + offset[0], y + offset[1])) sum += 1
    }
    return sum
}

function getNextDelta(data: Array<boolean[]>, x: number, y: number, dPrevX: Delta, dPrevY: Delta): Delta[] {
    let prevIndex = getClockwiseIndex(dPrevX, dPrevY)
    for (let index = prevIndex + 1; index < clockwiseDeltas.length + prevIndex + 1; index++) {
        const checkDelta = clockwiseDeltas[index % clockwiseDeltas.length];
        if (checkValue(data, x + checkDelta[0], y + checkDelta[1])) return checkDelta
    }
    return clockwiseDeltas[prevIndex]
}

export function tracePath(data: Array<boolean[]>, startPoint?: number[], smoothRatio = 6) {

    // 1st loop, generate a TraceRawVertex array for later processing
    interface TraceRawVertex {
        x: number,
        y: number,
        sum: number
    }
    const rawVertexList: TraceRawVertex[] = []
    let starting = startPoint || getStart(data), // starting point 
        x = starting[0],
        y = starting[1],
        dx: Delta = 0,
        dy: Delta = -1,
        dPrevX: Delta = 0,  // because search performs diagonally top-right to bottom-left
        dPrevY: Delta = -1; // so we do initial check clockwise starting at top-right
    [dx, dy] = getNextDelta(data, x, y, dPrevX, dPrevY)

    do {
        // proceed to next dot
        dPrevX = -dx as Delta // dammit typescript
        dPrevY = -dy as Delta
        x += dx;
        y += dy;
        // calc next delta
        [dx, dy] = getNextDelta(data, x, y, dPrevX, dPrevY)


        // calc current surrounding sums
        const sum = sumAround(data, x, y)
        rawVertexList.push({ x, y, sum })
    } while (starting[0] != x || starting[1] != y)

    // 2nd loop, generate actual path Vertex array
    // [x, y]
    const smoothVertexList: number[][] = []
    let distance: number = smoothRatio + 1
    // track previous surrounding sum for smoothing
    let prevSum: number = 6
    const rawLength = rawVertexList.length
    function pushVertex(data: number[]) {
        if (distance > smoothRatio) {
            smoothVertexList.push(data)
            distance = 0
        }
    }
    // giving index an initial value for looped array ref
    for (let index = rawLength; index < rawLength * 2 - smoothRatio; index++) {
        const { x, y, sum } = rawVertexList[index % rawLength];
        const nextSum = rawVertexList[(index + 1) % rawLength].sum
        distance += 1
        switch (sum) {
            case 6:
                break;
            case 5:
                if ((prevSum == 6 && nextSum == 7) || (prevSum == 7 && nextSum == 6)) pushVertex([x, y]);
                break;
            case 7:
                if ((prevSum == 6 || prevSum == 7) && (nextSum == 6 || nextSum == 7)) pushVertex([x, y]);
                break;
            default:
                pushVertex([x, y]);
                break;
        }
        prevSum = sum
    }

    // 3rd loop, generate Vertex array with bezier CPs
    interface TraceBezierVertex {
        x: number,
        y: number,
        prevCPX: number,
        prevCPY: number,
        nextCPX: number,
        nextCPY: number
    }
    const bezierPointList: TraceBezierVertex[] = []
    const smoothLength = smoothVertexList.length
    for (let index = smoothLength; index < smoothLength * 2; index++) {
        const [x, y] = smoothVertexList[index % smoothLength];
        const [prevX, prevY] = smoothVertexList[(index - 1) % smoothLength];
        const [nextX, nextY] = smoothVertexList[(index + 1) % smoothLength];
        const [prevCPX, prevCPY, nextCPX, nextCPY] = calcBezierControlPoint(x, y, prevX, prevY, nextX, nextY, 0.36)
        bezierPointList.push({ x, y, prevCPX, prevCPY, nextCPX, nextCPY })
    }

    // 4th loop, generate final bezier directives
    interface TraceBezierDirective {
        cp1x: number,
        cp1y: number,
        cp2x: number,
        cp2y: number,
        x: number,
        y: number
    }
    const smoothBezierList: TraceBezierDirective[] = []
    for (let index = smoothLength + 1; index < smoothLength * 2 + 1; index++) {
        const { x, y, prevCPX, prevCPY } = bezierPointList[index % smoothLength];
        const { nextCPX, nextCPY } = bezierPointList[(index - 1) % smoothLength];
        smoothBezierList.push({ cp1x: nextCPX, cp1y: nextCPY, cp2x: prevCPX, cp2y: prevCPY, x, y })
    }
    const initialPoint = [bezierPointList[0].x, bezierPointList[0].y]
    return { start: initialPoint, path: smoothBezierList };
};

function getStart(data: Array<boolean[]>) {
    var x = 0,
        y = 0;
    // search for a starting point; begin at origin 
    // and proceed along outward-expanding diagonals 
    while (true) {
        if (data[y][x]) {
            return [x, y];
        }
        if (x === 0) {
            x = y + 1;
            y = 0;
        } else {
            x = x - 1;
            y = y + 1;
        }
    }
}

function calcBezierControlPoint(x: number, y: number, prevX: number, prevY: number, nextX: number, nextY: number, ratio: number = 0.5) {
    const deltaX = nextX - prevX
    const deltaY = nextY - prevY
    let interX = 1,
        interY = 1
    // let ratioPrev = 1,
    //     ratioNext = 1
    if (deltaX == 0) { // vertical
        interX = prevX
        interY = y
    }
    else if (deltaY == 0) {
        interX = x
        interY = prevY
    }
    else {
        const k = (nextY - prevY) / (nextX - prevX);
        const b = prevY - k * prevX;
        const k2 = -1 / k;
        const b2 = y - k2 * x;
        interX = (b2 - b) / (k - k2);  // k2x+b2=kx+b
        interY = k * interX + b;
    }

    let deltaCP1X = (prevX - interX) * ratio
    let deltaCP1Y = (prevY - interY) * ratio
    let deltaCP2X = (nextX - interX) * ratio
    let deltaCP2Y = (nextY - interY) * ratio

    // what if they're on the same side?
    if (deltaCP1X > 0 && deltaCP2X > 0) {
        if (deltaCP1X < deltaCP2X) {
            deltaCP1X *= -1
            deltaCP1Y *= -1
        }
        else {
            deltaCP2X *= -1
            deltaCP2Y *= -1
        }
    }
    else if (deltaCP1X < 0 && deltaCP2X < 0) {
        if (deltaCP1X > deltaCP2X) {
            deltaCP1X *= -1
            deltaCP1Y *= -1
        }
        else {
            deltaCP2X *= -1
            deltaCP2Y *= -1
        }
    }
    return [x + deltaCP1X, y + deltaCP1Y, x + deltaCP2X, y + deltaCP2Y]
}

