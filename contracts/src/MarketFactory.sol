// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Market} from "./Market.sol";

contract MarketFactory {
	event MarketCreated(address indexed creator, address market, string question, uint256 endTime);

	address[] public allMarkets;

	function createMarket(
		string memory question,
		uint256 endTime
	) external payable returns (address market) {
		require(endTime > block.timestamp + 5 minutes, "end soon");
		require(msg.value > 0, "liq=0");
		Market m = new Market{value: msg.value}(msg.sender, address(0), question, endTime, msg.value);
		market = address(m);
		allMarkets.push(market);
		emit MarketCreated(msg.sender, market, question, endTime);
	}

	function marketsCount() external view returns (uint256) {
		return allMarkets.length;
	}
}

