import { ethers, Wallet } from 'ethers';
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util';

export const signUser = async (
  chainId: number,
  contractAddress: string,
  userAddress: string,
  expiresAt: number,
  signer: Wallet
) => {
  const salt = ethers.utils.randomBytes(32);

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

  const signature = await signer._signTypedData(domain, types, data);

  return { signature, salt };
};

export const signUserV2 = (
  chainId: number,
  contractAddress: string,
  userAddress: string,
  expiresAt: number,
  signer: Wallet
) => {
  const salt = ethers.utils.randomBytes(32);

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

  const signature = signTypedData({
    privateKey,
    data: {
      types: types,
      primaryType: 'User',
      domain: domain,
      message: data,
    },
    version: SignTypedDataVersion.V4,
  });

  return { signature, salt };
};
