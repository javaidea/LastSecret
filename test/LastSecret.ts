import { LastSecret } from './../typechain-types/contracts/LastSecret';
import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { Wallet } from 'ethers';
import { expect } from 'chai';
import { config, ethers } from 'hardhat';
import { signUser, signUserV2 } from './utils';

describe('LastSecret', function () {
  async function deployLastSecret() {
    const [owner, sam] = await ethers.getSigners();

    // console.log('Provider : ', owner.provider);

    const LastSecret = await ethers.getContractFactory('LastSecret');
    const contract = await LastSecret.deploy();
    await contract.deployed();
    await contract.initialize();

    return { contract, owner, sam };
  }

  describe('Deployment', function () {
    it('Should deploy the contract correctly', async () => {
      const { contract, owner, sam } = await loadFixture(deployLastSecret);
      let secret = await contract.connect(owner).getSecret();
      expect(secret).to.equal(0);

      await expect(contract.connect(sam).getSecret()).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  describe('Set secret', function () {
    it('Should set secret', async () => {
      const { contract, owner } = await loadFixture(deployLastSecret);

      await contract.connect(owner).setSecret(1);

      let secret = await contract.connect(owner).getSecret();
      expect(secret).to.equal(1);
    });
  });

  describe('Should revert when set secret', function () {
    it('Should set secret', async () => {
      const { contract, sam } = await loadFixture(deployLastSecret);

      await expect(contract.connect(sam).setSecret(2)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      );
    });
  });

  describe('Should set secret by user', function () {
    it('Should set secret by user', async () => {
      const { contract, owner, sam } = await loadFixture(deployLastSecret);

      await contract.connect(owner).setUserEnabled(sam.address, 1);

      const enabled = await contract.users(sam.address);

      expect(enabled).to.gt(0);

      const now = Math.floor(new Date().getTime() / 1000);
      const oneHourLater = now + 60 * 60;

      const accounts: any = config.networks.hardhat.accounts;
      const wallet = Wallet.fromMnemonic(
        accounts.mnemonic,
        accounts.path + `/${0}`
      );

      const { signature, salt } = await signUser(
        31337,
        contract.address,
        sam.address,
        oneHourLater,
        wallet
      );

      // const { signature, salt } = await signUserV2(
      //   31337,
      //   contract.address,
      //   sam.address,
      //   oneHourLater,
      //   wallet
      // );

      // await time.increaseTo(oneHourLater + 2 * 60 * 60);

      await contract
        .connect(sam)
        .setSecretWithSignature(2, oneHourLater, salt, signature);

      let secret = await contract.connect(owner).getSecret();
      expect(secret).to.equal(2);
    });
  });
});
