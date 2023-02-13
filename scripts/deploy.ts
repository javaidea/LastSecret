import { ethers } from 'hardhat';

async function main() {
  const LastSecret = await ethers.getContractFactory('LastSecret');
  const contract = await LastSecret.deploy();

  await contract.deployed();

  console.log(`LastSecret deployed to ${contract.address}`);

  const tx = await contract.initialize();
  console.log(`Initializing ${contract.address} with transaction: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
