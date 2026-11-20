import { randomUUID } from "node:crypto"
import { expect, test, type Page } from "@playwright/test"

const password = "local-e2e-password"
const transactionsPath = "http://127.0.0.1:3003/me/accounts/transactions"

async function login(page: Page, username: string) {
  await page.getByLabel("Användarnamn").fill(username)
  await page.getByLabel("Lösenord").fill(password)
  await page.getByRole("button", { name: "Logga in" }).click()
  await expect(page.getByRole("heading", { name: "Mitt konto" })).toBeVisible()
}

async function registerAndLogin(page: Page) {
  const username = `e2e-${randomUUID()}`
  await page.goto("/register")
  await page.getByLabel("Användarnamn").fill(username)
  await page.getByLabel("Lösenord").fill(password)
  await page.getByRole("button", { name: "Skapa konto" }).click()
  await expect(page).toHaveURL(/\/login$/)
  await login(page, username)
  return username
}

async function deposit(page: Page, amount: string, expectedBalance: string) {
  await page.getByLabel("Belopp").fill(amount)
  await page.getByRole("button", { name: "Sätt in pengar" }).click()
  await expect(page.getByText(expectedBalance, { exact: true })).toBeVisible()
}

test("skyddar konto och historik utan giltig inloggning", async ({ page, request }) => {
  await page.goto("/account")
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByLabel("Belopp")).toHaveCount(0)
  await page.goto("/transactions")
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole("heading", { name: "Transaktioner" })).toHaveCount(0)

  for (const token of [undefined, "a".repeat(64)]) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const response = await request.get(transactionsPath, { headers })
    expect(response.status()).toBe(401)
    expect(await response.json()).toHaveProperty("message")
  }
})

test("registrerar, loggar in och visar saldo och insättningar", async ({ page }) => {
  await registerAndLogin(page)
  await expect(page.getByText("0,00 kr", { exact: true })).toBeVisible()
  await deposit(page, "125.50", "125,50 kr")
  await deposit(page, "10", "135,50 kr")
  await page.getByRole("link", { name: "Transaktioner" }).click()
  const entries = page.getByRole("list", { name: "Insättningar" }).getByRole("listitem")
  await expect(entries).toHaveCount(2)
  await expect(entries.first()).toContainText("10,00 kr")
  await expect(entries.last()).toContainText("125,50 kr")
  await expect(entries.last().locator("time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}T/)
})

test("bevarar historiken och avvisar ogiltig insättning", async ({ page }) => {
  const username = await registerAndLogin(page)
  await deposit(page, "20", "20,00 kr")
  await page.getByLabel("Belopp").fill("-5")
  // Kringgå webbläsarens validering för att testa backend med samma formulär.
  await page.getByRole("button", { name: "Sätt in pengar" }).evaluate((button: HTMLButtonElement) => {
    button.form!.noValidate = true
  })
  await page.getByRole("button", { name: "Sätt in pengar" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "Ange ett positivt belopp" })).toBeVisible()
  await expect(page.getByText("20,00 kr", { exact: true })).toBeVisible()
  await page.getByRole("link", { name: "Transaktioner" }).click()
  await expect(page.getByRole("heading", { name: "Transaktioner" })).toBeVisible()
  await page.reload()
  await expect(page.getByRole("list", { name: "Insättningar" }).getByRole("listitem")).toHaveCount(1)
  await page.getByRole("link", { name: "Tillbaka till mitt konto" }).click()
  await page.getByRole("link", { name: "Logga ut" }).last().click()
  await expect(page).toHaveURL(/\/login$/)
  await login(page, username)
  await expect(page.getByText("20,00 kr", { exact: true })).toBeVisible()
  await page.getByRole("link", { name: "Transaktioner" }).click()
  const entries = page.getByRole("list", { name: "Insättningar" }).getByRole("listitem")
  await expect(entries).toHaveCount(1)
  await expect(entries.first()).toContainText("20,00 kr")
})

test("visar ett tomt läge för en annan användare", async ({ page, browser }) => {
  await registerAndLogin(page)
  await deposit(page, "50", "50,00 kr")
  const otherPage = await browser.newPage({ baseURL: "http://127.0.0.1:3002" })
  try {
    await registerAndLogin(otherPage)
    await otherPage.getByRole("link", { name: "Transaktioner" }).click()
    await expect(otherPage.getByText("Du har inga transaktioner ännu.")).toBeVisible()
    await expect(otherPage.getByRole("list", { name: "Insättningar" })).toHaveCount(0)
  } finally {
    await otherPage.close()
  }
})
