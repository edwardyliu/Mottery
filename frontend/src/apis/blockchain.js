import { BigNumber, ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import RotteryAbi from "../abis/Rottery.json";
import MARKETPLACEV1Abi from "../abis/MarketplaceV1.json";
import { Rottery, MARKETPLACEV1 } from "../constants/addresses";

export const providerToWeb3Provider = (provider) => {
  return new ethers.providers.Web3Provider(provider);
};

export const getMetamaskProvider = async () => {
  const provider = await detectEthereumProvider();
  if (provider && provider.isMetaMask) {
    return provider;
  }
};

// "connected" and "disconnected" refer to whether the provider can make RPC requests to the current chain.
// export const isMetamaskConnected = (metamaskProvider) => {
//   return metamaskProvider.isConnected();
// };

export const addMetamaskListeners = (
  provider,
  chainChangedCallback,
  messageCallback,
  accountsChangedCallback,
  connectCallback,
  disconnectCallback
) => {
  provider.on("chainChanged", (chainId) => {
    chainChangedCallback(chainId);
  });
  provider.on("message", (message) => {
    messageCallback(message);
  });
  provider.on("accountsChanged", (accounts) => {
    accountsChangedCallback(accounts);
  });
  provider.on("connect", (info) => {
    connectCallback(info);
  });
  provider.on("accountsChanged", (info) => {
    disconnectCallback(info);
  });
};

export const getAccountSigner = (web3Provider) => {
  return web3Provider.getSigner();
};

export const weiToEth = (weiBalance) => {
  return ethers.utils.formatEther(weiBalance);
};

export const ethToWei = (ethBalance) => {
  return ethers.utils.parseEther(ethBalance);
};

export const formatDecimals = (numberString, decimals) => {
  let decimalPos = numberString.indexOf(".");
  if (decimalPos === -1) {
    return numberString;
  } else {
    return numberString.slice(0, decimalPos + 1 + decimals);
  }
};

export const formatUnits = (weiBalance, decimals) => {
  return ethers.utils.formatUnits(weiBalance, decimals);
};

export const isAddress = (address) => {
  return ethers.utils.isAddress(address);
};

// returns the address on success, error on reject
export const connectToMetaMaskPopUp = async (metamaskProvider) => {
  return await metamaskProvider.request({ method: "eth_requestAccounts" });
};

export const getRotteryContract = async (web3Provider) => {
  const RotteryContract = new ethers.Contract(
    Rottery,
    RotteryAbi,
    web3Provider.getSigner()
  );

  return RotteryContract;
};

export const getMarketplaceV1Contract = async (web3Provider) => {
  const MarketplaceV1Contract = new ethers.Contract(
    MARKETPLACEV1,
    MARKETPLACEV1Abi,
    web3Provider.getSigner()
  );

  return MarketplaceV1Contract;
};

export const getERC1155BalanceBatch = async (
  tokenContract,
  accountAddresses,
  tokenIds
) => {
  return await tokenContract.balanceOfBatch(accountAddresses, tokenIds);
};

export const getERC1155Uri = async (tokenContract, tokenId) => {
  let baseUri = await tokenContract.uri(tokenId.toString());
  return baseUri.replace("{id}", tokenId.toString());
};

export const getERC1155IsApprovedForAll = async (
  tokenContract,
  accountAddress,
  operatorAddress
) => {
  return await tokenContract.isApprovedForAll(accountAddress, operatorAddress);
};

export const setERC1155ApprovalForAll = async (
  tokenContract,
  operatorAddress
) => {
  console.log("operatorAddress", operatorAddress);
  let tx = await tokenContract.setApprovalForAll(operatorAddress, true);
  return await tx.wait();
};

export const safeTransferFromERC1155 = async (
  tokenContract,
  fromAddress,
  toAddress,
  tokenId,
  tokenAmount
) => {
  let tx = await tokenContract.safeTransferFrom(
    fromAddress,
    toAddress,
    tokenId,
    tokenAmount,
    "0x0"
  );
  return await tx.wait();
};

export const safeBatchTransferFromERC1155 = async (
  tokenContract,
  fromAddress,
  toAddress,
  tokenIds,
  tokenAmounts
) => {
  let tx = await tokenContract.safeBatchTransferFrom(
    fromAddress,
    toAddress,
    tokenIds,
    tokenAmounts,
    "0x0"
  );
  return await tx.wait();
};

export const getERC20Balance = async (tokenContract, accountAddress) => {
  return await tokenContract.balanceOf(accountAddress);
};

export const getERC20TotalSupply = async (tokenContract) => {
  return await tokenContract.totalSupply();
};