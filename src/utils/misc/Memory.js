import { evaluate, bignumber } from "mathjs";

export class Memory {
  constructor() {
    this.value = 0;
  }

  clear() {
    this.value = 0;
    return this.value;
  }

  recall() {
    return this.value;
  }

  add(value) {
    try {
      this.value = evaluate(`${this.value} + ${value}`);
      return true;
    } catch {
      return false;
    }
  }

  subtract(value) {
    try {
      this.value = evaluate(`${this.value} - ${value}`);
      return true;
    } catch {
      return false;
    }
  }

  store(value) {
    try {
      this.value = bignumber(value);
      return true;
    } catch {
      return false;
    }
  }
}
