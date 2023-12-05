import {
  ConnectWallet,
  detectContractFeature,
  useActiveClaimConditionForWallet,
  useAddress,
  useChain,
  useClaimConditions,
  useClaimedNFTSupply,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useConnectionStatus,
  useContract,
  useContractMetadata,
  useNFT,
  useUnclaimedNFTSupply,
  Web3Button,
  useChainId,
} from "@thirdweb-dev/react";
import {
  ChainvineClient,
  storeReferrerId,
  getReferrerId,
} from "@chainvine/sdk";
import { BigNumber, utils } from "ethers";
import { useMemo, useState, useEffect } from "react";
import { HeadingImage } from "./components/HeadingImage";
import { useToast } from "./components/ui/use-toast";
import { parseIneligibility } from "./utils/parseIneligibility";
import {
  clientIdConst,
  primaryColorConst,
  themeConst,
  chainVineCampaignIdConst,
} from "./consts/parameters";
import { ContractWrapper } from "@thirdweb-dev/sdk/dist/declarations/src/evm/core/classes/contract-wrapper";
import {
  Polygon,
  Binance,
  Ethereum,
  Optimism,
  Base,
  Arbitrum,
  Avalanche,
} from "@thirdweb-dev/chains";
import { AppChainId } from "./main";
import { XMarkIcon } from "@heroicons/react/20/solid";
import FooterButtonsDarkExample from "./components/ui/footer";

const urlParams = new URL(window.location.toString()).searchParams;
const primaryColor =
  urlParams.get("primaryColor") || primaryColorConst || undefined;

const colors = {
  purple: "#7C3AED",
  blue: "#1dc0cc",
  orange: "#F59E0B",
  pink: "#EC4899",
  green: "#10B981",
  red: "#e20000",
  teal: "#14B8A6",
  cyan: "#22D3EE",
  yellow: "#FBBF24",
} as const;

const binanceContract = "0xb00e27BafE8Ec5FBbAf1a51dC2cc0004F6227706";
const polygonContract = "0xdb852C14085C7f386CaE46d089CcaA7f87C6733b";
const ethereumContract = "0x2CB22e972290D5384bE29Acab1B36a256eAc0109";
const optimismContract = "0xEFf9F5EFc29b3B2faE70a288FAD8E73661D57af1";
const baseContract = "0x3fa4A0a09510d5045a31327007016d5ae8eB24bf";
const arbitrumContract = "0xF16d12bcE3cf43981d2a3C581513453dCf7Da59b";
const avalancheContract = "0xda92a3578EB469671EeCA23b9d42E40DB5C9fE52";

