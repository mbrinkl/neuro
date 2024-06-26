import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  const createTicTacToeButton = page.getByText("Create TicTacToe");
  await createTicTacToeButton.click();

  await expect(page).toHaveURL("/tictactoe");
});
