import express from 'express';
import axios from 'axios';
import { DownloaderHelper } from 'node-downloader-helper';
import urlExist from 'url-exist';
import fs from 'fs';
const app = express();

// Make a request for a user with a given ID

var shoes = [];
var notFetched = [];
var downloaded = [];
var shoesNewDownload = [];

app.get('/getShoes', async (req, res) => {
  fs.readFile('./downloaded.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    let shoeList = data.split('\n');
    shoeList.forEach((element) => {
      downloaded.push(element);
    });
    console.log(downloaded);
  });

  axios
    .get('https://api.thrillerme.com/shoes', { timeout: 0 })
    .then(async (response) => {
      // handle success
      response.data.forEach(async (element) => {
        let id = element.shoe_id;
        let img_link = element.cover_image;
        let img_name = element.cover_image.split('/')[5];
        // console.log(downloaded.indexOf(img_name));

        if (downloaded.indexOf(img_name) === -1) {
          let exist = await urlExist(img_link);
          const pathOne = `./downloads/${img_name}`;
          fs.access(pathOne, fs.F_OK, (err) => {
            if (err) {
              // console.error(err);
              return;
            }
            //exist
            try {
              fs.unlinkSync(pathOne);
              //file removed
            } catch (err) {
              // console.error(err);
            }
          });
          if (exist) {
            shoes.push({
              shoe_id: id,
              img: img_name,
              link: img_link,
            });
            const dl = new DownloaderHelper(`${img_link}`, `./downloads`, {
              retry: { maxRetries: 3, delay: 1000 }, // { maxRetries: number, delay: number in ms } or false to disable (default)
              // forceResume: false, // If the server does not return the "accept-ranges" header, can be force if it does support it
              fileName: `${img_name}`,
              removeOnStop: true, // remove the file when is stopped (default:true)
              removeOnFail: true,
            });
            dl.on('end', () => {
              fs.appendFileSync('./downloaded.txt', `${img_name}\n`);
              console.log('Download Completed');
            });
            dl.start();
          }
        }
      });
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
});

app.listen(5000, console.log('running'));
