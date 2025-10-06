import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # 1. Navigate to the login page
            await page.goto("http://localhost:3000/login", timeout=60000)

            # 2. Wait for the main card and button to be visible
            login_card = page.get_by_role("heading", name="Welcome Back")
            await expect(login_card).to_be_visible(timeout=30000)

            google_button = page.get_by_role("button", name="Continue with Google")
            await expect(google_button).to_be_visible()

            # 3. Take a screenshot
            screenshot_path = "jules-scratch/verification/login-page.png"
            await page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())