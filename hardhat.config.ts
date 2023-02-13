import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

if (!process.env.PRIVATE_KEY)
  throw new Error('Invalid private key, please configure it in .env');

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

export default config;
