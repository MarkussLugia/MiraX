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

interface ConfigObject {
    startAlpha?: number,
    startBeta?: number,
    startGamma?: number,
    autoCorrection?: boolean,
    respondRange?: number,
    correctionRange?: number
}
interface TempObject {
    firstEventSkip: boolean,
    initialized: boolean,
    baseAlpha: number | null,
    baseBeta: number | null,
    baseGamma: number | null,
    alphaRatio: number,
    betaRatio: number,
    gammaRatio: number
}
interface OrientationListener {
    (alphaRatio: number, betaRatio: number, gammaRatio: number): void
}


export default class OrientationUpdater {
    config = {
        // 响应的角度范围
        respondRange: 80,
        // 自动校正基准的最小角度
        autoCorrection: true,
        autoCorrRange: 100
    }
    temp: TempObject = {
        // 第一次事件会传回0值，跳过
        firstEventSkip: false,
        initialized: false,
        baseAlpha: null,
        baseBeta: null,
        baseGamma: null,
        alphaRatio: 0,
        betaRatio: 0,
        gammaRatio: 0
    }
    listeners: OrientationListener[] = []

    constructor(config?: ConfigObject) {
        if (config) {
            Object.assign(this.config, config)
            if (typeof config.startAlpha == "number") this.temp.baseAlpha = config.startAlpha
            if (typeof config.startBeta == "number") this.temp.baseBeta = config.startBeta
            if (typeof config.startGamma == "number") this.temp.baseGamma = config.startGamma
        }
        window.addEventListener("deviceorientation", event => {
            if (!this.temp.firstEventSkip) {
                this.temp.firstEventSkip = true
                return
            }
            if (!this.temp.initialized) this.initBase(event)
            this.handleOrientation(event)
            if (!this.temp.initialized) this.temp.initialized = true
        })
    }
    static calcDelta(base: number, current: number, max: number): number {
        let result = current - base
        if (result > max / 2) result -= max
        else if (result < -max / 2) result += max
        return result
    }
    initBase(event: DeviceOrientationEvent) {
        const { alpha, beta, gamma } = event
        console.log("init", alpha, beta, gamma);
        if (this.temp.baseAlpha == null) this.temp.baseAlpha = typeof alpha == "number" ? alpha : 0
        if (this.temp.baseBeta == null) this.temp.baseBeta = (typeof beta == "number" ? beta : 0) + 180
        if (this.temp.baseGamma == null) this.temp.baseGamma = (typeof gamma == "number" ? gamma : 0) + 90
    }
    static calcNormalize(delta: number, radius: number) {
        if (delta > radius) return 1
        if (delta < -radius) return -1
        return 0
    }
    static calcNormalizeCorr(delta: number, radius: number, corr: number) {
        let result = [0, 0]
        if (delta > radius) {
            result[0] = 1
            if (delta > corr) result[1] = delta - corr
        }
        if (delta < -radius) {
            result[0] = -1
            if (delta > corr) result[1] = -corr - delta
        }
        return result
    }
    handleOrientation(event: DeviceOrientationEvent) {
        const { alpha, beta, gamma } = event
        let deltaAlpha = OrientationUpdater.calcDelta(<number>this.temp.baseAlpha, <number>alpha, 360)
        let deltaBeta = OrientationUpdater.calcDelta(<number>this.temp.baseBeta, <number>beta + 180, 360)
        let deltaGamma = OrientationUpdater.calcDelta(<number>this.temp.baseGamma, <number>gamma + 90, 180)
        let [normAlpha, normBeta, normGamma] = [deltaAlpha, deltaBeta, deltaGamma]
        const radius = this.config.respondRange / 2
        if (this.config.autoCorrection) {
            const corr = this.config.autoCorrRange / 2
            let corrAlpha = OrientationUpdater.calcNormalizeCorr(deltaAlpha, radius, corr)
            if (corrAlpha[0] != 0) {
                normAlpha = radius * corrAlpha[0]
                this.temp.baseAlpha = <number>this.temp.baseAlpha + corrAlpha[1]
            }
            let corrBeta = OrientationUpdater.calcNormalizeCorr(deltaBeta, radius, corr)
            if (corrBeta[0] != 0) {
                normBeta = radius * corrBeta[0]
                this.temp.baseBeta = <number>this.temp.baseBeta + corrBeta[1]
            }
            let corrGamma = OrientationUpdater.calcNormalizeCorr(deltaGamma, radius, corr)
            if (corrGamma[0] != 0) {
                normGamma = radius * corrGamma[0]
                this.temp.baseGamma = <number>this.temp.baseGamma + corrGamma[1]
            }
        } else {
            let corrAlpha = OrientationUpdater.calcNormalize(deltaAlpha, radius)
            if (corrAlpha != 0) normAlpha = radius * corrAlpha
            let corrBeta = OrientationUpdater.calcNormalize(deltaBeta, radius)
            if (corrBeta != 0) normBeta = radius * corrBeta
            let corrGamma = OrientationUpdater.calcNormalize(deltaGamma, radius)
            if (corrGamma != 0) normGamma = radius * corrGamma
        }
        let [alphaRatio, betaRatio, gammaRatio] = [normAlpha / radius, normBeta / radius, normGamma / radius]
        Object.assign(this.temp, { alphaRatio, betaRatio, gammaRatio })
        this.listeners.forEach(listener => listener(alphaRatio, betaRatio, gammaRatio))
    }
    addListener(listener: OrientationListener) {
        this.listeners.push(listener)
        if (this.temp.initialized) listener(this.temp.alphaRatio, this.temp.betaRatio, this.temp.gammaRatio)
    }
}