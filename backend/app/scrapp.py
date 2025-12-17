from flask import Flask, jsonify
import json
import threading
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from flask_cors import CORS
import os

# ========================
# FLASK SETUP
# ========================
app = Flask(__name__)
CORS(app)

@app.route("/api/data", methods=["GET"])
def get_data():
    """Return the bid data"""
    try:
        with open("bid1.json", "r", encoding="utf-8") as file:
            data = json.load(file)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "bid1.json not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========================
# SCRAPER FUNCTION
# ========================
def scrape_data():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 10)

    driver.get("https://bidplus.gem.gov.in/all-bids")
    time.sleep(3)

    print("⚙️ Starting scraping (10 bids per page × 3700 pages)...")

    # Load existing data if available
    if os.path.exists("bid1.json"):
        with open("bid1.json", "r", encoding="utf-8") as f:
            try:
                data_list = json.load(f)
            except:
                data_list = []
    else:
        data_list = []

    total_pages = 3700

    for current_page in range(1, total_pages + 1):
        print(f"\n📄 Scraping page {current_page}")

        try:
            wait.until(EC.presence_of_all_elements_located((By.XPATH, '//*[@id="bidCard"]/div')))
            bid_cards = driver.find_elements(By.XPATH, '//*[@id="bidCard"]/div')[:10]
        except Exception:
            print(f"⚠️ Could not find bid cards on page {current_page}, skipping...")
            continue

        for i, bid_div in enumerate(bid_cards, start=1):
            try:
                bid_anchor = bid_div.find_element(By.XPATH, ".//p[1]/a")
                bid_no = bid_anchor.text.strip()
                bid_link = bid_anchor.get_attribute("href")
                item = bid_div.find_element(By.XPATH, ".//div[3]/div/div[1]/div[1]/a").text.strip()
                quantity = bid_div.find_element(By.XPATH, ".//div[3]/div/div[1]/div[2]").text.strip()
                department = bid_div.find_element(By.XPATH, ".//div[3]/div/div[2]/div[2]").text.strip()
                start_date = bid_div.find_element(By.XPATH, ".//div[3]/div/div[3]/div[1]/span").text.strip()
                end_date = bid_div.find_element(By.XPATH, ".//div[3]/div/div[3]/div[2]/span").text.strip()

                bid_data = {
                    "page": current_page,
                    "bid_no": bid_no,
                    "bid_link": bid_link,
                    "items": item,
                    "quantity": quantity,
                    "department_name": department,
                    "start_date": start_date,
                    "end_date": end_date
                }

                # Avoid duplicates
                if not any(b.get("bid_no") == bid_no for b in data_list):
                    data_list.append(bid_data)
                    print(f"✅ Scraped ({i}/10): {bid_no}")
                else:
                    print(f"⏩ Skipped duplicate bid: {bid_no}")

            except Exception as e:
                print(f"⚠️ Error parsing bid card {i}: {e}")

        # Save progress after every page
        with open("bid1.json", "w", encoding="utf-8") as f:
            json.dump(data_list, f, indent=4, ensure_ascii=False)
        print(f"💾 Saved {len(data_list)} bids so far.")

        # Determine next page button dynamically
        if current_page == 1:
            next_xpath = '//*[@id="light-pagination"]/a[7]'
        elif current_page == 2:
            next_xpath = '//*[@id="light-pagination"]/a[8]'
        elif current_page == 3:
            next_xpath = '//*[@id="light-pagination"]/a[8]'
        elif current_page == 4:
            next_xpath = '//*[@id="light-pagination"]/a[9]'
        else:
            next_xpath = '//*[@id="light-pagination"]/a[10]'

        # Try clicking next page button
        try:
            next_button = wait.until(EC.element_to_be_clickable((By.XPATH, next_xpath)))
            ActionChains(driver).move_to_element(next_button).click().perform()
            print(f"👉 Clicked next page button ({next_xpath})")
            time.sleep(2)  # just enough delay to load next page
        except Exception as e:
            print(f"⚠️ Could not click next button at page {current_page}: {e}")
            break

    driver.quit()
    print(f"\n✅ Scraping complete! Total bids collected: {len(data_list)} ({len(data_list)//10} pages)")
    print("📁 Data saved in bid1.json")


# ========================
# BACKGROUND SCRAPER
# ========================
def run_scraper_in_background():
    """Continuously update bid1.json"""
    scrape_data()
    print("✅ Scraper finished one full cycle. Restarting in 1 hour...")
    time.sleep(3600)
    run_scraper_in_background()


# ========================
# MAIN ENTRY POINT
# ========================
if __name__ == "__main__":
    threading.Thread(target=run_scraper_in_background, daemon=True).start()
    print("🚀 Flask API running at http://127.0.0.1:5000/api/data")
    app.run(debug=True)
