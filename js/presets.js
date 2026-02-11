export const PRESETS = {
  '2vs1': {
    title: '2vs1 攻め方',
    description: '2人の攻撃vs1人のディフェンス',
    steps: [
      {
        stepId: 0,
        timestamp: Date.now(),
        comment: '初期配置：ボール保持者と味方、DFが三角形を形成',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 200, y: 450 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 150, y: 500, radius: 20, number: 1, direction: 0 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 250, y: 500, radius: 20, number: 2, direction: 0 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 200, y: 250, radius: 20, number: 1, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 150, y: 500, radius: 10 }
        ]
      },
      {
        stepId: 1,
        timestamp: Date.now(),
        comment: 'ドリブルで前進し、味方は斜めに走り込む',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 150, y: 350 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 150, y: 380, radius: 20, number: 1, direction: 0 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 250, y: 350, radius: 20, number: 2, direction: 0 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 150, y: 250, radius: 20, number: 1, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 150, y: 380, radius: 10 }
        ]
      },
      {
        stepId: 2,
        timestamp: Date.now(),
        comment: 'DFを引きつけてパス。味方は裏へ抜ける',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 220, y: 160 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 150, y: 200, radius: 20, number: 1, direction: 45 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 280, y: 150, radius: 20, number: 2, direction: 315 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 150, y: 250, radius: 20, number: 1, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 220, y: 130, radius: 10 }
        ]
      },
      {
        stepId: 3,
        timestamp: Date.now(),
        comment: 'シュート！DFの背後を取って決定的チャンス',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 200, y: 60 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 150, y: 200, radius: 20, number: 1, direction: 45 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 280, y: 100, radius: 20, number: 2, direction: 0 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 150, y: 250, radius: 20, number: 1, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 200, y: 15, radius: 10 }
        ]
      }
    ]
  },
  '3vs2': {
    title: '3vs2 攻め方',
    description: '3人の攻撃vs2人のディフェンス',
    steps: [
      {
        stepId: 0,
        timestamp: Date.now(),
        comment: '初期配置：3人が横に広がり、2人のDFと対峙',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 200, y: 480 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 100, y: 500, radius: 20, number: 1, direction: 0 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 200, y: 520, radius: 20, number: 2, direction: 0 },
          { id: 'player-red-3', type: 'player', color: 'red', x: 300, y: 500, radius: 20, number: 3, direction: 0 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 150, y: 300, radius: 20, number: 1, direction: 180 },
          { id: 'player-blue-2', type: 'player', color: 'blue', x: 250, y: 300, radius: 20, number: 2, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 200, y: 520, radius: 10 }
        ]
      },
      {
        stepId: 1,
        timestamp: Date.now(),
        comment: '幅を保ちながら前進。DFを横に広げる',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 200, y: 350 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 100, y: 400, radius: 20, number: 1, direction: 0 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 200, y: 380, radius: 20, number: 2, direction: 0 },
          { id: 'player-red-3', type: 'player', color: 'red', x: 300, y: 400, radius: 20, number: 3, direction: 0 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 150, y: 280, radius: 20, number: 1, direction: 180 },
          { id: 'player-blue-2', type: 'player', color: 'blue', x: 250, y: 280, radius: 20, number: 2, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 200, y: 380, radius: 10 }
        ]
      },
      {
        stepId: 2,
        timestamp: Date.now(),
        comment: 'サイドへパス。中央と逆サイドが走り込む',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 80, y: 220 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 80, y: 250, radius: 20, number: 1, direction: 315 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 200, y: 200, radius: 20, number: 2, direction: 45 },
          { id: 'player-red-3', type: 'player', color: 'red', x: 320, y: 250, radius: 20, number: 3, direction: 45 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 120, y: 200, radius: 20, number: 1, direction: 225 },
          { id: 'player-blue-2', type: 'player', color: 'blue', x: 250, y: 280, radius: 20, number: 2, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 80, y: 250, radius: 10 }
        ]
      },
      {
        stepId: 3,
        timestamp: Date.now(),
        comment: 'DFを引きつけ中央へパス。数的優位を活かす',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 200, y: 130 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 80, y: 150, radius: 20, number: 1, direction: 45 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 200, y: 100, radius: 20, number: 2, direction: 0 },
          { id: 'player-red-3', type: 'player', color: 'red', x: 320, y: 150, radius: 20, number: 3, direction: 315 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 120, y: 200, radius: 20, number: 1, direction: 225 },
          { id: 'player-blue-2', type: 'player', color: 'blue', x: 250, y: 280, radius: 20, number: 2, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 200, y: 100, radius: 10 }
        ]
      },
      {
        stepId: 4,
        timestamp: Date.now(),
        comment: 'ゴール！フリーでシュートを決める',
        commentPosition: { x: 20, y: 40 },
        commentPointerPosition: { x: 200, y: 60 },
        objects: [
          { id: 'player-red-1', type: 'player', color: 'red', x: 80, y: 150, radius: 20, number: 1, direction: 45 },
          { id: 'player-red-2', type: 'player', color: 'red', x: 200, y: 80, radius: 20, number: 2, direction: 0 },
          { id: 'player-red-3', type: 'player', color: 'red', x: 320, y: 150, radius: 20, number: 3, direction: 315 },
          { id: 'player-blue-1', type: 'player', color: 'blue', x: 120, y: 200, radius: 20, number: 1, direction: 225 },
          { id: 'player-blue-2', type: 'player', color: 'blue', x: 250, y: 280, radius: 20, number: 2, direction: 180 },
          { id: 'ball-1', type: 'ball', color: 'orange', x: 200, y: 15, radius: 10 }
        ]
      }
    ]
  }
};
