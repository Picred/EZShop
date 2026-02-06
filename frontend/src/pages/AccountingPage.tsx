import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, RefreshCw, Wallet, ShieldCheck, History } from 'lucide-react';
import { accountingService } from '../services/accountingService';

export const AccountingPage = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        loadBalance();
    }, []);

    const loadBalance = async () => {
        try {
            setLoading(true);
            const data = await accountingService.getBalance();
            setBalance(data);
        } catch (error) {
            console.error('Failed to load balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBalance = async (newBalance: number) => {
        if (confirm(`Are you sure you want to update the balance to $${newBalance.toFixed(2)}?`)) {
            try {
                await accountingService.setBalance(newBalance);
                loadBalance();
                setAmount('');
            } catch (error) {
                console.error('Failed to update balance:', error);
                alert('Failed to update balance');
            }
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Financial Treasury</h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Admin-only fund management and oversight
                    </p>
                </div>
                <button 
                    className="btn btn-ghost hover:bg-gray-100 rounded-full gap-2 transition-all" 
                    onClick={loadBalance}
                    disabled={loading}
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Sync Ledger
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Hero Card */}
                <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[2rem] shadow-2xl p-10 text-white group">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-all duration-700"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 font-medium mb-1 uppercase tracking-widest text-xs">Total Liquidity</p>
                                <h2 className="text-xl font-bold">Current Shop Balance</h2>
                            </div>
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl">
                                <Wallet className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        
                        <div className="mt-12 mb-8">
                            <div className="text-6xl font-black tracking-tighter flex items-start gap-2">
                                <span className="text-3xl mt-2 text-primary opacity-80">$</span>
                                {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '---'}
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-green-400 font-medium">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                SECURE ASSET STORAGE
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8 border-t border-white/10">
                            <div className="flex-1">
                                <p className="text-gray-500 text-xs mb-1">Last Reconciled</p>
                                <p className="text-sm font-medium">{new Date().toLocaleTimeString()}</p>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-500 text-xs mb-1">Status</p>
                                <p className="text-sm font-medium">Operational</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Adjust Funds</h3>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text-alt font-bold text-gray-400 uppercase">Target Balance Amount</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-bold">$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        className="input input-lg input-bordered w-full pl-8 font-bold bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-2xl" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button 
                                    className="btn btn-primary btn-lg rounded-2xl gap-3 shadow-lg shadow-primary/20 group h-16"
                                    disabled={!amount}
                                    onClick={() => handleUpdateBalance(parseFloat(amount))}
                                >
                                    <ArrowUpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Authorize Update
                                </button>
                                 <button 
                                    className="btn btn-outline btn-error btn-lg border-2 rounded-2xl gap-3 h-16"
                                    onClick={() => handleUpdateBalance(0)}
                                >
                                    <ArrowDownCircle className="w-5 h-5" />
                                    Reset to Base $0
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                            <History className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Audit Trail</p>
                            <p className="text-sm text-gray-600">Reconciliation records are available in Reports</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
