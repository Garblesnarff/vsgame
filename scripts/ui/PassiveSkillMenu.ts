import CONFIG from "../config";
import { Game } from "../game/game";
import { GameStateManager } from "../game/state-manager";
import { EVENTS, GameEvents } from "../utils/event-system";

/**
 * Skill Menu
 * Manages the skill upgrade/unlock menu UI
 */
export class PassiveSkillMenu {
  game: Game;
  gameStateManager: GameStateManager;
  player: any; // Using any temporarily to avoid circular dependencies
  gameContainer: HTMLElement;
  menuOverlay: HTMLElement | null;
  killPointsDisplay: HTMLElement | null;
  skillGrid: HTMLElement | null;
  isOpen: boolean;
  levelSystem: any;

  /**
   * Create a new skill menu
   * @param game - Game instance
   */
  constructor(game: Game) {
    this.game = game;
    this.gameStateManager = game.stateManager;
    this.player = game.player;
    this.gameContainer = game.gameContainer;
    this.levelSystem = game.levelSystem;

    // Get menu elements
    this.menuOverlay = document.getElementById("passive-skill-menu-overlay");
    this.killPointsDisplay = document.getElementById("available-skill-points");
    this.skillGrid = document.querySelector(".skill-grid");

    // Create menu if it doesn't exist
    this.ensureMenuExists();

    // Initialize event listeners
    this.initializeEventListeners();

    // Initialize skill cards
    this.createPassiveSkillCards();

    // Track state
    this.isOpen = false;
  }

  /**
   * Ensure the skill menu elements exist
   */
  ensureMenuExists(): void {
    if (!this.menuOverlay) {
      this.menuOverlay = document.createElement("div");
      this.menuOverlay.id = "passive-skill-menu-overlay";
      this.menuOverlay.className = "skill-menu-overlay";

      this.menuOverlay.innerHTML = `
                <div class="skill-menu">
                    <div class="skill-menu-header">
                        <h2>Passive Skills</h2>
                        <div class="skill-points-display">
                            Available Kill Points: <span id="available-skill-points">0</span>
                        </div>
                        <button class="skill-menu-close" id="skill-menu-close">Close</button>
                    </div>
                    
                    <div class="skill-grid"></div>
                </div>
            `;

      this.gameContainer.appendChild(this.menuOverlay);
      this.killPointsDisplay = document.getElementById(
        "available-skill-points"
      );
      this.skillGrid = this.menuOverlay.querySelector(".skill-grid");
    }
  }

  /**
   * Initialize menu event listeners
   */
  initializeEventListeners(): void {
    // Close button
    const closeButton = document.getElementById("skill-menu-close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.close();
        this.gameStateManager.restorePreviousState(); // Restore previous state
        GameEvents.emit(EVENTS.GAME_RESUME); // Resume game
      });
    }

    // Skill points indicator
    const skillPointsIndicator = document.getElementById("skill-points");
    if (skillPointsIndicator) {
      skillPointsIndicator.addEventListener("click", () => this.toggle());
    }
  }

  /**
   * Toggle the skill menu
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the skill menu
   */
  open(): void {
    if (this.menuOverlay) {
      this.menuOverlay.style.display = "flex";
      this.player.showingSkillMenu = true;
      this.isOpen = true;

      // Update content
      this.update();
    }
  }

  /**
   * Close the skill menu
   */
  close(): void {
    if (this.menuOverlay) {
      this.menuOverlay.style.display = "none";
      this.player.showingSkillMenu = false;
      this.isOpen = false;
    }
  }

  /**
   * Reset the skill menu to initial state
   */
  reset(): void {
    // Close menu if open
    if (this.isOpen) {
      this.close();
    }
  }

  /**
   * Create skill cards if they don't exist
   */
  createPassiveSkillCards(): void {
    if (!this.skillGrid) {
      return;
    }

    // Increased Attack Damage
    this.createSkillCard(
      "increased-attack-damage",
      "Increased Attack Damage",
      "Increases the player's attack damage.",
      [
        {
          name: "Damage",
          id: "increased-attack-damage-value",
          value: "+0%",
        },
      ]
    );

    // Increased Attack Speed
    this.createSkillCard(
      "increased-attack-speed",
      "Increased Attack Speed",
      "Increases the player's attack speed.",
      [
        {
          name: "Attack Speed",
          id: "increased-attack-speed-value",
          value: "+0%",
        },
      ]
    );

    // Life Steal
    this.createSkillCard(
      "life-steal",
      "Life Steal",
      "Grants the player life steal on hit.",
      [
        {
          name: "Life Steal",
          id: "life-steal-value",
          value: "+0%",
        },
      ]
    );
  }

  /**
   * Create a skill card element
   * @param id - Skill ID
   * @param name - Skill name
   * @param description - Skill description
   * @param effects - Array of effect objects { name, id: string; value: string }
   */
  createSkillCard(
    id: string,
    name: string,
    description: string,
    effects: Array<{ name: string; id: string; value: string }>
  ): void {
    if (!this.skillGrid) {
      return;
    }

    // Create card element
    const card = document.createElement("div");
    card.className = "skill-card";
    card.id = `${id}-card`;

    // Add header
    const header = document.createElement("div");
    header.className = "skill-card-header";
    header.innerHTML = `<h3>${name}</h3>`;
    card.appendChild(header);

    // Add description
    const desc = document.createElement("div");
    desc.className = "skill-description";
    desc.textContent = description;
    card.appendChild(desc);

    // Add effects
    const effectsContainer = document.createElement("div");
    effectsContainer.className = "skill-effects";

    effects.forEach((effect) => {
      const effectElement = document.createElement("div");
      effectElement.className = "skill-effect";
      effectElement.innerHTML = `
                <span class="skill-effect-name">${effect.name}:</span>
                <span class="skill-effect-value" id="${effect.id}">${effect.value}</span>
            `;
      effectsContainer.appendChild(effectElement);
    });

    card.appendChild(effectsContainer);

    // Add upgrade button
    const button = document.createElement("button") as HTMLButtonElement;
    button.className = "skill-upgrade-btn";
    button.id = `${id}-upgrade`;
    button.textContent = "Purchase (1 Kill Point)";
    card.appendChild(button);
  }

  /**
   * Update skill card levels and values
   */
  update(): void {
    // Update available kill points
    if (this.killPointsDisplay) {
      this.killPointsDisplay.textContent = this.levelSystem.kills.toString();
    }
  }
}

export default PassiveSkillMenu;
