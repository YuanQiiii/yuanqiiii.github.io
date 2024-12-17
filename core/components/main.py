import pygame
import random
import math 
from enum import Enum

# 常量定义
CELL_SIZE = 40  # 增大格子大小
PLAYER_VIEW_RANGE = 5  # 减小视野范围为格子数

class Direction(Enum):
    NORTH = 0
    EAST = 1
    SOUTH = 2
    WEST = 3

class MazeGenerator:
    def __init__(self, width, height, seed=None):
        self.width = width
        self.height = height
        if seed:
            random.seed(seed)
        # 初始化迷宫，所有格子都是墙
        self.maze = [[1 for _ in range(width)] for _ in range(height)]
        self.start_pos = (1, 1)
        self.end_pos = (width-2, height-2)

    def _is_valid(self, x, y):
        return 0 <= x < self.width and 0 <= y < self.height

    def _get_neighbors(self, x, y):
        directions = [(0, 2), (2, 0), (0, -2), (-2, 0)]  # 四个方向
        random.shuffle(directions)  # 随机打乱方向
        neighbors = []
        for dx, dy in directions:
            new_x, new_y = x + dx, y + dy
            if (self._is_valid(new_x, new_y) and 
                self.maze[new_y][new_x] == 1):  # 如果是墙
                neighbors.append((new_x, new_y, dx//2, dy//2))
        return neighbors

    def _carve_path(self, x, y):
        self.maze[y][x] = 0  # 当前位置变为路径

        neighbors = self._get_neighbors(x, y)
        for next_x, next_y, wall_x, wall_y in neighbors:
            if self.maze[next_y][next_x] == 1:  # 如果下一个位置是墙
                # 打通墙
                self.maze[y + wall_y][x + wall_x] = 0
                self._carve_path(next_x, next_y)

    def generate(self):
        # 从起点开始生成迷宫
        self._carve_path(self.start_pos[0], self.start_pos[1])
        # 确保终点可达
        self.maze[self.end_pos[1]][self.end_pos[0]] = 0
        return self.maze

    def get_visible_area(self, player_pos, view_range):
        visible = [[False for _ in range(self.width)] for _ in range(self.height)]
        px, py = player_pos
        
        for y in range(max(0, py-view_range), min(self.height, py+view_range+1)):
            for x in range(max(0, px-view_range), min(self.width, px+view_range+1)):
                if (x-px)**2 + (y-py)**2 <= view_range**2:
                    visible[y][x] = True
        
        return visible

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.direction = Direction.NORTH
        self.visible_area = set()  # 添加可见区域属性
        self.current_visible = set()

    def _cast_ray(self, start_x, start_y, angle, maze, max_distance):
        dx = math.cos(angle)
        dy = math.sin(angle)
        x, y = float(start_x), float(start_y)
        step = 0.1
        
        for _ in range(int(max_distance / step)):
            grid_x = int(round(x))
            grid_y = int(round(y))
            
            if not (0 <= grid_x < len(maze[0]) and 0 <= grid_y < len(maze)):
                break
                
            self.current_visible.add((grid_x, grid_y))
            self.visible_area.add((grid_x, grid_y))  # 同时更新visible_area
            
            if maze[grid_y][grid_x] == 1:  # 碰到墙停止
                break
                
            x += dx * step
            y += dy * step

    def update_vision(self, maze):
        """更新视野范围"""
        self.current_visible.clear()
        self.visible_area.clear()  # 清除历史视野
        view_angle = math.pi * 2  # 360度视角
        rays = 360  # 射线数量
        
        # 将当前位置加入可见区域
        self.current_visible.add((self.x, self.y))
        self.visible_area.add((self.x, self.y))
        
        # 向四周发射射线
        for i in range(rays):
            angle = (2 * math.pi * i) / rays
            self._cast_ray(self.x, self.y, angle, maze, PLAYER_VIEW_RANGE)

    def move(self, dx, dy, maze):
        new_x = self.x + dx
        new_y = self.y + dy
        if (0 <= new_x < len(maze[0]) and 
            0 <= new_y < len(maze) and 
            maze[new_y][new_x] == 0):
            print(f"Moving from ({self.x},{self.y}) to ({new_x},{new_y})")
            self.x = new_x
            self.y = new_y
            self.update_vision(maze)
            return True
        return False

    def rotate(self, clockwise=True):
        current = self.direction.value
        if clockwise:
            self.direction = Direction((current + 1) % 4)
        else:
            self.direction = Direction((current - 1) % 4)

class Game:
    def __init__(self, width=15, height=15):
        pygame.init()
        self.width = width
        self.height = height
        # 设置窗口大小为固定值
        self.window_width = 960
        self.window_height = 720
        self.screen = pygame.display.set_mode((self.window_width, self.window_height))
        self.clock = pygame.time.Clock()
        
        # 计算偏移量以使玩家居中
        self.offset_x = self.window_width // 2
        self.offset_y = self.window_height // 2
        
        # 游戏状态
        self.attempts = 0
        self.start_time = pygame.time.get_ticks()
        self.game_time = 0
        self.state = "playing"  # playing, won, lost
        
        # 初始化迷宫和玩家
        self.maze_generator = MazeGenerator(width, height)
        self.maze = self.maze_generator.generate()
        self.reset_player()
        self.dead_ends = set()  # 存储死胡同位置
        self.check_dead_ends()
        self.visited = set()  # 添加已访问路径记录
        self.font = TextRenderer.create_font()
        self.game_over = False
        self.game_over_delay = 180  # 3秒
    
    def check_dead_ends(self):
        """计算所有死胡同位置"""
        self.dead_ends.clear()
        for y in range(self.height):
            for x in range(self.width):
                if self.maze[y][x] == 0:  # 如果是路径
                    # 检查四周可行方向
                    moves = [(0,1), (0,-1), (1,0), (-1,0)]
                    valid_moves = 0
                    for dx, dy in moves:
                        new_x = x + dx
                        new_y = y + dy
                        if (0 <= new_x < self.width and 
                            0 <= new_y < self.height and 
                            self.maze[new_y][new_x] == 0):
                            valid_moves += 1
                    # 如果只有一个出口,则为死胡同
                    if valid_moves == 1:
                        self.dead_ends.add((x, y))

    def reset_player(self):
        self.player = Player(1, 1)
        self.player.update_vision(self.maze)
        if self.state == "lost":
            self.attempts += 1
        self.state = "playing"
        
    def check_game_state(self):
        # 检查是否到达终点
        if (self.player.x, self.player.y) == (self.width-2, self.height-2):
            self.state = "won"
            self.game_time = (pygame.time.get_ticks() - self.start_time) // 1000
            return
        
        # 记录当前位置为已访问
        # self.visited.add((self.player.x, self.player.y))
        
        # # 检查是否进入死胡同
        # moves = [(0,1), (0,-1), (1,0), (-1,0)]
        # valid_moves = 0
        # for dx, dy in moves:
        #     new_x = self.player.x + dx
        #     new_y = self.player.y + dy
        #     # 检查是否是可行且未访问的路径
        #     if (0 <= new_x < self.width and 
        #         0 <= new_y < self.height and 
        #         self.maze[new_y][new_x] == 0 and 
        #         (new_x, new_y) not in self.visited):
        #         valid_moves += 1
                
        # # 只有在没有未访问的可行路径时才算死胡同
        # if valid_moves == 0:
        #     self.state = "lost"
        #     self.reset_player()
        #     self.visited.clear()  # 重置已访问记录

    def handle_input(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                print("Game quit requested")
            
            if self.state == "playing":
                if event.type == pygame.KEYDOWN:
                    moved = False
                    # 按键调试信息
                    if event.key == pygame.K_w:
                        print("按下W键")
                        moved = self.player.move(0, -1, self.maze)
                    elif event.key == pygame.K_s:
                        print("按下S键")
                        moved = self.player.move(0, 1, self.maze)
                    elif event.key == pygame.K_a:
                        print("按下A键")
                        moved = self.player.move(-1, 0, self.maze)
                    elif event.key == pygame.K_d:
                        print("按下D键")
                        moved = self.player.move(1, 0, self.maze)
                    elif event.key == pygame.K_q:
                        print("按下Q键")
                        self.player.rotate(False)
                        moved = True
                    elif event.key == pygame.K_e:
                        print("按下E键")
                        self.player.rotate(True)
                        moved = True
                    
                    if moved:
                        print(f"玩家当前位置: ({self.player.x}, {self.player.y})")
                        print(f"游戏状态: {self.state}")
                        self.check_game_state()
        if self.state == "won":
            keys = pygame.key.get_pressed()
            if keys[pygame.K_SPACE]:
                self.game_over = True

    def render(self):
        self.screen.fill((0, 0, 0))
        
        # 计算视图偏移量,加上CELL_SIZE/2使玩家位于格子中心
        view_offset_x = self.offset_x - (self.player.x * CELL_SIZE + CELL_SIZE/2)
        view_offset_y = self.offset_y - (self.player.y * CELL_SIZE + CELL_SIZE/2)
        
        # 绘制可见的迷宫部分
        for y in range(self.height):
            for x in range(self.width):
                # 获胜后显示全部地图,否则只显示可见区域
                if self.state == "won" or (x, y) in self.player.visible_area:
                    # 确定颜色
                    if (x, y) == (1, 1):  # 起点
                        color = (0, 255, 0)  # 绿色
                    elif (x, y) == (self.width-2, self.height-2):  # 终点
                        color = (0, 0, 255)  # 蓝色
                    # elif (x, y) in self.dead_ends:  # 死胡同
                    #     color = (255, 165, 0)  # 橙色
                    else:
                        color = (255, 255, 255) if self.maze[y][x] == 1 else (100, 100, 100)
                    
                    pygame.draw.rect(self.screen, color,
                                   (x * CELL_SIZE + view_offset_x,
                                    y * CELL_SIZE + view_offset_y,
                                    CELL_SIZE, CELL_SIZE))
        
        # 绘制玩家(始终在屏幕中心)
        pygame.draw.circle(self.screen, (255, 0, 0),
                         (self.offset_x, self.offset_y),
                         CELL_SIZE//3)
        
        # 绘制状态信息(固定位置)
        font = pygame.font.Font(None, 36)
        attempts_text = font.render(f"attempt: {self.attempts}", True, (255, 255, 255))
        time_text = font.render(f"time: {(pygame.time.get_ticks() - self.start_time)//1000}s", True, (255, 255, 255))
        self.screen.blit(attempts_text, (10, 10))
        self.screen.blit(time_text, (10, 50))
        
        if self.state == "won":
            bg = pygame.Surface((400, 200))
            bg.fill((0, 0, 0))
            bg.set_alpha(200)
            
            self.screen.blit(bg, (self.window_width//2 - 200, 
                                 self.window_height//2 - 100))
            
            win_text = self.font.render("恭喜通关!", True, (0, 255, 0))
            time_text = self.font.render(f"用时: {self.game_time}秒", True, (255, 255, 255))
            attempts_text = self.font.render(f"尝试次数: {self.attempts}", True, (255, 255, 255))
            continue_text = self.font.render("按空格键继续", True, (128, 128, 128))
            
            self.screen.blit(win_text, (self.window_width//2 - win_text.get_width()//2, 
                                      self.window_height//2 - 80))
            self.screen.blit(time_text, (self.window_width//2 - time_text.get_width()//2, 
                                       self.window_height//2 - 40))
            self.screen.blit(attempts_text, (self.window_width//2 - attempts_text.get_width()//2, 
                                          self.window_height//2))
            self.screen.blit(continue_text, (self.window_width//2 - continue_text.get_width()//2, 
                                           self.window_height//2 + 60))
        
        pygame.display.flip()

    def run(self):
        self.running = True
        while self.running:
            self.handle_input()
            self.render()
            self.clock.tick(60)
        
        pygame.quit()

class GameMenu:
    def __init__(self):
        pygame.init()
        self.width = 800
        self.height = 600
        self.screen = pygame.display.set_mode((self.width, self.height))
        self.clock = pygame.time.Clock()
        self.font = TextRenderer.create_font()
        self.selected = 0  # 当前选择的难度
        self.use_seed = False
        self.seed = None
        self.running = True

    def render(self):
        self.screen.fill((0, 0, 0))
        
        # 绘制标题
        title = self.font.render("迷宫游戏设置", True, (255, 255, 255))
        self.screen.blit(title, (self.width//2 - title.get_width()//2, 50))
        
        # 绘制难度选项
        difficulties = [
            "简单 (10x10)",
            "普通 (15x15)",
            "困难 (20x20)",
            "退出游戏"
        ]
        
        for i, text in enumerate(difficulties):
            color = (255, 255, 0) if i == self.selected else (255, 255, 255)
            text_surface = self.font.render(text, True, color)
            self.screen.blit(text_surface, 
                           (self.width//2 - text_surface.get_width()//2, 
                            200 + i * 50))
        
        # 绘制种子选项
        seed_text = f"使用随机种子: {'是' if self.use_seed else '否'}"
        seed_surface = self.font.render(seed_text, True, (255, 255, 255))
        self.screen.blit(seed_surface, 
                        (self.width//2 - seed_surface.get_width()//2, 400))
        
        if self.use_seed and self.seed is not None:
            seed_value = self.font.render(f"种子值: {self.seed}", True, (255, 255, 255))
            self.screen.blit(seed_value, 
                           (self.width//2 - seed_value.get_width()//2, 450))
        
        # 绘制操作提示
        help_text = "上下键选择难度 Space确认 S设置种子 Enter开始游戏"
        help_surface = self.font.render(help_text, True, (128, 128, 128))
        self.screen.blit(help_surface, 
                        (self.width//2 - help_surface.get_width()//2, 500))
        
        pygame.display.flip()

    def handle_input(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
                return None
            
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    self.selected = (self.selected - 1) % 3
                elif event.key == pygame.K_DOWN:
                    self.selected = (self.selected + 1) % 3
                elif event.key == pygame.K_s:
                    self.use_seed = not self.use_seed
                    if self.use_seed:
                        self.seed = random.randint(1, 9999)
                elif event.key == pygame.K_RETURN:
                    if self.selected == 3:  # 选择“退出游戏”
                        self.running = False
                        return None
                    else:
                        settings = {
                            0: {'size': (10, 10), 'view': 1},
                            1: {'size': (15, 15), 'view': 1},
                            2: {'size': (80, 80), 'view': 1}
                        }[self.selected]
                        return (settings['size'][0], settings['size'][1], 
                                settings['view'], self.seed if self.use_seed else None)
        return None

    def run(self):
        while self.running:
            result = self.handle_input()
            if result is not None:
                return result
            self.render()
            self.clock.tick(60)
        return None

class TextRenderer:
    @staticmethod
    def create_font():
        try:
            return pygame.font.Font("C:/Windows/Fonts/msyh.ttc", 36)
        except:
            try:
                return pygame.font.Font("C:/Windows/Fonts/simsun.ttc", 36)
            except:
                return pygame.font.Font(None, 36)

def main():
    while True:
        # 获取游戏设置
        menu = GameMenu()
        settings = menu.run()
        if settings is None:  # 用户关闭窗口
            break
            
        width, height, view_range, seed = settings
        global PLAYER_VIEW_RANGE
        PLAYER_VIEW_RANGE = view_range
        
        # 创建并运行游戏
        game = Game(width, height)
        if seed is not None:
            game.maze_generator = MazeGenerator(width, height, seed)
            game.maze = game.maze_generator.generate()
            game.reset_player()
        
        game.run()
        
        if game.state == "won":
            print(f"\n恭喜通关!")
            print(f"用时: {game.game_time}秒")
            print(f"尝试次数: {game.attempts}")
    
    print("感谢游玩!")

if __name__ == "__main__":
    main()