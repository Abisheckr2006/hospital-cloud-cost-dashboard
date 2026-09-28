import React, { useState } from 'react';
import { Bot, Sparkles, X, ChevronUp, ChevronDown, Send, HelpCircle, TrendingUp, AlertTriangle, PiggyBank, PieChart } from 'lucide-react';

interface FinOpsCopilotProps {
  onNavigateTab?: (tab: string) => void;
}

interface Message {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  timestamp: string;
  actionButtons?: Array<{ label: string; action: () => void }>;
}

export const FinOpsCopilot: React.FC<FinOpsCopilotProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'copilot',
      text: 'Hello! I am your **Hospital FinOps Copilot**. How can I help you analyze cloud cost attribution, detect anomalies, or optimize workload spend today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const quickPrompts = [
    { label: 'Explain Cost Increase', icon: TrendingUp, query: 'Why did cloud spending increase this month?' },
    { label: 'Find Savings', icon: PiggyBank, query: 'Where can we save money on hospital cloud workloads?' },
    { label: 'Analyze Anomaly', icon: AlertTriangle, query: 'Explain the active cost anomaly in Medical Imaging.' },
    { label: 'Forecast Spend', icon: PieChart, query: 'What is our projected cloud spend for next month?' },
    { label: 'Explain Allocation', icon: HelpCircle, query: 'Why is 7.43% of total cloud spend unallocated?' },
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputQuery.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Generate deterministic AI response based on query keywords
    setTimeout(() => {
      let replyText = '';
      let actions: Array<{ label: string; action: () => void }> | undefined;

      const lower = text.toLowerCase();
      if (lower.includes('increase') || lower.includes('cost increase') || lower.includes('why')) {
        replyText =
          'Cloud spend increased by **8.4%** primarily because the **Medical Imaging Platform** experienced a 21% surge in GPU compute usage on resource `res-analytics-db-003` during high-volume diagnostic scan batch processing.';
        actions = [
          { label: 'View Anomaly Investigation', action: () => onNavigateTab?.('cost-allocation') },
          { label: 'Inspect Unit Economics', action: () => onNavigateTab?.('unit-economics') },
        ];
      } else if (lower.includes('save') || lower.includes('savings') || lower.includes('optimize')) {
        replyText =
          'We identified **$38,420/month** ($461,040 annual) in potential savings. The largest opportunities are:\n1. Downsizing idle GPU on `res-analytics-db-003` ($3,200/mo)\n2. Cold storage tiering for long-term DICOM archives ($4,800/mo)\n3. Trimming daily EHR snapshot retention ($8,200/mo).';
        actions = [
          { label: 'Open Optimization Center', action: () => onNavigateTab?.('cost-optimization') },
          { label: 'Run What-If Simulator', action: () => onNavigateTab?.('experiment') },
        ];
      } else if (lower.includes('anomaly') || lower.includes('imaging')) {
        replyText =
          '🚨 **Active Anomaly Triggered**: Resource `res-analytics-db-003` reached **$1,053.18/day** vs expected baseline of **$638.47/day** (+65% variance). GPU utilization is currently low at 18%, indicating overprovisioning during idle hours.';
        actions = [{ label: 'Inspect Allocation Evidence', action: () => onNavigateTab?.('cost-allocation') }];
      } else if (lower.includes('forecast') || lower.includes('next month') || lower.includes('projected')) {
        replyText =
          '📈 **Projected Next-Month Spend**: **$145,200** (87% confidence rating). This is **4.8% above** the current monthly budget of $138,500 due to expanded genomic pipeline runs in Laboratory Services.';
        actions = [{ label: 'View Forecast Details', action: () => onNavigateTab?.('dashboard') }];
      } else if (lower.includes('unallocated') || lower.includes('attribution')) {
        replyText =
          'Currently **$53,858 (7.43%)** of total spend is unallocated. The main cause is missing resource tags on shared Kubernetes clusters and missing product metadata in laboratory batch jobs.';
        actions = [
          { label: 'View Data Quality SLA', action: () => onNavigateTab?.('data-quality') },
          { label: 'Fix Tag Coverage', action: () => onNavigateTab?.('cost-optimization') },
        ];
      } else {
        replyText =
          `I analyzed your question regarding "${text}". Across our hospital accounts, total spend is **$724,892.60** with an **92.57% allocation coverage rate** against our 85% target goal.`;
        actions = [{ label: 'Go to Executive Dashboard', action: () => onNavigateTab?.('dashboard') }];
      }

      const copilotMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'copilot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButtons: actions,
      };

      setMessages((prev) => [...prev, copilotMsg]);
    }, 400);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-3 rounded-full shadow-xl transition-all transform hover:scale-105 cursor-pointer border border-emerald-500"
        >
          <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
          <span>FinOps Copilot</span>
          <span className="bg-emerald-800 text-emerald-100 text-xs px-2 py-0.5 rounded-full font-semibold">AI</span>
        </button>
      )}

      {/* Main Copilot Drawer Window */}
      {isOpen && (
        <div className="w-[420px] max-w-[calc(100vw-40px)] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-slate-800/90 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                  FinOps Intelligence Copilot
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">ONLINE</span>
                </h3>
                <p className="text-[11px] text-slate-400">Hospital FinOps & Unit Economics Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/50"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <>
              {/* Messages Scroll Container */}
              <div className="p-4 flex-1 h-[320px] overflow-y-auto space-y-3.5 text-xs bg-slate-950/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      {msg.actionButtons && msg.actionButtons.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                          {msg.actionButtons.map((btn, idx) => (
                            <button
                              key={idx}
                              onClick={btn.action}
                              className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2 py-1 rounded font-medium border border-emerald-500/30 transition-colors"
                            >
                              {btn.label} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
              </div>

              {/* Quick Prompts Bar */}
              <div className="px-3 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {quickPrompts.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(p.query)}
                      className="whitespace-nowrap text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Icon className="w-3 h-3 text-emerald-400" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-slate-900 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask about cloud costs, anomalies, or savings..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-slate-500 text-center mt-1.5 italic">
                  AI insights are based on available FinOps data and should be validated before production decisions.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
