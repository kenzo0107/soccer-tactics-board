export class State {
  constructor() {
    this.objects = [];
    this.steps = [];
    this.currentStepIndex = 0;
    this.selectedObject = null;
    this.selectedObjects = [];
    this.nextPlayerId = { red: 1, blue: 1 };
    this.listeners = [];
    this.isTweening = false;
    this.currentComment = '';
    this.commentPosition = { x: 20, y: 40 };
    this.commentPointerPosition = { x: 40, y: 120 };
  }

  addObject(type, color, x, y) {
    let id, radius, number, direction;

    if (type === 'player') {
      number = this.nextPlayerId[color];
      this.nextPlayerId[color]++;
      id = `player-${color}-${number}`;
      radius = 20;
      direction = 0;
    } else if (type === 'ball') {
      id = `ball-${Date.now()}`;
      radius = 10;
    } else if (type === 'marker') {
      id = `marker-${Date.now()}`;
      radius = 8;
    }

    const obj = { id, type, color, x, y, radius, number, direction };
    this.objects.push(obj);
    this.notifyListeners();
    return obj;
  }

  removeObject(id) {
    this.objects = this.objects.filter(obj => obj.id !== id);
    if (this.selectedObject?.id === id) {
      this.selectedObject = null;
    }
    this.notifyListeners();
  }

  updateObjectPosition(id, x, y) {
    const obj = this.objects.find(o => o.id === id);
    if (obj) {
      obj.x = x;
      obj.y = y;
      this.notifyListeners();
    }
  }

  rotateObject(id, angle) {
    const obj = this.objects.find(o => o.id === id);
    if (obj && obj.type === 'player') {
      obj.direction = (obj.direction + angle) % 360;
      if (obj.direction < 0) obj.direction += 360;
      this.notifyListeners();
    }
  }

  selectObject(id) {
    this.selectedObject = this.objects.find(obj => obj.id === id);
    this.selectedObjects = [this.selectedObject];
    this.notifyListeners();
  }

  selectMultipleObjects(ids) {
    this.selectedObjects = this.objects.filter(obj => ids.includes(obj.id));
    this.selectedObject = this.selectedObjects.length > 0 ? this.selectedObjects[0] : null;
    this.notifyListeners();
  }

  deselectObject() {
    this.selectedObject = null;
    this.selectedObjects = [];
    this.notifyListeners();
  }

  updateMultipleObjectPositions(deltas) {
    deltas.forEach(({ id, dx, dy }) => {
      const obj = this.objects.find(o => o.id === id);
      if (obj) {
        obj.x += dx;
        obj.y += dy;
      }
    });
    this.notifyListeners();
  }

  saveStep() {
    const step = {
      stepId: this.steps.length,
      timestamp: Date.now(),
      objects: JSON.parse(JSON.stringify(this.objects)),
      comment: this.currentComment,
      commentPosition: { ...this.commentPosition },
      commentPointerPosition: { ...this.commentPointerPosition }
    };
    this.steps.push(step);
    this.currentStepIndex = this.steps.length - 1;
    this.notifyListeners();
  }

  updateStep(index) {
    if (index >= 0 && index < this.steps.length) {
      this.steps[index] = {
        stepId: this.steps[index].stepId,
        timestamp: Date.now(),
        objects: JSON.parse(JSON.stringify(this.objects)),
        comment: this.currentComment,
        commentPosition: { ...this.commentPosition },
        commentPointerPosition: { ...this.commentPointerPosition }
      };
      this.notifyListeners();
      return true;
    }
    return false;
  }

  deleteStep(index) {
    if (index >= 0 && index < this.steps.length) {
      this.steps.splice(index, 1);

      if (this.steps.length === 0) {
        this.currentStepIndex = 0;
        this.objects = [];
      } else if (index <= this.currentStepIndex) {
        this.currentStepIndex = Math.max(0, this.currentStepIndex - 1);
      }

      if (this.steps.length > 0) {
        this.objects = JSON.parse(JSON.stringify(this.steps[this.currentStepIndex].objects));
      }

      this.notifyListeners();
      return true;
    }
    return false;
  }

  loadStep(index) {
    if (index >= 0 && index < this.steps.length) {
      if (this.steps.length > 0 && this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
        this.steps[this.currentStepIndex] = {
          stepId: this.steps[this.currentStepIndex].stepId,
          timestamp: this.steps[this.currentStepIndex].timestamp,
          objects: JSON.parse(JSON.stringify(this.objects)),
          comment: this.currentComment,
          commentPosition: { ...this.commentPosition },
          commentPointerPosition: { ...this.commentPointerPosition }
        };
      }

      this.currentStepIndex = index;
      this.objects = JSON.parse(JSON.stringify(this.steps[index].objects));
      this.currentComment = this.steps[index].comment || '';
      this.commentPosition = this.steps[index].commentPosition || { x: 20, y: 40 };
      this.commentPointerPosition = this.steps[index].commentPointerPosition || { x: 40, y: 120 };
      this.deselectObject();
      this.notifyListeners();
    }
  }

  clearSteps() {
    this.steps = [];
    this.currentStepIndex = 0;
    this.notifyListeners();
  }

  reset() {
    this.objects = [];
    this.steps = [];
    this.currentStepIndex = 0;
    this.selectedObject = null;
    this.selectedObjects = [];
    this.nextPlayerId = { red: 1, blue: 1 };
    this.isTweening = false;
    this.currentComment = '';
    this.commentPosition = { x: 20, y: 40 };
    this.commentPointerPosition = { x: 40, y: 120 };
    this.notifyListeners();
  }

  setComment(comment) {
    this.currentComment = comment;
    this.notifyListeners();
  }

  setCommentPosition(x, y) {
    this.commentPosition = { x, y };
    this.notifyListeners();
  }

  setCommentPointerPosition(x, y) {
    this.commentPointerPosition = { x, y };
    this.notifyListeners();
  }

  getData() {
    return {
      version: '1.0.0',
      title: 'サッカー作戦盤',
      description: '',
      fieldDimensions: { width: 400, height: 600 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: this.steps
    };
  }

  loadData(data) {
    if (!data || !data.steps) {
      throw new Error('Invalid data format');
    }
    this.steps = data.steps;
    this.currentStepIndex = Math.max(0, this.steps.length - 1);
    if (this.steps.length > 0) {
      this.objects = JSON.parse(JSON.stringify(this.steps[this.currentStepIndex].objects));
    }
    this.notifyListeners();
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback());
  }
}
