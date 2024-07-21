class AudioContextStore {
  private static instance: AudioContextStore;
  public readonly audioContext = new AudioContext();
  public readonly audioSourceNodes: Map<number, OscillatorNode> = new Map();
  public readonly masterGainNode: GainNode;
  public readonly analyserNode: AnalyserNode;

  private constructor() {
    this.masterGainNode = new GainNode(this.audioContext);
    this.analyserNode = new AnalyserNode(this.audioContext);
    this.analyserNode.smoothingTimeConstant = 1;
    this.masterGainNode.gain.value = 0.166;
    this.masterGainNode.connect(this.analyserNode);
    this.masterGainNode.connect(this.audioContext.destination);
  }

  static getInstance(): AudioContextStore {
    if (!AudioContextStore.instance) {
      AudioContextStore.instance = new AudioContextStore();
    }
    return AudioContextStore.instance;
  }
}

export const audioContextStore = AudioContextStore.getInstance();
