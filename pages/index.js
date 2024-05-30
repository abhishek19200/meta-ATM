import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);

  const [initialDeposit, setInitialDeposit] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [period, setPeriod] = useState(0);
  const [apy, setApy] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [totalSavings, setTotalSavings] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  }

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(balance.toNumber());
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  }

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit(1);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  }

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(1);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  }

  const calculateSavings = () => {
    const monthlyRate = apy / 100 / 12;
    let totalContribution = initialDeposit;
    let interestEarned = 0;
    for (let i = 0; i < period; i++) {
      interestEarned += (totalContribution + monthlyContribution) * monthlyRate;
      totalContribution += monthlyContribution;
    }
    const finalAmount = totalContribution + interestEarned;

    setChartData({
      labels: ['Initial Deposit', 'Total Contributions', 'Interest Earned'],
      datasets: [
        {
          label: 'Amount',
          data: [initialDeposit, totalContribution - initialDeposit, interestEarned],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)']
        }
      ]
    });

    setTotalSavings(finalAmount);
  }

  const showTotalSavings = () => {
    if (totalSavings !== null) {
      alert(`Total Savings: ${totalSavings.toFixed(2)}`);
    } else {
      alert("Please calculate the savings first.");
    }
  }

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this ATM.</p>
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your MetaMask wallet</button>
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <hr />
        <h2>Simple Savings Calculator</h2>
        <input
          type="number"
          placeholder="Initial Deposit"
          value={initialDeposit}
          onChange={(e) => setInitialDeposit(parseFloat(e.target.value))}
        />
        <input
          type="number"
          placeholder="Monthly Contribution"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
        />
        <input
          type="number"
          placeholder="Period (Months)"
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
        />
        <input
          type="number"
          placeholder="APY (%)"
          value={apy}
          onChange={(e) => setApy(parseFloat(e.target.value))}
        />
        <button onClick={calculateSavings}>Calculate</button>
        {chartData && <Bar data={chartData} />}
        <button
          style={{ backgroundColor: 'lightblue', padding: '10px', marginTop: '10px' }}
          onClick={showTotalSavings}
        >
          Show Total Savings
        </button>
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
        input {
          margin: 5px;
          padding: 10px;
          width: 200px;
        }
        button {
          margin: 5px;
          padding: 10px;
        }
      `}
      </style>
    </main>
  )
}
