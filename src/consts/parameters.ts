/** Change these values to configure the application for your own use. **/

// Your smart contract address (available on the thirdweb dashboard)
// For existing collections: import your existing contracts on the dashboard: https://thirdweb.com/dashboard
// on Arbitrum
// export const contractConst = "0xb3f5F57c1B06Cf171b6221149370aa9e66916Dc4";
// on Avalanche
// export const contractConst = "0xa5563F87EAacf9F76500cE6639b8c733F1BBf859";
// on Base
// export const contractConst = "0x19B1C6Cf5c80B164AfAf5cCB09B22981DF5A6Ac1";
// on Binance
// export const contractConst = "0xb00e27BafE8Ec5FBbAf1a51dC2cc0004F6227706";
// on Ethereum
// export const contractConst = "0x55153a49412a94aDc4Cee3AcFEBa64e2BB574C6c";
// on Optimism
// export const contractConst = "0x863fF3CE4B67e4555B2366BdFBAF5F7E77741c34";
// on Polygon
// export const contractConst = "0x960a99c28C165a6e97Fea9FD95b535D44Fa20359";

// The name of the chain your contract is deployed to.
// Refer to README.md on how to specify the chain name.
// export const chainConst = "mumbai";
// export const chainConst = "optimism-goerli";
// export const chainConst = "optimism";

// It is IMPORTANT to provide your own API key to use the thirdweb SDK and infrastructure.
// Please ensure that you define the correct domain for your API key from the API settings page.
// You can get one for free at https://thirdweb.com/create-api-key
// Learn more here: https://blog.thirdweb.com/changelog/api-keys-to-access-thirdweb-infra
export const clientIdConst = import.meta.env.VITE_TEMPLATE_CLIENT_ID || "";

// Configure the primary color for buttons and other UI elements
export const primaryColorConst = "blue";

// Choose between "light" and "dark" mode
export const themeConst = "dark";

// Gasless relayer configuration options
export const relayerUrlConst = ""; // OpenZeppelin relayer URL
export const biconomyApiKeyConst = ""; // Biconomy API key
export const biconomyApiIdConst = ""; // Biconomy API ID

// ChainVine configuration
export const chainVineCampaignIdConst = "O2HpAta7Da"; // ChainVine Campaign ID
