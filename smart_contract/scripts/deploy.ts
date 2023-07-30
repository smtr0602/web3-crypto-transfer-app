const main = async () => {
  const transactionsFactory = await hre.ethers.getContractFactory(
    'Transactions'
  );
  const transactionsContract = await transactionsFactory.deploy();

  await transactionsContract.deployed();
  console.log('Transactions deployed to: ', transactionsContract.address);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
