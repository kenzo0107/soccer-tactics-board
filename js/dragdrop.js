export class DragDrop {
  constructor(canvas, state) {
    this.canvas = canvas;
    this.state = state;
    this.dragging = false;
    this.draggedObject = null;
    this.offsetX = 0;
    this.offsetY = 0;

    this.selecting = false;
    this.selectionStart = null;
    this.selectionEnd = null;

    this.groupDragging = false;
    this.groupOffsets = [];

    this.commentDragging = false;
    this.commentPointerDragging = false;
    this.commentOffsetX = 0;
    this.commentOffsetY = 0;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    this.canvas.canvas.addEventListener('contextmenu', this.onContextMenu.bind(this));
    this.canvas.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    this.canvas.canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));

    this.canvas.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.canvas.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.canvas.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  onDoubleClick(e) {
    const { x, y } = this.canvas.getCanvasCoordinates(e.clientX, e.clientY);

    if (this.canvas.isPointInCommentBox(x, y)) {
      const text = prompt('吹き出しのテキストを編集してください:', this.state.currentComment || '');
      if (text !== null) {
        this.state.setComment(text);
      }
    }
  }

  onMouseDown(e) {
    if (this.state.isTweening) return;

    const { x, y } = this.canvas.getCanvasCoordinates(e.clientX, e.clientY);

    if (this.canvas.isPointInCommentPointer(x, y)) {
      this.commentPointerDragging = true;
      this.commentOffsetX = x - this.state.commentPointerPosition.x;
      this.commentOffsetY = y - this.state.commentPointerPosition.y;
      return;
    }

    if (this.canvas.isPointInCommentBox(x, y)) {
      this.commentDragging = true;
      this.commentOffsetX = x - this.state.commentPosition.x;
      this.commentOffsetY = y - this.state.commentPosition.y;
      return;
    }

    const obj = this.canvas.getObjectAt(x, y);

    if (obj) {
      if (this.state.selectedObjects.some(o => o.id === obj.id)) {
        this.groupDragging = true;
        this.groupOffsets = this.state.selectedObjects.map(o => ({
          id: o.id,
          offsetX: x - o.x,
          offsetY: y - o.y
        }));
      } else {
        this.dragging = true;
        this.draggedObject = obj;
        this.offsetX = x - obj.x;
        this.offsetY = y - obj.y;
        this.state.selectObject(obj.id);
      }
    } else {
      this.selecting = true;
      this.selectionStart = { x, y };
      this.selectionEnd = { x, y };
      this.state.deselectObject();
    }
  }

  onMouseMove(e) {
    const { x, y } = this.canvas.getCanvasCoordinates(e.clientX, e.clientY);

    if (this.commentDragging) {
      const newX = Math.max(0, Math.min(this.canvas.width - 100, x - this.commentOffsetX));
      const newY = Math.max(0, Math.min(this.canvas.height - 100, y - this.commentOffsetY));
      this.state.setCommentPosition(newX, newY);
      this.canvas.canvas.style.cursor = 'move';
    } else if (this.commentPointerDragging) {
      const newX = Math.max(0, Math.min(this.canvas.width, x - this.commentOffsetX));
      const newY = Math.max(0, Math.min(this.canvas.height, y - this.commentOffsetY));
      this.state.setCommentPointerPosition(newX, newY);
      this.canvas.canvas.style.cursor = 'move';
    } else if (this.selecting) {
      this.selectionEnd = { x, y };
      this.state.notifyListeners();
    } else if (this.groupDragging) {
      const deltas = this.groupOffsets.map(({ id, offsetX, offsetY }) => {
        const obj = this.state.objects.find(o => o.id === id);
        if (!obj) return null;

        const newX = Math.max(obj.radius, Math.min(this.canvas.width - obj.radius, x - offsetX));
        const newY = Math.max(obj.radius, Math.min(this.canvas.height - obj.radius, y - offsetY));

        return {
          id,
          dx: newX - obj.x,
          dy: newY - obj.y
        };
      }).filter(Boolean);

      this.state.updateMultipleObjectPositions(deltas);
    } else if (this.dragging && this.draggedObject) {
      const newX = Math.max(this.draggedObject.radius, Math.min(this.canvas.width - this.draggedObject.radius, x - this.offsetX));
      const newY = Math.max(this.draggedObject.radius, Math.min(this.canvas.height - this.draggedObject.radius, y - this.offsetY));

      this.state.updateObjectPosition(this.draggedObject.id, newX, newY);
    } else {
      if (this.canvas.isPointInCommentBox(x, y) || this.canvas.isPointInCommentPointer(x, y)) {
        this.canvas.canvas.style.cursor = 'move';
      } else {
        this.canvas.canvas.style.cursor = 'crosshair';
      }
    }
  }

  onMouseUp(e) {
    if (this.selecting) {
      this.finishSelection();
    }

    this.dragging = false;
    this.draggedObject = null;
    this.selecting = false;
    this.commentDragging = false;
    this.commentPointerDragging = false;

    const { x, y } = this.canvas.getCanvasCoordinates(e.clientX, e.clientY);
    if (this.canvas.isPointInCommentBox(x, y) || this.canvas.isPointInCommentPointer(x, y)) {
      this.canvas.canvas.style.cursor = 'move';
    } else {
      this.canvas.canvas.style.cursor = 'crosshair';
    }
    this.selectionStart = null;
    this.selectionEnd = null;
    this.groupDragging = false;
    this.groupOffsets = [];
  }

  finishSelection() {
    if (!this.selectionStart || !this.selectionEnd) return;

    const minX = Math.min(this.selectionStart.x, this.selectionEnd.x);
    const maxX = Math.max(this.selectionStart.x, this.selectionEnd.x);
    const minY = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const maxY = Math.max(this.selectionStart.y, this.selectionEnd.y);

    const selectedIds = this.state.objects
      .filter(obj => obj.x >= minX && obj.x <= maxX && obj.y >= minY && obj.y <= maxY)
      .map(obj => obj.id);

    if (selectedIds.length > 0) {
      this.state.selectMultipleObjects(selectedIds);
    }
  }

  getSelectionRect() {
    if (!this.selecting || !this.selectionStart || !this.selectionEnd) {
      return null;
    }

    return {
      x: Math.min(this.selectionStart.x, this.selectionEnd.x),
      y: Math.min(this.selectionStart.y, this.selectionEnd.y),
      width: Math.abs(this.selectionEnd.x - this.selectionStart.x),
      height: Math.abs(this.selectionEnd.y - this.selectionStart.y)
    };
  }

  onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const { x, y } = this.canvas.getCanvasCoordinates(touch.clientX, touch.clientY);

      if (this.canvas.isPointInCommentPointer(x, y)) {
        this.commentPointerDragging = true;
        this.commentOffsetX = x - this.state.commentPointerPosition.x;
        this.commentOffsetY = y - this.state.commentPointerPosition.y;
        return;
      }

      if (this.canvas.isPointInCommentBox(x, y)) {
        this.commentDragging = true;
        this.commentOffsetX = x - this.state.commentPosition.x;
        this.commentOffsetY = y - this.state.commentPosition.y;
        return;
      }

      const obj = this.canvas.getObjectAt(x, y);

      if (obj) {
        if (this.state.selectedObjects.some(o => o.id === obj.id)) {
          this.groupDragging = true;
          this.groupOffsets = this.state.selectedObjects.map(o => ({
            id: o.id,
            offsetX: x - o.x,
            offsetY: y - o.y
          }));
        } else {
          this.dragging = true;
          this.draggedObject = obj;
          this.offsetX = x - obj.x;
          this.offsetY = y - obj.y;
          this.state.selectObject(obj.id);
        }
      } else {
        this.state.deselectObject();
      }
    }
  }

  onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const { x, y } = this.canvas.getCanvasCoordinates(touch.clientX, touch.clientY);

    if (this.commentDragging) {
      const newX = Math.max(0, Math.min(this.canvas.width - 100, x - this.commentOffsetX));
      const newY = Math.max(0, Math.min(this.canvas.height - 100, y - this.commentOffsetY));
      this.state.setCommentPosition(newX, newY);
    } else if (this.commentPointerDragging) {
      const newX = Math.max(0, Math.min(this.canvas.width, x - this.commentOffsetX));
      const newY = Math.max(0, Math.min(this.canvas.height, y - this.commentOffsetY));
      this.state.setCommentPointerPosition(newX, newY);
    } else if (this.groupDragging) {
      const deltas = this.groupOffsets.map(({ id, offsetX, offsetY }) => {
        const obj = this.state.objects.find(o => o.id === id);
        if (!obj) return null;

        const newX = Math.max(obj.radius, Math.min(this.canvas.width - obj.radius, x - offsetX));
        const newY = Math.max(obj.radius, Math.min(this.canvas.height - obj.radius, y - offsetY));

        return {
          id,
          dx: newX - obj.x,
          dy: newY - obj.y
        };
      }).filter(Boolean);

      this.state.updateMultipleObjectPositions(deltas);
    } else if (this.dragging && this.draggedObject) {
      const newX = Math.max(this.draggedObject.radius, Math.min(this.canvas.width - this.draggedObject.radius, x - this.offsetX));
      const newY = Math.max(this.draggedObject.radius, Math.min(this.canvas.height - this.draggedObject.radius, y - this.offsetY));

      this.state.updateObjectPosition(this.draggedObject.id, newX, newY);
    }
  }

  onTouchEnd() {
    this.dragging = false;
    this.draggedObject = null;
    this.groupDragging = false;
    this.groupOffsets = [];
    this.commentDragging = false;
    this.commentPointerDragging = false;
  }

  onContextMenu(e) {
    e.preventDefault();
    const { x, y } = this.canvas.getCanvasCoordinates(e.clientX, e.clientY);
    const obj = this.canvas.getObjectAt(x, y);

    if (obj && obj.type === 'player') {
      if (this.state.selectedObjects.some(o => o.id === obj.id)) {
        this.state.selectedObjects.forEach(o => {
          if (o.type === 'player') {
            this.state.rotateObject(o.id, 45);
          }
        });
      } else {
        this.state.rotateObject(obj.id, 45);
      }
    }
  }

  onWheel(e) {
    const { x, y } = this.canvas.getCanvasCoordinates(e.clientX, e.clientY);
    const obj = this.canvas.getObjectAt(x, y);

    if (obj && obj.type === 'player') {
      e.preventDefault();
      const angle = e.deltaY > 0 ? 15 : -15;

      if (this.state.selectedObjects.some(o => o.id === obj.id)) {
        this.state.selectedObjects.forEach(o => {
          if (o.type === 'player') {
            this.state.rotateObject(o.id, angle);
          }
        });
      } else {
        this.state.rotateObject(obj.id, angle);
      }
    }
  }
}
