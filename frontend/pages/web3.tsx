import { Address, NFTCard, Connector, ConnectButton } from "@ant-design/web3";
import { injected } from "wagmi/connectors";
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { WagmiWeb3ConfigProvider, MetaMask, ScrollSepolia } from '@ant-design/web3-wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(), // 节点服务，使用 ZAN / Alchemy / Infura 等
  },
  connectors: [
    injected({
      target: "metaMask"
    })
  ]
});

const queryClient = new QueryClient();

export default function Web3() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiWeb3ConfigProvider config={config} wallets={[MetaMask()]} chains={[ScrollSepolia]}>
        <Address format address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9" />
        <NFTCard address="0xEcd0D12E21805803f70de03B72B1C162dB0898d9" tokenId={641} />
        <Connector>
          <ConnectButton />
        </Connector>
      </WagmiWeb3ConfigProvider>
    </QueryClientProvider>
  );
}

