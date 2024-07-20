import p5 from "p5";
import { audioContextStore } from "./AudioContextStore";

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
        for (let i = 0; i < this.audioAmplitudes.length; i++) {
          const amplitude = this.audioAmplitudes[i];
          const x = p.map(i, 0, this.audioAmplitudes.length - 1, 0, p.width);
          const y = p.map(
            amplitude,
            -1,
            1,
            p.height / 2 - p.height / 4,
            p.height / 2 + p.height / 4,
          );
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
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

customElements.define("p5-canvas", Canvas);
