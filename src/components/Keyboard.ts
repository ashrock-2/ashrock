class Keyboard extends HTMLElement {
  private audioContext = new AudioContext();
  private audioSourceNodes: Map<number, OscillatorNode> = new Map();
  private masterGainNode: GainNode;

  constructor() {
    super();

    this.masterGainNode = new GainNode(this.audioContext);
    this.masterGainNode.connect(this.audioContext.destination);

    const buttons = this.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        const target = event.target as HTMLButtonElement;
        const { freq } = target.dataset;
        this.playNode(Number(freq));
      });
      button.addEventListener("pointerup", (event) => {
        const target = event.target as HTMLButtonElement;
        const { freq } = target.dataset;
        this.stopNode(Number(freq));
      });
      button.addEventListener("pointerleave", (event) => {
        const target = event.target as HTMLButtonElement;
        const { freq } = target.dataset;
        this.stopNode(Number(freq));
      });
    });
  }

  private playNode = (freq: number) => {
    const audioNode = new OscillatorNode(this.audioContext, {
      type: "square",
      frequency: freq,
    });
    this.audioSourceNodes.set(freq, audioNode);
    audioNode.connect(this.masterGainNode);
    audioNode.start(0);
  };
  private stopNode = (freq: number) => {
    this.audioSourceNodes.get(freq)?.stop(0);
    this.audioSourceNodes.delete(freq);
  };
}

customElements.define("key-board", Keyboard);
