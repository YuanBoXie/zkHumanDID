import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiWeb3ConfigProvider, MetaMask, ScrollSepolia } from '@ant-design/web3-wagmi';
import { injected } from "wagmi/connectors";
import { Connector, ConnectButton, useAccount } from "@ant-design/web3";
import { createConfig, http, useReadContract, useWriteContract, } from 'wagmi';
import { scrollSepolia } from 'wagmi/chains';
import axios from 'axios';
import { useState } from 'react';
import { Button, message } from "antd";
import { parseEther } from "viem";
import { abi as claim_abi, address as claim_address } from './abi/claim'

const inter = Inter({ subsets: ['latin'] })
const queryClient = new QueryClient();

const config = createConfig({
  chains: [scrollSepolia],
  transports: {
    [scrollSepolia.id]: http(), // 节点服务，使用 ZAN / Alchemy / Infura 等
  },
  connectors: [
    injected({
      target: "metaMask"
    })
  ]
});

function MainComponent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [fileId, setFileId] = useState('');

  const { writeContract } = useWriteContract()
  // const { address } = useAccount();

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadStatus('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/upload_human_info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('File uploaded successfully.');
      console.log('Upload response:', response.data);
      setFileId(response.data.filepath);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file.');
    }
  };

  const handleClaim = async () => {
    if (!fileId) {
      message.error('Please upload a file first.')
      return;
    }

    writeContract({
      address: claim_address,
      abi: claim_abi,
      functionName: 'deposit',
      args: [fileId]
    }, {
      onSuccess: () => {
        message.success("Mint Success, Wait for zkML Verify, zkML will cost a little time.");
      },
      onError: (err) => {
        message.error(err.message);
      },
    })
  };

  return (
    <>
      <Head>
        <title>zkHumanDID</title>
        <meta name="description" content="Creating on-chain DID digital identities for real human beings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div className={styles.description}>
          <p>
            Upload Human Face Image To Claim &nbsp;
            <code className={styles.code}>zkHumanDID SBT</code>
          </p>
          <div>
            <Connector>
              <ConnectButton />
            </Connector>
          </div>
        </div>

        <div className={styles.center}>
          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <button type="submit">Upload Image</button>
          </form>
          <p>Status: {uploadStatus}</p>
        </div>

        <div className={styles.grid}>
          <div>
            <div> 当前文件ID: {fileId}</div>
            <Button type="primary" onClick={handleClaim}>Claim</Button>
          </div>
        </div>
      </main>
    </>
  )

}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiWeb3ConfigProvider config={config} wallets={[MetaMask()]} chains={[ScrollSepolia]}>
        <MainComponent />
      </WagmiWeb3ConfigProvider>
    </QueryClientProvider>
  )
}
