# jeklify

`npm install` to install


## How to do the thing

1. Make a list of every page on a website (eg with screaming frog), seperated by new lines.

	- List must be only to the pages, no assets or external links
	- Avoid having duplicates, either by different protocol or with/without trailing slash
	
2. Edit script convert.js function init to point to your list, and give it the base url of your site.


3. `node convert.js` will start it running, default output is to \_pages/

----------

That's it for the converter. Other steps for putting together website:

4. Drag created folder into your Jekyll project, update config as relevant.

5. You may want to clean the data a little. A handy regex to replace is `\n?.*searchitem?.*\n` replace with `\n` - this will delete the entire line containing, for example `wp-emoji-release`

6. Copy all used assets from live site into your project. The easiest way to do this is create a list of all assets using screaming frog and save it in a text, then from the command line run `wget -x --force-directories -i list.txt` it will copy the directories as well.




## Gotchas

Weird problems you might run into and what to do about them.

 - Any asset files with a ? or # will cause netlify to fail to build. e.g. pagenavi-css.css?ver=2.70 to fix, just remove them and everything after, then do a find and replace in your files to update them.

 - the conversion will currently fail if there's unexpected input, such as a blank line
 
 ## Thanks

Thank you to BrowserStack for providing free testing for this project, just for being open source!

[![BrowserStack](https://p14.zdusercontent.com/attachment/1015988/GUkfUIWmSJA8PkfOpV5Jg02Ty?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..2JseB2oj6vb-gC3z-8rcCA.ji4qg7PlM8C678v3YYieZEG6itZ4DwUsuHJ2Y_UVZ7zxj0YekNoOX9BvNWPz80XJIVA6vub0BdK6zptRf2xLtVR4AayiqRFTyHiMgxm93XopnHzSEi1QYB3NnJg9T8cDORRKdAtOTMb6qrvsIhHG-M3516CGIqtfo012qJHXg2eV_1zeuXwELcGuzZVgujwCTOhC_HMsykCtPSmFza85Iq9YkmRuL_Yqk2vPkayoJRUcwQTakB6z2s8GcnY5fdwn1igu19Ri8vkdzKdXR0OT2x765PZ-X_4U79RG5tDHUiY.xtovmUCGVDe2Sgp3qlr1mw)](https://www.browserstack.com/)

