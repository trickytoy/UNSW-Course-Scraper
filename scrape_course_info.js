import puppeteer from "puppeteer";
import fs from "fs";

// Add the assertion type "json" to the import statement
import courses from './courses.json' assert { type: 'json' };

const scrape = async () => {
    const courses_info = [];

    for (let course of courses) {
        let browser;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                // Launch the browser
                browser = await puppeteer.launch({ headless: false, defaultViewport: null });
                const page = await browser.newPage();

                const url = `https://www.handbook.unsw.edu.au${course.courseLink}`;
                console.log(`Visiting: ${url}`);

                // Navigate to the page
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
                // Wait for the required selector to ensure the page is loaded
                await page.waitForSelector('.readmore-content-wrapper', { timeout: 15000 });

                // Extract the course information
                const courseCode = await page.$eval('.css-2stwe2-styled--StyledSubheading', (element) => {
                    return element ? element.innerText : 'Description not found';
                });

                const courseTitle = await page.$eval('.css-g23dyo-styled--StyledHeading-ComponentHeading--ComponentHeading-styled--StyledHeading', (element) => {
                    return element ? element.innerText : 'Description not found';
                });

                let courseDesc;
                try {
                    courseDesc = await page.$eval('.readmore-content-wrapper p', (element) => {
                        return element ? element.innerText : 'Description not found';
                    });
                } catch {
                    courseDesc = await page.$eval('.readmore-content-wrapper', (element) => {
                        return element ? element.innerText : 'Description not found';
                    });
                }

                const courseCondition = await page.$$eval('.css-1qsu21k-Box--Box-Box-Card--Card-Card-EmptyCard--EmptyCard div.css-vobmxd-Box--Box-Box-Card--CardBody', (elements) => {
                    return elements.length > 0 ? elements[0].innerText : 'Condition not found';
                });

                // Push the course information to the results array
                courses_info.push({ courseCode, courseTitle, courseDesc, courseCondition });
                console.log(`Scraped: ${courseCode}`);

                await browser.close();
                break; // Exit the retry loop if successful

            } catch (error) {
                retries++;
                console.error(`Error scraping ${course.courseLink} (attempt ${retries}):`, error.message);

                if (browser) {
                    await browser.close();
                }

                if (retries >= maxRetries) {
                    console.error(`Failed to scrape ${course.courseLink} after ${retries} attempts. Skipping.`);
                } else {
                    console.log(`Retrying ${course.courseLink}...`);
                }
            }
        }
    }

    // Write the scraped data to a JSON file
    fs.writeFileSync('scraped_courses.json', JSON.stringify(courses_info, null, 2));
    console.log(`${courses_info.length} courses scraped successfully.`);
};

scrape();
