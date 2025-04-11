export class ParenthesesTracker {
  constructor() {
    this.count = 0;
    this.groups = [];
  }

  open(position) {
    this.count++;
    this.groups.push({
      start: position,
      content: ""
    });
  }

  close(position) {
    if (this.count > 0) {
      this.count--;
      const group = this.groups[this.groups.length - 1];
      if (group) {
        group.end = position;
      }
      return true;
    }
    return false;
  }

  getOpenCount() {
    return this.count;
  }
}
