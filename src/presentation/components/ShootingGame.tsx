import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

type WeaponType = 'ballot' | 'laser' | 'homing' | 'spread' | 'ultimate';

interface Weapon {
  id: WeaponType;
  name: string;
  icon: string;
  description: string;
  damage: number;
  fireRate: number;
  color: string;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weapon: WeaponType;
  targetId?: number;
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

const WEAPONS: Weapon[] = [
  {
    id: 'ballot',
    name: '投票券ソード',
    icon: '🗳️',
    description: '剣のように尖った投票券！貫通攻撃',
    damage: 2,
    fireRate: 200,
    color: '#ff6b6b',
  },
  {
    id: 'laser',
    name: 'レーザービーム',
    icon: '⚡',
    description: '高速連射レーザー',
    damage: 1,
    fireRate: 80,
    color: '#0ff',
  },
  {
    id: 'homing',
    name: 'ホーミングミサイル',
    icon: '🎯',
    description: '敵を追尾する誘導弾',
    damage: 3,
    fireRate: 400,
    color: '#f0f',
  },
  {
    id: 'spread',
    name: 'スプレッドショット',
    icon: '💥',
    description: '扇状に広がる弾幕',
    damage: 1,
    fireRate: 250,
    color: '#ff0',
  },
  {
    id: 'ultimate',
    name: '最強モード',
    icon: '🌟',
    description: '全武器同時発射！究極の破壊力',
    damage: 5,
    fireRate: 150,
    color: '#fff',
  },
];

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
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('ballot');
  const [unlockedWeapons, setUnlockedWeapons] = useState<WeaponType[]>(['ballot']);
  const [ultimateGauge, setUltimateGauge] = useState(0);
  const [isUltimateActive, setIsUltimateActive] = useState(false);

  const bulletIdRef = useRef(0);
  const enemyIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const lastShotRef = useRef(0);

  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;
  const PLAYER_SIZE = 40;
  const BULLET_SIZE = 10;
  const ENEMY_SIZE = 35;
  const ULTIMATE_MAX = 100;

  const getCurrentWeaponData = useCallback(() => {
    return WEAPONS.find(w => w.id === currentWeapon) || WEAPONS[0];
  }, [currentWeapon]);

