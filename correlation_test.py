import pandas as pd
from scipy.stats import pearsonr
import matplotlib.pyplot as plt
import numpy as np

print("running file: correlation_test.py")
# ====== LOAD FILES ======
# Replace with your actual file names
colors = pd.read_csv("data/worcester_zip_redlining_breakdown.csv")
housing = pd.read_csv("data/zipCodeInfo.csv")

print("STARTING TO RUN")

# ====== CHECK COLUMN NAMES ======
# Expected example columns:
# colors: zip, percent_red, percent_yellow
# housing: zip, median_housing_price

# Rename columns if necessary (adjust to match your files)
colors = colors.rename(columns={
    "ZIP": "zip",
    "Red": "percent_red",
    "Yellow": "percent_yellow"
})

housing = housing.rename(columns={
    "zip_code": "zip",
    "median_housing_price": "median_housing_price"
})



# Make sure ZIP codes are same type
colors["zip"] = colors["zip"].astype(str)
housing["zip"] = housing["zip"].astype(str)

# ====== MERGE DATASETS ======
df = pd.merge(colors, housing, on="zip", how="inner")

# Drop missing values
df = df.dropna(subset=["percent_red", "percent_yellow", "median_housing_price"])

# ====== FORCE NUMERIC CONVERSION ======

# Remove percent signs and convert to float
df["percent_red"] = (
    df["percent_red"]
    .astype(str)
    .str.replace("%", "", regex=False)
    .astype(float)
)

df["percent_yellow"] = (
    df["percent_yellow"]
    .astype(str)
    .str.replace("%", "", regex=False)
    .astype(float)
)

# Remove dollar signs and commas
df["median_housing_price"] = (
    df["median_housing_price"]
    .astype(str)
    .str.replace("$", "", regex=False)
    .str.replace(",", "", regex=False)
    .astype(float)
)

print("Merged dataset size:", len(df))
print("-" * 40)

# ====== CORRELATION TESTS ======

# % Red vs Housing
corr_red, p_red = pearsonr(df["percent_red"], df["median_housing_price"])

print("Correlation: % Red vs Median Housing Price")
print(f"Pearson r = {corr_red:.4f}")
print(f"P-value = {p_red:.4f}")
print("-" * 40)

# % Yellow vs Housing
corr_yellow, p_yellow = pearsonr(df["percent_yellow"], df["median_housing_price"])

print("Correlation: % Yellow vs Median Housing Price")
print(f"Pearson r = {corr_yellow:.4f}")
print(f"P-value = {p_yellow:.4f}")
print("-" * 40)

# % red and yellow vs Housing
df["percent_red_yellow"] = df["percent_red"] + df["percent_yellow"]
corr_red_yellow, p_red_yellow = pearsonr(df["percent_red_yellow"], df["median_housing_price"])

print("Correlation: % Red + Yellow vs Median Housing Price")
print(f"Pearson r = {corr_red_yellow:.4f}")
print(f"P-value = {p_red_yellow:.4f}")
print("-" * 40)

# ====== SCATTER 1 ======
plt.figure()
plt.scatter(df["percent_red"], df["median_housing_price"])
plt.xlabel("Percent Red")
plt.ylabel("Median Housing Price")
plt.title("Percent Red vs Median Housing Price")
# add trend line
z = np.polyfit(df["percent_red"], df["median_housing_price"], 1)
p = np.poly1d(z)
plt.plot(df["percent_red"], p(df["percent_red"]), "r--")

plt.show()



# ====== SCATTER 2 ======
plt.figure()
plt.scatter(df["percent_yellow"], df["median_housing_price"])
plt.xlabel("Percent Yellow")
plt.ylabel("Median Housing Price")
plt.title("Percent Yellow vs Median Housing Price")
plt.show()

# scatter 3
plt.figure()
plt.scatter(df["percent_red_yellow"], df["median_housing_price"])
plt.xlabel("Percent Red + Yellow")
plt.ylabel("Median Housing Price")
plt.title("Percent Red + Yellow vs Median Housing Price")
plt.show()