const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const md5 = require('md5');
const htmlToPdf = require('html-pdf');

const AppContanst = require('../app.constants');

const {
  AUN_SAR,
  AUN_CRITERION,
  AUN_SUB_CRITERION,
  AUN_REVERSION
} = require('../models');

const createPdf = (html, fileName) => {
  const totalSeconds = Math.floor(new Date().getTime() / 1000);
  const hashName = md5(fileName + totalSeconds) + '.pdf';
  const appPath = path.normalize(__dirname + '/..');
  const uploadPath = appPath + '/storage/' + hashName;
  const linkFile = '/storage/' + hashName;

  return new Promise((resolve, reject) => {
    htmlToPdf
      .create(html, {
        format: 'A2',
        border: {
          top: '0.5cm',
          right: '2.5cm',
          bottom: '0.5cm',
          left: '2.5cm'
        },
        paginationOffset: 1, // Override the initial pagination number
        header: {
          height: '2cm',
          contents: `<div style="text-align: center;">${fileName}</div>`
        },
        footer: {
          height: '2cm',
          contents: {
            default:
              '<div style="width: 100%; text-align: center"><span style="color: #444">Page {{page}}</span>/<span>{{pages}}</span></div>' // fallback value
          }
        }
      })
      .toFile(uploadPath, function(err, res) {
        if (err) reject(err);
        else resolve(linkFile);
      });
  });
};

const createPdfNew = async (html, fileName) => {
  const totalSeconds = Math.floor(new Date().getTime() / 1000);
  const hashName = md5(fileName + totalSeconds) + '.pdf';
  const appPath = path.normalize(__dirname + '/..');
  const uploadPath = appPath + '/storage/' + hashName;
  const linkFile = '/storage/' + hashName;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // await page.goto('https://blog.risingstack.com', {
  //   waitUntil: 'networkidle0'
  // });
  await page.setContent(html);
  const pdf = await page.pdf({
    path: uploadPath,
    format: 'A4',
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 10px; text-align: center; margin: 0 auto;">${fileName}<div/>`,
    footerTemplate: `<div style="font-size: 10px; text-align: center; margin: 0 auto;">Page <span class='pageNumber'></span> / <span class='totalPages'></span></div>`,
    margin: {
      top: '100px',
      bottom: '100px',
      right: '100px',
      left: '100px'
    }
  });

  await browser.close();

  return linkFile;
};

const extractReversionToPdf = async ReversionId => {
  const SAR = await AUN_SAR.findOne({
    attributes: ['name'],
    include: [
      {
        model: AUN_REVERSION,
        as: 'Reversions',
        where: {
          id: ReversionId
        }
      }
    ]
  });

  let htmlTemplate = fs.readFileSync(
    path.join(__dirname, 'html_template.html'),
    'utf8'
  );

  let content = '';

  const criterions = await AUN_CRITERION.findAll({
    where: {
      ReversionId: ReversionId
    }
  });

  for (let i = 0, iMax = +_.get(criterions, 'length'); i < iMax; i++) {
    const criterion = criterions[i];
    content += `<h2>${i + 1}. ${criterion.name}</h2>`;

    const subCriterions = await AUN_SUB_CRITERION.findAll({
      where: {
        CriterionId: criterion.id
      }
    });

    for (let j = 0, jMax = +_.get(subCriterions, 'length'); j < jMax; j++) {
      const subCriterion = subCriterions[j];

      content += `<h4>${j + 1}. ${subCriterion.name}</h4>`;
      content += subCriterion.content;
    }
  }

  content = _.replace(content, /strong>/g, 'b>');

  const finalHtml = _.replace(htmlTemplate, 'PLACE_TO_REPLACE', content);
  // return await createPdf(finalHtml, SAR.name);
  return await createPdfNew(finalHtml, SAR.name);
};

module.exports = {
  extractReversionToPdf
};
