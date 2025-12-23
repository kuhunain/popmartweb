'''
    # Locate all items with the specified attribute
    elements = driver.find_elements(By.XPATH, '//a[@data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]')

    if not elements:
        print(f"No items found on this page - {page_num} — stopping.")
        return []  # Return an empty list if no items are found
    
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
    return blind_boxes
'''