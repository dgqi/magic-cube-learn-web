import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shuffle, RotateCcw } from 'lucide-react';
import CubeScene from '../components/cube/CubeScene';
import { applyMove, scramble, SOLVED_STATE } from '../engine/cube';
import type { CubeState } from '../types/cube';

export default function PlayPage() {
  const [cubeState, setCubeState] = useState<CubeState>(SOLVED_STATE.map(face => face.map(row => [...row])));
  const [scrambleText, setScrambleText] = useState('');
  const [animatingMove, setAnimatingMove] = useState<string | null>(null);
  const [moveQueue, setMoveQueue] = useState<string[]>([]);
  const [isScrambling, setIsScrambling] = useState(false);
  const queueRef = useRef<string[]>([]);

  const handleMove = (move: string) => {
    if (animatingMove) {
      // 动画进行中，加入队列
      queueRef.current = [...queueRef.current, move];
      setMoveQueue([...queueRef.current]);
    } else {
      // 空闲状态，直接开始动画
      setAnimatingMove(move);
    }
  };

  const handleAnimationComplete = useCallback(() => {
    if (animatingMove) {
      setCubeState(prev => applyMove(prev, animatingMove));
    }
    setAnimatingMove(null);
  }, [animatingMove]);

  // 处理队列：当前动画完成后自动播放下一个
  useEffect(() => {
    if (!animatingMove && queueRef.current.length > 0) {
      const [next, ...rest] = queueRef.current;
      queueRef.current = rest;
      setMoveQueue(rest);
      setAnimatingMove(next);
    }
  }, [animatingMove]);

  const handleScramble = () => {
    if (animatingMove || queueRef.current.length > 0) return;

    const scrambleMoves = scramble(cubeState, 20);
    setScrambleText(scrambleMoves);

    // 重置到已还原状态
    const solvedState = SOLVED_STATE.map(face => face.map(row => [...row]));
    setCubeState(solvedState);

    // 将打乱步骤加入队列，依次播放动画
    const moves = scrambleMoves.split(' ').filter(m => m.length > 0);
    queueRef.current = moves;
    setMoveQueue(moves);
    setIsScrambling(true);

    // 启动第一个动画
    if (moves.length > 0) {
      const [first, ...rest] = moves;
      queueRef.current = rest;
      setMoveQueue(rest);
      setAnimatingMove(first);
    }
  };

  // 打乱完成后重置状态
  useEffect(() => {
    if (isScrambling && !animatingMove && queueRef.current.length === 0) {
      setIsScrambling(false);
    }
  }, [isScrambling, animatingMove]);

  const handleReset = () => {
    setAnimatingMove(null);
    queueRef.current = [];
    setMoveQueue([]);
    setIsScrambling(false);
    setCubeState(SOLVED_STATE.map(face => face.map(row => [...row])));
    setScrambleText('');
  };

  const moves = ['U', "U'", 'U2', 'D', "D'", 'D2', 'F', "F'", 'F2', 'B', "B'", 'B2', 'R', "R'", 'R2', 'L', "L'", 'L2'];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">自由练习</h1>
          </div>
          {moveQueue.length > 0 && (
            <span className="text-sm text-gray-500">队列: {moveQueue.length} 步</span>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        {/* 3D Cube with animation */}
        <div className="flex-1 min-h-[300px] sm:min-h-[400px]">
          <CubeScene
            state={cubeState}
            animatingMove={animatingMove}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        {/* Controls */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={handleScramble}
                disabled={isScrambling || animatingMove !== null}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Shuffle className="w-5 h-5" />
                <span>{isScrambling ? '打乱中...' : '打乱'}</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                <span>重置</span>
              </button>
            </div>

            {/* Scramble Text */}
            {scrambleText && (
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-sm font-mono text-gray-700">{scrambleText}</p>
              </div>
            )}

            {/* Move Buttons */}
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
              {moves.map((move) => (
                <button
                  key={move}
                  onClick={() => handleMove(move)}
                  disabled={isScrambling}
                  className="p-2 sm:p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-mono text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {move}
                </button>
              ))}
            </div>

            {/* Keyboard Hints */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                点击按钮执行转动（支持快速连点排队），或使用鼠标拖拽旋转视角
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
