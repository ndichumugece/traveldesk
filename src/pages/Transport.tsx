export function Transport() {
    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Transport</h1>
                <p className="text-slate-500 mt-1">Manage transport configurations and options.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🚗</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Transport Configurations</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                    This section will allow you to configure transport providers, vehicle types, and pricing.
                </p>
            </div>
        </div>
    );
}
