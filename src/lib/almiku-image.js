"use strict";

// Reemplazo liviano de "sharp" basado en @napi-rs/canvas.
// sharp no tiene binarios precompilados para Android/ARM (Termux), así que
// este módulo implementa el subconjunto que usa el bot: resize, jpeg, png,
// webp, gif, metadata y toBuffer.

const fs = require("fs");
const { loadImage, createCanvas } = require("@napi-rs/canvas");

function toBuffer(input) {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input);
  if (typeof input === "string") return fs.readFileSync(input);
  throw new Error("Entrada de imagen no válida");
}

function colorToCss(background, formato) {
  if (background && typeof background === "object") {
    const { r = 0, g = 0, b = 0, alpha = 1 } = background;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return formato === "jpeg" ? "#ffffff" : null;
}

class ImagePipeline {
  constructor(input, options = {}) {
    this.input = input;
    this.options = options || {};
    this._resize = null;
    this._formato = null;
    this._calidad = 80;
  }

  resize(width, height, opts = {}) {
    const ancho = typeof width === "object" ? width.width : width;
    const alto = typeof width === "object" ? width.height : height;
    this._resize = {
      width: ancho || alto,
      height: alto || ancho,
      fit: (opts && opts.fit) || "cover",
      background: (opts && opts.background) || null,
    };
    return this;
  }

  jpeg(opts = {}) {
    this._formato = "jpeg";
    if (opts && opts.quality) this._calidad = opts.quality;
    return this;
  }

  png() {
    this._formato = "png";
    return this;
  }

  webp(opts = {}) {
    this._formato = "webp";
    if (opts && opts.quality) this._calidad = opts.quality;
    return this;
  }

  // Un gif animado se entrega como su primer fotograma
  gif() {
    this._formato = "png";
    return this;
  }

  async metadata() {
    const imagen = await loadImage(toBuffer(this.input));
    return { width: imagen.width, height: imagen.height, format: null };
  }

  async toBuffer() {
    const imagen = await loadImage(toBuffer(this.input));
    const formato = this._formato || "png";

    let ancho = imagen.width;
    let alto = imagen.height;
    let fit = "fill";
    let fondo = null;

    if (this._resize) {
      ancho = Math.max(1, Math.round(this._resize.width || imagen.width));
      alto = Math.max(1, Math.round(this._resize.height || imagen.height));
      fit = this._resize.fit;
      fondo = this._resize.background;
    }

    const canvas = createCanvas(ancho, alto);
    const ctx = canvas.getContext("2d");

    const color = colorToCss(fondo, formato);
    if (color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, ancho, alto);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (fit === "contain" || fit === "cover") {
      const escala =
        fit === "contain"
          ? Math.min(ancho / imagen.width, alto / imagen.height)
          : Math.max(ancho / imagen.width, alto / imagen.height);
      const dibujoAncho = imagen.width * escala;
      const dibujoAlto = imagen.height * escala;
      ctx.drawImage(
        imagen,
        (ancho - dibujoAncho) / 2,
        (alto - dibujoAlto) / 2,
        dibujoAncho,
        dibujoAlto,
      );
    } else {
      ctx.drawImage(imagen, 0, 0, ancho, alto);
    }

    const tipo = formato === "jpeg" ? "jpeg" : formato === "webp" ? "webp" : "png";
    return canvas.encode(tipo, this._calidad);
  }
}

function image(input, options) {
  return new ImagePipeline(input, options);
}

// Miniaturas de los menús (300x170 para ubicaciones, 300x300 para el resto)
image.thumbnail = function thumbnail(source, width = 300, height = 300) {
  return new ImagePipeline(source).resize(width, height, { fit: "cover" }).jpeg({ quality: 85 }).toBuffer();
};

// Sticker cuadrado que se usa como cita falsa en algunos menús
image.sticker = function sticker(source, size = 512) {
  return new ImagePipeline(source).resize(size, size, { fit: "cover" }).webp({ quality: 90 }).toBuffer();
};

image.default = image;
module.exports = image;
