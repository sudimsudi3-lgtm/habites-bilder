import React, { useState } from 'react';
import { runAllAutomatedTests, TestResult } from '../utils/testSuite';
import { Play, CheckCircle, XCircle, Clock, ShieldCheck, X, RefreshCw } from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'failed' | 'passed'>('all');

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      const res = await runAllAutomatedTests();
      setResults(res);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const totalCount = results ? results.length : 16;
  const allPassed = results && passedCount === totalCount;

  const displayedResults = results?.filter((r) => {
    if (filter === 'passed') return r.passed;
    if (filter === 'failed') return !r.passed;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-[#151925] border border-[#293043] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#293043] flex items-center justify-between bg-[#10131B]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 text-[#A78BFA] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#8B5CF6]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F3F4F6] flex items-center gap-2">
                Automated Verification Suite
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
                  Part 17
                </span>
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Executes 16 test cases covering CRUD, Streaks, In-Progress Days, Timezones, and Storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9CA3AF] hover:text-[#F3F4F6] rounded-xl hover:bg-[#1A2030] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Summary Banner */}
        <div className="p-6 border-b border-[#293043] bg-[#10131B]/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-[#8B5CF6] to-[#7C3AED] hover:opacity-95 text-white font-bold text-xs shadow-md flex items-center gap-2 transition disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Suite...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{results ? 'Re-run All 16 Tests' : 'Execute Test Suite'}</span>
                </>
              )}
            </button>

            {results && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#F3F4F6]">
                  {passedCount}/{totalCount} Passed
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    allPassed ? 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40' : 'bg-[#F87171]/20 text-[#F87171]'
                  }`}
                >
                  {allPassed ? 'ALL VERIFIED' : 'ATTENTION'}
                </span>
              </div>
            )}
          </div>

          {results && (
            <div className="flex items-center gap-1 bg-[#151925] p-1 rounded-xl border border-[#293043] text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filter === 'all' ? 'bg-[#8B5CF6] text-white' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                All ({results.length})
              </button>
              <button
                onClick={() => setFilter('passed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filter === 'passed' ? 'bg-[#34D399]/20 text-[#34D399]' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                Passed ({passedCount})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filter === 'failed' ? 'bg-[#F87171]/20 text-[#F87171]' : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
                }`}
              >
                Failed ({totalCount - passedCount})
              </button>
            </div>
          )}
        </div>

        {/* Test List Container */}
        <div className="p-6 max-h-[58vh] overflow-y-auto space-y-3">
          {!results && !isRunning && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1A2030] text-[#9CA3AF] flex items-center justify-center mx-auto">
                <Play className="w-6 h-6 ml-0.5 text-[#8B5CF6]" />
              </div>
              <h3 className="text-base font-bold text-[#F3F4F6]">Ready to Run Verification</h3>
              <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
                Click &quot;Execute Test Suite&quot; above to run automated unit tests directly against the local storage, streak calculation logic, and validation engines.
              </p>
            </div>
          )}

          {displayedResults?.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-2xl border transition ${
                r.passed
                  ? 'bg-[#10131B] border-[#293043]'
                  : 'bg-[#F87171]/10 border-[#F87171]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {r.passed ? (
                      <CheckCircle className="w-5 h-5 text-[#34D399]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#F87171]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-[#8B5CF6]">#{r.id}</span>
                      <h4 className="text-xs font-bold text-[#F3F4F6]">{r.name}</h4>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1A2030] text-[#9CA3AF] border border-[#293043]">
                        {r.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1">{r.message}</p>
                    {r.details && (
                      <pre className="mt-2 text-[10px] font-mono text-[#A78BFA] bg-[#0B0D12] p-2 rounded-lg border border-[#293043] overflow-x-auto">
                        {r.details}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-[#6B7280] shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{r.durationMs}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#293043] flex items-center justify-between text-xs text-[#9CA3AF] bg-[#10131B]/70">
          <span>Part 17 Automated Verification Standards</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1A2030] text-[#F3F4F6] hover:bg-[#252E44] transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
