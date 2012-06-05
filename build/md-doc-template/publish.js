var SECTIONS = ["description", "configuration", "methods", "events"];

function publish(symbolSet) {
    var symbols = symbolSet.toArray();
    var classes = symbols.filter(isaClass).sort(makeSortby("alias"));

    classes.forEach(processClass);
}

function processClass(theClass) {
    theClass.events = theClass.getEvents();   // 1 order matters
    theClass.methods = theClass.getMethods(); // 2

    var description = theClass.properties.filter(function(x) { return x._name == "Description"; })[0];
    var html = "";

    if (description) {
        html += '## Description\n\n' +
        outputDescription(description.comment).replace(/\r/g, "\n");
    }

    html += theClass.alias.toLowerCase() + ".description.md",
        "\n\n------------------------------------------\n\n" +
        '## Configuration\n\n' +
        outputConfiguration(theClass) +
        "\n\n------------------------------------------\n\n" +
        '## Methods\n\n' +
        outputMethods(theClass).replace(/\r/g, "\n") +
        "\n\n------------------------------------------\n\n" +
        '## Events\n\n' +
        outputEvents(theClass).replace(/\r/g, "\n");

    IO.saveFile( "/tmp", html);
}

function isaClass($) {
    return (($.is("CONSTRUCTOR") || $.isNamespace) &&
    ($.alias != "_global_" || !JSDOC.opt.D.noGlobal))
}

function makeSortby(attribute) {
    return function(a, b) {
        if (a[attribute] != undefined && b[attribute] != undefined) {
            a = a[attribute].toLowerCase();
            b = b[attribute].toLowerCase();
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        }
    }
}
function toCodeBlock(string) {
    return "\n\n    " + string.replace(/\r/g, "\n    ") + "\n\n";

}

