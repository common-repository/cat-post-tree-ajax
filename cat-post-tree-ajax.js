/*
 * In original js file there was url2click function used upon
 * document loading to find current category or post and
 * fetch relevant menu item content, and expand that menu item.
 * Since current category/post is expanded on the server
 * there is no more need for that functionality, and therefore
 * it has been removed.
 */
jQuery(document).ready(function()
{
  // define click handler for span arrow
  jQuery('div.nat-menu-li span').click(function()
  {
    var id = getCat(this); // get category
    var url = CatPostAjax.ajaxurl + '?action=myajax-submit&category=' + id; // compose url
    if (isEmpty('#submenu-' + id)) { // if menu is empty fetch content
      var button = jQuery(this);
      button.addClass('snake');
      jQuery('#submenu-' + id).load(url, function()
      {
        button.removeClass('snake');
      });
    }
    // then toggle menu state, so if clicked on expanded section
    // for example one expanded on server, then just close it and viceversa
    jQuery(this).toggleClass('collapse');
    jQuery('#submenu-' + id).slideToggle(50);

  });
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
  var line = el.className;
  var category = (line.match(/cat-item-(\d*)/))[1];
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
