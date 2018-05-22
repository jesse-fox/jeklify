
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

    self.folder = "./_pages/";

    self.base_url = "http://www.personalloans.org";
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

    //console.info("Fetching " + url);

    // get request to website
    request(encodeURI(url), function (error, response, body) {

      if (error != null) {

        console.error("Failed to load " + url);
        console.info("Error: ");
        console.error(error);
        console.info("response: ");
        console.error(response);

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
    //var page = self.prepare_page(content);

    var html = frontmatter + content;

    fs.writeFile( self.folder + slug + ".html", html, function(err) {

      if(err) {

        console.error("Problem writing to " + slug + ".html");
        console.error(err);
        self.fails.push[slug];

      } else {
        //console.log("Saved: " + slug);
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

    // Cheerio is like jQuery so we can get header tags
    var $ = cheerio.load(content);


    // Stores all header tags
    var head_content = $("head")[0].children;
    var head_data = self.gather_fm_data(head_content);

    if (head_data == undefined) {
      console.error("Undefined header data on " + url);
      return "---\n";
    }

    //var head_fm = self.format_fm_data(head_data);

    // Get title if it exists.
    var title = "";
    var $title = $("title");

    if ( $title && $title[0].children ) {
      var title = JSON.stringify($title[0].children[0].data);
      // a ":" will break frontmatter in title.
      title = title.replace(":", "&#58;");
    }

    // Copy permalink from url we loaded from.
    var link = url.replace(self.base_url, "");

 
    // Glue it all together
    var frontmatter = "---\n";
    frontmatter += "permalink: " + link + "\n";
    frontmatter += "title: " + title + "\n";
    //frontmatter += "head: \n";
    //frontmatter += head_fm;
    frontmatter += "---\n";

    return frontmatter;

  }; // make_frontmatter


  // Go through everything in a header and store it in a var
  self.gather_fm_data = function(header_tags) {

    // Set up var to hold exact data we want
    var data = [];
    data["meta"] = [];
    data["link"] = [];
    data["noscript"] = [];
    data["script"] = [];
    data["style"] = [];
    data["title"] = [];


    for (var i = 0; i < header_tags.length; i++) {

      var item = header_tags[i];

      // Only work with these kinds of tags.
      if (item.name == "meta" || 
          item.name == "link" ||
          item.name == "script" || 
          item.name == "style" || 
          item.name == "noscript"
      ) {

        var content = "";


        if (item.children.length > 0) {
          content = item.children[0].data;
        }

        data[item.name].push({attr: item.attribs, content: content});

      } // if (tag type)

      // Don't return until each item has been gone through
      if (i == header_tags.length-1) {
        //console.log(data);
        return data;
      }

    } // for


  }; // gather_fm_data


  // add ' - ' indentation levels
  self.format_fm_data = function(data) {

    var frontmatter = "";
    var counter = 0;
    var total = 0;

    // Kinda ugly but not sure how else.
    if (data["link"]) total += data["link"].length;
    if (data["meta"]) total += data["meta"].length;
    if (data["script"]) total += data["script"].length;
    if (data["style"]) total += data["style"].length;
    if (data["noscript"]) total += data["noscript"].length;


    for (var type in data) {

      frontmatter += " - " + type + ":\n";

      for (var i = 0; i < data[type].length; i++) {

        counter++;

        var item = data[type][i];

        frontmatter += "    - " + JSON.stringify(item) + "\n";


      } // for data[type]

      if (counter == total) {
        return frontmatter;
      }

    } // for types


  }; // format_fm_data


  self.prepare_page = function(content) {

    // Remove everything up to </head>
    var page = content.substr(content.toLowerCase().indexOf("</head>")+7);

    page = page.replace("</body>", "");
    page = page.replace("</html>", "");

    return page;

  }

  // Run init when new object is created
  self.init();

} // Jeklify

var converter = new Jeklify();
