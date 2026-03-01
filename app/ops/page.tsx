export default function OpsDashboard() {
    return (
        <div className="min-h-screen bg-white">
            <header className="bg-gray-900 text-white px-6 py-4 flex justify-between">
                <h1 className="text-xl font-bold font-mono">BM-OPS Control</h1>
                <span className="bg-green-500 text-xs px-2 py-1 rounded">SYSTEM NORMAL</span>
            </header>

            <main className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Live Visit Monitoring</h2>
                    <span className="text-sm text-gray-500">Last updated: Just now</span>
                </div>

                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cab Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Rajesh M.</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Project Alpha (Builder-123)</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">En Route</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Waiting for biometric...</td>
                        </tr>
                    </tbody>
                </table>
            </main>
        </div>
    );
}
