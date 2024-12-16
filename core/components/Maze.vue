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
  </div>
</template>

<script>
export default {
  name: 'MazeGame',
  data() {
    return {
      canvasWidth: 960,
      canvasHeight: 720,
      cellSize: 40, // 增大格子大小
      cols: 21, // 迷宫宽度（需为奇数）
      rows: 21, // 迷宫高度（需为奇数）
      maze: [],
      player: { x: 1, y: 1 },
      playerViewRange: 5, // 玩家视野范围
      gameStartTime: null,
      gameTime: 0,
      attempts: 0,
      gameInterval: null,
      gameState: 'playing', // 'playing', 'won', 'lost'
      visited: new Set(),
    };
  },
  methods: {
    initGame() {
      this.createMaze();
      this.player = { x: 1, y: 1 };
      this.visited.clear();
      this.gameStartTime = Date.now();
      this.gameTime = 0;
      this.gameState = 'playing';
      this.drawMaze();
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
      }
      this.gameInterval = setInterval(() => {
        this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
      }, 1000);
      window.addEventListener('keydown', this.handleKeyDown);
    },
    createMaze() {
      // 初始化迷宫，所有格子都是墙
      this.maze = [];
      for (let y = 0; y < this.rows; y++) {
        let row = [];
        for (let x = 0; x < this.cols; x++) {
          row.push(1); // 1 表示墙
        }
        this.maze.push(row);
      }
      // 生成迷宫
      this.generateMaze(1, 1);
      // 确保终点可达
      this.maze[this.rows - 2][this.cols - 2] = 0;
    },
    generateMaze(x, y) {
      this.maze[y][x] = 0;
      const directions = [
        { dx: 0, dy: -2 },
        { dx: 2, dy: 0 },
        { dx: 0, dy: 2 },
        { dx: -2, dy: 0 },
      ];
      this.shuffleArray(directions);
      for (let dir of directions) {
        let nx = x + dir.dx;
        let ny = y + dir.dy;
        if (ny > 0 && ny < this.rows && nx > 0 && nx < this.cols && this.maze[ny][nx] === 1) {
          this.maze[ny][nx] = 0;
          this.maze[y + dir.dy / 2][x + dir.dx / 2] = 0;
          this.generateMaze(nx, ny);
        }
      }
    },
    shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },
    drawMaze() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      // 计算视图偏移量，使玩家始终居中
      const viewOffsetX = this.canvasWidth / 2 - (this.player.x * this.cellSize + this.cellSize / 2);
      const viewOffsetY = this.canvasHeight / 2 - (this.player.y * this.cellSize + this.cellSize / 2);
      // 绘制可见的迷宫部分
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const dx = x - this.player.x;
          const dy = y - this.player.y;
          if (Math.abs(dx) <= this.playerViewRange && Math.abs(dy) <= this.playerViewRange) {
            if (this.maze[y][x] === 1) {
              ctx.fillStyle = '#000';
              ctx.fillRect(
                x * this.cellSize + viewOffsetX,
                y * this.cellSize + viewOffsetY,
                this.cellSize,
                this.cellSize
              );
            }
          }
        }
      }
      // 绘制终点
      ctx.fillStyle = 'green';
      ctx.fillRect(
        (this.cols - 2) * this.cellSize + viewOffsetX,
        (this.rows - 2) * this.cellSize + viewOffsetY,
        this.cellSize,
        this.cellSize
      );
      // 绘制玩家（始终在屏幕中心）
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(this.canvasWidth / 2, this.canvasHeight / 2, this.cellSize / 3, 0, Math.PI * 2);
      ctx.fill();
    },
    handleKeyDown(event) {
      if (this.gameState !== 'playing') {
        return;
      }
      let dx = 0;
      let dy = 0;
      if (event.key === 'ArrowUp') dy = -1;
      if (event.key === 'ArrowDown') dy = 1;
      if (event.key === 'ArrowLeft') dx = -1;
      if (event.key === 'ArrowRight') dx = 1;
      if (dx !== 0 || dy !== 0) {
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
          this.visited.add(`${newX},${newY}`);
          this.drawMaze();
          this.checkGameState();
        }
      }
    },
    checkGameState() {
      // 检查是否到达终点
      if (this.player.x === this.cols - 2 && this.player.y === this.rows - 2) {
        this.gameState = 'won';
        clearInterval(this.gameInterval);
      } else {
        // 检查是否陷入死胡同
        const moves = [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
        ];
        let hasValidMove = false;
        for (let move of moves) {
          const nx = this.player.x + move.dx;
          const ny = this.player.y + move.dy;
          if (
            nx >= 0 &&
            nx < this.cols &&
            ny >= 0 &&
            ny < this.rows &&
            this.maze[ny][nx] === 0 &&
            !this.visited.has(`${nx},${ny}`)
          ) {
            hasValidMove = true;
            break;
          }
        }
        if (!hasValidMove) {
          // 陷入死胡同，重置玩家位置
          this.gameState = 'lost';
          this.attempts += 1;
          setTimeout(() => {
            this.resetPlayer();
          }, 1000);
        }
      }
    },
    resetPlayer() {
      this.player = { x: 1, y: 1 };
      this.visited.clear();
      this.gameState = 'playing';
      this.drawMaze();
    },
    resetGame() {
      window.removeEventListener('keydown', this.handleKeyDown);
      if (this.gameInterval) {
        clearInterval(this.gameInterval);
      }
      this.attempts = 0;
      this.gameTime = 0;
      this.initGame();
    },
  },
  mounted() {
    this.initGame();
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
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
  color: #fff;
}
canvas {
  background-color: #aaa;
}
.game-over {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 20px;
  color: #fff;
  text-align: center;
}
.game-over button {
  margin-top: 10px;
}
</style>