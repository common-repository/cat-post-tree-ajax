<?php
/*
Plugin Name: Category-Post Ajax Tree
Plugin URI: http://zetaprints.com
Description: This plugin enables ajax'ed categories. ONLY one level.
Author: Sergei Karasiov
Version: 0.8
Author URI: http://www.zetaprints.com
*/

define('NICE_AJAX_TREE_URL', WP_PLUGIN_URL . '/cat-post-tree-ajax/');
define('NICE_AJAX_TREE_VERSION', '0.7');
/*
 * Init widget
 */
function nice_ajax_tree_init()
{
  /*
   * here we just init styles
   */
  $type = get_option('catpost_sample');
  if ($type == 'splitted') {
    $css = 'cat-post-tree-ajax.css';
  } elseif ($type == 'unsplitted') {
    $css = 'cat-post-tree-ajax-v2.css';
  } else {
    add_action('admin_notices', 'mustConfigure');
    return;
  }
  //'style.css','style-fixed.css'
  wp_enqueue_style("cat-post-tree-ajax", NICE_AJAX_TREE_URL . $css, array (), NICE_AJAX_TREE_VERSION, "screen");
}
/*
 * Init script options
 */
function nice_ajax_tree_scripts()
{
  global $post;
  /*
   * Choose correct styling
   */
  $type = get_option('catpost_sample');
  if ($type == 'splitted') {
    $js = 'cat-post-tree-ajax.js';
  } elseif ($type == 'unsplitted') {
    $js = 'cat-post-tree-ajax-v2.js';
  } else {
    add_action('admin_notices', 'mustConfigure');
    return;
  }
  /*
   * Findout if we are looking at category or post, this has to happen
   * just before render time, when all routes are parsed
   */
  $id = $type = null;
  if ($post && is_single($post->ID)) {
    $type = 'post'; // type can be post or cat
    $id = $post->ID; // id is always a number
    $post_cats = wp_get_post_categories($id); // post categories
    $postCatId = array_pop($post_cats); // could be more than one, so we just get first one
  }elseif (is_category()) {
    $id = get_query_var('cat'); // if it is category, find its ID and set type cat
    $type = 'cat';
  }

  /*
   * Add main script
   */
  wp_enqueue_script('cat-post-tree-ajax', NICE_AJAX_TREE_URL . $js, array ('jquery'));

  /*
   * Prepare some convinience data that we could use
   */
  $localize = array ('ajaxurl' => admin_url('admin-ajax.php'),
                    'nice_ajax_tree_img' => NICE_AJAX_TREE_URL . "img/",
                    'type' => $type,
                    'id' => $id
  );
  // if we got post category ID add it too
  if(isset($postCatId))
    $localize['cat'] = $postCatId;

  // add this data to WP stack
  wp_localize_script('cat-post-tree-ajax', 'CatPostAjax', $localize);
}

function mustConfigure()
{
  echo '<div class="updated" id="cat-post-tree-error"><p>You have installed Category Ajax Tree but haven\'t configure it yet.
  Please go to Settings > "Categories Ajax Tree" and choose option from drop down.</p></div>';
}

/*
 * add widget
 */
add_action('widgets_init', 'nice_ajax_load_widget');
/*
* It is better to add scripts at a bit later stage
* of WP cycle, this way we know a bit more about posts, categories etc.
*/
add_action('wp_print_scripts', 'nice_ajax_tree_scripts');
/*
 * init css
 */
add_action('init', 'nice_ajax_tree_init');
/*
 * add ajax callback
 */
add_action('wp_ajax_nopriv_myajax-submit', 'myajax_submit');
add_action('wp_ajax_myajax-submit', 'myajax_submit');
/*
 * Add admin options and config page
 */
add_action('admin_init', 'catpost_options_init');
add_action('admin_menu', 'catpost_options_add_page');

function nice_ajax_load_widget()
{
  register_widget('CatPostAjaxTree_Widget');
}

class CatPostAjaxTree_Widget extends WP_Widget
{

  function CatPostAjaxTree_Widget()
  {
    $widget_ops = array ('classname' => 'cat-post-ajax-tree',
                        'description' => __('This plugin enables ajax\'ed categories.', 'niceajaxtree')
    );

    $control_ops = array ('width' => 300, 'height' => 350,
                          'id_base' => 'niceajaxtree-widget'
    );

    $this->WP_Widget('niceajaxtree-widget', __('CatPostAjaxTree', 'niceajaxtree'), $widget_ops, $control_ops);
  }

  function widget($args, $instance)
  {
    global $post;
    extract($args);
    $currCatId = null;
    if ($post && is_single($post->ID)) { // find if we are looking at post or category
      $isPost = true;
      $post_cats = wp_get_post_categories($post->ID);
      $currCatId = array_pop($post_cats); // first post category
      $bold = true;
    }elseif (is_category()) {
      $isCat = true;
      $currCatId = get_query_var('cat'); // current category ID
      $bold = false;
    }
    $posts_args = array ('category' => $currCatId, // prepare query arguments to get all category posts
                        'numberposts' => -1, 'orderby' => 'title',
                        'order' => 'ASC'
    );
    $catPosts = get_posts($posts_args); // get matching category posts

    $title = apply_filters('widget_title', $instance['title']);
    $ul_or_ol = $instance['ul_or_ol'];

    echo $before_widget;

    if ($title) { // adding span with class for styling purposes
      echo $before_title . '<span class="widgettitle">' . $title . '</span>' . $after_title;
    }

    $args = array ('orderby' => 'name', 'order' => 'ASC');
    $categories = get_categories($args);
    foreach ($categories as $category) {
      $current = ($isPost || $isCat) && ($currCatId == $category->cat_ID); // are we looking at post or category and they match current itteration
      /*
       * switched from echo to inline html - in my opinion is easier to read and work with
       */
      ?>
<div class="nat-menu-li">
<h2 class="head"><a
	href="<?php echo get_category_link($category->term_id);?>"
	title="<?php echo sprintf(__("View all posts in %s"), $category->name);?>"><?php echo $category->name;?></a>
<span
	class="arrow cat-item-<?php echo $category->cat_ID;echo $current?' collapse':'';?>">&nbsp;</span>
</h2>
<div class="cat-post-ajax-tree-submenu" id="submenu-<?php echo $category->cat_ID;?>" style="<?php echo $current?'':'display:none;'?>">
<?php
if($current){
  $res = _makePostsHtml($catPosts, $bold); // if we are in current category, get posts html
  echo $res;
}
?>
</div>
</div>
<?php
    }
 echo $after_widget;
  }

