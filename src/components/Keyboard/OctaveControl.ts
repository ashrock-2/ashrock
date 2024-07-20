import { match } from "ts-pattern";
import { stateStore } from "./StateStore";

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
}

customElements.define("octave-control", OctaveControl);
