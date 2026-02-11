import { State } from './state.js';
import { Canvas } from './canvas.js';
import { DragDrop } from './dragdrop.js';
import { Animation } from './animation.js';
import { Storage } from './storage.js';
import { PRESETS } from './presets.js';
import { AnimationManager } from './animationManager.js';

class App {
  constructor() {
    try {
      this.state = new State();
      this.canvas = new Canvas(document.getElementById('field'), this.state);
      this.dragDrop = new DragDrop(this.canvas, this.state);
      this.canvas.setDragDrop(this.dragDrop);
      this.animation = new Animation(this.state, this.canvas);
      this.storage = new Storage(this.state);
      this.animationManager = new AnimationManager(this.state);
      this.setupEventListeners();
      this.setupMenuListeners();
      this.state.addListener(() => this.onStateChange());
      this.storage.loadFromLocalStorage();
      this.canvas.draw();
      this.updateStepControls();
      this.renderSavedAnimations();
    } catch (error) {
      console.error('App初期化エラー:', error);
      alert(`初期化エラー: ${error.message}\nLocalStorageをクリアしてページを再読み込みしてください。`);
    }
  }

  setupEventListeners() {
    document.getElementById('addRedPlayer').addEventListener('click', () => {
      this.state.addObject('player', 'red', 200, 530);
    });

    document.getElementById('addBluePlayer').addEventListener('click', () => {
      this.state.addObject('player', 'blue', 200, 130);
    });

    document.getElementById('addBall').addEventListener('click', () => {
      this.state.addObject('ball', 'orange', 200, 330);
    });

    document.getElementById('addMarker').addEventListener('click', () => {
      this.state.addObject('marker', 'purple', 200, 330);
    });

    document.getElementById('addComment').addEventListener('click', () => {
      const text = prompt('吹き出しのテキストを入力してください:', this.state.currentComment || '');
      if (text !== null) {
        this.state.setComment(text);
        if (!this.state.commentPosition || (this.state.commentPosition.x === 20 && this.state.commentPosition.y === 40)) {
          this.state.setCommentPosition(20, 40);
          this.state.setCommentPointerPosition(200, 330);
        }
        this.canvas.draw();
      }
    });

    document.getElementById('deleteSelected').addEventListener('click', () => {
      if (this.state.selectedObject) {
        this.state.removeObject(this.state.selectedObject.id);
      }
    });

    document.getElementById('saveStep').addEventListener('click', () => {
      this.state.saveStep();
      this.state.setComment('');
      this.updateStepControls();
    });

    document.getElementById('updateStep').addEventListener('click', () => {
      if (this.state.isTweening) {
        this.showNotification('アニメーション中は更新できません', 'error');
        return;
      }

      if (this.state.steps.length > 0) {
        this.state.updateStep(this.state.currentStepIndex);
        this.state.loadStep(this.state.currentStepIndex);
        this.updateStepControls();
        this.canvas.draw();
        this.showNotification(`ステップ ${this.state.currentStepIndex + 1} を更新しました`, 'success');
      } else {
        this.showNotification('更新するステップがありません', 'error');
      }
    });

    document.getElementById('deleteStep').addEventListener('click', () => {
      if (this.state.steps.length > 0) {
        const stepNum = this.state.currentStepIndex + 1;
        this.state.deleteStep(this.state.currentStepIndex);
        this.updateStepControls();
        this.showNotification(`ステップ ${stepNum} を削除しました`, 'success');
      } else {
        this.showNotification('削除するステップがありません', 'error');
      }
    });

    document.getElementById('playPause').addEventListener('click', () => {
      const isPlaying = this.animation.toggle();
      document.getElementById('playPause').textContent = isPlaying ? '⏸ 停止' : '▶ 再生';
    });

    document.getElementById('prevStep').addEventListener('click', () => {
      this.animation.prevStep();
    });

    document.getElementById('nextStep').addEventListener('click', () => {
      this.animation.nextStep();
    });

    document.getElementById('stepSlider').addEventListener('input', (e) => {
      this.animation.goToStep(parseInt(e.target.value));
    });

    document.getElementById('saveLocal').addEventListener('click', () => {
      if (this.storage.saveToLocalStorage()) {
        alert('LocalStorageに保存しました');
      }
    });

    document.getElementById('exportJson').addEventListener('click', () => {
      if (this.storage.exportToJson()) {
        alert('JSONファイルをダウンロードしました');
      }
    });

    document.getElementById('importJson').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await this.storage.importFromJson(file);
          this.updateStepControls();
          alert('JSONファイルを読み込みました');
        } catch (error) {
          console.error(error);
        }
        e.target.value = '';
      }
    });

    document.getElementById('clearAll').addEventListener('click', () => {
      if (confirm('すべてのデータをクリアしますか？この操作は取り消せません。')) {
        localStorage.removeItem('soccer-tactics-board');
        this.state.reset();
        alert('すべてのデータをクリアしました');
      }
    });
  }

  setupMenuListeners() {
    const menuButton = document.getElementById('menuButton');
    const menuOverlay = document.getElementById('menuOverlay');
    const sideMenu = document.getElementById('sideMenu');
    const closeSideMenu = document.getElementById('closeSideMenu');

    const openMenu = () => {
      menuOverlay.classList.add('active');
      sideMenu.classList.add('active');
    };

    const closeMenu = () => {
      menuOverlay.classList.remove('active');
      sideMenu.classList.remove('active');
    };

    menuButton.addEventListener('click', openMenu);
    closeSideMenu.addEventListener('click', closeMenu);
    menuOverlay.addEventListener('click', closeMenu);

    document.getElementById('saveAnimation').addEventListener('click', () => {
      const nameInput = document.getElementById('animationNameInput');
      const name = nameInput.value;

      try {
        const result = this.animationManager.saveAnimation(name);

        if (result.exists) {
          if (confirm(`「${name}」は既に存在します。上書きしますか？`)) {
            this.animationManager.updateAnimation(result.id, name);
            this.showNotification(`「${name}」を上書き保存しました`, 'success');
            nameInput.value = '';
            this.renderSavedAnimations();
          }
        } else {
          this.showNotification(`「${name}」を保存しました`, 'success');
          nameInput.value = '';
          this.renderSavedAnimations();
        }
      } catch (error) {
        this.showNotification(error.message, 'error');
      }
    });

    document.querySelectorAll('.load-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetItem = e.target.closest('.preset-item');
        const presetId = presetItem.dataset.preset;
        this.loadPreset(presetId);
        closeMenu();
      });
    });
  }

  loadPreset(presetId) {
    const preset = PRESETS[presetId];
    if (!preset) {
      this.showNotification('プリセットが見つかりません', 'error');
      return;
    }

    this.state.reset();
    this.state.steps = JSON.parse(JSON.stringify(preset.steps));
    this.state.currentStepIndex = 0;
    this.state.nextPlayerId = { red: 10, blue: 10 };

    if (this.state.steps.length > 0) {
      this.state.objects = JSON.parse(JSON.stringify(this.state.steps[0].objects));
    }

    this.state.notifyListeners();
    this.updateStepControls();
    this.renderSavedAnimations();
    document.getElementById('animationNameInput').value = '';
    this.showNotification(`${preset.title}を読み込みました`, 'success');
  }

  renderSavedAnimations() {
    const listContainer = document.getElementById('savedAnimationsList');
    const animations = this.animationManager.getSavedAnimations();

    listContainer.innerHTML = '';

    if (animations.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'empty-message';
      emptyMsg.textContent = '保存されたアニメーションはありません';
      listContainer.appendChild(emptyMsg);
      return;
    }

    animations.forEach((anim, index) => {
      const item = document.createElement('div');
      item.className = 'saved-animation-item';
      if (anim.id === this.state.currentLoadedAnimationId) {
        item.classList.add('active');
      }
      item.draggable = true;
      item.dataset.id = anim.id;
      item.dataset.index = index;

      const dragHandle = document.createElement('span');
      dragHandle.className = 'drag-handle';
      dragHandle.textContent = '☰';

      const info = document.createElement('div');
      info.className = 'saved-animation-info';

      const name = document.createElement('div');
      name.className = 'saved-animation-name';
      name.textContent = anim.name;

      const meta = document.createElement('div');
      meta.className = 'saved-animation-meta';
      meta.textContent = `${anim.steps.length} ステップ`;

      info.appendChild(name);
      info.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'saved-animation-actions';

      const loadBtn = document.createElement('button');
      loadBtn.className = 'btn btn-sm btn-primary load-animation-btn';
      loadBtn.textContent = '読込';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-delete delete-animation-btn';
      deleteBtn.textContent = '削除';

      actions.appendChild(loadBtn);
      actions.appendChild(deleteBtn);

      item.appendChild(dragHandle);
      item.appendChild(info);
      item.appendChild(actions);

      listContainer.appendChild(item);
    });

    this.setupDragAndDrop();
    this.setupAnimationActions();
  }

  setupDragAndDrop() {
    const items = document.querySelectorAll('.saved-animation-item');
    let draggedItem = null;
    let draggedIndex = null;

    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        draggedIndex = parseInt(item.dataset.index);
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
        draggedIndex = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(item.parentElement, e.clientY);
        if (afterElement == null) {
          item.parentElement.appendChild(draggedItem);
        } else {
          item.parentElement.insertBefore(draggedItem, afterElement);
        }
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropIndex = parseInt(item.dataset.index);
        if (draggedIndex !== null && draggedIndex !== dropIndex) {
          this.animationManager.reorderAnimations(draggedIndex, dropIndex);
          this.renderSavedAnimations();
        }
      });
    });

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.saved-animation-item:not(.dragging)')];
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
  }

  setupAnimationActions() {
    document.querySelectorAll('.load-animation-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.saved-animation-item');
        const animId = item.dataset.id;
        try {
          const animation = this.animationManager.loadAnimation(animId);
          this.updateStepControls();
          this.renderSavedAnimations();
          document.getElementById('animationNameInput').value = animation.name;
          this.showNotification(`「${animation.name}」を読み込みました`, 'success');
          document.getElementById('menuOverlay').classList.remove('active');
          document.getElementById('sideMenu').classList.remove('active');
        } catch (error) {
          this.showNotification(error.message, 'error');
        }
      });
    });

    document.querySelectorAll('.delete-animation-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.saved-animation-item');
        const animId = item.dataset.id;
        const animName = item.querySelector('.saved-animation-name').textContent;

        if (confirm(`「${animName}」を削除しますか？`)) {
          try {
            this.animationManager.deleteAnimation(animId);
            this.renderSavedAnimations();
            this.showNotification('削除しました', 'success');
          } catch (error) {
            this.showNotification(error.message, 'error');
          }
        }
      });
    });
  }

  onStateChange() {
    this.canvas.draw();
    this.updateStepControls();

    if (this.animation.isPlaying() && !this.state.isTweening) {
      if (this.state.currentStepIndex >= this.state.steps.length - 1) {
        this.animation.stop();
        document.getElementById('playPause').textContent = '▶ 再生';
      }
    }
  }

  updateStepControls() {
    const stepCount = this.state.steps.length;
    const currentIndex = this.state.currentStepIndex;

    const slider = document.getElementById('stepSlider');
    slider.max = Math.max(0, stepCount - 1);
    slider.value = stepCount > 0 ? currentIndex : 0;

    const stepInfo = document.getElementById('stepInfo');
    stepInfo.textContent = `ステップ ${stepCount > 0 ? currentIndex + 1 : 0}/${stepCount}`;

    document.getElementById('prevStep').disabled = currentIndex === 0;
    document.getElementById('nextStep').disabled = currentIndex >= stepCount - 1;
    document.getElementById('playPause').disabled = stepCount === 0;
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
