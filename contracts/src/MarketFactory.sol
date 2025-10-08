// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Market} from "./Market.sol";

contract MarketFactory {
	event MarketCreated(address indexed creator, address market, string question, uint256 endTime);

	address[] public allMarkets;
    // Primary owner/fee recipient for all markets created via this factory
    // NOTE: change here if you ever want to update the global owner for newly deployed markets
    address public immutable OWNER = 0x713c16f062Bbd1f4B365B18CD98642c6c95C5B7b;

	function createMarket(
		string memory question,
		uint256 endTime
	) external payable returns (address market) {
		require(endTime > block.timestamp + 5 minutes, "end soon");
		require(msg.value > 0, "liq=0");
        // Set factory OWNER as the market creator so admin/fees route to the main address
        Market m = new Market{value: msg.value}(OWNER, address(0), question, endTime, msg.value);
		market = address(m);
		allMarkets.push(market);
        emit MarketCreated(msg.sender, market, question, endTime);
	}

	function marketsCount() external view returns (uint256) {
		return allMarkets.length;
	}
}

