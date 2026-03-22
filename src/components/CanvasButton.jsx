import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PixelSprite from '../sprites/PixelSprite';
import AnimatedSprite from '../sprites/animations/AnimatedSprite';
import YoshiTongue from '../sprites/animations/YoshiTongue';
import YoshiEgg from './YoshiEgg';
import NPC from './NPC';
import WaluigiMinion from './WaluigiMinion';
import CharacterLabel from './CharacterLabel';
import { pipeSheet, ALLOWED_PIPE_COLORS } from '../sprites/sheets/pipes';
import { yoshiSheet, YOSHI_ANIMATIONS } from '../sprites/sheets/yoshi';
import { eggSheet } from '../sprites/sheets/egg';
import { balloonSheet, BALLOON_ANIMATIONS, BALLOON_SCALE, BALLOON_COLORS } from '../sprites/sheets/balloon';
import Balloon from './Balloon';
import { peachSheet, PEACH_ANIMATIONS, PEACH_SCALE } from '../sprites/sheets/peach';
import { toadetteSheet, TOADETTE_ANIMATIONS, TOADETTE_SCALE } from '../sprites/sheets/toadette';
import { luigiSheet, LUIGI_ANIMATIONS, LUIGI_SCALE } from '../sprites/sheets/luigi';
import { booSheet as booNPCSheet, BOO_ANIMATIONS, BOO_SCALE } from '../sprites/sheets/boo';
import { waluigiSheet, WALUIGI_ANIMATIONS, WALUIGI_SCALE } from '../sprites/sheets/waluigi';
import useCharacterController from '../hooks/useCharacterController';
import MobileJoystick from './MobileJoystick';


const PIPE_SCALE = 2;
const CHARACTER_SCALE = 2;

const NPC_QUEUE = [
  { id: 'peach', sheet: peachSheet, animations: PEACH_ANIMATIONS, scale: PEACH_SCALE, facesRight: false },
  { id: 'toadette', sheet: toadetteSheet, animations: TOADETTE_ANIMATIONS, scale: TOADETTE_SCALE },
  { id: 'luigi', sheet: luigiSheet, animations: LUIGI_ANIMATIONS, scale: LUIGI_SCALE, launchSpeed: 650 },
  { id: 'boo', sheet: booNPCSheet, animations: BOO_ANIMATIONS, scale: BOO_SCALE },
  { id: 'waluigi', sheet: waluigiSheet, animations: WALUIGI_ANIMATIONS, scale: WALUIGI_SCALE },
];

const NPC_NAME_MAP = {
  peach: 'erinn',
  toadette: 'tay',
  luigi: 'brooke',
  boo: 'wendy',
  waluigi: 'hayley',
};

const NPC_PHOTO_MAP = {
  peach: '/assets/bridal_party/erinn.png',
  toadette: '/assets/bridal_party/tay.jpg',
  luigi: '/assets/bridal_party/brooke.jpg',
  boo: '/assets/bridal_party/wendy.jpg',
  waluigi: '/assets/bridal_party/hayley.png',
};