  function update($new_instance, $old_instance)
  {
    $instance = $old_instance;
    $instance['title'] = strip_tags($new_instance['title']);
    $instance['ul_or_ol'] = $new_instance['ul_or_ol'];
    return $instance;
  }

  function form($instance)
  {
    $defaults = array (
      'title' => __('CatPostAjaxTree', 'niceajaxtree'),
      'ul_or_ol' => 'ul'
    );
    $instance = wp_parse_args((array) $instance, $defaults);
    ?>
<p><label for="<?php echo $this->get_field_id('title');?>"><?php _e('Title:', 'hybrid');?></label>
<input id="<?php echo $this->get_field_id('title');?>"
	name="<?php echo $this->get_field_name('title');?>"
	value="<?php echo $instance['title'];?>" style="width: 100%;" /></p>
<p><!-- This part is kind of pointless since no lists are used for the menu -->
<label for="<?php echo $this->get_field_id('ul_or_ol');?>"><?php _e('Type of list:', 'niceajaxtree');?></label>
<select id="<?php echo $this->get_field_id('ul_or_ol');?>"
	name="<?php echo $this->get_field_name('ul_or_ol');?>" class="widefat"
	style="width: 100%;">
	<option
		<?php if ('ul' == $instance['format']) echo 'selected="selected"';?>>UL</option>
	<option
		<?php if ('ol' == $instance['format']) echo 'selected="selected"';?>>OL</option>
</select></p>
<?php
  }
}

function myajax_submit()
{
  $catid = $_GET['category'];
  $postname = $_GET['post'];
  if (is_numeric($catid)) {
    header("Content-Type: text/html");
    $posts_args = array (
      'category' => $catid,
      'numberposts' => -1,
      'orderby' => 'title',
      'order' => 'ASC'
    );

    $posts = get_posts($posts_args);
    $res = _makePostsHtml($posts);
    $res .= "</div>";
    echo $res;
    exit();
  } elseif ($postname) {
    header("Content-type: text/html");
    //echo 'PID:'.$postname;
    global $wpdb;
    $q = "SELECT ID FROM " . $wpdb->posts;
    $q .= " WHERE post_name = '" . $postname . "'";
    $q .= " AND post_type='post'";

    $post = $wpdb->get_var($wpdb->prepare($q));
    $res = get_post($post, 'OBJECT');
    $cat = wp_get_post_categories($res->ID);
    echo $cat[0] . '-' . $res->ID;
    exit();
  } else {
    header("Content-type: text/html");
    echo 'no way';
    exit();
  }
}

/**
 * Get desired list of posts
 *
 * We are passing a list of posts
 * @param array $posts
 * @param boolean $makeBold should we make current post id bold (if it matches)
 * @return string
 */
function _makePostsHtml($posts = array(), $makeBold = true)
{
  global $post;
  $id = $post->ID; // current post id
  $res = '';
  if (!empty($posts)) {
    $res = "<ul>";
    foreach ($posts as $_post) { // cycle all posts
      $res .= "<li><a href='" . get_permalink($_post->ID) . "'";
      $res .= " class='di_" . $catid . "_" . $_post->ID . " postlink'>";
      if ($_post->ID == $id && $makeBold) { // if current post id and id match and makebold is true
        $res .= "<strong>"; // wrap it in strong tag
      }
      $res .= $_post->post_title;
      if ($_post->ID == $id && $makeBold) {
        $res .= "</strong>";
      }
      $res .= "</a></li>";
    }
    $res .= "</ul>";
  }
  return $res;
}

////options


function catpost_options_init()
{
  register_setting('catpost_options_options', 'catpost_sample'); //, 'catpost_options_validate' );
}

function catpost_options_add_page()
{
  add_options_page('catpostAjaxTreeOptions', 'Categories Ajax Tree', 'manage_options', 'catpost_options', 'catpost_options_do_page');
}

function catpost_options_do_page()
{
  /*
   * switched from echo to inline HTML
   */
  ?>
<div class="wrap">
<h2>Cat-post Options</h2>
<!-- it will be better to give something like theme names, splitted non splitted is irrelevant -->
<form method="post" action="options.php">
    <?php
    settings_fields('catpost_options_options');
    $option = get_option('catpost_sample');
    ?>
    <select name="catpost_sample">
	<option value="splitted"
		<?php echo $option == 'splitted'?'selected':'';?>>Splitted</option>
	<option value="unsplitted"
		<?php echo $option == 'unsplitted'?'selected':'';?>>Unsplitted</option>
</select> <input type="submit" value="Set Option" /></form>
</div>
<div class="cat-post-option-value"><?php echo ucfirst($option);?></div>
<?php
}

function catpost_options_validate($input)
{
  echo $input . "OLO";
  return $input;
}
