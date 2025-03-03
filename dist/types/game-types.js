/**
 * Common interfaces and types used throughout the game
 */
/**
 * Game state enum
 */
export var GameState;
(function (GameState) {
    GameState["LOADING"] = "loading";
    GameState["MAIN_MENU"] = "mainMenu";
    GameState["PLAYING"] = "playing";
    GameState["PAUSED"] = "paused";
    GameState["SKILL_MENU"] = "skillMenu";
    GameState["GAME_OVER"] = "gameOver";
})(GameState || (GameState = {}));
// No namespace or default export, just export individual types
//# sourceMappingURL=game-types.js.map