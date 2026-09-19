import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Lightbulb, Bug, Zap, GitBranch, MessageSquare, BarChart2, CheckCircle, Brain } from 'lucide-react';
import type { Assessment, Problem, AIMessage } from '../../types';
import { aiApi } from '../../services/apiClient';
import { useAssessmentStore } from '../../store/assessmentStore';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Props {
  assessment: Assessment;
  problem: Problem;
}

const QUICK_ACTIONS = [
  { id: 'explain', label: 'Explain', icon: <Brain className="w-3 h-3" />, type: 'CLARIFICATION' },
  { id: 'hint', label: 'Hint', icon: <Lightbulb className="w-3 h-3" />, type: 'HINT' },
  { id: 'debug', label: 'Debug', icon: <Bug className="w-3 h-3" />, type: 'DEBUG' },
  { id: 'dryRun', label: 'Dry Run', icon: <GitBranch className="w-3 h-3" />, type: 'DRY_RUN' },
  { id: 'optimize', label: 'Optimize', icon: <Zap className="w-3 h-3" />, type: 'OPTIMIZE' },
];

function AIMessageBubble({ msg }: { msg: AIMessage }) {
  return (
    <div className={clsx('animate-fade-in', msg.role === 'user' ? 'flex justify-end' : 'flex justify-start')}>
      {msg.role === 'ai' && (
        <div className="w-6 h-6 rounded-full bg-accent-600/30 border border-accent-600/40 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
          <Bot className="w-3 h-3 text-accent-400" />
        </div>
      )}
      <div className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
        {msg.type && msg.role === 'ai' && (
          <p className="text-xs font-medium text-accent-400 mb-1">{msg.type.replace(/_/g, ' ')}</p>
        )}
        {msg.level && msg.type === 'HINT' && (
          <p className="text-xs text-warning-400 mb-1">💡 Hint Level {msg.level}</p>
        )}
        <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
        <p className="text-xs text-muted mt-1.5 text-right">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// Instructor Hub checklist items by step
const CHECKLIST = [
  { id: 'understand', label: 'Requirement understood' },
  { id: 'ds', label: 'Data structure selected' },
  { id: 'complexity', label: 'Complexity checked' },
  { id: 'edge', label: 'Edge cases checked' },
  { id: 'tested', label: 'Code tested' },
];

export default function InstructorHubPanel({ assessment, problem }: Props) {
  const { aiMessages, isAILoading, addAIMessage, setAILoading, rightPanelTab, setRightPanelTab, code, approach, setApproach, dataStructure, setDataStructure } = useAssessmentStore();
  const [inputMessage, setInputMessage] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAILoading]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isAILoading) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'CHAT',
      message,
      timestamp: new Date().toISOString(),
    };
    addAIMessage(userMsg);
    setInputMessage('');
    setAILoading(true);

    try {
      const res = await aiApi.chat(assessment._id, message);
      const data = res.data.data;
      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: data.type || 'CHAT',
        message: data.message,
        level: data.level,
        timestamp: new Date().toISOString(),
      });
    } catch {
      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'ERROR',
        message: 'AI assistant is temporarily unavailable. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAILoading(false);
    }
  };

  const handleQuickAction = async (action: { id: string; type: string }) => {
    setRightPanelTab('ai');
    setAILoading(true);

    const messages = {
      explain: 'Please explain this problem to me',
      hint: 'Give me a hint',
      debug: 'Help me debug my code',
      dryRun: 'Do a step-by-step dry run of my code',
      optimize: 'Help me optimize my solution',
    };

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: action.type,
      message: messages[action.id as keyof typeof messages],
      timestamp: new Date().toISOString(),
    };
    addAIMessage(userMsg);

    try {
      const apiCalls: Record<string, () => Promise<{data: {data: {type?: string; message: string; level?: number}}}>> = {
        explain: () => aiApi.explain(assessment._id),
        hint: () => aiApi.hint(assessment._id),
        debug: () => aiApi.debug(assessment._id, code),
        dryRun: () => aiApi.dryRun(assessment._id, code),
        optimize: () => aiApi.optimize(assessment._id, code),
      };
      const res = await apiCalls[action.id]();
      const data = res.data.data;
      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: data.type || action.type,
        message: data.message,
        level: data.level,
        timestamp: new Date().toISOString(),
      });
    } catch {
      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'ai',
        type: 'ERROR',
        message: 'AI assistant is temporarily unavailable.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAILoading(false);
    }
  };

  const currentStepLabel = {
    UNDERSTANDING: 'Step 1 — Understand',
    DATA_STRUCTURE: 'Step 2 — Data Structure',
    APPROACH: 'Step 3 — Approach',
    CODING: 'Step 4 — Coding',
    TESTING: 'Step 5 — Testing',
    DEBUGGING: 'Step 5 — Debug',
    SUBMITTING: 'Step 6 — Submit',
    COMPLETED: 'Complete',
  }[assessment.currentStep || 'CODING'] || 'Step 5 — Review & Adapt';

  return (
    <div className="h-full flex flex-col bg-surface-800">
      {/* Header */}
      <div className="panel-header flex-shrink-0 flex-col items-start pb-2">
        <div className="flex items-center gap-2 w-full">
          <Brain className="w-4 h-4 text-accent-400" />
          <span className="text-white font-semibold text-sm">INSTRUCTOR HUB</span>
        </div>
        <p className="text-xs text-warning-400 font-medium mt-1 px-0">{currentStepLabel}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-600 flex-shrink-0 bg-surface-900">
        {[
          { id: 'ai', label: 'AI Assistant', icon: <Bot className="w-3 h-3" /> },
          { id: 'hints', label: 'Hints', icon: <Lightbulb className="w-3 h-3" /> },
          { id: 'review', label: 'Review', icon: <BarChart2 className="w-3 h-3" /> },
          { id: 'progress', label: 'Progress', icon: <CheckCircle className="w-3 h-3" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRightPanelTab(tab.id as 'ai' | 'hints' | 'review' | 'progress')}
            className={clsx(
              'flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
              rightPanelTab === tab.id
                ? 'text-accent-400 border-b-2 border-accent-400'
                : 'text-muted hover:text-white'
            )}
          >
            {tab.icon}
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* AI Chat Tab */}
      {rightPanelTab === 'ai' && (
        <>
          {/* Quick actions */}
          <div className="flex gap-1.5 flex-wrap px-3 py-2 bg-surface-900/50 border-b border-surface-600 flex-shrink-0">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={isAILoading}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-surface-700 text-muted hover:text-white hover:bg-surface-600 rounded border border-surface-500 transition-colors disabled:opacity-50"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {aiMessages.length === 0 && (
              <div className="text-center text-muted py-8">
                <Bot className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-white/60">AI DSA Mentor</p>
                <p className="text-xs mt-1">I'm here to guide you. Ask me anything about this problem!</p>
              </div>
            )}
            {aiMessages.map((msg) => (
              <AIMessageBubble key={msg.id} msg={msg} />
            ))}
            {isAILoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-600/30 border border-accent-600/40 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-accent-400" />
                </div>
                <div className="chat-message-ai">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-muted">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-surface-600 p-3">
            <div className="flex gap-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputMessage);
                  }
                }}
                placeholder="Ask the AI mentor..."
                className="input text-xs flex-1"
                disabled={isAILoading}
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isAILoading}
                className="btn-primary px-2.5 py-2"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Hints Tab */}
      {rightPanelTab === 'hints' && (
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white font-semibold">Progressive Hints</p>
              <span className="text-xs text-muted">Level {assessment.hintLevel || 0} / 6</span>
            </div>
            <div className="w-full bg-surface-600 rounded-full h-1.5">
              <div
                className="bg-accent-500 h-1.5 rounded-full transition-all"
                style={{ width: `${((assessment.hintLevel || 0) / 6) * 100}%` }}
              />
            </div>
            {problem.hints && problem.hints.length > 0 ? (
              problem.hints.slice(0, assessment.hintLevel || 0).map((hint) => (
                <div key={hint.level} className="border border-warning-500/30 rounded-lg p-3 bg-warning-500/5">
                  <p className="text-xs text-warning-400 font-medium mb-1">Hint Level {hint.level}</p>
                  <p className="text-sm text-white/85">{hint.content}</p>
                </div>
              ))
            ) : (
              <p className="text-muted text-sm">No hints revealed yet. Use the Hint button in the editor.</p>
            )}
            {(assessment.hintLevel || 0) === 0 && (
              <div className="text-center py-6 text-muted">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Click the Hint button in the editor toolbar to get progressive hints</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Tab */}
      {rightPanelTab === 'review' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <div>
            <p className="text-sm font-semibold text-white mb-3">Your Approach</p>
            <textarea
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              placeholder="Describe your approach step by step..."
              className="input text-xs h-24 resize-none"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-2">Data Structure</p>
            <input
              value={dataStructure}
              onChange={(e) => setDataStructure(e.target.value)}
              placeholder="e.g., HashMap, Stack, Two Pointers..."
              className="input text-xs"
            />
          </div>
          <button
            onClick={() => {
              if (!approach.trim()) { toast.error('Please describe your approach first'); return; }
              setRightPanelTab('ai');
              aiApi.reviewApproach(assessment._id, approach).then((res) => {
                const data = res.data.data;
                addAIMessage({
                  id: Date.now().toString(),
                  role: 'ai',
                  type: 'PLAN',
                  message: data.message,
                  timestamp: new Date().toISOString(),
                });
              }).catch(() => toast.error('AI review failed'));
            }}
            className="btn-secondary text-xs w-full justify-center"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Get AI Review of Approach
          </button>
        </div>
      )}

      {/* Progress Tab */}
      {rightPanelTab === 'progress' && (
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <p className="text-sm font-semibold text-white mb-4">Assessment Progress</p>

          {/* Review Checklist */}
          <div className="space-y-2 mb-6">
            {CHECKLIST.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-surface-700/50 cursor-pointer group"
              >
                <div
                  onClick={() => setChecklist((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className={clsx(
                    'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0',
                    checklist[item.id] ? 'bg-success-600 border-success-600' : 'border-surface-500 group-hover:border-success-500'
                  )}
                >
                  {checklist[item.id] && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className={clsx('text-sm', checklist[item.id] ? 'text-success-400 line-through' : 'text-white/80')}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Hints used</span>
              <span className="text-white font-medium">{assessment.hintCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">AI interactions</span>
              <span className="text-white font-medium">{assessment.aiInteractionCount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Current step</span>
              <span className="text-accent-400 font-medium">{(assessment.currentStep || 'CODING').replace('_', ' ')}</span>
            </div>
          </div>

          {/* Planned bug note */}
          {assessment.hintLevel && assessment.hintLevel > 3 && (
            <div className="mt-4 p-3 bg-warning-500/10 border border-warning-500/20 rounded-lg">
              <p className="text-xs text-warning-400 font-medium mb-1">Instructor Note</p>
              <p className="text-xs text-white/70">Student has used {assessment.hintLevel} hint levels. Consider if they need additional guidance.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
