const gameBoardCover = document.querySelector(".game-board-cover");
const gameBoard = gameBoardCover.querySelector(".game-board");
const cell = gameBoard.querySelectorAll("div");
const iconx = document.querySelector(".icon-x");
const winnerBox = document.querySelector(".winner-toggle");
const exitButton = document.querySelector(".exit");
const winnerText = winnerBox.querySelector("h1");
const playAgain = winnerBox.querySelector(".play-again");
const players = document.querySelectorAll(".players div");
const playWithButton = document.querySelectorAll(".flex-box button");

// game sounds
const dir = "./sounds/";
const computerWinSound = new Audio(dir + "computerwin.mp3");
const cellHitSound = new Audio(dir + "hitsound.aac");
const youWinsound = new Audio(dir + "youwin.mp3");
const gameDrawSound = new Audio(dir + "gamedraw.mp3");
const playerWinSound = new Audio(dir + "playerwin.mp3");

var cellCounter = 0, gameObject = {}, isComputer = false, timeout = 0;

/**
 * each function use only for HTML NodeList or Array
 * @param {object} obj HTML NodeList | Array
 * @param {function} callback function
 */
function each( obj, callback ) {
   var i=0;
   for( ; i < obj.length; i++ ) {
      callback.call(obj[ i ], i, obj[ i ], obj );
   }
}

// RandomCell
function randomCell( all ) {
   var elem = [], rsign = /--(x|o)/;
   each( cell, function() {
      if ( !rsign.test( this.dataset["sign"] ) ) {
         elem.push( this );
      }
   });
   return !!all ? elem : elem[
      Math.floor( Math.random() * elem.length )
   ];
}

// TogglePlayer
function togglePlayer() {
   each( players, function() { this.classList.toggle("active") });
}

// SignChanger
function signChanger( sign, isFormatting ) {
   if ( isFormatting ) return sign === "--x" ? "X" : "O";
   return sign === "--x" ? "--o" : "--x";
}

function cellEnabled( opts ) { // cell enable disable fn
   each( opts.cell || cell, function() {
      if ( opts.not && ( [].indexOf.call( opts.not, this ) > -1 ) !== opts.enabled ) {
         this.style.pointerEvents = "";
      }
      else if ( !opts.not ) {
         this.style.pointerEvents = !opts.enabled && "none" || "";
      }
   });
}

// showHide use gamebox show and hide with animation effect
function showHide( options ) {
   options.showElem = document.querySelector(options.show);
   options.hideElem = document.querySelector(options.hide);
   options.gameArea = document.querySelector(".game-area");

   options.gameArea.classList.add("hide");
   setTimeout( function() {
      options.hideElem.style.display = "none";
      options.showElem.style.display = "";
      options.gameArea.classList.remove("hide");
   }, 900 );
}

function computerMind( sign, isExtraWait ) {
   var delay = 1500,
      random = Math.floor(Math.random() * delay) + 500,
      randomDelay = !!isExtraWait && 
         delay + random || random;

   var cellRandom = randomCell(), 
      cells = randomCell( true );

   // disable cells
   cellEnabled({enabled:false, cell:cells});

   timeout = setTimeout( function() {
      if ( !cellRandom ) return;

      cellHitSound.play();
      cellRandom.dataset["sign"] = sign;

      var decideWinner = checkWinner( 
         sign, ++cellCounter 
      );

      if ( decideWinner ) {
         cellEnabled({enabled:false});
         announceWinner( decideWinner );
         return;
      }

      togglePlayer(); // toggle player chance
      cellEnabled({enabled:true, not:[cellRandom], cell:cells});
   }, randomDelay ); // set random delay

   return signChanger( sign );
}

