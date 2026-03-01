export default function BuyerDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-600">BidMetric</h1>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">My Scheduled Visits</h2>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Rustomjee Elements - 3BHK</h3>
                        <p className="text-gray-500">Tomorrow, 2:00 PM</p>
                        <p className="text-sm text-yellow-600 mt-2 font-medium bg-yellow-50 inline-block px-2 py-1 rounded">Cab Booked - OTP: 4592</p>
                    </div>
                    <button className="text-gray-500 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">Reschedule</button>
                </div>
            </main>
        </div>
    );
}
