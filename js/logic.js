const easymodeOn = document.getElementById("easymode");

function randomizedEasyMode() {
	if(!easymodeOn.checked) return false;
	// return true;
	return Math.random() > 0.5;
}



const ai = (function (easymode) {

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
	const first = "X", second = "O", startDepth = 4;
	let AI = first, PC = second;

	function setAIPlayer(mark) {
		if(mark === first) {
			AI = first;
			PC = second;
		}	else if(mark === second) {
			AI = second;
			PC = first;
		}	else throw new Error("no such mark: " + mark);
	}

	function setPCPlayer(mark) {
		setAIPlayer(mark === first ? second : mark === second ? first : mark);
	}

	function getMarks() {
		return {AI, PC};
	}

	function aiMove() {
		const aimove = minimax(startDepth, AI).index;
		if(aimove != null) board[aimove] = AI;
		// const gameOver = isGameOver();
		// const {winner, line} = isGameOver();
		// return {aimove, winner, line};
		return Object.assign({aimove}, isGameOver());
	}

	function playerMove(x, y=1) {
		if(x * y > 8) throw new RangeError("No such cell number on board: " + x*y);
		board[x * y] = PC;
		console.log("LOGIC: adding", PC, "to", x*y);
		return aiMove();
	}

	function getBoard() {
		return board;
	}

	function resetBoard() {
		board = Array(9).fill(null);
	}

	function resetGame(AIMark) {
		// setAIPlayer(AIMark);
		resetBoard();
		if(AI === first) return aiMove();
	}

	function getMarkAt(x, y) {
		return board[x * y];
	}

	function getValidMoves() {
		const emptyCellsIndexes = [];
		if( isGameOver()) return emptyCellsIndexes;
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
				return {winner: board[i*3], line: [i*3, i*3+1, i*3+2]};
			}

			// checking rows
			if(board[i] && board[i] === board[i+3] && board[i] === board[i+6]) {
				return {winner: board[i], line: [i, i+3, i+6]};
			}

			// checking diagonals
			if((i===0) && board[i] && board[i] === board[i+4] && board[i] === board[i+8]) {
				return {winner: board[i], line: [i, i+4, i+8]};
			}
			if((i===2) && board[i] && board[i] === board[i+2] && board[i] === board[i+4]) {
				return {winner: board[i], line: [i, i+2, i+4]};
			}
		}

		// check if board is filled
		if (boardIsFilled()) {
			return {winner: "tie"};
		}

		// no winner yet
		return null;
	}

	function minimax(depth, player) {
		const emptyCells = getValidMoves();

		let bestScore = (player === first) ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY, secondBestScore, currentScore, bestInd, secondBestInd;
		// const accum = [];

		if (emptyCells.length === 0 || depth === 0) {
			bestScore = calculateScore()*(depth+1);
		} else {
			for (let i = 0; i < emptyCells.length; ++i) {
				const currentInd = emptyCells[i];
				board[currentInd] = player;

				// first is a maximizing agent
				if (player === first) {
					currentScore = minimax(depth-1, second).score;
					if (currentScore > bestScore) {
						secondBestScore = bestScore;
						bestScore = currentScore;
						secondBestInd = bestInd;
						bestInd = currentInd;
						// accum.push({i: bestInd, s: bestScore, p: player});
					}
				} else if (player === second) {
					// second is a minimizing agent
					currentScore = minimax(depth-1, first).score;
					if (currentScore < bestScore) {
						secondBestScore = bestScore;
						bestScore = currentScore;
						secondBestInd = bestInd;
						bestInd = currentInd;
						// accum.push({i: bestInd, s: bestScore, p: player});
					}
				} else throw new Error("Something went wrong; player is neither X nor O, it's " + player);
				board[currentInd] = null;
			}
		}
		// const chosenB = board.slice();
		// chosenB[bestInd] = player;
		// console.log("CHOSEN board", chosenB, "score", bestScore);
		// console.log("accum", accum);
		// relax algorithm for outer minmax based on easymode
		// if(depth === startDepth) {
		// 	console.log("bestScore", bestScore, "bestInd", bestInd);
		// 	console.log("secondBestScore", secondBestScore, "secondBestInd", secondBestInd);
		// 	console.log("easymode", typeof easymode === "function" ? easymode() : easymode);
		// }
		if(secondBestScore != undefined && secondBestInd != undefined && (typeof easymode === "function" ? easymode() : easymode) && depth === startDepth) {
			console.log("EASYMODE");
			return {score: secondBestScore, index: secondBestInd};
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
		// console.log("board", board, "score", score);
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

	return {setAIPlayer, setPCPlayer, getMarks, aiMove, playerMove, resetGame, getMarkAt, isGameOver, getValidMoves, getBoard};

})(randomizedEasyMode);
