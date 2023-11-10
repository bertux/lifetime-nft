import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "./styles/globals.css";
import { Toaster } from "./components/ui/Toaster";
import { getGasless } from "./utils/getGasless";
import {
  biconomyApiIdConst,
  biconomyApiKeyConst,
  relayerUrlConst,
  clientIdConst,
} from "./consts/parameters";
import {
  //   Arbitrum,
  //   Avalanche,
  //   Base,
  Binance,
  //   Ethereum,
  //   Optimism,
  //   Polygon,
} from "@thirdweb-dev/chains";
import {
// ArbitrumGoerli,
// AvalancheFuji,
// BaseGoerli,
// BinanceTestnet,
Goerli,
// OptimismGoerli,
  Mumbai,
} from "@thirdweb-dev/chains";

const container = document.getElementById("root");
const root = createRoot(container!);
const urlParams = new URL(window.location.toString()).searchParams;

export type AppChainId =
  | (typeof Mumbai)["chainId"]
  | (typeof Binance)["chainId"]
  | (typeof Goerli)["chainId"];

const relayerUrl = urlParams.get("relayUrl") || relayerUrlConst || "";
const biconomyApiKey =
  urlParams.get("biconomyApiKey") || biconomyApiKeyConst || "";
const biconomyApiId =
  urlParams.get("biconomyApiId") || biconomyApiIdConst || "";
const sdkOptions = getGasless(relayerUrl, biconomyApiKey, biconomyApiId);

const clientId = urlParams.get("clientId") || clientIdConst || "";

function AppWithProviders() {
  const [appChainId, setAppChainId] = useState<AppChainId>(Binance.chainId);

  return (
    <ThirdwebProvider
      clientId={clientId}
      activeChain={appChainId}
      // activeChain={Binance}
      supportedChains={[Binance, Goerli, Mumbai]}
    >
      <Toaster />

      <App appChainId={appChainId} setAppChainId={setAppChainId} />
    </ThirdwebProvider>
  );
}

root.render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>,
);
