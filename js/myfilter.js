PIXI.filters.MyFilter = class MyFilter extends PIXI.Filter {
  constructor(tex) {
    var fragmentSrc = `
#define R_LUMINANCE 0.298912
#define G_LUMINANCE 0.586611
#define B_LUMINANCE 0.114478

precision mediump float;
varying vec2 vTextureCoord;
varying vec2 vFilterCoord;
uniform sampler2D uSampler;
uniform sampler2D uTex;

const vec3 monochromeScale = vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE);

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);
  float grayColor = dot(color.rgb, monochromeScale);

  vec4 color2 = texture2D(uTex, vec2(grayColor, 0.5));
  gl_FragColor = color2;
}
    `;

    super(null, fragmentSrc);
    this.matrix = new PIXI.Matrix();
    this.uniforms.uTex = tex;
  }
};