const { test, expect } = require('@playwright/test');

test.describe('Star Wars Pong Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/starwars-pong.html');
    await page.waitForLoadState('networkidle');
  });

  test('should load game correctly', async ({ page }) => {
    await expect(page).toHaveTitle('Star Wars Pong');
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('#gameMenu')).toBeVisible();
    await expect(page.locator('h1')).toContainText('STAR WARS PONG');
  });

  test('should navigate to difficulty menu', async ({ page }) => {
    await page.click('button:text("vs AI")');
    await expect(page.locator('#difficultyMenu')).toBeVisible();
    await expect(page.locator('#gameMenu')).toBeHidden();
  });

  test('should start two player game', async ({ page }) => {
    await page.click('button:text("Two Player")');
    await expect(page.locator('#playerSetup')).toBeVisible();
    
    await page.fill('#player1NameInput', 'Test Player 1');
    await page.fill('#player2NameInput', 'Test Player 2');
    await page.click('button:text("Start Game")');
    
    // Wait for countdown to finish
    await page.waitForTimeout(4000);
    
    // Check that game has started
    await expect(page.locator('#gameMenu')).toBeHidden();
    await expect(page.locator('#player1Name')).toContainText('Test Player 1');
    await expect(page.locator('#player2Name')).toContainText('Test Player 2');
  });

  test('should start AI game', async ({ page }) => {
    await page.click('button:text("vs AI")');
    await page.click('button:text("Easy AI")');
    await page.fill('#player1NameInput', 'Test Player');
    await page.click('button:text("Start Game")');
    
    // Wait for countdown to finish
    await page.waitForTimeout(4000);
    
    // Check that AI game has started
    await expect(page.locator('#gameMenu')).toBeHidden();
    await expect(page.locator('#player1Name')).toContainText('Test Player');
    await expect(page.locator('#player2Name')).toContainText('Darth Vader');
  });

  test('should respond to keyboard controls', async ({ page }) => {
    // Start a game
    await page.click('button:text("Two Player")');
    await page.click('button:text("Start Game")');
    await page.waitForTimeout(4000);
    
    // Test W key (move up)
    await page.keyboard.press('w');
    await page.waitForTimeout(100);
    
    // Test S key (move down)
    await page.keyboard.press('s');
    await page.waitForTimeout(100);
    
    // Test Arrow keys for player 2
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    // Test pause functionality
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    // Test ESC to return to menu
    await page.keyboard.press('Escape');
    await expect(page.locator('#gameMenu')).toBeVisible();
  });

  test('should handle mobile touch events', async ({ page }) => {
    // Start a game
    await page.click('button:text("Two Player")');
    await page.click('button:text("Start Game")');
    await page.waitForTimeout(4000);
    
    const canvas = page.locator('#gameCanvas');
    const canvasBox = await canvas.boundingBox();
    
    // Simulate touch on left side (paddle 1)
    await page.touchscreen.tap(canvasBox.x + 50, canvasBox.y + canvasBox.height / 2);
    await page.waitForTimeout(100);
    
    // Simulate touch drag
    await page.touchscreen.tap(canvasBox.x + 50, canvasBox.y + canvasBox.height / 2 + 100);
    await page.waitForTimeout(100);
    
    // Simulate touch on right side (paddle 2)
    await page.touchscreen.tap(canvasBox.x + canvasBox.width - 50, canvasBox.y + canvasBox.height / 2);
    await page.waitForTimeout(100);
  });

  test('should display score correctly', async ({ page }) => {
    await page.click('button:text("Two Player")');
    await page.click('button:text("Start Game")');
    await page.waitForTimeout(4000);
    
    // Check initial scores
    await expect(page.locator('#player1Score')).toContainText('0');
    await expect(page.locator('#player2Score')).toContainText('0');
    
    // Scores should remain visible during gameplay
    await expect(page.locator('#player1Score')).toBeVisible();
    await expect(page.locator('#player2Score')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('#gameMenu')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('#gameMenu')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('#gameMenu')).toBeVisible();
  });

  test('should handle window resize', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Start game
    await page.click('button:text("Two Player")');
    await page.click('button:text("Start Game")');
    await page.waitForTimeout(4000);
    
    // Resize window
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);
    
    // Game should still be functional
    await expect(page.locator('#gameCanvas')).toBeVisible();
    
    // Test keyboard controls still work
    await page.keyboard.press('w');
    await page.waitForTimeout(100);
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.click('button:text("Two Player")');
    await page.click('button:text("Start Game")');
    await page.waitForTimeout(4000);
    
    // Test various interactions
    await page.keyboard.press('w');
    await page.keyboard.press('s');
    await page.keyboard.press('Space');
    await page.keyboard.press('Escape');
    
    expect(consoleErrors).toEqual([]);
  });

  test('should handle audio context creation', async ({ page }) => {
    // Start game to trigger audio initialization
    await page.click('button:text("vs AI")');
    await page.click('button:text("Easy AI")');
    await page.click('button:text("Start Game")');
    await page.waitForTimeout(4000);
    
    // Check that audio context was created
    const audioContextExists = await page.evaluate(() => {
      return window.audioContext !== null && window.audioContext !== undefined;
    });
    
    expect(audioContextExists).toBe(true);
  });

  test('should maintain game state correctly', async ({ page }) => {
    // Start game
    await page.click('button:text("Two Player")');
    await page.fill('#player1NameInput', 'Player1');
    await page.fill('#player2NameInput', 'Player2');
    await page.click('button:text("Start Game")');
    await page.waitForTimeout(4000);
    
    // Check game state
    const gameState = await page.evaluate(() => {
      return {
        gameMode: window.gameMode,
        gameRunning: window.gameRunning,
        player1Name: window.player1Name,
        player2Name: window.player2Name,
        paddle1Exists: !!window.paddle1,
        paddle2Exists: !!window.paddle2,
        ballExists: !!window.ball
      };
    });
    
    expect(gameState.gameMode).toBe('twoPlayer');
    expect(gameState.gameRunning).toBe(true);
    expect(gameState.player1Name).toBe('Player1');
    expect(gameState.player2Name).toBe('Player2');
    expect(gameState.paddle1Exists).toBe(true);
    expect(gameState.paddle2Exists).toBe(true);
    expect(gameState.ballExists).toBe(true);
  });

  test('should run test suite', async ({ page }) => {
    await page.goto('/test-suite.html');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1')).toContainText('Star Wars Pong Test Suite');
    
    // Run unit tests
    await page.click('#run-unit-tests');
    
    // Wait for tests to complete
    await page.waitForTimeout(10000);
    
    // Check that some tests passed
    const passedTests = await page.textContent('#passed-tests');
    expect(parseInt(passedTests)).toBeGreaterThan(0);
  });
});

test.describe('Game Performance', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/starwars-pong.html');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should maintain smooth frame rate', async ({ page }) => {
    await page.goto('/starwars-pong.html');
    await page.waitForLoadState('networkidle');
    
    // Start game
    await page.click('button:text("Two Player")');
    await page.click('button:text("Start Game")');
    await page.waitForTimeout(4000);
    
    // Measure frame rate
    const frameRate = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();
        
        function countFrames() {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames);
          } else {
            resolve(frames);
          }
        }
        
        requestAnimationFrame(countFrames);
      });
    });
    
    expect(frameRate).toBeGreaterThan(30); // Should maintain at least 30 FPS
  });
});