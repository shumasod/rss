import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  type: 'normal' | 'fast' | 'boss';
  hp: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export const ShootingGame: React.FC = () => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('shootingGameHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [level, setLevel] = useState(1);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 180, y: 500 });
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [playerHp, setPlayerHp] = useState(3);
  const [isInvincible, setIsInvincible] = useState(false);
  const [powerUp, setPowerUp] = useState(1);

  const bulletIdRef = useRef(0);
  const enemyIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const lastShotRef = useRef(0);

  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;
  const PLAYER_SIZE = 40;
  const BULLET_SIZE = 8;
  const ENEMY_SIZE = 35;

  // 爆発エフェクト生成
  const createExplosion = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        life: 20,
        color,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // プレイヤー移動
  const movePlayer = useCallback((direction: 'left' | 'right') => {
    setPlayerPos(prev => {
      const newX = direction === 'left' ? prev.x - 15 : prev.x + 15;
      return {
        ...prev,
        x: Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, newX)),
      };
    });
  }, []);

  // 弾発射
  const shoot = useCallback(() => {
    const now = Date.now();
    if (now - lastShotRef.current < 150) return;
    lastShotRef.current = now;

    const newBullets: Bullet[] = [];
    if (powerUp >= 1) {
      newBullets.push({
        id: bulletIdRef.current++,
        x: playerPos.x + PLAYER_SIZE / 2 - BULLET_SIZE / 2,
        y: playerPos.y,
      });
    }
    if (powerUp >= 2) {
      newBullets.push({
        id: bulletIdRef.current++,
        x: playerPos.x + 5,
        y: playerPos.y + 10,
      });
      newBullets.push({
        id: bulletIdRef.current++,
        x: playerPos.x + PLAYER_SIZE - 13,
        y: playerPos.y + 10,
      });
    }
    if (powerUp >= 3) {
      newBullets.push({
        id: bulletIdRef.current++,
        x: playerPos.x - 5,
        y: playerPos.y + 15,
      });
      newBullets.push({
        id: bulletIdRef.current++,
        x: playerPos.x + PLAYER_SIZE + 5 - BULLET_SIZE,
        y: playerPos.y + 15,
      });
    }
    setBullets(prev => [...prev, ...newBullets]);
  }, [playerPos, powerUp]);

  // キーボード操作
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer('right');
          break;
        case ' ':
        case 'z':
          shoot();
          break;
        case 'Escape':
        case 'p':
          setGameState('paused');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePlayer, shoot]);

  // 敵生成
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnEnemy = () => {
      const types: Array<'normal' | 'fast' | 'boss'> = ['normal', 'fast'];
      if (level >= 3 && Math.random() < 0.1) types.push('boss');

      const type = types[Math.floor(Math.random() * types.length)];
      const enemy: Enemy = {
        id: enemyIdRef.current++,
        x: Math.random() * (GAME_WIDTH - ENEMY_SIZE),
        y: -ENEMY_SIZE,
        type,
        hp: type === 'boss' ? 5 : type === 'fast' ? 1 : 2,
      };
      setEnemies(prev => [...prev, enemy]);
    };

    const interval = setInterval(spawnEnemy, Math.max(500, 2000 - level * 200));
    return () => clearInterval(interval);
  }, [gameState, level]);

  // ゲームループ
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // 弾移動
      setBullets(prev =>
        prev
          .map(b => ({ ...b, y: b.y - 12 }))
          .filter(b => b.y > -BULLET_SIZE)
      );

      // 敵移動
      setEnemies(prev =>
        prev
          .map(e => ({
            ...e,
            y: e.y + (e.type === 'fast' ? 4 : e.type === 'boss' ? 1.5 : 2.5),
            x: e.type === 'boss' ? e.x + Math.sin(e.y / 30) * 2 : e.x,
          }))
          .filter(e => e.y < GAME_HEIGHT + ENEMY_SIZE)
      );

      // パーティクル更新
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
          }))
          .filter(p => p.life > 0)
      );

      // 衝突判定：弾と敵
      setBullets(prevBullets => {
        let bulletsToRemove: number[] = [];

        setEnemies(prevEnemies => {
          const updatedEnemies = prevEnemies.map(enemy => {
            const hitBullet = prevBullets.find(
              bullet =>
                !bulletsToRemove.includes(bullet.id) &&
                bullet.x < enemy.x + ENEMY_SIZE &&
                bullet.x + BULLET_SIZE > enemy.x &&
                bullet.y < enemy.y + ENEMY_SIZE &&
                bullet.y + BULLET_SIZE > enemy.y
            );

            if (hitBullet) {
              bulletsToRemove.push(hitBullet.id);
              const newHp = enemy.hp - 1;
              if (newHp <= 0) {
                const points = enemy.type === 'boss' ? 500 : enemy.type === 'fast' ? 150 : 100;
                setScore(s => s + points);
                createExplosion(
                  enemy.x + ENEMY_SIZE / 2,
                  enemy.y + ENEMY_SIZE / 2,
                  enemy.type === 'boss' ? '#ff0' : '#f80'
                );
                // パワーアップドロップ
                if (Math.random() < 0.1) {
                  setPowerUp(p => Math.min(3, p + 1));
                }
                return null;
              }
              return { ...enemy, hp: newHp };
            }
            return enemy;
          }).filter((e): e is Enemy => e !== null);

          return updatedEnemies;
        });

        return prevBullets.filter(b => !bulletsToRemove.includes(b.id));
      });

      // 衝突判定：敵とプレイヤー
      if (!isInvincible) {
        setEnemies(prev => {
          const collision = prev.find(
            enemy =>
              playerPos.x < enemy.x + ENEMY_SIZE &&
              playerPos.x + PLAYER_SIZE > enemy.x &&
              playerPos.y < enemy.y + ENEMY_SIZE &&
              playerPos.y + PLAYER_SIZE > enemy.y
          );

          if (collision) {
            setPlayerHp(hp => {
              const newHp = hp - 1;
              if (newHp <= 0) {
                setGameState('gameover');
                if (score > highScore) {
                  setHighScore(score);
                  localStorage.setItem('shootingGameHighScore', score.toString());
                }
              }
              return newHp;
            });
            setIsInvincible(true);
            setPowerUp(1);
            createExplosion(playerPos.x + PLAYER_SIZE / 2, playerPos.y + PLAYER_SIZE / 2, '#0ff');
            setTimeout(() => setIsInvincible(false), 2000);
            return prev.filter(e => e.id !== collision.id);
          }
          return prev;
        });
      }

      // レベルアップ
      setScore(s => {
        if (s > 0 && s % 1000 < 10) {
          setLevel(l => l + 1);
        }
        return s;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameState, playerPos, isInvincible, createExplosion, score, highScore]);

  // ゲーム開始
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setPlayerHp(3);
    setPlayerPos({ x: 180, y: 500 });
    setBullets([]);
    setEnemies([]);
    setParticles([]);
    setPowerUp(1);
    setIsInvincible(false);
  };

  // タッチ/マウス操作
  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - PLAYER_SIZE / 2;
    setPlayerPos(prev => ({
      ...prev,
      x: Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, x)),
    }));
  };

  const handlePointerDown = () => {
    if (gameState === 'playing') {
      shoot();
    }
  };

  return (
    <div className="shooting-game-container">
      <div className="game-header">
        <h2>🚀 SPACE SHOOTER</h2>
        <p className="game-subtitle">〜 選挙の日は投票して外食してゲーム 〜</p>
      </div>

      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">SCORE</span>
          <span className="stat-value">{score.toString().padStart(8, '0')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">HI-SCORE</span>
          <span className="stat-value">{highScore.toString().padStart(8, '0')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">LEVEL</span>
          <span className="stat-value">{level}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">HP</span>
          <span className="stat-value">{'❤️'.repeat(playerHp)}{'🖤'.repeat(3 - playerHp)}</span>
        </div>
      </div>

      <div
        ref={gameAreaRef}
        className="game-area"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {/* 背景の星 */}
        <div className="stars-bg" />

        {gameState === 'title' && (
          <div className="game-overlay">
            <div className="title-screen">
              <h1>🛸 SPACE SHOOTER</h1>
              <p className="instructions">
                ← → or A D : 移動<br />
                SPACE or Z : 発射<br />
                ESC or P : ポーズ
              </p>
              <p className="touch-instruction">
                📱 タッチ/マウスでも操作可能
              </p>
              <button className="start-btn" onClick={startGame}>
                🎮 GAME START
              </button>
            </div>
          </div>
        )}

        {gameState === 'paused' && (
          <div className="game-overlay">
            <div className="pause-screen">
              <h2>⏸️ PAUSED</h2>
              <button className="resume-btn" onClick={() => setGameState('playing')}>
                ▶️ RESUME
              </button>
              <button className="quit-btn" onClick={() => setGameState('title')}>
                🏠 TITLE
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="game-overlay">
            <div className="gameover-screen">
              <h2>💥 GAME OVER</h2>
              <p className="final-score">SCORE: {score}</p>
              {score >= highScore && score > 0 && (
                <p className="new-record">🏆 NEW RECORD!</p>
              )}
              <button className="retry-btn" onClick={startGame}>
                🔄 RETRY
              </button>
              <button className="quit-btn" onClick={() => setGameState('title')}>
                🏠 TITLE
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            {/* プレイヤー */}
            <div
              className={`player ${isInvincible ? 'invincible' : ''}`}
              style={{
                left: playerPos.x,
                top: playerPos.y,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
              }}
            >
              🚀
            </div>

            {/* 弾 */}
            {bullets.map(bullet => (
              <div
                key={bullet.id}
                className="bullet"
                style={{
                  left: bullet.x,
                  top: bullet.y,
                  width: BULLET_SIZE,
                  height: BULLET_SIZE,
                }}
              />
            ))}

            {/* 敵 */}
            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className={`enemy enemy-${enemy.type}`}
                style={{
                  left: enemy.x,
                  top: enemy.y,
                  width: ENEMY_SIZE,
                  height: ENEMY_SIZE,
                }}
              >
                {enemy.type === 'boss' ? '👾' : enemy.type === 'fast' ? '🛸' : '👽'}
              </div>
            ))}

            {/* パーティクル */}
            {particles.map(particle => (
              <div
                key={particle.id}
                className="particle"
                style={{
                  left: particle.x,
                  top: particle.y,
                  backgroundColor: particle.color,
                  opacity: particle.life / 20,
                }}
              />
            ))}
          </>
        )}

        {/* パワーアップ表示 */}
        {gameState === 'playing' && powerUp > 1 && (
          <div className="power-indicator">
            POWER: {'⚡'.repeat(powerUp)}
          </div>
        )}
      </div>

      <div className="game-controls-mobile">
        <button
          className="control-btn left-btn"
          onPointerDown={() => movePlayer('left')}
        >
          ◀
        </button>
        <button
          className="control-btn shoot-btn"
          onPointerDown={shoot}
        >
          🔥
        </button>
        <button
          className="control-btn right-btn"
          onPointerDown={() => movePlayer('right')}
        >
          ▶
        </button>
      </div>

      <div className="game-tips">
        <h3>💡 ゲームのコツ</h3>
        <ul>
          <li>敵を倒すとスコアアップ！</li>
          <li>ボス (👾) は高得点だけどHP多め</li>
          <li>たまにパワーアップがドロップ</li>
          <li>1000点ごとにレベルアップ、敵が増える！</li>
        </ul>
      </div>
    </div>
  );
};

export default ShootingGame;
