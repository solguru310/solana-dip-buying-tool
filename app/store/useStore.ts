import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Range {
    min: number;
    max: number;
}

interface Token {
    address: string;
    name: string;
    symbol: string;
    metaId: string;
    mcap: number;
    liquidity: number;
}

interface Filter {
    liquidity: Range;
    mcap: Range;
    fdv: Range;
    pairAge: Range;
    txns24h: Range;
    buys24h: Range;
    sells24h: Range;
    volume24h: Range;
}

interface StoreState {
    privateKey: string;
    tokenList: Token[];
    filter: Filter;
    loading: boolean;
    totalTokenCount: number;
    interval: number;
    setWalletPrivateKey: (privateKey: string) => void;
    resetWalletPrivateKey: () => void;
    setInterval: (value: number) => void;
    setFilter: (key: keyof Filter, value: Range) => void;
    resetFilter: () => void;
    resetTokenList: () => void;
    fetchData: (searchMode: boolean, autoFetching: boolean) => void;
}

const constructUrl = (filter: Filter): string => {
    const baseUrl = "";

    const queryParams: string[] = [];

    if (filter.liquidity.min > 0) queryParams.push(`minLiq=${filter.liquidity.min}`);
    if (filter.liquidity.max > 0) queryParams.push(`maxLiq=${filter.liquidity.max}`);

    if (filter.mcap.min > 0) queryParams.push(`minMarketCap=${filter.mcap.min}`);
    if (filter.mcap.max > 0) queryParams.push(`maxMarketCap=${filter.mcap.max}`);

    if (filter.fdv.min > 0) queryParams.push(`minFdv=${filter.fdv.min}`);
    if (filter.fdv.max > 0) queryParams.push(`maxFdv=${filter.fdv.max}`);

    if (filter.pairAge.min > 0) queryParams.push(`minAge=${filter.pairAge.min}`);
    if (filter.pairAge.max > 0) queryParams.push(`maxAge=${filter.pairAge.max}`);

    if (filter.txns24h.min > 0) queryParams.push(`min24HTxns=${filter.txns24h.min}`);
    if (filter.txns24h.max > 0) queryParams.push(`max24HTxns=${filter.txns24h.max}`);

    if (filter.buys24h.min > 0) queryParams.push(`min24HBuys=${filter.buys24h.min}`);
    if (filter.buys24h.max > 0) queryParams.push(`max24HBuys=${filter.buys24h.max}`);

    if (filter.sells24h.min > 0) queryParams.push(`min24HSells=${filter.sells24h.min}`);
    if (filter.sells24h.max > 0) queryParams.push(`max24HSells=${filter.sells24h.max}`);

    if (filter.volume24h.min > 0) queryParams.push(`min24HVol=${filter.volume24h.min}`);
    if (filter.volume24h.max > 0) queryParams.push(`max24HVol=${filter.volume24h.max}`);

    return `${baseUrl}${queryParams.length ? '&' + queryParams.join('&') : ''}`;
};

const constructNextUrl = (filter: Filter, currentTokenCount: number, totalTokenCount: number): string => {
    try {
        if (Math.ceil(currentTokenCount / 100) < Math.ceil(totalTokenCount / 100)) {
            const pageNumber = Math.ceil(currentTokenCount / 100) + 1;

            const queryParams: string[] = [];

            if (filter.liquidity.min > 0) queryParams.push(`minLiq=${filter.liquidity.min}`);
            if (filter.liquidity.max > 0) queryParams.push(`maxLiq=${filter.liquidity.max}`);

            if (filter.mcap.min > 0) queryParams.push(`minMarketCap=${filter.mcap.min}`);
            if (filter.mcap.max > 0) queryParams.push(`maxMarketCap=${filter.mcap.max}`);

            if (filter.fdv.min > 0) queryParams.push(`minFdv=${filter.fdv.min}`);
            if (filter.fdv.max > 0) queryParams.push(`maxFdv=${filter.fdv.max}`);

            if (filter.pairAge.min > 0) queryParams.push(`minAge=${filter.pairAge.min}`);
            if (filter.pairAge.max > 0) queryParams.push(`maxAge=${filter.pairAge.max}`);

            if (filter.txns24h.min > 0) queryParams.push(`min24HTxns=${filter.txns24h.min}`);
            if (filter.txns24h.max > 0) queryParams.push(`max24HTxns=${filter.txns24h.max}`);

            if (filter.buys24h.min > 0) queryParams.push(`min24HBuys=${filter.buys24h.min}`);
            if (filter.buys24h.max > 0) queryParams.push(`max24HBuys=${filter.buys24h.max}`);

            if (filter.sells24h.min > 0) queryParams.push(`min24HSells=${filter.sells24h.min}`);
            if (filter.sells24h.max > 0) queryParams.push(`max24HSells=${filter.sells24h.max}`);

            if (filter.volume24h.min > 0) queryParams.push(`min24HVol=${filter.volume24h.min}`);
            if (filter.volume24h.max > 0) queryParams.push(`max24HVol=${filter.volume24h.max}`);

            return ``;
        } else {
            return '';
        }
    } catch (error) {
        return '';
    }
}

