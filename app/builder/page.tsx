import Link from 'next/link';

export default function BuilderDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-yellow-500 pl-2">BidMetric Builder Portal</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600 font-medium">Wallet: ₹8,250</span>
                        <button className="px-4 py-2 text-sm text-yellow-600 border border-yellow-600 rounded-md hover:bg-yellow-50">Top Up</button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'New Leads', value: '23' },
                        { label: 'Upcoming Visits', value: '5' },
                        { label: 'Active Closings', value: '2' },
                        { label: 'Revenue Generated', value: '₹1.2L' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                            <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
                            <span className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Leads */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Latest Leads</h2>
                            <Link href="/builder/leads" className="text-sm text-yellow-600 hover:text-yellow-700">View All</Link>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {['Amit Kumar', 'Neha Patel'].map((name, i) => (
                                <div key={i} className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                    <div>
                                        <h3 className="text-md font-semibold text-gray-800">{name}</h3>
                                        <p className="text-sm text-gray-500">Score: {15 - i * 3}/20</p>
                                    </div>
                                    <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-md shadow-sm">
                                        Reveal (₹250)
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visits */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Today's Visits</h2>
                            <Link href="/builder/visits" className="text-sm text-yellow-600 hover:text-yellow-700">Calendar</Link>
                        </div>
                        <div className="divide-y divide-gray-100">
                            <div className="p-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div>
                                    <h3 className="text-md font-semibold text-gray-800">Rajesh M.</h3>
                                    <p className="text-sm text-gray-500">2:00 PM • Project Alpha</p>
                                </div>
                                <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md shadow-sm">
                                    Check-In (Biometric)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
