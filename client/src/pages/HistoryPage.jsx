// Student: my study history. Linked supporters see exactly this same list.
import { getMyHistory } from '../api/history.js';
import HistoryList from '../components/history/HistoryList.jsx';

export default function HistoryPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="mt-1 text-sm text-slate-600">Your linked supporters see this same history.</p>
      </div>
      {/* getMyHistory is a stable module function, so HistoryList won't reload in a loop */}
      <HistoryList fetchPage={getMyHistory} emptyText="No sessions yet. Your history starts with your first Start! 🚀" />
    </div>
  );
}
