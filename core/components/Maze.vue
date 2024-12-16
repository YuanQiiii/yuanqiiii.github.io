<template>
  <div class="maze-game">
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
    <div class="game-info">
      <p>用时: {{ gameTime }} 秒</p>
      <p>尝试次数: {{ attempts }}</p>
    </div>
    <div v-if="gameState === 'won'" class="game-over">
      <p>恭喜通关！</p>
      <p>用时: {{ gameTime }} 秒</p>
      <p>尝试次数: {{ attempts }}</p>
      <button @click="resetGame">继续</button>
    </div>
    <div v-if="gameState === 'lost'" class="game-over">
      <p>游戏失败！</p>
      <p>请再试一次。</p>
      <button @click="resetGame">重新开始</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MazeGame',
  data() {
    return {
      canvasWidth: 960,
      canvasHeight: 720,
      cellSize: 20, // 增大格子大小
      cols: 21, // 迷宫宽度（需为奇数）
      rows: 21, // 迷宫高度（需为奇数）
      maze: [],
      player: { x: 1, y: 1 },
      playerViewRange: 3, // 玩家视野范围
      gameStartTime: null,
      gameTime: 0,
      attempts: 0,
      gameInterval: null,
      gameState: 'playing', // 'playing', 'won', 'lost'
      visited: new Set(),
      deadEnds: new Set(), // 添加死胡同集合
    };
  },
  methods: {
    initGame() {
      this.createMaze();
      this.player = { x: 1, y: 1 };
      this.visited.clear();
      this.deadEnds.clear();
      this.gameStartTime = Date.now();
      this.gameTime = 0;
      this.gameState = 'playing';
      this.updateVision();
      this.checkDeadEnds();
      this.gameInterval = setInterval(this.updateGameTime, 1000);
      window.addEventListener('keydown', this.handleInput);
      this.render();
    },
    createMaze() {
      // 基于随机Prim算法生成迷宫
      const width = this.cols;
      const height = this.rows;
      // 初始化迷宫，所有格子都是墙
      const maze = [];
      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          row.push(1);
        }
        maze.push(row);
      }
      // 从起点开始
      const startX = 1;
      const startY = 1;
      maze[startY][startX] = 0;
      const walls = [];
      walls.push([startX, startY, startX + 1, startY]);
      walls.push([startX, startY, startX, startY + 1]);
      while (walls.length > 0) {
        const index = Math.floor(Math.random() * walls.length);
        const wall = walls.splice(index, 1)[0];
        const x1 = wall[0];
        const y1 = wall[1];
        const x2 = wall[2];
        const y2 = wall[3];
        if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
          continue;
        }
        if (maze[y2][x2] === 1) {
          maze[y1][x1] = 0;
          maze[y2][x2] = 0;
          walls.push([x2, y2, x2 + 1, y2]);
          walls.push([x2, y2, x2 - 1, y2]);
          walls.push([x2, y2, x2, y2 + 1]);
          walls.push([x2, y2, x2, y2 - 1]);
        }
      }
      // 确保终点可达
      maze[height - 2][width - 2] = 0;
      this.maze = maze;
    },
    updateVision() {
      // 更新玩家视野范围
      const visible = [];
      for (let y = 0; y < this.rows; y++) {
        const row = [];
        for (let x = 0; x < this.cols; x++) {
          row.push(false);
        }
        visible.push(row);
      }
      const px = this.player.x;
      const py = this.player.y;
      const range = this.playerViewRange;
      for (let y = Math.max(0, py - range); y <= Math.min(this.rows - 1, py + range); y++) {
        for (let x = Math.max(0, px - range); x <= Math.min(this.cols - 1, px + range); x++) {
          visible[y][x] = true;
        }
      }
      this.visibleArea = visible;
    },
    updateGameTime() {
      this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    },
    resetGame() {
      clearInterval(this.gameInterval);
      window.removeEventListener('keydown', this.handleInput);
      this.attempts = 0;
      this.initGame();
    },
    handleInput(event) {
      if (this.gameState !== 'playing') {
        return;
      }
      let dx = 0;
      let dy = 0;
      if (event.key === 'w') {
        dy = -1;
      } else if (event.key === 's') {
        dy = 1;
      } else if (event.key === 'a') {
        dx = -1;
      } else if (event.key === 'd') {
        dx = 1;
      }
      const newX = this.player.x + dx;
      const newY = this.player.y + dy;
      if (
        newX >= 0 &&
        newX < this.cols &&
        newY >= 0 &&
        newY < this.rows &&
        this.maze[newY][newX] === 0
      ) {
        this.player.x = newX;
        this.player.y = newY;
        this.updateVision();
        this.checkGameState();
        this.render();
      }
    },
    checkGameState() {
      // 检查是否到达终点
      if (this.player.x === this.cols - 2 && this.player.y === this.rows - 2) {
        this.gameState = 'won';
        clearInterval(this.gameInterval);
        window.removeEventListener('keydown', this.handleInput);
        return;
      }
      // 记录当前位置为已访问
      this.visited.add(`${this.player.x},${this.player.y}`);
      // 检查是否进入死胡同
      const moves = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      let validMoves = 0;
      for (const [dx, dy] of moves) {
        const nx = this.player.x + dx;
        const ny = this.player.y + dy;
        if (
          nx >= 0 &&
          nx < this.cols &&
          ny >= 0 &&
          ny < this.rows &&
          this.maze[ny][nx] === 0 &&
          !this.visited.has(`${nx},${ny}`)
        ) {
          validMoves += 1;
        }
      }
      if (validMoves === 0 && !this.deadEnds.has(`${this.player.x},${this.player.y}`)) {
        this.deadEnds.add(`${this.player.x},${this.player.y}`);
        this.attempts += 1;
        this.gameState = 'lost';
        clearInterval(this.gameInterval);
        window.removeEventListener('keydown', this.handleInput);
      }
    },
    checkDeadEnds() {
      // 计算所有死胡同位置
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (this.maze[y][x] === 0) {
            const moves = [
              [0, 1],
              [0, -1],
              [1, 0],
              [-1, 0],
            ];
            let walls = 0;
            for (const [dx, dy] of moves) {
              const nx = x + dx;
              const ny = y + dy;
              if (
                nx < 0 ||
                nx >= this.cols ||
                ny < 0 ||
                ny >= this.rows ||
                this.maze[ny][nx] === 1
              ) {
                walls += 1;
              }
            }
            if (walls >= 3) {
              this.deadEnds.add(`${x},${y}`);
            }
          }
        }
      }
    },
    render() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      const offsetX = this.canvasWidth / 2 - this.player.x * this.cellSize - this.cellSize / 2;
      const offsetY = this.canvasHeight / 2 - this.player.y * this.cellSize - this.cellSize / 2;
      // 绘制可见的迷宫部分
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          if (this.visibleArea && this.visibleArea[y][x]) {
            const cell = this.maze[y][x];
            if (cell === 1) {
              ctx.fillStyle = '#000000'; // 墙
            } else {
              ctx.fillStyle = '#FFFFFF'; // 路径
            }
            ctx.fillRect(
              x * this.cellSize + offsetX,
              y * this.cellSize + offsetY,
              this.cellSize,
              this.cellSize
            );
          }
        }
      }
      // 绘制玩家
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(
        this.canvasWidth / 2,
        this.canvasHeight / 2,
        this.cellSize / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    },
  },
  mounted() {
    this.initGame();
  },
  beforeDestroy() {
    clearInterval(this.gameInterval);
    window.removeEventListener('keydown', this.handleInput);
  },
};
</script>

<style scoped>
.maze-game {
  position: relative;
}

.game-info {
  position: absolute;
  top: 10px;
  left: 10px;
  color: #FFFFFF;
}

.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  color: #FFFFFF;
  text-align: center;
}
</style>