"use client";

// near api js
import { providers } from 'near-api-js';

// wallet selector
import { distinctUntilChanged, map } from 'rxjs';
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet';

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

export class Wallet {
  constructor({ networkId = 'testnet', createAccessKeyFor = undefined }) {
    this.createAccessKeyFor = createAccessKeyFor;
    this.networkId = networkId;
    this.selector = null;
  }

  /**
   * To be called when the website loads
   * @param {Function} accountChangeHook - a function that is called when the user signs in or out#
   * @returns {Promise<string>} - the accountId of the signed-in user
   */
  startUp = async (accountChangeHook) => {
    this.selector = await setupWalletSelector({
      network: {networkId: this.networkId, nodeUrl: 'https://rpc.testnet.pagoda.co'},
      modules: [setupMyNearWallet(), setupHereWallet(), setupMeteorWallet(), setupBitteWallet()]
    });

    const isSignedIn = this.selector.isSignedIn();
    const accountId = isSignedIn ? this.selector.store.getState().accounts[0].accountId : '';

    this.selector.store.observable
      .pipe(
        map(state => state.accounts),
        distinctUntilChanged()
      )
      .subscribe(accounts => {
        const signedAccount = accounts.find((account) => account.active)?.accountId;
        accountChangeHook(signedAccount);
      });

    return accountId;
  };

  /**
   * Displays a modal to login the user
   */
  signIn = async () => {
    if (!this.selector) {
      throw new Error("Wallet not initialized. Please call startUp() first.");
    }
    const modal = setupModal(this.selector, { contractId: this.createAccessKeyFor });
    modal.show();
  };

  /**
   * Logout the user
   */
  signOut = async () => {
    const selectedWallet = await (await this.selector).wallet();
    selectedWallet.signOut();
  };

  /**
   * Makes a read-only call to a contract
   * @param {Object} options - the options for the call
   * @param {string} options.contractId - the contract's account id
   * @param {string} options.method - the method to call
   * @param {Object} options.args - the arguments to pass to the method
   * @returns {Promise<JSON.value>} - the result of the method call
   */
  viewMethod = async ({ contractId, method, args = {} }) => {
    const url = `https://rpc.${this.networkId}.near.org`;
    const provider = new providers.JsonRpcProvider({ url });



    let res = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic',
    });
    return JSON.parse(Buffer.from(res.result).toString());
  };


  /**
   * Makes a call to a contract
   * @param {Object} options - the options for the call
   * @param {string} options.contractId - the contract's account id
   * @param {string} options.method - the method to call
   * @param {Object} options.args - the arguments to pass to the method
   * @param {string} options.gas - the amount of gas to use
   * @param {string} options.deposit - the amount of yoctoNEAR to deposit
   * @returns {Promise<Transaction>} - the resulting transaction
   */
  callMethod = async ({ contractId, method, args = {}, gas = THIRTY_TGAS, deposit = NO_DEPOSIT }) => {
    // Sign a transaction with the "FunctionCall" action
    const selectedWallet = await (await this.selector).wallet();
    const outcome = await selectedWallet.signAndSendTransaction({
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit,
          },
        },
      ],
    });

    return providers.getTransactionLastResult(outcome);
  };

  /**
   * Retrieves transaction result from the network
   * @param {string} txhash - the transaction hash
   * @returns {Promise<JSON.value>} - the result of the transaction
   */
  getTransactionResult = async (txhash) => {
    const walletSelector = await this.selector;
    const { network } = walletSelector.options;
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

    const transaction = await provider.txStatus(txhash, 'unnused');
    return providers.getTransactionLastResult(transaction);
  };
}

// "use client";

// import { setupWalletSelector } from "@near-wallet-selector/core";
// import { setupModal } from "@near-wallet-selector/modal-ui";
// import { setupBitgetWallet } from "@near-wallet-selector/bitget-wallet";
// import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
// import { setupSender } from "@near-wallet-selector/sender";
// import { setupHereWallet } from "@near-wallet-selector/here-wallet";
// import { setupNearSnap } from "@near-wallet-selector/near-snap";
// import { setupMathWallet } from "@near-wallet-selector/math-wallet";
// import { setupNightly } from "@near-wallet-selector/nightly";
// import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
// import { setupOkxWallet } from "@near-wallet-selector/okx-wallet";
// import { setupNarwallets } from "@near-wallet-selector/narwallets";
// import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
// import { setupLedger } from "@near-wallet-selector/ledger";
// import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
// import { setupNearFi } from "@near-wallet-selector/nearfi";
// import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
// import { setupNeth } from "@near-wallet-selector/neth";
// import { setupXDEFI } from "@near-wallet-selector/xdefi";
// import { setupRamperWallet } from "@near-wallet-selector/ramper-wallet";
// import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet";
// import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet";
// import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";
// import { setupEthereumWallets } from "@near-wallet-selector/ethereum-wallets";

// export const Wallet = () => {
//   const [selector, setSelector] = useState(null);

//   useEffect(() => {
//     const handleSetup = async () => {
//       const selector = setupWalletSelector({
//         network: "testnet",
//         modules: [
//           setupBitgetWallet(),
//           setupMyNearWallet(),
//           setupSender(),
//           setupHereWallet(),
//           setupMathWallet(),
//           setupNightly(),
//           setupMeteorWallet(),
//           setupNearSnap(),
//           setupOkxWallet(),
//           setupNarwallets(),
//           setupWelldoneWallet(),
//           setupLedger(),
//           setupNearFi(),
//           setupCoin98Wallet(),
//           setupNeth(),
//           setupXDEFI(),
//           setupWalletConnect({
//             projectId: "c4f79cc...",
//             metadata: {
//               name: "NEAR Wallet Selector",
//               description: "Example dApp used by NEAR Wallet Selector",
//               url: "https://github.com/near/wallet-selector",
//               icons: ["https://avatars.githubusercontent.com/u/37784886"],
//             },
//           }),
//           setupNearMobileWallet(),
//           setupMintbaseWallet({
//             networkId: "mainnet",
//             walletUrl: "https://wallet.mintbase.xyz",
//             callbackUrl: "https://www.mywebsite.com",
//             deprecated: false,
//           }),
//           setupBitteWallet({
//             networkId: "mainnet",
//             walletUrl: "https://wallet.bitte.ai",
//             callbackUrl: "https://www.mywebsite.com",
//             deprecated: false,
//           }),
//           setupEthereumWallets({ wagmiConfig, web3Modal }),
//         ],
//       });
//       setSelector(selector);

//     }

//     handleSetup();
//   }, [])



//   const modal = setupModal(selector, {
//     contractId: "guest-book.testnet"
//   });

//   /**
//    * Displays a modal to login the user
//    */
//   signIn = async () => {

//     // const modal = setupModal(await this.selector, { contractId: this.createAccessKeyFor });
//     modal.show();
//   };

//   /**
//    * Logout the user
//    */
//   signOut = async () => {
//     const selectedWallet = await selector.wallet();
//     selectedWallet.signOut();
//   };
// }
