import { test, expect } from "@playwright/test";

test("has title", async ({ page, baseURL }) => {
  await page.goto(baseURL);

  const createTicTacToeButton = page.getByText("Create TicTacToe");
  await createTicTacToeButton.click();

  await expect(page).toHaveURL(baseURL + "/tictactoe");
});