function gameSetup( options ) { // gameSetup
   
   players[ !options.active && 1 || 0 ].classList.remove("active");
   players[ options.active ].classList.add("active");

   players[ 0 ].dataset["sign"] = options.p1;
   players[ 1 ].dataset["sign"] = options.p2;

   options.sign = document.querySelector(".active").dataset["sign"];

   if (isComputer && players[ 1 ].classList.contains("active")) {
      options.sign = computerMind( options.sign, true );
   }

   gameObject.pw = options.pw; // play with
   gameObject.sign = options.sign; // sign
   gameBoard.dataset["indicate"] = options.sign;
}

// ResetGame function
function resetGame() {
   cellEnabled({enabled: true});
   clearTimeout( timeout );
   cellCounter = 0;
   each( cell, function() { this.dataset["sign"] = "" });
}

function initGame( playwith ) {
   showHide({show: ".game-board-container", hide: ".play-with"});
   resetGame();
   var sign = ["--o", "--x"];
   var random = Math.floor(Math.random() * sign.length);
   var vsIndex = random === 0 ? 1 : 0; // opposit index
   isComputer = playwith === "computer" ? true : false;

   gameSetup({
      pw: playwith, // pw mean playwith
      p1: sign[ vsIndex ], // player1
      p2: sign[ random ], // player2
      active: Math.floor(Math.random() * sign.length)
   });
}

// CheckWinner
function checkWinner( sign, cellCounter ) {
   var vwc = [ // valid winner combination
      [1,2,3], [4,5,6], [7,8,9],
      [1,5,9], [3,5,7],
      [1,4,7], [2,5,8], [3,6,9]
   ];

   var i = 0, j, value, matched, matcher = function( index ) {
      return document.querySelector(".cell" + index).dataset["sign"];
   };

   for ( ; i < vwc.length; i++ ) {
      j = 0;
      matched = 0;
      value = vwc[ i ];
      for ( ; j < value.length; j++ ) {
         if ( matcher( value[ j ] ) === sign ) {
            matched++;
         }
      }

      if ( matched === 3 ) {
         return { winner: sign };
      }
   }

   return cellCounter === 9 && {draw: true};
}

// AnnounceWinner function announce the winner or draw game
function announceWinner( opts ) {
   var delay = 600; 
   var pwcCond = isComputer && players[ 0 ].dataset["sign"] === opts.winner;
   var text = opts.winner ? 
      ( !pwcCond && isComputer ? "computer " : "player " ) + 
      signChanger( opts.winner, true ) + " is wins." : "Game is Draw!";

   if ( pwcCond ) {
      gameBoardCover.classList.add("winner");
   }

   setTimeout( function() {
      if ( pwcCond ) youWinsound.play();
      setTimeout( function() {
         winnerBox.style.display = "";
         gameBoardCover.classList.remove("winner");
         winnerText.innerHTML = text;

         // HANDLE: sounds
         ( opts.winner ) ? 
         ( !pwcCond && isComputer ? computerWinSound.play() : playerWinSound.play() ) : gameDrawSound.play();
      }, pwcCond ? delay * 2 : 100 );
   }, delay );

   playAgain.addEventListener("click", function() {
      winnerBox.style.display = "none";
      initGame(gameObject.pw);
   });
}

each( cell, function() {
   this.addEventListener("click", function() {
      cellHitSound.play();
      this.style.pointerEvents = "none";
      this.dataset["sign"] = gameObject.sign;

      var decideWinner = checkWinner( 
            gameObject.sign, ++cellCounter 
         );

      if ( decideWinner ) {
         cellEnabled({enabled:false});
         announceWinner( decideWinner );
         return;
      }

      togglePlayer(); // toggle player chance

      if ( isComputer ) {
         computerMind(signChanger(gameObject.sign));
      } else {
         gameObject.sign = signChanger( gameObject.sign );
         gameBoard.dataset["indicate"] = gameObject.sign;
      }
   });
});

each( playWithButton, function() {
   this.addEventListener("click", function() { initGame( this.className ) });
});

// Exit window / Exit Game
exitButton.addEventListener("click", function() { window.close() });

iconx.addEventListener("click", function() {
   showHide({show: ".play-with", hide: ".game-board-container"});
});