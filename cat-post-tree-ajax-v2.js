/*
 * url2click function was used upon
 * document loading to find current category or post and
 * fetch relevant menu item content, and expand that menu item.
 * Since current category/post is expanded on the server
 * there is no more need for that functionality, and therefore
 * it is not used. Left it only for reference.
 */
function url2click()
{
  var pathArray = ((/\/(.+)\//.exec(window.location.pathname))[1]).split('/');
  var selector = '';
  var context = '';
  var catitem = '';
  if (pathArray[1] == null) {
    return;
  }

  if (pathArray[1] == 'category') {
    selector = "'a[href*='" + pathArray[2] + "']'";
    context = "#rightcol li.CatPostAjaxTree"
    jQuery(selector, context).next().trigger('click', 'nohuman');
  } else {
    selector = pathArray[1];
    url = CatPostAjax.ajaxurl + '?action=myajax-submit&post=' + selector;
    var subid = 'id';
    res = jQuery.ajax({
      url : url,
      async : false
    }).responseText;
    catpost = res.split('-');
    catitem = '.cat-item-' + catpost[0];
    jQuery(catitem).trigger('click', 'nohuman');

    setTimeout(function()
    {
      link = "a.di_" + catpost[0] + "_" + catpost[1];
      jQuery(link).css('font-weight', 'bold');
    }, 1600);

  }
}

jQuery(document).ready(
    function()
    {
      // this is wrong, all styling should go in classes
      // so we are not using those anymore, they are here
      // only as a reminder
      imgUp = '#FDF3C4 url(' + CatPostAjax.nice_ajax_tree_img
          + 'arrowUp.png) no-repeat -4px 0px';
      imgDown = '#FDF3C4 url(' + CatPostAjax.nice_ajax_tree_img
          + 'arrowDown.png) no-repeat -4px 0px';
      imgLoad = 'url(' + CatPostAjax.nice_ajax_tree_img + 'snake.gif) no-repeat 0 0';

      // hover handlers. this is strictly styling logic so it probably belongs to
      // another script.
      // This is done using JS because IE supports hover css for links only
      // @todo separate styling code from core logic
      jQuery('div.nat-menu-li').hover(
          function()
          {
            var arrow = jQuery(this).find('span.arrow').first(); // find arrow span
            var coll = arrow.attr('class');
            if (coll.match(/collapse/)) { // if it is expanded
              arrow.addClass('img-up');   // show arrow up (direction to where it will collapse)
            } else {
              arrow.addClass('img-down'); // show arrow down
            }
            arrow.addClass('hover'); // either way add common hover class
            var a = jQuery('a', this); 
            a.addClass('hover');
          },
          function()
          {
            var arrow = jQuery(this).find('span.arrow').first();
            arrow.removeClass('hover img-down img-up');
            jQuery('a', this).removeClass('hover');
          });

      // define click handler for span arrow
      jQuery('div.nat-menu-li span').click(function(e, p)
      {
        var id = getCat(this);// get category
        if (isEmpty('div#submenu-' + id)) { // if menu is empty fetch content
          var button = jQuery(this);
          var url = CatPostAjax.ajaxurl + '?action=myajax-submit&category=' + id;// compose url
          button.addClass('snake'); // styling code
          jQuery('#submenu-' + id).load(url, function()
          {
            button.removeClass('snake'); // styling code
           // button.addClass('hover');  // we actually do not want hover style here, nor arrows
          });
          jQuery(this).toggleClass('collapse'); // then mark menu as opened
        } else {
          // we are toggling collapse class here again
          // because we need to properly set arrow direction after
          // collapse is on or off
          jQuery(this).toggleClass('collapse');
           if (jQuery(this).is('.collapse.hover')) { // execute following code only if we're hovering
            jQuery(this).addClass('img-up').removeClass('img-down');
           } else if(jQuery(this).is('.hover')){
            jQuery(this).addClass('img-down').removeClass('img-up');
           }
        }
        jQuery('#submenu-' + id).slideToggle(50); // opne/close menu item

      });
//      url2click(); // don't need this any more
    });

/**
 * Check if element has content
 * Checks if element has any other content besides white space.
 * We cannot use el.innerHTML.length with formatted html (with identations)
 * @param el
 * @returns {Boolean}
 */
function isEmpty(el)
{
  var html = jQuery.trim(jQuery(el).html());
  return html == '';
}

/**
 * Get category
 * Gets category ID from element class
 * @param el
 * @returns {String}
 */
function getCat(el)
{
  // line = el.getAttribute('class');
  line = el.className;
  category = (line.match(/cat-item-(\d*)/))[1];
  return category;
}

/**
 * Create a cookie with the given name and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain:
 *          'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to
 *       use the same path and domain used when the cookie was set.
 *
 * @param String
 *          name The name of the cookie.
 * @param String
 *          value The value of the cookie.
 * @param Object
 *          options An object literal containing key/value pairs to provide
 *          optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date
 *         from now on in days or a Date object. If a negative value is
 *         specified (e.g. a date in the past), the cookie will be deleted. If
 *         set to null or omitted, the cookie will be a session cookie and will
 *         not be retained when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default:
 *         path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie
 *         (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be
 *         set and the cookie transmission will require a secure protocol (like
 *         HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given name.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String
 *          name The name of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
function cookie(name, value, options)
{
  if (typeof value != 'undefined') { // name and value given, set cookie
    options = options || {};
    if (value === null) {
      value = '';
      options.expires = -1;
    }
    var expires = '';
    if (options.expires
        && (typeof options.expires == 'number' || options.expires.toUTCString)) {
      var date;
      if (typeof options.expires == 'number') {
        date = new Date();
        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      } else {
        date = options.expires;
      }
      expires = '; expires=' + date.toUTCString(); // use expires attribute,
                                                    // max-age is not supported
                                                    // by IE
    }
    // CAUTION: Needed to parenthesize options.path and options.domain
    // in the following expressions, otherwise they evaluate to undefined
    // in the packed version for some reason...
    var path = options.path ? '; path=' + (options.path) : '';
    var domain = options.domain ? '; domain=' + (options.domain) : '';
    var secure = options.secure ? '; secure' : '';
    document.cookie = [ name, '=', encodeURIComponent(value), expires, path, domain,
        secure ].join('');
  } else { // only name given, get cookie
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for ( var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
}
