import React, {
  createContext,
  useEffect,
  useState,
  useContext as _useContext,
} from "react";

import {
  providerToWeb3Provider,
  getMetamaskProvider,
  addMetamaskListeners,
  getRotteryContract,
  connectToMetaMaskPopUp,
  getMarketplaceV1Contract,
} from "../../apis/blockchain";

export const Context = createContext();

export const useContext = () => _useContext(Context);

export const ContextProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [metamaskInstalled, setMetamaskInstalled] = useState(false);
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const [currentAccountAddress, setCurrentAccountAddress] = useState(null);
  const [web3Provider, setWeb3Provider] = useState(null);

  const [contracts, setContracts] = useState({
    RotteryContract: null,
    MarketplaceV1Contract: null,
  });

  const connectToMetamask = async (web3Provider, promptUser) => {
    let address;
    try {
      //check if metamask is connected
      address = await web3Provider.getSigner().getAddress();
    } catch (error) {
      if (!promptUser) {
        return;
      }
      //not connected so invoke popup
      try {
        const addressArr = await connectToMetaMaskPopUp(web3Provider.provider);
        address = addressArr[0];
      } catch (error) {
        //user rejected connection
        setMetamaskConnected(false);
      }
    }

    if (address) {
      setCurrentAccountAddress(address);
      setMetamaskConnected(true);
    }
  };

  const connectToMetamaskOnMount = async () => {
    try {
      const metamaskProvider = await getMetamaskProvider();
      const _web3Provider = providerToWeb3Provider(metamaskProvider);
      if (metamaskProvider && _web3Provider) {
        if (metamaskProvider !== window.ethereum) {
          console.warn("Do you have multiple wallets installed?");
          console.warn("Please make sure metamask is properly exposed");
          return;
        }
        setWeb3Provider(_web3Provider);
        setMetamaskInstalled(true);
        await connectToMetamask(_web3Provider, false);
      }
    } catch (error) {
      console.warn(error, "metamask set up failed!");
    } finally {
      setInitialized(true);
    }
  };

  const setUpOnConnect = async () => {
    setContracts({
      RotteryContract: await getRotteryContract(web3Provider),
      MarketplaceV1Contract: await getMarketplaceV1Contract(web3Provider),
    });

    addMetamaskListeners(
      web3Provider.provider,
      (chainId) => {
        window.location.reload();
      },
      (message) => {
        console.warn(message);
      },
      (accounts) => {
        console.log(accounts);
        if (accounts.length === 0) {
          setMetamaskConnected(false);
          setMetamaskInstalled(false);
        } else if (accounts[0] !== currentAccountAddress) {
          setMetamaskConnected(true);
        }
      },
      (connectInfo) => {
        console.log(connectInfo);
      },
      (disconnectInfo) => {
        console.log(disconnectInfo);
        window.location.reload();
      }
    );
  };

  useEffect(() => {
    connectToMetamaskOnMount();
  }, []);

  useEffect(() => {
    if (!metamaskConnected) {
      return;
    }
    setUpOnConnect();
  }, [metamaskConnected]);

  return (
    <Context.Provider
      value={{
        initialized,
        contracts,
        metamaskInstalled,
        metamaskConnected,
        currentAccountAddress,
        connectToMetamask,
        web3Provider,
      }}
    >
      {children}
    </Context.Provider>
  );
};