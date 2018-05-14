var fs = require("fs");
var request = require("request");

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


function Jeklify() {

  var self = this;

  // Config for converter goes here
  self.init = function() {

    //console.log("Starting programme");

    self.folder = "./website/";

    self.base_url = "http://www.poppy-opossum.com";
    self.url_list = "./list.txt";

    // make sure folder exists before trying to use it
    if ( !fs.existsSync(self.folder) ) {
      fs.mkdirSync(self.folder);
    }

    // start conversion after set up is ready
    self.convert();

  }; // init()


  self.convert = function() {

    //console.log("converting...");

    // start by reading the list of URLs we want
    fs.readFile(self.url_list, 'utf8', function (err,data) {

      if (err) { 
        console.error(err);
      } else {

        // Each URL on a new line
        var url_array = data.split("\n");

        url_array.forEach(function(current_url) {

          // Send URL to be fetched & processed
          self.get_site(current_url);

        }); //forEach url

      } // if not err

    }); // readfile


  }; // convert()


  // load page from web
  self.get_site = function(url) {

    request(url, function (error, response, body) {

      if (error != null) {
        console.error("Error trying to save site");
        console.error(error);
      } else {

        // send html response to be saved locally
        self.save_file(url, body);

      }

    }); // request


  }; // get_site()


  // Adds frontmatter; saves in folder set in init
  self.save_file = function(url, content) {

    var slug = self.make_slug(url);

    var link = url.replace(self.base_url, "");
    var frontmatter = "---\n permalink: " + link + "\n---\n";

    var html = frontmatter + content;

    fs.writeFile( self.folder + slug + ".html", html, function(err) {
      if(err) {
        return console.log(err);
      } else {
        console.log("Saved: " + slug);
      }

    }); 


  }; // save_file();


  // turns the url into a filename
  self.make_slug = function(url) {

    // Get slug by removing base URL
    var slug = url.replace(self.base_url, "");

    slug = decodeURIComponent(slug);

    // replace / and space with - (permalinks handled with frontmatter)
    slug = slug.replaceAll("/", "-");
    slug = slug.replaceAll(" ", "-");

    // remove trailing slash, .html
    slug = slug.replace(/\/$/, "");
    slug = slug.replace(/-$/, "");
    slug = slug.replace(".html", "");

    // remove preceding -
    slug = slug.replace(/^-/, "");

    if (slug == "") {
      slug = "index";
    }


    return slug;

  }; // make_slug()


  // Run init when new object is created
  self.init();

}

var converter = new Jeklify();
