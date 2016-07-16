let board = document.querySelector('.board');
const notification = document.querySelector('.notification');
const notificationText = notification.querySelector(".txt");
const svgNS = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";

board.onclick = onClick;

let markQueue = [], currentGameWinner, winningLine, playerMark, aiMark;
function onClick(e) {
	const target = e.target;
	if(target.classList.contains("cell") && !target.hasChildNodes() && !currentGameWinner && !markQueue.find(({cell}) => cell === target)) {
		if (markQueue.length === 0)	{
			addMark(target, playerMark);
			// console.log("added mark", playerMark, "to cell", target);
		}
		else {
			markQueue.push({cell: target, mark: playerMark});
			// console.log("pushed mark", playerMark, "to queue wit cell ===", target);
		}

		const {aimove, winner, line} = ai.playerMove(cells.indexOf(target));
		// console.log("pushing ai mark to", aimove, cells[aimove], "winner:", winner);
		if(aimove != null) markQueue.push({cell: cells[aimove], mark: aiMark});
		currentGameWinner = winner;
		winningLine = line;
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

function onAnimationEnd({target, animationName}) {
	// console.log("anim ended", animationName, target);
	if(animationName === "draw") {
		// console.log("Mark drawn on", target);
		if(markQueue.length > 0) {
			const {cell, mark} = markQueue.shift();
			addMark(cell, mark);

		} else if(currentGameWinner) {
			// console.log("HAVE WINNER", currentGameWinner);
			if(winningLine) highlightLine(winningLine);
			else declareWinner(currentGameWinner);
		}
	} else if(animationName === "fall" && target === cells[3] && notification.mode === "game over") {
		// console.log("Board cleared");
		showNotification(false);
	} else if(animationName === "arrive" && target === cells[0]) {
		// console.log("Board recreated");
		board.classList.remove("arrive");
	} else if(animationName === "flare") {
		// console.log("Highlight ended");
		declareWinner(currentGameWinner);
	}
}

notification.addEventListener("animationend", function ({animationName}) {
	if(animationName === "inbound") {
		if(notification.mode === "game over") {
			fall();
		} else if(notification.mode === "player selection") {
			resetGame();
		}
	} else if(animationName === "outbound" && notification.mode === "game over") {
		presentPlayerChoice();
	}
});

notification.onclick = function (e) {
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
	// console.log("player:", mark, ", AI:", aiMark);
	ai.setPCPlayer(playerMark);
	showNotification(false);

	const aimove = ai.resetGame();
	if(aimove) addMark(cells[aimove.aimove], aiMark);
}

function declareWinner(winner) {
	notification.mode = "game over";
	notification.classList.add(winner);

	notificationText.textContent = winner === "tie" ? "It's a tie" : "player won";
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
		notification.classList.remove("inbound", "selection");
		blockPointerEvents(false);
	}
}

function highlightLine(line) {
	for(let ind of line) {
		cells[ind].classList.add("highlighted");
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
	notification.classList.add("selection");
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

	board.parentNode.replaceChild(clone, board);
	board = clone;
}

function resetGame() {
	emptyBoard();
	markQueue = [];
	winningLine = currentGameWinner = undefined;
}

function fall() {
	board.classList.add("fall");
}

document.addEventListener("DOMContentLoaded", function() {
	// console.log("DOM fully loaded and parsed");
	cells = Array.from(document.getElementsByClassName("cell"));
	notification.mode = "player selection";
  });
