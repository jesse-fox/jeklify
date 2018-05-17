
var fs = require("fs");
var request = require("request");
var fm = require("front-matter");
var cheerio = require("cheerio");


// Set tool for bulk replace
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};


function Jeklify() {

  var self = this;
  self.fails = [];


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


  // Loads list of URLs and requests each
  self.convert = function() {

    //console.log("converting...");

    // start by reading the list of URLs we want
    fs.readFile(self.url_list, 'utf8', function (err,data) {

      if (err) { 
        console.error("Couldn't open URL list from " + self.url_list);
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

    // get request to website
    request(url, function (error, response, body) {

      if (error != null) {

        console.error("Failed to load " + url);
        console.error(error);
        self.fails.push[url];

      } else {

        // send html response to be saved locally
        self.save_file(url, body);

      }

    }); // request


  }; // get_site()


  // Adds frontmatter; saves in folder set in init
  self.save_file = function(url, content) {

    var slug = self.make_slug(url);
    var frontmatter = self.make_frontmatter(url, content);

    var html = frontmatter + content;

    fs.writeFile( self.folder + slug + ".html", html, function(err) {

      if(err) {

        console.error("Problem writing to " + slug + ".html");
        console.error(err);
        self.fails.push[slug];

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


  // Generate frontmatter out of HTML
  self.make_frontmatter = function(url, content) {

    // Copy permalink from url we loaded from.
    var link = url.replace(self.base_url, "");

    // Cheerio is like jQuery so we can get header tags
    var $ = cheerio.load(content);

    // Stores all header tags
    var head_content = $("head")[0].children;

    var title = $("title");
    console.log(title[0].children[0].data);

    var frontmatter = "---\n permalink: " + link + "\n";



    var data = [];
    data["meta"] = [];
    data["link"] = [];
    data["noscript"] = [];
    data["script"] = [];
    data["style"] = [];
    data["title"] = [];





    // Loop through every tag in header, store it to data[]
    var promise = new Promise(function(resolve, reject) {

      head_content.forEach(function(item) {

        if (item.name == "meta" || item.name == "link") {

          //console.log(item.type + " - " + item.name);
          data[item.name].push(item.attribs);

        } else if (item.name == "script" || item.name == "style" || item.name == "noscript") {

          var content = " ";


          if (item.children.length > 0) {
            content = item.children[0].data;
          }

          data[item.name].push({attr: item.attribs, content: content});

        }

      }); // foreach head tag

      if (true) {
        resolve(data);
      }
      else {
        reject(Error("It broke"));
      }

    }); // promise


    // Promise lets us wait until the above loop is completely finished
    promise.then(function(result) {

      result.forEach(function(header_tag) {

        //console.log(" - " + header_tag);

      });

    console.log(result); // "Stuff worked!"

  }, function(err) {
    console.log(err); // Error: "It broke"
  });   



    return frontmatter;

  };


  // Run init when new object is created
  self.init();

}

var converter = new Jeklify();