  // 武器切り替え
  const switchWeapon = useCallback((direction: 'next' | 'prev' | WeaponType) => {
    if (typeof direction === 'string' && direction !== 'next' && direction !== 'prev') {
      if (unlockedWeapons.includes(direction) || direction === 'ultimate' && ultimateGauge >= ULTIMATE_MAX) {
        setCurrentWeapon(direction);
      }
      return;
    }

    const currentIndex = unlockedWeapons.indexOf(currentWeapon);
    let newIndex: number;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % unlockedWeapons.length;
    } else {
      newIndex = currentIndex - 1 < 0 ? unlockedWeapons.length - 1 : currentIndex - 1;
    }

    setCurrentWeapon(unlockedWeapons[newIndex]);
  }, [currentWeapon, unlockedWeapons, ultimateGauge]);

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
    const weapon = getCurrentWeaponData();
    if (now - lastShotRef.current < weapon.fireRate) return;
    lastShotRef.current = now;

    const newBullets: Bullet[] = [];
    const centerX = playerPos.x + PLAYER_SIZE / 2;
    const centerY = playerPos.y;

    const activeWeapon = isUltimateActive ? 'ultimate' : currentWeapon;

    switch (activeWeapon) {
      case 'ballot':
        // 投票券ソード - 剣のような大きな弾
        for (let i = 0; i < powerUp; i++) {
          newBullets.push({
            id: bulletIdRef.current++,
            x: centerX - 6 + (i - 1) * 15,
            y: centerY,
            vx: 0,
            vy: -14,
            weapon: 'ballot',
          });
        }
        break;

      case 'laser':
        // レーザー - 高速連射
        newBullets.push({
          id: bulletIdRef.current++,
          x: centerX - 2,
          y: centerY,
          vx: 0,
          vy: -20,
          weapon: 'laser',
        });
        if (powerUp >= 2) {
          newBullets.push({
            id: bulletIdRef.current++,
            x: centerX - 12,
            y: centerY + 5,
            vx: -1,
            vy: -18,
            weapon: 'laser',
          });
          newBullets.push({
            id: bulletIdRef.current++,
            x: centerX + 8,
            y: centerY + 5,
            vx: 1,
            vy: -18,
            weapon: 'laser',
          });
        }
        break;

      case 'homing':
        // ホーミング - 追尾弾
        newBullets.push({
          id: bulletIdRef.current++,
          x: centerX - 4,
          y: centerY,
          vx: 0,
          vy: -8,
          weapon: 'homing',
        });
        break;

      case 'spread':
        // スプレッド - 扇状
        const spreadAngles = [-0.4, -0.2, 0, 0.2, 0.4];
        const numShots = Math.min(powerUp + 2, 5);
        const selectedAngles = spreadAngles.slice(
          Math.floor((5 - numShots) / 2),
          Math.floor((5 - numShots) / 2) + numShots
        );
        selectedAngles.forEach(angle => {
          newBullets.push({
            id: bulletIdRef.current++,
            x: centerX - 4,
            y: centerY,
            vx: Math.sin(angle) * 8,
            vy: -Math.cos(angle) * 12,
            weapon: 'spread',
          });
        });
        break;

      case 'ultimate':
        // 最強モード - 全武器同時
        // 投票券
        newBullets.push({
          id: bulletIdRef.current++,
          x: centerX - 6,
          y: centerY,
          vx: 0,
          vy: -16,
          weapon: 'ballot',
        });
        // レーザー
        [-15, 0, 15].forEach(offset => {
          newBullets.push({
            id: bulletIdRef.current++,
            x: centerX + offset - 2,
            y: centerY + 10,
            vx: offset * 0.1,
            vy: -22,
            weapon: 'laser',
          });
        });
        // ホーミング
        [-1, 1].forEach(dir => {
          newBullets.push({
            id: bulletIdRef.current++,
            x: centerX + dir * 20 - 4,
            y: centerY + 5,
            vx: dir * 2,
            vy: -6,
            weapon: 'homing',
          });
        });
        // スプレッド
        [-0.3, 0.3].forEach(angle => {
          newBullets.push({
            id: bulletIdRef.current++,
            x: centerX - 4,
            y: centerY + 15,
            vx: Math.sin(angle) * 10,
            vy: -Math.cos(angle) * 10,
            weapon: 'spread',
          });
        });
        break;
    }

    setBullets(prev => [...prev, ...newBullets]);
  }, [playerPos, powerUp, currentWeapon, isUltimateActive, getCurrentWeaponData]);

  // 最強モード発動
  const activateUltimate = useCallback(() => {
    if (ultimateGauge >= ULTIMATE_MAX && !isUltimateActive) {
      setIsUltimateActive(true);
      setUltimateGauge(0);
      createExplosion(playerPos.x + PLAYER_SIZE / 2, playerPos.y + PLAYER_SIZE / 2, '#fff');
      setTimeout(() => {
        setIsUltimateActive(false);
      }, 5000); // 5秒間持続
    }
  }, [ultimateGauge, isUltimateActive, playerPos, createExplosion]);

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
        case 'x':
        case 'X':
          switchWeapon('next');
          break;
        case 'c':
        case 'C':
          activateUltimate();
          break;
        case '1':
          switchWeapon('ballot');
          break;
        case '2':
          switchWeapon('laser');
          break;
        case '3':
          switchWeapon('homing');
          break;
        case '4':
          switchWeapon('spread');
          break;
        case '5':
          if (ultimateGauge >= ULTIMATE_MAX) activateUltimate();
          break;
        case 'Escape':
        case 'p':
          setGameState('paused');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePlayer, shoot, switchWeapon, activateUltimate, ultimateGauge]);

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
      // 弾移動（ホーミング対応）
      setBullets(prev => {
        return prev
          .map(b => {
            let newVx = b.vx;
            let newVy = b.vy;

            // ホーミング弾の追尾処理
            if (b.weapon === 'homing') {
              const nearestEnemy = enemies.reduce<{ enemy: Enemy | null; dist: number }>(
                (nearest, enemy) => {
                  const dx = enemy.x + ENEMY_SIZE / 2 - b.x;
                  const dy = enemy.y + ENEMY_SIZE / 2 - b.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < nearest.dist) {
                    return { enemy, dist };
                  }
                  return nearest;
                },
                { enemy: null, dist: Infinity }
              );

              if (nearestEnemy.enemy && nearestEnemy.dist < 200) {
                const dx = nearestEnemy.enemy.x + ENEMY_SIZE / 2 - b.x;
                const dy = nearestEnemy.enemy.y + ENEMY_SIZE / 2 - b.y;
                const angle = Math.atan2(dy, dx);
                const speed = 10;
                newVx = newVx * 0.9 + Math.cos(angle) * speed * 0.1;
                newVy = newVy * 0.9 + Math.sin(angle) * speed * 0.1;
              }
            }

            return {
              ...b,
              x: b.x + newVx,
              y: b.y + newVy,
              vx: newVx,
              vy: newVy,
            };
          })
          .filter(b => b.y > -20 && b.y < GAME_HEIGHT && b.x > -20 && b.x < GAME_WIDTH + 20);
      });

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
        const bulletsToRemove: number[] = [];
        const isPiercing = (weapon: WeaponType) => weapon === 'ballot';

        setEnemies(prevEnemies => {
          const updatedEnemies = prevEnemies.map(enemy => {
            const hitBullets = prevBullets.filter(
              bullet =>
                !bulletsToRemove.includes(bullet.id) &&
                bullet.x < enemy.x + ENEMY_SIZE &&
                bullet.x + BULLET_SIZE > enemy.x &&
                bullet.y < enemy.y + ENEMY_SIZE &&
                bullet.y + BULLET_SIZE > enemy.y
            );

            if (hitBullets.length > 0) {
              let totalDamage = 0;
              hitBullets.forEach(bullet => {
                const weaponData = WEAPONS.find(w => w.id === bullet.weapon);
                totalDamage += weaponData?.damage || 1;
                if (!isPiercing(bullet.weapon)) {
                  bulletsToRemove.push(bullet.id);
                }
              });

              const newHp = enemy.hp - totalDamage;
              if (newHp <= 0) {
                const points = enemy.type === 'boss' ? 500 : enemy.type === 'fast' ? 150 : 100;
                setScore(s => s + points);
                setUltimateGauge(g => Math.min(ULTIMATE_MAX, g + (enemy.type === 'boss' ? 20 : 5)));
                createExplosion(
                  enemy.x + ENEMY_SIZE / 2,
                  enemy.y + ENEMY_SIZE / 2,
                  enemy.type === 'boss' ? '#ff0' : '#f80'
                );
                // パワーアップまたは武器ドロップ
                if (Math.random() < 0.15) {
                  const rand = Math.random();
                  if (rand < 0.5) {
                    setPowerUp(p => Math.min(3, p + 1));
                  } else {
                    // 新武器アンロック
                    const lockedWeapons = WEAPONS.filter(
                      w => w.id !== 'ultimate' && !unlockedWeapons.includes(w.id)
                    );
                    if (lockedWeapons.length > 0) {
                      const newWeapon = lockedWeapons[Math.floor(Math.random() * lockedWeapons.length)];
                      setUnlockedWeapons(prev => [...prev, newWeapon.id]);
                    } else {
                      setPowerUp(p => Math.min(3, p + 1));
                    }
                  }
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
  }, [gameState, playerPos, isInvincible, createExplosion, score, highScore, enemies, unlockedWeapons]);

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
    setCurrentWeapon('ballot');
    setUnlockedWeapons(['ballot']);
    setUltimateGauge(0);
    setIsUltimateActive(false);
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

  const weaponData = getCurrentWeaponData();

  const getBulletStyle = (bullet: Bullet) => {
    const weapon = WEAPONS.find(w => w.id === bullet.weapon);
    const baseStyle = {
      left: bullet.x,
      top: bullet.y,
    };

    switch (bullet.weapon) {
      case 'ballot':
        return {
          ...baseStyle,
          width: 12,
          height: 25,
          background: `linear-gradient(180deg, ${weapon?.color} 0%, #fff 50%, ${weapon?.color} 100%)`,
          borderRadius: '2px 2px 50% 50%',
          transform: 'rotate(0deg)',
          boxShadow: `0 0 10px ${weapon?.color}`,
        };
      case 'laser':
        return {
          ...baseStyle,
          width: 4,
          height: 20,
          background: `linear-gradient(180deg, ${weapon?.color}, transparent)`,
          borderRadius: '2px',
          boxShadow: `0 0 15px ${weapon?.color}`,
        };
      case 'homing':
        return {
          ...baseStyle,
          width: 10,
          height: 10,
          background: weapon?.color,
          borderRadius: '50%',
          boxShadow: `0 0 12px ${weapon?.color}, 0 0 24px ${weapon?.color}`,
        };
      case 'spread':
        return {
          ...baseStyle,
          width: 8,
          height: 8,
          background: weapon?.color,
          borderRadius: '50%',
          boxShadow: `0 0 8px ${weapon?.color}`,
        };
      default:
        return {
          ...baseStyle,
          width: BULLET_SIZE,
          height: BULLET_SIZE,
          background: '#0ff',
          borderRadius: '50%',
        };
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

      {/* 武器選択UI */}
      {gameState === 'playing' && (
        <div className="weapon-selector">
          <div className="weapon-current">
            <span className="weapon-icon">{isUltimateActive ? '🌟' : weaponData.icon}</span>
            <span className="weapon-name">{isUltimateActive ? '最強モード発動中!' : weaponData.name}</span>
          </div>
          <div className="weapon-list">
            {WEAPONS.filter(w => w.id !== 'ultimate').map((weapon, index) => (
              <button
                key={weapon.id}
                className={`weapon-btn ${currentWeapon === weapon.id ? 'active' : ''} ${
                  unlockedWeapons.includes(weapon.id) ? '' : 'locked'
                }`}
                onClick={() => unlockedWeapons.includes(weapon.id) && switchWeapon(weapon.id)}
                disabled={!unlockedWeapons.includes(weapon.id)}
                title={weapon.description}
              >
                <span className="weapon-key">{index + 1}</span>
                <span>{weapon.icon}</span>
              </button>
            ))}
          </div>
          <div className="ultimate-gauge">
            <div className="gauge-label">ULTIMATE</div>
            <div className="gauge-bar">
              <div
                className="gauge-fill"
                style={{ width: `${(ultimateGauge / ULTIMATE_MAX) * 100}%` }}
              />
            </div>
            <button
              className={`ultimate-btn ${ultimateGauge >= ULTIMATE_MAX ? 'ready' : ''}`}
              onClick={activateUltimate}
              disabled={ultimateGauge < ULTIMATE_MAX || isUltimateActive}
            >
              🌟 C
            </button>
          </div>
        </div>
      )}

      <div
        ref={gameAreaRef}
        className={`game-area ${isUltimateActive ? 'ultimate-active' : ''}`}
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
                X : 武器切替<br />
                1-4 : 武器選択<br />
                C : 最強モード<br />
                ESC : ポーズ
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
              className={`player ${isInvincible ? 'invincible' : ''} ${isUltimateActive ? 'ultimate' : ''}`}
              style={{
                left: playerPos.x,
                top: playerPos.y,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
              }}
            >
              {isUltimateActive ? '⭐' : '🚀'}
            </div>

            {/* 弾 */}
            {bullets.map(bullet => (
              <div
                key={bullet.id}
                className={`bullet bullet-${bullet.weapon}`}
                style={getBulletStyle(bullet)}
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
          className="control-btn weapon-switch-btn"
          onPointerDown={() => switchWeapon('next')}
        >
          {weaponData.icon}
        </button>
        <button
          className="control-btn shoot-btn"
          onPointerDown={shoot}
        >
          🔥
        </button>
        <button
          className={`control-btn ultimate-mobile-btn ${ultimateGauge >= ULTIMATE_MAX ? 'ready' : ''}`}
          onPointerDown={activateUltimate}
          disabled={ultimateGauge < ULTIMATE_MAX}
        >
          🌟
        </button>
        <button
          className="control-btn right-btn"
          onPointerDown={() => movePlayer('right')}
        >
          ▶
        </button>
      </div>

      <div className="game-tips">
        <h3>💡 武器ガイド</h3>
        <ul>
          <li>🗳️ <strong>投票券ソード</strong> - 貫通する剣型弾！民主主義の力</li>
          <li>⚡ <strong>レーザー</strong> - 高速連射で弾幕形成</li>
          <li>🎯 <strong>ホーミング</strong> - 敵を追尾する誘導弾</li>
          <li>💥 <strong>スプレッド</strong> - 扇状に広がる弾幕</li>
          <li>🌟 <strong>最強モード</strong> - ゲージMAXで発動！全武器同時発射</li>
        </ul>
      </div>
    </div>
  );
};

export default ShootingGame;
