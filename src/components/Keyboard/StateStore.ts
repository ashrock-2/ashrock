import type { Note, Octave, Scale } from "../../utils/MusicConstants";

class StateStore extends EventTarget {
  private static instance: StateStore;
  private _octave: Octave = 4;
  private _scale: Scale = "Major";
  private _keyNote: Note = "C";

  private constructor() {
    super();
  }

  static getInstance(): StateStore {
    if (!StateStore.instance) {
      StateStore.instance = new StateStore();
    }
    return StateStore.instance;
  }

  get octave() {
    return this._octave;
  }

  set octave(value: Octave) {
    this._octave = value;
    this.dispatchEvent(new Event("stateChange"));
  }

  get scale() {
    return this._scale;
  }

  set scale(value: Scale) {
    this._scale = value;
    this.dispatchEvent(new Event("stateChange"));
  }

  get keyNote() {
    return this._keyNote;
  }

  set keyNote(value: Note) {
    this._keyNote = value;
    this.dispatchEvent(new Event("stateChange"));
  }
}

export const stateStore = StateStore.getInstance();
