import csv

# Step 1: Read the categories from categories.txt
with open('categories.txt', 'r') as cat_file:
    categories = [line.strip() for line in cat_file.readlines()]

# Step 2: Read the CSV file and categorize based on the name containing category
categorized_rows = {category: [] for category in categories}

with open('blind_boxes.csv', 'r', encoding='utf-8') as csv_file:
    reader = csv.DictReader(csv_file)
    for row in reader:
        name = row['Name']  # Adjust based on the actual column name
        for category in categories:
            if category.lower() in name.lower():  # Case insensitive match
                row['category'] = category  # Add category column to the row
                categorized_rows[category].append(row)
                break  # Stop after the first category match

# Step 3: Sort the rows within each category (optional if sorting is needed)
for category in categorized_rows:
    categorized_rows[category].sort(key=lambda x: x['Name'])  # Adjust sorting based on column

# Step 4: Write the categorized and sorted rows to a new file with the category column
with open('sorted_blind_boxes_with_category.csv', 'w', encoding='utf-8', newline='') as out_file:
    fieldnames = reader.fieldnames + ['category']  # Add 'category' to the header
    writer = csv.DictWriter(out_file, fieldnames=fieldnames)
    
    writer.writeheader()  # Write header to the output file
    
    # Write rows, maintaining the category order
    for category, rows in categorized_rows.items():
        for row in rows:
            writer.writerow(row)

print("Data has been saved to 'sorted_blind_boxes_with_category.csv'.")
