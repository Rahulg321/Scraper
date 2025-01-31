import * as cheerio from 'cheerio';
import * as XLSX from 'xlsx';


type Article ={
    title:string,
    link:string | undefined,
    description:string,
    page:number
}


type Post = {
    title: string;
    link: string | undefined;
    description: string;


}


async function scrapeWebsite(url:string) {
  try {
    // Fetch the HTML content of the website
    console.log(`Fetching content from ${url}...`);
    const response = await fetch(url);
    const html = await response.text();
    // Parse the HTML using cheerio
    const $ = cheerio.load(html);

   // Find all articles with class "teaser1"
   const articles = $('article.teaser1');

   console.log(`Found ${articles.length} articles.`);
   const articleData:Article[] = [];


   articles.each((index, element) => {
     const article = $(element);
     const title = article.find('h4.teaser1-title a').text().trim();
     const link = article.find('h4.teaser1-title a').attr('href');
     const description = article.find('.teaser1-description').text().trim();

     articleData.push({ title, link, description, page: index + 1 });

     console.log(`\nArticle ${index + 1}:`);
     console.log(`Title: ${title}`);
     console.log(`Link: ${link}`);
     console.log(`Description: ${description.substring(0, 150)}...`);
   });

   return articleData;

  } catch (error) {
    console.error('Error:', error);
  }
}

function createExcelSheet(data:Article[], filename:string) {
    // Create a new workbook and add a worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Articles");

    // Write the workbook to a file
    XLSX.writeFile(workbook, filename);

    console.log(`Excel file '${filename}' has been created.`);
  }

  async function scrapeAndSave(pageNumber: number) {
    const url = `https://www.axial.net/forum/companies/united-states-m-a-advisory-firms/${pageNumber}`;
    const articles = await scrapeWebsite(url);

    if(articles === undefined){
        throw new Error('No articles found');
    }

    if (articles.length > 0) {
      createExcelSheet(articles, `articles_page_${pageNumber}.xlsx`);
    } else {
      console.log(`No articles found on page ${pageNumber}.`);
    }
}

async function scrapeWebsite1(url: string, pageNumber: number) {
    try {
      console.log(`Fetching content from ${url}...`);
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      const articles = $('article.teaser1');

      console.log(`Found ${articles.length} articles on page ${pageNumber}.`);
      const articleData: Article[] = [];

      articles.each((index, element) => {
        const article = $(element);
        const title = article.find('h4.teaser1-title a').text().trim();
        const link = article.find('h4.teaser1-title a').attr('href');
        const description = article.find('.teaser1-description').text().trim();

        articleData.push({ title, link, description, page: pageNumber });

        console.log(`\nArticle ${index + 1}:`);
        console.log(`Title: ${title}`);
        console.log(`Link: ${link}`);
        console.log(`Description: ${description.substring(0, 150)}...`);
      });

      return articleData;

    } catch (error) {
      console.error(`Error on page ${pageNumber}:`, error);
      return [];
    }
  }



  async function main() {
    // for (let i = 3; i <= 30; i++) {
    //     console.log(`Processing page ${i}`);
    //     await scrapeAndSave(i);

    //     // Add a delay to avoid overwhelming the server
    //     await new Promise(resolve => setTimeout(resolve, 2000));
    // }
  }

  main().then(() => console.log('Done!')).catch(error => console.error('Error:', error));
