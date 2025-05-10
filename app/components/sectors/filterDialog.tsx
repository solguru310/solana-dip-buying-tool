import { JSX, useState, useEffect, useRef } from "react";
import CustomInputField from "../utils/customInput";
import { Button } from '@headlessui/react';
import useStore from "../../store/useStore";
import toast from "react-hot-toast";

interface FilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FilterDialog({
    isOpen = false,
    onClose
}: FilterDialogProps): JSX.Element | null {
    const dialogRef = useRef<HTMLDivElement>(null);
    const { fetchData, setFilter, resetFilter, resetTokenList, interval, setInterval } = useStore();

    // State for each filter range
    const [liquidity, setLiquidity] = useState({ min: 0, max: 0 });
    const [mcap, setMcap] = useState({ min: 0, max: 0 });
    const [fdv, setFdv] = useState({ min: 0, max: 0 });
    const [pairAge, setPairAge] = useState({ min: 0, max: 0 });
    const [txns24h, setTxns24h] = useState({ min: 0, max: 0 });
    const [buys24h, setBuys24h] = useState({ min: 0, max: 0 });
    const [sells24h, setSells24h] = useState({ min: 0, max: 0 });
    const [volume24h, setVolume24h] = useState({ min: 0, max: 0 });
    const [refreshInterval, setRefreshInterval] = useState<number>(0);

    useEffect(() => {
        setRefreshInterval(interval);
    }, [interval])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleRefreshIntervalChange = (value: string) => {
        const intValue = parseInt(value) || 0;
        setRefreshInterval(intValue);
    }

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>, field: 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setter(prev => ({ ...prev, [field]: value }));
    };

    const handleResetClicked = (): void => {
        setLiquidity({ min: 0, max: 0 });
        setMcap({ min: 0, max: 0 });
        setFdv({ min: 0, max: 0 });
        setPairAge({ min: 0, max: 0 });
        setTxns24h({ min: 0, max: 0 });
        setBuys24h({ min: 0, max: 0 });
        setSells24h({ min: 0, max: 0 });
        setVolume24h({ min: 0, max: 0 });
        resetFilter();
    }

    const applyFilters = (): void => {
        setFilter('liquidity', liquidity);
        setFilter('mcap', mcap);
        setFilter('fdv', fdv);
        setFilter('pairAge', pairAge);
        setFilter('txns24h', txns24h);
        setFilter('buys24h', buys24h);
        setFilter('sells24h', sells24h);
        setFilter('volume24h', volume24h);
        setInterval(refreshInterval);
        resetTokenList();
        fetchData(true, false);
        onClose();
    };

    const renderFilterRow = (label: string, state: { min: number; max: number }, setState: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>, prefix?: string, suffix?: string) => (
        <div className="w-full flex flex-col md:flex-row justify-left">
            <div className="w-[150px] flex items-center justify-left sm:justify-left md:justify-end pr-2">
                <span>{label}:</span>
            </div>
            <div className="flex w-full">
                <CustomInputField
                    prefix={prefix}
                    suffix={suffix}
                    placeholder="Min"
                    type="number"
                    value={state.min}
                    onChange={(value) => handleInputChange(setState, 'min')({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
                />
                <CustomInputField
                    prefix={prefix}
                    suffix={suffix}
                    placeholder="Max"
                    type="number"
                    value={state.max}
                    onChange={(value) => handleInputChange(setState, 'max')({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
                />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 py-4 z-50">
            <div ref={dialogRef} className="bg-gray-700 p-6 rounded shadow-lg z-50 text-gray-300 w-[300px] sm:w-[300px] md:w-[600px]">
                {renderFilterRow("Liquidity", liquidity, setLiquidity, "$")}
                {renderFilterRow("MarketCap", mcap, setMcap, "$")}
                {renderFilterRow("FDV", fdv, setFdv, "$")}
                {renderFilterRow("PairAge", pairAge, setPairAge, undefined, "hours")}
                {renderFilterRow("24H Txns", txns24h, setTxns24h)}
                {renderFilterRow("24H Buys", buys24h, setBuys24h)}
                {renderFilterRow("24H Sells", sells24h, setSells24h)}
                {renderFilterRow("24H Volume", volume24h, setVolume24h, "$")}
                <div className="flex justify-center items-center">
                    <div className="w-[150px] flex items-center justify-left sm:justify-left md:justify-end pr-2">
                        <span>Interval:</span>
                    </div>
                    <CustomInputField
                        placeholder="Refresh Interval"
                        suffix="minutes"
                        type="number"
                        value={refreshInterval}
                        onChange={handleRefreshIntervalChange}
                    />
                </div>
                <div className="flex justify-center items-center py-3">
                    <Button
                        className="cursor-pointer rounded-md inline-flex items-center gap-2 bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-800"
                        onClick={applyFilters}
                    >
                        Ok
                    </Button>
                    <Button
                        className="cursor-pointer rounded-md inline-flex items-center gap-2 bg-gray-600 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600 ml-1"
                        onClick={() => {
                            onClose();
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        className="cursor-pointer rounded-md inline-flex items-center gap-2 bg-gray-500 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-500 ml-1"
                        onClick={handleResetClicked}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}