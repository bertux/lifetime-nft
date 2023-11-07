import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "./styles/globals.css";
import { Toaster } from "./components/ui/Toaster";
import { getGasless } from "./utils/getGasless";
import {
  biconomyApiIdConst,
  biconomyApiKeyConst,
  chainConst,
  relayerUrlConst,
  clientIdConst,
} from "./consts/parameters";
// import {
//   Arbitrum,
//   Avalanche,
//   Base,
//   Binance,
//   Ethereum,
//   Polygon,
//   Optimism,
// } from "@thirdweb-dev/chains";
import {
  ArbitrumGoerli,
  AvalancheFuji,
  BaseGoerli,
  BinanceTestnet,
  Goerli,
  Mumbai,
  OptimismGoerli,
} from "@thirdweb-dev/chains";

const container = document.getElementById("root");
const root = createRoot(container!);
const urlParams = new URL(window.location.toString()).searchParams;

const relayerUrl = urlParams.get("relayUrl") || relayerUrlConst || "";
const biconomyApiKey =
  urlParams.get("biconomyApiKey") || biconomyApiKeyConst || "";
const biconomyApiId =
  urlParams.get("biconomyApiId") || biconomyApiIdConst || "";
const sdkOptions = getGasless(relayerUrl, biconomyApiKey, biconomyApiId);

const chain =
  urlParams.get("chain") && urlParams.get("chain")?.startsWith("{")
    ? JSON.parse(String(urlParams.get("chain")))
    : urlParams.get("chain") || chainConst;

const clientId = urlParams.get("clientId") || clientIdConst || "";

root.render(
  <React.StrictMode>
    <ThirdwebProvider
      activeChain={chain}
      supportedChains={[
        ArbitrumGoerli,
        AvalancheFuji,
        BaseGoerli,
        BinanceTestnet,
        Goerli,
        Mumbai,
        OptimismGoerli,
      ]}
      sdkOptions={sdkOptions}
      clientId={clientId}
    >
      <Toaster />
      <App />
    </ThirdwebProvider>
  </React.StrictMode>,
);
