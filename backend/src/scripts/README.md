# Database Migration and Repair Scripts

This directory contains scripts for migrating and repairing data in the database.

## Available Scripts

### 1. `migratePurchasedCourses.js`

This script migrates purchased courses from the old format (simple array of course IDs) to the new format with detailed course information.

**Usage:**

```bash
node src/scripts/migratePurchasedCourses.js
```

### 2. `fixPurchasedCourses.js`

This script fixes corrupted purchasedItems data in user records, specifically addressing issues with Buffer objects appearing in the purchasedItems.courses array instead of properly structured course data.

**Usage:**

```bash
node src/scripts/fixPurchasedCourses.js
```

## Running the Scripts

1. Make sure your `.env` file contains the correct MongoDB connection string (`MONGODB_URI`).
2. Run the scripts from the project root directory.
3. Check the console output for results and any error messages.

## Best Practices

- **Always back up your database** before running migration scripts
- Run scripts in a development or staging environment first
- Monitor the script output for any errors or warnings
