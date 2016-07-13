let board = document.querySelector('.board');
const svgNS = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";

let i=0;

board.onclick = onClick;

function onClick(e) {
	console.log(e.target, e.bubbles);
	const target = e.target;
	if(target.classList.contains("cell") && !target.hasChildNodes()) {
		addMark(target, playerMark);

		// const aimove = ai.aiMove();
	}
}

function addMark(cell, mark) {
	const svg = document.createElementNS(svgNS, "svg");
	const use = document.createElementNS(svgNS, "use");

	use.setAttributeNS(xlinkNS, "href", mark === playerMark ? "#cross" : "#circ");

	svg.appendChild(use);
	cell.appendChild(svg);
}


board.addEventListener("animationend", onAnimationEnd);

function onAnimationEnd(e) {
	console.log("anim ended", e.animationName, e.target, cells.indexOf(e.target.parentNode));
	if(e.animationName === "draw") {
		console.log("Mark drawn");
		playersTurn = !playersTurn;
		if(!playersTurn) {
			const {aimove, winner} = ai.playerMove(cells.indexOf(e.target.parentNode));
			// const {aimove, winner} = ai.aiMove();
			console.log("adding ai mark to", aimove, "winner:", winner);
			if(!winner)addMark(cells[aimove], aiMark);
			// else proclaimWinner(winner);
		}
	} else if(e.animationName === "fall" && e.target === cells[8]) {
		console.log("Board cleared");
	} else if(e.animationName === "arrive" && e.target === cells[0]) {
		console.log("Board recreated");
		board.classList.remove("arrive");
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

	ai.resetGame(aiMark);
}

function fall() {
	board.classList.remove("arrive");
	board.classList.add("fall");
}

let playersTurn;
const playerMark = "X", aiMark = "O";
document.addEventListener("DOMContentLoaded", function() {
	console.log("DOM fully loaded and parsed");
	cells = Array.from(document.getElementsByClassName("cell"));
	ai.setAIPlayer(aiMark);
	playersTurn =true;
  });