const getLink = (documentString: string): string => {
    const pagination = /class="chakra-button custom-1nagll9"[^>]*href="([^"]+)"/g;
    const matches = [...documentString.matchAll(pagination)];

    if (matches) {
        try {
            let linkArray: Array<string> = [];
            matches.forEach((match, index) => {
                linkArray.push(match[1]);
            });
            const nextLink = linkArray.reverse()[0];
            return `https://dexscreener.com${nextLink}`;
        } catch (error) {
            return '';
        }
    }
    return '';
}

const useStore = create<StoreState>((set, get) => ({
    privateKey: "",
    tokenList: [],
    totalTokenCount: 0,
    interval: 180,
    filter: {
        liquidity: { min: 0, max: 0 },
        mcap: { min: 0, max: 0 },
        fdv: { min: 0, max: 0 },
        pairAge: { min: 0, max: 0 },
        txns24h: { min: 0, max: 0 },
        buys24h: { min: 0, max: 0 },
        sells24h: { min: 0, max: 0 },
        volume24h: { min: 0, max: 0 }
    },
    loading: true,
    nextLink: '',
    setWalletPrivateKey: (privateKey) => set({ privateKey }),
    resetWalletPrivateKey: () => set({ privateKey: "" }),
    setFilter: (key, value) => set((state) => ({
        filter: {
            ...state.filter,
            [key]: value
        }
    })),
    setInterval: (value) => set({ interval: value }),
    resetFilter: () => set({
        filter: {
            liquidity: { min: 0, max: 0 },
            mcap: { min: 0, max: 0 },
            fdv: { min: 0, max: 0 },
            pairAge: { min: 0, max: 0 },
            txns24h: { min: 0, max: 0 },
            buys24h: { min: 0, max: 0 },
            sells24h: { min: 0, max: 0 },
            volume24h: { min: 0, max: 0 }
        }
    }),
    resetTokenList: () => set({ tokenList: [], loading: true, totalTokenCount: 0 }),
    fetchData: async (searchMode: boolean, autoFetching: boolean) => {
        try {
            let targetUrl: string = "";
            if (searchMode) {
                if (!autoFetching) set({ loading: true });
                targetUrl = constructUrl(get().filter);
            } else {
                const { filter, tokenList, totalTokenCount } = get();
                targetUrl = constructNextUrl(filter, tokenList.length, totalTokenCount);
            }

            // Encode the URL to make it safe for use in a query parameter
            const encodedUrl = encodeURIComponent(targetUrl);

            // Use the new API route
            const response = await axios.get(`/api/dexscreener?url=${encodedUrl}`);
            const data = response.data;

            const validJsonString = typeof data === 'string'
                ? data
                    .replace(/undefined/g, 'null')
                    .replace(/,\s*([\]}])/g, '$1')
                    .replace(/,\s*$/g, '')
                    .replace(/(?<=\d),(?=\d)/g, '')
                : JSON.stringify(data);

            const pairRegexp = /"pairs":\s*(\[[^]*?\])\s*,\s*"pairsCount"/;
            const countRegexp = /of\s+(\d+)<\/span>/;
            const pairMatch = validJsonString.match(pairRegexp);

            if (pairMatch && pairMatch[1]) {
                try {
                    if (searchMode) {
                        const countMatch = validJsonString.match(countRegexp);
                        if (countMatch && countMatch[1]) {
                            const dataCount = JSON.parse(countMatch[1]);
                            set({ totalTokenCount: dataCount });
                        }
                    }

                    const pairsArray = JSON.parse(pairMatch[1]);
                    const newArray = pairsArray.map((pair: any) => {
                        const baseToken = pair?.baseToken || {};
                        const launchpadMeta = pair?.launchpad?.meta || {};

                        return {
                            address: baseToken.address || '',
                            name: baseToken.name || 'Unknown',
                            symbol: baseToken.symbol || 'N/A',
                            metaId: launchpadMeta.id ?? 'not pump',
                            mcap: pair?.marketCap ?? 0,
                            liquidity: pair?.liquidity?.usd != null ? pair.liquidity.usd : 0
                        };
                    });

                    if (!autoFetching) {
                        set({ tokenList: [...get().tokenList, ...newArray], loading: false });
                    } else {
                        set({ tokenList: [ ...newArray], loading: false });
                    }

                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    set({ loading: false });
                }
            } else {
                console.error('No "pairs" array found.');
                set({ loading: false });
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(`❌ Error fetching data. Check connection.`);
            set({ loading: false });
        }
    },
}));

export default useStore;