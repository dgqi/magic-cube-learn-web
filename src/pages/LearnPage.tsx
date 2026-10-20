import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, RotateCcw, Play, StepBack, ChevronDown, Search, Gauge } from 'lucide-react';
import CubeScene from '../components/cube/CubeScene';
import { applyMove, SOLVED_STATE, verifyState } from '../engine/cube';
import { layerByLayerMethod } from '../methods/layerByLayer';
import { cfopMethod } from '../methods/cfop';
import { rouxMethod } from '../methods/roux';
import type { Method, Step, StepGroup, CubeState } from '../types/cube';

const methods: Record<string, Method> = {
  'layer-by-layer': layerByLayerMethod,
  'cfop': cfopMethod,
  'roux': rouxMethod,
};

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5, duration: 0.8 },
  { label: '1x', value: 1, duration: 0.4 },
  { label: '2x', value: 2, duration: 0.2 },
];

export default function LearnPage() {
  const [match, params] = useRoute<{ methodId: string }>('/learn/:methodId');
  const methodId = match && params ? params.methodId : null;
  const method = methodId ? methods[methodId] : null;

  const [currentGroup, setCurrentGroup] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0]));
  const [cubeState, setCubeState] = useState<CubeState>(SOLVED_STATE.map(face => face.map(row => [...row])));

  const [showSteps, setShowSteps] = useState(false);
  const [animatingMove, setAnimatingMove] = useState<string | null>(null);
  const [moveHistory, setMoveHistory] = useState<CubeState[]>([]);
  const [moveHistoryIndex, setMoveHistoryIndex] = useState(-1);
  const [currentMoves, setCurrentMoves] = useState<string[]>([]);
  const [currentMoveIdx, setCurrentMoveIdx] = useState(-1);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const stepGroups: StepGroup[] = method?.stepGroups ?? (method?.steps.map((s, i) => ({
    id: i, title: s.title, description: s.description, tips: s.tips, steps: [s]
  })) ?? []);

  const currentGroupData = stepGroups[currentGroup];
  const currentStepData: Step | null = currentGroupData ? currentGroupData.steps[currentSubStep] : null;

  const animationDuration = SPEED_OPTIONS[speedIdx].duration;
  const autoPlayDelay = useMemo(() => {
    return animationDuration * 1000 + 150;
  }, [animationDuration]);

  // 搜索过滤（仅在组内步骤较多时显示）
  const filteredSteps = useMemo(() => {
    if (!currentGroupData) return [];
    if (!searchQuery.trim()) return currentGroupData.steps;
    const q = searchQuery.toLowerCase();
    return currentGroupData.steps.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.algorithm.toLowerCase().includes(q) ||
      (s.animAlg ?? '').toLowerCase().includes(q)
    );
  }, [currentGroupData, searchQuery]);

  // 获取当前步骤的初始状态
  const getStepSetupState = useCallback((step: Step): CubeState => {
    if (step.setupState) {
      return step.setupState.map(face => face.map(row => [...row]));
    }
    return SOLVED_STATE.map(face => face.map(row => [...row]));
  }, []);

  // 初始化
  useEffect(() => {
    if (method && stepGroups.length > 0) {
      const firstStep = stepGroups[0].steps[0];
      setCubeState(getStepSetupState(firstStep));
      setCurrentGroup(0);
      setCurrentSubStep(0);
      setExpandedGroups(new Set([0]));
      setCurrentMoves(getAnimMoves(firstStep));
      setCurrentMoveIdx(-1);
      setMoveHistory([]);
      setMoveHistoryIndex(-1);
      setSearchQuery('');

      // 开发期校验所有步骤的 setupState 合法性
      if (import.meta.env.DEV) {
        for (const group of stepGroups) {
          for (const step of group.steps) {
            const state = step.setupState ?? SOLVED_STATE;
            const errs = verifyState(state);
            if (errs.length > 0) {
              console.warn(`[setupState 非法] ${group.title} > ${step.title}:`, errs);
            }
          }
        }
      }
    }
  }, [method, stepGroups, getStepSetupState]);

  const resetPlayback = () => {
    setAutoPlaying(false);
    setAnimatingMove(null);
    setMoveHistory([]);
    setMoveHistoryIndex(-1);
    setCurrentMoves([]);
    setCurrentMoveIdx(-1);
  };

  const handleAnimationComplete = useCallback(() => {
    if (!animatingMove) return;
    const newState = applyMove(cubeState, animatingMove);
    setCubeState(newState);
    setMoveHistory(prev => [...prev, newState]);
    setMoveHistoryIndex(prev => prev + 1);
    setAnimatingMove(null);
  }, [animatingMove, cubeState]);

  // 自动播放：动画完成后继续下一步
  useEffect(() => {
    if (!autoPlaying || animatingMove !== null) return;

    if (currentMoveIdx >= currentMoves.length - 1) {
      setAutoPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      const nextIdx = currentMoveIdx + 1;
      setCurrentMoveIdx(nextIdx);
      setAnimatingMove(currentMoves[nextIdx]);
    }, autoPlayDelay);
    return () => clearTimeout(timer);
  }, [autoPlaying, animatingMove, currentMoveIdx, currentMoves, autoPlayDelay]);

  if (!method || !currentGroupData || !currentStepData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">方法未找到</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">返回首页</Link>
        </div>
      </div>
    );
  }

  const parseAlgorithm = (algorithm: string): string[] => {
    return algorithm.replace(/[()]/g, ' ').trim().split(/\s+/).filter(m => m.length > 0);
  };

  // 动画驱动用 animAlg（归一化后无 x/y/z），显示仍用原 algorithm
  const getAnimMoves = (step: Step): string[] => {
    return parseAlgorithm(step.animAlg ?? step.algorithm);
  };

  const navigateToSubStep = (groupIdx: number, subIdx: number) => {
    if (groupIdx < 0 || groupIdx >= stepGroups.length) return;
    const group = stepGroups[groupIdx];
    if (subIdx < 0 || subIdx >= group.steps.length) return;

    const step = group.steps[subIdx];

    setAutoPlaying(false);
    setAnimatingMove(null);
    setMoveHistory([]);
    setMoveHistoryIndex(-1);
    setCurrentMoves(getAnimMoves(step));
    setCurrentMoveIdx(-1);

    setCurrentGroup(groupIdx);
    setCurrentSubStep(subIdx);
    setExpandedGroups(prev => new Set([...prev, groupIdx]));

    setCubeState(getStepSetupState(step));
    setSearchQuery('');
  };

  const toggleGroup = (groupIdx: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupIdx)) next.delete(groupIdx);
      else next.add(groupIdx);
      return next;
    });
  };

  const resetCube = () => {
    if (currentStepData) {
      setCubeState(getStepSetupState(currentStepData));
    }
    resetPlayback();
  };

  const undoMove = () => {
    if (moveHistoryIndex > 0) {
      const newIndex = moveHistoryIndex - 1;
      setMoveHistoryIndex(newIndex);
      setCubeState(moveHistory[newIndex]);
      setCurrentMoveIdx(Math.max(-1, currentMoveIdx - 1));
    } else if (currentMoveIdx >= 0) {
      setCurrentMoveIdx(-1);
      if (currentStepData) {
        setCubeState(getStepSetupState(currentStepData));
      }
    }
  };

  const redoMove = () => {
    if (moveHistoryIndex < moveHistory.length - 1) {
      const newIndex = moveHistoryIndex + 1;
      setMoveHistoryIndex(newIndex);
      setCubeState(moveHistory[newIndex]);
      setCurrentMoveIdx(Math.min(currentMoves.length - 1, currentMoveIdx + 1));
    } else if (currentMoveIdx < currentMoves.length - 1) {
      const nextIdx = currentMoveIdx + 1;
      setCurrentMoveIdx(nextIdx);
      setAnimatingMove(currentMoves[nextIdx]);
    }
  };

  const startAutoPlay = () => {
    if (!currentStepData || !method) return;
    if (animatingMove !== null) return;

    const forwardMoves = getAnimMoves(currentStepData);
    const setupState = getStepSetupState(currentStepData);

    // 还没开始，或者已经播放完了：重置并重新播放
    if (currentMoves.length === 0 || currentMoveIdx >= currentMoves.length - 1) {
      setCubeState(setupState);
      setMoveHistory([setupState]);
      setMoveHistoryIndex(0);
      setCurrentMoves(forwardMoves);
      setCurrentMoveIdx(0);
      setAutoPlaying(true);
      setAnimatingMove(forwardMoves[0]);
      return;
    }

    // 从当前位置继续自动播放
    setAutoPlaying(true);
    const nextIdx = currentMoveIdx + 1;
    setCurrentMoveIdx(nextIdx);
    setAnimatingMove(currentMoves[nextIdx]);
  };

  const cycleSpeed = () => {
    setSpeedIdx(prev => (prev + 1) % SPEED_OPTIONS.length);
  };

  const getHighlightedAlgorithm = () => {
    if (!currentStepData) return null;
    const forwardMoves = getAnimMoves(currentStepData);
    return forwardMoves.map((move, index) => {
      let isActive = false;
      let isDone = false;
      if (currentMoveIdx >= 0) {
        if (index < currentMoveIdx && animatingMove === null) isDone = true;
        else if (index < currentMoveIdx) isDone = true;
        else if (index === currentMoveIdx) {
          if (animatingMove === null) isDone = true;
          else isActive = true;
        }
      }
      return { move, isActive, isDone };
    });
  };

  const highlightedMoves = getHighlightedAlgorithm();
  const canUndo = currentMoveIdx >= 0;
  const canRedo = moveHistoryIndex < moveHistory.length - 1 || currentMoveIdx < currentMoves.length - 1;
  const isPlayDone = currentMoves.length > 0 && currentMoveIdx >= currentMoves.length - 1 && animatingMove === null;
  const showSearchBar = currentGroupData && currentGroupData.steps.length > 5;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{method.name}</h1>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{method.description.slice(0, 30)}...</span>
          </div>
          <div className="flex items-center space-x-3">
            {/* Speed control */}
            <button
              onClick={cycleSpeed}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              title="播放速度"
            >
              <Gauge className="w-4 h-4" />
              <span>{SPEED_OPTIONS[speedIdx].label}</span>
            </button>
            <button onClick={() => setShowSteps(!showSteps)} className="md:hidden text-gray-600 hover:text-gray-900 text-sm font-medium">
              步骤
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Steps Panel */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          md:relative md:transform-none md:shadow-none md:w-80 md:flex-shrink-0
          ${showSteps ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between md:hidden">
            <h2 className="text-lg font-semibold">步骤列表</h2>
            <button onClick={() => setShowSteps(false)} className="text-gray-500">关闭</button>
          </div>
          <div className="p-4 overflow-y-auto h-full">
            <div className="space-y-1">
              {stepGroups.map((group, groupIdx) => (
                <div key={group.id}>
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(groupIdx)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                      groupIdx === currentGroup
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{group.title}</span>
                      <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">{group.steps.length}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedGroups.has(groupIdx) ? 'rotate-0' : '-rotate-90'
                    }`} />
                  </button>

                  {/* Sub-steps */}
                  {expandedGroups.has(groupIdx) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {group.steps.map((subStep, subIdx) => (
                        <button
                          key={subStep.id}
                          onClick={() => navigateToSubStep(groupIdx, subIdx)}
                          className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                            groupIdx === currentGroup && subIdx === currentSubStep
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {subStep.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-[300px] md:min-h-[400px]">
            <CubeScene
              state={cubeState}
              animatingMove={animatingMove}
              onAnimationComplete={handleAnimationComplete}
              animationDuration={animationDuration}
            />
          </div>

          <div className="bg-white border-t border-gray-200 p-4 sm:p-6 overflow-y-auto flex-shrink-0 max-h-[45vh]">
            <div className="max-w-3xl mx-auto">
              {/* Breadcrumb + Progress */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-500">
                    第{currentGroup + 1}步
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{currentGroupData.title}</span>
                  <span className="text-xs text-gray-400">›</span>
                  <span className="text-sm text-blue-600 font-medium">{currentStepData.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Progress indicator */}
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {currentSubStep + 1} / {currentGroupData.steps.length}
                  </span>
                  <button onClick={resetCube} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg" title="重置">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 mb-2 text-sm">{currentStepData.description}</p>

              {currentStepData.tips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-800">{currentStepData.tips}</p>
                </div>
              )}

              {/* Group-level tips (initial face / context info) */}
              {currentGroupData.tips && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3">
                  <p className="text-xs text-amber-800">ℹ️ {currentGroupData.tips}</p>
                </div>
              )}

              {/* Search bar for large groups */}
              {showSearchBar && (
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索公式..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  />
                </div>
              )}

              {/* Search results */}
              {showSearchBar && searchQuery.trim() && (
                <div className="mb-3 max-h-32 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {filteredSteps.length === 0 ? (
                    <p className="p-2 text-sm text-gray-400 text-center">未找到匹配的公式</p>
                  ) : (
                    filteredSteps.map((step) => {
                      const realIdx = currentGroupData.steps.indexOf(step);
                      return (
                        <button
                          key={step.id}
                          onClick={() => navigateToSubStep(currentGroup, realIdx)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
                        >
                          <span className="font-medium text-blue-600">{step.title}</span>
                          <span className="text-gray-400 ml-2 font-mono text-xs">{step.algorithm}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* Algorithm highlight */}
              {highlightedMoves && highlightedMoves.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">
                    公式：<span className="font-mono text-gray-700 font-medium">{currentStepData.algorithm}</span>
                  </p>
                  {currentStepData.animAlg && currentStepData.animAlg !== currentStepData.algorithm && (
                    <p className="text-xs text-gray-400 mb-2">
                      动画：<span className="font-mono text-gray-500">{currentStepData.animAlg}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {highlightedMoves.map((item, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md font-mono text-sm font-medium transition-all duration-150 ${
                          item.isActive ? 'bg-blue-600 text-white scale-110 shadow-md'
                            : item.isDone ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {item.move}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <button onClick={undoMove} disabled={!canUndo}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <StepBack className="w-5 h-5" /><span className="text-sm">后退</span>
                </button>

                <button onClick={startAutoPlay}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-medium transition-all ${
                    isPlayDone
                      ? 'bg-green-50 text-green-600 hover:bg-green-100'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  disabled={animatingMove !== null && !isPlayDone}>
                  <Play className="w-5 h-5" />
                  <span>{isPlayDone ? '重播' : '播放'}</span>
                </button>

                <button onClick={redoMove} disabled={!canRedo}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <StepBack className="w-5 h-5 transform rotate-180" /><span className="text-sm">前进</span>
                </button>
              </div>

              {/* Prev/Next formula navigation */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    if (currentSubStep > 0) navigateToSubStep(currentGroup, currentSubStep - 1);
                    else if (currentGroup > 0) {
                      const prevGroup = stepGroups[currentGroup - 1];
                      navigateToSubStep(currentGroup - 1, prevGroup.steps.length - 1);
                    }
                  }}
                  disabled={currentGroup === 0 && currentSubStep === 0}
                  className="text-xs text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← 上一条公式
                </button>
                <button
                  onClick={() => {
                    if (currentSubStep < currentGroupData.steps.length - 1) navigateToSubStep(currentGroup, currentSubStep + 1);
                    else if (currentGroup < stepGroups.length - 1) navigateToSubStep(currentGroup + 1, 0);
                  }}
                  disabled={currentGroup === stepGroups.length - 1 && currentSubStep === currentGroupData.steps.length - 1}
                  className="text-xs text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  下一条公式 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
