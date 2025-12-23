from playwright.sync_api import sync_playwright
import pandas as pd
import time

def scrape_page(page, page_num):
    url = f"https://www.popmart.com/us/collection/10/blind-boxes?page={page_num}&sortWay=1&collectionId=10"

    page.goto(url, wait_until="domcontentloaded", timeout=120000)
    
    # Wait a bit for page to fully load
    page.wait_for_timeout(2000)

    # Try to click accept button on main page first
    try:
        accept_btn = page.wait_for_selector('div.policy_acceptBtn__ZNU71', timeout=5000)
        if accept_btn:
            accept_btn.click()
            print(f"Accepted privacy policy on page {page_num}")
            page.wait_for_timeout(2000)  # wait for content to load after accepting
    except:
        print("No privacy policy button found on main page — checking frames")
        
        # If not on main page, check frames
        frames = page.frames
        for frame in frames:
            try:
                accept_btn = frame.wait_for_selector('div.policy_acceptBtn__ZNU71', timeout=2000)
                if accept_btn:
                    accept_btn.click()
                    print(f"Accepted privacy policy in frame on page {page_num}")
                    page.wait_for_timeout(2000)
                    break
            except:
                continue
    
    # Now look for products - try both main page and frames
    elements = []
    
    # First try main page
    try:
        page.wait_for_selector('a[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]', timeout=10000)
        elements = page.query_selector_all('a[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]')
        print(f"Found {len(elements)} elements on main page")
    except:
        print("No elements on main page, checking frames...")
    
    # If no elements on main page, check frames
    if not elements:
        frames = page.frames
        for frame in frames:
            try:
                frame.wait_for_selector('a[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]', timeout=5000)
                elements = frame.query_selector_all('a[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]')
                if elements:
                    print(f"Found {len(elements)} elements in frame")
                    break
            except:
                continue
    
    if not elements:
        print(f"No items found on page {page_num} — stopping.")
        return []
    
    blind_boxes = []
    
    for el in elements:
        params = el.get_attribute("data-pm-exposure-tracker-params")
        spu_name = eval(params).get("spu_name") if params else None
        
        img_el = el.query_selector("img.ant-image-img")
        img_url = img_el.get_attribute("src") if img_el else None
        
        # Extract category
        category_el = el.query_selector("div.index_itemSubTitle__mX6v_")
        category = category_el.inner_text().strip() if category_el else None
        
        if spu_name and img_url and category:
            blind_boxes.append({
                "Category": category.upper(),
                "Name": spu_name,
                "Image URL": img_url
            })
    
    print(f"Scraped {len(blind_boxes)} items from page {page_num}")
    return blind_boxes


def main():
    blind_box_final = []
    categories_set = set()
    page_num = 1

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # Set to False to see what's happening
        context = browser.new_context()
        page = context.new_page()
        
        while True:
            page_data = scrape_page(page, page_num)
            if not page_data:
                break
            blind_box_final.extend(page_data)
            
            for item in page_data:
                categories_set.add(item["Category"])
            
            page_num += 1
            time.sleep(1)

        browser.close()
    
    df = pd.DataFrame(blind_box_final)
    df.to_csv("new_bb.csv", index=False)
    print(f"Saved {len(blind_box_final)} items to new_bb.csv")
    
    with open("category.txt", "w", encoding="utf-8") as f:
        for category in sorted(categories_set):
            f.write(category + "\n")
    print(f"Saved {len(categories_set)} unique categories to category.txt")


if __name__ == "__main__":
    main()

'''
from playwright.sync_api import sync_playwright
import pandas as pd
import time

def scrape_page(page, page_num):
    url = f"https://www.popmart.com/us/collection/10/blind-boxes?page={page_num}&sortWay=1&collectionId=10"

    page.goto(url, wait_until="domcontentloaded", timeout=120000)

    frames = page.frames
    print(f"Page {page_num} loaded with {len(frames)} frames")
    print([f.url for f in frames])  # see if any iframe is loaded

    content_frame = None
    for f in frames:
        if "popmart.com/us/collection" in f.url:
            content_frame = f
            break

    if content_frame is None:
        print("Could not find the content frame")
        return []

    # Wait up to 10 seconds for the privacy button to appear
    try:
        # accept_btn = page.wait_for_selector("div.policy_acceptBtn__ZNU71", timeout=10000)
        accept_btn = content_frame.wait_for_selector('div:has-text("ACCEPT")', timeout=15000)
        if accept_btn:
            accept_btn.click()
            print(f"Accepted privacy policy on page {page_num}")
            page.wait_for_timeout(1000)  # short pause to allow content to load
    except:
        print("No privacy policy button found — continuing")

    
    try:
        page.wait_for_selector('a[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]', timeout=10000)
    except:
        print(f"No items found on page {page_num} — stopping.")
        return []
    
    elements = page.query_selector_all('a[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]')
    blind_boxes = []
    
    for el in elements:
        params = el.get_attribute("data-pm-exposure-tracker-params")
        spu_name = eval(params).get("spu_name") if params else None
        
        img_el = el.query_selector("img.ant-image-img")
        img_url = img_el.get_attribute("src") if img_el else None
        
        # Extract category
        category_el = el.query_selector("div.index_itemSubTitle__mX6v_")
        category = category_el.inner_text().strip() if category_el else None
        
        if spu_name and img_url and category:
            blind_boxes.append({
                "Category": category,
                "Name": spu_name,
                "Image URL": img_url
            })
    
    print(f"Scraped {len(blind_boxes)} items from page {page_num}")
    return blind_boxes


def main():
    blind_box_final = []
    categories_set = set()  # to store unique categories
    page_num = 1

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        while True:
            page_data = scrape_page(page, page_num)
            if not page_data:
                break
            blind_box_final.extend(page_data)
            
            # Add categories to set
            for item in page_data:
                categories_set.add(item["Category"])
            
            page_num += 1
            time.sleep(1)

        browser.close()
    
    # Save to CSV
    df = pd.DataFrame(blind_box_final)
    df.to_csv("new_bb.csv", index=False)
    print(f"Saved {len(blind_box_final)} items to new_bb.csv")
    
    # Save categories to TXT
    with open("category.txt", "w", encoding="utf-8") as f:
        for category in sorted(categories_set):
            f.write(category + "\n")
    print(f"Saved {len(categories_set)} unique categories to category.txt")


if __name__ == "__main__":
    main()
'''
