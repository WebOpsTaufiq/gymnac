"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// --- Types ---
type Message = { role: 'user' | 'assistant'; content: string; };
type ChatSession = { id: string; title: string; date: string; messages: Message[]; };

// --- Inline SVGs ---
const SparkleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>;
const SendIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const CopyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const CheckCopyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const STORAGE_KEY = 'gymnav-chat-history';

const SUGGESTED_PROMPTS = [
  "Who are my at-risk members this week?",
  "What's my revenue trend?",
  "Which classes need more bookings?",
  "Draft a renewal message for expiring members"
];

export default function ConciergeChat({ gymId, gymName, userName }: { gymId: string; gymName: string; userName: string }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        setSessions(parsed);
      }
    } catch {}
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((updated: ChatSession[]) => {
    setSessions(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInput('');
  };

  const loadSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id) startNewChat();
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: Message = { role: 'user', content: content.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    // Create or update session
    let sessionId = activeSessionId || `chat_${Date.now()}`;
    if (!activeSessionId) {
      setActiveSessionId(sessionId);
    }

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          gymId,
        }),
      });

      if (!res.ok) {
        throw new Error('AI service unavailable');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
          return updated;
        });
      }

      // Persist session
      const finalMessages = [...updatedMessages, { role: 'assistant' as const, content: assistantContent }];
      const title = updatedMessages[0]?.content.slice(0, 50) || 'New Chat';
      
      const newSession: ChatSession = {
        id: sessionId,
        title,
        date: new Date().toISOString(),
        messages: finalMessages,
      };

      const existingIdx = sessions.findIndex(s => s.id === sessionId);
      let updatedSessions: ChatSession[];
      if (existingIdx >= 0) {
        updatedSessions = [...sessions];
        updatedSessions[existingIdx] = newSession;
      } else {
        updatedSessions = [newSession, ...sessions];
      }
      saveSessions(updatedSessions);
      setMessages(finalMessages);

    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message || 'Something went wrong. Please try again.'}` }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const copyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100vh-64px)] -m-4 sm:-m-8 overflow-hidden bg-slate-50">
      
      {/* LEFT PANEL - Chat History */}
      <div className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden`}>
        <div className="p-4 shrink-0">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            <PlusIcon /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 mt-2">Chat History</p>
          {sessions.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium px-2 py-4 text-center">No conversations yet.<br/>Start one above!</p>
          ) : (
            sessions.map(s => (
              <div
                key={s.id}
                onClick={() => loadSession(s)}
                className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all ${activeSessionId === s.id ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold truncate ${activeSessionId === s.id ? 'text-indigo-700' : 'text-slate-700'}`}>{s.title}</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">{new Date(s.date).toLocaleDateString([], {month:'short', day:'numeric'})}</p>
                </div>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 ml-2"
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar branding footer */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <div className="text-white scale-75"><SparkleIcon /></div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">GymNav AI Agent</p>
              <p className="text-[10px] font-semibold text-green-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span> Online 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CHAT PANEL */}
      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-20 p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
        </button>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center h-full px-6 select-none">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_8px_30px_rgba(99,102,241,0.3)] mb-6 relative">
                <div className="text-white scale-[1.8]"><SparkleIcon /></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-[3px] border-slate-50 shadow-sm"></div>
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">GymNav AI</h2>
              <p className="text-base font-medium text-slate-400 mb-2">Your 24/7 AI Operations Manager</p>
              <p className="text-sm text-slate-400 mb-10 max-w-md text-center">I have real-time access to <span className="font-bold text-indigo-600">{gymName}</span>&apos;s members, revenue, check-ins, payments, classes, and leads. Ask me anything.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="group text-left p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
                  >
                    <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors leading-snug">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* MESSAGES */
            <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm">
                      <div className="text-white scale-[0.6]"><SparkleIcon /></div>
                    </div>
                  )}
                  
                  <div className={`group relative max-w-[85%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed font-medium ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md shadow-[0_2px_12px_rgba(99,102,241,0.25)]'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'
                    }`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-strong:text-slate-900 prose-ul:my-2 prose-li:my-0.5 [&_p]:my-1.5 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                      ) : (
                        <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                      )}
                    </div>

                    {/* Copy button for AI messages */}
                    {msg.role === 'assistant' && msg.content && (
                      <button
                        onClick={() => copyMessage(msg.content, i)}
                        className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-md text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center gap-1.5 text-[11px] font-bold"
                      >
                        {copiedId === i ? <><CheckCopyIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isStreaming && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm">
                    <div className="text-white scale-[0.6]"><SparkleIcon /></div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT BAR - fixed to bottom */}
        <div className="shrink-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pt-6 pb-4 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-lg focus-within:border-indigo-300 focus-within:shadow-[0_4px_20px_rgba(99,102,241,0.1)] transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask GymNav AI about ${gymName}...`}
                rows={1}
                className="w-full resize-none px-5 py-4 pr-14 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent rounded-2xl max-h-40"
                disabled={isStreaming}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="absolute right-3 bottom-3 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-center text-[11px] font-semibold text-slate-400 mt-3 tracking-wide">Powered by Google Gemini • GymNav AI Agent v1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Simple Markdown Formatter ---
function formatMarkdown(text: string): string {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 rounded text-[13px] font-mono text-indigo-700">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-slate-900 mt-4 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-slate-900 mt-4 mb-2">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$1. $2</li>')
    .replace(/\n/g, '<br/>');
  return html;
}
