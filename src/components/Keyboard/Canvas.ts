import p5 from "p5";
import { audioContextStore } from "@src/components/Keyboard/AudioContextStore";
import { rootMeanSquared } from "@src/utils/MathUtil";

class Canvas extends HTMLElement {
  private audioAmplitudes: Float32Array;

  constructor() {
    super();
    this.audioAmplitudes = new Float32Array(
      audioContextStore.analyserNode.fftSize,
    );
  }
  connectedCallback() {
    this.createP5Sketch();
  }
  createP5Sketch() {
    const sketch = (p: p5) => {
      p.setup = () => {
        const container = this.querySelector(".p5-container") as HTMLDivElement;
        p.createCanvas(container.offsetWidth, container.offsetHeight).parent(
          container,
        );
      };

      p.draw = () => {
        audioContextStore.analyserNode.getFloatTimeDomainData(
          this.audioAmplitudes,
        );
        p.clear();

        p.beginShape();
        drawWaveform(p, this.audioAmplitudes);
        drawCircle(p, this.audioAmplitudes);
        p.endShape();
      };

      p.windowResized = () => {
        const container = this.querySelector(".p5-container") as HTMLDivElement;
        p.resizeCanvas(container.offsetWidth, container.offsetHeight);
      };
    };

    const container = this.querySelector(".p5-container") as HTMLDivElement;
    new p5(sketch, container);
  }
}

const drawWaveform = (p: p5, data: Float32Array) => {
  for (let i = 0; i < data.length; i++) {
    const amplitude = data[i];
    const x = p.map(i, 0, data.length - 1, 0, p.width);
    const y = p.map(
      amplitude,
      -1,
      1,
      p.height / 2 - p.height / 4,
      p.height / 2 + p.height / 4,
    );
    p.vertex(x, y);
  }
};

const drawCircle = (p: p5, data: Float32Array) => {
  const dim = p.min(p.width, p.height);
  const rms = rootMeanSquared(data);
  const scale = 4;
  const size = rms * scale * dim;
  p.circle(p.width / 2, p.height / 2, size);
};

customElements.define("p5-canvas", Canvas);
