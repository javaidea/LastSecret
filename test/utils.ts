import { Wallet } from 'ethers';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';

export const signUserV2 = (
  contractAddress: string,
  userAddress: string,
  expiresAt: number,
  signer: Wallet
) => {
  const types = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'owner', type: 'string' },
    ],
    User: [
      { name: 'user', type: 'address' },
      { name: 'expiresAt', type: 'uint256' },
    ],
  };

  const domain = {
    name: 'LastSecret',
    version: '2',
    verifyingContract: contractAddress,
    owner: 'javaidea',
  };

  const data = {
    user: userAddress,
    expiresAt: expiresAt,
  };

  const privateKey = Buffer.from(
    signer.privateKey.startsWith('0x')
      ? signer.privateKey.substring(2)
      : signer.privateKey,
    'hex'
  );

  return signTypedData({
    privateKey,
    data: {
      types: types,
      primaryType: 'User',
      domain: domain,
      message: data,
    },
    version: SignTypedDataVersion.V4,
  });
};