const GHIBLI_PALETTE = [
  '#93b5c6', '#c9cba3', '#ffe1a8', '#e26d5c', '#7ec4cf',
  '#d4a5a5', '#a8d8ea', '#f7c5a8', '#b5cda3', '#f0e6c0',
  '#c2b0c9', '#f4a9a8', '#8fcaca', '#e8d5b7',
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildNPCColors() {
  const shuffled = shuffleArray(GHIBLI_PALETTE);
  const ids = Object.keys(NPC_NAME_MAP);
  const map = {};
  ids.forEach((id, i) => { map[id] = shuffled[i]; });
  return map;
}

function pickRandomColor(exclude) {
  const choices = ALLOWED_PIPE_COLORS.filter(c => c !== exclude);
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function CanvasButton({ onClick, onOpenModal }) {
  const [pipeState, setPipeState] = useState('hidden');
  const [pipeColor, setPipeColor] = useState('green');
  const [pipeLeft, setPipeLeft] = useState(0);
  const [characterState, setCharacterState] = useState('hidden');
  const [recalling, setRecalling] = useState(false);
  const buttonRef = useRef(null);
  const wrapperRef = useRef(null);
  const clipRef = useRef(null);
  const npcColorsRef = useRef(buildNPCColors());
  const recallingRef = useRef(false);
  recallingRef.current = recalling;

  // Calculate bounds for character movement based on viewport
  const [moveBounds, setMoveBounds] = useState({ left: 0, right: 400 });

  useEffect(() => {
    const updateBounds = () => {
      if (wrapperRef.current && clipRef.current) {
        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const clipRect = clipRef.current.getBoundingClientRect();
        const left = wrapperRect.left - clipRect.left;
        const right = wrapperRect.right - clipRect.left;
        setMoveBounds({ left, right });
      }
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Pipe dimensions for platform collision
  const pipeWidth = 32 * PIPE_SCALE;
  const pipeHeight = 32 * PIPE_SCALE;
  const pipeLeftRef = useRef(pipeLeft);
  pipeLeftRef.current = pipeLeft;
  const leftPipe = useRef(false);

  // Once character steps off the pipe, pipe is no longer a platform
  const getGroundLevel = useCallback((xPos) => {
    if (!leftPipe.current) {
      const pipeCenterX = pipeLeftRef.current;
      const halfPipe = pipeWidth / 2;
      if (xPos >= pipeCenterX - halfPipe && xPos <= pipeCenterX + halfPipe) {
        return pipeHeight;
      }
      leftPipe.current = true;
    }
    return 0;
  }, [pipeWidth, pipeHeight]);

  // NPC state
  const [activeNPCs, setActiveNPCs] = useState([]);
  const npcQueueIndex = useRef(0);
  const npcSpawnTimer = useRef(null);
  const npcPositionsRef = useRef([]);

  const getNPCPositions = useCallback(() => npcPositionsRef.current, []);

  const handleNPCPositionUpdate = useCallback((npcId, newX, newY) => {
    const positions = npcPositionsRef.current;
    const existing = positions.find(p => p.id === npcId);
    if (existing) {
      existing.x = newX;
      existing.y = newY ?? 0;
    } else {
      npcPositionsRef.current = [...positions, { id: npcId, x: newX, y: newY ?? 0 }];
    }
  }, []);

  const launchNextNPC = useCallback(() => {
    if (npcQueueIndex.current >= NPC_QUEUE.length) return;
    const config = NPC_QUEUE[npcQueueIndex.current];
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const npc = { ...config, launchDirection: 'left' };
    if (isMobile && npc.launchSpeed) npc.launchSpeed = npc.launchSpeed * 0.75;
    setActiveNPCs(prev => [...prev, npc]);
    npcQueueIndex.current += 1;

    // Spawn 2 walk-off minions when waluigi launches
    if (config.id === 'waluigi') {
      const id1 = ++minionIdRef.current;
      const id2 = ++minionIdRef.current;
      setMinions(prev => [
        ...prev,
        { id: id1, direction: 'left' },
        { id: id2, direction: 'right' },
      ]);
    }
  }, []);

  const handleNPCLanded = useCallback((npcId, landedX) => {
    npcPositionsRef.current = npcPositionsRef.current
      .filter(p => p.id !== npcId)
      .concat({ id: npcId, x: landedX });
    // Don't launch next NPC if recalling
    if (!recallingRef.current) {
      npcSpawnTimer.current = setTimeout(() => {
        launchNextNPC();
      }, 1000);
    }
  }, [launchNextNPC]);

  // NPC returned to pipe during recall
  const handleNPCReturned = useCallback((npcId) => {
    setActiveNPCs(prev => prev.filter(n => n.id !== npcId));
    npcPositionsRef.current = npcPositionsRef.current.filter(p => p.id !== npcId);
  }, []);

  // Start NPC spawn sequence when Yoshi becomes active
  const spawnStarted = useRef(false);
  useEffect(() => {
    if (characterState === 'active' && !spawnStarted.current && !recalling) {
      spawnStarted.current = true;
      npcSpawnTimer.current = setTimeout(() => {
        launchNextNPC();
      }, 1000);
    }
    if (characterState === 'hidden') {
      spawnStarted.current = false;
    }
  }, [characterState, launchNextNPC, recalling]);

  // Waluigi minion state
  const [minions, setMinions] = useState([]);
  const minionIdRef = useRef(0);

  const removeMinion = useCallback((id) => {
    setMinions(prev => prev.filter(m => m.id !== id));
  }, []);

  // Egg state
  const [eggs, setEggs] = useState([]);
  const eggIdRef = useRef(0);
  const facingRef = useRef('right');
  const xRef = useRef(0);

  const removeEgg = useCallback((id) => {
    setEggs(prev => prev.filter(e => e.id !== id));
  }, []);

  // Balloon state
  const [balloons, setBalloons] = useState([]);
  const balloonIdRef = useRef(0);

  const removeBalloon = useCallback((id) => {
    setBalloons(prev => prev.filter(b => b.id !== id));
  }, []);

  const spawnBalloon = useCallback((eggX, eggBottomY, npcId) => {
    const clipRect = clipRef.current?.getBoundingClientRect();
    const viewportX = clipRect ? clipRect.left + eggX : eggX;
    // Convert bottom-based egg position to top-based viewport position
    const viewportY = clipRect ? clipRect.bottom - (eggBottomY || 0) - 40 : window.innerHeight - 100;
    const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    const photo = NPC_PHOTO_MAP[npcId];
    balloonIdRef.current += 1;
    setBalloons(prev => [...prev, { id: balloonIdRef.current, x: viewportX, y: viewportY, color, photo }]);
  }, []);

  // Called when tongue hits an NPC during extension
  const handleTongueHit = useCallback((npcId) => {
    setActiveNPCs(prev => prev.filter(n => n.id !== npcId));
    npcPositionsRef.current = npcPositionsRef.current.filter(p => p.id !== npcId);
    const dir = facingRef.current;
    const eggX = dir === 'right' ? xRef.current - 5 : xRef.current + 5;
    eggIdRef.current += 1;
    const rollDir = dir === 'right' ? 'left' : 'right';
    setEggs(prev => [...prev, { id: eggIdRef.current, x: eggX, rollDirection: rollDir, npcId }]);
    // Queue next NPC spawn since this one was eaten
    if (!recallingRef.current) {
      if (npcSpawnTimer.current) clearTimeout(npcSpawnTimer.current);
      npcSpawnTimer.current = setTimeout(() => {
        launchNextNPC();
      }, 1000);
    }
  }, [launchNextNPC]);

  // Yoshi reached pipe during recall
  const handleRecallReached = useCallback(() => {
    setCharacterState('despawning');
  }, []);

  const { x, y, facing, action, handleTongueEnd, setMobileDirection, triggerJump, triggerTongue } = useCharacterController({
    enabled: characterState === 'active',
    bounds: moveBounds,
    speed: 120,
    initialX: pipeLeft,
    initialY: pipeHeight,
    getGroundLevel,
    onTongueComplete: undefined,
    recallTarget: recalling ? pipeLeft : undefined,
    onRecallReached: handleRecallReached,
  });

  // Keep refs in sync
  facingRef.current = facing;
  xRef.current = x;

  // Check if all characters have returned and Yoshi is hidden → retract pipe
  useEffect(() => {
    if (!recalling) return;
    if (activeNPCs.length === 0 && characterState === 'hidden') {
      setPipeState('retracting');
      setRecalling(false);
      npcQueueIndex.current = 0;
      npcPositionsRef.current = [];
    }
  }, [recalling, activeNPCs.length, characterState]);

  // Two-frame mount: render element at hidden position, then apply spawning class
  useEffect(() => {
    if (characterState !== 'mounting') return;
    let raf;
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        setCharacterState('spawning');
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [characterState]);

  useEffect(() => {
    if (!buttonRef.current || !clipRef.current) return;
    const updatePipeLeft = () => {
      const btnRect = buttonRef.current.getBoundingClientRect();
      const clipRect = clipRef.current.getBoundingClientRect();
      setPipeLeft(btnRect.left - clipRect.left + btnRect.width / 2);
    };
    updatePipeLeft();
    window.addEventListener('resize', updatePipeLeft);
    return () => window.removeEventListener('resize', updatePipeLeft);
  }, []);

  const handleWeddingPartyClick = useCallback((e) => {
    if (onClick) onClick(e);
    if (pipeState === 'rising' || pipeState === 'retracting') return;
    if (characterState === 'spawning' || characterState === 'despawning') return;
    if (recalling) return; // already recalling

    if (pipeState === 'hidden') {
      setPipeColor(pickRandomColor(pipeColor));
      setPipeState('rising');
    } else if (pipeState === 'visible' && (characterState === 'active' || characterState === 'hidden')) {
      if (characterState === 'active') {
        // Start recall sequence — everyone walks back to pipe
        setRecalling(true);
        if (npcSpawnTimer.current) clearTimeout(npcSpawnTimer.current);
        setMinions([]); // minions just vanish
        setBalloons([]); // clear balloons
        // Eggs will roll off on their own
      } else {
        // No character active, just retract pipe
        setPipeState('retracting');
      }
    }
  }, [pipeState, characterState, onClick, pipeColor, recalling]);

  const handlePipeTransitionEnd = useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    if (pipeState === 'rising') {
      setPipeState('visible');
      leftPipe.current = false;
      setCharacterState('mounting');
    } else if (pipeState === 'retracting') {
      setPipeState('hidden');
    }
  }, [pipeState]);

  const handleCharacterTransitionEnd = useCallback((e) => {
    if (e.target !== e.currentTarget) return;
    if (characterState === 'spawning') {
      setCharacterState('active');
    } else if (characterState === 'despawning') {
      setCharacterState('hidden');
      // If not recalling, retract pipe immediately (shouldn't happen in new flow, but safe)
      if (!recallingRef.current) {
        setPipeState('retracting');
      }
      // If recalling, the effect watching activeNPCs.length + characterState will handle pipe retraction
    }
  }, [characterState]);

  // Fallback: if transitionend doesn't fire for spawn, promote to active after timeout
  useEffect(() => {
    if (characterState !== 'spawning') return;
    const timeout = setTimeout(() => {
      setCharacterState((s) => s === 'spawning' ? 'active' : s);
    }, 400);
    return () => clearTimeout(timeout);
  }, [characterState]);

  const isUp = pipeState === 'rising' || pipeState === 'visible';
  const isActive = pipeState !== 'hidden';

  let slideClass = '';
  if (isActive) slideClass = isUp ? 'pipe-up' : 'pipe-down';

  let characterClass = 'character-sprite';
  if (characterState === 'spawning') characterClass += ' character-spawning';
  else if (characterState === 'despawning') characterClass += ' character-despawning';
  else if (characterState === 'active') characterClass += ' character-active';

  let animationName = 'stand';
  if (action === 'walk') animationName = 'walk';

  return (
    <div className="canvas-button-wrapper" ref={wrapperRef}>
      <div className="pipe-clip" ref={clipRef} aria-hidden="true">
        {/* Character sprite */}
        {characterState !== 'hidden' && (
          <div
            className={characterClass}
            style={{
              left: characterState === 'active' ? x : pipeLeft,
              bottom: characterState === 'active' ? y : pipeHeight,
            }}
            onTransitionEnd={handleCharacterTransitionEnd}
          >
            {characterState === 'active' && !recalling && (
              <CharacterLabel name="guest" color="#77dd77" />
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', ...(facing === 'left' ? { transform: 'scaleX(-1)' } : {}) }}>
              {action === 'tongue' ? (
                <YoshiTongue
                  sheet={yoshiSheet}
                  animations={YOSHI_ANIMATIONS}
                  scale={CHARACTER_SCALE}
                  onComplete={handleTongueEnd}
                  getNPCPositions={getNPCPositions}
                  yoshiX={x}
                  yoshiY={y}
                  facing={facing}
                  onHit={handleTongueHit}
                />
              ) : (
                <AnimatedSprite
                  sheet={yoshiSheet}
                  animations={YOSHI_ANIMATIONS}
                  animation={animationName}
                  scale={CHARACTER_SCALE}
                />
              )}
            </div>
          </div>
        )}

        {/* Eggs */}
        {eggs.map(egg => (
          <YoshiEgg
            key={egg.id}
            sheet={eggSheet}
            x={egg.x}
            rollDirection={egg.rollDirection || 'left'}
            rolling={recalling}
            bounds={moveBounds}
            onHatch={(hatchX, hatchBottomY) => { removeEgg(egg.id); spawnBalloon(hatchX ?? egg.x, hatchBottomY, egg.npcId); }}
            onFallOff={() => removeEgg(egg.id)}
          />
        ))}

        {/* NPCs */}
        {activeNPCs.map(npc => (
          <NPC
            key={npc.id}
            npcId={npc.id}
            sheet={npc.sheet}
            animations={npc.animations}
            scale={npc.scale}
            startX={pipeLeft}
            startY={pipeHeight}
            launchDirection={npc.launchDirection}
            moveBounds={moveBounds}
            getNPCPositions={getNPCPositions}
            onLanded={(landedX) => handleNPCLanded(npc.id, landedX)}
            onPositionUpdate={handleNPCPositionUpdate}
            facesRight={npc.facesRight !== false}
            launchSpeed={npc.launchSpeed}
            label={NPC_NAME_MAP[npc.id]}
            labelColor={npcColorsRef.current[npc.id]}
            recalling={recalling}
            recallTarget={pipeLeft}
            onReturned={() => handleNPCReturned(npc.id)}
          />
        ))}

        {/* Waluigi Minions */}
        {minions.map(m => (
          <WaluigiMinion
            key={m.id}
            startX={pipeLeft}
            direction={m.direction}
            bounds={moveBounds}
            onRemove={() => removeMinion(m.id)}
          />
        ))}

        {/* Pipe */}
        <div
          className={`pipe-slide ${slideClass}`}
          style={{ left: pipeLeft }}
          onTransitionEnd={handlePipeTransitionEnd}
        >
          <PixelSprite sheet={pipeSheet} name={`${pipeColor}-pipe`} scale={PIPE_SCALE} />
        </div>
      </div>

      <div className="canvas-button-container">
        <button onClick={onClick}>
          Bride & Groom
        </button>
        <button onClick={(e) => { if (onClick) onClick(e); if (onOpenModal) onOpenModal('rsvp'); }}>
          RSVP
        </button>
        <button ref={buttonRef} onClick={handleWeddingPartyClick}>
          Wedding Party
        </button>
      </div>
      {balloons.length > 0 && createPortal(
        balloons.map(b => (
          <Balloon
            key={b.id}
            sheet={balloonSheet}
            animations={BALLOON_ANIMATIONS}
            scale={BALLOON_SCALE}
            startX={b.x}
            startY={b.y}
            color={b.color}
            photo={b.photo}
            onPop={() => removeBalloon(b.id)}
          />
        )),
        document.body
      )}
      {characterState === 'active' && !recalling && createPortal(
        <MobileJoystick
          onDirection={setMobileDirection}
          onJump={triggerJump}
          onTongue={triggerTongue}
        />,
        document.body
      )}
    </div>
  );
}
