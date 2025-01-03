import puppeteer from "puppeteer";
import fs from "fs";

const scrape = async () => {
    const browser = await puppeteer.launch({headless: false, defaultViewport: null});
    const page = await browser.newPage();

    const url = 'https://www.handbook.unsw.edu.au/search?educationalArea=COMP&ct=subject&studyLevelValue=ugrd';
    await page.goto(url);

    // Ensure the selector exists before scraping
    await page.waitForSelector('.css-1iyxmyz-Box--Box-Box-Flex--Flex-Flex-results-styles--ResultItemContainer');

    // Create or clear the output file
    fs.writeFileSync('scrapedContent.txt', '');


    const nextButtonSelector = '#pagination-page-next';

    console.log("before while")
    let count = 1
    while (count <= 5) {
        // Get the current page content

        console.log("After while")
        const content = await page.content();

        // Append the content to the file
        fs.appendFileSync('scrapedContent.txt', content);

        console.log('Page scraped and content appended to scrapedContent.txt');
        
        await page.click(nextButtonSelector)
        await page.waitForSelector('.css-1iyxmyz-Box--Box-Box-Flex--Flex-Flex-results-styles--ResultItemContainer');
        count += 1;
    }

    console.log('All pages scraped and saved to scrapedContent.txt');

    await browser.close();
};

scrape();
