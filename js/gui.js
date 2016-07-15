let board = document.querySelector('.board');
const notification = document.querySelector('.notification');
const notificationText = notification.querySelector(".txt");
const svgNS = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";

let i=0;

board.onclick = onClick;

let markQueue = [], currentGameWinner;
function onClick(e) {
	console.log(e.target, e.bubbles);
	const target = e.target;
	if(target.classList.contains("cell") && !target.hasChildNodes() && !currentGameWinner && !markQueue.find(({cell}) => cell === target)) {
		if (markQueue.length === 0)	{
			addMark(target, playerMark);
			console.log("added mark", playerMark, "to cell", target);
		}
		else {
			// const {cell, mark} = markQueue.shift();
			markQueue.push({cell: target, mark: playerMark});
			// addMark(cell, mark);
			console.log("pushed mark", playerMark, "to queue wit cell ===", target);
		}

		const {aimove, winner} = ai.playerMove(cells.indexOf(target));
		// const {aimove, winner} = ai.aiMove();
		console.log("adding ai mark to", aimove, cells[aimove], "winner:", winner);
		if(aimove != null) markQueue.push({cell: cells[aimove], mark: aiMark});
		currentGameWinner = winner;
		// if(!winner)addMark(cells[aimove], aiMark);
		// else {
		// 	addMark(cells[aimove], aiMark);
		// 	declareWinner(winner);
		// }

		// const aimove = ai.aiMove();
	}
}

function addMark(cell, mark) {
	const svg = document.createElementNS(svgNS, "svg");
	const use = document.createElementNS(svgNS, "use");

	use.setAttributeNS(xlinkNS, "href", mark === "X" ? "#cross" : "#circ");

	svg.appendChild(use);
	cell.appendChild(svg);
}


board.addEventListener("animationend", onAnimationEnd);

function onAnimationEnd(e) {
	console.log("anim ended", e.animationName, e.target, cells.indexOf(e.target.parentNode));
	if(e.animationName === "draw") {
		console.log("Mark drawn");
		if(markQueue.length > 0) {
			const {cell, mark} = markQueue.shift();
			addMark(cell, mark);

		} else if(currentGameWinner) {
			console.log("HAVE WINNER", currentGameWinner);
			declareWinner(currentGameWinner);
		}

		// playersTurn = !playersTurn;
		// if(!playersTurn) {
		// 	const {aimove, winner} = ai.playerMove(cells.indexOf(e.target.parentNode));
		// 	// const {aimove, winner} = ai.aiMove();
		// 	console.log("adding ai mark to", aimove, "winner:", winner);
		// 	if(!winner)addMark(cells[aimove], aiMark);
		// 	else {
		// 		addMark(cells[aimove], aiMark);
		// 		declareWinner(winner);
		// 	}
		// }
	} else if(e.animationName === "fall" && e.target === cells[3] && notification.mode === "game over") {
		console.log("Board cleared");
		showNotification(false);
	} else if(e.animationName === "arrive" && e.target === cells[0]) {
		console.log("Board recreated");
		board.classList.remove("arrive");
	}
}

notification.addEventListener("animationend", function (e) {
	if(e.animationName === "inbound") {
		// fall();
		console.log("inbound finished for mode", notification.mode);
		if(notification.mode === "game over") {
			fall();
		} else if(notification.mode === "player selection") {
			resetGame();
		}
	} else if(e.animationName === "outbound") {
		if(notification.mode === "game over") {
			presentPlayerChoice();
		}
		// else if(notification.mode === "player selection") {
		// 	resetGame();
		// }
		// notification.mode = "hidden";
	}
});

// notification.querySelector("svg.X").onclick = () => setPlayerMark("X");
// notification.querySelector("svg.O").onclick = () => setPlayerMark("O");
notification.onclick = function (e) {
	console.log("clicked", e.target);
	if(notification.mode === "game over") {
		showNotification(false);
	} else {
		if(e.target.matches("svg.X")) setPlayerMark("X");
		else if(e.target.matches("svg.O")) setPlayerMark("O");
	}
};

function setPlayerMark(mark) {
	playerMark = mark;
	aiMark = mark === "X" ? "O" : "X";
	console.log("player:", mark, ", AI:", aiMark);
	ai.setPCPlayer(playerMark);
	showNotification(false);

	const aimove = ai.resetGame();
	if(aimove) addMark(cells[aimove.aimove], aiMark);
}

function declareWinner(winner) {
	notification.mode = "game over";
	notification.classList.add(winner);

	notificationText.textContent = winner === "tie" ? "It's a tie" : "won";
	showNotification();
}

function blockPointerEvents(block=true) {
	board.style.pointerEvents = block ? "none" : "";
}

function showNotification(show=true) {
	if(show) {
		blockPointerEvents();
		notification.classList.remove("outbound");
		notification.classList.add("inbound");
	}
	else {
		notification.classList.add("outbound");
		notification.classList.remove("inbound");
		blockPointerEvents(false);
	}
}


function generateBoard() {
	const clones = [];
	const fragment = document.createDocumentFragment();
	const cell = document.createElement("div");
	cell.className = "cell";

	fragment.appendChild(cell);
	clones.push(cell);

	let i = 8;
	while (i--) {
		const clone = cell.cloneNode(false);
		fragment.appendChild(clone);
		clones.push(clone);
	}

	return {clones, fragment};
 }

function presentPlayerChoice() {
	notification.mode = "player selection";
	notification.classList.remove("X", "O", "tie");
	// notification.classList.add("select-player");
	notificationText.textContent = "Choose player";
	showNotification();
}

let cells;
function emptyBoard() {
	const clone = board.cloneNode(false);
	clone.onclick = onClick;
	clone.addEventListener("animationend", onAnimationEnd);
	clone.className = "board arrive";
	let fragment;
	({clones: cells, fragment} = generateBoard());
	clone.appendChild(fragment);
	console.log("cloned board:", clone);

	board.parentNode.replaceChild(clone, board);
	board = clone;
}

function resetGame() {
	emptyBoard();
	markQueue = [];
	currentGameWinner = undefined;
	// const aimove = ai.resetGame();
	// if(aimove) addMark(cells[aimove.aimove], aiMark);
}

function fall() {
	// board.classList.remove("arrive");
	board.classList.add("fall");
}

let playersTurn;
let playerMark = "X", aiMark = "O";
document.addEventListener("DOMContentLoaded", function() {
	console.log("DOM fully loaded and parsed");
	cells = Array.from(document.getElementsByClassName("cell"));
	notification.mode = "player selection";
	// ai.setAIPlayer(aiMark);
	playersTurn =true;
  });
