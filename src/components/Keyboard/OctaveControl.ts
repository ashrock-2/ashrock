import { match } from "ts-pattern";
import { stateStore } from "@src/components/Keyboard/StateStore";
import { notes, scales } from "@src/utils/MusicConstants";
import { audioContextStore } from "./AudioContextStore";
import type { OmniOscillatorType } from "tone/build/esm/source/oscillator/OscillatorInterface";

class OctaveControl extends HTMLElement {
  constructor() {
    super();
    this.render();
    const incrementButton = this.querySelector(".increment");
    const decrementButton = this.querySelector(".decrement");

    incrementButton?.addEventListener("click", this.increaseOctave);
    decrementButton?.addEventListener("click", this.decreaseOctave);

    window.addEventListener("keydown", (event) => {
      match(event.code)
        .with("KeyU", this.decreaseOctave)
        .with("KeyI", this.increaseOctave)
        .with("KeyT", this.decreaseScale)
        .with("KeyY", this.increaseScale)
        .with("KeyO", this.decreaseKeyNote)
        .with("KeyP", this.increaseKeyNote)
        .with("KeyR", this.randomOscillator)
        .otherwise(() => {});
    });
    stateStore.addEventListener("stateChange", this.render.bind(this));
  }

  render() {
    const dom = this.querySelector(".octave-display");
    if (!dom) {
      return;
    }
    dom.textContent = `Octave: ${stateStore.octave}`;
  }

  private increaseOctave = () => {
    if (stateStore.octave < 6) {
      stateStore.octave += 1;
    }
  };
  private decreaseOctave = () => {
    if (stateStore.octave > 2) {
      stateStore.octave -= 1;
    }
  };
  private increaseKeyNote = () => {
    const currentKeyNoteIdx = notes.findIndex(
      (note) => note === stateStore.keyNote,
    );
    const nextKeyNoteIdx =
      currentKeyNoteIdx === notes.length ? 0 : currentKeyNoteIdx + 1;

    stateStore.keyNote = notes[nextKeyNoteIdx];
  };
  private decreaseKeyNote = () => {
    const currentKeyNoteIdx = notes.findIndex(
      (note) => note === stateStore.keyNote,
    );
    const nextKeyNoteIdx =
      currentKeyNoteIdx === 0 ? notes.length - 1 : currentKeyNoteIdx - 1;
    stateStore.keyNote = notes[nextKeyNoteIdx];
  };
  private increaseScale = () => {
    const currentScaleIdx = scales.findIndex(
      (scale) => scale === stateStore.scale,
    );
    const nextScaleIdx =
      currentScaleIdx === scales.length ? 0 : currentScaleIdx + 1;
    stateStore.scale = scales[nextScaleIdx];
  };
  private decreaseScale = () => {
    const currentScaleIdx = scales.findIndex(
      (scale) => scale === stateStore.scale,
    );
    const nextScaleIdx =
      currentScaleIdx === 0 ? scales.length - 1 : currentScaleIdx - 1;
    stateStore.scale = scales[nextScaleIdx];
  };
  private randomOscillator = () => {
    /** TODO: 전체 타입 추가 */
    const oscillatorTypes: OmniOscillatorType[] = [
      "fatsine",
      "fatsquare",
      "fatsawtooth",
      "fattriangle",
      "fatcustom",
      "fmsine",
      "fmsquare",
      "fmsawtooth",
      "fmtriangle",
      "fmcustom",
      "amsine",
      "amsquare",
      "amsawtooth",
      "amtriangle",
      "amcustom",
      "pulse",
      "pwm",
    ];
    audioContextStore.audioSourceNode.oscillator.type =
      oscillatorTypes[Math.floor(Math.random() * oscillatorTypes.length)];
  };
}

customElements.define("octave-control", OctaveControl);