// custom output for descriptions -- enables titled code examples and multiple text sections
function outputDescription(description) {
    var hasTitle = false,
        output = "";

    for (var i in description.tags) {
        var tag = description.tags[i];

        switch (tag.title) {
            case "exampleTitle":
                hasTitle = true;
                output += "\n#### " + toMarkdown(tag.desc);
            break;

            case "example":
                if (!hasTitle) {
                    output += "\n#### Example";
                }

                output += toCodeBlock(tag.desc);
                hasTitle = false;
            break;

            case "param":
            break;

            case "return":
            break;

            case "section":
            default:
                output += "\n" + toMarkdown(tag.desc) + "\n";
            break;
        }
    }

    return output;
}
/////// Configuration

    function outputConfiguration(data) {
    var ownOptions = data.comment.getTag("option")
        exampleTitleRe = /^[\r\n]?_exampleTitle(.*)/i,
        exampleRe = /[\r\n]?_example(([\r\n]|.)*)/i;

    if (defined(ownOptions) && ownOptions.length) {
        ownOptions.forEach(function (value, idx) {
            var description = /\[([^\]]*)\]/i.exec(ownOptions[idx].desc);
            description && (ownOptions[idx].name = description[1]);

            var defaultValue = /]\s*\<(.*)\>/i.exec(ownOptions[idx].desc);
            defaultValue && (ownOptions[idx].defaultValue = defaultValue[1]);

            ownOptions[idx].desc = ownOptions[idx].desc.replace(/^(\[[^\]]*\])?\s*(\<[^\>]*\>)?/i, "");
            ownOptions[idx].isOptional = true;

            // extract examples and example titles from option descriptions
            var description = ownOptions[idx].desc,
                examples = [],
                exampleTitles = [];

            function extractExamples(content) {
                var allExamples = exampleRe.exec(content);

                if (allExamples) {
                    exampleTitle = exampleTitleRe.exec(allExamples);

                    if (exampleTitle) {
                        exampleTitle = exampleTitle[1];
                        allExamples = exampleRe.exec(allExamples[0].replace(exampleTitleRe, "").trim());
                    } else {
                        exampleTitle = "Example";
                    }

                    exampleTitles.push(exampleTitle);

                    if (exampleRe.test(allExamples[1])) {
                        examples.push(allExamples[1].substring(0, allExamples[1].indexOf("_example")).trim());
                        extractExamples(allExamples[1]);
                    } else {
                        examples.push(allExamples[1].trim());
                    }
                }
            }

            extractExamples(description);

            ownOptions[idx].desc = description.replace(exampleRe, "");
            ownOptions[idx].example = examples;
            ownOptions[idx].exampleTitle = exampleTitles;
        });

        ownOptions.sort(makeSortby("name"));

        var rootOptions = [];

        // add suboptions and determine root-level options
        for (var i = 0; i < ownOptions.length; i++) {
            var currentOption = ownOptions[i],
                currentOptionName = currentOption.name,
                subOptions = [];

            for (var j = i+1; j < ownOptions.length; j++) {
                var name = ownOptions[j].name;

                if (name.indexOf(currentOptionName + ".") == 0 && name.substring(currentOptionName.length + 1).indexOf('.') < 0) {
                    subOptions.push(ownOptions[j]);
                }
            }

            if (subOptions.length) {
                currentOption.subOptions = subOptions;
            }

            if (currentOptionName.indexOf(".") < 0) {
                rootOptions.push(currentOption);
            }
        }

        ownOptions = rootOptions;

        // remove prefixes of suboptions

        function removeRedundantPrefixes(options, containerName) {
            for (var i = 0; i < options.length; i++) {
                if (containerName && options[i].name.indexOf(containerName) == 0) {
                    options[i].name = options[i].name.substring(containerName.length);
                }

                if (options[i].subOptions) {
                    removeRedundantPrefixes(options[i].subOptions, containerName + options[i].name + ".");
                }
            }
        }

        // removeRedundantPrefixes(ownOptions, "");
    }

    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    (function(){
      var cache = {};

      this.tmpl = function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
          cache[str] = cache[str] ||
            tmpl(document.getElementById(str).innerHTML) :

          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

            // Convert the template into pure JavaScript
            str
              .replace(/\n/g, "\\n")
              .replace(/[\r\t\n]/g, " ")
              .split("<%").join("\t")
              .replace(/((^|%>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split("\t").join("');")
              .split("%>").join("p.push('")
              .split("\r").join("\\'")
          + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
      };
    })();


    function extend() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== "object" && !jQuery.isFunction(target)) {
            target = {};
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && jQuery.isArray(src) ? src : [];
                        } else {
                            clone = src && jQuery.isPlainObject(src) ? src : {};
                        }
                        target[name] = jQuery.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }


    var optionsTemplate = tmpl(
            '### `<%= name %>` ' +
            "<%= type ? ': **' + type + '**'  : '' %> " +
            "<%= defaultValue ? '*(default: ' + defaultValue + ')*' : '' %> \n\n" +
            "<%= desc %>\n\n" +
            '<% for (var exampleIdx = 0; typeof example != "undefined" && exampleIdx < example.length; exampleIdx++) { %>' +
                    "#### Example\n\n" +
                    "<%= toCodeBlock(example[exampleIdx]) %>" +
            '<% } %>' +
            '<%= typeof subOptions != "undefined" ? renderChildOptions(subOptions) : "" %>'
    );

    function renderOptions (options) {
        var html = "";

        for (var i in options) {
            html += optionsTemplate(extend({
                renderChildOptions: renderOptions
            }, options[i]));
        }

        return html;
    }

    if (defined(ownOptions) && ownOptions.length) {
        return renderOptions(ownOptions);
    } else {
        return "";
    }
}

////// Configuration end
//
//
//
///// Methods
function outputMethods(data) {
    var ownMethods = data.methods.filter(function($){return $.memberOf == data.alias  && !$.isNamespace}).sort(makeSortby("name"));
    var html = "";

    if (defined(ownMethods) && ownMethods.length) {
        for (var i = 0; i < ownMethods.length; i ++) {
            var member = ownMethods[i];
            html += "### `" + member.name.replace(/\^\d+$/, '') + "`" + makeSignature(member.params)

           if (member.type) {
               html += "`" + member.type + "`";
           }
           html += "\n\n";
           html += outputDescription(member.comment);

           if (member.params.length) {
               html += "#### Parameters \n\n"

               for (var j = 0; j < member.params.length; j ++) {
                   var item = member.params[j];
                   html += "##### " + item.name + " `" + item.type + "`\n\n";
                   if (item.isOptional) {
                       html += "_optional, default: " + item.defaultValue + "_\n\n";
                   }

                   html += toMarkdown(item.desc) + "\n\n";
               }
           }

           if (member.returns.length) {
               var item = member.returns[0];
               html += "#### Returns \n\n"
               html += "`" + item.type + "` " + item.desc + "\n\n";
           }
        }
    }

    return html;
}


