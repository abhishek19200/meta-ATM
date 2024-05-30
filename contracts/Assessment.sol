// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function calculateTotalSavings(
        uint256 initialDeposit,
        uint256 monthlyContribution,
        uint256 periodInMonths,
        uint256 annualPercentageYield
    ) public pure returns (uint256) {
        uint256 monthlyRate = annualPercentageYield / 100 / 12;
        uint256 totalContribution = initialDeposit;
        uint256 interestEarned = 0;

        for (uint256 i = 0; i < periodInMonths; i++) {
            interestEarned += (totalContribution + monthlyContribution) * monthlyRate;
            totalContribution += monthlyContribution;
        }

        uint256 finalAmount = totalContribution + interestEarned;
        return finalAmount;
    }

    function getSavingsData(
        uint256 initialDeposit,
        uint256 monthlyContribution,
        uint256 periodInMonths,
        uint256 annualPercentageYield
    ) public pure returns (
        uint256 totalContribution,
        uint256 interestEarned,
        uint256 finalAmount
    ) {
        uint256 monthlyRate = annualPercentageYield / 100 / 12;
        totalContribution = initialDeposit;
        interestEarned = 0;

        for (uint256 i = 0; i < periodInMonths; i++) {
            interestEarned += (totalContribution + monthlyContribution) * monthlyRate;
            totalContribution += monthlyContribution;
        }

        finalAmount = totalContribution + interestEarned;
        return (totalContribution, interestEarned, finalAmount);
    }
}
