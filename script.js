        // Configurações do jogo
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        // Elementos da UI
        const menu = document.getElementById('menu');
        const options = document.getElementById('options');
        const gameOver = document.getElementById('game-over');
        const startBtn = document.getElementById('start-btn');
        const optionsBtn = document.getElementById('options-btn');
        const backBtn = document.getElementById('back-btn');
        const restartBtn = document.getElementById('restart-btn');
        const menuBtn = document.getElementById('menu-btn');
        const scoreDisplay = document.getElementById('score-display');
        const levelDisplay = document.getElementById('level-display');
        const finalScore = document.getElementById('final-score');
        const skinOptions = document.querySelectorAll('.skin-option');
        
        // Variáveis do jogo
        let snake = [];
        let apple = {};
        let enemies = [];
        let direction = 'right';
        let nextDirection = 'right';
        let score = 0;
        let level = 1;
        let gameSpeed = 120;
        let lastRenderTime = 0;
        let snakeColor = '#0ff';
        let appleColor = '#ff00ff';
        let enemyColor = '#ff0000';
        let selectedSkin = 'blue';
        let animationFrameId;
        let isGameRunning = false;
        
        // Inicializa o jogo
        function initGame() {
            // Configura a cobra inicial
            snake = [];
            for (let i = 3; i >= 0; i--) {
                snake.push({ x: i, y: 0 });
            }
            
            // Configura a maçã
            placeApple();
            
            // Limpa os inimigos
            enemies = [];
            
            // Reseta a direção e pontuação
            direction = 'right';
            nextDirection = 'right';
            score = 0;
            level = 1;
            gameSpeed = 120;
            
            // Atualiza a UI
            scoreDisplay.textContent = `Pontos: ${score}`;
            levelDisplay.textContent = `Nível: ${level}`;
            
            // Configura a cor baseado na skin selecionada
            setSkinColors();
        }
        
        // Define as cores baseado na skin selecionada
        function setSkinColors() {
            switch(selectedSkin) {
                case 'blue':
                    snakeColor = '#0ff';
                    appleColor = '#ff00ff';
                    enemyColor = '#ff0000';
                    break;
                case 'pink':
                    snakeColor = '#ff00ff';
                    appleColor = '#ffff00';
                    enemyColor = '#00ffff';
                    break;
                case 'green':
                    snakeColor = '#00ff00';
                    appleColor = '#ff00ff';
                    enemyColor = '#ffff00';
                    break;
                case 'purple':
                    snakeColor = '#9900ff';
                    appleColor = '#00ffcc';
                    enemyColor = '#ff6600';
                    break;
                case 'orange':
                    snakeColor = '#ff9900';
                    appleColor = '#00ffff';
                    enemyColor = '#ff00ff';
                    break;
                case 'cyan':
                    snakeColor = '#00ffff';
                    appleColor = '#ff9900';
                    enemyColor = '#ff00ff';
                    break;
                default:
                    snakeColor = '#0ff';
                    appleColor = '#ff00ff';
                    enemyColor = '#ff0000';
            }
        }
        
        // Posiciona a maçã em um local aleatório
        function placeApple() {
            apple = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
            
            // Verifica se a maçã não está em cima da cobra
            for (let i = 0; i < snake.length; i++) {
                if (apple.x === snake[i].x && apple.y === snake[i].y) {
                    placeApple();
                    return;
                }
            }
            
            // Verifica se a maçã não está em cima de um inimigo
            for (let i = 0; i < enemies.length; i++) {
                if (apple.x === enemies[i].x && apple.y === enemies[i].y) {
                    placeApple();
                    return;
                }
            }
        }
        
        // Adiciona um novo inimigo
        function addEnemy() {
            let enemy = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount),
                dx: Math.random() > 0.5 ? 1 : -1,
                dy: Math.random() > 0.5 ? 1 : -1
            };
            
            // Verifica se o inimigo não está em cima da cobra ou maçã
            let validPosition = true;
            for (let i = 0; i < snake.length; i++) {
                if (enemy.x === snake[i].x && enemy.y === snake[i].y) {
                    validPosition = false;
                    break;
                }
            }
            
            if (enemy.x === apple.x && enemy.y === apple.y) {
                validPosition = false;
            }
            
            if (validPosition) {
                enemies.push(enemy);
            } else {
                addEnemy(); // Tenta novamente
            }
        }
        
        // Atualiza a posição dos inimigos
        function updateEnemies() {
            for (let i = 0; i < enemies.length; i++) {
                // Movimento aleatório com tendência a seguir a cobra
                if (Math.random() > 0.7) {
                    // Tenta seguir a cobra
                    if (Math.random() > 0.5) {
                        enemies[i].dx = snake[0].x > enemies[i].x ? 1 : -1;
                    } else {
                        enemies[i].dy = snake[0].y > enemies[i].y ? 1 : -1;
                    }
                }
                
                // Aplica o movimento
                enemies[i].x += enemies[i].dx;
                enemies[i].y += enemies[i].dy;
                
                // Verifica colisão com as paredes
                if (enemies[i].x < 0 || enemies[i].x >= tileCount || 
                    enemies[i].y < 0 || enemies[i].y >= tileCount) {
                    // Inverte a direção
                    enemies[i].dx *= -1;
                    enemies[i].dy *= -1;
                    enemies[i].x += enemies[i].dx;
                    enemies[i].y += enemies[i].dy;
                }
            }
        }
        
        // Desenha o jogo
        function drawGame() {
            // Limpa o canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenha a cobra
            for (let i = 0; i < snake.length; i++) {
                const x = snake[i].x * gridSize;
                const y = snake[i].y * gridSize;
                const size = gridSize - 1;
                
                if (i === 0) {
                    // Cabeça da cobra
                    ctx.fillStyle = snakeColor;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = snakeColor;
                    ctx.fillRect(x, y, size, size);
                    ctx.shadowBlur = 0;
                    
                    // Contorno neon
                    ctx.strokeStyle = snakeColor;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x, y, size, size);
                } else {
                    // Corpo da cobra
                    const intensity = 1 - (i / snake.length) * 0.7;
                    const r = parseInt(snakeColor.substr(1, 2), 16) * intensity;
                    const g = parseInt(snakeColor.substr(3, 2), 16) * intensity;
                    const b = parseInt(snakeColor.substr(5, 2), 16) * intensity;
                    ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
                    ctx.shadowBlur = 10 - i * 0.1;
                    ctx.fillRect(x, y, size, size);
                    ctx.shadowBlur = 0;
                }
            }
            
            // Desenha a maçã
            const appleX = apple.x * gridSize + gridSize/2;
            const appleY = apple.y * gridSize + gridSize/2;
            const radius = gridSize/2 - 2;
            
            ctx.fillStyle = appleColor;
            ctx.shadowBlur = 20;
            ctx.shadowColor = appleColor;
            ctx.beginPath();
            ctx.arc(appleX, appleY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Desenha os inimigos
            for (let i = 0; i < enemies.length; i++) {
                const x = enemies[i].x * gridSize;
                const y = enemies[i].y * gridSize;
                const size = gridSize - 1;
                
                ctx.fillStyle = enemyColor;
                ctx.shadowBlur = 15;
                ctx.shadowColor = enemyColor;
                ctx.fillRect(x, y, size, size);
                ctx.shadowBlur = 0;
                
                // Contorno neon
                ctx.strokeStyle = enemyColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, size, size);
            }
        }
        
        // Atualiza o estado do jogo
        function updateGame() {
            // Atualiza a direção
            direction = nextDirection;
            
            // Calcula a nova posição da cabeça
            const head = { x: snake[0].x, y: snake[0].y };
            
            switch (direction) {
                case 'up':
                    head.y--;
                    break;
                case 'down':
                    head.y++;
                    break;
                case 'left':
                    head.x--;
                    break;
                case 'right':
                    head.x++;
                    break;
            }
            
            // Verifica colisão com as paredes
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                endGame();
                return;
            }
            
            // Verifica colisão com o próprio corpo
            for (let i = 0; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    endGame();
                    return;
                }
            }
            
            // Verifica colisão com inimigos
            for (let i = 0; i < enemies.length; i++) {
                if (head.x === enemies[i].x && head.y === enemies[i].y) {
                    endGame();
                    return;
                }
            }
            
            // Verifica se comeu a maçã
            if (head.x === apple.x && head.y === apple.y) {
                // Aumenta o tamanho da cobra
                snake.unshift(head);
                
                // Remove um inimigo aleatório se houver
                if (enemies.length > 0) {
                    const randomIndex = Math.floor(Math.random() * enemies.length);
                    enemies.splice(randomIndex, 1);
                }
                
                // Aumenta a pontuação
                score += 10;
                scoreDisplay.textContent = `Pontos: ${score}`;
                
                // Verifica se subiu de nível
                if (score % 50 === 0) {
                    level++;
                    levelDisplay.textContent = `Nível: ${level}`;
                    gameSpeed = Math.max(70, gameSpeed - 10);
                    
                    // Adiciona um novo inimigo a cada nível
                    addEnemy();
                }
                
                // Coloca uma nova maçã
                placeApple();
            } else {
                // Move a cobra normalmente
                snake.unshift(head);
                snake.pop();
            }
            
            // Atualiza os inimigos
            updateEnemies();
        }
        
        // Finaliza o jogo
        function endGame() {
            isGameRunning = false;
            gameOver.style.display = 'flex';
            finalScore.textContent = `Pontuação: ${score}`;
            cancelAnimationFrame(animationFrameId);
        }
        
        // Loop principal do jogo
        function gameLoop(timestamp) {
            if (!isGameRunning) return;
            
            if (!lastRenderTime) {
                lastRenderTime = timestamp;
            }
            
            const deltaTime = timestamp - lastRenderTime;
            
            if (deltaTime >= gameSpeed) {
                updateGame();
                drawGame();
                lastRenderTime = timestamp;
            }
            
            animationFrameId = requestAnimationFrame(gameLoop);
        }
        
        // Inicia o jogo
        function startGame() {
            if (isGameRunning) {
                cancelAnimationFrame(animationFrameId);
            }
            
            menu.style.display = 'none';
            gameOver.style.display = 'none';
            initGame();
            isGameRunning = true;
            lastRenderTime = 0;
            animationFrameId = requestAnimationFrame(gameLoop);
        }
        
        // Event listeners para controles
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowUp':
                    if (direction !== 'down') nextDirection = 'up';
                    break;
                case 'ArrowDown':
                    if (direction !== 'up') nextDirection = 'down';
                    break;
                case 'ArrowLeft':
                    if (direction !== 'right') nextDirection = 'left';
                    break;
                case 'ArrowRight':
                    if (direction !== 'left') nextDirection = 'right';
                    break;
            }
        });
        
        // Event listeners para botões da UI
        startBtn.addEventListener('click', startGame);
        
        optionsBtn.addEventListener('click', function() {
            menu.style.display = 'none';
            options.style.display = 'flex';
        });
        
        backBtn.addEventListener('click', function() {
            options.style.display = 'none';
            menu.style.display = 'flex';
        });
        
        restartBtn.addEventListener('click', startGame);
        
        menuBtn.addEventListener('click', function() {
            gameOver.style.display = 'none';
            menu.style.display = 'flex';
            isGameRunning = false;
            cancelAnimationFrame(animationFrameId);
        });
        
        // Event listeners para skins
        skinOptions.forEach(option => {
            option.addEventListener('click', function() {
                selectedSkin = this.getAttribute('data-skin');
                skinOptions.forEach(opt => {
                    opt.style.boxShadow = 'none';
                    opt.style.transform = 'scale(1)';
                });
                this.style.boxShadow = `0 0 15px ${this.style.color}`;
                this.style.transform = 'scale(1.1)';
            });
        });
        
        // Configura a skin padrão
        skinOptions[0].style.boxShadow = '0 0 15px #0ff';
        skinOptions[0].style.transform = 'scale(1.1)';
    