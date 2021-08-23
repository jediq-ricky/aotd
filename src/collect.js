const axios = require("axios");
const https = require("https");
const fs = require("fs");
const Path = require("path");

var albums = JSON.parse(fs.readFileSync(Path.resolve(__dirname, "albums.json")));

(async () => {
  console.log("Collecting...");

  var token =
    "BQCTdkjQXBahMiWhHG5BT7jEYEpY3AxWBIh2FyrTn-VH0owwQsD-eCpRz_uOA99qSXX107dbu-jaeqORCqMahTXmZaMgNzz1dOgOsjOz7b3eYHyFk9p85PIgpirxsmEKamkIu-pk0sCIN2QbMXRtFr4ZqjkZlDdalYbZpL_2B5I_6YeaJ9mXvkMrzcz_Mw78wouKBfobEMTlsRCg2zqTQwzDxcs";

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  for (var album of albums) {
    var fileName = (album.artist + " " + album.name).replaceAll(" ", "_").replaceAll("?", "") + ".jpg";
    const path = Path.resolve(__dirname, "artwork", fileName);

    if (!fs.existsSync(path)) {
      var q = (album.artist + " " + album.name).replaceAll(" ", "%20");
      var searchUrl = "https://api.spotify.com/v1/search?type=album&q=" + q;
      try {
        const response = await axios.get(searchUrl, {
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          httpsAgent,
        });
        if (response.data.albums.items[0]) {
          // we've found a match
          var imageUrl = response.data.albums.items[0].images[0].url;
          const writer = fs.createWriteStream(path);

          const imageResponse = await axios.get(imageUrl, {
            responseType: "stream",
            httpsAgent,
          });

          imageResponse.data.pipe(writer);
          console.log(`saving ${imageUrl} to ${path}`);
        } else {
          console.log(`no result for ${fileName}`);
        }
      } catch (error) {
        console.log("ERROR : " + error);
      }
    }
  }
})();
