import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown, FaEllipsisH } from "react-icons/fa";
import { Button } from '@headlessui/react';
import FilterDialog from "./filterDialog";
import useStore from "../../store/useStore";
import TableLoader from "../utils/tableLoader";
import toast from "react-hot-toast";
import CustomInputField from "../utils/customInput";

// Define a TypeScript interface for the token structure
interface Token {
  address: string;
  name: string;
  symbol: string;
  metaId: string;
  mcap: number;
  liquidity: number;
}

const TokenList: React.FC = () => {
  const [pumpTokens, setPumpTokens] = useState<Token[]>();
  const [showMore, setShowMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Token | null; direction: 'ascending' | 'descending' }>({ key: null, direction: "ascending" });
  const [searchTerm, setSearchTerm] = useState("");
  const { tokenList, totalTokenCount, loading, fetchData, interval } = useStore();

  useEffect(() => {
    fetchData(true, false);
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchData(true, true);
    }, Number(interval * 60000));

    return () => { clearInterval(refreshInterval) }
  }, [interval]);

  useEffect(() => {
    const newTokens = tokenList.filter((token) => token.metaId === "pumpfun");

    setPumpTokens(newTokens);

    const currentPage = Math.ceil(tokenList.length / 100);
    const totalPage = Math.ceil(totalTokenCount / 100);

    if (currentPage < totalPage) {
      setShowMore(true);
    } else {
      setShowMore(false);
    };
  }, [tokenList])

  const sortedFilteredTokens = useMemo(() => {
    const filteredTokens = pumpTokens?.filter((token) =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!sortConfig.key) return filteredTokens;

    return filteredTokens?.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Token];
      const bValue = b[sortConfig.key as keyof Token];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === "ascending"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [sortConfig, searchTerm, tokenList, pumpTokens]);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }, []);

  const handleSortRequest = useCallback((key: keyof Token) => {
    setSortConfig((prevConfig) => {
      let direction: 'ascending' | 'descending' = "ascending";
      if (prevConfig.key === key && prevConfig.direction === "ascending") {
        direction = "descending";
      } else if (prevConfig.key === key && prevConfig.direction === "descending") {
        return { key: null, direction: "ascending" }; // Reset sorting when toggled twice
      }
      return { key, direction };
    });
  }, []);

  const getSortIcon = useCallback((columnName: keyof Token) => {
    if (sortConfig.key !== columnName) return <FaSort className="inline ml-2" />;
    return sortConfig.direction === "ascending" ? <FaSortUp className="inline ml-2" /> : <FaSortDown className="inline ml-2" />;
  }, [sortConfig]);

  const handleLoadMoreItems = () => {
    fetchData(false, false);
  }

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="transition-colors duration-200 px-2 max-w-[300px] sm:max-w-[300px] md:max-w-none">
      <div className="container mx-auto relative">
        <div className="w-full flex">
          <div className="text-gray-300 w-full pr-3">
            <input
              type="text"
              placeholder="Search..."
              className="w-full remove-arrow input bg-[#fffff] px-3 py-1  focus:outline-none transition-all duration-150 ease-in-out rounded-l-lg border border-white/10 rounded-r-lg border-y border-r border-r-white/10 border-y-white/10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex justify-center items-center">
            <Button
              className={`rounded-md inline-flex items-center h-[35px] gap-2 py-1.5 px-3 text-sm font-semibold text-white shadow-inner shadow-white/10 focus:outline-none hover:bg-gray-600 ${loading ? 'bg-gray-600 cursor-default' : 'bg-gray-800 cursor-pointer'}`}
              onClick={openDialog}
              disabled={loading}
            >
              Filter
            </Button>

          </div>
          <FilterDialog isOpen={isOpen} onClose={closeDialog} />
        </div>

        <div className="overflow-x-auto my-2 rounded-lg shadow overflow-y-auto max-h-[600px] min-h-[600px]">
          <table className="relative min-w-full">
            <thead className="bg-gray-800 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer">NO</th>
                {["name", "symbol", "mcap", "liquidity"].map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortRequest(key as keyof Token)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)} {getSortIcon(key as keyof Token)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-300">
              {loading && tokenList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center absolute left-1/2 transform -translate-x-1/2 translate-y-3/4">
                    <TableLoader />
                  </td>
                </tr>
              ) : sortedFilteredTokens?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No tokens found
                  </td>
                </tr>
              ) : (
                sortedFilteredTokens?.map((token: Token, index: number) => (
                  <tr key={index} className="hover:bg-gray-500 hover:cursor-pointer transition-colors h-[50px]">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{token.name}</td>
                    <td className="px-6 py-4">{token.symbol}</td>
                    <td className="px-6 py-4">{formatNumber(token.mcap)}</td>
                    <td className="px-6 py-4">{formatNumber(token.liquidity)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {
            showMore && (
              <button
                className="bg-gray-400 group cursor-pointer rounded-full w-6 h-6 outline-none hover:bg-gray-300 duration-300 absolute right-3 bottom-3 flex justify-center items-center" title="Add New"
                onClick={handleLoadMoreItems}
              >
                <FaEllipsisH />
              </button>
            )
          }

        </div>
      </div>
    </div>
  );
};

export default TokenList;