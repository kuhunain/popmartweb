from selenium import webdriver
from selenium.webdriver.common.by import By
import pandas as pd
import time

# Set up ChromeOptions
options = webdriver.ChromeOptions()
options.add_argument("--headless")  # Run in headless mode (no browser window)
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

# Initialize the WebDriver
driver = webdriver.Chrome(options=options)  # No need for 'driver_path' if ChromeDriver is in PATH

# Target URL
url = "https://www.popmart.com/us/collection/10/blind-boxes?sortWay=1&page=14"

# Open the website
driver.get(url)
time.sleep(5)  # Allow time for JavaScript to load

# Locate all items with the specified attribute
elements = driver.find_elements(By.XPATH, '//a[@data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]')

# Extract data
blind_boxes = []
for element in elements:
    # Extract blind box name
    params = element.get_attribute("data-pm-exposure-tracker-params")
    spu_name = None
    if params:
        spu_name = eval(params).get("spu_name")  # Safely parse the parameter (might be JSON)

    # Extract image URL
    img_tag = element.find_element(By.XPATH, './/img[@class="ant-image-img"]')
    img_url = img_tag.get_attribute("src") if img_tag else None

    if spu_name and img_url:
        blind_boxes.append({"Name": spu_name, "Image URL": img_url})

# Close the driver
driver.quit()

# Save data to CSV
output_file = "blind_boxes14.csv"
df = pd.DataFrame(blind_boxes)
df.to_csv(output_file, index=False)
print(f"Data saved to {output_file}")
