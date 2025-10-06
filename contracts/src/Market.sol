// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Market {
	event Buy(address indexed trader, bool yes, uint256 amountIn, uint256 sharesOut);
	event Sell(address indexed trader, bool yes, uint256 sharesIn, uint256 amountOut);
	event Resolve(bool yesWins);

	address public immutable collateralToken; // address(0) = native ETH
	address public immutable creator;

	string public question;
	uint256 public endTime;

	uint256 public reserveYes;
	uint256 public reserveNo;

	bool public resolved;
	bool public yesWins;

	mapping(address => uint256) public balanceYes;
	mapping(address => uint256) public balanceNo;

	modifier onlyCreator() {
		require(msg.sender == creator, "not creator");
		_;
	}

	modifier beforeEnd() {
		require(block.timestamp < endTime, "ended");
		_;
	}

	modifier afterEnd() {
		require(block.timestamp >= endTime, "not ended");
		_;
	}

	constructor(
		address _creator,
		address _collateralToken,
		string memory _question,
		uint256 _endTime,
		uint256 _initialLiquidity
	) payable {
		creator = _creator;
		collateralToken = _collateralToken;
		question = _question;
		endTime = _endTime;
		require(_initialLiquidity > 0, "liq=0");
		require(_collateralToken == address(0), "only ETH");
		require(msg.value == _initialLiquidity, "need ETH liq");
		reserveYes = _initialLiquidity / 2;
		reserveNo = _initialLiquidity - reserveYes;
	}

	function priceYes() public view returns (uint256) {
		uint256 denom = reserveYes + reserveNo;
		if (denom == 0) return 0;
		return (reserveNo * 1e18) / denom;
	}

	function priceNo() public view returns (uint256) {
		uint256 denom = reserveYes + reserveNo;
		if (denom == 0) return 0;
		return (reserveYes * 1e18) / denom;
	}

	function buyYes() external payable beforeEnd returns (uint256 sharesOut) {
		require(msg.value > 0, "amount=0");
		uint256 k = reserveYes * reserveNo;
		uint256 newYes = reserveYes + msg.value;
		uint256 newNo = k / newYes;
		sharesOut = reserveNo - newNo;
		reserveYes = newYes;
		reserveNo = newNo;
		balanceYes[msg.sender] += sharesOut;
		emit Buy(msg.sender, true, msg.value, sharesOut);
	}

	function buyNo() external payable beforeEnd returns (uint256 sharesOut) {
		require(msg.value > 0, "amount=0");
		uint256 k = reserveYes * reserveNo;
		uint256 newNo = reserveNo + msg.value;
		uint256 newYes = k / newNo;
		sharesOut = reserveYes - newYes;
		reserveYes = newYes;
		reserveNo = newNo;
		balanceNo[msg.sender] += sharesOut;
		emit Buy(msg.sender, false, msg.value, sharesOut);
	}

	function sellYes(uint256 sharesIn) external beforeEnd returns (uint256 amountOut) {
		require(sharesIn > 0 && balanceYes[msg.sender] >= sharesIn, "bad shares");
		uint256 k = reserveYes * reserveNo;
		uint256 newNo = reserveNo + sharesIn;
		uint256 newYes = k / newNo;
		amountOut = reserveYes - newYes;
		reserveYes = newYes;
		reserveNo = newNo;
		balanceYes[msg.sender] -= sharesIn;
		(bool ok, ) = msg.sender.call{value: amountOut}("");
		require(ok, "eth send");
		emit Sell(msg.sender, true, sharesIn, amountOut);
	}

	function sellNo(uint256 sharesIn) external beforeEnd returns (uint256 amountOut) {
		require(sharesIn > 0 && balanceNo[msg.sender] >= sharesIn, "bad shares");
		uint256 k = reserveYes * reserveNo;
		uint256 newYes = reserveYes + sharesIn;
		uint256 newNo = k / newYes;
		amountOut = reserveNo - newNo;
		reserveYes = newYes;
		reserveNo = newNo;
		balanceNo[msg.sender] -= sharesIn;
		(bool ok, ) = msg.sender.call{value: amountOut}("");
		require(ok, "eth send");
		emit Sell(msg.sender, false, sharesIn, amountOut);
	}

	function resolve(bool _yesWins) external onlyCreator afterEnd {
		require(!resolved, "resolved");
		yesWins = _yesWins;
		resolved = true;
		emit Resolve(_yesWins);
	}

	function redeem() external returns (uint256 amount) {
		require(resolved, "not resolved");
		uint256 payout;
		if (yesWins) {
			payout = balanceYes[msg.sender];
			balanceYes[msg.sender] = 0;
		} else {
			payout = balanceNo[msg.sender];
			balanceNo[msg.sender] = 0;
		}
		require(payout > 0, "nothing");
		(bool ok, ) = msg.sender.call{value: payout}("");
		require(ok, "eth send");
		return payout;
	}
}

