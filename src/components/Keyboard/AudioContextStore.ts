import * as Tone from "tone";

class AudioContextStore {
  private static instance: AudioContextStore;
  public readonly audioSourceNode: Tone.MonoSynth;
  public readonly analyserNode: Tone.Analyser;
  public readonly reverbNode: Tone.Reverb;

  private constructor() {
    this.analyserNode = new Tone.Analyser("waveform");
    this.analyserNode.smoothing = 1;

    this.reverbNode = new Tone.Reverb({
      decay: 4,
      wet: 0.25,
      preDelay: 0.2,
    });

    this.audioSourceNode = new Tone.MonoSynth({
      oscillator: {
        type: "fatsine",
        count: 3,
      },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0.5,
        release: 0.1,
        attackCurve: "exponential",
      },
    });
    this.audioSourceNode.connect(this.reverbNode);
    this.audioSourceNode.connect(this.analyserNode);
    this.reverbNode.connect(Tone.getDestination());
    Tone.getDestination().volume.value = 0.166;
  }

  static getInstance(): AudioContextStore {
    if (!AudioContextStore.instance) {
      AudioContextStore.instance = new AudioContextStore();
    }
    return AudioContextStore.instance;
  }
}

export const audioContextStore = AudioContextStore.getInstance();
