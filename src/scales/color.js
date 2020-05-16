import { scaleService, helpers } from 'chart.js';
import {
  interpolateBlues,
  interpolateBrBG,
  interpolateBuGn,
  interpolateBuPu,
  interpolateCividis,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOrRd,
  interpolateOranges,
  interpolatePRGn,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRainbow,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSinebow,
  interpolateSpectral,
  interpolateTurbo,
  interpolateViridis,
  interpolateWarm,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd,
} from 'd3-scale-chromatic';
import { baseDefaults, baseMixin, patchOptions } from './base';

const lookup = {
  interpolateBlues,
  interpolateBrBG,
  interpolateBuGn,
  interpolateBuPu,
  interpolateCividis,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOrRd,
  interpolateOranges,
  interpolatePRGn,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRainbow,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSinebow,
  interpolateSpectral,
  interpolateTurbo,
  interpolateViridis,
  interpolateWarm,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd,
};

Object.keys(lookup).forEach((key) => {
  lookup[`${key.charAt(11).toLowerCase()}${key.slice(12)}`] = lookup[key];
  lookup[key.slice(11)] = lookup[key];
});

function quantize(v, steps) {
  const perStep = 1 / steps;
  if (v <= perStep) {
    return 0;
  }
  if (v >= 1 - perStep) {
    return 1;
  }
  for (let acc = 0; acc < 1; acc += perStep) {
    if (v < acc) {
      return acc - perStep / 2; // center
    }
  }
  return v;
}

export class ColorScale extends scaleService.getScaleConstructor('linear') {
  constructor(cfg) {
    super(patchOptions(cfg));
    if (typeof this.options.interpolate === 'string' && typeof lookup[this.options.interpolate] === 'function') {
      this.interpolate = lookup[this.options.interpolate];
    } else {
      this.interpolate = this.options.interpolate;
    }
  }
  parse(raw, index) {
    if (raw && typeof raw[this.options.property] === 'number') {
      return raw[this.options.property];
    }
    return super.parse(raw, index);
  }
  getColorForValue(value) {
    const v = this._getNormalizedValue(value);
    if (v == null || Number.isNaN(v)) {
      return this.options.missing;
    }
    return this.getColor(v);
  }
  getColor(normalized) {
    let v = normalized;
    if (this.options.quantize > 0) {
      v = quantize(v, this.options.quantize);
    }
    return this.interpolate(v);
  }

  update(maxWidth, maxHeight, margins) {
    this.updateImpl(maxWidth, maxHeight, margins, (w, h, m) => super.update(w, h, m));
  }

  draw(chartArea) {
    this.drawImpl(chartArea, (chartArea) => super.draw(chartArea));
  }

  _drawIndicator() {
    /** @type {CanvasRenderingContext2D} */
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const indicatorSize = this.options.legend.indicatorWidth;
    const reverse = this._reversePixels;

    if (this.isHorizontal()) {
      if (this.options.quantize > 0) {
        const stepWidth = w / this.options.quantize;
        const offset = !reverse ? (i) => i : (i) => w - stepWidth - i;
        for (let i = 0; i < w; i += stepWidth) {
          const v = (i + stepWidth / 2) / w;
          ctx.fillStyle = this.getColor(v);
          ctx.fillRect(offset(i), 0, stepWidth, indicatorSize);
        }
      } else {
        const offset = !reverse ? (i) => i : (i) => w - 1 - i;
        for (let i = 0; i < w; ++i) {
          ctx.fillStyle = this.getColor((i + 0.5) / w);
          ctx.fillRect(offset(i), 0, 1, indicatorSize);
        }
      }
    } else if (this.options.quantize > 0) {
      const stepWidth = h / this.options.quantize;
      const offset = !reverse ? (i) => i : (i) => h - stepWidth - i;
      for (let i = 0; i < h; i += stepWidth) {
        const v = (i + stepWidth / 2) / h;
        ctx.fillStyle = this.getColor(v);
        ctx.fillRect(0, offset(i), indicatorSize, stepWidth);
      }
    } else {
      const offset = !reverse ? (i) => i : (i) => h - 1 - i;
      for (let i = 0; i < h; ++i) {
        ctx.fillStyle = this.getColor((i + 0.5) / h);
        ctx.fillRect(0, offset(i), indicatorSize, 1);
      }
    }
  }
}
Object.assign(ColorScale.prototype, baseMixin);

ColorScale.id = 'color';
ColorScale.defaults = helpers.merge({}, [
  scaleService.getScaleDefaults('linear'),
  baseDefaults,
  {
    interpolate: 'blues',
    missing: 'transparent',
    quantize: 0,
  },
]);
ColorScale.register = () => {
  scaleService.registerScale(ColorScale);
  return ColorScale;
};
// export const ColorScaleLogarithmic = createScale(Chart.scaleService.getScaleConstructor('logarithmic'));

// scaleService.registerScaleType(
//   'colorLogarithmic',
//   ColorScaleLogarithmic,
//   Chart.helpers.merge({}, [Chart.scaleService.getScaleDefaults('logarithmic'), baseDefaults, defaults])
// );