function outputEvents(data) {
     var ownEvents = data.events.filter(function($){return !$.isNamespace}).sort(makeSortby("name"));
     var html = "";

    if (defined(ownEvents) && ownEvents.length) {
        for (var i = 0; i < ownEvents.length; i ++) {
            var member = ownEvents[i];
            html += "### `" + member.name + "`"
            html += outputDescription(member.comment)
            if (member.params.length > 1) {

               html += "#### Event Data \n\n"
               member.params.forEach(function(item) {
                   if (item.name === "e") {
                       return;
                   }

                   html += "##### " + item.name + " `" + item.type + "`\n\n";
                   if (item.isOptional) {
                       html += "_optional, default: " + item.defaultValue + "_\n\n";
                   }

                   html += toMarkdown(item.desc) + "\n\n";
               });
            }
        }
    }

    return html;
}

/** Build output for displaying function parameters. */
function makeSignature(params) {
    if (!params) return "()";
    var signature = "("
    +
    params.filter(
        function($) {
            return $.name.indexOf(".") == -1; // don't show config params in signature
        }
    ).map(
        function($) {
            return $.name;
        }
    ).join(", ")
    +
    ")";
    return signature;
}

// to-markdown npm module
var toMarkdown = function(string) {

  var ELEMENTS = [
    {
      patterns: 'p',
      replacement: function(str, attrs, innerHTML) {
        return innerHTML ? '\n\n' + innerHTML + '\n' : '';
      }
    },
    {
      patterns: 'br',
      type: 'void',
      replacement: '\n'
    },
    {
      patterns: 'h([1-6])',
      replacement: function(str, hLevel, attrs, innerHTML) {
        var hPrefix = '';
        for(var i = 0; i < hLevel; i++) {
          hPrefix += '#';
        }
        return '\n\n' + hPrefix + ' ' + innerHTML + '\n';
      }
    },
    {
      patterns: 'hr',
      type: 'void',
      replacement: '\n\n* * *\n'
    },
    {
      patterns: 'a',
      replacement: function(str, attrs, innerHTML) {
        var href = attrs.match(attrRegExp('href')),
            title = attrs.match(attrRegExp('title'));
        return href ? '[' + innerHTML + ']' + '(' + href[1] + (title && title[1] ? ' "' + title[1] + '"' : '') + ')' : str;
      }
    },
    {
      patterns: ['b', 'strong'],
      replacement: function(str, attrs, innerHTML) {
        return innerHTML ? '**' + innerHTML + '**' : '';
      }
    },
    {
      patterns: ['i', 'em'],
      replacement: function(str, attrs, innerHTML) {
        return innerHTML ? '_' + innerHTML + '_' : '';
      }
    },
    {
      patterns: 'code',
      replacement: function(str, attrs, innerHTML) {
        return innerHTML ? '`' + innerHTML + '`' : '';
      }
    },
    {
      patterns: 'img',
      type: 'void',
      replacement: function(str, attrs, innerHTML) {
        var src = attrs.match(attrRegExp('src')),
            alt = attrs.match(attrRegExp('alt')),
            title = attrs.match(attrRegExp('title'));
        return '![' + (alt && alt[1] ? alt[1] : '') + ']' + '(' + src[1] + (title && title[1] ? ' "' + title[1] + '"' : '') + ')';
      }
    }
  ];

  for(var i = 0, len = ELEMENTS.length; i < len; i++) {
    if(typeof ELEMENTS[i].patterns === 'string') {
      string = replaceEls(string, { tag: ELEMENTS[i].patterns, replacement: ELEMENTS[i].replacement, type:  ELEMENTS[i].type });
    }
    else {
      for(var j = 0, pLen = ELEMENTS[i].patterns.length; j < pLen; j++) {
        string = replaceEls(string, { tag: ELEMENTS[i].patterns[j], replacement: ELEMENTS[i].replacement, type:  ELEMENTS[i].type });
      }
    }
  }

  function replaceEls(html, elProperties) {
    var pattern = elProperties.type === 'void' ? '<' + elProperties.tag + '\\b([^>]*)\\/?>' : '<' + elProperties.tag + '\\b([^>]*)>([\\s\\S]*?)<\\/' + elProperties.tag + '>',
        regex = new RegExp(pattern, 'gi'),
        markdown = '';
    if(typeof elProperties.replacement === 'string') {
      markdown = html.replace(regex, elProperties.replacement);
    }
    else {
      markdown = html.replace(regex, function(str, p1, p2, p3) {
        return elProperties.replacement.call(this, str, p1, p2, p3);
      });
    }
    return markdown;
  }

  function attrRegExp(attr) {
    return new RegExp(attr + '\\s*=\\s*["\']?([^"\']*)["\']?', 'i');
  }

  // Pre code blocks

  string = string.replace(/<pre\b[^>]*>`([\s\S]*)`<\/pre>/gi, function(str, innerHTML) {
    innerHTML = innerHTML.replace(/^\t+/g, '  '); // convert tabs to spaces (you know it makes sense)
    innerHTML = innerHTML.replace(/\n/g, '\n    ');
    return '\n\n    ' + innerHTML + '\n';
  });

  // Lists

  // Escape numbers that could trigger an ol
  string = string.replace(/(\d+)\. /g, '$1\\. ');

  // Converts lists that have no child lists (of same type) first, then works it's way up
  var noChildrenRegex = /<(ul|ol)\b[^>]*>(?:(?!<ul|<ol)[\s\S])*?<\/\1>/gi;
  while(string.match(noChildrenRegex)) {
    string = string.replace(noChildrenRegex, function(str) {
      return replaceLists(str);
    });
  }

  function replaceLists(html) {

    html = html.replace(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi, function(str, listType, innerHTML) {
      var lis = innerHTML.split('</li>');
      lis.splice(lis.length - 1, 1);

      for(i = 0, len = lis.length; i < len; i++) {
        if(lis[i]) {
          var prefix = (listType === 'ol') ? (i + 1) + ".  " : "*   ";
          lis[i] = lis[i].replace(/\s*<li[^>]*>([\s\S]*)/i, function(str, innerHTML) {

            innerHTML = innerHTML.replace(/^\s+/, '');
            innerHTML = innerHTML.replace(/\n\n/g, '\n\n    ');
            // indent nested lists
            innerHTML = innerHTML.replace(/\n([ ]*)+(\*|\d+\.) /g, '\n$1    $2 ');
            return prefix + innerHTML;
          });
        }
      }
      return lis.join('\n');
    });
    return '\n\n' + html.replace(/[ \t]+\n|\s+$/g, '');
  }

  // Blockquotes
  var deepest = /<blockquote\b[^>]*>((?:(?!<blockquote)[\s\S])*?)<\/blockquote>/gi;
  while(string.match(deepest)) {
    string = string.replace(deepest, function(str) {
      return replaceBlockquotes(str);
    });
  }

  function replaceBlockquotes(html) {
    html = html.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, function(str, inner) {
      inner = inner.replace(/^\s+|\s+$/g, '');
      inner = cleanUp(inner);
      inner = inner.replace(/^/gm, '> ');
      inner = inner.replace(/^(>([ \t]{2,}>)+)/gm, '> >');
      return inner;
    });
    return html;
  }

  function cleanUp(string) {
    string = string.replace(/^[\t\r\n]+|[\t\r\n]+$/g, ''); // trim leading/trailing whitespace
    string = string.replace(/\n\s+\n/g, '\n\n');
    string = string.replace(/\n{3,}/g, '\n\n'); // limit consecutive linebreaks to 2
    return string;
  }

  return cleanUp(string);
};
