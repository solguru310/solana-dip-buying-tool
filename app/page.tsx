'use client'

import BouncingText from './components/utils/bouncingText';
import TokenList from "./components/sectors/tokenList";
import BuyingConfig from './components/sectors/buyConfig';
import SellConfig from './components/sectors/sellConfig';

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center items-start">
      <main className="px-2 sm:px-2 md:px-6 lg:px-8 xl:px-8 max-w-[300px] sm:max-w-[300px] md:max-w-none w-[75%]">
        <section className="flex justify-center items-center py-12">
          <BouncingText />
        </section>
        <section className="w-full flex flex-col justify-center items-center md:flex-row md:items-start px-4 py-4 shadow-lg">
          <div className="flex-[6]" >
            <TokenList />
          </div>
          <div className="flex-[4]">
            <div className="flex flex-col justify-around">
              <BuyingConfig />
              <SellConfig />
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
