import React, { useState, useEffect, useCallback } from "react";
import CustomInputField from "../utils/customInput";
import { Button } from '@headlessui/react';
import classNames from 'classnames';
import toast from "react-hot-toast";
import useStore from "../../store/useStore";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { buy } from '../../raydium/swap';
import { getPoolId } from '../../raydium/utils';
import { NATIVE_MINT } from '@solana/spl-token';
import { connection, jupiterAPIURL, jitoFee } from "../../config";
import bs58 from 'bs58';
import axios from 'axios';

interface Token {
    address: string;
    name: string;
    symbol: string;
    metaId: string;
    mcap: number;
    liquidity: number;
}

interface PriceObject {
    [key: string]: number;
}

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

const BuyingConfig: React.FC = React.memo(() => {
    const { tokenList, setWalletPrivateKey } = useStore();
    const [privateKey, setPrivateKey] = useState<string>("");
    const [pumpAddresses, setPumpAddresses] = useState<string[]>([]);
    const [dipPercentage, setDipPercentage] = useState<string>("");
    const [solanaBalance, setSolanaBalance] = useState<string>("");
    const [isBusy, setIsBusy] = useState<boolean>(false);

    useEffect(() => {
        bStopProcess = !isBusy;
    }, [isBusy]);


    const dipBuying = async (mint: string, solBalance: number, mainKeypairHex: string, epoch: number) => {
        //////////////////////////////////////
    };

    const getAddressesByAPI = useCallback(async () => {
        try {
            const addressString = pumpAddresses.join(',');
            const response = await fetch(jupiterAPIURL + addressString);
            const result = await response.json();
            return result.data ? transformPriceData(result.data) : {};
        } catch (error) {
            toast.error(`❌ Error fetching the prices list.`);
            return {};
        }
    }, [pumpAddresses]);

    const getTokenSymbol = useCallback((mintAddress: string): string => {
        const token = tokenList.find((token) => token.address === mintAddress);
        return token ? token.name : '';
    }, [tokenList]);

    const notifyOnTelegram = async (message: string, dipPercentage: string, solanaBalance: string) => {
        const response = await axios.get(`/api/telegram?message=${message}`);
    }

    useEffect(() => {
        setWalletPrivateKey(privateKey);
    }, [privateKey])

    const handleInputChange = useCallback((setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter(value);
    }, []);



    return (
        <div className="min-h-full text-gray-300 px-2 flex flex-col">
            <div>
                {[
                    { label: "PK:", placeholder: "Private Key", onChange: handleInputChange(setPrivateKey), disabled: isBusy },
                    { label: "DIP:", placeholder: "Dip percentage", type: "number", suffix: "%", onChange: handleInputChange(setDipPercentage), disabled: isBusy },
                    { label: "SOL:", placeholder: "SOL balance", type: "number", prefix: "SOL", onChange: handleInputChange(setSolanaBalance), disabled: isBusy }
                ].map(({ label, ...inputProps }, index) => (
                    <div key={index} className="w-full flex justify-left mb-3">
                        <div className="w-[100px] flex items-center justify-end pr-2">
                            <span>{label}</span>
                        </div>
                        <div className="flex w-full">
                            <CustomInputField {...inputProps} />
                        </div>
                    </div>
                ))}
                <div className="w-full flex justify-end my-2 px-1 py-2">
                    <Button
                        className={classNames(
                            `cursor-pointer rounded-md inline-flex items-center gap-2 ${isBusy ? 'bg-gray-500' : 'bg-gray-800'} py-1.5 px-3 text-sm/6 font-semibold text-white shadow-inner shadow-white/10`,
                            "focus:outline-none data-[hover]:bg-gray-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
                        )}
                        onClick={isBusy ? handleStopBuyingClick : handleBuyButtonClick}
                    >
                        {isBusy ? <span>Stop</span> : <span>Buy</span>}
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default BuyingConfig;