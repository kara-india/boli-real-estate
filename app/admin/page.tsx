export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-yellow-500">Platform Admin</h1>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-slate-400">Total Active Builders</h2>
                    <p className="text-4xl mt-2 font-light">452</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-slate-400">Monthly Revenue</h2>
                    <p className="text-4xl mt-2 font-light text-green-400">₹3.61Cr</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                    <h2 className="text-slate-400">Anti-Leak Violations</h2>
                    <p className="text-4xl mt-2 font-light text-red-400">3</p>
                </div>
            </div>

            <div className="mt-12 bg-slate-800 rounded-lg border border-slate-700 p-6">
                <h2 className="text-xl mb-4">Recent Audit Logs</h2>
                <div className="text-sm font-mono text-slate-300 space-y-2">
                    <p>[09:41:22] - builder-123 wallet deducted ₹250 (lead_reveal)</p>
                    <p>[09:45:00] - builder-456 visit completed checked-in (biometric)</p>
                    <p>[10:02:11] - buyer-789 Aadhaar hash generated</p>
                </div>
            </div>
        </div>
    );
}
