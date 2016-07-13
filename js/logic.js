const ai = (function () {

	let board = Array(9).fill(null);
	// +--------------> X
	// |	* | * | *
	// |	---------
	// |	* | * | *
	// |	---------
	// |	* | * | *
	// |
	// \/
	// Y
	// where * === null
	//
	// so that board[x * y] corresponds nicely
	// board[0 * 2] would be first column last element
	// 	* | * | *
	// 	---------
	// 	* | * | *
	// 	---------
	// 	X | * | *


// X goes first
	const first = "X", second = "O";
	let AI = first, PC = second, predictedWinner, winner;

	function setAIPlayer(mark) {
		if(mark === first) {
			AI = first;
			PC = second;
		}	else if(mark === second) {
			AI = second;
			PC = first;
		}	else throw new Error("no such mark: " + mark);
	}

	function getMarks() {
		return {AI, PC};
	}

	function aiMove() {
		const aimove = minimax(4, AI).index;
		if(aimove != null) board[aimove] = AI;
		return {aimove, predictedWinner, winner: isGameOver()};
	}

	function playerMove(x, y=1) {
		if(x * y > 8) throw new RangeError("No such cell number on board: " + x*y);
		board[x * y] = PC;
		console.log("adding", PC, "to", x*y);
		return aiMove();
	}

	function getBoard() {
		return board;
	}

	function resetBoard() {
		board = Array(9).fill(null);
	}

	function resetGame(AIMark) {
		setAIPlayer(AIMark);
		resetBoard();
		if(AIMark === first) return aiMove();
	}

	function getMarkAt(x, y) {
		return board[x * y];
	}

	function getValidMoves() {
		const emptyCellsIndexes = [];
		if(predictedWinner = isGameOver()) return emptyCellsIndexes;
		board.forEach((v, ind) => {
			if(v === null) emptyCellsIndexes.push(ind);
		});
		return emptyCellsIndexes;
	}

	function boardIsFilled() {
		return !board.includes(null);
	}

	// returns winner if any
	function isGameOver() {

		for(let i=0; i<3; ++i) {
			// checking columns
			if(board[i*3] && board[i*3] === board[i*3+1] && board[i*3] === board[i*3+2]) {
				return board[i*3];
			}

			// checking rows
			if(board[i] && board[i] === board[i+3] && board[i] === board[i+6]) {
				return board[i];
			}

			// checking diagonals
			if((i===0) && board[i] && board[i] === board[i+4] && board[i] === board[i+8]) {
				return board[i];
			}
			if((i===2) && board[i] && board[i] === board[i+2] && board[i] === board[i+4]) {
				return board[i];
			}
		}

		// check if board is filled
		if (boardIsFilled()) {
			return "tie";
		}

		// no winner yet
		return null;
	}

	function minimax(depth, player) {
		const emptyCells = getValidMoves();

		let bestScore = (player === first) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY, currentScore,	bestInd;

		if (emptyCells.length === 0 || depth === 0) {
			bestScore = calculateScore();
		} else {
			for (let i = 0; i < emptyCells.length; ++i) {
				const currentInd = emptyCells[i];
				board[currentInd] = player;

				// first is a maximizing agent
				if (player === first) {
					currentScore = minimax(depth-1, second).score;
					if (currentScore > bestScore) {
						bestScore = currentScore;
						bestInd = currentInd;
					}
				} else if (player === second) {
					// second is a minimizing agent
					currentScore = minimax(depth-1, first).score;
					if (currentScore < bestScore) {
						bestScore = currentScore;
						bestInd = currentInd;
					}
				} else throw new Error("Something went wrong; player is neither X nor O, it's " + player);
				board[currentInd] = null;
			}
		}

		return {score: bestScore, index: bestInd};
	}

	function calculateScore() {
		let score = 0;

		for(let i=0; i<3; ++i) {
			// checking columns

			let firstCount = 0, secondCount = 0, emptyCount = 0;
			if(board[i*3] === first) ++firstCount;
			else if(board[i*3] === second) ++secondCount;
			else ++emptyCount;

			if(board[i*3+1] === first) ++firstCount;
			else if(board[i*3+1] === second) ++secondCount;
			else ++emptyCount;

			if(board[i*3+2] === first) ++firstCount;
			else if(board[i*3+2] === second) ++secondCount;
			else ++emptyCount;

			score += calculateScoreForLine(firstCount, secondCount, emptyCount);


			// checking rows
			firstCount = secondCount = emptyCount = 0;
			if(board[i] === first) ++firstCount;
			else if(board[i] === second) ++secondCount;
			else ++emptyCount;

			if(board[i+3] === first) ++firstCount;
			else if(board[i+3] === second) ++secondCount;
			else ++emptyCount;

			if(board[i+6] === first) ++firstCount;
			else if(board[i+6] === second) ++secondCount;
			else ++emptyCount;

			score += calculateScoreForLine(firstCount, secondCount, emptyCount);


			// checking diagonals
			firstCount = secondCount = emptyCount = 0;
			if(i===0) {
				if(board[i] === first) ++firstCount;
				else if(board[i] === second) ++secondCount;
				else ++emptyCount;

				if(board[i+4] === first) ++firstCount;
				else if(board[i+4] === second) ++secondCount;
				else ++emptyCount;

				if(board[i+8] === first) ++firstCount;
				else if(board[i+8] === second) ++secondCount;
				else ++emptyCount;
				score += calculateScoreForLine(firstCount, secondCount, emptyCount);
			} else if(i===2) {
				if(board[i] === first) ++firstCount;
				else if(board[i] === second) ++secondCount;
				else ++emptyCount;

				if(board[i+2] === first) ++firstCount;
				else if(board[i+2] === second) ++secondCount;
				else ++emptyCount;

				if(board[i+4] === first) ++firstCount;
				else if(board[i+4] === second) ++secondCount;
				else ++emptyCount;
				score += calculateScoreForLine(firstCount, secondCount, emptyCount);
			}
		}
		return score;
	}

	function calculateScoreForLine(firstCount, secondCount, emptyCount) {
		if(firstCount === 3) return 100;													// XXX case
		else if(secondCount === 3) return -100;										// OOO case
		else if(firstCount === 2 && emptyCount === 1) return 10;	// XX* case
		else if(secondCount === 2 && emptyCount === 1) return -10;	// OO* case
		else if(firstCount === 1 && emptyCount === 2) return 1;		// X** case
		else if(secondCount === 1 && emptyCount === 2) return -1;	// O** case
		return 0;																									// XOX case
	}

	return {setAIPlayer, getMarks, aiMove, playerMove, resetGame, getMarkAt, isGameOver, getValidMoves, getBoard};

})();
