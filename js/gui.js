let board = document.querySelector('.board');
const svgNS = "http://www.w3.org/2000/svg";
const xlinkNS = "http://www.w3.org/1999/xlink";

let i=0;

board.onclick = addMark;

function addMark(e) {
	console.log(e.target, e.bubbles);
	const target = e.target;
	if(target.classList.contains("cell") && !target.hasChildNodes()) {
		const svg = document.createElementNS(svgNS, "svg");
		const use = document.createElementNS(svgNS, "use");

		use.setAttributeNS(xlinkNS, "xlink:href", i++%2 ? "#circ" : "#cross");

		svg.appendChild(use);
		target.appendChild(svg);
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
	clone.onclick = addMark;
	clone.className = "board arrive";
	let fragment;
	({clones: cells, fragment} = generateBoard());
	clone.appendChild(fragment);
	console.log("cloned board:", clone);


	board.parentNode.replaceChild(clone, board);
	board = clone;
}

function fall() {
	board.classList.remove("arrive");
	board.classList.add("fall");
}