export default function Home(props: {
  setAppChainId: (chainId: AppChainId) => void;
  appChainId: AppChainId;
}) {
  const chainId = useChainId();
  const { appChainId } = props;
  const chain = useChain();
  console.log("chain:", chain?.chainId);
  const status = useConnectionStatus();
  console.log("status:", status);

  const [contractAddress, setContractAddress] = useState(binanceContract);
  const contractQuery = useContract(contractAddress);
  const contractMetadata = useContractMetadata(contractQuery.contract);
  const { toast } = useToast();
  let theme = (urlParams.get("theme") || themeConst || "light") as
    | "light"
    | "dark"
    | "system";
  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  const [removeBanner, setRemoveBanner] = useState(false);

  useEffect(() => {
    console.log("current contractAddress:", contractAddress);
    console.log("binanceContract:", binanceContract);
    console.log("polygonContract:", polygonContract);
    console.log("ethereumContract:", ethereumContract);
    console.log("optimismContract:", optimismContract);
    console.log("baseContract:", baseContract);
    console.log("arbitrumContract:", arbitrumContract);
    console.log("avalancheContract:", avalancheContract);

    if (chain !== undefined) {
      if (chainId && chainId !== appChainId) {
        if (
          chainId === Polygon.chainId ||
          chainId === Binance.chainId ||
          chainId === Ethereum.chainId ||
          chainId === Optimism.chainId ||
          chainId === Base.chainId ||
          chainId === Arbitrum.chainId ||
          chainId === Avalanche.chainId
        ) {
          props.setAppChainId(chainId);

          if (chainId === Binance.chainId) {
            setContractAddress(binanceContract);
          }
          if (chainId === Polygon.chainId) {
            setContractAddress(polygonContract);
          }
          if (chainId === Ethereum.chainId) {
            setContractAddress(ethereumContract);
          }
          if (chainId === Optimism.chainId) {
            setContractAddress(optimismContract);
          }
          if (chainId === Base.chainId) {
            setContractAddress(baseContract);
          }
          if (chainId === Arbitrum.chainId) {
            setContractAddress(arbitrumContract);
          }
          if (chainId === Avalanche.chainId) {
            setContractAddress(avalancheContract);
          }
        }
      }
    }
  }, [chain]);

  const collapse = async () => {
    setRemoveBanner(true);
  };

  const root = window.document.documentElement;
  root.classList.add(theme);
  const address = useAddress();
  const [quantity, setQuantity] = useState(1);
  const claimConditions = useClaimConditions(contractQuery.contract);
  const activeClaimCondition = useActiveClaimConditionForWallet(
    contractQuery.contract,
    address,
  );
  const claimerProofs = useClaimerProofs(contractQuery.contract, address || "");
  const claimIneligibilityReasons = useClaimIneligibilityReasons(
    contractQuery.contract,
    {
      quantity,
      walletAddress: address || "",
    },
  );
  const unclaimedSupply = useUnclaimedNFTSupply(contractQuery.contract);
  const claimedSupply = useClaimedNFTSupply(contractQuery.contract);
  const { data: firstNft, isLoading: firstNftLoading } = useNFT(
    contractQuery.contract,
    0,
  );

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0)
      .add(BigNumber.from(unclaimedSupply.data || 0))
      .toString();
  }, [claimedSupply.data, unclaimedSupply.data]);

  const priceToMint = useMemo(() => {
    const bnPrice = BigNumber.from(
      activeClaimCondition.data?.currencyMetadata.value || 0,
    );
    return `${utils.formatUnits(
      bnPrice.mul(quantity).toString(),
      activeClaimCondition.data?.currencyMetadata.decimals || 18,
    )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const isOpenEdition = useMemo(() => {
    if (contractQuery?.contract) {
      const contractWrapper = (contractQuery.contract as any)
        .contractWrapper as ContractWrapper<any>;

      const featureDetected = detectContractFeature(
        contractWrapper,
        "ERC721SharedMetadata",
      );

      return featureDetected;
    }
    return false;
  }, [contractQuery.contract]);

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable;
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0,
      );
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000);
    }

    let perTransactionClaimable;
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0,
      );
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000);
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable;
    }

    const snapshotClaimable = claimerProofs.data?.maxClaimable;

    if (snapshotClaimable) {
      if (snapshotClaimable === "0") {
        // allowed unlimited for the snapshot
        bnMaxClaimable = BigNumber.from(1_000_000);
      } else {
        try {
          bnMaxClaimable = BigNumber.from(snapshotClaimable);
        } catch (e) {
          // fall back to default case
        }
      }
    }

    const maxAvailable = BigNumber.from(unclaimedSupply.data || 0);

    let max;
    if (maxAvailable.lt(bnMaxClaimable) && !isOpenEdition) {
      max = maxAvailable;
    } else {
      max = bnMaxClaimable;
    }

    if (max.gte(1_000_000)) {
      return 1_000_000;
    }
    return max.toNumber();
  }, [
    claimerProofs.data?.maxClaimable,
    unclaimedSupply.data,
    activeClaimCondition.data?.maxClaimableSupply,
    activeClaimCondition.data?.maxClaimablePerWallet,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
            0,
          )) ||
        (numberClaimed === numberTotal && !isOpenEdition)
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
    isOpenEdition,
  ]);

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    );
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ]);

  const isLoading = useMemo(() => {
    return (
      activeClaimCondition.isLoading ||
      unclaimedSupply.isLoading ||
      claimedSupply.isLoading ||
      !contractQuery.contract
    );
  }, [
    activeClaimCondition.isLoading,
    contractQuery.contract,
    claimedSupply.isLoading,
    unclaimedSupply.isLoading,
  ]);

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading],
  );

  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return "Sold Out";
    }

    if (canClaim) {
      const pricePerToken = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0,
      );
      if (pricePerToken.eq(0)) {
        return "Mint (Free)";
      }
      return `Mint (${priceToMint})`;
    }
    if (claimIneligibilityReasons.data?.length) {
      return parseIneligibility(claimIneligibilityReasons.data, quantity);
    }
    if (buttonLoading) {
      return "Checking eligibility...";
    }

    return "Minting not available";
  }, [
    isSoldOut,
    canClaim,
    claimIneligibilityReasons.data,
    buttonLoading,
    activeClaimCondition.data?.currencyMetadata.value,
    priceToMint,
    quantity,
  ]);

  const dropNotReady = useMemo(
    () =>
      claimConditions.data?.length === 0 ||
      claimConditions.data?.every((cc) => cc.maxClaimableSupply === "0"),
    [claimConditions.data],
  );

  const dropStartingSoon = useMemo(
    () =>
      (claimConditions.data &&
        claimConditions.data.length > 0 &&
        activeClaimCondition.isError) ||
      (activeClaimCondition.data &&
        activeClaimCondition.data.startTime > new Date()),
    [
      activeClaimCondition.data,
      activeClaimCondition.isError,
      claimConditions.data,
    ],
  );

  const clientId = urlParams.get("clientId") || clientIdConst || "";
  if (!clientId) {
    return (
      <div className="flex h-full items-center justify-center">
        Client ID is required as a query param to use this page.
      </div>
    );
  }

  if (!contractAddress) {
    return (
      <div className="flex h-full items-center justify-center">
        No contract address provided
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen">
      {removeBanner === false && (
        <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-gray-50 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
          <div
            className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
              }}
            />
          </div>
          <div
            className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm leading-6 text-gray-900">
              {/* <strong className="font-semibold">GeneriCon 2023</strong> */}
              {/* <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
            <circle cx={1} cy={1} r={1} />
          </svg> */}
              <strong className="font-semibold">
                Spread the word and get 15%!
              </strong>
            </p>
            <a
              target="blank"
              href="https://app.chainvine.xyz/arthera/O2HpAta7Da"
              className="flex-none rounded-full bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >
              Get my referral link <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <div className="flex flex-1 justify-end">
            <button
              type="button"
              className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
              onClick={collapse}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5 text-gray-900" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <ConnectWallet className="!absolute !right-4 !top-16" theme={theme} />
      <div className="grid h-screen grid-cols-1 lg:grid-cols-12">
        <div className="hidden h-full w-full items-center justify-center lg:col-span-5 lg:flex lg:px-12">
          <HeadingImage
            src={contractMetadata.data?.image || firstNft?.metadata.image || ""}
            isLoading={isLoading}
          />
        </div>
        <div className="col-span-1 flex h-full w-full items-center justify-center lg:col-span-7">
          <div className="flex w-full max-w-xl flex-col gap-4 rounded-xl p-12 lg:border lg:border-gray-400 lg:dark:border-gray-800">
            <div className="mt-8 flex w-full xs:mb-8 xs:mt-0 lg:hidden">
              <HeadingImage
                src={
                  contractMetadata.data?.image || firstNft?.metadata.image || ""
                }
                isLoading={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2 xs:gap-4">
              {isLoading ? (
                <div
                  role="status"
                  className="animate-pulse space-y-8 md:flex md:items-center md:space-x-8 md:space-y-0"
                >
                  <div className="w-full">
                    <div className="h-10 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ) : isOpenEdition ? null : (
                <p>
                  <span className="text-lg font-bold tracking-wider text-gray-500 xs:text-xl lg:text-2xl">
                    {numberClaimed}
                  </span>{" "}
                  <span className="text-lg font-bold tracking-wider xs:text-xl lg:text-2xl">
                    / {numberTotal} minted
                  </span>
                </p>
              )}
              <h1 className="line-clamp-2 text-2xl font-bold xs:text-3xl lg:text-4xl">
                {contractMetadata.isLoading ? (
                  <div
                    role="status"
                    className="animate-pulse space-y-8 md:flex md:items-center md:space-x-8 md:space-y-0"
                  >
                    <div className="w-full">
                      <div className="h-8 w-48 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  contractMetadata.data?.name
                )}
              </h1>
              {contractMetadata.data?.description ||
              contractMetadata.isLoading ? (
                <div className="text-white-500 line-clamp-4">
                  {contractMetadata.isLoading ? (
                    <div
                      role="status"
                      className="animate-pulse space-y-8 md:flex md:items-center md:space-x-8 md:space-y-0"
                    >
                      <div className="w-full">
                        <div className="mb-2.5 h-2 max-w-[480px] rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <div className="mb-2.5 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <span className="sr-only">Loading...</span>
                    </div>
                  ) : (
                    contractMetadata.data?.description
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex w-full gap-4">
              {dropNotReady ? (
                <span className="text-red-500">
                  This drop is not ready to be minted yet. (No claim condition
                  set)
                </span>
              ) : dropStartingSoon ? (
                <span className="text-gray-500">
                  Drop is starting soon. Please check back later.
                </span>
              ) : (
                <div className="flex w-full flex-col gap-4">
                  <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-4 ">
                    <div className="flex h-11 w-full rounded-lg border border-gray-400 px-2 dark:border-gray-800 md:w-full">
                      <button
                        onClick={() => {
                          const value = quantity - 1;
                          if (value > maxClaimable) {
                            setQuantity(maxClaimable);
                          } else if (value < 1) {
                            setQuantity(1);
                          } else {
                            setQuantity(value);
                          }
                        }}
                        className="flex h-full items-center justify-center rounded-l-md px-2 text-center text-2xl disabled:cursor-not-allowed disabled:text-gray-500 dark:text-white dark:disabled:text-gray-600"
                        disabled={isSoldOut || quantity - 1 < 1}
                      >
                        -
                      </button>
                      <p className="flex h-full w-full items-center justify-center text-center font-mono dark:text-white lg:w-full">
                        {!isLoading && isSoldOut ? "Sold Out" : quantity}
                      </p>
                      <button
                        onClick={() => {
                          const value = quantity + 1;
                          if (value > maxClaimable) {
                            setQuantity(maxClaimable);
                          } else if (value < 1) {
                            setQuantity(1);
                          } else {
                            setQuantity(value);
                          }
                        }}
                        className={
                          "flex h-full items-center justify-center rounded-r-md px-2 text-center text-2xl disabled:cursor-not-allowed disabled:text-gray-500 dark:text-white dark:disabled:text-gray-600"
                        }
                        disabled={isSoldOut || quantity + 1 > maxClaimable}
                      >
                        +
                      </button>
                    </div>
                    <Web3Button
                      contractAddress={
                        contractQuery.contract?.getAddress() || ""
                      }
                      style={{
                        backgroundColor:
                          colors[primaryColor as keyof typeof colors] ||
                          primaryColor,
                        maxHeight: "43px",
                      }}
                      theme={theme}
                      action={async (cntr) => {
                        storeReferrerId();
                        cntr.erc721.claim(quantity);
                        const config = {
                          logToConsole: true, // Optional parameter for your debugging purposes
                          testMode: false, //This tells the SDK to point to our staging environment
                        };
                        const client = new ChainvineClient(config);
                        const campaign = {
                          id: chainVineCampaignIdConst,
                        };
                        const referrerId = getReferrerId();
                        console.log("address:", address);
                        console.log("referrerId:", referrerId);
                        if (address && referrerId) {
                          const userClient = await client.syncUser(address);
                          await userClient
                            .referral({
                              campaign,
                            })
                            .linkToReferrer(referrerId);
                        }
                        if (referrerId) {
                          await client.recordClick(referrerId, campaign.id);
                        }
                      }}
                      isDisabled={!canClaim || buttonLoading}
                      onError={(err) => {
                        console.error(err);
                        console.log({ err });
                        toast({
                          title: "Failed to mint drop",
                          description: (err as any).reason || "",
                          duration: 9000,
                          variant: "destructive",
                        });
                      }}
                      onSuccess={() => {
                        toast({
                          title: "Successfully registered",
                          description:
                            "The NFT will be transferred to your wallet when your transaction is confirmed.",
                          duration: 5000,
                          className: "bg-green-500",
                        });
                      }}
                    >
                      {buttonLoading ? (
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="mr-2 h-4 w-4 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      ) : (
                        buttonText
                      )}
                    </Web3Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl rounded-lg p-4 ">
        <h2 className="mt-20 text-3xl font-bold text-white xs:text-3xl lg:text-4xl">
          Unlock the Future with an Arthera Genesis Power User Lifetime
          Subscription NFT
        </h2>
        <br />
        <h4 className="xs:text-1xl text-base text-white lg:text-2xl">
          Arthera is a Layer 1 EVM-compatible blockchain, improved by DAG-based
          technology. Testnet is live and{" "}
          <strong>Mainnet launches on December 25th 2023</strong>.
        </h4>
        <br />
        <p className="text-white">
          With a dual model offering both pay-as-you-go and subscription
          options, Arthera's Lifetime Subscriptions (LTS) provide unparalleled
          access to our evolving ecosystem. On Arthera you subscribe and forget
          gas fees - for life.
        </p>
        <br />
        <p className="text-white">Enjoy Web3 as you enjoy the web.</p>
        <br />
        <p className="text-white">
          <strong>
            Make Arthera your destination, and embrace a future of seamless,
            secure and cost-effective blockchain exploration.
          </strong>
        </p>
        <br />
        <p className="text-white">
          Say goodbye to gas fee worries on Arthera. Engage with the Arthera
          blockchain freely - a lifetime of up to 30 daily transactions on
          Arthera at no additional cost.{" "}
          <i>
            Open the Arthera door to DeFi, Gaming, NFT Marketplace, and
            everything Web3 - with no gas fees
          </i>
          .
        </p>
        <br />
        <p>
          <strong>You have just three things to do</strong>:
        </p>
        <br />
        <ul className="mb-4 list-disc pl-6">
          <li className="text-white">
            Select your network and click on mint LTS NFT.
          </li>
          <li className="text-white">
            Spread the word with your{" "}
            <a
              target="_blank"
              href="https://app.chainvine.xyz/arthera/O2HpAta7Da"
            >
              referral code
            </a>
            .
          </li>
          <li className="text-white">Earn cash from referrals.</li>
        </ul>

        <p className="text-white">
          <i>
            Note: Networks available are Arbitrum One, Avalanche C-Chain, Base
            BNB Chain, Ethereum, Optimism, Polygon). You need funds and gas to
            mint, but then you’ll be ready for no gas fees on Arthera!
          </i>
        </p>
        <br />
        <p className="text-white">
          If you need any help at all, please ask{" "}
          <a target="_blank" href="https://t.me/artherachain/9">
            here
          </a>
          .
        </p>

        <section>
          <div className="mx-0 max-w-screen-xl px-0 py-0 sm:py-16 lg:px-6">
            <div className="mb-8 max-w-screen-md lg:mb-16">
              <h2 className="mb-4 text-4xl font-extrabold text-gray-500 dark:text-white">
                Key Details
              </h2>
            </div>
            <div className="space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0 lg:grid-cols-3">
              <div>
                <p className="text-2xl text-white dark:text-white">
                  Enjoy Arthera Chain with no gas fee worries - a lifetime of
                  Web3 freedom on Arthera
                </p>
                <br />
                <p className="text-1xl text-white dark:text-white">
                  <strong>Affiliate/Referral Program:</strong>
                </p>
                <ul className="mb-4 list-disc pl-6">
                  <li className="text-white">15% referral bonus per LTS NFT</li>
                  <li className="text-white">30% for 11 referrals or more</li>
                  <li className="text-white">Powered by ChainVine</li>
                </ul>
              </div>
              <div>
                <p className="text-2xl text-white dark:text-white">
                  Arthera Lifetime Subscription NFT
                </p>
                <br />
                <ul className="mb-4 list-disc pl-6">
                  <li className="text-white">
                    The subscription grants a daily amount of “gas credit”
                    equivalent to 30 transfers. This gas credit can be used with
                    any dApps that support Arthera subscriptions.
                  </li>
                  <li className="text-white">
                    This could cover 6 daily swaps if each swap requires 5x the
                    amount of gas units needed for a transfer.
                  </li>
                  <li className="text-white">
                    Usually that gas 'credit' lets you make up to 30 $AA token
                    transfers, or up to 30 ERC20/ERC721/ERC1155 token transfers.
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-2xl text-white dark:text-white">
                  Available now on 7 blockchains for 33 USD each (99 USD after
                  Arthera Mainnet launch):
                </p>
                <br />

                <ul className="mb-4 list-disc pl-6">
                  <li className="text-white">Limited edition (# per chain)</li>
                  <li className="text-white">Arbitrum One (222)</li>
                  <li className="text-white">Avalanche C-Chain (111)</li>
                  <li className="text-white">Base (111)</li>
                  <li className="text-white">BNB Chain (333)</li>
                  <li className="text-white">Ethereum (444)</li>
                  <li className="text-white">Optimism (111)</li>
                  <li className="text-white">Polygon (333)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <p className="text-white">
          <i>
            Important: After the Arthera Mainnet Genesis Public Launch, you will
            be able to bridge your NFT to Arthera to get your Lifetime License,
            allowing for 30 daily transactions on Arthera only.
          </i>
        </p>

        <br />
        <br />
      </div>

      <FooterButtonsDarkExample />
    </div>
  );
}
