
import { usePaymentHistory } from "../api/hooks";

function VND(n: number) { return n.toLocaleString("vi-VN"); }

export default function History() {
  const history = usePaymentHistory();

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Transaction History</h2>
      <div className="card">
        <button className="link text-sm mb-2" onClick={() => history.refetch()}>Refresh</button>
        {history.isFetching ? <p>Loading...</p> : history.data?.data?.length ? (
          <table className="text-sm">
            <thead className="text-left opacity-70">
              <tr><th>ID</th><th>Tuition</th><th>Time</th><th className="text-right">Amount</th></tr>
            </thead>
            <tbody>
              {history.data.data.map(tx => (
                <tr key={tx.paymentId} className="border-t border-slate-700/50">
                  <td>#{tx.paymentId}</td>
                  <td>{tx.tuitionId}</td>
                  <td>{new Date(tx.paymentDate).toLocaleString("en-US")}</td>
                  <td className="text-right font-semibold">{VND(tx.amount)} ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm opacity-70">No transactions yet.</p>}
      </div>
      <a href="#" className="link">← Back to main page</a>
    </div>
  );
}
