<?php
/**
 * Plugin Name:     Always On
 * Version:         0.1.0
 *
 * @package         Always_On
 */

/**
 * Add a rewrite rule to for our JS file.
 */
function always_on_rewrites_init() {
  global $wp_rewrite;

  add_rewrite_rule(
    'sw.js',
    'index.php?serviceworker=true',
    'top'
  );

  // @TODO -- Remove this?
  $wp_rewrite->flush_rules(true);
}

/**
 * In order to get WordPress to let us use a custom template, we need a QSA.
 */
function always_on_register_query_var($vars) {
  $vars[] = 'serviceworker';
  return $vars;
}

/**
 * Hijack the template system to serve our JS file.
 */
function always_on_serviceworker_template_include($template) {
  global $wp_query;

  $page_value = $wp_query->query_vars['serviceworker'];

  if ($page_value && $page_value == 'true') {
    header('Content-Type: application/javascript');
    return plugin_dir_path(__FILE__) . 'js/sw.js';
  }

  return $template;
}

add_action('init', 'always_on_rewrites_init');
add_filter('query_vars', 'always_on_register_query_var');
add_filter('template_include', 'always_on_serviceworker_template_include');
wp_enqueue_script('always-on-sw', get_site_url() . '/sw.js');
