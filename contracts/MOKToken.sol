//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MOKToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("Mock", "MOK") {
        _mint(msg.sender, initialSupply);
    }
}
