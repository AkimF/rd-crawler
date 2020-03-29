const puppeteer = require("puppeteer");
const download = require("image-downloader");
const fs = require("fs");

const baseUrl = "http://dblz.kmrd.cn/Public/wechat/repository/";

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  const data = [];

  for (let i = 108; i > 104; i--) {
    const pageUrl = `${baseUrl}page2.html?organizeId=6&mettingId=2&teamId=${i}`;
    await page.goto(pageUrl);
    await page.waitForSelector("#team > a");
    const peoples = await page.evaluate(baseUrl => {
      const list = document.querySelectorAll("#team > a");
      const res = [];
      for (let item of list) {
        res.push(item.hasAttribute("href") && item.getAttribute("href"));
      }
      return res.map(x => baseUrl + x);
    }, baseUrl);

    for await (let j of peoples) {
      console.log(j);
      await page.goto(j);
      await page.waitFor(1000);
      const name = await page.$eval("#userName", el => el.textContent);
      const birthplace = await page.$eval(
        "#userBirthplace",
        el => el.textContent
      );
      const education = await page.$eval(
        "#userEducation",
        el => el.textContent
      );
      const work = await page.$eval("#userWork", el => el.textContent);
      const img = await page.$eval("#userImg", el => el.src);
      await download.image({ url: img, dest: "./imgs2/" });
      data.push({
        name,
        birthplace,
        education,
        work,
        img,
        extractFilename: false
      });
      console.log(data[data.length - 1]);
    }
  }
  fs.writeFileSync("data2.json", JSON.stringify(data));
})();
