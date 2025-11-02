
import { useEffect, useState } from "react";
import {
  useBalance, useMe, usePaymentHistory,
  usePaymentInitiate, usePaymentConfirm, usePaymentResend,
  useTuitionByStudentId, useLogout
} from "../api/hooks";

function VND(n: number) { return n.toLocaleString("vi-VN"); }

export function Dashboard() {
  const me = useMe();
  const balance = useBalance();
  const history = usePaymentHistory();
  const logout = useLogout();

  const [studentId, setStudentId] = useState("523H1101");
  const tuis = useTuitionByStudentId(studentId);

  const payInit = usePaymentInitiate();
  const payResend = usePaymentResend();
  const payConfirm = usePaymentConfirm();

  const [selected, setSelected] = useState<number | null>(null);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"idle"|"sent"|"confirmed">("idle");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => { balance.refetch(); history.refetch(); }, []);

  useEffect(() => {
    if (step !== "sent") return;
    setCountdown(60);
    const t = setInterval(() => setCountdown((c)=> c>0? c-1:0), 1000);
    return () => clearInterval(t);
  }, [step]);

  const list = (tuis.data?.data || []).map(t => ({
    ...t,
    studentName: (t as any).studentName ?? (t as any).NameStudents ?? t.studentName,
  }));

  const onPay = async () => {
    if (!selected) return;
    try {
      await payInit.mutateAsync({ tuitionId: selected });
      setStep("sent");
    } catch (e:any) { alert(e.message); }
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">User Information</h3>
            <button className="text-xs link" onClick={()=>logout.mutateAsync().then(()=>location.reload())}>Logout</button>
          </div>
          {me.isLoading ? <p>Loading...</p> : me.data?.data ? (
            <ul className="text-sm mt-2 space-y-1">
              <li><b>Full Name:</b> {me.data.data.fullName}</li>
              <li><b>Email:</b> {me.data.data.email}</li>
              <li><b>Phone:</b> {me.data.data.phoneNumber}</li>
              <li><b>Role:</b> {me.data.data.roles}</li>
            </ul>
          ) : <p className="text-sm opacity-70">No information available.</p>}
        </div>

        <div className="card">
          <h3 className="font-semibold">Available Balance</h3>
          {balance.isFetching ? <p>Loading...</p> :
            <p className="text-2xl font-bold mt-2">
              {typeof balance.data?.data === "number" ? VND(balance.data.data) : "--"} ₫
            </p>}
        </div>

        <div className="card">
          <h3 className="font-semibold">Tuition Lookup</h3>
          <div className="mt-2 flex gap-2">
            <input className="input flex-1" value={studentId} onChange={e=>setStudentId(e.target.value)} placeholder="Enter Student ID (e.g: 523H1101)" />
            <button className="btn btn-primary" onClick={()=>tuis.refetch()}>Load</button>
          </div>
          {tuis.isError && <p className="text-sm text-red-400 mt-2">{(tuis.error as Error).message}</p>}
        </div>
      </section>

      <section className="card">
        <h3 className="font-semibold mb-2">Select a tuition to pay</h3>
        {tuis.isLoading ? <p>Loading...</p> : (
          <div className="space-y-2">
            {list.map(t => (
              <label key={t.tuitionId}
                     className={"p-3 rounded-xl border border-slate-700/60 flex items-center justify-between " + (t.isPaid ? "opacity-50" : "")}>
                <div className="flex items-center gap-3">
                  <input type="radio"
                         name="tuition"
                         disabled={t.isPaid}
                         checked={selected === t.tuitionId}
                         onChange={() => setSelected(t.tuitionId)} />
                  <div className="space-y-1">
                    <div className="font-medium">#{t.tuitionId} • {t.studentName} • Semester {t.semester} ({t.academicYear})</div>
                    <div className="text-sm">Student ID: {t.studentId}</div>
                  </div>
                </div>
                <div className="font-bold">{VND(t.amount)} ₫</div>
              </label>
            ))}
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <button className="btn btn-primary" disabled={!selected || payInit.isPending} onClick={onPay}>
            {payInit.isPending ? "Sending OTP..." : "Pay"}
          </button>
        </div>
      </section>      <section className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold mb-2">Transaction History (Recent)</h3>
          <a className="link text-sm" href="#/history">View All →</a>
        </div>
        {history.isFetching ? <p>Loading...</p> : history.data?.data?.length ? (
          <ul className="space-y-2 text-sm">
            {history.data.data.slice(0,5).map(tx => (
              <li key={tx.paymentId} className="flex items-center justify-between">
                <span>#{tx.paymentId} • Tuition {tx.tuitionId}</span>
                <span>{new Date(tx.paymentDate).toLocaleString("en-US")} • <b>{VND(tx.amount)} ₫</b></span>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm opacity-70">No transactions yet.</p>}
      </section>

      {step === "sent" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="card max-w-md w-full">
            <h3 className="font-semibold">Enter OTP</h3>
            <p className="text-sm opacity-80">OTP sent via email. Expires in: <b>{countdown}s</b></p>
            <div className="mt-3 flex gap-2">
              <input className="input flex-1" placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value)} />
              <button className="btn btn-primary" disabled={!selected || !otp || payConfirm.isPending} onClick={async()=>{
                if (!selected) return;
                try { await payConfirm.mutateAsync({ tuitionId: selected, otpCode: otp }); setStep("confirmed"); }
                catch(e:any){ alert(e.message); }
              }}>{payConfirm.isPending ? "Confirming..." : "Confirm"}</button>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button className="link" onClick={async()=>{
                if (!selected) return;
                try { await payResend.mutateAsync({ tuitionId: selected }); setCountdown(60);} catch(e:any){ alert(e.message);}
              }}>Resend OTP</button>
              <button className="link" onClick={()=>{ setStep("idle"); setSelected(null); setOtp("");}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {step === "confirmed" && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="card max-w-md w-full text-center space-y-3">
            <h3 className="font-semibold text-green-400">Payment Successful!</h3>
            <p className="text-sm opacity-80">Balance has been updated. Check transaction history.</p>
            <button className="btn btn-primary w-full" onClick={()=>{ setStep("idle"); setSelected(null); setOtp("");}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
