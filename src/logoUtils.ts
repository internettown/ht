import type { LogoConfig } from './types';

export function getShapePath(shape: string, size: number): string {
  const s = size;
  const h = s / 2;
  switch (shape) {
    case 'circle':
      return '';
    case 'square':
      return `M0,0 L${s},0 L${s},${s} L0,${s} Z`;
    case 'diamond':
      return `M${h},0 L${s},${h} L${h},${s} L0,${h} Z`;
    case 'triangle':
      return `M${h},0 L${s},${s} L0,${s} Z`;
    case 'hexagon': {
      const a = s * 0.25;
      return `M${a},0 L${s - a},0 L${s},${h} L${s - a},${s} L${a},${s} L0,${h} Z`;
    }
    case 'star': {
      const cx = h, cy = h;
      const outer = h, inner = h * 0.38;
      let d = '';
      for (let i = 0; i < 5; i++) {
        const oAngle = (Math.PI / 2) * -1 + (2 * Math.PI * i) / 5;
        const iAngle = oAngle + Math.PI / 5;
        const ox = cx + outer * Math.cos(oAngle);
        const oy = cy + outer * Math.sin(oAngle);
        const ix = cx + inner * Math.cos(iAngle);
        const iy = cy + inner * Math.sin(iAngle);
        d += i === 0 ? `M${ox},${oy}` : `L${ox},${oy}`;
        d += `L${ix},${iy}`;
      }
      return d + 'Z';
    }
    case 'shield':
      return `M${h},0 L${s},${s * 0.15} L${s},${s * 0.6} L${h},${s} L0,${s * 0.6} L0,${s * 0.15} Z`;
    case 'rounded':
      return '';
    default:
      return '';
  }
}

export function logoConfigToSvg(config: LogoConfig, size = 128): string {
  const shape = config.shape;
  const isCircle = shape === 'circle';
  const isRounded = shape === 'rounded';
  const path = getShapePath(shape, size);
  const borderW = config.borderWidth === 'none' ? 0 : parseInt(config.borderWidth);
  const innerSize = size - borderW * 2;
  const clipId = 'logo-clip';

  let clipContent = '';
  if (isCircle) {
    clipContent = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/>`;
  } else if (isRounded) {
    clipContent = `<rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.2}"/>`;
  } else {
    clipContent = `<path d="${path}"/>`;
  }

  let borderContent = '';
  if (borderW > 0) {
    if (isCircle) {
      borderContent = `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${config.borderColor}"/>`;
    } else if (isRounded) {
      borderContent = `<rect x="0" y="0" width="${size}" height="${size}" rx="${size * 0.2}" fill="${config.borderColor}"/>`;
    } else {
      borderContent = `<path d="${path}" fill="${config.borderColor}"/>`;
    }
  }

  let iconContent = '';
  if (config.iconChar) {
    iconContent = `<text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" fill="${config.iconColor}" font-size="${config.iconSize}" style="transform:rotate(-${config.rotation}deg);transform-origin:center">${config.iconChar}</text>`;
  }

  let textContent = '';
  if (config.showText && config.text) {
    textContent = `<text x="${size / 2}" y="${size * 0.82}" text-anchor="middle" dominant-baseline="central" fill="${config.textColor}" font-size="${size * 0.13}" font-weight="bold" font-family="sans-serif" style="transform:rotate(-${config.rotation}deg);transform-origin:center">${config.text.slice(0, 6)}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(${config.rotation}deg)"><defs><clipPath id="${clipId}">${clipContent}</clipPath></defs>${borderContent}<g clip-path="url(#${clipId})"><rect x="${borderW}" y="${borderW}" width="${innerSize}" height="${innerSize}" fill="${config.bgColor}"/></g>${iconContent}${textContent}</svg>`;
}
