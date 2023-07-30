import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
import { contractAbi, contractAddress } from './contract';
import { ethers } from 'ethers';
import styles from './styles/App.module.scss';
import getShortenedString from './utils/getShortenedString';
import { Transaction } from './types';

function App() {
  const { ethereum } = window;
  const [formData, setFormData] = useState({
    addressTo: '',
    amount: '',
    message: '',
  });
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    type: 'success',
    message: '',
  });
  const [transactions, setTransactions] = useState<any[]>([]);

  const createEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );

    return transactionsContract;
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum)
        return setAlert({
          type: 'danger',
          message: 'Please install MetaMask.',
        });

      const transactionsContract = createEthereumContract();

      const availableTransactions =
        (await transactionsContract.getAllTransactions()) as Transaction[];

      const formattedTransactions = availableTransactions
        .filter(({ addressTo, addressFrom }) => {
          return (
            currentAccount === addressTo.toLowerCase() ||
            currentAccount === addressFrom.toLowerCase()
          );
        })
        .map(({ addressTo, addressFrom, timestamp, message, amount }) => ({
          addressTo,
          addressFrom,
          timestamp: new Date(timestamp.toNumber() * 1000).toLocaleString(),
          message,
          amount: parseInt(amount._hex) / 10 ** 18,
        }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  const setWalletAccount = async () => {
    try {
      if (!ethereum)
        return setAlert({
          type: 'danger',
          message: 'Please install MetaMask.',
        });

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts.length)
        return setAlert({
          type: 'danger',
          message: 'No Account Found..',
        });

      setCurrentAccount(accounts[0]);
      console.log('Account is connected');
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum)
        return setAlert({
          type: 'danger',
          message: 'Please install MetaMask.',
        });

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      setCurrentAccount(accounts[0]);
    } catch (error: any) {
      console.log(error);
      return setAlert({ type: 'danger', message: error.message });
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum)
        return setAlert({
          type: 'danger',
          message: 'Please install MetaMask.',
        });

      const { addressTo, amount, message } = formData;
      const transactionsContract = createEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: '0x5208',
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionsContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message
      );

      setIsLoading(true);
      await transactionHash.wait();
      setIsLoading(false);

      const transactionsCount =
        await transactionsContract.getTransactionCount();
      console.log('transactions count', transactionsCount);

      setAlert({
        type: 'success',
        message: 'Crypto successfully transferred!',
      });

      getAllTransactions();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setWalletAccount();
    window.ethereum.on('accountsChanged', () => {
      setWalletAccount();
      setAlert({
        type: 'success',
        message: 'Wallets Have Been Switched..!',
      });
    });
  }, []);

  useEffect(() => {
    getAllTransactions();
  }, [currentAccount]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { addressTo, amount } = formData;
    if (!addressTo || !amount) {
      setAlert({
        type: 'danger',
        message: 'Please Enter Both Recipients Address & Amount to Send.',
      });
      setIsLoading(false);
      return;
    }
    if (!confirm('Are you sure to proceed?')) return;
    sendTransaction();
    setIsLoading(false);
  };

  return (
    <>
      <main className={`${styles.main} mw-500 mx-auto`}>
        {alert.message && (
          <div
            className={`alert alert-${alert.type} position-fixed w-80 mw-500 fs-6 start-50 translate-middle-x font-size-sm`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="close"
              aria-label="Close"
              onClick={() => {
                setAlert((prev) => ({ ...prev, message: '' }));
              }}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}
        <div>
          <div
            className={`text-white vh-75 text-center ${styles.hero} position-relative z-index-n1`}
          >
            <h1 className="lh-lg font-size-lg-3 position-absolute top-50 translate-middle-y">
              Transfer Crypto Anywhere, Anytime.
            </h1>
          </div>
          <div className="text-center">
            <p className="text-white-50 mt-2">
              {!currentAccount ? (
                <>
                  <p>'Your wallet is not connected..'</p>
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="btn btn-warning"
                  >
                    Connect Wallet Now
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-1">Your wallet is connected!</p>
                  <p className="text-white">
                    <span className="text-white-50">Wallet Address: </span>
                    {getShortenedString(currentAccount)}
                  </p>
                </>
              )}
            </p>
            <form
              className="bg-secondary text-center text-white py-5 px-3 mt-2"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="exampleInputEmail1">
                  Recipient's Wallet Address
                </label>
                <input
                  className="form-control"
                  placeholder="Ex.) 0xAbCdEf01234...6789AbCdEf01"
                  name="addressTo"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group mt-4">
                <label htmlFor="exampleInputEmail1">Amount to Send (ETH)</label>
                <input
                  type="number"
                  step={0.0001}
                  className="form-control"
                  placeholder="Ex.) 0.01"
                  name="amount"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group mt-4">
                <label htmlFor="exampleInputEmail1">Message (Optional)</label>
                <textarea
                  className="form-control"
                  placeholder="Enter Message.."
                  name="message"
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" className="btn btn-warning mt-4 w-100">
                {isLoading ? (
                  <div className="spinner-border text-white" role="status" />
                ) : (
                  'Send Now'
                )}
              </button>
            </form>
          </div>
          <div className="text-white my-4">
            <h2 className="text-center">Past Transactions</h2>
            {transactions.length ? (
              <ul className="list-group w-90 mx-auto">
                {transactions.map((transaction) => (
                  <li className="list-group-item mt-3">
                    <p className="m-0 font-size-sm">
                      <span className="text-black-50">Sent from: </span>
                      {getShortenedString(transaction.addressFrom)}
                    </p>
                    <p className="m-0 font-size-sm">
                      <span className="text-black-50">Sent to: </span>
                      {getShortenedString(transaction.addressTo)}
                    </p>
                    <p className="m-0 font-size-sm">
                      <span className="text-black-50">Amount Sent: </span>
                      {transaction.amount} (ETH)
                    </p>
                    <p className="m-0 font-size-sm">
                      <span className="text-black-50">Message: </span>
                      &#8220;{transaction.message}&#8220;
                    </p>
                    <p className="m-0 font-size-sm">
                      <span className="text-black-50">Date: </span>
                      {transaction.timestamp}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center">You have not made any transaction..</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
