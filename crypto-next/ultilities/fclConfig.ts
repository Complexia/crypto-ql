// fclConfig.ts
import * as fcl from "@onflow/fcl";

// Flow Testnet Configuration
// fcl.config({
//   "app.detail.title": "Flow Next.js TypeScript App (Testnet)", // Your app title
//   "app.detail.icon": "https://placekitten.com/g/200/200", // App icon (optional)
//   "accessNode.api": "https://rest-testnet.onflow.org", // Flow testnet access node
//   "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Wallet discovery for testnet
// });

fcl
  .config()
  .put('flow.network', 'testnet')
  .put('accessNode.api', 'https://rest-testnet.onflow.org')
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn')
  .put('walletconnect.projectId', '759fd0100ca6feff6d72c03a85e8f223')
  .put('app.detail.title', 'Test Harness')
  .put('app.detail.icon', 'https://i.imgur.com/r23Zhvu.png')
  .put('app.detail.description', 'A test harness for FCL')
  .put('app.detail.url', 'http://localhost:3000/cadence')
  .put('0xFlowToken', '0x7e60df042a9c0868');