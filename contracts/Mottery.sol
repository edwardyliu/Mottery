//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Mottery is AccessControl, Ownable {
  using SafeMath for uint;  // attaches SafeMath functions to uint types

  // CONSTANT(s):
  uint public constant PRECISION = 10000;  // parts per token
  uint public constant FEES_RATE = 500;    // 5% of each token is charged as fees, value based on PRECISION (i.e. 0.05*10000)
  uint public constant WITHDRAWAL_COOLDOWN = 300;   // withdrawal cooldown in second(s)
  uint public constant MAX_NUMBER_OF_MANAGERS = 3;  // owner plus two managers

  // ROLE(s):
  bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

  // TOKEN:
  ERC20 private token;
  address public tokenAddress;
  uint public decimals;
  
  // STRUCT(s):
  struct Ticket {
    uint id;               // the unique id: index in tickets
    address playerAddress; // the address of the player who owns this ticket
  }
  
  // STORAGE & LOGICAL VARIABLE(s):
  Ticket[] public tickets;
  uint public winningId;
  uint public prevPrizePool = 0;

  uint public feesPool = 0;   // in units of token
  uint public prizePool = 0;  // in units of token
  uint public pricePerTicket = 200000;  // 20 tokens per ticket, value based on PRECISION (i.e. 20*10000)

  // ACCESS & CONTROL VARIABLE(s):
  bool public available = true; // a lock mechanism controlled by the owner
  uint public prevWithdrawalTime;

  constructor(address _tokenAddress) public {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(MANAGER_ROLE, msg.sender);

    tokenAddress = _tokenAddress;
    token = ERC20(tokenAddress);
    decimals = uint(10)**token.decimals();

    prevWithdrawalTime = now;
  }

  // PRIVATE HELPER FUNCTION(s):
  /**
    @notice A pseudo-random number generator modulo by length of array variable tickets
    @return A pseudo-random index for use by array variable tickets
   */
  function pseudoRandomIndex() private view returns (uint256) {
    return uint256(
      keccak256(
        abi.encode(block.difficulty, prevWithdrawalTime, now, tickets)
      )
    ) % tickets.length;
  }

  // NON-RESTRICTED FUNCTION(s):
  /**
    @notice Get all purchased tickets
    @return An array of struct Ticket
   */
  function getTickets() external view returns (Ticket[] memory) {
    return tickets;
  }

  /**
    @notice Buy tickets from this lottery
    @param _amount The number of tickets to purchase
   */
  function buy(uint _amount) external {
    // 1. Check if lottery is available
    require(available == true, "Mottery instance is not available, potentially under maintenance");
    
    // 2. Check if ERC-20 token is defined
    require(tokenAddress != address(0), "ERC-20 token undefined");

    // 3. Check if player's balance in ERC-20 token is sufficient
    uint requiredFunds = _amount.mul(pricePerTicket).mul(decimals).div(PRECISION);
    require(token.balanceOf(msg.sender) >= requiredFunds, "Caller has insufficient funding");

    // 4. Transfer required ERC-20 tokens from player to contract
    require(token.transferFrom(msg.sender, address(this), requiredFunds), "Fund transfer failed");

    // 5. Calculate fees & prize, 
    // 6. Add fees to feesPool & prize to prizePool
    uint fees = requiredFunds.mul(FEES_RATE).div(PRECISION);
    feesPool += fees;
    prizePool += requiredFunds.sub(fees);
    
    // 7. Create purchased tickets for player
    for (uint i=0; i < _amount; i++) {
      Ticket memory newTicket;
      newTicket.id = tickets.length;
      newTicket.playerAddress = msg.sender;

      tickets.push(newTicket);
    }
  }

  // RESTRICTED FUNCTION(s): MANAGER_ROLE
  modifier isManager() {
    require(hasRole(MANAGER_ROLE, msg.sender), "Caller is not a manager");
    _;
  }

  /**
    @notice Toggles on & off the availability variable: available
   */
  function toggleAvailability() external isManager {
    available = !available;
  }

  /**
    @notice Selects one random winner, hands out the prize pool
            & withdraws the collected fees to the eligible caller
   */
  function withdraw() external isManager {
    // 1. Check if withdraw is on cooldown
    require(now.sub(prevWithdrawalTime) >=  WITHDRAWAL_COOLDOWN, "Function 'withdraw' is on cooldown");
    
    // 2. Check if token is defined
    require(tokenAddress != address(0), "ERC-20 token undefined");

    // 3. Check if contract's balance in ERC-20 token is sufficient
    uint requiredFunds = feesPool.add(prizePool);
    require(token.balanceOf(address(this)) >= requiredFunds, "Contract has insufficient funding");

    // 4. Select a random winner and 
    winningId = pseudoRandomIndex();

    // 5. Transfer feesPool to caller and zero it out
    require(token.transfer(msg.sender, feesPool), "Fund transfer, feesPool, failed");
    feesPool = 0;

    // 6. Transfer prizePool to winner, update prevPrizePool, and zero out prizePool
    require(token.transfer(tickets[winningId].playerAddress, prizePool), "Fund transfer, prizePool, failed");
    prevPrizePool = prizePool;
    prizePool = 0;

    // 7. Clear tickets
    delete tickets;

    // 8. Reset clock variable prevWithdrawalTime
    prevWithdrawalTime = now;
  }
  
  // RESTRICTED FUNCTION(s): ONLY-OWNER
  /**
    @notice Add a manager to this lottery
    @param _manager The address of the manager
   */
  function hireManager(address _manager) external onlyOwner {
    // 1. Check if the current number of managers exceed MAX_NUMBER_OF_MANAGERS
    require(getRoleMemberCount(MANAGER_ROLE) < MAX_NUMBER_OF_MANAGERS, "Exceeds max number of managers allowed");

    grantRole(MANAGER_ROLE, _manager);
  }

  /**
    @notice Remove a manager from this lottery
    @param _manager The address of the manager
   */
  function fireManager(address _manager) external onlyOwner {
    // 1. Check if is manager
    require(hasRole(MANAGER_ROLE, _manager), "Address is not a manager");

    revokeRole(MANAGER_ROLE, _manager);
  }

  /**
    @notice Sets the price of a ticket for this lottery; the value is based on PRECISION
    @param _pricePerTicket A value based on PRECISION, where 1 token = 1*PRECISION; 
                              default = 200,000 which equals 20 tokens
   */
  function setPricePerTicket(uint _pricePerTicket) external onlyOwner {
    pricePerTicket = _pricePerTicket;
  }
}
