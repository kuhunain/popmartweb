from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time

def scrape_each_page(page_num):
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    driver = webdriver.Chrome(options=options)

    url = f"https://www.popmart.com/us/collection/10/blind-boxes?page={page_num}&sortWay=1&collectionId=10"
    driver.get(url)

    # Scroll to bottom to trigger lazy loading
    SCROLL_PAUSE_TIME = 2
    last_height = driver.execute_script("return document.body.scrollHeight")

    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(SCROLL_PAUSE_TIME)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

    blind_boxes = []
    try:
        elements = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located(
                (By.XPATH, '//a[@data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]')
            )
        )
        print(f"Found {len(elements)} items on page {page_num}")
        for element in elements:
            params = element.get_attribute("data-pm-exposure-tracker-params")
            spu_name = eval(params).get("spu_name") if params else None
            img_tag = element.find_element(By.XPATH, './/img[@class="ant-image-img"]')
            img_url = img_tag.get_attribute("src") if img_tag else None
            if spu_name and img_url:
                blind_boxes.append({"Name": spu_name, "Image URL": img_url})

    except Exception as e:
        print(f"No items found on page {page_num}. Error: {e}")

    driver.quit()
    return blind_boxes

# Scrape all pages
page_num = 1
blind_box_final = []

while page_num <= 25:
    print(f"Scraping page {page_num}...")
    page_data = scrape_each_page(page_num)
    if not page_data:
        break
    blind_box_final.extend(page_data)
    page_num += 1

df = pd.DataFrame(blind_box_final)
df.to_csv("new_bb.csv", index=False)
print(f"Data saved to new_bb.csv")

'''
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time

def scrape_each_page(page_num):

    # Set up ChromeOptions
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in headless mode (no browser window)
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    # Initialize the WebDriver
    driver = webdriver.Chrome(options=options)  # No need for 'driver_path' if ChromeDriver is in PATH

    # Target URL
    url = f"https://www.popmart.com/us/collection/10/blind-boxes?page={page_num}&sortWay=1&collectionId=10"
    
    # Open the website
    driver.get(url)
    time.sleep(5)  # Allow time for JavaScript to load

    blind_boxes = []

    try:
        # Wait up to 10 seconds for elements to load
        elements = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located(
                (By.XPATH, '//a[@data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]')
            )
        )

        print(f"Found {len(elements)} items on page {page_num}")

        for element in elements:
            params = element.get_attribute("data-pm-exposure-tracker-params")
            spu_name = eval(params).get("spu_name") if params else None

            img_tag = element.find_element(By.XPATH, './/img[@class="ant-image-img"]')
            img_url = img_tag.get_attribute("src") if img_tag else None

            if spu_name and img_url:
                blind_boxes.append({"Name": spu_name, "Image URL": img_url})

    except:
        print(f"No items found on page {page_num} — stopping.")
        driver.quit()
        return []

    driver.quit()
    return blind_boxes

page_num = 1
blind_box_final = []

while page_num <= 25:
    print(f"Scraping page {page_num}...")
    page_data = scrape_each_page(page_num)
    if not page_data:
        break
    blind_box_final.extend(page_data)
    page_num += 1

# Save data to CSV
output_file = "new_bb.csv"
df = pd.DataFrame(blind_box_final)
df.to_csv(output_file, index=False)
print(f"Data saved to {output_file}")
'''

