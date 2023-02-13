import { ethers, Wallet } from 'ethers';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';

export const signUser = async (
  chainId: number,
  contractAddress: string,
  userAddress: string,
  expiresAt: number,
  salt: Buffer,
  signer: Wallet
) => {
  const domain = {
    name: 'LastSecret',
    version: '1',
    chainId: chainId,
    verifyingContract: contractAddress,
    salt,
  };

  const types = {
    User: [
      { name: 'user', type: 'address' },
      { name: 'expiresAt', type: 'uint256' },
    ],
  };

  const data = {
    user: userAddress,
    expiresAt: expiresAt,
  };

  return await signer._signTypedData(domain, types, data);
};

export const signUserV2 = (
  chainId: number,
  contractAddress: string,
  userAddress: string,
  expiresAt: number,
  salt: Buffer,
  signer: Wallet
) => {
  const types = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ],
    User: [
      { name: 'user', type: 'address' },
      { name: 'expiresAt', type: 'uint256' },
    ],
  };

  const domain = {
    name: 'LastSecret',
    version: '1',
    chainId: chainId,
    verifyingContract: contractAddress,
    salt,
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
