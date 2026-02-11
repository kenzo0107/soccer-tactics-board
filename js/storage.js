export class Storage {
  constructor(state) {
    this.state = state;
    this.storageKey = 'soccer-tactics-board';
  }

  saveToLocalStorage() {
    try {
      const data = this.state.getData();
      const json = JSON.stringify(data);

      if (json.length > 5 * 1024 * 1024) {
        throw new Error('データサイズが大きすぎます（5MB制限）');
      }

      localStorage.setItem(this.storageKey, json);
      return true;
    } catch (error) {
      console.error('LocalStorageへの保存に失敗しました:', error);
      alert(`保存に失敗しました: ${error.message}`);
      return false;
    }
  }

  loadFromLocalStorage() {
    try {
      const json = localStorage.getItem(this.storageKey);
      if (!json) {
        console.log('LocalStorageにデータがありません');
        return false;
      }

      console.log('LocalStorageからデータを読み込み中...');
      const data = JSON.parse(json);
      this.state.loadData(data);
      console.log('LocalStorageからの読み込み成功');
      return true;
    } catch (error) {
      console.error('LocalStorageからの読み込みに失敗しました:', error);
      console.warn('破損したデータをクリアします');
      localStorage.removeItem(this.storageKey);
      alert(`保存データが破損していたためクリアしました: ${error.message}`);
      return false;
    }
  }

  exportToJson() {
    try {
      const data = this.state.getData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `tactics-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('JSONエクスポートに失敗しました:', error);
      alert(`エクスポートに失敗しました: ${error.message}`);
      return false;
    }
  }

  importFromJson(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('ファイルが選択されていません'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = e.target.result;
          const data = JSON.parse(json);

          if (!data.version || !data.steps) {
            throw new Error('無効なファイル形式です');
          }

          this.state.loadData(data);
          resolve(true);
        } catch (error) {
          console.error('JSONインポートに失敗しました:', error);
          alert(`インポートに失敗しました: ${error.message}`);
          reject(error);
        }
      };

      reader.onerror = () => {
        const error = new Error('ファイルの読み込みに失敗しました');
        console.error(error);
        alert(error.message);
        reject(error);
      };

      reader.readAsText(file);
    });
  }
}
